import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getDestinations } from "@/lib/mock-data";
import TripBuilderForm from "@/components/trip/TripBuilderForm";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Plan My Trip",
    description: "Build a personalized Gilgit-Baltistan itinerary and see a live estimated cost breakdown.",
  };
}

export default async function PlanMyTripPage() {
  const t = await getTranslations("tripBuilder");
  const destinations = await getDestinations();

  return (
    <div className="container-content py-12">
      <header className="mb-10 text-center">
        <h1 className="font-display text-3xl font-bold text-forest-900 sm:text-4xl">{t("pageTitle")}</h1>
        <p className="mt-2 text-forest-600">{t("pageSubtitle")}</p>
      </header>

      <TripBuilderForm destinations={destinations} />
    </div>
  );
}
