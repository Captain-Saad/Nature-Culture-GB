import { z } from "zod";
import { REGIONS, HOTEL_CATEGORIES } from "../../lib/enums";

const roomTypeSchema = z.object({
  type: z.string().trim().min(1).max(100),
  capacity: z.coerce.number().int().positive(),
  estimatedPricePKR: z.coerce.number().int().nonnegative(),
});

const hotelFields = {
  slug: z.string().trim().min(1).max(200),
  name: z.string().trim().min(1).max(200),
  region: z.enum(REGIONS),
  images: z.array(z.string().url()),
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
