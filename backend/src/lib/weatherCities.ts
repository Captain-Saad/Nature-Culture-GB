import type { Region } from "./enums";

/**
 * Every location the Weather page covers, with real coordinates (not
 * all approximated to Skardu) and each town's approximate elevation in
 * meters. Elevation is passed to Open-Meteo so its forecast model
 * applies a lapse-rate correction for the requested point rather than
 * using its native grid cell's elevation, which matters a lot here --
 * Deosai's plateau (~4,100m) sits only ~40km from Skardu (~2,230m) but
 * is dramatically colder, and a coarse grid could otherwise blur the
 * two together.
 *
 * `region` is a Region enum value where the location has one; Deosai is
 * a national park, not an administrative region, so it's `null` and
 * carries its own display `label` instead.
 */
export interface WeatherLocation {
  /** URL-safe id for GET /weather/:location. */
  slug: string;
  /** Display name. */
  label: string;
  region: Region | null;
  lat: number;
  lng: number;
  elevation: number;
}

export const WEATHER_LOCATIONS: WeatherLocation[] = [
  { slug: "skardu", label: "Skardu", region: "Skardu", lat: 35.2971, lng: 75.6333, elevation: 2230 },
  { slug: "gilgit", label: "Gilgit", region: "Gilgit", lat: 35.9208, lng: 74.3144, elevation: 1500 },
  { slug: "hunza", label: "Hunza (Karimabad)", region: "Hunza", lat: 36.3157, lng: 74.6512, elevation: 2500 },
  { slug: "astore", label: "Astore", region: "Astore", lat: 35.3672, lng: 74.9006, elevation: 2600 },
  { slug: "khaplu", label: "Khaplu", region: "Ghanche", lat: 35.1747, lng: 76.331, elevation: 2560 },
  { slug: "shigar", label: "Shigar", region: "Shigar", lat: 35.4236, lng: 75.7461, elevation: 2300 },
  { slug: "nagar", label: "Nagar", region: "Nagar", lat: 36.1667, lng: 74.7333, elevation: 2100 },
  { slug: "ghizer", label: "Gahkuch (Ghizer)", region: "Ghizer", lat: 36.1667, lng: 73.75, elevation: 1600 },
  { slug: "diamer", label: "Chilas (Diamer)", region: "Diamer", lat: 35.4222, lng: 74.1002, elevation: 1250 },
  { slug: "kharmang", label: "Kharmang (Tolti)", region: "Kharmang", lat: 34.9333, lng: 76.1167, elevation: 2400 },
  // ~40km south of Skardu on the Deosai plateau -- kept separate from
  // Skardu's entry above because the elevation difference (~1,900m)
  // makes for genuinely different weather, not a rounding error.
  { slug: "deosai", label: "Deosai Plains", region: null, lat: 34.95, lng: 75.4167, elevation: 4114 },
];
