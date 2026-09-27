/**
 * Nature & Culture GB — trip leads → Google Sheet.
 *
 * Paste this into the sheet's Apps Script editor (Extensions → Apps Script)
 * and deploy it as a web app; the backend (backend/src/services/sheets.ts)
 * POSTs leads to it whenever one is submitted or its status changes.
 * Setup steps: integrations/google-sheets/README.md.
 *
 * Request body: { secret, headers: string[], rows: (string|number)[][] }
 * Rows are matched on the first column (Lead ID): an existing lead's row is
 * rewritten in place, a new lead is appended. Only the "Leads" tab is used.
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

    const headers = body.headers;
    const rows = body.rows || [];
    const sheet = getLeadsSheet_(headers);
    const statusCol = headers.indexOf("Status") + 1;

    const lastRow = sheet.getLastRow();
    const ids = lastRow > 1 ? sheet.getRange(2, 1, lastRow - 1, 1).getValues().map((r) => String(r[0])) : [];
    const rowById = {};
    ids.forEach((id, i) => (rowById[id] = i + 2));

    const toAppend = [];
    rows.forEach((row) => {
      const existing = rowById[String(row[0])];
      if (existing) {
        writeRows_(sheet, existing, [row], headers.length, statusCol);
      } else {
        toAppend.push(row);
        rowById[String(row[0])] = -1; // a duplicate id in the same batch is appended once
      }
    });
    if (toAppend.length) {
      writeRows_(sheet, sheet.getLastRow() + 1, toAppend, headers.length, statusCol);
    }

    return json_({ ok: true, count: rows.length, appended: toAppend.length });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/** Opening the web app URL in a browser shows this — a quick "is it deployed?" check. */
function doGet() {
  return json_({ ok: true, message: "Nature & Culture GB leads webhook is running." });
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
