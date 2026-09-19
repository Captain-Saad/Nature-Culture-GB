import type { SituationReport as DbSituationReport } from "@prisma/client";

/**
 * Shapes a DB row into exactly the object frontend/lib/mock-data/
 * situationReports.ts exports today.
 */
export function serializeSituationReport(r: DbSituationReport) {
  return {
    id: r.id,
    title: r.title,
    region: r.region,
    status: r.status,
    description: r.details,
    source: r.source,
    // Additive: existing consumers reading the fields above are unaffected.
    imageUrl: r.imageUrl,
    timestamp: r.reportedAt.toISOString(),
  };
}
