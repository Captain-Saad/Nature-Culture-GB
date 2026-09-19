import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { packages, getPackageBySlug } from "@/lib/mock-data";
import LineSidebar from "@/components/shared/LineSidebar";
import EstimatedBadge from "@/components/shared/EstimatedBadge";
import ImageGallery from "@/components/shared/ImageGallery";
import GlareHover from "@/components/shared/GlareHover";
import { Link } from "@/i18n/navigation";

export function generateStaticParams() {
  return packages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const pkg = await getPackageBySlug(slug);
  if (!pkg) return {};

  return {
    title: pkg.title,
    description: pkg.highlights.join(", "),
    openGraph: { title: pkg.title, images: pkg.images.slice(0, 1) },
  };
}

export default async function PackageDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pkg = await getPackageBySlug(slug);
  if (!pkg) notFound();

  const t = await getTranslations("packages.detail");
  const tc = await getTranslations("common");

  const sections = [
    { id: "overview", label: t("overview") },
    { id: "itinerary", label: t("itinerary") },
    { id: "included", label: t("included") },
    { id: "gallery", label: tc("gallery") },
  ];

  return (
    <div className="container-content py-12">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">{pkg.category}</p>
        <h1 className="mt-1 font-display text-3xl font-bold text-forest-900 sm:text-4xl">{pkg.title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <span className="text-sm font-semibold text-forest-700">
            {pkg.durationDays} {tc("days")}
          </span>
          <span className="font-display text-xl font-bold text-forest-900">
            PKR {pkg.estimatedPricePKR.min.toLocaleString()}–{pkg.estimatedPricePKR.max.toLocaleString()}
          </span>
          <EstimatedBadge lastUpdated={pkg.lastUpdated} />
        </div>
      </header>

      <div className="mb-10 relative aspect-[16/7] w-full overflow-hidden rounded-card">
        <Image src={pkg.images[0]} alt={pkg.title} fill sizes="100vw" priority className="object-cover" />
      </div>

      <div className="flex gap-10">
        <LineSidebar sections={sections} />

        <div className="min-w-0 flex-1 space-y-14">
          <section id="overview">
            <h2 className="font-display text-xl font-bold text-forest-900">{tc("highlights")}</h2>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {pkg.highlights.map((h) => (
                <li key={h} className="flex items-start gap-2 text-sm text-forest-700">
                  <span aria-hidden className="mt-1 text-orange-500">●</span>
                  {h}
                </li>
              ))}
            </ul>
          </section>

          <section id="itinerary">
            <h2 className="font-display text-xl font-bold text-forest-900">{t("itinerary")}</h2>
            <ol className="mt-6 space-y-6 border-l-2 border-cream-300 pl-6 rtl:border-l-0 rtl:border-r-2 rtl:pl-0 rtl:pr-6">
              {pkg.itinerary.map((day) => (
                <li key={day.day} className="relative">
                  <span className="absolute -left-[2.05rem] top-0 flex h-7 w-7 items-center justify-center rounded-full bg-forest-700 text-xs font-bold text-white rtl:-left-auto rtl:-right-[2.05rem]">
                    {day.day}
                  </span>
                  <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">
                    {t("day", { number: day.day })}
                  </p>
                  <h3 className="mt-1 font-display text-lg font-bold text-forest-900">{day.title}</h3>
                  <p className="mt-1 text-sm text-forest-700">{day.description}</p>
                  {day.overnightAt && (
                    <p className="mt-1 text-xs text-forest-500">Overnight: {day.overnightAt}</p>
                  )}
                </li>
              ))}
            </ol>
          </section>

          <section id="included">
            <h2 className="font-display text-xl font-bold text-forest-900">{t("included")}</h2>
            <div className="mt-4 grid gap-6 sm:grid-cols-2">
              <div>
                <p className="text-sm font-semibold text-forest-800">Included</p>
                <ul className="mt-2 space-y-1 text-sm text-forest-700">
                  {pkg.included.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span aria-hidden className="text-forest-600">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm font-semibold text-forest-800">Excluded</p>
                <ul className="mt-2 space-y-1 text-sm text-forest-700">
                  {pkg.excluded.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span aria-hidden className="text-orange-600">✕</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section id="gallery">
            <h2 className="font-display text-xl font-bold text-forest-900">{tc("gallery")}</h2>
            <div className="mt-4">
              <ImageGallery images={pkg.images} videos={pkg.videos} alt={pkg.title} />
            </div>
          </section>

          <GlareHover className="inline-block rounded-full">
            <Link
              href="/plan-my-trip"
              className="block rounded-full bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-card transition-colors hover:bg-orange-600"
            >
              {tc("bookNow")}
            </Link>
          </GlareHover>
        </div>
      </div>
    </div>
  );
}
