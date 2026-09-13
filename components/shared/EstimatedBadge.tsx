import { useTranslations } from "next-intl";

export default function EstimatedBadge({ lastUpdated }: { lastUpdated?: string }) {
  const t = useTranslations("common");
  return (
    <span className="badge-estimated" title={lastUpdated ? `${t("lastUpdated")}: ${lastUpdated}` : undefined}>
      {t("estimated")}
    </span>
  );
}
