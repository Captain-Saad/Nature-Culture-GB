import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getFlights } from "@/lib/api";
import FlightCard from "@/components/flights/FlightCard";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Flights",
    description: "Islamabad to Skardu and Gilgit flight routes and status.",
  };
}

export default async function FlightsPage() {
  const t = await getTranslations("flights");
  const flights = await getFlights();

  return (
    <div className="container-content py-12">
      <header className="mb-10 text-center">
        <h1 className="font-display text-3xl font-bold text-forest-900 sm:text-4xl">{t("pageTitle")}</h1>
        <p className="mt-2 text-forest-600">{t("pageSubtitle")}</p>
      </header>

      <div className="mx-auto mb-8 max-w-2xl rounded-card border border-dashed border-cream-400 bg-cream-100 p-5 text-center">
        <p className="font-semibold text-forest-800">{t("freshnessTitle")}</p>
        <p className="mt-1 text-sm text-forest-600">{t("freshnessBody")}</p>
      </div>

      <div className="mx-auto max-w-2xl space-y-4">
        {flights.map((f) => (
          <FlightCard key={f.id} flight={f} />
        ))}
      </div>
    </div>
  );
}
