"use client";

import { copy } from "@/lib/copy";

export function ErrorBanner({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="rounded-[14px] border border-[color:var(--ust-coral)]/40 bg-white px-4 py-3 text-[15px] text-[color:var(--ust-black)]"
    >
      <p className="m-0 text-[color:var(--ust-coral)]">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 text-sm font-semibold text-[color:var(--ust-dark-teal)] underline"
        >
          {copy.common.retry}
        </button>
      ) : null}
    </div>
  );
}
