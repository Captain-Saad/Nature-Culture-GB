import { Router } from "express";
import { getOrCreateSiteSettings } from "./admin/siteSettings";

/**
 * Public, read-only view of the site settings singleton -- the home hero
 * reads this to know which background to render. Write access stays on
 * /admin/site-settings behind the JWT.
 */
const router = Router();

router.get("/", async (_req, res) => {
  // Everything on the row is public site content; only the bookkeeping
  // fields are left out.
  const { id: _id, updatedAt: _updatedAt, ...settings } = await getOrCreateSiteSettings();
  res.json(settings);
});

export default router;
