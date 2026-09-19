import { prisma } from "../lib/prisma";
import type { FlightRouteLeg } from "../lib/flightRoutes";

// The free tier is HTTP-only -- https:// fails outright on it, this
// isn't a mistake.
const AVIATIONSTACK_BASE_URL = "http://api.aviationstack.com/v1/flights";

const STATUS_MAP: Record<string, string> = {
  scheduled: "Scheduled",
  active: "Departed",
  landed: "Arrived",
  cancelled: "Cancelled",
  incident: "Cancelled",
  diverted: "Delayed",
};

interface AviationStackFlight {
  flight_date: string;
  flight_status: string;
  departure: {
    scheduled: string | null;
    estimated: string | null;
    delay: number | null;
  };
  airline: { name: string | null };
  flight: { iata: string | null };
}

interface AviationStackResponse {
  data?: AviationStackFlight[];
  error?: { code: string; message?: string };
}

export interface NormalizedFlight {
  /** From the API, not FLIGHT_ROUTES' config -- the carrier actually operating a route can differ (e.g. Airblue vs. PIA) and isn't guessable in advance. */
  airline: string | null;
  flightNumber: string | null;
  status: string | null;
  scheduledDeparture: string | null;
  estimatedDeparture: string | null;
}

function titleCase(name: string) {
  return name.replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * AviationStack's `departure.scheduled`/`estimated` for these two
 * airports come back as e.g. "2026-09-20T08:45:00+00:00" -- a real,
 * documented AviationStack quirk where the digits are Pakistan Standard
 * Time (confirmed against Airblue's own published schedule) but the
 * offset is mislabeled as UTC. Taken at face value, that string is 5
 * hours off from the real departure time. PKT has no DST, so this is a
 * flat -5h correction: reinterpret the given digits as Asia/Karachi
 * wall-clock time and return the real UTC instant.
 */
function fixMislabeledKarachiTimestamp(raw: string | null): string | null {
  if (!raw) return null;
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
  if (!match) return raw;
  const [year, month, day, hour, minute, second] = match.slice(1).map(Number);
  return new Date(Date.UTC(year, month - 1, day, hour - 5, minute, second)).toISOString();
}

async function logUsage(routeLegId: string, success: boolean, note?: string) {
  await prisma.apiUsageLog.create({
    data: { provider: "aviationstack", routeLegId, success, note },
  });
}

/**
 * Returns how many AviationStack calls have been logged since the 1st
 * of the current calendar month -- the free tier resets monthly, so
 * this is the number to watch against its ~100/month ceiling.
 */
export async function countRequestsThisMonth(): Promise<number> {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  return prisma.apiUsageLog.count({
    where: { provider: "aviationstack", createdAt: { gte: startOfMonth } },
  });
}

/**
 * Fetches today's flight for one route leg from AviationStack and
 * normalizes it. Throws on any failure (missing API key, network
 * error, non-2xx, or an `error` object in an otherwise-200 response --
 * AviationStack reports quota exhaustion that way) so the caller
 * decides how to degrade; this function doesn't paper over a failure
 * with fabricated or stale-looking data. Every attempt is logged via
 * logUsage so countRequestsThisMonth stays accurate even on failure.
 */
export async function fetchRouteFlight(leg: FlightRouteLeg): Promise<NormalizedFlight | null> {
  const apiKey = process.env.AVIATIONSTACK_API_KEY;
  if (!apiKey) {
    throw new Error("AVIATIONSTACK_API_KEY is not configured");
  }

  const url = new URL(AVIATIONSTACK_BASE_URL);
  url.searchParams.set("access_key", apiKey);
  url.searchParams.set("dep_iata", leg.originIata);
  url.searchParams.set("arr_iata", leg.destinationIata);
  url.searchParams.set("limit", "1");

  let res: Response;
  try {
    res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  } catch (err) {
    await logUsage(leg.id, false, `network error: ${err instanceof Error ? err.message : String(err)}`);
    throw err;
  }

  if (!res.ok) {
    await logUsage(leg.id, false, `HTTP ${res.status}`);
    throw new Error(`AviationStack request failed: ${res.status}`);
  }

  const data = (await res.json()) as AviationStackResponse;

  if (data.error) {
    await logUsage(leg.id, false, `API error: ${data.error.code} ${data.error.message ?? ""}`.trim());
    throw new Error(`AviationStack error: ${data.error.code}`);
  }

  await logUsage(leg.id, true);

  const flight = data.data?.[0];
  // A 200 with an empty `data` array means the route legitimately has
  // no flight in today's schedule (weather cancellation called in
  // advance, off-day, etc.) -- not a failure, just nothing to show.
  if (!flight) return null;

  const delayMinutes = flight.departure.delay ?? 0;
  let status = STATUS_MAP[flight.flight_status] ?? null;
  // AviationStack keeps flight_status as "scheduled"/"active" through a
  // delay rather than a distinct status -- delay minutes is the signal.
  if (delayMinutes > 0 && (status === "Scheduled" || status === "Departed")) {
    status = "Delayed";
  }

  return {
    airline: flight.airline.name ? titleCase(flight.airline.name) : null,
    flightNumber: flight.flight.iata,
    status,
    scheduledDeparture: fixMislabeledKarachiTimestamp(flight.departure.scheduled),
    estimatedDeparture: fixMislabeledKarachiTimestamp(flight.departure.estimated),
  };
}
