import { Router } from "express";
import { WEATHER_LOCATIONS, type WeatherLocation } from "../lib/weatherCities";
import { fetchWeather } from "../services/openMeteo";
import { withCache } from "../lib/cache";

const router = Router();

// Genuinely live (Open-Meteo, no API key) -- not a placeholder. 20
// minutes balances staying current against not hammering Open-Meteo on
// every page load; adjust here if that trade-off needs to move.
const CACHE_TTL_MS = 20 * 60 * 1000;

async function getLocationWeather(location: WeatherLocation) {
  try {
    const weather = await withCache(`weather:${location.slug}`, CACHE_TTL_MS, () =>
      fetchWeather(location.lat, location.lng, location.elevation)
    );
    return {
      location: location.slug,
      label: location.label,
      region: location.region,
      available: true,
      tempC: weather.tempC,
      condition: weather.conditionKey,
      icon: weather.icon,
      humidity: weather.humidity,
      windKph: weather.windKph,
      precipitationMm: weather.precipitationMm,
      forecast: weather.forecast.map((day) => ({
        date: day.date,
        tempHighC: day.tempHighC,
        tempLowC: day.tempLowC,
        condition: day.conditionKey,
        icon: day.icon,
        precipitationProbability: day.precipitationProbability,
      })),
      message: null,
      lastUpdated: new Date().toISOString(),
    };
  } catch (err) {
    console.error(`Weather fetch failed for ${location.slug} (${location.label}):`, err);
    return {
      location: location.slug,
      label: location.label,
      region: location.region,
      available: false,
      tempC: null,
      condition: null,
      icon: null,
      humidity: null,
      windKph: null,
      precipitationMm: null,
      forecast: [],
      message: "Live weather data unavailable",
      lastUpdated: null,
    };
  }
}

// GET /weather -- every covered location, current + 7-day forecast.
// One location's Open-Meteo call failing degrades only that entry
// (available: false) rather than failing the whole response.
router.get("/", async (_req, res) => {
  const entries = await Promise.all(WEATHER_LOCATIONS.map(getLocationWeather));
  res.json(entries);
});

// GET /weather/:location -- same shape, single location by slug.
router.get("/:location", async (req, res) => {
  const location = WEATHER_LOCATIONS.find((l) => l.slug === req.params.location);
  if (!location) {
    res.status(404).json({ error: "Unknown weather location" });
    return;
  }
  res.json(await getLocationWeather(location));
});

export default router;
