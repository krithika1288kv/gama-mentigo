import { createHash, randomUUID } from "crypto";
import type { LlmCallMeta } from "./types";

/** Hash user identifiers before logging (NFR: no raw PII in logs). */
export function hashUserId(userId: string): string {
  return createHash("sha256").update(userId).digest("hex").slice(0, 16);
}

export function createRequestId(): string {
  return randomUUID();
}

export function logLlmCall(meta: LlmCallMeta): void {
  // Structured JSON log — compatible with OpenTelemetry/Dynatrace ingestion later.
  console.info(
    JSON.stringify({
      type: "llm_call",
      ...meta,
      ts: new Date().toISOString(),
    }),
  );

  const softDailyBudget = Number(process.env.SOFT_DAILY_TOKEN_BUDGET ?? "0");
  const used = (meta.promptTokens ?? 0) + (meta.completionTokens ?? 0);
  if (softDailyBudget > 0 && used > softDailyBudget) {
    console.warn(
      JSON.stringify({
        type: "soft_daily_budget_alert",
        requestId: meta.requestId,
        used,
        softDailyBudget,
        ts: new Date().toISOString(),
      }),
    );
  }
}
