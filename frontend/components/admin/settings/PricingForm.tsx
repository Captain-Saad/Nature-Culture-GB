"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useAdminApi } from "@/lib/admin/useAdminApi";
import TagListInput from "@/components/admin/shared/TagListInput";
import { HOTEL_CATEGORIES, TRANSPORT_MODES } from "@/lib/admin/enums";
import { normalizeTripPricing, DEFAULT_TRIP_PRICING, type TripPricing } from "@/lib/pricing";

const INPUT =
  "mt-2 w-full rounded-lg border border-cream-300 px-3 py-2 text-sm outline-none focus:border-forest-500";

function NumberInput({
  label,
  value,
  onChange,
  min = 0,
  max,
  suffix = "PKR",
  help,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  suffix?: string;
  help?: string;
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-forest-800">{label}</label>
      <div className="relative">
        <input
          type="number"
          required
          min={min}
          max={max}
          step={1}
          value={Number.isFinite(value) ? value : ""}
          onChange={(e) => onChange(e.target.value === "" ? NaN : Number(e.target.value))}
          className={`${INPUT} pr-14`}
        />
        <span className="pointer-events-none absolute right-3 top-1/2 mt-1 -translate-y-1/2 text-xs text-forest-500">
          {suffix}
        </span>
      </div>
      {help && <p className="mt-1 text-xs text-forest-500">{help}</p>}
    </div>
  );
}

