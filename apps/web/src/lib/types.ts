export type LearnerLevel = "Beginner" | "Intermediate" | "Advanced";

export type ArtifactType = "ai_prompt" | "written_content" | "code_snippet";

export type ChatRole = "system" | "user" | "assistant";

export interface ChatMessage {
  role: Exclude<ChatRole, "system">;
  content: string;
}

export interface ContentResource {
  id: string;
  title: string;
  url: string;
  topics: string[];
  summary: string;
}

export interface RubricCriterion {
  id: string;
  label: string;
  description: string;
}

export interface CoachFeedback {
  whatWorked: string;
  whatToImprove: string;
  suggestedRewrite: string;
  relatedGuides?: ContentResource[];
}

export interface LlmCallMeta {
  requestId: string;
  userIdHash: string;
  model: string;
  latencyMs: number;
  promptTokens?: number;
  completionTokens?: number;
  errorState?: string;
}
