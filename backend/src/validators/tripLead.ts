import { z } from "zod";
import { HOTEL_CATEGORIES, TRANSPORT_MODES } from "../lib/enums";

/**
 * Field names deliberately match the frontend's TripBuilderForm state
 * (frontend/lib/trip-types.ts's TripState) so the eventual "wiring pass"
 * is a near-direct POST of that object. The frontend doesn't currently
 * collect `name`/`contact` at all (see TripBuilderForm.tsx's console.log
 * submission) — it'll need a small addition before it can call this
 * endpoint for real.
 */
export const tripLeadSchema = z.object({
  name: z.string().trim().min(1).max(200),
  contact: z.string().trim().min(3).max(200),
  startingCity: z.string().trim().min(1).max(200),
  destinationIds: z.array(z.string()).max(50).default([]),
  days: z.coerce.number().int().min(1).max(60),
  travelers: z.coerce.number().int().min(1).max(50),
  budgetPKR: z.coerce.number().int().nonnegative().optional(),
  hotelCategory: z.enum(HOTEL_CATEGORIES).optional(),
  transport: z.enum(TRANSPORT_MODES).optional(),
  activities: z.array(z.string()).max(50).default([]),
});

export type TripLeadInput = z.infer<typeof tripLeadSchema>;
