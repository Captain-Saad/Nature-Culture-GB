"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { TripState } from "@/lib/trip-types";
import { pricingTable } from "@/lib/mock-data/pricing";
import EstimatedBadge from "@/components/shared/EstimatedBadge";

/**
 * Phase 1: straightforward per-day/per-traveler multiplication against
 * the mock pricing table so the Trip Builder already feels "live".
 * Phase 2 will deepen this — factoring in the specific selected
 * destinations' approxCostPKR, per-activity entry fees, etc. — without
 * changing this component's props contract.
 */
export default function CostCalculator({ trip }: { trip: TripState }) {
  const t = useTranslations("tripBuilder.summary");
  const tc = useTranslations("common");

  const breakdown = useMemo(() => {
    const nights = Math.max(trip.days - 1, 0);
    const hotel = pricingTable.hotelPerNightPKR[trip.hotelCategory] * nights * Math.ceil(trip.travelers / 2);
    const transport = pricingTable.transportPerDayPKR[trip.transport] * trip.days;
    const food = pricingTable.foodPerDayPersonPKR * trip.days * trip.travelers;
    const activitiesCost = pricingTable.activityBaseCostPKR * Math.max(trip.activities.length, 0) * trip.travelers;
    const entryFees =
      pricingTable.entryFeePerAttractionPKR * Math.max(trip.destinationIds.length, 0) * trip.travelers;
    const total = hotel + transport + food + activitiesCost + entryFees;

    return { hotel, transport, food, activitiesCost, entryFees, total };
  }, [trip]);

  const rows: { key: string; value: number }[] = [
    { key: "hotel", value: breakdown.hotel },
    { key: "transport", value: breakdown.transport },
    { key: "food", value: breakdown.food },
    { key: "activitiesCost", value: breakdown.activitiesCost },
    { key: "entryFees", value: breakdown.entryFees },
  ];

  return (
    <div className="rounded-card bg-white p-6 shadow-card">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold text-forest-900">{t("title")}</h3>
        <EstimatedBadge lastUpdated={pricingTable.lastUpdated} />
      </div>

      <p className="mt-1 text-xs uppercase tracking-wide text-forest-500">{t("breakdown")}</p>

      <dl className="mt-4 divide-y divide-cream-200">
        {rows.map((row) => (
          <div key={row.key} className="flex items-center justify-between py-2 text-sm">
            <dt className="text-forest-700">{t(row.key)}</dt>
            <dd className="font-semibold text-forest-900">
              {tc("currency")} {row.value.toLocaleString()}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 flex items-center justify-between border-t-2 border-forest-800 pt-4">
        <span className="font-display font-bold text-forest-900">{t("total")}</span>
        <span className="font-display text-2xl font-bold text-orange-600">
          {tc("currency")} {breakdown.total.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
