"use client";

import TagListInput from "@/components/admin/shared/TagListInput";
import type { AdminItineraryDay } from "@/lib/admin/types";

interface ItineraryEditorProps {
  days: AdminItineraryDay[];
  onChange: (next: AdminItineraryDay[]) => void;
}

/**
 * Day-by-day itinerary builder: add, remove and reorder days, editing each
 * one's title, description, meals and overnight stop.
 *
 * `day` is positional, not user-editable -- it's renumbered from the array
 * order after every mutation, so the numbers can never drift out of sequence
 * the way a free-text field would allow.
 */
export default function ItineraryEditor({ days, onChange }: ItineraryEditorProps) {
  function renumber(list: AdminItineraryDay[]): AdminItineraryDay[] {
    return list.map((d, i) => ({ ...d, day: i + 1 }));
  }

  function addDay() {
    onChange(
      renumber([...days, { day: days.length + 1, title: "", description: "", meals: [], overnightAt: "" }])
    );
  }

  function removeDay(index: number) {
    onChange(renumber(days.filter((_, i) => i !== index)));
  }

  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= days.length) return;
    const next = [...days];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(renumber(next));
  }

  function update(index: number, patch: Partial<AdminItineraryDay>) {
    onChange(days.map((d, i) => (i === index ? { ...d, ...patch } : d)));
  }

  return (
    <div>
      {days.length === 0 && (
        <p className="rounded-lg border border-dashed border-cream-400 bg-cream-100 px-4 py-6 text-center text-sm text-forest-500">
          No itinerary days yet. Add the first day below.
        </p>
      )}

      <div className="space-y-4">
        {days.map((day, i) => (
          <div key={i} className="rounded-lg border border-cream-300 bg-cream-50 p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="rounded-full bg-forest-700 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                Day {day.day}
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  aria-label={`Move day ${day.day} up`}
                  className="rounded-md border border-cream-300 bg-white px-2 py-1 text-xs font-bold text-forest-700 hover:bg-forest-50 disabled:opacity-40"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === days.length - 1}
                  aria-label={`Move day ${day.day} down`}
                  className="rounded-md border border-cream-300 bg-white px-2 py-1 text-xs font-bold text-forest-700 hover:bg-forest-50 disabled:opacity-40"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => removeDay(i)}
                  aria-label={`Remove day ${day.day}`}
                  className="rounded-md border border-red-600 px-2 py-1 text-xs font-bold text-red-600 hover:bg-red-50"
                >
                  Remove
                </button>
              </div>
            </div>

            <div className="mt-3 space-y-3">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-forest-600">Title</label>
                <input
                  type="text"
                  value={day.title}
                  onChange={(e) => update(i, { title: e.target.value })}
                  placeholder="e.g. Arrive in Skardu"
                  className="mt-1 w-full rounded-lg border border-cream-300 px-3 py-2 text-sm outline-none focus:border-forest-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-forest-600">
                  Activities / Description
                </label>
                <textarea
                  rows={3}
                  value={day.description}
                  onChange={(e) => update(i, { description: e.target.value })}
                  placeholder="What travellers do on this day."
                  className="mt-1 w-full rounded-lg border border-cream-300 px-3 py-2 text-sm outline-none focus:border-forest-500"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <TagListInput
                  label="Meals"
                  values={day.meals ?? []}
                  onChange={(v) => update(i, { meals: v })}
                  placeholder="e.g. Breakfast"
                />
                <div>
                  <label className="text-sm font-semibold text-forest-800">Overnight At</label>
                  <input
                    type="text"
                    value={day.overnightAt ?? ""}
                    onChange={(e) => update(i, { overnightAt: e.target.value })}
                    placeholder="e.g. Shigar Fort Residence"
                    className="mt-2 w-full rounded-lg border border-cream-300 px-3 py-2 text-sm outline-none focus:border-forest-500"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addDay}
        className="mt-4 rounded-lg border-2 border-forest-700 px-4 py-2 text-sm font-bold text-forest-700 hover:bg-forest-50"
      >
        + Add Day
      </button>
    </div>
  );
}
