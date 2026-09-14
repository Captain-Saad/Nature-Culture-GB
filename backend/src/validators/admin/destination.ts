import { z } from "zod";
import { REGIONS, DIFFICULTIES } from "../../lib/enums";

const destinationFields = {
  slug: z.string().trim().min(1).max(200),
  name: z.string().trim().min(1).max(200),
  region: z.enum(REGIONS),
  images: z.array(z.string().url()),
  shortDescription: z.string().trim().min(1).max(500),
  longDescription: z.string().trim().min(1),
  bestTimeToVisit: z.string().trim().min(1).max(200),
  estimatedDurationDays: z.coerce.number().int().min(0).max(90),
  estimatedDurationLabel: z.string().trim().min(1).max(100),
  activities: z.array(z.string()),
  difficulty: z.enum(DIFFICULTIES),
  approxCostMinPKR: z.coerce.number().int().nonnegative(),
  approxCostMaxPKR: z.coerce.number().int().nonnegative(),
  nearbyHotelIds: z.array(z.string()),
  nearbyAttractionIds: z.array(z.string()),
  lat: z.coerce.number(),
  lng: z.coerce.number(),
};

export const createDestinationSchema = z.object(destinationFields);
export const updateDestinationSchema = z.object(destinationFields).partial();
