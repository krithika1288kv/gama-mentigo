import type { ArtifactType, RubricCriterion } from "./types";

/**
 * DRAFT — needs stakeholder review before production (Section 3 / 8).
 * Starter criteria only; not authoritative UST best-practice policy.
 */
export const RUBRIC_STATUS = "DRAFT — needs review" as const;

const RUBRICS: Record<ArtifactType, RubricCriterion[]> = {
  ai_prompt: [
    {
      id: "clarity",
      label: "Clarity of goal",
      description: "States the desired outcome and audience clearly.",
    },
    {
      id: "context",
      label: "Sufficient context",
      description: "Provides role, constraints, and relevant background.",
    },
    {
      id: "format",
      label: "Output format",
      description: "Specifies structure, length, and success criteria.",
    },
    {
      id: "safety",
      label: "Safety & boundaries",
      description: "Avoids leaking secrets; sets appropriate guardrails.",
    },
  ],
  written_content: [
    {
      id: "audience",
      label: "Audience fit",
      description: "Tone and depth match the intended readers.",
    },
    {
      id: "structure",
      label: "Structure",
      description: "Logical flow with clear opening and takeaway.",
    },
    {
      id: "specificity",
      label: "Specificity",
      description: "Concrete examples over vague claims.",
    },
    {
      id: "actionability",
      label: "Actionability",
      description: "Reader knows what to do next.",
    },
  ],
  code_snippet: [
    {
      id: "correctness",
      label: "Correctness intent",
      description: "Logic appears sound for the stated goal.",
    },
    {
      id: "readability",
      label: "Readability",
      description: "Names, structure, and comments aid understanding.",
    },
    {
      id: "safety",
      label: "Safety",
      description: "No obvious injection, secret hardcoding, or unsafe defaults.",
    },
    {
      id: "testability",
      label: "Testability",
      description: "Can be verified with a clear example or test.",
    },
  ],
};

export function getRubric(artifactType: ArtifactType): RubricCriterion[] {
  return [...RUBRICS[artifactType]];
}

export function formatRubricForPrompt(artifactType: ArtifactType): string {
  return getRubric(artifactType)
    .map((c, i) => `${i + 1}. ${c.label}: ${c.description}`)
    .join("\n");
}

export function isArtifactType(value: string): value is ArtifactType {
  return value === "ai_prompt" || value === "written_content" || value === "code_snippet";
}
