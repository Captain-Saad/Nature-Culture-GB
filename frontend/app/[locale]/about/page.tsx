import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import AboutContent from "@/components/about/AboutContent";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "About Us",
    description: "The story, mission and people behind Nature & Culture GB.",
  };
}

export default async function AboutPage() {
  const t = await getTranslations("about");

  return (
    <div className="container-content py-12">
      <header className="mb-10 text-center">
        <h1 className="font-display text-3xl font-bold text-forest-900 sm:text-4xl">{t("pageTitle")}</h1>
        <p className="mt-2 text-forest-600">{t("pageSubtitle")}</p>
      </header>

      <AboutContent />
    </div>
  );
}
