import { useTranslations } from "next-intl";
import { SituationReport } from "@/lib/types";
import { resolveMediaUrl } from "@/lib/utils/media";

const STATUS_STYLES: Record<string, string> = {
  Open: "bg-forest-100 text-forest-800",
  Closed: "bg-red-100 text-red-700",
  Restricted: "bg-orange-200 text-orange-800",
};

export default function SituationReportCard({ report }: { report: SituationReport }) {
  const t = useTranslations("travelUpdates");
  const tc = useTranslations("common");

  const date = new Date(report.timestamp);

  return (
    <article className="rounded-card bg-white p-5 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-forest-600">{report.region}</p>
          <h3 className="mt-1 font-display text-lg font-bold text-forest-900">{report.title}</h3>
        </div>
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${STATUS_STYLES[report.status]}`}>
          {t(report.status.toLowerCase())}
        </span>
      </div>
      <p className="mt-3 text-sm text-forest-700">{report.description}</p>

      {report.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- admin-supplied URL, may be off next.config's configured domains
        <img
          src={resolveMediaUrl(report.imageUrl)}
          alt=""
          className="mt-3 max-h-64 w-full rounded-lg object-cover"
        />
      )}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-cream-200 pt-3 text-xs text-forest-500">
        <span>{t("source")}: {report.source}</span>
        <span>{tc("lastUpdated")}: {date.toLocaleDateString()}</span>
      </div>
    </article>
  );
}
