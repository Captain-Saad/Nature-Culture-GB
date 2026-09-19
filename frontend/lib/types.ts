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
  // Optional across every gallery type: rows may not have any videos yet.
  // Renderers merge images + videos via lib/utils/media.ts.
  videos?: string[];
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
  videos?: string[];
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
  videos?: string[];
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
  videos?: string[];
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
  videos?: string[];
  estimatedPricePKR: { min: number; max: number };
  highlights: string[];
  itinerary: ItineraryDay[];
  included: string[];
  excluded: string[];
  regions: Region[];
  lastUpdated: string;
}

export interface WeatherForecastDay {
  /** ISO date ("2026-09-20") -- format per-locale at render time. */
  date: string;
  tempHighC: number | null;
  tempLowC: number | null;
  /** Stable key into the `weather.conditions` messages, e.g. "clearSky". */
  condition: string | null;
  icon: string | null;
  precipitationProbability: number | null;
}

export interface WeatherEntry {
  /** URL-safe id, e.g. "skardu" -- matches GET /weather/:location. */
  location: string;
  /** Display name, e.g. "Hunza (Karimabad)" or "Deosai Plains". */
  label: string;
  /** null for locations that aren't one of the ten administrative regions (e.g. Deosai). */
  region: Region | null;
  available: boolean;
  tempC: number | null;
  condition: string | null;
  icon: string | null;
  humidity: number | null;
  windKph: number | null;
  precipitationMm: number | null;
  forecast: WeatherForecastDay[];
  message: string | null;
  lastUpdated: string | null;
}

export type FlightStatus = "Scheduled" | "Delayed" | "Cancelled" | "Arrived" | "Departed";

export interface Flight {
  /** Route leg id, e.g. "isb-kdu" -- matches GET /flights. */
  id: string;
  airline: string;
  origin: string;
  destination: string;
  available: boolean;
  /** null when `available` is false. */
  flightNumber: string | null;
  status: FlightStatus | null;
  scheduledDeparture: string | null;
  estimatedDeparture: string | null;
  message: string | null;
  /** When this cached data was last successfully refreshed -- not real-time, see FlightCard. */
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
  /** Optional attachment — a road photo or official notice. */
  imageUrl?: string | null;
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
