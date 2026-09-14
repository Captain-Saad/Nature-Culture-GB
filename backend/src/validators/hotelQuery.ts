import { z } from "zod";
import { REGIONS, HOTEL_CATEGORIES } from "../lib/enums";

/**
 * Query params for GET /hotels. Everything is optional and string-based
 * since it comes off req.query; numeric fields are coerced.
 */
export const hotelQuerySchema = z.object({
  region: z.enum(REGIONS).optional(),
  category: z.enum(HOTEL_CATEGORIES).optional(),
  minPrice: z.coerce.number().int().nonnegative().optional(),
  maxPrice: z.coerce.number().int().nonnegative().optional(),
  minRating: z.coerce.number().int().min(1).max(5).optional(),
  // Repeated query params (?facilities=Wifi&facilities=Parking) or a single
  // comma-separated value (?facilities=Wifi,Parking) both work.
  facilities: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((val) => {
      if (!val) return undefined;
      const list = Array.isArray(val) ? val : val.split(",");
      return list.map((f) => f.trim()).filter(Boolean);
    }),
});

export type HotelQuery = z.infer<typeof hotelQuerySchema>;
