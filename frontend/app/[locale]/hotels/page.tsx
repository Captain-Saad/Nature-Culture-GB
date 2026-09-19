import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getHotels } from "@/lib/api";
import HotelsClient from "@/components/hotels/HotelsClient";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Hotels in Gilgit-Baltistan",
    description: "Find hotels across Skardu, Hunza, Gilgit and more — from budget stays to luxury resorts.",
  };
}

export default async function HotelsPage() {
  const t = await getTranslations("hotels");
  const hotels = await getHotels();

  return (
    <div className="container-content py-12">
      <header className="mb-10 text-center">
        <h1 className="font-display text-3xl font-bold text-forest-900 sm:text-4xl">{t("pageTitle")}</h1>
        <p className="mt-2 text-forest-600">{t("pageSubtitle")}</p>
      </header>

      <HotelsClient hotels={hotels} />
    </div>
  );
}
