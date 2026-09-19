import { Router } from "express";
import { prisma } from "../lib/prisma";
import { FLIGHT_ROUTES } from "../lib/flightRoutes";

const router = Router();

/**
 * GET /flights -- serves whatever the refresh job (backend/src/jobs/
 * refreshFlights.ts) last wrote to FlightStatusCache. Never calls
 * AviationStack itself: that job runs on its own schedule precisely so
 * that page-load traffic can't touch the free tier's ~100
 * requests/month ceiling.
 */
router.get("/", async (_req, res) => {
  const rows = await prisma.flightStatusCache.findMany();
  const byId = new Map(rows.map((r) => [r.id, r]));

  const routes = FLIGHT_ROUTES.map((leg) => {
    const row = byId.get(leg.id);
    if (!row) {
      // The refresh job hasn't run yet at all (e.g. a brand new deploy).
      return {
        id: leg.id,
        airline: leg.airline,
        origin: leg.originLabel,
        destination: leg.destinationLabel,
        available: false,
        flightNumber: null,
        status: null,
        scheduledDeparture: null,
        estimatedDeparture: null,
        message: "Live flight data unavailable",
        lastUpdated: null,
      };
    }

    return {
      id: row.id,
      airline: row.airline,
      origin: row.origin,
      destination: row.destination,
      available: row.available,
      flightNumber: row.flightNumber,
      status: row.status,
      scheduledDeparture: row.scheduledDeparture?.toISOString() ?? null,
      estimatedDeparture: row.estimatedDeparture?.toISOString() ?? null,
      message: row.message,
      lastUpdated: row.lastFetchedAt?.toISOString() ?? null,
    };
  });

  res.json(routes);
});

export default router;
