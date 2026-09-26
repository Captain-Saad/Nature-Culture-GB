import Image from "@/components/shared/SafeImage";
import { Link } from "@/i18n/navigation";
import type { Destination } from "@/lib/types";
import { normalizeExploreTiles } from "@/lib/exploreTiles";
import { resolveMediaUrl } from "@/lib/utils/media";
import ScrollReveal from "@/components/shared/ScrollReveal";

interface ExploreRegionsProps {
  /** Raw exploreTiles from site settings; null means the built-in default. */
  tiles: unknown;
  /** Used for a tile's photo when the admin hasn't set one. */
  destinations: Destination[];
}

/**
 * The home page's region grid, edited from /admin/site-settings (order,
 * visibility, label and photo per region). A tile without its own photo uses
 * the first photo of a destination in that region, so the grid shows real
 * places even before an admin has customised it.
 */
export default function ExploreRegions({ tiles, destinations }: ExploreRegionsProps) {
  const visible = normalizeExploreTiles(tiles).filter((tile) => tile.visible);
  if (visible.length === 0) return null;

  return (
    <ScrollReveal className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {visible.map((tile) => {
        const fallback = destinations.find((d) => d.region === tile.region && d.images[0])?.images[0];
        const image = tile.image || fallback;
        const label = tile.label || tile.region;

        return (
          <Link
            key={tile.region}
            href={{ pathname: "/destinations", query: { region: tile.region } }}
            className="group relative aspect-square overflow-hidden rounded-card bg-forest-gradient"
          >
            {image && (
              <Image
                src={resolveMediaUrl(image)}
                alt={label}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            )}
            <div className="absolute inset-0 bg-navy-900/40 transition-colors group-hover:bg-navy-900/20" />
            <span className="absolute inset-x-0 bottom-3 px-2 text-center font-display text-sm font-bold text-cream-50">
              {label}
            </span>
          </Link>
        );
      })}
    </ScrollReveal>
  );
}
