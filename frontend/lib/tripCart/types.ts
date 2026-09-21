/**
 * Everything a trip cart entry needs to display itself (in the navbar
 * drawer and the checkout page) and to be POSTed as part of a trip lead
 * later — no re-fetching the destination/package/hotel at checkout
 * time. `image` is the raw stored value (an "/uploads/..." path or an
 * absolute URL); resolve it with lib/utils/media's resolveMediaUrl at
 * render time, same as everywhere else in the app.
 */

export interface CartDestinationItem {
  cartItemId: string;
  type: "destination";
  id: string;
  slug: string;
  name: string;
  image: string | null;
  region: string;
  estimatedPricePKR?: { min: number; max: number };
}

export interface CartPackageItem {
  cartItemId: string;
  type: "package";
  id: string;
  slug: string;
  name: string;
  image: string | null;
  durationDays: number;
  estimatedPricePKR?: { min: number; max: number };
}

export interface CartHotelRoomItem {
  cartItemId: string;
  type: "hotelRoom";
  hotelId: string;
  hotelSlug: string;
  hotelName: string;
  roomType: string;
  image: string | null;
  /** ISO date, "yyyy-mm-dd". */
  checkIn: string;
  nights: number;
  guests: number;
  /** Per-night price, same as HotelRoom.estimatedPricePKR. */
  estimatedPricePKR?: number;
}

export type CartItem = CartDestinationItem | CartPackageItem | CartHotelRoomItem;
