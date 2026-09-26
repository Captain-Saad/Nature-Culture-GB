import { REGIONS } from "@/lib/admin/enums";
import type { Region } from "@/lib/types";

/**
 * One tile in the home page's "Explore Gilgit-Baltistan" grid, as stored in
 * site settings and edited from /admin/site-settings. label and image are
 * optional overrides: "" means "use the region name" and "use the first
 * photo of a destination in this region" respectively.
 */
export interface ExploreTile {
  region: Region;
  label: string;
  image: string;
  visible: boolean;
}

/**
 * The stored tile list merged with the built-in default (all ten regions, in
 * the standard order, visible). null/invalid stored data yields the default;
 * any region missing from a stored list is appended so the editor always
 * shows all ten.
 */
export function normalizeExploreTiles(stored: unknown): ExploreTile[] {
  const tiles: ExploreTile[] = [];
  const seen = new Set<string>();

  if (Array.isArray(stored)) {
    for (const raw of stored) {
      if (!raw || typeof raw !== "object") continue;
      const tile = raw as Partial<ExploreTile>;
      if (!tile.region || !REGIONS.includes(tile.region) || seen.has(tile.region)) continue;
      seen.add(tile.region);
      tiles.push({
        region: tile.region,
        label: typeof tile.label === "string" ? tile.label : "",
        image: typeof tile.image === "string" ? tile.image : "",
        visible: tile.visible !== false,
      });
    }
  }

  for (const region of REGIONS) {
    if (!seen.has(region)) tiles.push({ region, label: "", image: "", visible: true });
  }
  return tiles;
}
