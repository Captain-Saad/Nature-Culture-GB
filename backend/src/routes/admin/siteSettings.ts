import { Router } from "express";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { REGIONS, HOTEL_CATEGORIES, TRANSPORT_MODES } from "../../lib/enums";
import { mediaUrlSchema, deleteUploadedFile } from "../../lib/uploads";
import { pktDateString } from "../../lib/pakistanTime";

/**
 * Site settings are a singleton, so this router deliberately doesn't use
 * createAdminCrudRouter: there's no list, no create and no delete -- just
 * "read the one row" and "patch the one row".
 */
const router = Router();

export const SITE_SETTING_ID = "default";

/** "" clears a field; a non-empty value must be a real upload or URL. */
const optionalMedia = z.union([mediaUrlSchema, z.literal("")]).nullish();
const optionalText = z.string().trim().max(5000).nullish();

/**
 * One tile in the home page's "Explore Gilgit-Baltistan" grid. Each tile
 * links to /destinations filtered by its region, so `region` must be one of
 * the ten real regions; label and image are optional overrides (empty =
 * the region name, and the first photo of a destination in that region).
 */
const exploreTileSchema = z.object({
  region: z.enum(REGIONS),
  label: z.string().trim().max(60).default(""),
  image: z.union([mediaUrlSchema, z.literal("")]).default(""),
  visible: z.boolean().default(true),
});

export type ExploreTile = z.infer<typeof exploreTileSchema>;

const exploreTilesSchema = z
  .array(exploreTileSchema)
  .max(REGIONS.length)
  .refine((tiles) => new Set(tiles.map((t) => t.region)).size === tiles.length, {
    message: "Each region can appear only once.",
  })
  .nullish();

const shortText = z.string().trim().max(200).nullish();

/** A { title, body } card -- About page values, home page "Why us" points. */
const cardsSchema = z
  .array(z.object({ title: z.string().trim().min(1).max(100), body: z.string().trim().max(500) }))
  .max(8)
  .nullish();

const pkr = z.coerce.number().int().min(0).max(10_000_000);

/**
 * Plan My Trip cost-estimator rates. Hotel categories and transport modes
 * are fixed (the wizard's choices and the trip-lead validator depend on
 * them), so only their prices are editable; activities are a free list.
 * lastUpdated is stamped server-side whenever the rates change -- it's the
 * "Estimated as of" date shown next to the estimate.
 */
const tripPricingSchema = z
  .object({
    startingCities: z.array(z.string().trim().min(1).max(60)).min(1).max(20),
    hotelPerNightPKR: z.object(Object.fromEntries(HOTEL_CATEGORIES.map((c) => [c, pkr])) as Record<
      (typeof HOTEL_CATEGORIES)[number],
      typeof pkr
    >),
    travelersPerRoom: z.coerce.number().int().min(1).max(10),
    transportPerDayPKR: z.object(Object.fromEntries(TRANSPORT_MODES.map((m) => [m, pkr])) as Record<
      (typeof TRANSPORT_MODES)[number],
      typeof pkr
    >),
    transportVehicleCapacity: z.object({
      Private: z.coerce.number().int().min(1).max(60),
      "4x4 Jeep": z.coerce.number().int().min(1).max(60),
    }),
    foodPerDayPersonPKR: pkr,
    activities: z
      .array(z.object({ name: z.string().trim().min(1).max(60), costPKR: pkr }))
      .max(30)
      .refine((list) => new Set(list.map((a) => a.name.toLowerCase())).size === list.length, {
        message: "Each activity name must be unique.",
      }),
    entryFeePerAttractionPKR: pkr,
  })
  .nullish();

