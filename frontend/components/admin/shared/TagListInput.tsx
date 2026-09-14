"use client";

import { useState } from "react";

interface TagListInputProps {
  label: string;
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}

/** Generic editor for a string[] field -- add via Enter/button, remove via ×. */
export default function TagListInput({ label, values, onChange, placeholder }: TagListInputProps) {
  const [draft, setDraft] = useState("");

  function addTag() {
    const trimmed = draft.trim();
    if (!trimmed || values.includes(trimmed)) {
      setDraft("");
      return;
    }
    onChange([...values, trimmed]);
    setDraft("");
  }

  function removeTag(index: number) {
    onChange(values.filter((_, i) => i !== index));
  }

  return (
    <div>
      <label className="text-sm font-semibold text-forest-800">{label}</label>
      <div className="mt-2 flex flex-wrap gap-2">
        {values.map((value, i) => (
          <span
            key={`${value}-${i}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-forest-100 px-3 py-1 text-sm font-medium text-forest-800"
          >
            {value}
            <button
              type="button"
              onClick={() => removeTag(i)}
              aria-label={`Remove ${value}`}
              className="text-forest-600 hover:text-orange-600"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag();
            }
          }}
          placeholder={placeholder}
          className="flex-1 rounded-lg border border-cream-300 px-3 py-2 text-sm outline-none focus:border-forest-500"
        />
        <button
          type="button"
          onClick={addTag}
          className="rounded-lg border-2 border-forest-700 px-3 py-2 text-sm font-bold text-forest-700 hover:bg-forest-50"
        >
          Add
        </button>
      </div>
    </div>
  );
}
