import { getServerSession } from "next-auth";
import { authOptions, isAuthBypassEnabled } from "@/lib/auth";
import { AzureOpenAIError, streamChatCompletion } from "@/lib/azureOpenAI";
import { findContentForQuery } from "@/lib/contentIndex";
import { buildCoachSystemPrompt } from "@/lib/prompts/coach";
import { parseCoachRequest } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session && !isAuthBypassEnabled()) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = parseCoachRequest(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const code = issue?.message === "empty" ? "empty" : "validation_error";
    return Response.json({ error: code }, { status: 400 });
  }

  const { artifact, artifactType, history, followUp } = parsed.data;
  const system = buildCoachSystemPrompt(artifactType);
  const guides = findContentForQuery(artifact);
  const guideHint =
    guides.length > 0
      ? `\n\nIf a gap maps to these guides, mention them:\n${guides
          .map((g) => `- ${g.title}: ${g.url}`)
          .join("\n")}`
      : "";

  const userContent = followUp
    ? `Follow-up question about the previous feedback:\n${followUp}`
    : `Artifact type: ${artifactType}\n\nSubmission:\n${artifact}${guideHint}`;

  try {
    const stream = await streamChatCompletion({
      system,
      messages: [...history, { role: "user", content: userContent }],
      userId: session?.user?.email ?? "anonymous",
      maxTokens: Number(process.env.MAX_TOKENS_PER_RESPONSE ?? "1200"),
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("[api/coach]", err);
    if (err instanceof AzureOpenAIError) {
      const status = err.code === "rate_limit" ? 429 : err.code === "config" ? 400 : 502;
      return Response.json({ error: err.code, message: err.message }, { status });
    }
    return Response.json(
      { error: "unknown", message: "The Coach is temporarily unavailable. Please try again." },
      { status: 500 },
    );
  }
}
