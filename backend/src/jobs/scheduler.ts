import { prisma } from "../lib/prisma";
import { FLIGHT_ROUTES, type FlightRouteLeg } from "../lib/flightRoutes";
import { lastPktTime, nextPktTime } from "../lib/pakistanTime";
import { countRequestsThisMonth } from "../services/aviationstack";
import { refreshFlights } from "./refreshFlights";

/**
 * The daily refresh runs at 00:01 Pakistan time, so the site shows the new
 * day's flights from the first minute of the day. Anchored to the wall clock
 * rather than "24h since the last run": that version drifted with every
 * server restart (Render restarts and redeploys freely), landing anywhere
 * from late evening to mid-afternoon and showing yesterday's flights for
 * most of the day.
 */
const DAILY_REFRESH = { hour: 0, minute: 1 };

/**
 * A leg with no flight at the 00:01 run gets one retry from 03:00 PKT, in
 * case AviationStack hadn't published the new day's schedule yet.
 */
const RETRY_AFTER = { hour: 3, minute: 0 };

/** Retries are optional; stop spending on them as the ~100/month free tier nears its end. */
const RETRY_BUDGET_CEILING = 85;

/**
 * Safety net for a missed timer: Render's free instance can be asleep or
 * restarting at 00:01, and setTimeout doesn't survive either. This check is
 * a DB read only -- AviationStack is called only when a refresh is due.
 */
const CATCH_UP_CHECK_MS = 15 * 60 * 1000;

let running = false;

async function legsDue(now: Date): Promise<{ legs: FlightRouteLeg[]; isRetry: boolean }> {
  const rows = await prisma.flightStatusCache.findMany({
    select: { id: true, available: true, updatedAt: true },
  });
  const byId = new Map(rows.map((r) => [r.id, r]));

  const todaysRun = lastPktTime(DAILY_REFRESH.hour, DAILY_REFRESH.minute, now);
  const missedDaily = FLIGHT_ROUTES.filter((leg) => {
    const row = byId.get(leg.id);
    return !row || row.updatedAt < todaysRun;
  });
  if (missedDaily.length > 0) return { legs: missedDaily, isRetry: false };

  // Only once it's past 03:00 today (lastPktTime would otherwise return
  // yesterday's 03:00, which every row updated at 00:01 is already past).
  const retryAt = lastPktTime(RETRY_AFTER.hour, RETRY_AFTER.minute, now);
  if (retryAt < todaysRun) return { legs: [], isRetry: true };

  const retry = FLIGHT_ROUTES.filter((leg) => {
    const row = byId.get(leg.id);
    return row && !row.available && row.updatedAt < retryAt;
  });
  return { legs: retry, isRetry: true };
}

async function runIfDue(): Promise<void> {
  if (running) return;
  running = true;
  try {
    const { legs, isRetry } = await legsDue(new Date());
    if (legs.length === 0) return;

    if (isRetry && (await countRequestsThisMonth()) >= RETRY_BUDGET_CEILING) return;

    console.log(
      `Refreshing flight status (${isRetry ? "retry" : "daily"}): ${legs.map((l) => l.id).join(", ")}`
    );
    await refreshFlights(legs);
  } finally {
    running = false;
  }
}

function scheduleNextDaily(): void {
  const next = nextPktTime(DAILY_REFRESH.hour, DAILY_REFRESH.minute);
  // A few seconds late so the run never lands a hair before 00:01.
  setTimeout(() => {
    runIfDue().catch((err) => console.error("Scheduled flight refresh failed:", err));
    scheduleNextDaily();
  }, next.getTime() - Date.now() + 5000);
}

/**
 * Simple timer-based scheduling rather than a cron dependency -- this
 * project has no job queue, and one recurring task doesn't warrant adding
 * one. On boot it only refreshes what's actually due, so `tsx watch`
 * restarting on every save in dev doesn't spend requests.
 */
export function startScheduledJobs(): void {
  if (!process.env.AVIATIONSTACK_API_KEY) {
    console.warn(
      "AVIATIONSTACK_API_KEY is not set -- flight status will report unavailable until it's configured."
    );
  }

  runIfDue().catch((err) => console.error("Initial flight refresh failed:", err));
  scheduleNextDaily();
  setInterval(() => {
    runIfDue().catch((err) => console.error("Catch-up flight refresh failed:", err));
  }, CATCH_UP_CHECK_MS);
}
