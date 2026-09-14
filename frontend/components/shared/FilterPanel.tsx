"use client";

import { useTranslations } from "next-intl";

export interface FilterOption {
  label: string;
  value: string;
}

export type FilterGroup =
  | { type: "select"; key: string; label: string; options: FilterOption[] }
  | { type: "checkboxGroup"; key: string; label: string; options: FilterOption[] }
  | { type: "range"; key: string; label: string; min: number; max: number; step?: number; unit?: string };

export type FilterValues = Record<string, string | string[] | number | undefined>;

interface FilterPanelProps {
  groups: FilterGroup[];
  values: FilterValues;
  onChange: (key: string, value: FilterValues[string]) => void;
  onClear: () => void;
  className?: string;
}

export default function FilterPanel({ groups, values, onChange, onClear, className = "" }: FilterPanelProps) {
  const t = useTranslations("common");

  function toggleCheckbox(key: string, value: string) {
    const current = (values[key] as string[]) ?? [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onChange(key, next);
  }

  return (
    <div className={`rounded-card bg-white p-5 shadow-card ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-bold text-forest-900">{t("filters")}</h3>
        <button type="button" onClick={onClear} className="text-xs font-semibold text-orange-600 hover:underline">
          {t("clearFilters")}
        </button>
      </div>

      <div className="mt-4 space-y-5">
        {groups.map((group) => (
          <div key={group.key}>
            <label className="text-sm font-semibold text-forest-800">{group.label}</label>

            {group.type === "select" && (
              <select
                value={(values[group.key] as string) ?? ""}
                onChange={(e) => onChange(group.key, e.target.value)}
                className="mt-2 w-full rounded-lg border border-cream-300 bg-white px-3 py-2 text-sm text-forest-900 outline-none focus:border-forest-500"
              >
                {group.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}

            {group.type === "checkboxGroup" && (
              <div className="mt-2 flex flex-wrap gap-2">
                {group.options.map((opt) => {
                  const active = ((values[group.key] as string[]) ?? []).includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => toggleCheckbox(group.key, opt.value)}
                      aria-pressed={active}
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                        active
                          ? "border-forest-700 bg-forest-700 text-white"
                          : "border-cream-300 text-forest-700 hover:border-forest-400"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            )}

            {group.type === "range" && (
              <div className="mt-2">
                <input
                  type="range"
                  min={group.min}
                  max={group.max}
                  step={group.step ?? 1}
                  value={(values[group.key] as number) ?? group.max}
                  onChange={(e) => onChange(group.key, Number(e.target.value))}
                  className="w-full accent-forest-700"
                />
                <p className="mt-1 text-xs text-forest-500">
                  {t("from")} {group.unit}
                  {group.min.toLocaleString()} – {group.unit}
                  {((values[group.key] as number) ?? group.max).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
