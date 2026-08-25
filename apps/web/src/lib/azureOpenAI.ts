import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { createRequestId, hashUserId, logLlmCall } from "./observability";

export class AzureOpenAIError extends Error {
  constructor(
    message: string,
    public readonly code: "rate_limit" | "config" | "unknown" | "empty",
    public readonly status?: number,
  ) {
    super(message);
    this.name = "AzureOpenAIError";
  }
}

export interface ChatCompletionInput {
  system: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  userId?: string;
  maxTokens?: number;
}

const DEFAULT_MAX_TOKENS = Number(process.env.MAX_TOKENS_PER_RESPONSE ?? "800");
const DEFAULT_ANTHROPIC_MODEL = "claude-haiku-4-5";
const DEFAULT_OPENROUTER_MODEL = "openai/gpt-4o-mini";
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

function cleanSecret(value: string | undefined): string {
  return (value ?? "").trim().replace(/^["']|["']$/g, "");
}

function getAnthropicApiKey(): string {
  return cleanSecret(process.env.ANTHROPIC_API_KEY);
}

function getAnthropicModel(): string {
  return (
    cleanSecret(process.env.ANTHROPIC_MODEL) || DEFAULT_ANTHROPIC_MODEL
  );
}

function getOpenRouterApiKey(): string {
  return cleanSecret(process.env.OPENROUTER_API_KEY);
}

function getOpenRouterModel(): string {
  return (
    cleanSecret(process.env.OPENROUTER_MODEL) || DEFAULT_OPENROUTER_MODEL
  );
}

function getAzureConfig() {
  return {
    endpoint: process.env.AZURE_OPENAI_ENDPOINT,
    apiKey: process.env.AZURE_OPENAI_API_KEY,
    deployment: process.env.AZURE_OPENAI_DEPLOYMENT,
    apiVersion: process.env.AZURE_OPENAI_API_VERSION ?? "2024-10-21",
  };
}

export function isOpenRouterConfigured(): boolean {
  return Boolean(getOpenRouterApiKey());
}

export function isAnthropicConfigured(): boolean {
  return Boolean(getAnthropicApiKey());
}

export function isAzureConfigured(): boolean {
  const { endpoint, apiKey, deployment } = getAzureConfig();
  return Boolean(endpoint && apiKey && deployment);
}

/** True when any live LLM provider is ready. */
export function isLlmConfigured(): boolean {
  return (
    isOpenRouterConfigured() ||
    isAnthropicConfigured() ||
    isAzureConfigured()
  );
}

export function getActiveLlmProvider():
  | "openrouter"
  | "anthropic"
  | "azure"
  | "demo" {
  if (isOpenRouterConfigured()) return "openrouter";
  if (isAnthropicConfigured()) return "anthropic";
  if (isAzureConfigured()) return "azure";
  return "demo";
}

function createAzureClient(): OpenAI {
  const { endpoint, apiKey, apiVersion, deployment } = getAzureConfig();
  if (!endpoint || !apiKey || !deployment) {
    throw new AzureOpenAIError(
      "Azure OpenAI is not configured. Set AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY, and AZURE_OPENAI_DEPLOYMENT.",
      "config",
    );
  }

  return new OpenAI({
    apiKey,
    baseURL: `${endpoint.replace(/\/$/, "")}/openai/deployments/${deployment}`,
    defaultQuery: { "api-version": apiVersion },
    defaultHeaders: { "api-key": apiKey },
  });
}

/**
 * Single gateway for all LLM chat calls.
 * Prefer OpenRouter, then Anthropic, then Azure OpenAI, else demo stream.
 * Never call provider SDKs from route handlers directly.
 */
export async function streamChatCompletion(
  input: ChatCompletionInput,
): Promise<ReadableStream<Uint8Array>> {
  const requestId = createRequestId();
  const userIdHash = hashUserId(input.userId ?? "anonymous");
  const started = Date.now();
  const maxTokens = input.maxTokens ?? DEFAULT_MAX_TOKENS;
  const encoder = new TextEncoder();

  if (isOpenRouterConfigured()) {
    return streamOpenRouter(input, requestId, userIdHash, started, maxTokens, encoder);
  }

  if (isAnthropicConfigured()) {
    return streamAnthropic(input, requestId, userIdHash, started, maxTokens, encoder);
  }

  if (isAzureConfigured()) {
    return streamAzure(input, requestId, userIdHash, started, maxTokens, encoder);
  }

  return mockStream(input, requestId, userIdHash, started, encoder);
}

async function streamOpenRouter(
  input: ChatCompletionInput,
  requestId: string,
  userIdHash: string,
  started: number,
  maxTokens: number,
  encoder: TextEncoder,
): Promise<ReadableStream<Uint8Array>> {
  const model = getOpenRouterModel();
  const client = new OpenAI({
    apiKey: getOpenRouterApiKey(),
    baseURL: OPENROUTER_BASE_URL,
    defaultHeaders: {
      "HTTP-Referer": process.env.OPENROUTER_SITE_URL ?? "http://localhost:3000",
      "X-Title": process.env.OPENROUTER_APP_NAME ?? "GAMA Mentigo",
    },
  });

  try {
    const stream = await client.chat.completions.create({
      model,
      max_tokens: maxTokens,
      stream: true,
      stream_options: { include_usage: true },
      messages: [{ role: "system", content: input.system }, ...input.messages],
    });

    let promptTokens: number | undefined;
    let completionTokens: number | undefined;

    return new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content;
            if (delta) controller.enqueue(encoder.encode(delta));
            if (chunk.usage) {
              promptTokens = chunk.usage.prompt_tokens;
              completionTokens = chunk.usage.completion_tokens;
            }
          }
          logLlmCall({
            requestId,
            userIdHash,
            model: `openrouter:${model}`,
            latencyMs: Date.now() - started,
            promptTokens,
            completionTokens,
          });
          controller.close();
        } catch (err) {
          const mapped = mapError(err, "openrouter");
          console.error("[llm] openrouter stream error", mapped.message);
          logLlmCall({
            requestId,
            userIdHash,
            model: `openrouter:${model}`,
            latencyMs: Date.now() - started,
            errorState: mapped.code,
          });
          controller.error(mapped);
        }
      },
    });
  } catch (err) {
    const mapped = mapError(err, "openrouter");
    console.error("[llm] openrouter request error", mapped.message);
    logLlmCall({
      requestId,
      userIdHash,
      model: `openrouter:${model}`,
      latencyMs: Date.now() - started,
      errorState: mapped.code,
    });
    throw mapped;
  }
}

