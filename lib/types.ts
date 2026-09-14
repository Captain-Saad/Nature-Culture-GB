export type Region =
  | "Skardu"
  | "Hunza"
  | "Gilgit"
  | "Astore"
  | "Ghizer"
  | "Nagar"
  | "Diamer"
  | "Ghanche"
  | "Shigar"
  | "Kharmang";

export type Difficulty = "Easy" | "Moderate" | "Challenging" | "Extreme";

export interface Destination {
  id: string;
  slug: string;
  name: string;
  region: Region;
  images: string[];
  shortDescription: string;
  description: string;
  bestTimeToVisit: string;
  estimatedDuration: string;
  activities: string[];
  difficulty: Difficulty;
  approxCostPKR: { min: number; max: number };
  nearbyHotelIds: string[];
  nearbyAttractionIds: string[];
  lat: number;
  lng: number;
  lastUpdated: string;
}

export type HotelCategory = "Budget" | "Mid-Range" | "Luxury";

export interface HotelRoom {
  type: string;
  capacity: number;
  estimatedPricePKR: number;
  // Room-*type* detail, not per-instance inventory — a lead-gen site
  // with no real booking system has no need to model individual rooms.
  images: string[];
  bedConfig: string;
  maxOccupancy: { adults: number; children: number };
  sizeSqFt?: number;
  facilities: string[];
}

export interface Hotel {
  id: string;
  slug: string;
  name: string;
  city: Region;
  images: string[];
  starRating: number;
  category: HotelCategory;
  estimatedPricePKR: number;
  facilities: string[];
  rooms: HotelRoom[];
  cancellationPolicy: string;
  lat: number;
  lng: number;
  lastUpdated: string;
}

export interface Mountain {
  id: string;
  slug: string;
  name: string;
  heightMeters: number;
  range: string;
  worldRank: number;
  difficulty: Difficulty;
  images: string[];
  description: string;
  nearestTown: string;
  lat: number;
  lng: number;
}

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  meals?: string[];
  overnightAt?: string;
}

export type PackageCategory =
  | "Adventure"
  | "Honeymoon"
  | "Family"
  | "Budget Backpacker"
  | "Luxury";

export interface TourPackage {
  id: string;
  slug: string;
  title: string;
  category: PackageCategory;
  durationDays: number;
  images: string[];
  estimatedPricePKR: { min: number; max: number };
  highlights: string[];
  itinerary: ItineraryDay[];
  included: string[];
  excluded: string[];
  regions: Region[];
  lastUpdated: string;
}

export interface WeatherEntry {
  city: Region;
  isLive: false;
  tempC: number | null;
  condition: string | null;
  humidity: number | null;
  windKph: number | null;
  forecast: {
    day: string;
    tempHighC: number | null;
    tempLowC: number | null;
    condition: string | null;
  }[];
  lastUpdated: string | null;
}

export type FlightStatus = "Scheduled" | "Delayed" | "Cancelled" | "Arrived";

export interface Flight {
  id: string;
  flightNumber: string;
  airline: string;
  origin: string;
  destination: string;
  isLive: false;
  status: FlightStatus | null;
  scheduledDeparture: string | null;
  lastUpdated: string | null;
}

export type SituationStatus = "Open" | "Closed" | "Restricted";

export interface SituationReport {
  id: string;
  title: string;
  region: Region;
  status: SituationStatus;
  description: string;
  source: string;
  timestamp: string;
}

export interface Review {
  id: string;
  name: string;
  rating: number;
  text: string;
  photo?: string;
  date: string;
  relatedTo?: string;
}
