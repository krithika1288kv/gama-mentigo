"use client";

import type { LearnerLevel } from "@/lib/types";
import { copy } from "@/lib/copy";

const LEVELS: LearnerLevel[] = ["Beginner", "Intermediate", "Advanced"];

export function LevelSelector({
  value,
  onChange,
  disabled,
}: {
  value: LearnerLevel;
  onChange: (level: LearnerLevel) => void;
  disabled?: boolean;
}) {
  return (
    <fieldset className="border-0 p-0 m-0">
      <legend className="sec-label mb-2">{copy.tutor.levelLabel}</legend>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={copy.tutor.levelLabel}>
        {LEVELS.map((level) => {
          const selected = value === level;
          return (
            <button
              key={level}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={disabled}
              onClick={() => onChange(level)}
              className={`px-3 py-2 text-sm font-semibold rounded-[8px] border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--ust-light-teal)] focus-visible:outline-offset-[-2px] ${
                selected
                  ? "bg-[color:var(--ust-dark-teal)] text-white border-transparent"
                  : "bg-[color:var(--ust-white)] text-[color:var(--ust-black)] border-[color:var(--border)] hover:border-[color:var(--border-strong)]"
              }`}
            >
              {level}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
