/**
 * Maps the backend's small icon-key vocabulary (see
 * backend/src/lib/wmoCondition.ts) to an emoji. Kept separate from the
 * condition text so the backend stays presentation-agnostic.
 */
const WEATHER_ICONS: Record<string, string> = {
  clear: "☀️",
  "clear-night": "🌙",
  "partly-cloudy": "⛅",
  "partly-cloudy-night": "☁️",
  cloudy: "☁️",
  fog: "🌫️",
  drizzle: "🌦️",
  rain: "🌧️",
  snow: "🌨️",
  thunderstorm: "⛈️",
};

export function weatherIconEmoji(icon: string | null): string {
  if (!icon) return "❓";
  return WEATHER_ICONS[icon] ?? "❓";
}
