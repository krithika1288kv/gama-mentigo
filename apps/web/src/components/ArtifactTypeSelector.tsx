"use client";

import type { ArtifactType } from "@/lib/types";
import { copy } from "@/lib/copy";

const TYPES: ArtifactType[] = ["ai_prompt", "written_content", "code_snippet"];

export function ArtifactTypeSelector({
  value,
  onChange,
  disabled,
}: {
  value: ArtifactType;
  onChange: (type: ArtifactType) => void;
  disabled?: boolean;
}) {
  return (
    <fieldset className="choice-set">
      <legend className="sec-label">{copy.coach.artifactLabel}</legend>
      <div
        className="choice-row"
        role="radiogroup"
        aria-label={copy.coach.artifactLabel}
      >
        {TYPES.map((type) => {
          const selected = value === type;
          return (
            <button
              key={type}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={disabled}
              onClick={() => onChange(type)}
              className={`choice-chip${selected ? " is-selected" : ""}`}
            >
              {copy.coach.artifactTypes[type]}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
