"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Destination } from "@/lib/types";
import { type TripState, defaultTripState } from "@/lib/trip-types";
import type { TripPricing, HotelCategoryKey, TransportKey } from "@/lib/pricing";
import { estimateTripPlan } from "@/lib/tripPlan/estimate";
import { useTripCart } from "@/lib/tripCart/TripCartContext";
import type { CartTripPlanItem } from "@/lib/tripCart/types";
import NumberField from "@/components/shared/NumberField";
import CostCalculator from "./CostCalculator";

const STEP_KEYS = ["origin", "destinations", "duration", "budget", "transport", "activities", "review"] as const;
type StepKey = (typeof STEP_KEYS)[number];

/**
 * The in-progress wizard (answers + current step), kept per browser tab so
 * switching language -- a full navigation to /ur/... or /en/... -- or a
 * reload doesn't wipe it. Cleared once the plan is added to the trip cart.
 */
const DRAFT_KEY = "ncgb_trip_wizard_v1";

interface Draft {
  trip: TripState;
  step: number;
}

function readDraft(): Draft | null {
  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as Draft) : null;
  } catch {
    return null;
  }
}

function writeDraft(draft: Draft | null) {
  try {
    if (draft) window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    else window.sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    // Storage unavailable (private mode etc.) -- the wizard still works, it just won't survive a reload.
  }
}

function tripFromPlan(plan: CartTripPlanItem): TripState {
  return {
    startingCity: plan.startingCity,
    destinationIds: plan.destinations.map((d) => d.id),
    days: plan.days,
    travelers: plan.travelers,
    budgetPKR: plan.budgetPKR,
    hotelCategory: plan.hotelCategory as HotelCategoryKey,
    transport: plan.transport as TransportKey,
    activities: plan.activities,
  };
}

const INPUT =
  "mt-2 w-full rounded-lg border border-cream-300 px-3 py-2.5 text-sm outline-none focus:border-forest-500";

/**
 * Plan My Trip: a step-by-step custom itinerary with a live cost estimate.
 * It doesn't submit anything itself -- the finished plan goes into the trip
 * cart as one "custom trip plan" item, and the traveller sends it to us from
 * the trip cart checkout together with anything else they've added.
 */
