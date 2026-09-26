import { useTranslations } from "next-intl";

/** Shown by list pages when the admin hasn't published anything there yet. */
export default function EmptyState({ message }: { message?: string }) {
  const t = useTranslations("common");
  return (
    <p className="rounded-card bg-white p-10 text-center text-forest-500 shadow-card">
      {message ?? t("nothingYet")}
    </p>
  );
}
