# Gmail notifications and the Google Sheet of leads

What the site does once this is set up:

| When | Email to your Gmail | Google Sheet ("Leads" tab) |
|---|---|---|
| A client sends a trip request from the Trip Cart | "New trip request: …" with every detail | New row |
| You change a lead's status in Admin → Leads | — | That lead's row is updated |
| You mark a lead **Closed** | "Booking closed: …" with the full booking | Row shows CLOSED (green) |
| Someone uses the Contact page | "New contact message" | — |

Replying to a lead email in Gmail goes straight to the client (when they gave an email).

## 1. Gmail (sending the emails)

1. Sign in to the Gmail account that should **send** the emails (it can be `natureculturegb@gmail.com` itself).
2. Turn on 2-Step Verification: <https://myaccount.google.com/security>.
3. Create an App Password: <https://myaccount.google.com/apppasswords> → name it "Website" → copy the 16-character password.
4. In `backend/.env` set:
   - `SMTP_USER` = that Gmail address
   - `SMTP_PASSWORD` = the 16-character App Password (spaces don't matter)
   - `NOTIFICATION_EMAIL_TO` = the inbox that should **receive** the emails (already set to `natureculturegb@gmail.com`)

## 2. Google Sheet

1. Open your sheet → **Extensions → Apps Script**.
2. Delete what's in `Code.gs` and paste in all of [`LeadsSheet.gs`](./LeadsSheet.gs). Save.
3. **Project Settings** (gear icon) → **Script Properties** → **Add script property**:
   - Property: `SHARED_SECRET`
   - Value: copy `SHEETS_WEBHOOK_SECRET` from `backend/.env`
4. **Deploy → New deployment** → type **Web app**:
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Deploy → allow the permissions Google asks for (it's your own script editing your own sheet).
5. Copy the **Web app URL** (ends in `/exec`) into `SHEETS_WEBHOOK_URL` in `backend/.env`.
6. Restart the backend, then in **Admin → Leads** click **Sync all to Google Sheet** — this fills the "Leads" tab with every existing lead.

"Anyone" access is safe here: the script refuses any request that doesn't carry the shared secret.

If you edit the script later, use **Deploy → Manage deployments → Edit → New version** so the same URL keeps working.

## 3. Production (Render)

Add the same values in Render → the backend service → **Environment**: `SMTP_USER`, `SMTP_PASSWORD`, `NOTIFICATION_EMAIL_TO`, `SHEETS_WEBHOOK_URL`, `SHEETS_WEBHOOK_SECRET` (`SMTP_HOST`/`SMTP_PORT` are preset by `render.yaml`).
