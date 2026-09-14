import { z } from "zod";
import { REGIONS, PACKAGE_CATEGORIES } from "../../lib/enums";

const itineraryDaySchema = z.object({
  day: z.coerce.number().int().positive(),
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1),
  meals: z.array(z.string()).optional(),
  overnightAt: z.string().trim().max(200).optional(),
});

const packageFields = {
  slug: z.string().trim().min(1).max(200),
  title: z.string().trim().min(1).max(200),
  category: z.enum(PACKAGE_CATEGORIES),
  durationDays: z.coerce.number().int().positive(),
  images: z.array(z.string().url()),
  estimatedPriceMinPKR: z.coerce.number().int().nonnegative(),
  estimatedPriceMaxPKR: z.coerce.number().int().nonnegative(),
  priceLastUpdated: z.coerce.date(),
  highlights: z.array(z.string()),
  itinerary: z.array(itineraryDaySchema),
  included: z.array(z.string()),
  excluded: z.array(z.string()),
  regions: z.array(z.enum(REGIONS)),
};

export const createPackageSchema = z.object(packageFields);
export const updatePackageSchema = z.object(packageFields).partial();
