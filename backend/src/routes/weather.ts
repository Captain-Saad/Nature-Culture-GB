import { Router } from "express";
import { WEATHER_CITIES } from "../lib/weatherCities";
import { fetchWeather } from "../services/openMeteo";
import { withCache } from "../lib/cache";

const router = Router();

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes -- weather doesn't need to be hit every page load

// GET /weather -- genuinely live (Open-Meteo, no API key). Degrades
// per-city to the same isLive:false/null shape Phase 1 used for "no
// data source yet" if that city's fetch fails, rather than fabricating
// or reusing stale numbers.
router.get("/", async (_req, res) => {
  const entries = await Promise.all(
    WEATHER_CITIES.map(async (city) => {
      try {
        const weather = await withCache(`weather:${city.region}`, CACHE_TTL_MS, () =>
          fetchWeather(city.lat, city.lng)
        );
        return {
          city: city.region,
          isLive: true,
          tempC: weather.tempC,
          condition: weather.condition,
          humidity: weather.humidity,
          windKph: weather.windKph,
          forecast: weather.forecast,
          lastUpdated: new Date().toISOString(),
        };
      } catch (err) {
        console.error(`Weather fetch failed for ${city.region} (${city.townLabel}):`, err);
        return {
          city: city.region,
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
        };
      }
    })
  );

  res.json(entries);
});

export default router;
