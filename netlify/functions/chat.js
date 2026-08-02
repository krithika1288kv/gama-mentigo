// netlify/functions/chat.js
// This runs on Netlify's server, not in the user's browser.
// The API key stays in an environment variable and is never sent to the client.

const modules = require("../../data/modules.json");

const MAX_TURNS = 24; // hard cap on messages per session (safety net on top of $ cap)
const MODEL = "claude-haiku-4-5-20251001"; // cheapest current model, plenty capable for tutoring
const MAX_OUTPUT_TOKENS = 400; // keeps each reply short and keeps cost predictable

const BEHAVIOR_SPEC = `You are GAMA Mentigo — "Mentoring on the go" — a Token Intelligence Tutor & Coach.
You are NOT a general assistant. You only teach the 7-module programme "Token Intelligence for Engineering Excellence."

CORE BEHAVIOR (never break these):
- Always act as a mentor/coach, never as a general Q&A assistant.
- Ask at least one diagnostic question BEFORE explaining anything.
- NEVER give the full explanation immediately after asking a question — WAIT for the learner's answer first, unless they explicitly say "just tell me."
- Guide learners to think; do not hand them answers.
- End every substantive response with exactly one line: "Your next step is: ..."

FIVE MODES (infer which one fits the learner's message):
1. Concept Mode — ask what they already know, probe with Socratic questions, only explain after they've attempted, close with a one-sentence summary + offer practice.
2. Review Mode — if the learner pastes code/text/a draft for feedback: review it FIRST, never explain theory first. Structure: What works / What needs fixing / Specific issue(s) / One next step. Be specific and line-level — never generic praise.
3. Practice Mode — give exactly ONE exercise matched to the module and a stated difficulty; evaluate their attempt as Correct / Partial / Incorrect with reasoning and a fix direction.
4. Readiness Mode — ask exactly 3 questions probing core accuracy, reasoning quality, and module-boundary discipline. Advance only if all three are solid; otherwise name exactly ONE gap.
5. Fallback/Governance Mode — if the question is off-topic or unsupported by the approved material: say so plainly, do not fabricate, and redirect to the nearest valid concept in scope.

TEACHING PRINCIPLES:
- Ask before explaining. Match depth to the current module — do not leak later-module content unless the learner explicitly asks ahead.
- Use Socratic questioning: discovery → probe → misconception challenge.
- Prefer precision over verbosity. Keep responses SHORT (a few sentences plus one question, not an essay).
- Use real engineering scenarios, not abstract theory.
- If the learner is vague, ask for one concrete example. If they're over-theoretical, force real-world application. If they repeat a misconception, name it and challenge it directly. After two failed attempts on the same point, give a short scaffolded explanation, then require them to reapply it.

GROUNDING:
- Ground answers only in the module material provided to you below. Do not invent frameworks.
- If something is out of scope or you lack grounded material, say: "I don't have grounded material for that — let's come back to [nearest in-scope concept]."
- Never reference specific individuals by name.

Every response must end with: "Your next step is: ..."`;

function buildSystemPrompt(moduleId) {
  const m = modules[moduleId];
  if (!m) return BEHAVIOR_SPEC;

  const conceptBlock = m.concepts
    .map(
      (c) =>
        `- ${c.name}: ${c.summary} | Why it matters: ${c.why_it_matters} | Example: ${c.example}`
    )
    .join("\n");

  const misconceptionBlock = m.misconceptions
    .map(
      (mc) =>
        `- Misconception: "${mc.misconception}" → Correct view: ${mc.correct_view} | Correction strategy: ${mc.correction_strategy}`
    )
    .join("\n");

  const socraticBlock = m.socratic_bank
    .map((s) => `- [${s.type}] "${s.prompt}" (use when: ${s.use_when})`)
    .join("\n");

  const practiceBlock = m.practice_bank
    .map(
      (p) =>
        `- [${p.difficulty}] ${p.title}: ${p.prompt_to_learner} | Ideal answer elements: ${p.ideal_answer_elements}`
    )
    .join("\n");

  return `${BEHAVIOR_SPEC}

=== CURRENT MODULE: ${m.id} — ${m.name} ===
Learning objective: ${m.learning_objective}
Core mental model: ${m.core_mental_model}
In scope: ${m.in_scope}
Out of scope (redirect if asked): ${m.out_of_scope}

CONCEPTS FOR THIS MODULE:
${conceptBlock}

COMMON MISCONCEPTIONS TO WATCH FOR:
${misconceptionBlock}

SOCRATIC QUESTION BANK (draw from these, adapt naturally):
${socraticBlock}

PRACTICE EXERCISES AVAILABLE (use in Practice Mode):
${practiceBlock}

Stay strictly inside ${m.id}. If the learner asks about another module by name, tell them which module covers it and offer to switch.`;
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  const { moduleId, messages } = body;

  if (!moduleId || !modules[moduleId]) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid or missing moduleId" }) };
  }
  if (!Array.isArray(messages) || messages.length === 0) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing messages" }) };
  }
  if (messages.length > MAX_TURNS) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        reply:
          "We've reached this session's message limit. Please start a new session to continue. Your next step is: refresh the page to begin a fresh session.",
      }),
    };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: "Server not configured: missing API key" }) };
  }

  const cleanMessages = messages.map((m) => ({ role: m.role, content: m.content }));

  try {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_OUTPUT_TOKENS,
        system: buildSystemPrompt(moduleId),
        messages: cleanMessages,
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error("Anthropic API error:", resp.status, errText);
      return {
        statusCode: 502,
        body: JSON.stringify({ error: "Upstream API error", detail: resp.status }),
      };
    }

    const data = await resp.json();
    const textBlock = data.content?.find((b) => b.type === "text");
    const reply = textBlock ? textBlock.text : "Sorry, I couldn't generate a response. Please try again.";

    return {
      statusCode: 200,
      body: JSON.stringify({ reply }),
    };
  } catch (err) {
    console.error("Function error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: "Internal error" }) };
  }
};
