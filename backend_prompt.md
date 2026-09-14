# BACKEND_PROMPT.md — Nature & Culture GB

You are building the **backend** of "Nature & Culture GB," a tourism-planning platform for Gilgit-Baltistan. Work only inside the `/backend` folder. The frontend (built separately, in `/frontend`) currently uses mock JSON data structured to match this API — your job is to make that data real and to add the functional systems (leads, reviews, admin) the frontend already has UI for.

## CRITICAL PROCESS RULE

This build is split into phases (continuing the numbering from the frontend prompt — backend starts at Phase 3). **After completing each phase, STOP.** Summarize what you built, how to run/migrate/seed it, and how to test each endpoint (e.g. sample curl/Postman calls). Wait for explicit approval before starting the next phase.

## Tech stack

- Node.js + Express + TypeScript
- Prisma ORM + PostgreSQL
- Zod (or similar) for request validation
- Nodemailer (or a transactional email API) for lead/contact notifications
- JWT-based auth for the admin dashboard (no third-party auth provider needed unless you prefer one)
- dotenv for environment variables — **never hardcode secrets, DB credentials, or JWT secrets in source**

## Folder structure

```
/backend
  /src
    /routes
    /controllers
    /middleware
    /services       (email, etc.)
    /validators
  /prisma
    schema.prisma
    seed.ts
  .env.example
```

## Database schema (Prisma) — core entities

```
Destination(id, slug, name, region, images[], shortDescription, longDescription,
  bestTimeToVisit, estimatedDurationDays, activities[], difficulty, approxCostPKR,
  lat, lng, createdAt, updatedAt)

Hotel(id, slug, name, region, images[], description, starRating,
  estimatedPricePerNightPKR, priceLastUpdated, facilities[], roomTypes[JSON],
  cancellationPolicy, lat, lng, createdAt, updatedAt)

Mountain(id, slug, name, heightMeters, range, difficulty, firstAscent,
  bestSeason, images[], description)

Package(id, slug, title, durationDays, category, estimatedPricePKR,
  priceLastUpdated, highlights[], itinerary[JSON: {day, title, activities[]}])

Review(id, name, email?, destinationId?, hotelId?, rating, text, photoUrl?,
  status: PENDING|APPROVED|REJECTED, createdAt)

TripLead(id, name, contact, startingCity, destinations[], days, travelers,
  budgetPKR?, hotelCategory?, transport?, activities[], status: NEW|CONTACTED|CLOSED,
  createdAt)

ContactMessage(id, name, email, message, status: NEW|READ, createdAt)

SituationReport(id, title, region, status: OPEN|CLOSED|RESTRICTED, details,
  source, reportedAt, createdBy)

AdminUser(id, email, passwordHash, role, createdAt)
```

Relationships: Destination ↔ Hotel (nearby, many-to-many via a join or simple id array is fine at this scale); Review optionally references a Destination or Hotel; Package references Destinations loosely via itinerary text (keep it simple, don't over-normalize for v1).

## Phase 3 — Core content API

1. Set up Prisma + Postgres connection, write the schema above, run migrations.
2. Write a `seed.ts` that populates Destinations, Hotels, Mountains, Packages with **real, verified Gilgit-Baltistan information** (Skardu, Hunza, Gilgit, Astore, Ghizer, Nagar, Diamer, Ghanche, Shigar, Kharmang locations — Deosai, Shangrila, Kachura Lakes, Satpara, Shigar Fort, Katpana Desert, Khaplu, Karimabad, Baltit/Altit Forts, Attabad Lake, Passu, Hussaini Bridge, Khunjerab Pass, K2, Nanga Parbat, Rakaposhi, etc. — write real short descriptions, don't invent facts). Hotel data should be manually curated placeholder entries (clearly marked `priceLastUpdated`), not scraped from any booking site.
3. Build REST endpoints: `GET /destinations`, `GET /destinations/:slug`, `GET /hotels` (with query filters: region, price range, rating, facilities), `GET /hotels/:slug`, `GET /mountains`, `GET /mountains/:slug`, `GET /packages`, `GET /packages/:slug`.
4. Response shapes must exactly match the frontend's existing mock JSON contracts (see frontend_prompt.md's "Mock data contracts" section) so the frontend swap is a fetch-URL change, not a rewrite.
5. Note in your summary which frontend fetch calls need to change from local JSON imports to `fetch(process.env.NEXT_PUBLIC_API_URL + ...)`.

## Phase 4 — Trip Builder & Contact lead capture

1. `POST /trip-leads` — validates and stores a TripLead record, then sends an email (and/or a simple webhook, e.g. to a Telegram bot or WhatsApp Business API if you have one) notifying the business of the new lead.
2. `POST /contact` — stores a ContactMessage and sends a notification email.
3. No payment or reservation logic — the frontend's "Book" button just reveals the phone number client-side; that part needs no backend at all, confirm it's not accidentally routed through the API.

## Phase 5 — Reviews

1. `POST /reviews` — public submission, always created with `status: PENDING`.
2. `GET /reviews?status=APPROVED` — public read, only approved reviews.
3. Basic profanity/spam guard on submission (simple keyword filter is enough for v1).

## Phase 6 — Admin auth + CRUD dashboard API

1. `POST /admin/login` — email+password against `AdminUser`, returns JWT.
2. Middleware to protect all `/admin/*` routes.
3. CRUD endpoints for Destinations, Hotels, Mountains, Packages, SituationReports.
4. `PATCH /admin/reviews/:id` — approve/reject.
5. `GET /admin/leads`, `PATCH /admin/leads/:id` — view/update lead status.
6. Seed one admin user via an env-configured script — never commit a hardcoded admin password to source.

## Phase 7 — Live weather, flights (honest), situation reports

1. **Weather:** integrate Open-Meteo (free, no API key required) for Skardu, Gilgit, Hunza, Astore, Khaplu, Shigar — real current conditions + 5–7 day forecast. This is genuinely live; no honesty caveat needed here.
2. **Flights:** research whether any free/public API currently covers Islamabad↔Skardu domestic routes. If none exists (likely), do NOT fabricate data — implement the endpoint to return an explicit `{ available: false, message: "Live flight data unavailable" }` shape, and say so plainly in your phase summary rather than working around it.
3. **Situation reports:** these remain admin-entered via the Phase 6 CRUD (not scraped or auto-fetched) — every report requires `source` and `reportedAt` fields, enforced by validation, matching the "Date + Time + Source" rule from the original spec.

## Non-negotiable rules

- Never expose `.env` values, DB credentials, or JWT secrets in code or commit history — `.env.example` only, real `.env` gitignored.
- Validate and sanitize every incoming field (Zod schemas per route).
- Rate-limit public write endpoints (`/trip-leads`, `/contact`, `/reviews`) to prevent spam.
- Protect all admin routes with JWT middleware; hash passwords with bcrypt/argon2.
- CORS restricted to the known frontend origin(s), not `*`, once deployed.
- Every price field carries a `lastUpdated` timestamp and is understood by both ends as an estimate, never presented as live/booking-confirmed.
