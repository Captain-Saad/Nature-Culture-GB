import type { Hotel as DbHotel } from "@prisma/client";

interface RoomType {
  type: string;
  capacity: number;
  estimatedPricePKR: number;
  images: string[];
  videos?: string[];
  bedConfig: string;
  maxOccupancy: { adults: number; children: number };
  sizeSqFt?: number;
  facilities: string[];
}

function toDateLabel(date: Date) {
  return date.toISOString().slice(0, 10);
}

/**
 * Shapes a DB row into exactly the object frontend/lib/mock-data/hotels.ts
 * exports today, so the frontend's fetch call needs no further mapping.
 */
export function serializeHotel(h: DbHotel) {
  return {
    id: h.id,
    slug: h.slug,
    name: h.name,
    city: h.region,
    images: h.images,
    videos: h.videos,
    starRating: h.starRating,
    category: h.category,
    estimatedPricePKR: h.estimatedPricePerNightPKR,
    facilities: h.facilities,
    rooms: h.roomTypes as unknown as RoomType[],
    cancellationPolicy: h.cancellationPolicy,
    lat: h.lat,
    lng: h.lng,
    lastUpdated: toDateLabel(h.priceLastUpdated),
  };
}
