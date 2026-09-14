import type { Region } from "./enums";

/**
 * The six towns backend_prompt.md names for Phase 7 weather, mapped onto
 * the frontend's Region-typed `city` field. Five towns share their name
 * with a Region already; Khaplu doesn't (it's Ghanche district's main
 * town), so its entry reports as "Ghanche" -- district-level weather
 * reported at the district's administrative center, same as how GB
 * weather is conventionally summarized.
 */
export interface WeatherCity {
  region: Region;
  townLabel: string;
  lat: number;
  lng: number;
}

export const WEATHER_CITIES: WeatherCity[] = [
  { region: "Skardu", townLabel: "Skardu", lat: 35.2971, lng: 75.6333 },
  { region: "Gilgit", townLabel: "Gilgit", lat: 35.9208, lng: 74.3144 },
  { region: "Hunza", townLabel: "Karimabad", lat: 36.3167, lng: 74.65 },
  { region: "Astore", townLabel: "Astore", lat: 35.3667, lng: 74.9 },
  { region: "Ghanche", townLabel: "Khaplu", lat: 35.1667, lng: 76.3333 },
  { region: "Shigar", townLabel: "Shigar", lat: 35.4225, lng: 75.7439 },
];
