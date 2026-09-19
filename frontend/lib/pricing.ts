/**
 * Pricing config for the Trip Builder's CostCalculator — hotel rooms
 * from traveler count, vehicles needed from transport capacity,
 * per-activity costs, and per-destination entry fees. No admin CRUD
 * exists for this yet, so it's hardcoded here rather than fetched.
 */
export const pricingTable = {
  hotelPerNightPKR: {
    Budget: 6000,
    "Mid-Range": 12000,
    Luxury: 30000,
  },
  travelersPerRoom: 2,
  transportPerDayPKR: {
    Shared: 2500,
    Private: 8000,
    "4x4 Jeep": 12000,
  },
  /**
   * "Shared" is priced per seat (per traveler); "Private" and "4x4 Jeep"
   * are priced per vehicle, so this is the max travelers per vehicle
   * before an extra vehicle is needed. Shared has no fixed capacity.
   */
  transportVehicleCapacity: {
    Private: 4,
    "4x4 Jeep": 6,
  },
  foodPerDayPersonPKR: 2500,
  activityCostPKR: {
    Sightseeing: 1500,
    Trekking: 5000,
    Camping: 4000,
    Boating: 2500,
    Photography: 1000,
    "Cultural Tours": 2000,
    "Wildlife Spotting": 3000,
  },
  entryFeePerAttractionPKR: 500,
  lastUpdated: "2026-08-01",
};

export type HotelCategoryKey = keyof typeof pricingTable.hotelPerNightPKR;
export type TransportKey = keyof typeof pricingTable.transportPerDayPKR;
export type ActivityKey = keyof typeof pricingTable.activityCostPKR;
