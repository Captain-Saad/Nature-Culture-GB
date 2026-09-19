/**
 * Open-Meteo returns WMO weather interpretation codes (WMO Code Table
 * 4677) rather than a text condition. This maps each code to a stable
 * key (translated frontend-side via next-intl, not baked into English
 * here) and to a small icon identifier the frontend renders an
 * emoji/icon for.
 */
const WMO_CONDITION_KEYS: Record<number, string> = {
  0: "clearSky",
  1: "mainlyClear",
  2: "partlyCloudy",
  3: "overcast",
  45: "fog",
  48: "depositingRimeFog",
  51: "lightDrizzle",
  53: "moderateDrizzle",
  55: "denseDrizzle",
  56: "lightFreezingDrizzle",
  57: "denseFreezingDrizzle",
  61: "slightRain",
  63: "moderateRain",
  65: "heavyRain",
  66: "lightFreezingRain",
  67: "heavyFreezingRain",
  71: "slightSnowFall",
  73: "moderateSnowFall",
  75: "heavySnowFall",
  77: "snowGrains",
  80: "slightRainShowers",
  81: "moderateRainShowers",
  82: "violentRainShowers",
  85: "slightSnowShowers",
  86: "heavySnowShowers",
  95: "thunderstorm",
  96: "thunderstormSlightHail",
  99: "thunderstormHeavyHail",
};

/**
 * A much smaller set than the condition keys above -- just enough
 * distinct pictures for the frontend to pick an icon/emoji from.
 * "clear" and "partlyCloudy" additionally split on day/night since
 * Open-Meteo's `is_day` flag makes that free to get right.
 */
const WMO_ICON_GROUPS: { codes: number[]; icon: string }[] = [
  { codes: [0], icon: "clear" },
  { codes: [1, 2], icon: "partly-cloudy" },
  { codes: [3], icon: "cloudy" },
  { codes: [45, 48], icon: "fog" },
  { codes: [51, 53, 55, 56, 57], icon: "drizzle" },
  { codes: [61, 63, 65, 66, 67, 80, 81, 82], icon: "rain" },
  { codes: [71, 73, 75, 77, 85, 86], icon: "snow" },
  { codes: [95, 96, 99], icon: "thunderstorm" },
];

const CODE_TO_ICON: Record<number, string> = Object.fromEntries(
  WMO_ICON_GROUPS.flatMap(({ codes, icon }) => codes.map((code) => [code, icon]))
);

export function wmoCodeToConditionKey(code: number | null | undefined): string | null {
  if (code === null || code === undefined) return null;
  return WMO_CONDITION_KEYS[code] ?? "unknown";
}

/**
 * `isDay` (from Open-Meteo's `current.is_day`) only makes sense for
 * current conditions -- daily forecast entries are day-representative
 * already, so callers pass `true` (the default) for those.
 */
export function wmoCodeToIcon(code: number | null | undefined, isDay = true): string | null {
  if (code === null || code === undefined) return null;
  const base = CODE_TO_ICON[code] ?? "unknown";
  if (!isDay && (base === "clear" || base === "partly-cloudy")) {
    return `${base}-night`;
  }
  return base;
}
