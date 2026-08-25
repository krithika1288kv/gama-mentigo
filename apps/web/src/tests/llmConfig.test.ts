import { describe, expect, it } from "vitest";
import {
  getActiveLlmProvider,
  isAnthropicConfigured,
  isLlmConfigured,
  isOpenRouterConfigured,
} from "@/lib/azureOpenAI";

describe("llm provider config", () => {
  it("prefers OpenRouter when configured", () => {
    const previousOpenRouter = process.env.OPENROUTER_API_KEY;
    const previousAnthropic = process.env.ANTHROPIC_API_KEY;

    process.env.OPENROUTER_API_KEY = "sk-or-v1-test";
    process.env.ANTHROPIC_API_KEY = "sk-ant-test";

    expect(isOpenRouterConfigured()).toBe(true);
    expect(isLlmConfigured()).toBe(true);
    expect(getActiveLlmProvider()).toBe("openrouter");

    process.env.OPENROUTER_API_KEY = previousOpenRouter;
    process.env.ANTHROPIC_API_KEY = previousAnthropic;
  });

  it("detects Anthropic when API key is present", () => {
    const previousOpenRouter = process.env.OPENROUTER_API_KEY;
    const previous = process.env.ANTHROPIC_API_KEY;
    delete process.env.OPENROUTER_API_KEY;
    process.env.ANTHROPIC_API_KEY = "sk-ant-test";
    expect(isAnthropicConfigured()).toBe(true);
    expect(isLlmConfigured()).toBe(true);
    expect(getActiveLlmProvider()).toBe("anthropic");
    process.env.ANTHROPIC_API_KEY = previous;
    process.env.OPENROUTER_API_KEY = previousOpenRouter;
  });

  it("reports not configured when all provider keys are blank", () => {
    const previousOpenRouter = process.env.OPENROUTER_API_KEY;
    const previous = process.env.ANTHROPIC_API_KEY;
    const previousAzureKey = process.env.AZURE_OPENAI_API_KEY;
    const previousEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const previousDeployment = process.env.AZURE_OPENAI_DEPLOYMENT;

    process.env.OPENROUTER_API_KEY = "";
    process.env.ANTHROPIC_API_KEY = "";
    delete process.env.AZURE_OPENAI_API_KEY;
    delete process.env.AZURE_OPENAI_ENDPOINT;
    delete process.env.AZURE_OPENAI_DEPLOYMENT;

    expect(isOpenRouterConfigured()).toBe(false);
    expect(isAnthropicConfigured()).toBe(false);
    expect(isLlmConfigured()).toBe(false);
    expect(getActiveLlmProvider()).toBe("demo");

    process.env.OPENROUTER_API_KEY = previousOpenRouter;
    process.env.ANTHROPIC_API_KEY = previous;
    process.env.AZURE_OPENAI_API_KEY = previousAzureKey;
    process.env.AZURE_OPENAI_ENDPOINT = previousEndpoint;
    process.env.AZURE_OPENAI_DEPLOYMENT = previousDeployment;
  });
});
