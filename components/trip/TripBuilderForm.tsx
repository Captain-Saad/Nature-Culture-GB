"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Destination } from "@/lib/types";
import { TripState, defaultTripState } from "@/lib/trip-types";
import { pricingTable, HotelCategoryKey, TransportKey } from "@/lib/mock-data/pricing";
import CostCalculator from "./CostCalculator";

const STARTING_CITIES = ["Islamabad", "Lahore", "Karachi", "Peshawar"];
const ACTIVITY_OPTIONS = Object.keys(pricingTable.activityCostPKR);

const STEP_KEYS = [
  "origin",
  "destinations",
  "duration",
  "budget",
  "transport",
  "activities",
  "review",
] as const;

export default function TripBuilderForm({ destinations }: { destinations: Destination[] }) {
  const t = useTranslations("tripBuilder");
  const tc = useTranslations("common");
  const [step, setStep] = useState(0);
  const [trip, setTrip] = useState<TripState>(defaultTripState);
  const [submitted, setSubmitted] = useState(false);

  const totalSteps = STEP_KEYS.length;
  const stepKey = STEP_KEYS[step];

  function update<K extends keyof TripState>(key: K, value: TripState[K]) {
    setTrip((prev) => ({ ...prev, [key]: value }));
  }

  function toggleDestination(id: string) {
    update(
      "destinationIds",
      trip.destinationIds.includes(id)
        ? trip.destinationIds.filter((d) => d !== id)
        : [...trip.destinationIds, id]
    );
  }

  function toggleActivity(activity: string) {
    update(
      "activities",
      trip.activities.includes(activity)
        ? trip.activities.filter((a) => a !== activity)
        : [...trip.activities, activity]
    );
  }

  function handleSubmit() {
    // Phase 4 (backend) will POST this payload to the trip-planning API.
    console.log("Trip Builder submission (client-side only):", trip);
    setSubmitted(true);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
      <div className="rounded-card bg-white p-6 shadow-card sm:p-8">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">
            {t("step", { current: step + 1, total: totalSteps })}
          </p>
          <h2 className="mt-1 font-display text-xl font-bold text-forest-900">
            {t(`steps.${stepKey}`)}
          </h2>
          <div className="mt-3 h-1.5 w-full rounded-full bg-cream-200">
            <div
              className="h-1.5 rounded-full bg-orange-500 transition-all"
              style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {stepKey === "origin" && (
          <div>
            <label className="text-sm font-semibold text-forest-800">{t("fields.startingCity")}</label>
            <select
              value={trip.startingCity}
              onChange={(e) => update("startingCity", e.target.value)}
              className="mt-2 w-full rounded-lg border border-cream-300 px-3 py-2.5 text-sm outline-none focus:border-forest-500"
            >
              {STARTING_CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        )}

        {stepKey === "destinations" && (
          <div>
            <label className="text-sm font-semibold text-forest-800">{t("fields.destinationsLabel")}</label>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {destinations.map((d) => {
                const active = trip.destinationIds.includes(d.id);
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => toggleDestination(d.id)}
                    aria-pressed={active}
                    className={`rounded-lg border px-3 py-2 text-left text-sm font-medium transition-colors ${
                      active
                        ? "border-forest-700 bg-forest-50 text-forest-900"
                        : "border-cream-300 text-forest-700 hover:border-forest-400"
                    }`}
                  >
                    {d.name}
                    <span className="block text-xs text-forest-500">{d.region}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {stepKey === "duration" && (
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-forest-800">{t("fields.days")}</label>
              <input
                type="number"
                min={1}
                max={30}
                value={trip.days}
                onChange={(e) => update("days", Number(e.target.value))}
                className="mt-2 w-full rounded-lg border border-cream-300 px-3 py-2.5 text-sm outline-none focus:border-forest-500"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-forest-800">{t("fields.travelers")}</label>
              <input
                type="number"
                min={1}
                max={20}
                value={trip.travelers}
                onChange={(e) => update("travelers", Number(e.target.value))}
                className="mt-2 w-full rounded-lg border border-cream-300 px-3 py-2.5 text-sm outline-none focus:border-forest-500"
              />
            </div>
          </div>
        )}

        {stepKey === "budget" && (
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-forest-800">{t("fields.budget")}</label>
              <input
                type="number"
                min={0}
                step={5000}
                value={trip.budgetPKR}
                onChange={(e) => update("budgetPKR", Number(e.target.value))}
                className="mt-2 w-full rounded-lg border border-cream-300 px-3 py-2.5 text-sm outline-none focus:border-forest-500"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-forest-800">{t("fields.hotelCategory")}</label>
              <select
                value={trip.hotelCategory}
                onChange={(e) => update("hotelCategory", e.target.value as HotelCategoryKey)}
                className="mt-2 w-full rounded-lg border border-cream-300 px-3 py-2.5 text-sm outline-none focus:border-forest-500"
              >
                {Object.keys(pricingTable.hotelPerNightPKR).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {stepKey === "transport" && (
          <div>
            <label className="text-sm font-semibold text-forest-800">{t("fields.transport")}</label>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {Object.keys(pricingTable.transportPerDayPKR).map((mode) => {
                const active = trip.transport === mode;
                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => update("transport", mode as TransportKey)}
                    aria-pressed={active}
                    className={`rounded-lg border px-3 py-2.5 text-sm font-semibold transition-colors ${
                      active
                        ? "border-forest-700 bg-forest-700 text-white"
                        : "border-cream-300 text-forest-700 hover:border-forest-400"
                    }`}
                  >
                    {mode}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {stepKey === "activities" && (
          <div>
            <label className="text-sm font-semibold text-forest-800">{t("fields.activitiesLabel")}</label>
            <div className="mt-3 flex flex-wrap gap-2">
              {ACTIVITY_OPTIONS.map((activity) => {
                const active = trip.activities.includes(activity);
                return (
                  <button
                    key={activity}
                    type="button"
                    onClick={() => toggleActivity(activity)}
                    aria-pressed={active}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                      active
                        ? "border-forest-700 bg-forest-700 text-white"
                        : "border-cream-300 text-forest-700 hover:border-forest-400"
                    }`}
                  >
                    {activity}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {stepKey === "review" && (
          <div>
            {submitted ? (
              <p className="rounded-lg bg-forest-50 p-4 text-sm font-semibold text-forest-800">
                {tc("addedToTrip")} — {t("summary.title")} logged to console (client-side only for now).
              </p>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full rounded-full bg-forest-700 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-forest-800"
              >
                {t("buttons.finish")}
              </button>
            )}
          </div>
        )}

        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(s - 1, 0))}
            disabled={step === 0}
            className="rounded-full border-2 border-forest-700 px-5 py-2 text-sm font-bold text-forest-700 disabled:opacity-40"
          >
            {t("buttons.back")}
          </button>
          {step < totalSteps - 1 && (
            <button
              type="button"
              onClick={() => setStep((s) => Math.min(s + 1, totalSteps - 1))}
              className="rounded-full bg-orange-500 px-5 py-2 text-sm font-bold text-white hover:bg-orange-600"
            >
              {t("buttons.next")}
            </button>
          )}
        </div>
      </div>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <CostCalculator trip={trip} destinations={destinations} />
      </div>
    </div>
  );
}