async function streamAnthropic(
  input: ChatCompletionInput,
  requestId: string,
  userIdHash: string,
  started: number,
  maxTokens: number,
  encoder: TextEncoder,
): Promise<ReadableStream<Uint8Array>> {
  const model = getAnthropicModel();
  const apiKey = getAnthropicApiKey();
  const client = new Anthropic({ apiKey });

  try {
    // Await create so auth/model errors throw BEFORE we return a Response.
    const stream = await client.messages.create({
      model,
      max_tokens: maxTokens,
      system: input.system,
      messages: input.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      stream: true,
    });

    return new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          let completionTokens = 0;
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
            if (event.type === "message_delta" && event.usage) {
              completionTokens = event.usage.output_tokens ?? completionTokens;
            }
          }
          logLlmCall({
            requestId,
            userIdHash,
            model,
            latencyMs: Date.now() - started,
            completionTokens,
          });
          controller.close();
        } catch (err) {
          const mapped = mapError(err, "anthropic");
          console.error("[llm] anthropic stream error", mapped.message);
          logLlmCall({
            requestId,
            userIdHash,
            model,
            latencyMs: Date.now() - started,
            errorState: mapped.code,
          });
          controller.error(mapped);
        }
      },
    });
  } catch (err) {
    const mapped = mapError(err, "anthropic");
    console.error("[llm] anthropic request error", mapped.message);
    logLlmCall({
      requestId,
      userIdHash,
      model,
      latencyMs: Date.now() - started,
      errorState: mapped.code,
    });
    throw mapped;
  }
}

async function streamAzure(
  input: ChatCompletionInput,
  requestId: string,
  userIdHash: string,
  started: number,
  maxTokens: number,
  encoder: TextEncoder,
): Promise<ReadableStream<Uint8Array>> {
  const { deployment } = getAzureConfig();
  const client = createAzureClient();

  try {
    const stream = await client.chat.completions.create({
      model: deployment!,
      max_tokens: maxTokens,
      stream: true,
      stream_options: { include_usage: true },
      messages: [{ role: "system", content: input.system }, ...input.messages],
    });

    let promptTokens: number | undefined;
    let completionTokens: number | undefined;

    return new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content;
            if (delta) controller.enqueue(encoder.encode(delta));
            if (chunk.usage) {
              promptTokens = chunk.usage.prompt_tokens;
              completionTokens = chunk.usage.completion_tokens;
            }
          }
          logLlmCall({
            requestId,
            userIdHash,
            model: deployment!,
            latencyMs: Date.now() - started,
            promptTokens,
            completionTokens,
          });
          controller.close();
        } catch (err) {
          const mapped = mapError(err, "azure");
          logLlmCall({
            requestId,
            userIdHash,
            model: deployment ?? "unknown",
            latencyMs: Date.now() - started,
            errorState: mapped.code,
          });
          controller.error(mapped);
        }
      },
    });
  } catch (err) {
    const mapped = mapError(err, "azure");
    logLlmCall({
      requestId,
      userIdHash,
      model: deployment ?? "unknown",
      latencyMs: Date.now() - started,
      errorState: mapped.code,
    });
    throw mapped;
  }
}

