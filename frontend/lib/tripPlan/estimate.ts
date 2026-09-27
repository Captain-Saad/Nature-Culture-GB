import type { TripPricing } from "@/lib/pricing";
import type { TripState } from "@/lib/trip-types";
import type { TripPlanEstimate } from "@/lib/tripCart/types";

export interface TripPlanBreakdown extends TripPlanEstimate {
  nights: number;
  rooms: number;
  vehicles: number;
  /** false for Shared transport, which is priced per seat rather than per vehicle. */
  perVehicle: boolean;
}

/**
 * The Plan My Trip cost model, in one place: the live calculator renders it,
 * the mobile estimate bar shows its total, and the "Add to Trip Cart" step
 * snapshots it into the cart item. Hotel rooms derive from traveller count,
 * transport is per seat (Shared) or per vehicle with capacity (Private,
 * 4x4 Jeep), activities are priced individually per traveller, and entry
 * fees scale with the destinations actually selected.
 */
export function estimateTripPlan(
  trip: TripState,
  destinationCount: number,
  pricing: TripPricing
): TripPlanBreakdown {
  const nights = Math.max(trip.days - 1, 0);
  const rooms = Math.max(Math.ceil(trip.travelers / pricing.travelersPerRoom), 1);
  const hotel = pricing.hotelPerNightPKR[trip.hotelCategory] * nights * rooms;

  const transportRate = pricing.transportPerDayPKR[trip.transport];
  const capacity = pricing.transportVehicleCapacity[trip.transport as keyof TripPricing["transportVehicleCapacity"]];
  const vehicles = capacity ? Math.max(Math.ceil(trip.travelers / capacity), 1) : trip.travelers;
  const transport = capacity ? transportRate * trip.days * vehicles : transportRate * trip.days * trip.travelers;

  const food = pricing.foodPerDayPersonPKR * trip.days * trip.travelers;

  const activityCost = new Map(pricing.activities.map((a) => [a.name, a.costPKR]));
  const activities =
    trip.activities.reduce((sum, activity) => sum + (activityCost.get(activity) ?? 0), 0) * trip.travelers;

  const entryFees = pricing.entryFeePerAttractionPKR * destinationCount * trip.travelers;

  return {
    nights,
    rooms,
    vehicles,
    perVehicle: Boolean(capacity),
    hotel,
    transport,
    food,
    activities,
    entryFees,
    total: hotel + transport + food + activities + entryFees,
    pricingAsOf: pricing.lastUpdated,
  };
}
