"use client";

import { useCallback, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ArtifactTypeSelector } from "@/components/ArtifactTypeSelector";
import { ChatComposer } from "@/components/ChatComposer";
import { ChatMessageBubble } from "@/components/ChatMessageBubble";
import { ErrorBanner } from "@/components/ErrorBanner";
import { copy } from "@/lib/copy";
import { RUBRIC_STATUS } from "@/lib/rubric";
import type { ArtifactType, ChatMessage } from "@/lib/types";

async function readStream(
  res: Response,
  onChunk: (text: string) => void,
): Promise<string> {
  if (!res.body) {
    const text = await res.text();
    onChunk(text);
    return text;
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let full = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    full += chunk;
    onChunk(full);
  }
  return full;
}

export default function CoachPage() {
  const [artifactType, setArtifactType] = useState<ArtifactType>("ai_prompt");
  const [artifact, setArtifact] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const evaluate = useCallback(async () => {
    const text = artifact.trim();
    if (!text || streaming) return;
    setError(null);
    setStreaming(true);

    const userMsg: ChatMessage = { role: "user", content: text };
    const nextHistory = [...messages, userMsg];
    setMessages([...nextHistory, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artifact: text,
          artifactType,
          history: messages,
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          message?: string;
        };
        setError(
          data.error === "empty"
            ? copy.coach.errorEmpty
            : data.message || copy.coach.errorGeneric,
        );
        setMessages(messages);
        return;
      }

      await readStream(res, (partial) => {
        setMessages([...nextHistory, { role: "assistant", content: partial }]);
      });
      setSubmitted(true);
    } catch {
      setError(copy.coach.errorGeneric);
      setMessages(messages);
    } finally {
      setStreaming(false);
    }
  }, [artifact, artifactType, messages, streaming]);

  const askFollowUp = useCallback(async () => {
    const text = followUp.trim();
    if (!text || streaming || !submitted) return;
    setError(null);
    setFollowUp("");
    setStreaming(true);

    const userMsg: ChatMessage = { role: "user", content: text };
    const nextHistory = [...messages, userMsg];
    setMessages([...nextHistory, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artifact,
          artifactType,
          history: messages,
          followUp: text,
        }),
      });

      if (!res.ok) {
        setError(copy.coach.errorGeneric);
        setMessages(messages);
        return;
      }

      await readStream(res, (partial) => {
        setMessages([...nextHistory, { role: "assistant", content: partial }]);
      });
    } catch {
      setError(copy.coach.errorGeneric);
      setMessages(messages);
    } finally {
      setStreaming(false);
    }
  }, [artifact, artifactType, followUp, messages, streaming, submitted]);

  return (
    <AppShell active="coach">
      <div className="page-head">
        <div className="sec-label">{copy.brand.suiteName}</div>
        <h1>{copy.coach.title}</h1>
        <p className="sub">{copy.coach.subtitle}</p>
        <p className="draft-badge">
          {copy.coach.draftRubricBadge} ({RUBRIC_STATUS})
        </p>
      </div>

      <div className="full-band stack">
        <ArtifactTypeSelector
          value={artifactType}
          onChange={setArtifactType}
          disabled={streaming || submitted}
        />

        {!submitted ? (
          <ChatComposer
            value={artifact}
            onChange={setArtifact}
            onSubmit={evaluate}
            placeholder={copy.coach.placeholder}
            submitLabel={streaming ? copy.coach.evaluating : copy.coach.submit}
            disabled={streaming}
            multiline
            rows={8}
          />
        ) : null}

        {messages.length === 0 ? (
          <p className="muted">{copy.coach.empty}</p>
        ) : (
          <div role="list" aria-live="polite" className="chat-list">
            {messages.map((m, i) => (
              <ChatMessageBubble key={`${m.role}-${i}`} role={m.role} content={m.content} />
            ))}
          </div>
        )}

        {error ? <ErrorBanner message={error} onRetry={() => setError(null)} /> : null}

        {submitted ? (
          <ChatComposer
            value={followUp}
            onChange={setFollowUp}
            onSubmit={askFollowUp}
            placeholder={copy.coach.followUpPlaceholder}
            submitLabel={copy.tutor.send}
            disabled={streaming}
          />
        ) : null}
      </div>
    </AppShell>
  );
}
