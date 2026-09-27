# Gmail notifications and the Google Sheet of leads

Both run through one small Apps Script attached to your Google Sheet: it
writes the "Leads" tab **and** sends the notification emails from your Gmail.
(The backend can't use Gmail's SMTP directly on Render's free plan — Render
blocks outgoing email ports — but it can call the script over normal HTTPS.)

| When | Email to your Gmail | Google Sheet ("Leads" tab) |
|---|---|---|
| A client sends a trip request from the Trip Cart | "New trip request: …" with every detail | New row |
| You change a lead's status in Admin → Leads | — | That lead's row is updated |
| You mark a lead **Closed** | "Booking closed: …" with the full booking | Row shows CLOSED (green) |
| Someone uses the Contact page | "New contact message" | — |

Emails are sent from the Google account that owns the script, to
`NOTIFICATION_EMAIL_TO`. Replying goes straight to the client when they gave
an email. Google allows about 100 emails a day from a regular Gmail account.

## Setup

1. Open your sheet → **Extensions → Apps Script**.
2. Replace everything in `Code.gs` with all of [`LeadsSheet.gs`](./LeadsSheet.gs). Save.
3. **Project Settings** (gear icon) → **Script Properties** → add `SHARED_SECRET` = the value of `SHEETS_WEBHOOK_SECRET` in `backend/.env` (skip if it's already there).
4. Grant the email permission: in the editor toolbar pick **authorizeEmail** → **Run** → allow ("Send email as you").
5. Deploy:
   - First time: **Deploy → New deployment** → **Web app**, Execute as **Me**, Who has access **Anyone** → copy the URL (ends in `/exec`) into `SHEETS_WEBHOOK_URL`.
   - Updating the script later: **Deploy → Manage deployments** → pencil icon → Version **New version** → **Deploy**. The URL stays the same.
6. Backend env (`backend/.env` locally, Render → Environment in production): `SHEETS_WEBHOOK_URL`, `SHEETS_WEBHOOK_SECRET`, `NOTIFICATION_EMAIL_TO`.
7. In **Admin → Leads**, click **Sync all to Google Sheet** once to fill in existing leads.

Opening the `/exec` URL in a browser should show `"version":2`. "Anyone" access
is safe: the script refuses any request without the shared secret.

## Optional: SMTP fallback

If the script isn't configured, the backend falls back to SMTP (`SMTP_HOST`,
`SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` — for Gmail an App Password from
<https://myaccount.google.com/apppasswords>). That works locally but not on
Render's free plan.
