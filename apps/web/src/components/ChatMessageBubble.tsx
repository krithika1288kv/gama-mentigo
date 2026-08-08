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
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
      role="listitem"
    >
      <div
        className={`max-w-[min(42rem,92%)] rounded-[14px] px-4 py-3 text-[15px] leading-[1.62] whitespace-pre-wrap ${
          isUser
            ? "bg-[color:var(--ust-dark-teal)] text-white"
            : "bg-[color:var(--ust-white)] text-[color:var(--ust-black)] border border-[color:var(--border)]"
        }`}
        aria-label={isUser ? "Your message" : "Assistant message"}
      >
        {content}
      </div>
    </div>
  );
}
