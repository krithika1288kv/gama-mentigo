import { z } from "zod";
import { isLearnerLevel } from "./prompts/tutor";
import { isArtifactType } from "./rubric";

export const tutorRequestSchema = z.object({
  message: z.string().trim().min(1, "empty"),
  level: z.string().refine(isLearnerLevel, "invalid_level"),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      }),
    )
    .max(40)
    .default([]),
});

export const coachRequestSchema = z.object({
  artifact: z.string().trim().min(1, "empty"),
  artifactType: z.string().refine(isArtifactType, "invalid_artifact_type"),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      }),
    )
    .max(40)
    .default([]),
  followUp: z.string().trim().optional(),
});

export type TutorRequest = z.infer<typeof tutorRequestSchema>;
export type CoachRequest = z.infer<typeof coachRequestSchema>;

export function parseTutorRequest(body: unknown) {
  return tutorRequestSchema.safeParse(body);
}

export function parseCoachRequest(body: unknown) {
  return coachRequestSchema.safeParse(body);
}
