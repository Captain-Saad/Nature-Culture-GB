"use client";

import { useTranslations } from "next-intl";
import { useTripCart } from "@/lib/tripCart/TripCartContext";
import type { CartDestinationItem, CartPackageItem } from "@/lib/tripCart/types";
import GlareHover from "@/components/shared/GlareHover";

type AddToTripButtonProps =
  | { kind: "destination"; item: Omit<CartDestinationItem, "cartItemId" | "type"> }
  | { kind: "package"; item: Omit<CartPackageItem, "cartItemId" | "type"> };

export default function AddToTripButton(props: AddToTripButtonProps) {
  const t = useTranslations("common");
  const { hasDestination, hasPackage, addDestination, addPackage, removeItem } = useTripCart();

  const added = props.kind === "destination" ? hasDestination(props.item.id) : hasPackage(props.item.id);

  function toggle() {
    if (added) {
      removeItem(`${props.kind}:${props.item.id}`);
      return;
    }
    if (props.kind === "destination") {
      addDestination(props.item);
    } else {
      addPackage(props.item);
    }
  }

  return (
    <GlareHover className="inline-block rounded-full">
      <button
        type="button"
        onClick={toggle}
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
