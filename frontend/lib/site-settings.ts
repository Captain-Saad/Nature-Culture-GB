import "server-only";

/**
 * Public, read-only site settings (hero copy and background, About Us copy,
 * contact display text) — edited from /admin/site-settings.
 *
 * Every field can be null, meaning "not set": callers fall back to the
 * built-in i18n string or bundled asset, so the site renders correctly
 * before an admin has ever saved this form.
 */
export interface SiteSettings {
  heroHeadline: string | null;
  heroSubtext: string | null;
  aboutUsCopy: string | null;
  contactDisplayText: string | null;
  heroBackgroundImage: string | null;
  heroBackgroundVideo: string | null;
}

/**
 * Returns null when the API is unreachable or misconfigured rather than
 * throwing — the home page must still render its built-in hero if the
 * backend is down.
 */
export async function getSiteSettings(): Promise<SiteSettings | null> {
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
}
