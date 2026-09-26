"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Destination } from "@/lib/types";
import { TripState, defaultTripState } from "@/lib/trip-types";
import { pricingTable, HotelCategoryKey, TransportKey } from "@/lib/pricing";
import CostCalculator from "./CostCalculator";
import { postToApi } from "@/lib/postToApi";

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

function clamp(value: number, min: number, max: number) {
  return Number.isFinite(value) ? Math.min(Math.max(Math.round(value), min), max) : min;
}

export default function TripBuilderForm({ destinations }: { destinations: Destination[] }) {
  const t = useTranslations("tripBuilder");
  const tc = useTranslations("common");
  const [step, setStep] = useState(0);
  const [trip, setTrip] = useState<TripState>(defaultTripState);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contact, setContact] = useState({ name: "", phone: "", email: "", notes: "" });

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

  /**
   * Sends the wizard as a trip lead (POST /trip-leads), the same endpoint
   * cart checkout uses -- it shows up in /admin/leads with every choice made
   * here, and triggers the lead notification email.
   */
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (trip.destinationIds.length === 0) {
      setError(t("needDestination"));
      return;
    }

    setError(null);
    setSending(true);
    const result = await postToApi("/trip-leads", {
      ...trip,
      name: contact.name,
      contact: contact.phone,
      email: contact.email || undefined,
      notes: contact.notes || undefined,
    });
    setSending(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSubmitted(true);
  }

  function startOver() {
    setTrip(defaultTripState);
    setContact({ name: "", phone: "", email: "", notes: "" });
    setSubmitted(false);
    setStep(0);
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
                onChange={(e) => update("days", clamp(Number(e.target.value), 1, 30))}
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
                onChange={(e) => update("travelers", clamp(Number(e.target.value), 1, 20))}
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
                onChange={(e) => update("budgetPKR", Math.max(0, Math.round(Number(e.target.value)) || 0))}
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
              <div role="status" className="rounded-lg bg-forest-50 p-5 text-center">
                <p className="text-sm font-semibold text-forest-800">{t("success")}</p>
                <button
                  type="button"
                  onClick={startOver}
                  className="mt-3 text-sm font-semibold text-orange-600 underline-offset-2 hover:underline"
                >
                  {t("planAnother")}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <h3 className="font-display text-base font-bold text-forest-900">{t("contactHeading")}</h3>
                  <p className="mt-1 text-xs text-forest-500">{t("contactHint")}</p>
                </div>

                {error && (
                  <p role="alert" className="rounded-lg bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-800">
                    {error}
                  </p>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="trip-name" className="text-sm font-semibold text-forest-800">
                      {t("fields.name")}
                    </label>
                    <input
                      id="trip-name"
                      required
                      maxLength={200}
                      value={contact.name}
                      onChange={(e) => setContact((c) => ({ ...c, name: e.target.value }))}
                      className="mt-2 w-full rounded-lg border border-cream-300 px-3 py-2.5 text-sm outline-none focus:border-forest-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="trip-phone" className="text-sm font-semibold text-forest-800">
                      {t("fields.phone")}
                    </label>
                    <input
                      id="trip-phone"
                      type="tel"
                      required
                      minLength={3}
                      maxLength={200}
                      value={contact.phone}
                      onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value }))}
                      className="mt-2 w-full rounded-lg border border-cream-300 px-3 py-2.5 text-sm outline-none focus:border-forest-500"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="trip-email" className="text-sm font-semibold text-forest-800">
                    {t("fields.email")} <span className="font-normal text-forest-500">({tc("optional")})</span>
                  </label>
                  <input
                    id="trip-email"
                    type="email"
                    maxLength={200}
                    value={contact.email}
                    onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))}
                    className="mt-2 w-full rounded-lg border border-cream-300 px-3 py-2.5 text-sm outline-none focus:border-forest-500"
                  />
                </div>
                <div>
                  <label htmlFor="trip-notes" className="text-sm font-semibold text-forest-800">
                    {t("fields.notes")} <span className="font-normal text-forest-500">({tc("optional")})</span>
                  </label>
                  <textarea
                    id="trip-notes"
                    rows={3}
                    maxLength={2000}
                    value={contact.notes}
                    onChange={(e) => setContact((c) => ({ ...c, notes: e.target.value }))}
                    className="mt-2 w-full rounded-lg border border-cream-300 px-3 py-2.5 text-sm outline-none focus:border-forest-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full rounded-full bg-forest-700 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-forest-800 disabled:opacity-60"
                >
                  {sending ? tc("sending") : t("buttons.submit")}
                </button>
              </form>
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
