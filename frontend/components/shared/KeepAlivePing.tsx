"use client";

import { useEffect } from "react";

/**
 * Render's free tier spins a web service down after ~15 minutes with no
 * traffic (next request pays a ~30-50s cold-start), and Supabase pauses
 * a free-tier project after a week with no database activity. Hitting
 * the backend's /health on an interval -- which itself runs a real
 * query, see backend/src/app.ts -- keeps both from happening for as
 * long as anyone has any page of this site open.
 *
 * This is not a substitute for an external scheduled pinger: it only
 * runs in a visitor's browser, so a stretch with zero visitors still
 * lets both services go idle and the next real visitor eats the cold
 * start. Pair this with something like a GitHub Actions cron or
 * UptimeRobot hitting /health on the same cadence if that gap matters.
 */
const PING_INTERVAL_MS = 10 * 60 * 1000; // 10 min -- safely under Render's ~15 min spin-down window

export default function KeepAlivePing() {
  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL;
    if (!base) return;

    let cancelled = false;

    async function ping() {
      try {
        const res = await fetch(`${base}/health`, { cache: "no-store" });
        if (!cancelled) {
          console.debug(`[keep-alive] ping ${res.ok ? "ok" : `failed (HTTP ${res.status})`}`);
        }
      } catch (err) {
        if (!cancelled) {
          console.debug("[keep-alive] ping failed:", err instanceof Error ? err.message : err);
        }
      }
    }

    ping();
    const id = setInterval(ping, PING_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return null;
}
