"use client";

import { useCallback, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ChatComposer } from "@/components/ChatComposer";
import { ChatMessageBubble } from "@/components/ChatMessageBubble";
import { ErrorBanner } from "@/components/ErrorBanner";
import { LevelSelector } from "@/components/LevelSelector";
import { copy } from "@/lib/copy";
import type { ChatMessage, LearnerLevel } from "@/lib/types";

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

export default function TutorPage() {
  const [level, setLevel] = useState<LearnerLevel>("Beginner");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || streaming) return;

    setError(null);
    setInput("");
    const nextHistory = [...messages, { role: "user" as const, content: text }];
    setMessages([...nextHistory, { role: "assistant", content: "" }]);
    setStreaming(true);

    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          level,
          history: messages,
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        if (data.error === "empty") {
          setError(copy.tutor.errorEmpty);
        } else {
          setError(copy.tutor.errorGeneric);
        }
        setMessages(nextHistory);
        return;
      }

      await readStream(res, (partial) => {
        setMessages([...nextHistory, { role: "assistant", content: partial }]);
      });
    } catch {
      setError(copy.tutor.errorGeneric);
      setMessages(nextHistory);
    } finally {
      setStreaming(false);
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [input, level, messages, streaming]);

  return (
    <AppShell active="tutor">
      <div className="page-head">
        <div className="sec-label">{copy.brand.suiteName}</div>
        <h1>{copy.tutor.title}</h1>
        <p className="sub">{copy.tutor.subtitle}</p>
      </div>

      <div className="full-band section-pad">
        <LevelSelector value={level} onChange={setLevel} disabled={streaming} />
      </div>

      <div className="full-band chat-panel">
        <div
          ref={listRef}
          role="list"
          aria-live="polite"
          aria-busy={streaming}
          className="chat-list"
        >
          {messages.length === 0 ? (
            <p className="muted">{copy.tutor.empty}</p>
          ) : (
            messages.map((m, i) => (
              <ChatMessageBubble key={`${m.role}-${i}`} role={m.role} content={m.content} />
            ))
          )}
          {streaming ? (
            <p className="sr-only" role="status">
              {copy.tutor.streaming}
            </p>
          ) : null}
        </div>

        {error ? (
          <div className="mb-3">
            <ErrorBanner message={error} onRetry={() => setError(null)} />
          </div>
        ) : null}

        <ChatComposer
          value={input}
          onChange={setInput}
          onSubmit={send}
          placeholder={copy.tutor.placeholder}
          submitLabel={copy.tutor.send}
          disabled={streaming}
        />
      </div>
    </AppShell>
  );
}
