"use client";

import { useTranslations } from "next-intl";
import { useTripCart } from "@/lib/tripCart/TripCartContext";
import CartItemRow from "./CartItemRow";
import TripPlanRow from "./TripPlanRow";

interface CartGroupedListProps {
  /** "sm" is the navbar drawer's tighter spacing; "lg" is the /trip-cart page. */
  size?: "sm" | "lg";
  /** Called when a link inside navigates away (the drawer closes itself). */
  onNavigate?: () => void;
}

/** Cart contents grouped into Custom Trip Plan / Destinations / Packages / Hotels & Rooms — shared by the navbar drawer and the /trip-cart page. */
export default function CartGroupedList({ size = "sm", onNavigate }: CartGroupedListProps) {
  const t = useTranslations("cart");
  const { items, removeItem, updateHotelRoom, tripPlan } = useTripCart();

  const destinations = items.filter((i) => i.type === "destination");
  const packages = items.filter((i) => i.type === "package");
  const hotelRooms = items.filter((i) => i.type === "hotelRoom");

  const headingClass =
    size === "lg"
      ? "mb-3 font-display text-lg font-bold text-forest-900"
      : "mb-2 text-xs font-semibold uppercase tracking-wide text-forest-500";

  return (
    <div className="space-y-6">
      {tripPlan && (
        <div>
          <h3 className={headingClass}>{t("tripPlan")}</h3>
          <TripPlanRow plan={tripPlan} onRemove={() => removeItem(tripPlan.cartItemId)} onNavigate={onNavigate} />
        </div>
      )}

      {destinations.length > 0 && (
        <div>
          <h3 className={headingClass}>{t("destinations")}</h3>
          <div className="space-y-3">
            {destinations.map((item) => (
              <CartItemRow key={item.cartItemId} item={item} onRemove={() => removeItem(item.cartItemId)} />
            ))}
          </div>
        </div>
      )}

      {packages.length > 0 && (
        <div>
          <h3 className={headingClass}>{t("packages")}</h3>
          <div className="space-y-3">
            {packages.map((item) => (
              <CartItemRow key={item.cartItemId} item={item} onRemove={() => removeItem(item.cartItemId)} />
            ))}
          </div>
        </div>
      )}

      {hotelRooms.length > 0 && (
        <div>
          <h3 className={headingClass}>{t("hotelRooms")}</h3>
          <div className="space-y-3">
            {hotelRooms.map((item) => (
              <CartItemRow
                key={item.cartItemId}
                item={item}
                onRemove={() => removeItem(item.cartItemId)}
                onNightsChange={(nights) => updateHotelRoom(item.cartItemId, { nights })}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
