import { Router } from "express";
import { getOrCreateSiteSettings } from "./admin/siteSettings";

/**
 * Public, read-only view of the site settings singleton -- the home hero
 * reads this to know which background to render. Write access stays on
 * /admin/site-settings behind the JWT.
 */
const router = Router();

router.get("/", async (_req, res) => {
  const settings = await getOrCreateSiteSettings();
  res.json({
    heroHeadline: settings.heroHeadline,
    heroSubtext: settings.heroSubtext,
    aboutUsCopy: settings.aboutUsCopy,
    contactDisplayText: settings.contactDisplayText,
    heroBackgroundImage: settings.heroBackgroundImage,
    heroBackgroundVideo: settings.heroBackgroundVideo,
  });
});

export default router;
