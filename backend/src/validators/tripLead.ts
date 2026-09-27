import { z } from "zod";
import { HOTEL_CATEGORIES, TRANSPORT_MODES } from "../lib/enums";

/**
 * Mirrors the frontend's CartItem union (frontend/lib/tripCart/types.ts)
 * exactly, minus `cartItemId` (a client-only React key, stripped here
 * since z.object() silently drops unrecognized keys rather than
 * erroring on them).
 */
const cartItemSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("destination"),
    id: z.string().min(1),
    slug: z.string().min(1),
    name: z.string().min(1).max(200),
    image: z.string().max(2000).nullable().optional(),
    region: z.string().max(100),
    estimatedPricePKR: z.object({ min: z.number(), max: z.number() }).optional(),
  }),
  z.object({
    type: z.literal("package"),
    id: z.string().min(1),
    slug: z.string().min(1),
    name: z.string().min(1).max(200),
    image: z.string().max(2000).nullable().optional(),
    durationDays: z.number().int().positive(),
    estimatedPricePKR: z.object({ min: z.number(), max: z.number() }).optional(),
  }),
  z.object({
    type: z.literal("hotelRoom"),
    hotelId: z.string().min(1),
    hotelSlug: z.string().min(1),
    hotelName: z.string().min(1).max(200),
    roomType: z.string().min(1).max(200),
    image: z.string().max(2000).nullable().optional(),
    checkIn: z.string().min(1).max(20),
    nights: z.number().int().positive().max(365),
    guests: z.number().int().positive().max(50),
    estimatedPricePKR: z.number().optional(),
  }),
  // The Plan My Trip wizard's custom itinerary (at most one per lead, see
  // the refine below). `estimate` is the breakdown the traveller was shown.
  z.object({
    type: z.literal("tripPlan"),
    startingCity: z.string().trim().min(1).max(100),
    destinations: z
      .array(
        z.object({
          id: z.string().min(1).max(100),
          name: z.string().min(1).max(200),
          region: z.string().max(100).nullable().optional(),
        })
      )
      .min(1)
      .max(50),
    days: z.number().int().min(1).max(60),
    travelers: z.number().int().min(1).max(50),
    budgetPKR: z.number().int().nonnegative().max(1_000_000_000),
    hotelCategory: z.enum(HOTEL_CATEGORIES),
    transport: z.enum(TRANSPORT_MODES),
    activities: z.array(z.string().trim().min(1).max(60)).max(30),
    estimate: z.object({
      hotel: z.number().nonnegative(),
      transport: z.number().nonnegative(),
      food: z.number().nonnegative(),
      activities: z.number().nonnegative(),
      entryFees: z.number().nonnegative(),
      total: z.number().nonnegative(),
      pricingAsOf: z.string().max(20),
    }),
  }),
]);

/**
 * The trip cart checkout (frontend /trip-cart) is the only caller: it posts
 * `cartItems` -- which can include one Plan My Trip "tripPlan" item -- plus
 * contact details, `preferredDates`, `travelers` and `notes`.
 *
 * The top-level wizard fields (startingCity ... activities) are what the
 * wizard used to submit directly before it was folded into the cart. They
 * stay accepted and stored so older leads keep rendering, but nothing sends
 * them any more.
 */
export const tripLeadSchema = z
  .object({
    name: z.string().trim().min(1).max(200),
    contact: z.string().trim().min(3).max(200),
    email: z.string().trim().email().max(200).optional().or(z.literal("")),

    // Plan-My-Trip wizard fields
    startingCity: z.string().trim().min(1).max(200).optional(),
    destinationIds: z.array(z.string()).max(50).default([]),
    days: z.coerce.number().int().min(1).max(60).optional(),
    travelers: z.coerce.number().int().min(1).max(50).optional(),
    budgetPKR: z.coerce.number().int().nonnegative().optional(),
    hotelCategory: z.enum(HOTEL_CATEGORIES).optional(),
    transport: z.enum(TRANSPORT_MODES).optional(),
    activities: z.array(z.string()).max(50).default([]),

    // Cart checkout fields
    cartItems: z.array(cartItemSchema).max(50).default([]),
    preferredDates: z.string().trim().max(200).optional(),
    notes: z.string().trim().max(2000).optional(),
  })
  // A lead with none of the wizard fields AND an empty cart is just
  // name/contact and nothing to act on -- reject it rather than create
  // a row with no actual trip content.
  .refine((data) => data.cartItems.length > 0 || data.destinationIds.length > 0, {
    message: "A trip request needs at least one cart item or destination",
    path: ["cartItems"],
  })
  .refine((data) => data.cartItems.filter((item) => item.type === "tripPlan").length <= 1, {
    message: "A trip request can include only one custom trip plan",
    path: ["cartItems"],
  });

export type TripLeadInput = z.infer<typeof tripLeadSchema>;
