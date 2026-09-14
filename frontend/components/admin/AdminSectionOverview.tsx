import { getTranslations } from "next-intl/server";

interface AdminSectionOverviewProps {
  /** Set when this section has no backend data model yet. */
  notImplemented?: boolean;
  /** Pre-formatted count label, e.g. "17 items" or "11 room types across 8 hotels". */
  countLabel?: string;
}

export default async function AdminSectionOverview({
  notImplemented = false,
  countLabel,
}: AdminSectionOverviewProps) {
  const t = await getTranslations("admin");

  if (notImplemented) {
    return (
      <div className="rounded-card border border-dashed border-cream-400 bg-cream-100 p-6 text-sm text-forest-600">
        {t("notImplemented")}
      </div>
    );
  }

  return (
    <div className="rounded-card bg-white p-6 shadow-card">
      <p className="font-display text-3xl font-bold text-forest-900">{countLabel ?? "—"}</p>
      <p className="mt-3 text-sm text-forest-500">{t("crudComingSoon")}</p>
    </div>
  );
}
