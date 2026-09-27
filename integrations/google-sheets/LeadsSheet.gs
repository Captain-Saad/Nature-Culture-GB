/**
 * Nature & Culture GB — trip leads → Google Sheet.
 *
 * Paste this into the sheet's Apps Script editor (Extensions → Apps Script)
 * and deploy it as a web app. The backend (backend/src/services/appsScript.ts)
 * POSTs { secret, action, ... } to it for two jobs:
 *
 *  - action "upsertLeads": { headers: string[], rows: (string|number)[][] }
 *    Rows are matched on the first column (Lead ID): an existing lead's row
 *    is rewritten in place, a new lead is appended. Only the "Leads" tab is
 *    used.
 *  - action "email": { id, to, subject, text, html?, replyTo?, name? }
 *    Sends from this Google account's Gmail (MailApp) -- the backend's host
 *    can't use SMTP. `id` de-duplicates retries for 6 hours.
 *
 * Setup steps: integrations/google-sheets/README.md.
 */

const SHEET_NAME = "Leads";

const STATUS_COLORS = {
  NEW: "#fde2c8",
  CONTACTED: "#fff3bf",
  CLOSED: "#cfe1d6",
};

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000); // two leads arriving at once must not both append to the same row
  try {
    const body = JSON.parse(e.postData.contents);
    const secret = PropertiesService.getScriptProperties().getProperty("SHARED_SECRET");
    if (!secret || body.secret !== secret) {
      return json_({ ok: false, error: "unauthorized — SHARED_SECRET script property is missing or doesn't match" });
    }

    const action = body.action || "upsertLeads";
    if (action === "upsertLeads") return json_(upsertLeads_(body.headers, body.rows || []));
    if (action === "email") return json_(sendEmail_(body));
    return json_({ ok: false, error: "unknown action: " + action });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function upsertLeads_(headers, rows) {
  const sheet = getLeadsSheet_(headers);
  const statusCol = headers.indexOf("Status") + 1;

  const lastRow = sheet.getLastRow();
  const ids = lastRow > 1 ? sheet.getRange(2, 1, lastRow - 1, 1).getValues().map((r) => String(r[0])) : [];
  const rowById = {};
  ids.forEach((id, i) => (rowById[id] = i + 2));

  const toAppend = [];
  rows.forEach((row) => {
    const existing = rowById[String(row[0])];
    if (existing > 0) {
      writeRows_(sheet, existing, [row], headers.length, statusCol);
    } else if (existing === undefined) {
      toAppend.push(row);
      rowById[String(row[0])] = -1; // a duplicate id in the same batch is appended once
    }
  });
  if (toAppend.length) {
    writeRows_(sheet, sheet.getLastRow() + 1, toAppend, headers.length, statusCol);
  }
  return { ok: true, count: rows.length, appended: toAppend.length };
}

function sendEmail_(msg) {
  if (!msg.id || !msg.to || !msg.subject) return { ok: false, error: "email needs id, to and subject" };
  const cache = CacheService.getScriptCache();
  const key = "sent:" + msg.id;
  if (cache.get(key)) return { ok: true, duplicate: true }; // a retry of a message already sent

  const options = { name: msg.name || "Nature & Culture GB Website" };
  if (msg.html) options.htmlBody = msg.html;
  if (msg.replyTo) options.replyTo = msg.replyTo;
  MailApp.sendEmail(msg.to, msg.subject, msg.text || "", options);

  cache.put(key, "1", 21600); // 6 hours
  return { ok: true, sent: true, remainingDailyQuota: MailApp.getRemainingDailyQuota() };
}

/**
 * Run this once from the editor (select it in the toolbar, click Run) to
 * grant the "send email as you" permission, then deploy a new version.
 */
function authorizeEmail() {
  Logger.log("Emails left today: " + MailApp.getRemainingDailyQuota());
}

/** Opening the web app URL in a browser shows this — a quick "is it deployed?" check. */
function doGet() {
  return json_({ ok: true, message: "Nature & Culture GB leads webhook is running.", version: 2, actions: ["upsertLeads", "email"] });
}

function getLeadsSheet_(headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight("bold").setBackground("#1b4530").setFontColor("#ffffff");
    sheet.setFrozenRows(1);
    sheet.setColumnWidths(1, headers.length, 160);
  }
  return sheet;
}

function writeRows_(sheet, startRow, rows, width, statusCol) {
  const padded = rows.map((r) => {
    const row = r.slice(0, width);
    while (row.length < width) row.push("");
    return row;
  });
  const range = sheet.getRange(startRow, 1, padded.length, width);
  range.setNumberFormat("@"); // plain text: keeps phone numbers' leading 0 and dates as written
  range.setValues(padded);
  range.setWrap(true).setVerticalAlignment("top");
  if (statusCol > 0) {
    padded.forEach((row, i) => {
      sheet.getRange(startRow + i, statusCol).setBackground(STATUS_COLORS[row[statusCol - 1]] || null);
    });
  }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
