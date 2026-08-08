import { isAzureConfigured } from "@/lib/azureOpenAI";

export const runtime = "nodejs";

export async function GET() {
  return Response.json({
    llmConfigured: isAzureConfigured(),
    product: "GAMA Mentigo",
  });
}
