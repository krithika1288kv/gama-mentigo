import {
  isAnthropicConfigured,
  isAzureConfigured,
  isLlmConfigured,
} from "@/lib/azureOpenAI";

export const runtime = "nodejs";

export async function GET() {
  const provider = isAnthropicConfigured()
    ? "anthropic"
    : isAzureConfigured()
      ? "azure"
      : "demo";

  return Response.json({
    llmConfigured: isLlmConfigured(),
    provider,
    product: "GAMA Mentigo — AI Factory Learning Suite",
  });
}