function mockStream(
  input: ChatCompletionInput,
  requestId: string,
  userIdHash: string,
  started: number,
  encoder: TextEncoder,
): ReadableStream<Uint8Array> {
  const lastUser = [...input.messages].reverse().find((m) => m.role === "user");
  const text = buildDemoReply(input.system, lastUser?.content ?? "");

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      for (const word of text.split(/(\s+)/)) {
        controller.enqueue(encoder.encode(word));
        await new Promise((r) => setTimeout(r, 8));
      }
      logLlmCall({
        requestId,
        userIdHash,
        model: "mock-demo",
        latencyMs: Date.now() - started,
        promptTokens: 0,
        completionTokens: text.split(/\s+/).length,
      });
      controller.close();
    },
  });
}

function buildDemoReply(system: string, userText: string): string {
  const isCoach = system.includes("Coach Agent");
  const topic = userText.trim() || "your question";
  const lower = topic.toLowerCase();

  if (isCoach) {
    return [
      "[Demo mode — not live AI]",
      "",
      "## What worked",
      `You shared a concrete artifact to review ("${topic.slice(0, 80)}${topic.length > 80 ? "…" : ""}"), which gives the Coach something specific to improve.`,
      "",
      "## What to improve",
      "Add clearer goal, audience, and success criteria so the output is easier to judge.",
      "",
      "## Suggested rewrite",
      `Goal: improve the artifact above.\nAudience: a busy teammate.\nConstraints: keep it concise and actionable.\nDraft:\n${topic.slice(0, 400)}`,
      "",
      "Add OPENROUTER_API_KEY in apps/web/.env.local and restart for live coaching.",
    ].join("\n");
  }

  let explanation =
    "I can give only a short practice reply in demo mode. Once OpenRouter is connected, answers will change for each question.";

  if (lower.includes("token")) {
    explanation =
      "A token is a small chunk of text (often part of a word) that an AI model reads and writes one step at a time. More tokens usually means higher cost and longer context.";
  } else if (lower.includes("prompt")) {
    explanation =
      "A prompt is the instruction you give an AI. Clear goal + context + format usually produces better results than a vague one-liner.";
  } else if (lower.includes("llm") || lower.includes("large language")) {
    explanation =
      "An LLM (large language model) predicts the next token based on patterns learned from lots of text. It can sound smart, but it can also be wrong.";
  } else if (lower.includes("rag")) {
    explanation =
      "RAG (retrieval-augmented generation) means: look up relevant documents first, then ask the model to answer using those documents.";
  } else {
    explanation = `About "${topic.slice(0, 120)}${topic.length > 120 ? "…" : ""}": in demo mode I only return a short placeholder. Connect OpenRouter to get a real answer tailored to this question.`;
  }

  return [
    "[Demo mode — not live AI]",
    "",
    explanation,
    "",
    "Want to try explaining that back in your own words?",
    "",
    "To get live answers: set OPENROUTER_API_KEY in apps/web/.env.local, save, restart the app, then hard-refresh.",
  ].join("\n");
}

function mapError(
  err: unknown,
  provider: "openrouter" | "anthropic" | "azure" = "anthropic",
): AzureOpenAIError {
  if (err instanceof AzureOpenAIError) return err;

  const status =
    typeof err === "object" && err !== null
      ? Number(
          ("status" in err && (err as { status?: number }).status) ||
            ("statusCode" in err && (err as { statusCode?: number }).statusCode) ||
            undefined,
        )
      : undefined;

  const message =
    typeof err === "object" &&
    err !== null &&
    "message" in err &&
    typeof (err as { message?: unknown }).message === "string"
      ? (err as { message: string }).message
      : "Something went wrong talking to the AI service.";

  const providerLabel =
    provider === "openrouter"
      ? "OpenRouter"
      : provider === "azure"
        ? "Azure OpenAI"
        : "Anthropic";

  const keyVar =
    provider === "openrouter"
      ? "OPENROUTER_API_KEY"
      : provider === "azure"
        ? "AZURE_OPENAI_API_KEY"
        : "ANTHROPIC_API_KEY";

  if (status === 401 || status === 403) {
    return new AzureOpenAIError(
      `${providerLabel} rejected the API key. Open apps/web/.env.local and check ${keyVar}, then restart the app.`,
      "config",
      status,
    );
  }

  if (status === 404 || /model/i.test(message)) {
    const modelHint =
      provider === "openrouter"
        ? "OPENROUTER_MODEL=openai/gpt-4o-mini"
        : provider === "azure"
          ? "AZURE_OPENAI_DEPLOYMENT"
          : "ANTHROPIC_MODEL=claude-haiku-4-5";
    return new AzureOpenAIError(
      `The ${providerLabel} model name is invalid. In apps/web/.env.local set ${modelHint} and restart.`,
      "config",
      status,
    );
  }

  if (status === 429) {
    return new AzureOpenAIError(
      `The AI service is busy or your ${providerLabel} usage limit was hit. Wait a moment and retry.`,
      "rate_limit",
      429,
    );
  }

  if (/credit|billing|purchase|quota|insufficient/i.test(message)) {
    return new AzureOpenAIError(
      `${providerLabel} billing/credits issue. Add credit in the ${providerLabel} console, then retry.`,
      "config",
      status,
    );
  }

  return new AzureOpenAIError(message, "unknown", Number.isFinite(status) ? status : undefined);
}
