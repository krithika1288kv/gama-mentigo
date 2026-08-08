import { describe, expect, it } from "vitest";
import { isAnthropicConfigured, isLlmConfigured } from "@/lib/azureOpenAI";

describe("llm provider config", () => {
  it("detects Anthropic when API key is present", () => {
    const previous = process.env.ANTHROPIC_API_KEY;
    process.env.ANTHROPIC_API_KEY = "sk-ant-test";
    expect(isAnthropicConfigured()).toBe(true);
    expect(isLlmConfigured()).toBe(true);
    process.env.ANTHROPIC_API_KEY = previous;
  });

  it("reports not configured when Anthropic key is blank", () => {
    const previous = process.env.ANTHROPIC_API_KEY;
    const previousAzureKey = process.env.AZURE_OPENAI_API_KEY;
    const previousEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const previousDeployment = process.env.AZURE_OPENAI_DEPLOYMENT;

    process.env.ANTHROPIC_API_KEY = "";
    delete process.env.AZURE_OPENAI_API_KEY;
    delete process.env.AZURE_OPENAI_ENDPOINT;
    delete process.env.AZURE_OPENAI_DEPLOYMENT;

    expect(isAnthropicConfigured()).toBe(false);
    expect(isLlmConfigured()).toBe(false);

    process.env.ANTHROPIC_API_KEY = previous;
    process.env.AZURE_OPENAI_API_KEY = previousAzureKey;
    process.env.AZURE_OPENAI_ENDPOINT = previousEndpoint;
    process.env.AZURE_OPENAI_DEPLOYMENT = previousDeployment;
  });
});
