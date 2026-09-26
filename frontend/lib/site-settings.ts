import "server-only";
import { cache } from "react";

/**
 * Public, read-only site settings -- everything editable from
 * /admin/site-settings and /admin/pricing: hero, Explore section, contact
 * details, About page, home page copy and trip-planner rates.
 *
 * Every field can be null, meaning "not set": callers fall back to the
 * built-in i18n string or default (see lib/siteContent.ts, lib/pricing.ts),
 * so the site renders correctly before an admin has ever saved this form.
 * JSON list fields are `unknown` here and go through their normalizers.
 */
export interface SiteSettings {
  heroHeadline: string | null;
  heroSubtext: string | null;
  aboutUsCopy: string | null;
  contactDisplayText: string | null;
  heroBackgroundImage: string | null;
  heroBackgroundVideo: string | null;
  exploreTitle: string | null;
  exploreSubtitle: string | null;
  /** Raw tile list — read through normalizeExploreTiles() in lib/exploreTiles.ts. */
  exploreTiles: unknown;
  contactEmail: string | null;
  contactPhones: unknown;
  whatsappNumber: string | null;
  instagramHandle: string | null;
  aboutMission: string | null;
  aboutValues: unknown;
  whyUsTitle: string | null;
  whyUsSubtitle: string | null;
  whyUsPoints: unknown;
  highlightsTitle: string | null;
  highlights: unknown;
  finalCtaTitle: string | null;
  finalCtaSubtitle: string | null;
  finalCtaButton: string | null;
  footerBlurb: string | null;
  tripPricing: unknown;
}

/**
 * Returns null when the API is unreachable or misconfigured rather than
 * throwing — pages must still render their built-in content if the backend
 * is down. Wrapped in React's cache() so the layout (footer, contact
 * details) and the page share one request per render.
 */
export const getSiteSettings = cache(async (): Promise<SiteSettings | null> => {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) return null;

  try {
    const res = await fetch(`${base}/site-settings`, {
      // Admin edits must show up without a redeploy.
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as SiteSettings;
  } catch {
    return null;
  }
});
