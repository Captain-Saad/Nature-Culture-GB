import { prisma } from "../lib/prisma";
import { FLIGHT_ROUTES } from "../lib/flightRoutes";
import { fetchRouteFlight, countRequestsThisMonth } from "../services/aviationstack";

/**
 * Refreshes every configured route leg's cached flight status.
 *
 * Request budget: AviationStack's free tier allows ~100 requests/month
 * and each leg costs one request per run (dep_iata/arr_iata can't be
 * combined into a single call for two legs). With 2 legs (ISB->KDU,
 * KDU->ISB) run once every REFRESH_INTERVAL_MS:
 *   2 legs x 1 run/day x ~30.4 days/month ~= 61 requests/month
 * That's ~61% of the free tier, leaving headroom for manual testing
 * and the occasional retry. A 2-4x/day cadence (as a first pass at this
 * suggested) would cost 122-244 requests/month for 2 legs -- already
 * over budget before accounting for anything else -- so this runs once
 * daily instead. See countRequestsThisMonth() usage below for the
 * early-warning check; bump REFRESH_INTERVAL_MS in
 * backend/src/jobs/scheduler.ts if you'd rather trade freshness for
 * some of that headroom (or drop to one leg to afford running twice a
 * day).
 */
export async function refreshFlights(): Promise<void> {
  for (const leg of FLIGHT_ROUTES) {
    try {
      const flight = await fetchRouteFlight(leg);

      if (!flight) {
        await prisma.flightStatusCache.upsert({
          where: { id: leg.id },
          create: {
            id: leg.id,
            airline: leg.airline,
            origin: leg.originLabel,
            destination: leg.destinationLabel,
            available: false,
            message: "No flight scheduled today",
          },
          update: {
            available: false,
            flightNumber: null,
            status: null,
            scheduledDeparture: null,
            estimatedDeparture: null,
            message: "No flight scheduled today",
            lastFetchedAt: null,
          },
        });
        continue;
      }

      // The carrier actually flying a route isn't fixed -- Airblue and PIA
      // both serve GB routes and which one shows up can vary day to day
      // -- so the API's answer always wins over FLIGHT_ROUTES' label,
      // which is only a fallback for the rare case AviationStack omits it.
      const airline = flight.airline ?? leg.airline;

      await prisma.flightStatusCache.upsert({
        where: { id: leg.id },
        create: {
          id: leg.id,
          airline,
          origin: leg.originLabel,
          destination: leg.destinationLabel,
          available: true,
          flightNumber: flight.flightNumber,
          status: flight.status,
          scheduledDeparture: flight.scheduledDeparture ? new Date(flight.scheduledDeparture) : null,
          estimatedDeparture: flight.estimatedDeparture ? new Date(flight.estimatedDeparture) : null,
          message: null,
          lastFetchedAt: new Date(),
        },
        update: {
          airline,
          available: true,
          flightNumber: flight.flightNumber,
          status: flight.status,
          scheduledDeparture: flight.scheduledDeparture ? new Date(flight.scheduledDeparture) : null,
          estimatedDeparture: flight.estimatedDeparture ? new Date(flight.estimatedDeparture) : null,
          message: null,
          lastFetchedAt: new Date(),
        },
      });
    } catch (err) {
      console.error(`Flight refresh failed for ${leg.id}:`, err);
      await prisma.flightStatusCache.upsert({
        where: { id: leg.id },
        create: {
          id: leg.id,
          airline: leg.airline,
          origin: leg.originLabel,
          destination: leg.destinationLabel,
          available: false,
          message: "Live flight data unavailable",
        },
        update: {
          available: false,
          flightNumber: null,
          status: null,
          scheduledDeparture: null,
          estimatedDeparture: null,
          message: "Live flight data unavailable",
          lastFetchedAt: null,
        },
      });
    }
  }

  const usedThisMonth = await countRequestsThisMonth();
  if (usedThisMonth >= 80) {
    console.warn(
      `AviationStack usage warning: ${usedThisMonth} requests this calendar month (free tier ceiling is ~100).`
    );
  }
}
