import type { Mountain as DbMountain } from "@prisma/client";

/**
 * Shapes a DB row into exactly the object frontend/lib/mock-data/mountains.ts
 * exports today, so the frontend's fetch call needs no further mapping.
 */
export function serializeMountain(m: DbMountain) {
  return {
    id: m.id,
    slug: m.slug,
    name: m.name,
    heightMeters: m.heightMeters,
    range: m.range,
    worldRank: m.worldRank,
    difficulty: m.difficulty,
    images: m.images,
    videos: m.videos,
    description: m.description,
    nearestTown: m.nearestTown,
    lat: m.lat,
    lng: m.lng,
  };
}
