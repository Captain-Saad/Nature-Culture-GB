import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { hotels, getHotelBySlug } from "@/lib/mock-data";
import ImageGallery from "@/components/shared/ImageGallery";
import MapSection from "@/components/shared/MapSection";
import StarRating from "@/components/shared/StarRating";
import EstimatedBadge from "@/components/shared/EstimatedBadge";
import BookingButton from "@/components/shared/BookingButton";

export function generateStaticParams() {
  return hotels.map((h) => ({ slug: h.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const hotel = await getHotelBySlug(slug);
  if (!hotel) return {};

  return {
    title: hotel.name,
    description: `${hotel.name} in ${hotel.city} — ${hotel.category} category, ${hotel.starRating}-star.`,
    openGraph: { title: hotel.name, images: hotel.images.slice(0, 1) },
  };
}

export default async function HotelDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const hotel = await getHotelBySlug(slug);
  if (!hotel) notFound();

  const t = await getTranslations("hotels.detail");
  const tc = await getTranslations("common");

  return (
    <div className="container-content py-12">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">{hotel.city}</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-forest-900 sm:text-4xl">{hotel.name}</h1>
          <div className="mt-2 flex items-center gap-3">
            <StarRating rating={hotel.starRating} />
            <span className="text-sm text-forest-600">{hotel.category}</span>
          </div>
        </div>
        <BookingButton context={hotel.name} />
      </header>

      <div className="mb-10">
        <ImageGallery images={hotel.images} alt={hotel.name} />
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        <div className="space-y-10">
          <section>
            <h2 className="font-display text-xl font-bold text-forest-900">{t("rooms")}</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {hotel.rooms.map((room) => (
                <div key={room.type} className="rounded-card bg-cream-100 p-4">
                  <p className="font-semibold text-forest-900">{room.type}</p>
                  <p className="mt-1 text-sm text-forest-600">Up to {room.capacity} guests</p>
                  <p className="mt-2 font-display text-lg font-bold text-forest-900">
                    PKR {room.estimatedPricePKR.toLocaleString()}
                    <span className="text-sm font-normal text-forest-600"> {tc("perNight")}</span>
                  </p>
                  <EstimatedBadge lastUpdated={hotel.lastUpdated} />
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-forest-900">{t("facilities")}</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {hotel.facilities.map((f) => (
                <span key={f} className="rounded-full bg-forest-100 px-3 py-1.5 text-sm font-medium text-forest-800">
                  {f}
                </span>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-forest-900">{t("cancellationPolicy")}</h2>
            <p className="mt-3 rounded-card bg-cream-100 p-4 text-sm text-forest-600">
              {hotel.cancellationPolicy}
            </p>
          </section>

          <section className="h-80">
            <MapSection
              pins={[{ id: hotel.id, name: hotel.name, lat: hotel.lat, lng: hotel.lng }]}
              centerLat={hotel.lat}
              centerLng={hotel.lng}
              className="h-full"
            />
          </section>
        </div>

        <aside className="space-y-4">
          <div className="rounded-card bg-white p-5 shadow-card">
            <p className="font-display text-2xl font-bold text-forest-900">
              PKR {hotel.estimatedPricePKR.toLocaleString()}
              <span className="text-sm font-normal text-forest-600"> {tc("perNight")}</span>
            </p>
            <EstimatedBadge lastUpdated={hotel.lastUpdated} />
            <div className="mt-4">
              <BookingButton wrapperClassName="w-full" context={hotel.name} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
