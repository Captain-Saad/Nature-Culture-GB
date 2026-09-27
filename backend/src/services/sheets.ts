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
export async function upsertLeadsInSheet(
  leads: TripLead[]
): Promise<{ ok: boolean; count?: number; reason?: string }> {
  const url = process.env.SHEETS_WEBHOOK_URL?.trim();
  const secret = process.env.SHEETS_WEBHOOK_SECRET?.trim();
  if (!url || !secret) return { ok: false, reason: "Google Sheet not configured" };
  if (leads.length === 0) return { ok: true, count: 0 };

  try {
    // Apps Script answers a POST with a 302 to the script's output; fetch
    // follows it (as a GET), which is how its JSON reply comes back.
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, headers: SHEET_HEADERS, rows: leads.map(leadSheetRow) }),
      signal: AbortSignal.timeout(30000),
    });
    const text = await res.text();
    let body: { ok?: boolean; error?: string; count?: number } | null = null;
    try {
      body = JSON.parse(text);
    } catch {
      // A non-JSON reply is usually Google's HTML error/login page: wrong URL or a deployment not set to "Anyone".
    }
    if (!res.ok || !body?.ok) {
      const reason = body?.error ?? `unexpected response (HTTP ${res.status}) — check the web app URL and that it's deployed with access "Anyone"`;
      console.error(`[sheets] Sync failed: ${reason}`);
      return { ok: false, reason };
    }
    return { ok: true, count: body.count ?? leads.length };
  } catch (err) {
    console.error("[sheets] Sync failed:", err);
    return { ok: false, reason: err instanceof Error ? err.message : "request failed" };
  }
}

/** Fire-and-forget variant for request handlers: the response never waits on Google. */
export function syncLeadInBackground(lead: TripLead): void {
  void upsertLeadsInSheet([lead]);
}
