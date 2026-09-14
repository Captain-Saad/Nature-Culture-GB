import { HotelCategoryKey, TransportKey } from "@/lib/mock-data/pricing";

export interface TripState {
  startingCity: string;
  destinationIds: string[];
  days: number;
  travelers: number;
  budgetPKR: number;
  hotelCategory: HotelCategoryKey;
  transport: TransportKey;
  activities: string[];
}

export const defaultTripState: TripState = {
  startingCity: "Islamabad",
  destinationIds: [],
  days: 5,
  travelers: 2,
  budgetPKR: 100000,
  hotelCategory: "Mid-Range",
  transport: "Private",
  activities: [],
};
