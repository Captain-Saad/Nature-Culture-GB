import { wmoCodeToCondition } from "../lib/wmoCondition";

const FORECAST_DAYS = 5;

interface OpenMeteoResponse {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    weather_code: number;
    wind_speed_10m: number;
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weather_code: number[];
  };
}

export interface NormalizedWeather {
  tempC: number;
  condition: string | null;
  humidity: number;
  windKph: number;
  forecast: {
    day: string;
    tempHighC: number;
    tempLowC: number;
    condition: string | null;
  }[];
}

function dayLabel(isoDate: string) {
  // "2026-09-14" -> "Sun" -- avoids a timezone-shift bug from
  // `new Date("2026-09-14")` being parsed as UTC midnight.
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { weekday: "short" });
}

/**
 * Fetches current conditions + a short forecast from Open-Meteo (free,
 * no API key). Throws on any failure -- the caller (routes/weather.ts)
 * decides how to degrade for that one city, this function doesn't paper
 * over errors with fabricated numbers.
 */
export async function fetchWeather(lat: number, lng: number): Promise<NormalizedWeather> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lng));
  url.searchParams.set("current", "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m");
  url.searchParams.set("daily", "temperature_2m_max,temperature_2m_min,weather_code");
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("forecast_days", String(FORECAST_DAYS));

  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) {
    throw new Error(`Open-Meteo request failed: ${res.status}`);
  }
  const data = (await res.json()) as OpenMeteoResponse;

  return {
    tempC: data.current.temperature_2m,
    condition: wmoCodeToCondition(data.current.weather_code),
    humidity: data.current.relative_humidity_2m,
    windKph: data.current.wind_speed_10m,
    forecast: data.daily.time.map((isoDate, i) => ({
      day: dayLabel(isoDate),
      tempHighC: data.daily.temperature_2m_max[i],
      tempLowC: data.daily.temperature_2m_min[i],
      condition: wmoCodeToCondition(data.daily.weather_code[i]),
    })),
  };
}