const updateSiteSettingsSchema = z.object({
  heroHeadline: z.string().trim().max(300).nullish(),
  heroSubtext: optionalText,
  aboutUsCopy: optionalText,
  contactDisplayText: optionalText,
  heroBackgroundImage: optionalMedia,
  heroBackgroundVideo: optionalMedia,
  exploreTitle: z.string().trim().max(200).nullish(),
  exploreSubtitle: z.string().trim().max(500).nullish(),
  exploreTiles: exploreTilesSchema,

  contactEmail: z.union([z.string().trim().email().max(320), z.literal("")]).nullish(),
  contactPhones: z.array(z.string().trim().min(3).max(40)).max(5).nullish(),
  // Digits only, international format without "+" -- it goes into wa.me/<number>.
  whatsappNumber: z
    .union([z.string().trim().regex(/^\d{8,15}$/, "Use digits only, e.g. 923001234567"), z.literal("")])
    .nullish(),
  instagramHandle: z
    .union([z.string().trim().regex(/^@?[A-Za-z0-9._]{1,30}$/, "Use the handle only, e.g. @yourpage"), z.literal("")])
    .nullish(),

  aboutMission: optionalText,
  aboutValues: cardsSchema,

  whyUsTitle: shortText,
  whyUsSubtitle: optionalText,
  whyUsPoints: cardsSchema,
  highlightsTitle: shortText,
  highlights: z.array(z.string().trim().min(1).max(40)).max(20).nullish(),
  finalCtaTitle: shortText,
  finalCtaSubtitle: optionalText,
  finalCtaButton: z.string().trim().max(40).nullish(),
  footerBlurb: optionalText,

  tripPricing: tripPricingSchema,
});

const JSON_FIELDS = [
  "exploreTiles",
  "contactPhones",
  "aboutValues",
  "whyUsPoints",
  "highlights",
  "tripPricing",
] as const;

/** Tile images currently referenced by a stored exploreTiles value. */
function exploreTileImages(value: Prisma.JsonValue | null): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((tile) => (tile && typeof tile === "object" && !Array.isArray(tile) ? tile.image : null))
    .filter((image): image is string => typeof image === "string" && image !== "");
}

/**
 * Reads the singleton, creating it on first access so neither this route nor
 * the public one has to handle a missing row.
 */
export async function getOrCreateSiteSettings() {
  return prisma.siteSetting.upsert({
    where: { id: SITE_SETTING_ID },
    update: {},
    create: { id: SITE_SETTING_ID },
  });
}

// GET /admin/site-settings
router.get("/", async (_req, res) => {
  res.json(await getOrCreateSiteSettings());
});

// PATCH /admin/site-settings
router.patch("/", async (req, res) => {
  const parsed = updateSiteSettingsSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
    return;
  }

  const previous = await getOrCreateSiteSettings();

  // Normalise "" -> null so an empty field reads as "unset" (and falls back
  // to the built-in default) rather than rendering as an empty string.
  const data: Record<string, unknown> = Object.fromEntries(
    Object.entries(parsed.data)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => [key, value === "" ? null : value])
  );
  // A JSON column can't take a bare null -- DbNull stores SQL NULL, which
  // reads back as "use the built-in default".
  for (const field of JSON_FIELDS) {
    if (data[field] === null) data[field] = Prisma.DbNull;
  }
  if (data.tripPricing && data.tripPricing !== Prisma.DbNull) {
    data.tripPricing = { ...(data.tripPricing as object), lastUpdated: pktDateString() };
  }

  const updated = await prisma.siteSetting.update({ where: { id: SITE_SETTING_ID }, data });

  // Replacing or clearing a hero file removes the old one from disk rather
  // than orphaning it. Done after the row is safely updated, and only for
  // files we host -- an external URL isn't ours to delete.
  for (const field of ["heroBackgroundImage", "heroBackgroundVideo"] as const) {
    const before = previous[field];
    const after = updated[field];
    if (before && before !== after) {
      await deleteUploadedFile(before);
    }
  }
  const keptTileImages = new Set(exploreTileImages(updated.exploreTiles));
  for (const image of exploreTileImages(previous.exploreTiles)) {
    if (!keptTileImages.has(image)) await deleteUploadedFile(image);
  }

  res.json(updated);
});

export default router;
