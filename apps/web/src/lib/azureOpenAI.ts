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

function getConfig() {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION ?? "2024-10-21";

  return { endpoint, apiKey, deployment, apiVersion };
}

export function isAzureConfigured(): boolean {
  const { endpoint, apiKey, deployment } = getConfig();
  return Boolean(endpoint && apiKey && deployment);
}

function createClient(): OpenAI {
  const { endpoint, apiKey, apiVersion } = getConfig();
  if (!endpoint || !apiKey) {
    throw new AzureOpenAIError(
      "Azure OpenAI is not configured. Set AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_API_KEY.",
      "config",
    );
  }

  return new OpenAI({
    apiKey,
    baseURL: `${endpoint.replace(/\/$/, "")}/openai/deployments/${getConfig().deployment}`,
    defaultQuery: { "api-version": apiVersion },
    defaultHeaders: { "api-key": apiKey },
  });
}

const DEFAULT_MAX_TOKENS = Number(process.env.MAX_TOKENS_PER_RESPONSE ?? "800");

/**
 * Single gateway for all Azure OpenAI chat calls.
 * Never call the SDK from route handlers directly.
 */
export async function streamChatCompletion(
  input: ChatCompletionInput,
): Promise<ReadableStream<Uint8Array>> {
  const requestId = createRequestId();
  const userIdHash = hashUserId(input.userId ?? "anonymous");
  const started = Date.now();
  const maxTokens = input.maxTokens ?? DEFAULT_MAX_TOKENS;
  const encoder = new TextEncoder();

  if (!isAzureConfigured()) {
    return mockStream(input, requestId, userIdHash, started, encoder);
  }

  const { deployment } = getConfig();
  const client = createClient();

  try {
    const stream = await client.chat.completions.create({
      model: deployment!,
      max_tokens: maxTokens,
      stream: true,
      stream_options: { include_usage: true },
      messages: [
        { role: "system", content: input.system },
        ...input.messages,
      ],
    });

    let promptTokens: number | undefined;
    let completionTokens: number | undefined;

    return new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content;
            if (delta) {
              controller.enqueue(encoder.encode(delta));
            }
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

/** Offline-friendly demo replies when Azure OpenAI is not configured. */
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
      ? Number((err as { status: number }).status)
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
