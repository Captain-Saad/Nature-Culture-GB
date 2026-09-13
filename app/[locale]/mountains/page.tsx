import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getMountains } from "@/lib/mock-data";
import MountainCard from "@/components/mountains/MountainCard";
import ScrollReveal from "@/components/shared/ScrollReveal";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Mountains of Gilgit-Baltistan",
    description:
      "K2, Nanga Parbat, Rakaposhi, Broad Peak, Gasherbrum and Masherbrum — the giants of the Karakoram and Himalaya in Gilgit-Baltistan.",
  };
}

export default async function MountainsPage() {
  const t = await getTranslations("mountains");
  const mountains = await getMountains();

  return (
    <div className="container-content py-12">
      <header className="mb-10 text-center">
        <h1 className="font-display text-3xl font-bold text-forest-900 sm:text-4xl">{t("pageTitle")}</h1>
        <p className="mt-2 text-forest-600">{t("pageSubtitle")}</p>
      </header>

      <ScrollReveal className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {mountains.map((m) => (
          <MountainCard key={m.id} mountain={m} />
        ))}
      </ScrollReveal>
    </div>
  );
}
