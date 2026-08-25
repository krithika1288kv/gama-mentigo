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
    <div role="alert" className="error-banner">
      <p>{message}</p>
      {onRetry ? (
        <button type="button" onClick={onRetry} className="error-retry">
          {copy.common.retry}
        </button>
      ) : null}
    </div>
  );
}
