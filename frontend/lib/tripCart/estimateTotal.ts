import type { CartItem } from "./types";

/**
 * Sums whatever each item can honestly contribute: destinations/packages
 * add their min/max range, hotel rooms add a precise nights × per-night
 * figure to both ends of the range (they're not a range themselves).
 * `hasAny` is false when nothing in the cart has a price at all, so the
 * caller can skip showing a total rather than claiming "PKR 0".
 */
export function estimateTotal(items: CartItem[]): { min: number; max: number; hasAny: boolean } {
  let min = 0;
  let max = 0;
  let hasAny = false;

  for (const item of items) {
    if (item.type === "destination" || item.type === "package") {
      if (item.estimatedPricePKR) {
        min += item.estimatedPricePKR.min;
        max += item.estimatedPricePKR.max;
        hasAny = true;
      }
    } else if (item.estimatedPricePKR) {
      const subtotal = item.estimatedPricePKR * item.nights;
      min += subtotal;
      max += subtotal;
      hasAny = true;
    }
  }

  return { min, max, hasAny };
}
