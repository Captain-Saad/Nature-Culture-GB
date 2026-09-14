import { z } from "zod";

/**
 * The frontend's ReviewForm only collects name/rating/text today (see
 * frontend/components/reviews/ReviewForm.tsx) — email, destinationId,
 * hotelId and photoUrl are accepted as optional for when a review is
 * submitted from a destination/hotel detail page, or via the future
 * admin dashboard, without requiring a form change first.
 */
export const createReviewSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320).optional(),
  destinationId: z.string().trim().min(1).optional(),
  hotelId: z.string().trim().min(1).optional(),
  rating: z.coerce.number().int().min(1).max(5),
  text: z.string().trim().min(1).max(2000),
  photoUrl: z.string().trim().url().max(2000).optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

export const reviewQuerySchema = z.object({
  destinationId: z.string().trim().min(1).optional(),
  hotelId: z.string().trim().min(1).optional(),
  // Accepted for API-contract clarity (backend_prompt.md writes the
  // endpoint as "GET /reviews?status=APPROVED"), but this is the public
  // endpoint -- it always serves approved-only regardless of what's
  // passed here. Anything other than "APPROVED" is rejected outright so
  // callers don't mistakenly believe they can read PENDING/REJECTED
  // reviews without admin auth (that's Phase 6).
  status: z.enum(["APPROVED"]).optional(),
});
