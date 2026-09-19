import { z } from "zod";
import { REGIONS, HOTEL_CATEGORIES } from "../../lib/enums";
import { mediaUrlSchema } from "../../lib/uploads";

const roomTypeSchema = z.object({
  type: z.string().trim().min(1).max(100),
  capacity: z.coerce.number().int().positive(),
  estimatedPricePKR: z.coerce.number().int().nonnegative(),
  // Room-*type* detail, not per-instance inventory -- see the comment on
  // HotelRoom in frontend/lib/types.ts for why individual rooms aren't
  // modeled here.
  images: z.array(mediaUrlSchema),
  // Rooms live as JSON on Hotel, so their gallery gains videos without a
  // migration -- same image/video split as the top-level entities.
  videos: z.array(mediaUrlSchema).optional(),
  bedConfig: z.string().trim().min(1).max(200),
  maxOccupancy: z.object({
    adults: z.coerce.number().int().nonnegative(),
    children: z.coerce.number().int().nonnegative(),
  }),
  sizeSqFt: z.coerce.number().int().positive().optional(),
  facilities: z.array(z.string()),
});

const hotelFields = {
  slug: z.string().trim().min(1).max(200),
  name: z.string().trim().min(1).max(200),
  region: z.enum(REGIONS),
  images: z.array(mediaUrlSchema),
  videos: z.array(mediaUrlSchema).optional(),
  description: z.string().trim().max(2000).optional(),
  starRating: z.coerce.number().int().min(1).max(5),
  category: z.enum(HOTEL_CATEGORIES),
  estimatedPricePerNightPKR: z.coerce.number().int().nonnegative(),
  priceLastUpdated: z.coerce.date(),
  facilities: z.array(z.string()),
  roomTypes: z.array(roomTypeSchema),
  cancellationPolicy: z.string().trim().min(1),
  lat: z.coerce.number(),
  lng: z.coerce.number(),
};

export const createHotelSchema = z.object(hotelFields);
export const updateHotelSchema = z.object(hotelFields).partial();
