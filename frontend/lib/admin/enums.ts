/**
 * Mirrors backend/src/lib/enums.ts -- these are plain string fields on
 * the backend (not Prisma enums, see that file's comment for why), so
 * the frontend just needs the same literal value lists for admin form
 * dropdowns. Kept here rather than shared across repos since frontend
 * and backend are independently deployable.
 */
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

export const DIFFICULTIES = ["Easy", "Moderate", "Challenging", "Extreme"] as const;

export const HOTEL_CATEGORIES = ["Budget", "Mid-Range", "Luxury"] as const;

export const PACKAGE_CATEGORIES = ["Adventure", "Honeymoon", "Family", "Budget Backpacker", "Luxury"] as const;

export const SITUATION_STATUSES = ["Open", "Closed", "Restricted"] as const;
