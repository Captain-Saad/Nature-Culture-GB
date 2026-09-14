import { WeatherEntry } from "@/lib/types";

/**
 * Weather is intentionally mocked as "unavailable" — no live provider is
 * wired up yet (Phase 7). The shape mirrors the future live-API response
 * so swapping in a real fetch requires no UI changes.
 */
const unavailable = (city: WeatherEntry["city"]): WeatherEntry => ({
  city,
  isLive: false,
  tempC: null,
  condition: null,
  humidity: null,
  windKph: null,
  forecast: Array.from({ length: 5 }, (_, i) => ({
    day: `Day ${i + 1}`,
    tempHighC: null,
    tempLowC: null,
    condition: null,
  })),
  lastUpdated: null,
});

export const weather: WeatherEntry[] = [
  unavailable("Skardu"),
  unavailable("Hunza"),
  unavailable("Gilgit"),
  unavailable("Astore"),
  unavailable("Ghizer"),
];
