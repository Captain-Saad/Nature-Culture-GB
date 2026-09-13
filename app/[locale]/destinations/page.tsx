import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getDestinations } from "@/lib/mock-data";
import DestinationsClient from "@/components/destinations/DestinationsClient";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Destinations in Gilgit-Baltistan",
    description:
      "Browse destinations across all ten regions of Gilgit-Baltistan — Skardu, Hunza, Gilgit, Astore, Ghizer, Nagar, Diamer, Ghanche, Shigar and Kharmang.",
  };
}

export default async function DestinationsPage() {
  const t = await getTranslations("destinations");
  const destinations = await getDestinations();

  return (
    <div className="container-content py-12">
      <header className="mb-10 text-center">
        <h1 className="font-display text-3xl font-bold text-forest-900 sm:text-4xl">
          {t("pageTitle")}
        </h1>
        <p className="mt-2 text-forest-600">{t("pageSubtitle")}</p>
      </header>

      <DestinationsClient destinations={destinations} />
    </div>
  );
}
