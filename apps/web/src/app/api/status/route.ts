import { getActiveLlmProvider, isLlmConfigured } from "@/lib/azureOpenAI";

export const runtime = "nodejs";

export async function GET() {
  return Response.json({
    llmConfigured: isLlmConfigured(),
    provider: getActiveLlmProvider(),
    product: "GAMA Mentigo — AI Factory Learning Suite",
  });
}
