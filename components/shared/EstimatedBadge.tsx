import { useTranslations } from "next-intl";

export default function EstimatedBadge({ lastUpdated }: { lastUpdated?: string }) {
  const t = useTranslations("common");
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <span className="badge-estimated">{t("estimated")}</span>
      {lastUpdated && (
        <span className="text-[11px] text-forest-500">
          {t("lastUpdated")}: {lastUpdated}
        </span>
      )}
    </span>
  );
}
