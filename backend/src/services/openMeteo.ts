import { wmoCodeToConditionKey, wmoCodeToIcon } from "../lib/wmoCondition";

const FORECAST_DAYS = 7;

interface OpenMeteoResponse {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    weather_code: number;
    wind_speed_10m: number;
    precipitation: number;
    is_day: number; // 1 or 0
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weather_code: number[];
    precipitation_probability_max: number[];
  };
}

export interface NormalizedWeatherDay {
  /** ISO date ("2026-09-20") -- the frontend formats this per-locale. */
  date: string;
  tempHighC: number;
  tempLowC: number;
  conditionKey: string | null;
  icon: string | null;
  precipitationProbability: number;
}

export interface NormalizedWeather {
  tempC: number;
  conditionKey: string | null;
  icon: string | null;
  humidity: number;
  windKph: number;
  precipitationMm: number;
  forecast: NormalizedWeatherDay[];
}

/**
 * Fetches current conditions + a 7-day forecast from Open-Meteo (free,
 * no API key). Throws on any failure -- the caller (routes/weather.ts)
 * decides how to degrade for that one location, this function doesn't
 * paper over errors with fabricated numbers.
 *
 * `elevation` overrides the model's own grid-cell elevation for this
 * lat/lng so mountainous, closely-spaced points (e.g. Skardu vs. the
 * Deosai plateau) get a lapse-rate-corrected temperature instead of
 * whatever the ~9km/~2km resolution grid happens to resolve there.
 */
export async function fetchWeather(lat: number, lng: number, elevation?: number): Promise<NormalizedWeather> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lng));
  if (elevation !== undefined) {
    url.searchParams.set("elevation", String(elevation));
  }
  url.searchParams.set(
    "current",
    "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation,is_day"
  );
  url.searchParams.set(
    "daily",
    "temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max"
  );
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("forecast_days", String(FORECAST_DAYS));

  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) {
    throw new Error(`Open-Meteo request failed: ${res.status}`);
  }
  const data = (await res.json()) as OpenMeteoResponse;
  const isDay = data.current.is_day === 1;

  return {
    tempC: data.current.temperature_2m,
    conditionKey: wmoCodeToConditionKey(data.current.weather_code),
    icon: wmoCodeToIcon(data.current.weather_code, isDay),
    humidity: data.current.relative_humidity_2m,
    windKph: data.current.wind_speed_10m,
    precipitationMm: data.current.precipitation,
    forecast: data.daily.time.map((date, i) => ({
      date,
      tempHighC: data.daily.temperature_2m_max[i],
      tempLowC: data.daily.temperature_2m_min[i],
      conditionKey: wmoCodeToConditionKey(data.daily.weather_code[i]),
      icon: wmoCodeToIcon(data.daily.weather_code[i]),
      precipitationProbability: data.daily.precipitation_probability_max[i],
    })),
  };
}
