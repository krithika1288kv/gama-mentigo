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
    <fieldset className="border-0 p-0 m-0">
      <legend className="sec-label mb-2">{copy.coach.artifactLabel}</legend>
      <div
        className="flex flex-wrap gap-2"
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
              className={`px-3 py-2 text-sm font-semibold rounded-[8px] border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--ust-light-teal)] focus-visible:outline-offset-[-2px] ${
                selected
                  ? "bg-[color:var(--ust-dark-teal)] text-white border-transparent"
                  : "bg-[color:var(--ust-white)] text-[color:var(--ust-black)] border-[color:var(--border)] hover:border-[color:var(--border-strong)]"
              }`}
            >
              {copy.coach.artifactTypes[type]}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
