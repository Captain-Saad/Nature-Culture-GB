import type { TripLead } from "@prisma/client";
import { SHEET_HEADERS, leadSheetRow } from "../lib/leadDetails";
import { callAppsScript } from "./appsScript";

/**
 * Mirrors trip leads into the client's Google Sheet through the Apps Script
 * web app (see ./appsScript.ts). Each call upserts rows keyed on "Lead ID":
 * a new lead adds a row, a status change rewrites that lead's row -- which
 * is also what makes retries safe.
 *
 * Never throws and never blocks a lead from being saved: the DB is the
 * source of truth, and "Sync all to Google Sheet" in Admin → Leads re-sends
 * everything if the sheet ever falls behind.
 */
export async function upsertLeadsInSheet(
  leads: TripLead[]
): Promise<{ ok: boolean; count?: number; reason?: string }> {
  if (leads.length === 0) return { ok: true, count: 0 };
  const result = await callAppsScript("upsertLeads", { headers: SHEET_HEADERS, rows: leads.map(leadSheetRow) });
  if (!result.ok) return { ok: false, reason: result.reason };
  const count = typeof result.body.count === "number" ? result.body.count : leads.length;
  return { ok: true, count };
}

/** Fire-and-forget variant for request handlers: the response never waits on Google. */
export function syncLeadInBackground(lead: TripLead): void {
  void upsertLeadsInSheet([lead]);
}
