import { useTranslations } from "next-intl";
import { Flight } from "@/lib/types";

const STATUS_STYLES: Record<string, string> = {
  Scheduled: "bg-forest-100 text-forest-800",
  Delayed: "bg-orange-200 text-orange-800",
  Cancelled: "bg-red-100 text-red-700",
  Arrived: "bg-navy-100 text-navy-800",
};

export default function FlightCard({ flight }: { flight: Flight }) {
  const t = useTranslations("flights");

  return (
    <article className="flex flex-col gap-3 rounded-card bg-white p-5 shadow-card sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-forest-600">
          {flight.airline} · {t("flightNo")} {flight.flightNumber}
        </p>
        <p className="mt-1 font-display text-lg font-bold text-forest-900">
          {flight.origin} → {flight.destination}
        </p>
      </div>

      {flight.status ? (
        <span className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-bold ${STATUS_STYLES[flight.status]}`}>
          {t(flight.status.toLowerCase())}
        </span>
      ) : (
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-cream-300 px-3 py-1 text-xs font-bold text-forest-700">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-forest-400" />
          {t("unavailableTitle")}
        </span>
      )}
    </article>
  );
}
