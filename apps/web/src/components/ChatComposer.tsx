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
      className="composer"
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
          className="composer-textarea"
        />
      ) : (
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="composer-input"
        />
      )}
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="btn-primary"
      >
        {submitLabel}
      </button>
    </form>
  );
}
