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
    <fieldset className="choice-set">
      <legend className="sec-label">{copy.tutor.levelLabel}</legend>
      <div className="choice-row" role="radiogroup" aria-label={copy.tutor.levelLabel}>
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
              className={`choice-chip${selected ? " is-selected" : ""}`}
            >
              {level}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
