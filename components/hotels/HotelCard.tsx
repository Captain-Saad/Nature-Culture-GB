import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Hotel } from "@/lib/types";
import StarRating from "@/components/shared/StarRating";
import EstimatedBadge from "@/components/shared/EstimatedBadge";
import BookingButton from "@/components/shared/BookingButton";

const FACILITY_ICONS: Record<string, string> = {
  "Free Wi-Fi": "📶",
  Parking: "🅿️",
  Restaurant: "🍽️",
  "Room Service": "🛎️",
  "Lake View": "🏞️",
  Boating: "🚤",
  "Mountain View": "⛰️",
  "River View": "🌊",
  "Heritage Building": "🏛️",
  Garden: "🌳",
  "Glacier View": "🧊",
  Bonfire: "🔥",
  "Meals Included": "🍲",
};

export default function HotelCard({ hotel }: { hotel: Hotel }) {
  const t = useTranslations("common");

  return (
    <article className="flex flex-col overflow-hidden rounded-card bg-white shadow-card transition-shadow hover:shadow-card-lg">
      <div className="relative aspect-[4/3] w-full">
        <Image
          src={hotel.images[0]}
          alt={hotel.name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover"
        />
        <span className="absolute left-3 top-3 rounded-full bg-navy-800/80 px-2.5 py-1 text-[11px] font-semibold text-cream-50">
          {hotel.category}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-forest-600">{hotel.city}</p>
        <h3 className="mt-1 font-display text-lg font-bold text-forest-900">{hotel.name}</h3>
        <div className="mt-1">
          <StarRating rating={hotel.starRating} />
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {hotel.facilities.slice(0, 4).map((f) => (
            <span
              key={f}
              className="inline-flex items-center gap-1 rounded-full bg-cream-100 px-2 py-1 text-[11px] font-medium text-forest-700"
            >
              <span aria-hidden>{FACILITY_ICONS[f] ?? "✓"}</span>
              {f}
            </span>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-2">
          <span className="font-display text-xl font-bold text-forest-900">
            PKR {hotel.estimatedPricePKR.toLocaleString()}
          </span>
          <span className="text-sm text-forest-600">{t("perNight")}</span>
        </div>
        <div className="mt-1">
          <EstimatedBadge lastUpdated={hotel.lastUpdated} />
        </div>

        <div className="mt-4 flex gap-2">
          <Link
            href={`/hotels/${hotel.slug}`}
            className="flex-1 rounded-full border-2 border-forest-700 px-4 py-2 text-center text-sm font-bold text-forest-700 transition-colors hover:bg-forest-50"
          >
            {t("viewHotel")}
          </Link>
          <BookingButton label={t("book")} context={hotel.name} wrapperClassName="flex-1" />
        </div>
      </div>
    </article>
  );
}
