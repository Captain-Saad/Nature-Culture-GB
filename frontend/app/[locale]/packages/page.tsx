import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getPackages } from "@/lib/api";
import PackageCard from "@/components/packages/PackageCard";
import ScrollReveal from "@/components/shared/ScrollReveal";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Tour Packages",
    description: "Curated multi-day tour packages across Gilgit-Baltistan for every kind of traveler.",
  };
}

export default async function PackagesPage() {
  const t = await getTranslations("packages");
  const packages = await getPackages();

  return (
    <div className="container-content py-12">
      <header className="mb-10 text-center">
        <h1 className="font-display text-3xl font-bold text-forest-900 sm:text-4xl">{t("pageTitle")}</h1>
        <p className="mt-2 text-forest-600">{t("pageSubtitle")}</p>
      </header>

      <ScrollReveal className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {packages.map((p) => (
          <PackageCard key={p.id} pkg={p} />
        ))}
      </ScrollReveal>
    </div>
  );
}
