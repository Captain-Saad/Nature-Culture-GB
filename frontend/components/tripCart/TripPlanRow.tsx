"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { CartTripPlanItem } from "@/lib/tripCart/types";

interface TripPlanRowProps {
  plan: CartTripPlanItem;
  onRemove: () => void;
  /** Closes the drawer before navigating to the wizard. */
  onNavigate?: () => void;
}

/** The Plan My Trip custom itinerary as it appears in the trip cart (drawer and /trip-cart). */
export default function TripPlanRow({ plan, onRemove, onNavigate }: TripPlanRowProps) {
  const t = useTranslations("cart");
  const tc = useTranslations("common");

  return (
    <div className="rounded-card bg-white p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-forest-900">
            {plan.destinations.map((d) => d.name).join(", ")}
          </p>
          <p className="mt-0.5 text-xs text-forest-500">
            {t("planFrom", { city: plan.startingCity, days: plan.days, travelers: plan.travelers })}
          </p>
          <p className="text-xs text-forest-500">
            {t("planStay", { hotel: plan.hotelCategory, transport: plan.transport })}
            {plan.activities.length > 0 && ` · ${plan.activities.join(", ")}`}
          </p>
        </div>
        <span className="badge-estimated shrink-0">{tc("estimated")}</span>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-forest-700">
          {tc("currency")} {plan.estimate.total.toLocaleString()}
        </p>
        <div className="flex items-center gap-3 text-xs font-semibold">
          <Link href="/plan-my-trip" onClick={onNavigate} className="text-forest-700 hover:text-orange-600">
            {t("editPlan")}
          </Link>
          <button type="button" onClick={onRemove} className="text-forest-500 hover:text-orange-600">
            {t("remove")}
          </button>
        </div>
      </div>
    </div>
  );
}
