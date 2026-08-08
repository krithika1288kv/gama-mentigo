import { getServerSession } from "next-auth";
import { authOptions, isAuthBypassEnabled } from "@/lib/auth";
import { AzureOpenAIError, streamChatCompletion } from "@/lib/azureOpenAI";
import { findContentForQuery } from "@/lib/contentIndex";
import { buildTutorSystemPrompt } from "@/lib/prompts/tutor";
import { parseTutorRequest } from "@/lib/validation";

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

  const parsed = parseTutorRequest(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const code = issue?.message === "empty" ? "empty" : "validation_error";
    return Response.json({ error: code }, { status: 400 });
  }

  const { message, level, history } = parsed.data;
  const resources = findContentForQuery(message);
  const contentHints = resources
    .map((r) => `- ${r.title}: ${r.url} (${r.summary})`)
    .join("\n");

  const system = buildTutorSystemPrompt(level, contentHints);

  try {
    const stream = await streamChatCompletion({
      system,
      messages: [...history, { role: "user", content: message }],
      userId: session?.user?.email ?? "anonymous",
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("[api/tutor]", err);
    if (err instanceof AzureOpenAIError) {
      const status = err.code === "rate_limit" ? 429 : err.code === "config" ? 400 : 502;
      return Response.json({ error: err.code, message: err.message }, { status });
    }
    return Response.json(
      { error: "unknown", message: "The Tutor is temporarily unavailable. Please try again." },
      { status: 500 },
    );
  }
}
