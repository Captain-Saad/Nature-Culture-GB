export interface NavLink {
  href: string;
  labelKey: string;
}

/**
 * "Explore GB" has no standalone route in Phase 1 — the spec lists it
 * alongside the Home page's "Explore GB" section, so it anchors there
 * instead of duplicating the Destinations page.
 */
export const navLinks: NavLink[] = [
  { href: "/", labelKey: "home" },
  { href: "/#explore", labelKey: "exploreGB" },
  { href: "/destinations", labelKey: "destinations" },
  { href: "/hotels", labelKey: "hotels" },
  { href: "/packages", labelKey: "packages" },
  { href: "/weather", labelKey: "weather" },
  { href: "/flights", labelKey: "flights" },
  { href: "/travel-updates", labelKey: "travelUpdates" },
  { href: "/about", labelKey: "about" },
  { href: "/contact", labelKey: "contact" },
];
