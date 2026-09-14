import type { Destination as DbDestination } from "@prisma/client";

function toDateLabel(date: Date) {
  return date.toISOString().slice(0, 10);
}

/**
 * Shapes a DB row into exactly the object frontend/lib/mock-data/destinations.ts
 * exports today, so the frontend's fetch call needs no further mapping.
 */
export function serializeDestination(d: DbDestination) {
  return {
    id: d.id,
    slug: d.slug,
    name: d.name,
    region: d.region,
    images: d.images,
    shortDescription: d.shortDescription,
    description: d.longDescription,
    bestTimeToVisit: d.bestTimeToVisit,
    estimatedDuration: d.estimatedDurationLabel,
    activities: d.activities,
    difficulty: d.difficulty,
    approxCostPKR: { min: d.approxCostMinPKR, max: d.approxCostMaxPKR },
    nearbyHotelIds: d.nearbyHotelIds,
    nearbyAttractionIds: d.nearbyAttractionIds,
    lat: d.lat,
    lng: d.lng,
    lastUpdated: toDateLabel(d.updatedAt),
  };
}