export default function TripBuilderForm({
  destinations,
  pricing,
}: {
  destinations: Destination[];
  pricing: TripPricing;
}) {
  const t = useTranslations("tripBuilder");
  const tc = useTranslations("common");
  const { tripPlan, setTripPlan, hydrated: cartHydrated } = useTripCart();

  const blankTrip: TripState = { ...defaultTripState, startingCity: pricing.startingCities[0] ?? "" };
  const [trip, setTrip] = useState<TripState>(blankTrip);
  const [step, setStep] = useState(0);
  const [ready, setReady] = useState(false);
  const [showStepError, setShowStepError] = useState(false);
  const [added, setAdded] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Restore a draft, or open the plan already in the cart for editing.
  // Waits for the cart (localStorage) to load so an existing plan is seen.
  useEffect(() => {
    if (ready || !cartHydrated) return;
    const draft = readDraft();
    if (draft) {
      setTrip({ ...blankTrip, ...draft.trip });
      setStep(Math.min(Math.max(draft.step, 0), STEP_KEYS.length - 1));
    } else if (tripPlan) {
      setTrip(tripFromPlan(tripPlan));
    }
    setReady(true);
    // blankTrip is derived from props that don't change during the page's life.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartHydrated, ready, tripPlan]);

  useEffect(() => {
    if (ready && !added) writeDraft({ trip, step });
  }, [trip, step, ready, added]);

  // Ignore ids of destinations that have since been removed from the site.
  const selectedDestinations = useMemo(
    () => destinations.filter((d) => trip.destinationIds.includes(d.id)),
    [destinations, trip.destinationIds]
  );
  const breakdown = estimateTripPlan(trip, selectedDestinations.length, pricing);

  const stepKey: StepKey = STEP_KEYS[step];
  const totalSteps = STEP_KEYS.length;

  /** The message blocking "Next" on a step, or null if its required input is filled in. */
  function stepProblem(key: StepKey): string | null {
    if (key === "origin" && !trip.startingCity) return t("validation.origin");
    if (key === "destinations" && selectedDestinations.length === 0) return t("validation.destinations");
    return null;
  }
  const currentProblem = stepProblem(stepKey);

  function update<K extends keyof TripState>(key: K, value: TripState[K]) {
    setTrip((prev) => ({ ...prev, [key]: value }));
  }

  function toggleIn(key: "destinationIds" | "activities", value: string) {
    setTrip((prev) => ({
      ...prev,
      [key]: prev[key].includes(value) ? prev[key].filter((v) => v !== value) : [...prev[key], value],
    }));
  }

  function goNext() {
    if (currentProblem) {
      setShowStepError(true);
      return;
    }
    setShowStepError(false);
    setStep((s) => Math.min(s + 1, totalSteps - 1));
  }

  function goBack() {
    setShowStepError(false);
    setStep((s) => Math.max(s - 1, 0));
  }

  function addToCart() {
    // Every earlier step must be complete; jump back to the first that isn't.
    const firstIncomplete = STEP_KEYS.findIndex((key) => stepProblem(key));
    if (firstIncomplete !== -1) {
      setStep(firstIncomplete);
      setShowStepError(true);
      return;
    }
    setTripPlan({
      startingCity: trip.startingCity,
      destinations: selectedDestinations.map((d) => ({ id: d.id, name: d.name, region: d.region ?? null })),
      days: trip.days,
      travelers: trip.travelers,
      budgetPKR: trip.budgetPKR,
      hotelCategory: trip.hotelCategory,
      transport: trip.transport,
      activities: trip.activities,
      estimate: {
        hotel: breakdown.hotel,
        transport: breakdown.transport,
        food: breakdown.food,
        activities: breakdown.activities,
        entryFees: breakdown.entryFees,
        total: breakdown.total,
        pricingAsOf: breakdown.pricingAsOf,
      },
    });
    writeDraft(null);
    setAdded(true);
  }

  function startOver() {
    writeDraft(null);
    setTrip(blankTrip);
    setStep(0);
    setAdded(false);
    setShowStepError(false);
  }

  if (!ready) {
    return <div className="h-96 animate-pulse rounded-card bg-white/60 shadow-card" aria-busy="true" />;
  }

  const calculator = (
    <CostCalculator trip={trip} selectedDestinations={selectedDestinations} breakdown={breakdown} />
  );

  return (
    // Bottom padding leaves room for the mobile estimate bar.
    <div className="grid gap-8 pb-24 lg:grid-cols-[1.3fr_1fr] lg:pb-0">
      <div className="rounded-card bg-white p-6 shadow-card sm:p-8">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">
            {t("step", { current: step + 1, total: totalSteps })}
          </p>
          <h2 className="mt-1 font-display text-xl font-bold text-forest-900">{t(`steps.${stepKey}`)}</h2>
          <div className="mt-3 h-1.5 w-full rounded-full bg-cream-200">
            <div
              className="h-1.5 rounded-full bg-orange-500 transition-all"
              style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {stepKey === "origin" && (
          <div>
            <label htmlFor="trip-origin" className="text-sm font-semibold text-forest-800">
              {t("fields.startingCity")}
            </label>
            <select
              id="trip-origin"
              value={trip.startingCity}
              onChange={(e) => update("startingCity", e.target.value)}
              className={INPUT}
            >
              {pricing.startingCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        )}

        {stepKey === "destinations" && (
          <div>
            <p className="text-sm font-semibold text-forest-800">{t("fields.destinationsLabel")}</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {destinations.map((d) => {
                const active = trip.destinationIds.includes(d.id);
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => {
                      toggleIn("destinationIds", d.id);
                      setShowStepError(false);
                    }}
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
              <label htmlFor="trip-days" className="text-sm font-semibold text-forest-800">
                {t("fields.days")}
              </label>
              <NumberField
                id="trip-days"
                min={1}
                max={30}
                value={trip.days}
                onChange={(v) => update("days", v)}
                className={INPUT}
              />
            </div>
            <div>
              <label htmlFor="trip-travelers" className="text-sm font-semibold text-forest-800">
                {t("fields.travelers")}
              </label>
              <NumberField
                id="trip-travelers"
                min={1}
                max={20}
                value={trip.travelers}
                onChange={(v) => update("travelers", v)}
                className={INPUT}
              />
            </div>
          </div>
        )}

        {stepKey === "budget" && (
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="trip-budget" className="text-sm font-semibold text-forest-800">
                {t("fields.budget")}
              </label>
              <NumberField
                id="trip-budget"
                min={0}
                max={100_000_000}
                step={5000}
                value={trip.budgetPKR}
                onChange={(v) => update("budgetPKR", v)}
                className={INPUT}
              />
            </div>
            <div>
              <label htmlFor="trip-hotel" className="text-sm font-semibold text-forest-800">
                {t("fields.hotelCategory")}
              </label>
              <select
                id="trip-hotel"
                value={trip.hotelCategory}
                onChange={(e) => update("hotelCategory", e.target.value as HotelCategoryKey)}
                className={INPUT}
              >
                {Object.keys(pricing.hotelPerNightPKR).map((cat) => (
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
            <p className="text-sm font-semibold text-forest-800">{t("fields.transport")}</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {Object.keys(pricing.transportPerDayPKR).map((mode) => {
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
            <p className="text-sm font-semibold text-forest-800">
              {t("fields.activitiesLabel")}{" "}
              <span className="font-normal text-forest-500">({tc("optional")})</span>
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {pricing.activities.map(({ name: activity }) => {
                const active = trip.activities.includes(activity);
                return (
                  <button
                    key={activity}
                    type="button"
                    onClick={() => toggleIn("activities", activity)}
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

        {stepKey === "review" &&
          (added ? (
            <div role="status" className="rounded-lg bg-forest-50 p-5 text-center">
              <p className="font-display text-lg font-bold text-forest-900">{t("addedTitle")}</p>
              <p className="mt-1 text-sm text-forest-700">{t("addedBody")}</p>
              <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <Link
                  href="/trip-cart"
                  className="rounded-full bg-orange-500 px-6 py-2.5 text-sm font-bold text-white shadow-card transition-colors hover:bg-orange-600"
                >
                  {t("goToCart")}
                </Link>
                <button
                  type="button"
                  onClick={startOver}
                  className="text-sm font-semibold text-forest-700 underline-offset-2 hover:underline"
                >
                  {t("planAnother")}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-forest-600">{t("reviewIntro")}</p>
              <dl className="grid gap-3 rounded-lg bg-cream-50 p-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-semibold uppercase text-forest-500">{t("fields.startingCity")}</dt>
                  <dd className="text-forest-900">{trip.startingCity}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase text-forest-500">{t("steps.duration")}</dt>
                  <dd className="text-forest-900">{t("reviewDuration", { days: trip.days, travelers: trip.travelers })}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs font-semibold uppercase text-forest-500">{t("steps.destinations")}</dt>
                  <dd className="text-forest-900">
                    {selectedDestinations.length > 0
                      ? selectedDestinations.map((d) => d.name).join(", ")
                      : t("summary.noneSelectedYet")}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase text-forest-500">{t("fields.hotelCategory")}</dt>
                  <dd className="text-forest-900">{trip.hotelCategory}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase text-forest-500">{t("fields.transport")}</dt>
                  <dd className="text-forest-900">{trip.transport}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase text-forest-500">{t("fields.budget")}</dt>
                  <dd className="text-forest-900">
                    {tc("currency")} {trip.budgetPKR.toLocaleString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase text-forest-500">{t("fields.activitiesLabel")}</dt>
                  <dd className="text-forest-900">
                    {trip.activities.length > 0 ? trip.activities.join(", ") : t("summary.noneSelectedYet")}
                  </dd>
                </div>
              </dl>
              {tripPlan && <p className="text-xs font-semibold text-orange-700">{t("replacesExisting")}</p>}
              <button
                type="button"
                onClick={addToCart}
                className="w-full rounded-full bg-forest-700 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-forest-800"
              >
                {tripPlan ? t("buttons.updateCart") : t("buttons.addToCart")}
              </button>
            </div>
          ))}

        {showStepError && currentProblem && (
          <p role="alert" className="mt-4 rounded-lg bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-800">
            {currentProblem}
          </p>
        )}

        {/* Once the plan is in the cart the wizard is done -- no Back/Next to step into a finished flow. */}
        {!added && (
          <div className="mt-8 flex justify-between">
            <button
              type="button"
              onClick={goBack}
              disabled={step === 0}
              className="rounded-full border-2 border-forest-700 px-5 py-2 text-sm font-bold text-forest-700 disabled:opacity-40"
            >
              {t("buttons.back")}
            </button>
            {step < totalSteps - 1 && (
              <button
                type="button"
                onClick={goNext}
                aria-disabled={Boolean(currentProblem)}
                className={`rounded-full px-5 py-2 text-sm font-bold text-white ${
                  currentProblem ? "bg-orange-300" : "bg-orange-500 hover:bg-orange-600"
                }`}
              >
                {t("buttons.next")}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Desktop: the calculator sits beside the form and follows the scroll. */}
      <div className="hidden lg:sticky lg:top-24 lg:block lg:self-start">{calculator}</div>

      {/* Phones/tablets: the running total is pinned to the bottom of the screen at every step; tapping it opens the full breakdown. */}
      <div className="fixed inset-x-0 bottom-0 z-40 lg:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        {sheetOpen && (
          <div className="max-h-[70vh] overflow-y-auto border-t border-cream-300 bg-cream-50 p-4 shadow-card-lg">
            {calculator}
          </div>
        )}
        <button
          type="button"
          onClick={() => setSheetOpen((o) => !o)}
          aria-expanded={sheetOpen}
          className="flex w-full items-center justify-between gap-3 border-t border-cream-300 bg-white px-5 py-3 text-left shadow-card-lg"
        >
          <span className="flex items-center gap-2">
            <span className="badge-estimated">{tc("estimated")}</span>
            <span className="font-display text-lg font-bold text-orange-600">
              {tc("currency")} {breakdown.total.toLocaleString()}
            </span>
          </span>
          <span className="text-sm font-semibold text-forest-700">
            {sheetOpen ? t("hideBreakdown") : t("showBreakdown")}
          </span>
        </button>
      </div>
    </div>
  );
}
