import type { Review as DbReview } from "@prisma/client";

type ReviewWithRelated = DbReview & {
  destination?: { name: string } | null;
  hotel?: { name: string } | null;
};

function toDateLabel(date: Date) {
  return date.toISOString().slice(0, 10);
}

/**
 * Shapes a DB row into exactly the object frontend/lib/mock-data/reviews.ts
 * exports today. The frontend's `relatedTo` is a free-text display label,
 * not a raw FK -- resolved here from the joined destination/hotel name.
 */
export function serializeReview(r: ReviewWithRelated) {
  return {
    id: r.id,
    name: r.name,
    rating: r.rating,
    text: r.text,
    photo: r.photoUrl ?? undefined,
    date: toDateLabel(r.createdAt),
    relatedTo: r.destination?.name ?? r.hotel?.name ?? undefined,
  };
}
