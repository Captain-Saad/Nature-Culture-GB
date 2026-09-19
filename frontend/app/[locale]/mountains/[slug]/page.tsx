import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getMountains, getMountainBySlug } from "@/lib/api";
import { placeholderImage } from "@/lib/utils/image";
import { resolveMediaUrl } from "@/lib/utils/media";
import ImageGallery from "@/components/shared/ImageGallery";
import MapSection from "@/components/shared/MapSection";

export async function generateStaticParams() {
  const mountains = await getMountains();
  return mountains.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const mountain = await getMountainBySlug(slug);
  if (!mountain) return {};

  return {
    title: mountain.name,
    description: mountain.description,
    openGraph: {
      title: mountain.name,
      description: mountain.description,
      images: mountain.images.slice(0, 1).map(resolveMediaUrl),
    },
  };
}

export default async function MountainDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const mountain = await getMountainBySlug(slug);
  if (!mountain) notFound();

  const t = await getTranslations();

  return (
    <div className="container-content py-12">
      <div className="relative aspect-[16/7] w-full overflow-hidden rounded-card">
        <Image
          src={
            mountain.images[0]
              ? resolveMediaUrl(mountain.images[0])
              : placeholderImage(mountain.slug, 1600, 700)
          }
          alt={mountain.name}
          fill
          sizes="100vw"
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 via-navy-900/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 text-cream-50">
          <p className="text-sm font-semibold uppercase tracking-wide text-orange-300">{mountain.range}</p>
          <h1 className="font-display text-3xl font-bold sm:text-4xl">{mountain.name}</h1>
        </div>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px]">
        <div>
          <p className="leading-relaxed text-forest-700">{mountain.description}</p>

          <div className="mt-8">
            <h2 className="font-display text-xl font-bold text-forest-900">{t("common.gallery")}</h2>
            <div className="mt-4">
              <ImageGallery images={mountain.images} videos={mountain.videos} alt={mountain.name} />
            </div>
          </div>

          <div className="mt-10 h-80">
            <MapSection
              pins={[{ id: mountain.id, name: mountain.name, lat: mountain.lat, lng: mountain.lng }]}
              centerLat={mountain.lat}
              centerLng={mountain.lng}
              zoom={8}
              className="h-full"
            />
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-card bg-cream-100 p-5">
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-forest-500">{t("common.height")}</dt>
                <dd className="font-semibold text-forest-900">{mountain.heightMeters.toLocaleString()} m</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-forest-500">{t("mountains.elevation")} rank</dt>
                <dd className="font-semibold text-forest-900">#{mountain.worldRank} in the world</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-forest-500">{t("common.range")}</dt>
                <dd className="font-semibold text-forest-900">{mountain.range}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-forest-500">{t("common.difficulty")}</dt>
                <dd className="font-semibold text-forest-900">{mountain.difficulty}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-forest-500">Nearest town</dt>
                <dd className="font-semibold text-forest-900">{mountain.nearestTown}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}
