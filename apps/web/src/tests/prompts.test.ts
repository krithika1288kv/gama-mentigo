import { describe, expect, it } from "vitest";
import { buildTutorSystemPrompt, isLearnerLevel, LEVEL_GUIDANCE } from "@/lib/prompts/tutor";
import { buildCoachSystemPrompt } from "@/lib/prompts/coach";

describe("prompts", () => {
  it("maps learner levels into tutor system prompt", () => {
    const beginner = buildTutorSystemPrompt("Beginner", "- Prompt guide");
    const advanced = buildTutorSystemPrompt("Advanced", "- Prompt guide");

    expect(beginner).toContain("Learner level: Beginner");
    expect(beginner).toContain(LEVEL_GUIDANCE.Beginner);
    expect(advanced).toContain("Learner level: Advanced");
    expect(advanced).toContain(LEVEL_GUIDANCE.Advanced);
    expect(beginner).toContain("Prompt guide");
  });

  it("validates learner levels", () => {
    expect(isLearnerLevel("Beginner")).toBe(true);
    expect(isLearnerLevel("Expert")).toBe(false);
  });

  it("builds coach prompt with structured output rules and rubric", () => {
    const prompt = buildCoachSystemPrompt("code_snippet");
    expect(prompt).toContain("## What worked");
    expect(prompt).toContain("## What to improve");
    expect(prompt).toContain("## Suggested rewrite");
    expect(prompt).toContain("Readability");
    expect(prompt).toContain("DRAFT");
  });
});
