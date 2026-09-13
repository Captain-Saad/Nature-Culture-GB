/**
 * Mock pricing table for the Trip Builder's CostCalculator.
 * Phase 1: shape only, exposed for the form to read from.
 * Phase 2: CostCalculator will compute a live breakdown from these figures.
 */
export const pricingTable = {
  hotelPerNightPKR: {
    Budget: 6000,
    "Mid-Range": 12000,
    Luxury: 30000,
  },
  transportPerDayPKR: {
    Shared: 2500,
    Private: 8000,
    "4x4 Jeep": 12000,
  },
  foodPerDayPersonPKR: 2500,
  activityBaseCostPKR: 3000,
  entryFeePerAttractionPKR: 500,
  lastUpdated: "2026-08-01",
};

export type HotelCategoryKey = keyof typeof pricingTable.hotelPerNightPKR;
export type TransportKey = keyof typeof pricingTable.transportPerDayPKR;
