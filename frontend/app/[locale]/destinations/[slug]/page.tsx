import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import {
  getDestinations,
  getDestinationBySlug,
  getHotelsByIds,
  getDestinationsByIds,
} from "@/lib/api";
import { resolveMediaUrl } from "@/lib/utils/media";
import ImageGallery from "@/components/shared/ImageGallery";
import LineSidebar from "@/components/shared/LineSidebar";
import MapSection from "@/components/shared/MapSection";
import EstimatedBadge from "@/components/shared/EstimatedBadge";
import HotelCard from "@/components/hotels/HotelCard";
import DestinationCard from "@/components/destinations/DestinationCard";
import AddToTripButton from "@/components/shared/AddToTripButton";

export async function generateStaticParams() {
  const destinations = await getDestinations();
  return destinations.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const destination = await getDestinationBySlug(slug);
  if (!destination) return {};

  return {
    title: destination.name,
    description: destination.shortDescription,
    openGraph: {
      title: destination.name,
      description: destination.shortDescription,
      images: destination.images.slice(0, 1).map(resolveMediaUrl),
    },
  };
}

export default async function DestinationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const destination = await getDestinationBySlug(slug);
  if (!destination) notFound();

  const t = await getTranslations("destinations.detail");
  const tc = await getTranslations("common");

  const [nearbyHotels, nearbyAttractions] = await Promise.all([
    getHotelsByIds(destination.nearbyHotelIds),
    getDestinationsByIds(destination.nearbyAttractionIds),
  ]);

  const sections = [
    { id: "overview", label: t("overview") },
    { id: "activities", label: t("activities") },
    { id: "gallery", label: t("gallery") },
    { id: "map", label: t("map") },
    ...(nearbyHotels.length || nearbyAttractions.length ? [{ id: "nearby", label: t("nearby") }] : []),
  ];

  return (
    <div className="container-content py-12">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
          {destination.region}
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold text-forest-900 sm:text-4xl">
          {destination.name}
        </h1>
        <p className="mt-2 max-w-2xl text-forest-600">{destination.shortDescription}</p>
        <div className="mt-5">
          <AddToTripButton
            kind="destination"
            item={{
              id: destination.id,
              slug: destination.slug,
              name: destination.name,
              image: destination.images[0] ?? null,
              region: destination.region,
              estimatedPricePKR: destination.approxCostPKR,
            }}
          />
        </div>
      </header>

      <div className="flex gap-10">
        <LineSidebar sections={sections} />

        <div className="min-w-0 flex-1 space-y-14">
          <section id="overview">
            <h2 className="font-display text-xl font-bold text-forest-900">{t("overview")}</h2>
            <p className="mt-3 leading-relaxed text-forest-700">{destination.description}</p>

            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-card bg-cream-100 p-4">
                <dt className="text-xs font-semibold uppercase tracking-wide text-forest-500">
                  {tc("bestTimeToVisit")}
                </dt>
                <dd className="mt-1 font-semibold text-forest-900">{destination.bestTimeToVisit}</dd>
              </div>
              <div className="rounded-card bg-cream-100 p-4">
                <dt className="text-xs font-semibold uppercase tracking-wide text-forest-500">
                  {tc("duration")}
                </dt>
                <dd className="mt-1 font-semibold text-forest-900">{destination.estimatedDuration}</dd>
              </div>
              <div className="rounded-card bg-cream-100 p-4">
                <dt className="text-xs font-semibold uppercase tracking-wide text-forest-500">
                  {tc("difficulty")}
                </dt>
                <dd className="mt-1 font-semibold text-forest-900">{destination.difficulty}</dd>
              </div>
              <div className="rounded-card bg-cream-100 p-4">
                <dt className="text-xs font-semibold uppercase tracking-wide text-forest-500">
                  {tc("costEstimate")}
                </dt>
                <dd className="mt-1 font-semibold text-forest-900">
                  PKR {destination.approxCostPKR.min.toLocaleString()}–{destination.approxCostPKR.max.toLocaleString()}
                </dd>
                <div className="mt-1">
                  <EstimatedBadge lastUpdated={destination.lastUpdated} />
                </div>
              </div>
            </dl>
          </section>

          <section id="activities">
            <h2 className="font-display text-xl font-bold text-forest-900">{t("activities")}</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {destination.activities.map((activity) => (
                <span
                  key={activity}
                  className="rounded-full bg-forest-100 px-3 py-1.5 text-sm font-medium text-forest-800"
                >
                  {activity}
                </span>
              ))}
            </div>
          </section>

          <section id="gallery">
            <h2 className="font-display text-xl font-bold text-forest-900">{t("gallery")}</h2>
            <div className="mt-4">
              <ImageGallery
                images={destination.images}
                videos={destination.videos}
                alt={destination.name}
              />
            </div>
          </section>

          <section id="map">
            <MapSection
              pins={[{ id: destination.id, name: destination.name, lat: destination.lat, lng: destination.lng }]}
              centerLat={destination.lat}
              centerLng={destination.lng}
            />
          </section>

          {(nearbyHotels.length > 0 || nearbyAttractions.length > 0) && (
            <section id="nearby">
              <h2 className="font-display text-xl font-bold text-forest-900">{t("nearby")}</h2>

              {nearbyHotels.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-forest-500">
                    {tc("nearbyHotels")}
                  </h3>
                  <div className="mt-3 grid gap-6 sm:grid-cols-2">
                    {nearbyHotels.map((h) => (
                      <HotelCard key={h.id} hotel={h} />
                    ))}
                  </div>
                </div>
              )}

              {nearbyAttractions.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-forest-500">
                    {tc("nearbyAttractions")}
                  </h3>
                  <div className="mt-3 grid gap-6 sm:grid-cols-2">
                    {nearbyAttractions.map((d) => (
                      <DestinationCard key={d.id} destination={d} />
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
