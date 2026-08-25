"use client";

export function ChatMessageBubble({
  role,
  content,
}: {
  role: "user" | "assistant";
  content: string;
}) {
  const isUser = role === "user";
  return (
    <div
      className={`message-row ${isUser ? "is-user" : "is-assistant"}`}
      role="listitem"
    >
      <div
        className={`message-bubble ${isUser ? "is-user" : "is-assistant"}`}
        aria-label={isUser ? "Your message" : "Assistant message"}
      >
        {content}
      </div>
    </div>
  );
}
