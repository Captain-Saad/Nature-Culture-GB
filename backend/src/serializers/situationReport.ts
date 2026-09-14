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
    timestamp: r.reportedAt.toISOString(),
  };
}
