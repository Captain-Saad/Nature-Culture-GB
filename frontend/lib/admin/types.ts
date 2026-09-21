import type { CartItem } from "@/lib/tripCart/types";

/**
 * Raw DB/Prisma-shaped types for the admin API (see backend's
 * adminCrudRouter.ts: admin responses use Prisma field names directly,
 * e.g. `longDescription`, not the public API's renamed `description`).
 * Deliberately separate from frontend/lib/types.ts, which describes the
 * public site's contract.
 */
export interface AdminDestination {
  id: string;
  slug: string;
  name: string;
  region: string;
  images: string[];
  videos: string[];
  shortDescription: string;
  longDescription: string;
  bestTimeToVisit: string;
  estimatedDurationDays: number;
  estimatedDurationLabel: string;
  activities: string[];
  difficulty: string;
  approxCostMinPKR: number;
  approxCostMaxPKR: number;
  nearbyHotelIds: string[];
  nearbyAttractionIds: string[];
  lat: number;
  lng: number;
  createdAt: string;
  updatedAt: string;
}

export type AdminDestinationInput = Omit<AdminDestination, "id" | "createdAt" | "updatedAt">;

/**
 * Room *types*, stored as JSON on Hotel rather than their own table (see
 * backend/prisma/schema.prisma). Edited from within the hotel form, so they
 * travel as part of the hotel payload.
 */
export interface AdminRoomType {
  type: string;
  capacity: number;
  estimatedPricePKR: number;
  images: string[];
  videos: string[];
  bedConfig: string;
  maxOccupancy: { adults: number; children: number };
  sizeSqFt?: number;
  facilities: string[];
}

export interface AdminHotel {
  id: string;
  slug: string;
  name: string;
  /** Prisma field name; the public API renames this to `city`. */
  region: string;
  images: string[];
  videos: string[];
  description?: string | null;
  starRating: number;
  category: string;
  estimatedPricePerNightPKR: number;
  /** ISO timestamp from the API; the form edits it as a yyyy-mm-dd date. */
  priceLastUpdated: string;
  facilities: string[];
  roomTypes: AdminRoomType[];
  cancellationPolicy: string;
  lat: number;
  lng: number;
  createdAt: string;
  updatedAt: string;
}

export type AdminHotelInput = Omit<AdminHotel, "id" | "createdAt" | "updatedAt">;

export interface AdminMountain {
  id: string;
  slug: string;
  name: string;
  heightMeters: number;
  range: string;
  difficulty: string;
  images: string[];
  videos: string[];
  description: string;
  firstAscent?: string | null;
  bestSeason?: string | null;
  worldRank: number;
  nearestTown: string;
  lat: number;
  lng: number;
  createdAt: string;
  updatedAt: string;
}

export type AdminMountainInput = Omit<AdminMountain, "id" | "createdAt" | "updatedAt">;

/**
 * One day of a package itinerary. Stored as JSON on Package, pre-shaped to
 * the public contract's ItineraryDay (see frontend/lib/types.ts) -- `day` is
 * the 1-based position and is renumbered whenever days are reordered.
 */
export interface AdminItineraryDay {
  day: number;
  title: string;
  description: string;
  meals?: string[];
  overnightAt?: string;
}

export interface AdminPackage {
  id: string;
  slug: string;
  title: string;
  category: string;
  durationDays: number;
  images: string[];
  videos: string[];
  estimatedPriceMinPKR: number;
  estimatedPriceMaxPKR: number;
  /** ISO timestamp from the API; the form edits it as a yyyy-mm-dd date. */
  priceLastUpdated: string;
  highlights: string[];
  itinerary: AdminItineraryDay[];
  included: string[];
  excluded: string[];
  regions: string[];
  createdAt: string;
  updatedAt: string;
}

export type AdminPackageInput = Omit<AdminPackage, "id" | "createdAt" | "updatedAt">;

export interface AdminSituationReport {
  id: string;
  title: string;
  region: string;
  status: string;
  details: string;
  source: string;
  imageUrl?: string | null;
  /** ISO timestamp; the form edits it as a datetime-local value. */
  reportedAt: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type AdminSituationReportInput = Omit<
  AdminSituationReport,
  "id" | "createdAt" | "updatedAt"
>;

/**
 * Enquiries from the public "Plan My Trip" form. Read-only apart from
 * `status` -- an admin works a lead, they don't author one.
 */
export interface AdminTripLead {
  id: string;
  name: string;
  /** Phone or email, whichever the visitor gave. */
  contact: string;
  email: string | null;
  // Plan-My-Trip wizard fields -- null when this lead came from the cart
  // checkout flow instead (see cartItems/preferredDates/notes below).
  startingCity: string | null;
  destinationIds: string[];
  days: number | null;
  travelers: number | null;
  budgetPKR: number | null;
  hotelCategory: string | null;
  transport: string | null;
  activities: string[];
  // Cart checkout flow fields -- [] / null when this lead came from the
  // wizard instead.
  cartItems: CartItem[];
  preferredDates: string | null;
  notes: string | null;
  status: "NEW" | "CONTACTED" | "CLOSED";
  createdAt: string;
}

/** Messages from the public contact form. Status is NEW | READ. */
export interface AdminContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: "NEW" | "READ";
  createdAt: string;
}

/**
 * The site-settings singleton. Every field is nullable: null means "not set,
 * use the built-in default" rather than "empty".
 */
export interface AdminSiteSettings {
  id: string;
  heroHeadline: string | null;
  heroSubtext: string | null;
  aboutUsCopy: string | null;
  contactDisplayText: string | null;
  heroBackgroundImage: string | null;
  heroBackgroundVideo: string | null;
  updatedAt: string;
}
