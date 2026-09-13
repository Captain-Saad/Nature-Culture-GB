import { destinations } from "./destinations";
import { hotels } from "./hotels";
import { mountains } from "./mountains";
import { packages } from "./packages";
import { weather } from "./weather";
import { flights } from "./flights";
import { situationReports } from "./situationReports";
import { reviews } from "./reviews";

/**
 * Every getter below returns a Promise, mirroring the shape of the real
 * API calls that will replace them in the backend-wiring pass — call
 * sites should not need to change, only these implementations.
 */
export async function getDestinations() {
  return destinations;
}

export async function getDestinationBySlug(slug: string) {
  return destinations.find((d) => d.slug === slug) ?? null;
}

export async function getHotels() {
  return hotels;
}

export async function getHotelBySlug(slug: string) {
  return hotels.find((h) => h.slug === slug) ?? null;
}

export async function getHotelsByIds(ids: string[]) {
  return hotels.filter((h) => ids.includes(h.id));
}

export async function getMountains() {
  return mountains;
}

export async function getMountainBySlug(slug: string) {
  return mountains.find((m) => m.slug === slug) ?? null;
}

export async function getPackages() {
  return packages;
}

export async function getPackageBySlug(slug: string) {
  return packages.find((p) => p.slug === slug) ?? null;
}

export async function getWeather() {
  return weather;
}

export async function getFlights() {
  return flights;
}

export async function getSituationReports() {
  return situationReports;
}

export async function getReviews() {
  return reviews;
}

export async function getDestinationsByIds(ids: string[]) {
  return destinations.filter((d) => ids.includes(d.id));
}

export {
  destinations,
  hotels,
  mountains,
  packages,
  weather,
  flights,
  situationReports,
  reviews,
};
