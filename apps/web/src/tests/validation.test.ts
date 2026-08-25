import { describe, expect, it } from "vitest";
import { parseCoachRequest, parseTutorRequest } from "@/lib/validation";

describe("validation", () => {
  it("rejects empty tutor messages", () => {
    const result = parseTutorRequest({ message: "  ", level: "Beginner" });
    expect(result.success).toBe(false);
  });

  it("accepts valid tutor payloads", () => {
    const result = parseTutorRequest({
      message: "What is an LLM?",
      level: "Intermediate",
      history: [],
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid tutor levels", () => {
    const result = parseTutorRequest({ message: "hi", level: "Guru" });
    expect(result.success).toBe(false);
  });

  it("rejects empty coach artifacts", () => {
    const result = parseCoachRequest({
      artifact: "",
      artifactType: "ai_prompt",
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid coach payloads", () => {
    const result = parseCoachRequest({
      artifact: "Write a summary of X",
      artifactType: "ai_prompt",
    });
    expect(result.success).toBe(true);
  });
});
