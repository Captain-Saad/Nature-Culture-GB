"use client";

import { useEffect, useState, type InputHTMLAttributes } from "react";

interface NumberFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type" | "min" | "max"> {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max?: number;
}

/**
 * A number input that lets people type normally. The text they type is kept
 * as-is while editing (so clearing the field and typing "7" gives 7, not 17,
 * and there's no leftover "0" prefix); a number is passed to onChange only
 * once the text is a valid value, clamped to max. Leaving the field empty or
 * below min snaps it to min on blur.
 */
export default function NumberField({ value, onChange, min, max, onBlur, ...rest }: NumberFieldProps) {
  const [text, setText] = useState(String(value));

  // Follow outside changes (e.g. a reset, or a value clamped to max) without
  // clobbering the text while it's mid-edit and still means the same number.
  useEffect(() => {
    setText((current) => (current !== "" && Number(current) === value ? current : String(value)));
  }, [value]);

  function commit(raw: string) {
    const n = Number(raw);
    if (raw.trim() === "" || !Number.isFinite(n) || n < min) return;
    const next = Math.round(max !== undefined ? Math.min(n, max) : n);
    if (next !== value) onChange(next);
  }

  return (
    <input
      {...rest}
      type="number"
      inputMode="numeric"
      min={min}
      max={max}
      value={text}
      onChange={(e) => {
        setText(e.target.value);
        commit(e.target.value);
      }}
      onBlur={(e) => {
        const n = Number(text);
        if (text.trim() === "" || !Number.isFinite(n) || n < min) {
          setText(String(min));
          if (value !== min) onChange(min);
        } else {
          setText(String(value));
        }
        onBlur?.(e);
      }}
    />
  );
}
