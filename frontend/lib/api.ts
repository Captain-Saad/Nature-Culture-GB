import "server-only";
import type {
  Destination,
  Hotel,
  Mountain,
  TourPackage,
  Review,
  SituationReport,
  WeatherEntry,
  Flight,
} from "@/lib/types";

/**
 * Public, read-only content API — destinations, hotels, mountains,
 * packages, reviews, situation reports, weather and flights, all backed
 * by the real database and edited from /admin. `cache: "no-store"` on
 * every call so admin edits show up without a redeploy, matching
 * lib/site-settings.ts's existing pattern.
 *
 * Every getter degrades to `null`/`[]` on a network failure or missing
 * NEXT_PUBLIC_API_URL rather than throwing, so a page still renders
 * (with an empty section) if the backend is briefly unreachable.
 */

const base = process.env.NEXT_PUBLIC_API_URL;

async function getJSON<T>(path: string): Promise<T | null> {
  if (!base) return null;
  try {
    const res = await fetch(`${base}${path}`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch (err) {
    console.error(`getJSON(${path}) failed:`, err);
    return null;
  }
}

export async function getDestinations(): Promise<Destination[]> {
  return (await getJSON<Destination[]>("/destinations")) ?? [];
}

export async function getDestinationBySlug(slug: string): Promise<Destination | null> {
  return getJSON<Destination>(`/destinations/${encodeURIComponent(slug)}`);
}

export async function getDestinationsByIds(ids: string[]): Promise<Destination[]> {
  const destinations = await getDestinations();
  return destinations.filter((d) => ids.includes(d.id));
}

export async function getHotels(): Promise<Hotel[]> {
  return (await getJSON<Hotel[]>("/hotels")) ?? [];
}

export async function getHotelBySlug(slug: string): Promise<Hotel | null> {
  return getJSON<Hotel>(`/hotels/${encodeURIComponent(slug)}`);
}

export async function getHotelsByIds(ids: string[]): Promise<Hotel[]> {
  const hotels = await getHotels();
  return hotels.filter((h) => ids.includes(h.id));
}

export async function getMountains(): Promise<Mountain[]> {
  return (await getJSON<Mountain[]>("/mountains")) ?? [];
}

export async function getMountainBySlug(slug: string): Promise<Mountain | null> {
  return getJSON<Mountain>(`/mountains/${encodeURIComponent(slug)}`);
}

export async function getPackages(): Promise<TourPackage[]> {
  return (await getJSON<TourPackage[]>("/packages")) ?? [];
}

export async function getPackageBySlug(slug: string): Promise<TourPackage | null> {
  return getJSON<TourPackage>(`/packages/${encodeURIComponent(slug)}`);
}

export async function getReviews(): Promise<Review[]> {
  return (await getJSON<Review[]>("/reviews")) ?? [];
}

export async function getSituationReports(): Promise<SituationReport[]> {
  return (await getJSON<SituationReport[]>("/situation-reports")) ?? [];
}

export async function getWeather(): Promise<WeatherEntry[]> {
  return (await getJSON<WeatherEntry[]>("/weather")) ?? [];
}

export async function getFlights(): Promise<Flight[]> {
  return (await getJSON<Flight[]>("/flights")) ?? [];
}
