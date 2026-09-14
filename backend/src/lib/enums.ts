/**
 * Literal string unions for the fields stored as plain `String` columns
 * in schema.prisma (see the comment there for why these aren't Prisma
 * enums). Single source of truth for seed data, Zod validators, and any
 * TypeScript code that needs to narrow these values.
 */

export const HOTEL_CATEGORIES = ["Budget", "Mid-Range", "Luxury"] as const;
export type HotelCategory = (typeof HOTEL_CATEGORIES)[number];

export const PACKAGE_CATEGORIES = [
  "Adventure",
  "Honeymoon",
  "Family",
  "Budget Backpacker",
  "Luxury",
] as const;
export type PackageCategory = (typeof PACKAGE_CATEGORIES)[number];

export const TRANSPORT_MODES = ["Shared", "Private", "4x4 Jeep"] as const;
export type Transport = (typeof TRANSPORT_MODES)[number];

export const REGIONS = [
  "Skardu",
  "Hunza",
  "Gilgit",
  "Astore",
  "Ghizer",
  "Nagar",
  "Diamer",
  "Ghanche",
  "Shigar",
  "Kharmang",
] as const;
export type Region = (typeof REGIONS)[number];

export const DIFFICULTIES = ["Easy", "Moderate", "Challenging", "Extreme"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];
