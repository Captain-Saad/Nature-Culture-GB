import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getDestinations } from "@/lib/api";
import TripBuilderForm from "@/components/trip/TripBuilderForm";
import { getSiteSettings } from "@/lib/site-settings";
import { normalizeTripPricing } from "@/lib/pricing";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Plan My Trip",
    description: "Build a personalized Gilgit-Baltistan itinerary and see a live estimated cost breakdown.",
  };
}

export default async function PlanMyTripPage() {
  const t = await getTranslations("tripBuilder");
  const [destinations, settings] = await Promise.all([getDestinations(), getSiteSettings()]);

  return (
    <div className="container-content py-12">
      <header className="mb-10 text-center">
        <h1 className="font-display text-3xl font-bold text-forest-900 sm:text-4xl">{t("pageTitle")}</h1>
        <p className="mt-2 text-forest-600">{t("pageSubtitle")}</p>
      </header>

      <TripBuilderForm destinations={destinations} pricing={normalizeTripPricing(settings?.tripPricing)} />
    </div>
  );
}
