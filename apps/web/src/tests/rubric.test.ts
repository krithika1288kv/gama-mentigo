import { describe, expect, it } from "vitest";
import { formatRubricForPrompt, getRubric, isArtifactType, RUBRIC_STATUS } from "@/lib/rubric";

describe("rubric", () => {
  it("is flagged as draft pending review", () => {
    expect(RUBRIC_STATUS).toContain("DRAFT");
  });

  it("returns criteria for each artifact type", () => {
    expect(getRubric("ai_prompt").length).toBeGreaterThan(0);
    expect(getRubric("written_content").length).toBeGreaterThan(0);
    expect(getRubric("code_snippet").length).toBeGreaterThan(0);
  });

  it("formats rubric text for prompts", () => {
    const text = formatRubricForPrompt("ai_prompt");
    expect(text).toContain("Clarity of goal");
    expect(text).toContain("1.");
  });

  it("validates artifact type values", () => {
    expect(isArtifactType("ai_prompt")).toBe(true);
    expect(isArtifactType("poem")).toBe(false);
  });
});
