"use client";

import type { ContentCard } from "@/lib/siteContent";

const INPUT =
  "w-full rounded-lg border border-cream-300 px-3 py-2 text-sm outline-none focus:border-forest-500";

interface CardsEditorProps {
  label: string;
  /** null = the site shows its built-in cards, translated per language. */
  cards: ContentCard[] | null;
  /** The built-in cards (in the admin's language), used as the starting point when customising. */
  defaults: ContentCard[];
  onChange: (next: ContentCard[] | null) => void;
  max?: number;
}

/**
 * Edits a { title, body }[] list such as the About page values or the home
 * page "Why us" points. Until the admin chooses to customise, the site keeps
 * its built-in cards -- which, unlike custom text, are shown in Urdu on the
 * Urdu site -- so customising is an explicit step, reversible with "Reset".
 */
export default function CardsEditor({ label, cards, defaults, onChange, max = 8 }: CardsEditorProps) {
  function update(index: number, patch: Partial<ContentCard>) {
    if (!cards) return;
    onChange(cards.map((card, i) => (i === index ? { ...card, ...patch } : card)));
  }

  function move(index: number, delta: -1 | 1) {
    if (!cards) return;
    const target = index + delta;
    if (target < 0 || target >= cards.length) return;
    const next = [...cards];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-sm font-semibold text-forest-800">{label}</label>
        {cards ? (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-xs font-semibold text-forest-600 underline-offset-2 hover:underline"
          >
            Reset to built-in cards
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onChange(defaults.map((c) => ({ ...c })))}
            className="rounded-full border border-forest-700 px-3 py-1 text-xs font-bold text-forest-700 hover:bg-forest-50"
          >
            Customize
          </button>
        )}
      </div>

      {!cards ? (
        <ul className="mt-2 space-y-1 rounded-lg border border-dashed border-cream-400 bg-cream-50 p-3 text-xs text-forest-600">
          <li className="font-semibold text-forest-700">Using the built-in cards (translated on the Urdu site):</li>
          {defaults.map((c) => (
            <li key={c.title}>
              <span className="font-semibold">{c.title}</span> — {c.body}
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-2 space-y-3">
          {cards.map((card, index) => (
            <div key={index} className="flex gap-3 rounded-lg border border-cream-200 p-3">
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label="Move up"
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-cream-300 text-forest-700 hover:bg-cream-100 disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === cards.length - 1}
                  aria-label="Move down"
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-cream-300 text-forest-700 hover:bg-cream-100 disabled:opacity-30"
                >
                  ↓
                </button>
              </div>
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={card.title}
                  onChange={(e) => update(index, { title: e.target.value })}
                  placeholder="Title"
                  className={INPUT}
                />
                <textarea
                  rows={2}
                  maxLength={500}
                  value={card.body}
                  onChange={(e) => update(index, { body: e.target.value })}
                  placeholder="Short description"
                  className={INPUT}
                />
              </div>
              <button
                type="button"
                onClick={() => onChange(cards.filter((_, i) => i !== index))}
                aria-label={`Remove ${card.title || "card"}`}
                className="self-start text-lg leading-none text-forest-400 hover:text-orange-600"
              >
                ×
              </button>
            </div>
          ))}
          {cards.length < max && (
            <button
              type="button"
              onClick={() => onChange([...cards, { title: "", body: "" }])}
              className="rounded-full border border-dashed border-forest-400 px-4 py-1.5 text-xs font-bold text-forest-700 hover:bg-forest-50"
            >
              + Add card
            </button>
          )}
        </div>
      )}
    </div>
  );
}
