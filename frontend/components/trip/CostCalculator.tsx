"use client";

import { useTranslations } from "next-intl";
import type { TripState } from "@/lib/trip-types";
import type { Destination } from "@/lib/types";
import type { TripPlanBreakdown } from "@/lib/tripPlan/estimate";
import EstimatedBadge from "@/components/shared/EstimatedBadge";

interface CostCalculatorProps {
  trip: TripState;
  selectedDestinations: Destination[];
  /** From estimateTripPlan(); computed by the wizard so this and the mobile bar always agree. */
  breakdown: TripPlanBreakdown;
  className?: string;
}

/**
 * The live estimate beside the Plan My Trip wizard (and inside the mobile
 * estimate sheet). Purely presentational: it re-renders on every change to
 * the wizard's state because the wizard recomputes `breakdown` each render.
 */
export default function CostCalculator({ trip, selectedDestinations, breakdown, className = "" }: CostCalculatorProps) {
  const t = useTranslations("tripBuilder.summary");
  const tc = useTranslations("common");

  const rows: { key: string; value: number; detail?: string }[] = [
    {
      key: "hotel",
      value: breakdown.hotel,
      detail: t("hotelDetail", { nights: breakdown.nights, rooms: breakdown.rooms }),
    },
    {
      key: "transport",
      value: breakdown.transport,
      detail: breakdown.perVehicle
        ? t("transportDetail", { vehicles: breakdown.vehicles, days: trip.days })
        : t("transportDetailShared", { travelers: trip.travelers, days: trip.days }),
    },
    { key: "food", value: breakdown.food },
    { key: "activitiesCost", value: breakdown.activities },
    { key: "entryFees", value: breakdown.entryFees },
  ];

  const budgetDiff = trip.budgetPKR - breakdown.total;
  const overBudget = budgetDiff < 0;

  return (
    <div className={`rounded-card bg-white p-6 shadow-card ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-lg font-bold text-forest-900">{t("title")}</h3>
        <EstimatedBadge lastUpdated={breakdown.pricingAsOf} />
      </div>

      <p className="mt-1 text-xs uppercase tracking-wide text-forest-500">{t("breakdown")}</p>

      <dl className="mt-4 divide-y divide-cream-200">
        {rows.map((row) => (
          <div key={row.key} className="flex items-start justify-between gap-3 py-2 text-sm">
            <dt className="text-forest-700">
              {t(row.key)}
              {row.detail && <span className="block text-xs text-forest-400">{row.detail}</span>}
            </dt>
            <dd className="shrink-0 font-semibold text-forest-900">
              {tc("currency")} {row.value.toLocaleString()}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-3 space-y-2 border-t border-cream-200 pt-3 text-xs text-forest-500">
        <p>
          <span className="font-semibold text-forest-700">{t("includedDestinations")}: </span>
          {selectedDestinations.length > 0
            ? selectedDestinations.map((d) => d.name).join(", ")
            : t("noneSelectedYet")}
        </p>
        <p>
          <span className="font-semibold text-forest-700">{t("includedActivities")}: </span>
          {trip.activities.length > 0 ? trip.activities.join(", ") : t("noneSelectedYet")}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between border-t-2 border-forest-800 pt-4">
        <span className="font-display font-bold text-forest-900">{t("total")}</span>
        <span className="font-display text-2xl font-bold text-orange-600">
          {tc("currency")} {breakdown.total.toLocaleString()}
        </span>
      </div>

      <div
        className={`mt-3 rounded-lg px-3 py-2 text-center text-xs font-semibold ${
          overBudget ? "bg-orange-100 text-orange-800" : "bg-forest-100 text-forest-800"
        }`}
      >
        {t("yourBudget")}: {tc("currency")} {trip.budgetPKR.toLocaleString()} —{" "}
        {overBudget
          ? t("overBudget", { amount: Math.abs(budgetDiff).toLocaleString() })
          : t("withinBudget", { amount: budgetDiff.toLocaleString() })}
      </div>
    </div>
  );
}
