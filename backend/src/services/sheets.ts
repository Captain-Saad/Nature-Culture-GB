import type { TripLead } from "@prisma/client";
import { SHEET_HEADERS, leadSheetRow } from "../lib/leadDetails";

/**
 * Mirrors trip leads into the client's Google Sheet through an Apps Script
 * web app bound to that sheet (source: integrations/google-sheets/LeadsSheet.gs).
 * Each call upserts rows keyed on "Lead ID": a new lead adds a row, a status
 * change rewrites that lead's row.
 *
 * Like email, this never throws and never blocks a lead from being saved --
 * the DB is the source of truth, and "Sync all leads" in Admin → Leads
 * re-sends everything if the sheet ever falls behind.
 */
const ATTEMPTS = 3;
// Apps Script cold starts regularly take 15-20s.
const TIMEOUT_MS = 45_000;

type AttemptResult = { ok: true; count: number } | { ok: false; reason: string; retryable: boolean };

async function postOnce(url: string, payload: string): Promise<AttemptResult> {
  try {
    // Apps Script answers a POST with a 302 to the script's output; fetch
    // follows it (as a GET), which is how its JSON reply comes back.
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const text = await res.text();
    let body: { ok?: boolean; error?: string; count?: number } | null = null;
    try {
      body = JSON.parse(text);
    } catch {
      // Not JSON: Google's HTML error page. Seen transiently (404/5xx) on a
      // healthy deployment, and permanently if the URL/access is wrong.
    }
    if (body?.ok) return { ok: true, count: body.count ?? 0 };
    if (body?.error) {
      // The script ran and refused (e.g. bad secret) -- retrying won't help.
      return { ok: false, reason: body.error, retryable: false };
    }
    return {
      ok: false,
      reason: `unexpected response (HTTP ${res.status}) — check the web app URL and that it's deployed with access "Anyone"`,
      retryable: true,
    };
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : "request failed", retryable: true };
  }
}

export async function upsertLeadsInSheet(
  leads: TripLead[]
): Promise<{ ok: boolean; count?: number; reason?: string }> {
  const url = process.env.SHEETS_WEBHOOK_URL?.trim();
  const secret = process.env.SHEETS_WEBHOOK_SECRET?.trim();
  if (!url || !secret) return { ok: false, reason: "Google Sheet not configured" };
  if (leads.length === 0) return { ok: true, count: 0 };

  const payload = JSON.stringify({ secret, headers: SHEET_HEADERS, rows: leads.map(leadSheetRow) });

  // Upserts are keyed on Lead ID, so retrying (even after a timeout that
  // may have been applied on Google's side) can never duplicate a row.
  let last: AttemptResult = { ok: false, reason: "not attempted", retryable: true };
  for (let attempt = 1; attempt <= ATTEMPTS; attempt += 1) {
    last = await postOnce(url, payload);
    if (last.ok) return { ok: true, count: last.count || leads.length };
    if (!last.retryable) break;
    if (attempt < ATTEMPTS) {
      console.warn(`[sheets] Attempt ${attempt} failed (${last.reason}); retrying…`);
      await new Promise((r) => setTimeout(r, attempt * 2000));
    }
  }
  console.error(`[sheets] Sync failed: ${last.ok ? "" : last.reason}`);
  return { ok: false, reason: last.ok ? undefined : last.reason };
}

/** Fire-and-forget variant for request handlers: the response never waits on Google. */
export function syncLeadInBackground(lead: TripLead): void {
  void upsertLeadsInSheet([lead]);
}