function Card({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-card bg-white p-6 shadow-card">
      <h2 className="font-display text-lg font-bold text-forest-900">{title}</h2>
      {hint && <p className="mt-1 text-xs text-forest-500">{hint}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

/**
 * Rates behind the Plan My Trip cost estimator. Saved into the site-settings
 * row (tripPricing); the backend stamps "last updated", which the public
 * estimate shows as "Estimated as of <date>".
 */
export default function PricingForm({ initial }: { initial: unknown }) {
  const router = useRouter();
  const { request } = useAdminApi();
  const [pricing, setPricing] = useState<TripPricing>(() => normalizeTripPricing(initial));
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  function set<K extends keyof TripPricing>(key: K, value: TripPricing[K]) {
    setPricing((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function setActivity(index: number, patch: Partial<TripPricing["activities"][number]>) {
    set(
      "activities",
      pricing.activities.map((a, i) => (i === index ? { ...a, ...patch } : a))
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaved(false);

    if (pricing.startingCities.length === 0) {
      setError("Add at least one starting city.");
      return;
    }
    const names = pricing.activities.map((a) => a.name.trim().toLowerCase());
    if (names.some((n) => !n)) {
      setError("Every activity needs a name — fill it in or remove the row.");
      return;
    }
    if (new Set(names).size !== names.length) {
      setError("Two activities have the same name.");
      return;
    }

    setSaving(true);
    // lastUpdated is set by the server; the backend strips unknown keys anyway.
    const tripPricing: Omit<TripPricing, "lastUpdated"> & { lastUpdated?: string } = { ...pricing };
    delete tripPricing.lastUpdated;
    const { data, error: err } = await request<{ tripPricing: unknown }>("site-settings", {
      method: "PATCH",
      body: JSON.stringify({ tripPricing }),
    });
    setSaving(false);

    if (err) {
      setError(err);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (data) setPricing(normalizeTripPricing(data.tripPricing));
    setSaved(true);
    router.refresh();
  }

  function resetToDefaults() {
    setPricing({ ...DEFAULT_TRIP_PRICING, lastUpdated: pricing.lastUpdated });
    setSaved(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <p role="alert" className="rounded-lg bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-800">
          {error}
        </p>
      )}
      {saved && (
        <p role="status" className="rounded-lg bg-forest-100 px-4 py-3 text-sm font-semibold text-forest-800">
          Saved. Plan My Trip now estimates with these rates.
        </p>
      )}

      <p className="text-sm text-forest-600">
        These rates drive the live cost estimate on Plan My Trip. Visitors see it labelled as an estimate,
        dated <span className="font-semibold">{pricing.lastUpdated}</span> (updated automatically when you
        save).
      </p>

      <Card title="Starting Cities" hint="The cities travellers can choose as their starting point (step 1).">
        <TagListInput
          label="Cities"
          values={pricing.startingCities}
          onChange={(v) => set("startingCities", v)}
          placeholder="e.g. Islamabad"
        />
      </Card>

      <Card title="Hotels" hint="Per room, per night. Rooms needed = travellers ÷ travellers per room, rounded up.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {HOTEL_CATEGORIES.map((category) => (
            <NumberInput
              key={category}
              label={category}
              value={pricing.hotelPerNightPKR[category]}
              onChange={(v) => set("hotelPerNightPKR", { ...pricing.hotelPerNightPKR, [category]: v })}
            />
          ))}
          <NumberInput
            label="Travellers per Room"
            value={pricing.travelersPerRoom}
            onChange={(v) => set("travelersPerRoom", v)}
            min={1}
            max={10}
            suffix="people"
          />
        </div>
      </Card>

      <Card
        title="Transport"
        hint="Per day. Shared is priced per seat (per traveller); Private and 4x4 Jeep per vehicle, with extra vehicles added when travellers exceed the capacity."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          {TRANSPORT_MODES.map((mode) => (
            <NumberInput
              key={mode}
              label={mode === "Shared" ? "Shared (per seat)" : `${mode} (per vehicle)`}
              value={pricing.transportPerDayPKR[mode]}
              onChange={(v) => set("transportPerDayPKR", { ...pricing.transportPerDayPKR, [mode]: v })}
            />
          ))}
          <div className="hidden sm:block" />
          {(["Private", "4x4 Jeep"] as const).map((mode) => (
            <NumberInput
              key={mode}
              label={`${mode} Capacity`}
              value={pricing.transportVehicleCapacity[mode]}
              onChange={(v) =>
                set("transportVehicleCapacity", { ...pricing.transportVehicleCapacity, [mode]: v })
              }
              min={1}
              max={60}
              suffix="seats"
            />
          ))}
        </div>
      </Card>

      <Card title="Food & Entry Fees">
        <div className="grid gap-4 sm:grid-cols-2">
          <NumberInput
            label="Food per Person per Day"
            value={pricing.foodPerDayPersonPKR}
            onChange={(v) => set("foodPerDayPersonPKR", v)}
          />
          <NumberInput
            label="Entry Fee per Destination per Person"
            value={pricing.entryFeePerAttractionPKR}
            onChange={(v) => set("entryFeePerAttractionPKR", v)}
          />
        </div>
      </Card>

      <Card title="Activities" hint="Per traveller. These are the choices on the Activities step, in this order.">
        <div className="space-y-2">
          {pricing.activities.map((activity, index) => (
            <div key={index} className="flex items-end gap-3">
              <div className="flex-1">
                <label className="sr-only">Activity name</label>
                <input
                  type="text"
                  required
                  maxLength={60}
                  value={activity.name}
                  onChange={(e) => setActivity(index, { name: e.target.value })}
                  placeholder="Activity name"
                  className={INPUT}
                />
              </div>
              <div className="w-40">
                <NumberInput
                  label=""
                  value={activity.costPKR}
                  onChange={(v) => setActivity(index, { costPKR: v })}
                />
              </div>
              <button
                type="button"
                onClick={() => set("activities", pricing.activities.filter((_, i) => i !== index))}
                aria-label={`Remove ${activity.name || "activity"}`}
                className="mb-2 text-lg leading-none text-forest-400 hover:text-orange-600"
              >
                ×
              </button>
            </div>
          ))}
          {pricing.activities.length < 30 && (
            <button
              type="button"
              onClick={() => set("activities", [...pricing.activities, { name: "", costPKR: 0 }])}
              className="mt-2 rounded-full border border-dashed border-forest-400 px-4 py-1.5 text-xs font-bold text-forest-700 hover:bg-forest-50"
            >
              + Add activity
            </button>
          )}
        </div>
      </Card>

      <div className="sticky bottom-4 flex flex-wrap justify-end gap-3">
        <button
          type="button"
          onClick={resetToDefaults}
          className="rounded-full border-2 border-forest-700 bg-white px-5 py-2 text-sm font-bold text-forest-700 hover:bg-forest-50"
        >
          Fill in Default Rates
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-orange-500 px-6 py-2.5 text-sm font-bold text-white shadow-card-lg transition-colors hover:bg-orange-600 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save Pricing"}
        </button>
      </div>
    </form>
  );
}
