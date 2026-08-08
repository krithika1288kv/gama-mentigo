import { isLlmConfigured } from "@/lib/azureOpenAI";

export const runtime = "nodejs";

export async function GET() {
  return Response.json({
    llmConfigured: isLlmConfigured(),
    product: "GAMA Mentigo",
  });
}
