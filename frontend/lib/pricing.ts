import { HOTEL_CATEGORIES, TRANSPORT_MODES } from "@/lib/admin/enums";

export type HotelCategoryKey = (typeof HOTEL_CATEGORIES)[number];
export type TransportKey = (typeof TRANSPORT_MODES)[number];

/**
 * Rates for the Plan My Trip cost estimator: hotel rooms from traveler
 * count, vehicles needed from transport capacity, per-activity costs and
 * per-destination entry fees. Edited from /admin/pricing and stored in site
 * settings; DEFAULT_TRIP_PRICING applies until an admin saves their own.
 */
export interface TripPricing {
  /** Where the trip starts -- the wizard's first step. */
  startingCities: string[];
  hotelPerNightPKR: Record<HotelCategoryKey, number>;
  travelersPerRoom: number;
  transportPerDayPKR: Record<TransportKey, number>;
  /**
   * "Shared" is priced per seat (per traveler); "Private" and "4x4 Jeep"
   * are priced per vehicle, so this is the max travelers per vehicle
   * before an extra vehicle is needed. Shared has no fixed capacity.
   */
  transportVehicleCapacity: { Private: number; "4x4 Jeep": number };
  foodPerDayPersonPKR: number;
  /** Per traveler. Order here is the order the wizard lists them. */
  activities: { name: string; costPKR: number }[];
  entryFeePerAttractionPKR: number;
  /** "YYYY-MM-DD" -- stamped by the backend whenever an admin saves rates. */
  lastUpdated: string;
}

export const DEFAULT_TRIP_PRICING: TripPricing = {
  startingCities: ["Islamabad", "Lahore", "Karachi", "Peshawar"],
  hotelPerNightPKR: { Budget: 6000, "Mid-Range": 12000, Luxury: 30000 },
  travelersPerRoom: 2,
  transportPerDayPKR: { Shared: 2500, Private: 8000, "4x4 Jeep": 12000 },
  transportVehicleCapacity: { Private: 4, "4x4 Jeep": 6 },
  foodPerDayPersonPKR: 2500,
  activities: [
    { name: "Sightseeing", costPKR: 1500 },
    { name: "Trekking", costPKR: 5000 },
    { name: "Camping", costPKR: 4000 },
    { name: "Boating", costPKR: 2500 },
    { name: "Photography", costPKR: 1000 },
    { name: "Cultural Tours", costPKR: 2000 },
    { name: "Wildlife Spotting", costPKR: 3000 },
  ],
  entryFeePerAttractionPKR: 500,
  lastUpdated: "2026-08-01",
};

function num(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : fallback;
}

/**
 * Stored pricing merged over the defaults field by field, so a partial or
 * older stored shape can never leave the calculator with a missing rate.
 */
export function normalizeTripPricing(stored: unknown): TripPricing {
  const d = DEFAULT_TRIP_PRICING;
  if (!stored || typeof stored !== "object") return d;
  const s = stored as Partial<TripPricing>;

  const pick = <K extends string>(keys: readonly K[], from: unknown, defaults: Record<K, number>) =>
    Object.fromEntries(
      keys.map((k) => [k, num((from as Record<string, unknown> | undefined)?.[k], defaults[k])])
    ) as Record<K, number>;

  const activities = Array.isArray(s.activities)
    ? s.activities
        .filter((a) => a && typeof a.name === "string" && a.name.trim())
        .map((a) => ({ name: a.name.trim(), costPKR: num(a.costPKR, 0) }))
    : d.activities;

  const startingCities = Array.isArray(s.startingCities)
    ? s.startingCities.filter((c): c is string => typeof c === "string" && c.trim() !== "")
    : [];

  return {
    startingCities: startingCities.length > 0 ? startingCities : d.startingCities,
    hotelPerNightPKR: pick(HOTEL_CATEGORIES, s.hotelPerNightPKR, d.hotelPerNightPKR),
    travelersPerRoom: Math.max(1, num(s.travelersPerRoom, d.travelersPerRoom)),
    transportPerDayPKR: pick(TRANSPORT_MODES, s.transportPerDayPKR, d.transportPerDayPKR),
    transportVehicleCapacity: {
      Private: Math.max(1, num(s.transportVehicleCapacity?.Private, d.transportVehicleCapacity.Private)),
      "4x4 Jeep": Math.max(1, num(s.transportVehicleCapacity?.["4x4 Jeep"], d.transportVehicleCapacity["4x4 Jeep"])),
    },
    foodPerDayPersonPKR: num(s.foodPerDayPersonPKR, d.foodPerDayPersonPKR),
    activities,
    entryFeePerAttractionPKR: num(s.entryFeePerAttractionPKR, d.entryFeePerAttractionPKR),
    lastUpdated: typeof s.lastUpdated === "string" ? s.lastUpdated : d.lastUpdated,
  };
}
