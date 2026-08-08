/**
 * Centralized UI copy — keep strings here for i18n readiness (NFR Section 4).
 * English only for v1.
 */
export const copy = {
  brand: {
    suiteName: "GAMA Mentigo",
    org: "UST | G.A. MENON ACADEMY",
  },
  home: {
    title: "GAMA Mentigo",
    subtitle:
      "Learn AI concepts with the Tutor, or sharpen your work with the Coach.",
    tutorCta: "Open Tutor Agent",
    coachCta: "Open Coach Agent",
  },
  nav: {
    home: "Home",
    tutor: "Tutor",
    coach: "Coach",
    signIn: "Sign in",
    signOut: "Sign out",
  },
  tutor: {
    title: "Tutor Agent",
    subtitle:
      "Ask questions about generative AI, prompt engineering, Cursor, and responsible AI.",
    levelLabel: "Your level",
    placeholder: "Ask a question about AI…",
    send: "Send",
    empty: "Select your level, then ask your first question.",
    streaming: "Tutor is responding…",
    errorGeneric:
      "The Tutor is temporarily unavailable. Please try again in a moment.",
    errorEmpty: "Enter a question to continue.",
    offTopicHint: "I focus on AI learning topics — try rephrasing around AI concepts.",
  },
  coach: {
    title: "Coach Agent",
    subtitle:
      "Paste a prompt, draft, or code snippet for structured feedback.",
    artifactLabel: "Artifact type",
    artifactTypes: {
      ai_prompt: "AI prompt",
      written_content: "Written content",
      code_snippet: "Code snippet",
    },
    placeholder: "Paste your work here…",
    submit: "Evaluate",
    followUpPlaceholder: "Ask a follow-up about this feedback…",
    empty: "Choose an artifact type and paste your work to get feedback.",
    evaluating: "Evaluating your work…",
    whatWorked: "What worked",
    whatToImprove: "What to improve",
    suggestedRewrite: "Suggested rewrite",
    relatedGuides: "Related guides",
    draftRubricBadge: "Draft rubric — pending review",
    errorGeneric:
      "The Coach is temporarily unavailable. Please try again in a moment.",
    errorEmpty: "Paste your work before submitting.",
  },
  auth: {
    bypassBanner:
      "Dev auth bypass is on. Connect Azure AD before production rollout.",
  },
  demo: {
    banner:
      "Demo answers are on (Azure OpenAI is not configured yet). Add your Azure keys in apps/web/.env.local for live Tutor and Coach responses.",
  },
  common: {
    retry: "Retry",
    loading: "Loading…",
  },
} as const;
