/**
 * Pakistan Standard Time helpers for the flight schedule. PKT is a fixed
 * UTC+5 with no DST, so plain offset arithmetic is exact -- no tz database
 * needed.
 */
const PKT_OFFSET_MS = 5 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** "YYYY-MM-DD" for the given instant's calendar date in Pakistan. */
export function pktDateString(at: Date = new Date()): string {
  return new Date(at.getTime() + PKT_OFFSET_MS).toISOString().slice(0, 10);
}

/**
 * The most recent instant (at or before `at`) whose Pakistan wall-clock
 * time was hh:mm.
 */
export function lastPktTime(hour: number, minute: number, at: Date = new Date()): Date {
  const pkt = new Date(at.getTime() + PKT_OFFSET_MS);
  const candidate =
    Date.UTC(pkt.getUTCFullYear(), pkt.getUTCMonth(), pkt.getUTCDate(), hour, minute) - PKT_OFFSET_MS;
  return new Date(candidate <= at.getTime() ? candidate : candidate - DAY_MS);
}

/** The next instant (strictly after `at`) whose Pakistan wall-clock time is hh:mm. */
export function nextPktTime(hour: number, minute: number, at: Date = new Date()): Date {
  return new Date(lastPktTime(hour, minute, at).getTime() + DAY_MS);
}
