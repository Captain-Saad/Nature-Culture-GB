/**
 * Editable site content (managed from /admin/site-settings) and the
 * defaults that apply until an admin sets their own. Shared by the public
 * pages and the admin form, so the form can show exactly what the site is
 * currently displaying.
 *
 * Text defaults that exist in both languages live in the i18n files instead
 * (lib/i18n/*.json); a custom value from the admin is shown in every
 * language, the same as the hero headline.
 */

export interface BusinessContact {
  email: string;
  /** Display format, e.g. "0300 8153848". The first one is what "Call" dials. */
  phones: string[];
  /** Digits only, international format -- goes into wa.me/<number>. */
  whatsappNumber: string;
  /** Without the leading "@". */
  instagramHandle: string;
}

export const DEFAULT_CONTACT: BusinessContact = {
  email: "natureculturegb@gmail.com",
  phones: ["0300 8153848", "0355 5400555"],
  whatsappNumber: "923008153848",
  instagramHandle: "natureandculturegb",
};

/** The raw site-settings fields this module reads (all optional/nullable). */
export interface ContactSettingsFields {
  contactEmail?: string | null;
  contactPhones?: unknown;
  whatsappNumber?: string | null;
  instagramHandle?: string | null;
}

function stringList(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  return value.filter((v): v is string => typeof v === "string" && v.trim() !== "").map((v) => v.trim());
}

/**
 * null/empty fields fall back to DEFAULT_CONTACT. An explicitly saved empty
 * phone list stays empty (the phone rows are then simply hidden).
 */
export function getBusinessContact(settings: ContactSettingsFields | null | undefined): BusinessContact {
  const phones = stringList(settings?.contactPhones);
  return {
    email: settings?.contactEmail || DEFAULT_CONTACT.email,
    phones: phones ?? DEFAULT_CONTACT.phones,
    whatsappNumber: settings?.whatsappNumber || DEFAULT_CONTACT.whatsappNumber,
    instagramHandle: (settings?.instagramHandle || DEFAULT_CONTACT.instagramHandle).replace(/^@/, ""),
  };
}

export function instagramUrl(handle: string): string {
  return `https://instagram.com/${handle.replace(/^@/, "")}`;
}

export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

/** A { title, body } card: About page values, home page "Why us" points. */
export interface ContentCard {
  title: string;
  body: string;
}

/** A stored card list, or null when unset/invalid (= use the built-in cards). */
export function cardList(value: unknown): ContentCard[] | null {
  if (!Array.isArray(value)) return null;
  const cards = value
    .filter((c) => c && typeof c === "object" && typeof c.title === "string" && c.title.trim())
    .map((c) => ({ title: String(c.title).trim(), body: typeof c.body === "string" ? c.body.trim() : "" }));
  return cards.length > 0 ? cards : null;
}

/** Labels in the home page's scrolling highlights strip. */
export const DEFAULT_HIGHLIGHTS = [
  "Karakoram",
  "Attabad Lake",
  "Baltit Fort",
  "Deosai",
  "Hunza Orchards",
  "Trekking GB",
  "Explore GB",
  "10 Regions",
];

export function highlightList(value: unknown): string[] {
  const list = stringList(value);
  return list && list.length > 0 ? list : DEFAULT_HIGHLIGHTS;
}
