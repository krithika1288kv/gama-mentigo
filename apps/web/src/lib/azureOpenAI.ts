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
const DEFAULT_ANTHROPIC_MODEL =
  process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5-20251001";

function getAzureConfig() {
  return {
    endpoint: process.env.AZURE_OPENAI_ENDPOINT,
    apiKey: process.env.AZURE_OPENAI_API_KEY,
    deployment: process.env.AZURE_OPENAI_DEPLOYMENT,
    apiVersion: process.env.AZURE_OPENAI_API_VERSION ?? "2024-10-21",
  };
}

export function isAnthropicConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY?.trim());
}

export function isAzureConfigured(): boolean {
  const { endpoint, apiKey, deployment } = getAzureConfig();
  return Boolean(endpoint && apiKey && deployment);
}

/** True when any live LLM provider is ready (Anthropic or Azure). */
export function isLlmConfigured(): boolean {
  return isAnthropicConfigured() || isAzureConfigured();
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
 * Prefer Anthropic when configured; else Azure OpenAI; else demo stream.
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

  if (isAnthropicConfigured()) {
    return streamAnthropic(input, requestId, userIdHash, started, maxTokens, encoder);
  }

  if (isAzureConfigured()) {
    return streamAzure(input, requestId, userIdHash, started, maxTokens, encoder);
  }

  return mockStream(input, requestId, userIdHash, started, encoder);
}

async function streamAnthropic(
  input: ChatCompletionInput,
  requestId: string,
  userIdHash: string,
  started: number,
  maxTokens: number,
  encoder: TextEncoder,
): Promise<ReadableStream<Uint8Array>> {
  const model = DEFAULT_ANTHROPIC_MODEL;
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  try {
    const stream = client.messages.stream({
      model,
      max_tokens: maxTokens,
      system: input.system,
      messages: input.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    return new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }

          const final = await stream.finalMessage();
          logLlmCall({
            requestId,
            userIdHash,
            model,
            latencyMs: Date.now() - started,
            promptTokens: final.usage?.input_tokens,
            completionTokens: final.usage?.output_tokens,
          });
          controller.close();
        } catch (err) {
          const mapped = mapError(err);
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
    const mapped = mapError(err);
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
          const mapped = mapError(err);
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
    const mapped = mapError(err);
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

  if (isCoach) {
    return [
      "## What worked",
      `You shared a concrete artifact to review ("${topic.slice(0, 80)}${topic.length > 80 ? "…" : ""}"), which gives the Coach something specific to improve.`,
      "",
      "## What to improve",
      "Add clearer goal, audience, and success criteria so the output is easier to judge.",
      "",
      "## Suggested rewrite",
      `Goal: improve the artifact above.\nAudience: a busy teammate.\nConstraints: keep it concise and actionable.\nDraft:\n${topic.slice(0, 400)}`,
      "",
      "Want me to tighten this further for a beginner audience?",
    ].join("\n");
  }

  return [
    `A helpful way to think about "${topic.slice(0, 100)}${topic.length > 100 ? "…" : ""}":`,
    "",
    "In AI, we break ideas into smaller pieces the model can work with. For example, a token is a chunk of text (often part of a word) that the model reads and writes one step at a time.",
    "",
    "Want to try explaining that back in your own words?",
  ].join("\n");
}

function mapError(err: unknown): AzureOpenAIError {
  if (err instanceof AzureOpenAIError) return err;

  const status =
    typeof err === "object" && err !== null && "status" in err
      ? Number((err as { status?: number }).status)
      : undefined;

  if (status === 429) {
    return new AzureOpenAIError(
      "The AI service is busy. Please wait a moment and retry.",
      "rate_limit",
      429,
    );
  }

  return new AzureOpenAIError(
    "Something went wrong talking to the AI service.",
    "unknown",
    status,
  );
}
