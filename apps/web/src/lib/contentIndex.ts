import type { ContentResource } from "./types";

/**
 * Static content index for Tutor routing (and Coach gap guides).
 * Swap for LMS/API lookup later without changing call sites.
 */
const RESOURCES: ContentResource[] = [
  {
    id: "genai-fundamentals",
    title: "Generative AI fundamentals",
    url: "https://learn.microsoft.com/en-us/ai/",
    topics: ["generative ai", "llm", "fundamentals", "basics"],
    summary: "Foundational overview of generative AI and large language models.",
  },
  {
    id: "prompt-engineering",
    title: "Prompt engineering best practices",
    url: "https://platform.openai.com/docs/guides/prompt-engineering",
    topics: ["prompt", "prompt engineering", "prompts", "instructions"],
    summary: "Patterns for clear, reliable prompts.",
  },
  {
    id: "responsible-ai",
    title: "Responsible AI principles",
    url: "https://www.microsoft.com/en-us/ai/responsible-ai",
    topics: ["responsible ai", "ethics", "safety", "bias", "fairness"],
    summary: "Guidance on fairness, transparency, and safe AI use.",
  },
  {
    id: "cursor-usage",
    title: "Working effectively with Cursor",
    url: "https://docs.cursor.com",
    topics: ["cursor", "ide", "ai coding", "pair programming"],
    summary: "How to use Cursor for productive AI-assisted development.",
  },
  {
    id: "code-review-ai",
    title: "Reviewing AI-generated code",
    url: "https://owasp.org/www-project-top-10-for-large-language-model-applications/",
    topics: ["code", "code review", "security", "llm code"],
    summary: "Risks and review habits for AI-assisted code.",
  },
];

function normalize(text: string): string {
  return text.trim().toLowerCase();
}

/** Find resources whose topics appear in the query text. */
export function findContentForQuery(query: string): ContentResource[] {
  const q = normalize(query);
  if (!q) return [];

  return RESOURCES.filter((resource) =>
    resource.topics.some((topic) => q.includes(normalize(topic))),
  );
}

export function getResourceById(id: string): ContentResource | undefined {
  return RESOURCES.find((r) => r.id === id);
}

export function listAllResources(): ContentResource[] {
  return [...RESOURCES];
}
