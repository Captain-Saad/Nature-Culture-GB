/**
 * Deterministic placeholder image URLs, keyed by seed so the same
 * entity always renders the same image. Swap this implementation for
 * real asset URLs from the backend without touching call sites.
 */
export function placeholderImage(seed: string, width = 800, height = 600) {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${width}/${height}`;
}

export function placeholderGallery(seed: string, count: number, width = 1200, height = 800) {
  return Array.from({ length: count }, (_, i) =>
    placeholderImage(`${seed}-${i}`, width, height)
  );
}
