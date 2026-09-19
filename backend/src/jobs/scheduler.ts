import { prisma } from "../lib/prisma";
import { refreshFlights } from "./refreshFlights";

/**
 * Once daily -- see refreshFlights.ts for the request-budget math this
 * cadence is based on. Change this one constant to adjust it.
 */
const REFRESH_INTERVAL_MS = 24 * 60 * 60 * 1000;

async function isCacheFresh(): Promise<boolean> {
  const mostRecent = await prisma.flightStatusCache.findFirst({
    orderBy: { updatedAt: "desc" },
    select: { updatedAt: true },
  });
  if (!mostRecent) return false;
  return Date.now() - mostRecent.updatedAt.getTime() < REFRESH_INTERVAL_MS;
}

/**
 * Simple setInterval-based scheduling rather than a cron dependency --
 * this project has no job queue, and one recurring task doesn't
 * warrant adding one. Runs once on boot, skipping that run if the
 * cache is already fresh -- `tsx watch` (and any other process
 * supervisor) restarts the server on every file save in dev, and
 * without this check each restart would spend 2 more of the ~100
 * requests/month AviationStack allows. The recurring setInterval below
 * is naturally rate-limited by its own interval regardless.
 */
export function startScheduledJobs(): void {
  if (!process.env.AVIATIONSTACK_API_KEY) {
    console.warn(
      "AVIATIONSTACK_API_KEY is not set -- flight status will report unavailable until it's configured."
    );
  }

  isCacheFresh()
    .then((fresh) => {
      if (fresh) {
        console.log("Flight status cache is still fresh -- skipping the on-boot refresh.");
        return;
      }
      return refreshFlights();
    })
    .catch((err) => console.error("Initial flight refresh failed:", err));

  setInterval(() => {
    refreshFlights().catch((err) => console.error("Scheduled flight refresh failed:", err));
  }, REFRESH_INTERVAL_MS);
}
