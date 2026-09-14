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
