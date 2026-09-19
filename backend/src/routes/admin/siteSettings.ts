import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { mediaUrlSchema, deleteUploadedFile } from "../../lib/uploads";

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

const updateSiteSettingsSchema = z.object({
  heroHeadline: z.string().trim().max(300).nullish(),
  heroSubtext: optionalText,
  aboutUsCopy: optionalText,
  contactDisplayText: optionalText,
  heroBackgroundImage: optionalMedia,
  heroBackgroundVideo: optionalMedia,
});

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
  const data = Object.fromEntries(
    Object.entries(parsed.data)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => [key, value === "" ? null : value])
  );

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

  res.json(updated);
});

export default router;
