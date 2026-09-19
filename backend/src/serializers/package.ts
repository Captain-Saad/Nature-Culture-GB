import type { Package as DbPackage } from "@prisma/client";

interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  meals?: string[];
  overnightAt?: string;
}

function toDateLabel(date: Date) {
  return date.toISOString().slice(0, 10);
}

/**
 * Shapes a DB row into exactly the object frontend/lib/mock-data/packages.ts
 * exports today, so the frontend's fetch call needs no further mapping.
 */
export function serializePackage(p: DbPackage) {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    category: p.category,
    durationDays: p.durationDays,
    images: p.images,
    videos: p.videos,
    estimatedPricePKR: { min: p.estimatedPriceMinPKR, max: p.estimatedPriceMaxPKR },
    highlights: p.highlights,
    itinerary: p.itinerary as unknown as ItineraryDay[],
    included: p.included,
    excluded: p.excluded,
    regions: p.regions,
    lastUpdated: toDateLabel(p.priceLastUpdated),
  };
}
