/**
 * Gallery media helpers.
 *
 * Entities carry two parallel arrays -- `images` and `videos` -- rather than
 * one list of tagged objects (see the comment in backend/prisma/schema.prisma
 * for why). Everything that renders a gallery merges them through
 * toMediaItems() so the split stays an implementation detail of storage.
 *
 * Stored values are either an absolute URL (externally hosted) or a relative
 * "/uploads/<file>" path produced by the admin uploader. The latter is served
 * by the Express backend, not Next, so it needs the API origin prefixed at
 * render time -- resolveMediaUrl() is the single place that happens.
 */

export type MediaKind = "image" | "video";

export interface MediaItem {
  /** The stored value, exactly as it appears in the DB array. */
  value: string;
  /** Fully qualified URL, ready for src=. */
  url: string;
  type: MediaKind;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export function resolveMediaUrl(stored: string): string {
  if (!stored) return stored;
  if (stored.startsWith("/uploads/")) return `${API_BASE}${stored}`;
  return stored;
}

/** True when a stored value is a locally uploaded file we're able to delete. */
export function isUploadedFile(stored: string): boolean {
  return stored.startsWith("/uploads/");
}

/**
 * Merges the two arrays into one render-ready list: images first, then
 * videos. Ordering within each array is preserved, so admin reordering still
 * takes effect; videos can't be interleaved between specific images, which is
 * the accepted trade-off of the parallel-array storage shape.
 */
export function toMediaItems(images: string[] = [], videos: string[] = []): MediaItem[] {
  return [
    ...images.map((value) => ({ value, url: resolveMediaUrl(value), type: "image" as const })),
    ...videos.map((value) => ({ value, url: resolveMediaUrl(value), type: "video" as const })),
  ];
}

/**
 * Next's <Image> can only load hosts listed in next.config.mjs. Uploaded
 * files come from the backend origin, which is configured there, but an
 * admin-pasted URL from an arbitrary host is not -- those fall back to a
 * plain <img> instead of throwing at render time.
 */
const NEXT_IMAGE_HOSTS = ["images.unsplash.com", "picsum.photos", "fastly.picsum.photos"];

export function canUseNextImage(url: string): boolean {
  if (url.startsWith("/")) return true;
  try {
    const { hostname } = new URL(url, API_BASE || "http://localhost");
    if (API_BASE && url.startsWith(API_BASE)) return true;
    return NEXT_IMAGE_HOSTS.includes(hostname);
  } catch {
    return false;
  }
}
