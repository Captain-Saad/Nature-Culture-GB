import { useLocale, useTranslations } from "next-intl";
import { Flight } from "@/lib/types";

const STATUS_STYLES: Record<string, string> = {
  Scheduled: "bg-forest-100 text-forest-800",
  Delayed: "bg-orange-200 text-orange-800",
  Cancelled: "bg-red-100 text-red-700",
  Arrived: "bg-navy-100 text-navy-800",
  Departed: "bg-navy-100 text-navy-800",
};

const INTL_LOCALES: Record<string, string> = {
  en: "en-US",
  ur: "ur-PK",
};

export default function FlightCard({ flight }: { flight: Flight }) {
  const t = useTranslations("flights");
  const locale = useLocale();

  const updatedLabel = flight.lastUpdated
    ? new Intl.DateTimeFormat(INTL_LOCALES[locale] ?? locale, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(flight.lastUpdated))
    : null;

  // These are domestic Pakistani flights -- always show Pakistan time
  // regardless of the viewer's own timezone, same as an airport board would.
  const departureIso = flight.estimatedDeparture ?? flight.scheduledDeparture;
  const departureLabel = departureIso
    ? new Intl.DateTimeFormat(INTL_LOCALES[locale] ?? locale, {
        timeZone: "Asia/Karachi",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(departureIso))
    : null;

  return (
    <article className="flex flex-col gap-3 rounded-card bg-white p-5 shadow-card sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-forest-600">
          {flight.airline}
          {flight.flightNumber && (
            <>
              {" · "}
              {t("flightNo")} {flight.flightNumber}
            </>
          )}
        </p>
        <p className="mt-1 font-display text-lg font-bold text-forest-900">
          {flight.origin} → {flight.destination}
        </p>
        {departureLabel && (
          <p className="mt-1 text-xs text-forest-500">
            {t("departureLabel")}: {departureLabel} (PKT)
          </p>
        )}
      </div>

      <div className="flex flex-col items-start gap-1 sm:items-end">
        {flight.available && flight.status ? (
          <span className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-bold ${STATUS_STYLES[flight.status]}`}>
            {t(flight.status.toLowerCase())}
          </span>
        ) : (
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-cream-300 px-3 py-1 text-xs font-bold text-forest-700">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-forest-400" />
            {t("unavailableBadge")}
          </span>
        )}
        {updatedLabel && (
          <span className="text-[11px] text-forest-500">
            {t("updated")}: {updatedLabel}
          </span>
        )}
      </div>
    </article>
  );
}
