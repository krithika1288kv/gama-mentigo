"use client";

import { useId } from "react";

export function ChatComposer({
  value,
  onChange,
  onSubmit,
  placeholder,
  submitLabel,
  disabled,
  multiline = false,
  rows = 3,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder: string;
  submitLabel: string;
  disabled?: boolean;
  multiline?: boolean;
  rows?: number;
}) {
  const id = useId();

  return (
    <form
      className="flex flex-col gap-3 sm:flex-row sm:items-end"
      onSubmit={(e) => {
        e.preventDefault();
        if (!disabled) onSubmit();
      }}
    >
      <label htmlFor={id} className="sr-only">
        {placeholder}
      </label>
      {multiline ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          disabled={disabled}
          className="flex-1 w-full resize-y rounded-[8px] border border-[color:var(--border)] bg-[color:var(--ust-white)] px-3 py-2 text-[15px] text-[color:var(--ust-black)] placeholder:text-[color:var(--ust-muted2)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--ust-light-teal)] focus-visible:outline-offset-[-2px]"
        />
      ) : (
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 w-full rounded-[8px] border border-[color:var(--border)] bg-[color:var(--ust-white)] px-3 py-2 text-[15px] text-[color:var(--ust-black)] placeholder:text-[color:var(--ust-muted2)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--ust-light-teal)] focus-visible:outline-offset-[-2px]"
        />
      )}
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="shrink-0 rounded-[8px] bg-[color:var(--ust-dark-teal)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[color:var(--ust-teal-deep)] disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--ust-light-teal)] focus-visible:outline-offset-2"
      >
        {submitLabel}
      </button>
    </form>
  );
}
