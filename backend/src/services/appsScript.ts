/**
 * Calls the Apps Script web app bound to the client's Google Sheet
 * (integrations/google-sheets/LeadsSheet.gs). It does two jobs: upserting
 * lead rows into the sheet, and sending notification emails from the
 * client's Gmail via MailApp -- over HTTPS, which matters because Render's
 * free tier blocks outbound SMTP, so nodemailer → Gmail can't work there.
 */

// Google intermittently answers a healthy deployment with its HTML 404
// page, in bursts of several seconds; spacing retries out rides one out.
const RETRY_DELAYS_MS = [2_000, 6_000, 15_000];
// Apps Script cold starts regularly take 15-20s.
const TIMEOUT_MS = 45_000;

export function appsScriptConfigured(): boolean {
  return Boolean(process.env.SHEETS_WEBHOOK_URL?.trim() && process.env.SHEETS_WEBHOOK_SECRET?.trim());
}

export type AppsScriptReply = Record<string, unknown> & { ok: true };

type AttemptResult = { ok: true; body: AppsScriptReply } | { ok: false; reason: string; retryable: boolean };

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
    let body: { ok?: boolean; error?: string } | null = null;
    try {
      body = JSON.parse(text);
    } catch {
      // Not JSON: Google's HTML error page. Seen transiently (404/5xx) on a
      // healthy deployment, and permanently if the URL/access is wrong.
    }
    if (body?.ok) return { ok: true, body: body as AppsScriptReply };
    if (body?.error) {
      // The script ran and refused (bad secret, unknown action...) -- retrying won't help.
      return { ok: false, reason: body.error, retryable: false };
    }
    const title = text.match(/<title>([^<]*)<\/title>/i)?.[1]?.trim();
    return {
      ok: false,
      reason: `unexpected response (HTTP ${res.status}${title ? `: "${title}"` : ""}) — if this persists, check the web app URL and that it's deployed with access "Anyone"`,
      retryable: true,
    };
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : "request failed", retryable: true };
  }
}

/**
 * Sends one action to the script, retrying transient failures. Callers must
 * make actions safe to repeat: lead rows are upserted by Lead ID, and emails
 * carry an id the script de-duplicates on (a timeout can hide a success).
 */
export async function callAppsScript(
  action: string,
  data: Record<string, unknown>
): Promise<{ ok: true; body: AppsScriptReply } | { ok: false; reason: string }> {
  const url = process.env.SHEETS_WEBHOOK_URL?.trim();
  const secret = process.env.SHEETS_WEBHOOK_SECRET?.trim();
  if (!url || !secret) return { ok: false, reason: "Google Apps Script web app not configured" };

  const payload = JSON.stringify({ secret, action, ...data });
  let last: AttemptResult = { ok: false, reason: "not attempted", retryable: true };
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt += 1) {
    last = await postOnce(url, payload);
    if (last.ok) return last;
    if (!last.retryable || attempt === RETRY_DELAYS_MS.length) break;
    console.warn(`[apps-script] ${action}: attempt ${attempt + 1} failed (${last.reason}); retrying…`);
    await new Promise((r) => setTimeout(r, RETRY_DELAYS_MS[attempt]));
  }
  const reason = last.ok ? "unknown" : last.reason;
  console.error(`[apps-script] ${action} failed: ${reason}`);
  return { ok: false, reason };
}
