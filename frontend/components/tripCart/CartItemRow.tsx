"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { CartItem } from "@/lib/tripCart/types";
import { resolveMediaUrl } from "@/lib/utils/media";
import { placeholderImage } from "@/lib/utils/image";

function ItemThumb({ image, seed }: { image: string | null; seed: string }) {
  const fallback = placeholderImage(seed, 200, 200);
  return (
    // eslint-disable-next-line @next/next/no-img-element -- small cart thumbnail, arbitrary stored/placeholder URLs
    <img
      src={image ? resolveMediaUrl(image) : fallback}
      alt=""
      className="h-16 w-16 shrink-0 rounded-lg object-cover"
      // A stored reference can 404 (e.g. the file was removed on the
      // backend after this item was added to a cart that persists
      // across sessions) -- fall back rather than show a broken image.
      onError={(e) => {
        if (e.currentTarget.src !== fallback) e.currentTarget.src = fallback;
      }}
    />
  );
}

interface CartItemRowProps {
  item: CartItem;
  onRemove: () => void;
  onNightsChange?: (nights: number) => void;
}

/** One cart entry — used by both the navbar drawer and the /my-trip page, so editing nights behaves identically in both places. */
export default function CartItemRow({ item, onRemove, onNightsChange }: CartItemRowProps) {
  const t = useTranslations("cart");
  const tc = useTranslations("common");

  const href =
    item.type === "destination"
      ? `/destinations/${item.slug}`
      : item.type === "package"
        ? `/packages/${item.slug}`
        : `/hotels/${item.hotelSlug}`;

  return (
    <div className="flex gap-3 rounded-card bg-white p-3 shadow-card">
      <Link href={href}>
        <ItemThumb image={item.image} seed={item.type === "hotelRoom" ? item.hotelId : item.id} />
      </Link>

      <div className="min-w-0 flex-1">
        <Link href={href} className="block truncate font-semibold text-forest-900 hover:text-orange-600">
          {item.type === "hotelRoom" ? item.hotelName : item.name}
        </Link>

        {item.type === "destination" && (
          <>
            <p className="text-xs text-forest-500">{item.region}</p>
            {item.estimatedPricePKR && (
              <p className="mt-1 text-sm font-semibold text-forest-700">
                {tc("currency")} {item.estimatedPricePKR.min.toLocaleString()}–{item.estimatedPricePKR.max.toLocaleString()}
              </p>
            )}
          </>
        )}

        {item.type === "package" && (
          <>
            <p className="text-xs text-forest-500">
              {item.durationDays} {tc("days")}
            </p>
            {item.estimatedPricePKR && (
              <p className="mt-1 text-sm font-semibold text-forest-700">
                {tc("currency")} {item.estimatedPricePKR.min.toLocaleString()}–{item.estimatedPricePKR.max.toLocaleString()}
              </p>
            )}
          </>
        )}

        {item.type === "hotelRoom" && (
          <>
            <p className="truncate text-xs text-forest-500">{item.roomType}</p>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-forest-600">
              <span>
                {t("checkIn")}: {item.checkIn}
              </span>
              <span className="flex items-center gap-1">
                {t("nights")}:
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={item.nights}
                  onChange={(e) => onNightsChange?.(Math.max(1, Number(e.target.value)))}
                  className="w-12 rounded border border-cream-300 px-1 py-0.5 text-center text-xs"
                  aria-label={t("nights")}
                />
              </span>
              <span>
                {t("guests")}: {item.guests}
              </span>
            </div>
            {item.estimatedPricePKR && (
              <p className="mt-1 text-sm font-semibold text-forest-700">
                {tc("currency")} {(item.estimatedPricePKR * item.nights).toLocaleString()}
                <span className="text-xs font-normal text-forest-500">
                  {" "}
                  ({item.nights} × {item.estimatedPricePKR.toLocaleString()})
                </span>
              </p>
            )}
          </>
        )}
      </div>

      <button
        type="button"
        onClick={onRemove}
        aria-label={t("remove")}
        className="shrink-0 self-start rounded-full p-1.5 text-forest-400 hover:bg-cream-100 hover:text-orange-600"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
