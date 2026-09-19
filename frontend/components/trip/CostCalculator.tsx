"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { TripState } from "@/lib/trip-types";
import { Destination } from "@/lib/types";
import { pricingTable, ActivityKey } from "@/lib/pricing";
import EstimatedBadge from "@/components/shared/EstimatedBadge";

interface CostCalculatorProps {
  trip: TripState;
  destinations: Destination[];
}

/**
 * Full Phase 2 logic: hotel rooms derive from traveler count, transport
 * splits into per-seat (Shared) vs per-vehicle-with-capacity (Private,
 * 4x4 Jeep), activities are priced individually rather than a flat fee,
 * and entry fees are driven by the actual selected destinations — all
 * against the pricing config, recalculating on every trip change.
 */
export default function CostCalculator({ trip, destinations }: CostCalculatorProps) {
  const t = useTranslations("tripBuilder.summary");
  const tc = useTranslations("common");

  const selectedDestinations = useMemo(
    () => destinations.filter((d) => trip.destinationIds.includes(d.id)),
    [destinations, trip.destinationIds]
  );

  const breakdown = useMemo(() => {
    const nights = Math.max(trip.days - 1, 0);
    const rooms = Math.max(Math.ceil(trip.travelers / pricingTable.travelersPerRoom), 1);
    const hotel = pricingTable.hotelPerNightPKR[trip.hotelCategory] * nights * rooms;

    const transportRate = pricingTable.transportPerDayPKR[trip.transport];
    const capacity =
      pricingTable.transportVehicleCapacity[
        trip.transport as keyof typeof pricingTable.transportVehicleCapacity
      ];
    const vehicles = capacity ? Math.max(Math.ceil(trip.travelers / capacity), 1) : trip.travelers;
    const transport = capacity
      ? transportRate * trip.days * vehicles
      : transportRate * trip.days * trip.travelers;

    const food = pricingTable.foodPerDayPersonPKR * trip.days * trip.travelers;

    const activitiesCost =
      trip.activities.reduce(
        (sum, activity) => sum + (pricingTable.activityCostPKR[activity as ActivityKey] ?? 0),
        0
      ) * trip.travelers;

    const entryFees = pricingTable.entryFeePerAttractionPKR * selectedDestinations.length * trip.travelers;

    const total = hotel + transport + food + activitiesCost + entryFees;
    const budgetDiff = trip.budgetPKR - total;

    return { nights, rooms, transport, vehicles, hotel, food, activitiesCost, entryFees, total, budgetDiff };
  }, [trip, selectedDestinations]);

  const rows: { key: string; value: number; detail?: string }[] = [
    {
      key: "hotel",
      value: breakdown.hotel,
      detail: t("hotelDetail", { nights: breakdown.nights, rooms: breakdown.rooms }),
    },
    {
      key: "transport",
      value: breakdown.transport,
      detail:
        trip.transport === "Shared"
          ? t("transportDetailShared", { travelers: trip.travelers, days: trip.days })
          : t("transportDetail", { vehicles: breakdown.vehicles, days: trip.days }),
    },
    { key: "food", value: breakdown.food },
    { key: "activitiesCost", value: breakdown.activitiesCost },
    { key: "entryFees", value: breakdown.entryFees },
  ];

  const overBudget = breakdown.budgetDiff < 0;

  return (
    <div className="rounded-card bg-white p-6 shadow-card">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold text-forest-900">{t("title")}</h3>
        <EstimatedBadge lastUpdated={pricingTable.lastUpdated} />
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
          ? t("overBudget", { amount: Math.abs(breakdown.budgetDiff).toLocaleString() })
          : t("withinBudget", { amount: breakdown.budgetDiff.toLocaleString() })}
      </div>
    </div>
  );
}
