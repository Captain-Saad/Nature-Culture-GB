"use client";

import { useTranslations } from "next-intl";
import { useMyTrip } from "@/lib/hooks/useMyTrip";
import GlareHover from "@/components/shared/GlareHover";

export default function AddToTripButton({ destinationId }: { destinationId: string }) {
  const t = useTranslations("common");
  const { has, add, remove } = useMyTrip();
  const added = has(destinationId);

  return (
    <GlareHover className="inline-block rounded-full">
      <button
        type="button"
        onClick={() => (added ? remove(destinationId) : add(destinationId))}
        aria-pressed={added}
        className={`rounded-full px-5 py-2.5 text-sm font-bold shadow-card transition-colors ${
          added
            ? "bg-forest-700 text-white hover:bg-forest-800"
            : "bg-orange-500 text-white hover:bg-orange-600"
        }`}
      >
        {added ? `✓ ${t("addedToTrip")}` : t("addToMyTrip")}
      </button>
    </GlareHover>
  );
}
