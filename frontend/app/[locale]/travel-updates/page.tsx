import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getSituationReports } from "@/lib/api";
import SituationReportCard from "@/components/situation/SituationReportCard";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Travel Updates",
    description: "Road and route situation reports across Gilgit-Baltistan.",
  };
}

export default async function TravelUpdatesPage() {
  const t = await getTranslations("travelUpdates");
  const reports = await getSituationReports();

  return (
    <div className="container-content py-12">
      <header className="mb-10 text-center">
        <h1 className="font-display text-3xl font-bold text-forest-900 sm:text-4xl">{t("pageTitle")}</h1>
        <p className="mt-2 text-forest-600">{t("pageSubtitle")}</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {reports.map((r) => (
          <SituationReportCard key={r.id} report={r} />
        ))}
      </div>
    </div>
  );
}
