import { z } from "zod";
import { DIFFICULTIES } from "../../lib/enums";
import { mediaUrlSchema } from "../../lib/uploads";

const mountainFields = {
  slug: z.string().trim().min(1).max(200),
  name: z.string().trim().min(1).max(200),
  heightMeters: z.coerce.number().int().positive(),
  range: z.string().trim().min(1).max(200),
  difficulty: z.enum(DIFFICULTIES),
  images: z.array(mediaUrlSchema),
  videos: z.array(mediaUrlSchema).optional(),
  description: z.string().trim().min(1),
  firstAscent: z.string().trim().max(300).optional(),
  bestSeason: z.string().trim().max(200).optional(),
  worldRank: z.coerce.number().int().positive(),
  nearestTown: z.string().trim().min(1).max(200),
  lat: z.coerce.number(),
  lng: z.coerce.number(),
};

export const createMountainSchema = z.object(mountainFields);
export const updateMountainSchema = z.object(mountainFields).partial();
