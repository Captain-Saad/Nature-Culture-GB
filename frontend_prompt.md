# FRONTEND_PROMPT.md — Nature & Culture GB

You are building the **frontend** of "Nature & Culture GB," a real tourism-planning platform for Gilgit-Baltistan, Pakistan. This is a production project, not a demo. Work only inside the `/frontend` folder of this repo. A separate `/backend` folder and prompt exist for the API/database — do not build backend logic here; use local mock JSON data instead, structured so it is trivial to swap for real API calls later.

## CRITICAL PROCESS RULE

This build is split into phases. **After completing each phase below, STOP.** Summarize what you built, list how to run/test it, and wait for explicit approval before starting the next phase. Do not skip ahead. Do not silently combine phases.

## Brand identity (source: attached flyer + logo)

- **Name:** Nature & Culture GB
- **Logo:** circular emblem, mountain range + trekker silhouette + tree, forest-green line art on cream background
- **Color palette:** deep forest green (primary), navy blue (secondary/dark sections), warm cream/beige (backgrounds), burnt orange (accent/CTA), white
- **Typography feel:** the flyer mixes a bold serif/display headline with a clean sans body — pick a premium serif display font (e.g. a Playfair/Fraunces-style font) for headings and a clean geometric sans (e.g. Inter/Manrope) for body text
- **Tone:** premium, adventurous, culturally warm, trustworthy — not a generic template
- Tagline: "Discover the Mountains. Experience the Culture."
- Contact: natureculturegb@gmail.com · Instagram @natureandculturegb · Phone 03008153848 / 03555400555 (phone numbers are only ever revealed via the "Book" flow, not printed in the main nav/footer in giant text — keep it tasteful)

## Tech stack

- Next.js 14 (App Router), TypeScript
- Tailwind CSS with a custom design-token theme (colors, spacing, font families from the palette above — do NOT use Tailwind's default indigo/blue defaults anywhere)
- GSAP + ScrollTrigger for scroll-driven reveals
- Lenis for smooth scrolling
- Framer Motion (`motion` package) — required by TiltedCard
- `next-intl` (or an equivalent App Router-compatible i18n library) for English/Urdu with full `dir="rtl"` support
- react-icons (for LogoLoop tech/partner icons if needed)

## Global setup (do this first, before any page)

1. Scaffold Next.js + TypeScript + Tailwind in `/frontend`.
2. Define design tokens in `tailwind.config` (colors: `forest`, `navy`, `cream`, `orange` scales; fonts: `font-display`, `font-body`).
3. Set up `next-intl` with two locales: `en` (LTR) and `ur` (RTL). The `<html dir="">` attribute must switch based on locale — verify this actually mirrors layout (nav order, card alignment, icon direction), not just text.
4. Set up Lenis smooth scroll wrapper at the root layout.
5. Create a `/lib/mock-data/` folder — this is the single source of truth for all placeholder content. Structure every mock file so it mirrors what a real API response will look like later (see "Mock data contracts" below). This matters: Phase 3 (backend) will replace these fetches with real API calls with minimal refactor.
6. Create a `/lib/i18n/` folder with `en.json` and `ur.json` translation dictionaries for all static UI strings (nav labels, buttons, section headers). Do not machine-translate placeholder body copy — leave Urdu destination/package descriptions as TODO markers for the client to fill in with real translations later; only translate structural UI chrome for now.

## Reusable components (build these once, use everywhere)

- `Navbar` — logo, nav links (Home | Explore GB | Destinations | Hotels | Packages | Plan My Trip | Weather | Flights | Travel Updates | About | Contact), prominent "Plan My Trip" CTA button, language switcher (EN | اردو), hamburger menu on mobile
- `Footer` — brand blurb, tagline, link columns, Instagram + email, copyright
- `Hero` — full-bleed mountain imagery (placeholder), animated headline reveal (GSAP), search bar, "Explore GB" + "Plan My Trip" CTAs
- `DestinationCard` — use **TiltedCard** for the image, overlay content shows name + short description on hover
- `HotelCard` — image gallery thumbnail, name, location, star rating, price/night (labeled "Estimated"), facility icons, "View Hotel" + "Book" buttons
- `MountainCard` — name, height, range, difficulty badge, image
- `PackageCard` — title, duration, price range (Estimated), highlights list, "View Itinerary" button
- `WeatherCard` — city name, temp, condition icon, forecast strip; must clearly show a "Live" badge vs a "Data unavailable" state — build BOTH states now even though real data comes in Phase 7
- `FlightCard` — route, flight no., status pill (Scheduled/Delayed/Cancelled/Arrived) — also build a "Live flight data unavailable" empty state; this state is likely to be the permanent one, don't hide that possibility from the UI design
- `SituationReportCard` — title, status badge (Open/Closed/Restricted), timestamp, source line
- `ReviewCard` — name, star rating, review text, optional photo, date
- `SearchBar`, `FilterPanel` — for Destinations and Hotels pages
- `TripBuilderForm` — multi-step form (starting city, destination(s), days, travelers, budget, hotel category, transport, activities) — client-side state only in this phase; submission just logs to console until Phase 4 backend wires it
- `CostCalculator` — takes TripBuilderForm state + mock pricing table, computes a live-updating estimated breakdown (hotel/transport/food/activities/entry fees/total), every number labeled "Estimated"
- `ImageGallery` — lightbox-style gallery for destination/hotel photos
- `MapSection` — placeholder interactive map component (use a static illustrated map image or Leaflet with OpenStreetMap tiles — no API key required — pinned with mock coordinates); do not wire Google Maps with an exposed key
- `BookingButton` — on click, opens a modal revealing the phone number and a "Call Now" / "WhatsApp" link; this is the entire "booking" flow for now, no payment/reservation logic
- `LanguageSwitcher` — toggles locale + dir
- **GlareHover** — wrap primary CTA buttons (Plan My Trip, Book) and the Hero's feature highlight cards
- **LogoLoop** — a horizontal strip on the homepage showing partner/press logos (or GB region icons if no partner logos exist yet) — placeholder content is fine
- **LineSidebar** — use as an in-page section-jump nav on long single pages: Destination detail page and Package detail page
- **ModelViewer** — only use this if/when a real .glb asset exists (e.g. a 3D mountain or a souvenir/product model). Do not force it into v1 with a placeholder cube — skip it in Phase 1 and flag it as available for later use

## Pages (Phase 1 scope — build all, using mock data)

1. **Home** — hero, search, "Explore GB" section, featured destinations (TiltedCards), Mountains of GB teaser, popular hotels teaser, tour packages teaser, trip builder teaser/link, weather widget, flight widget, travel situation widget, "Why Nature & Culture GB", reviews carousel, Instagram/LogoLoop section, final CTA, footer
2. **Destinations** — filterable grid (by region: Skardu, Hunza, Gilgit, Astore, Ghizer, Nagar, Diamer, Ghanche, Shigar, Kharmang), each card → detail page
3. **Destination Detail** — gallery, description, best time, duration, activities, difficulty, cost estimate, nearby hotels/attractions, map, "Add to My Trip" (adds to a client-side trip list, e.g. localStorage or React state)
4. **Mountains of GB** — K2, Nanga Parbat, Rakaposhi, Broad Peak, Gasherbrum, Masherbrum — grid + detail sections
5. **Hotels** — filter panel (city, price, rating, facilities, budget/mid/luxury), hotel grid, hotel detail page (gallery, rooms, facilities, cancellation policy placeholder, Book button)
6. **Packages** — package grid (3-Day Skardu, 5-Day Adventure, 7-Day Skardu+Hunza, 10-Day Complete GB, Honeymoon, Family, Adventure, Budget Backpacker, Luxury), package detail page with day-by-day itinerary and LineSidebar nav
7. **Plan My Trip (Trip Builder)** — the full TripBuilderForm + live CostCalculator
8. **Weather** — grid of WeatherCards for major towns, "Live"/"unavailable" states
9. **Flights** — FlightCard list (Islamabad↔Skardu focus), unavailable-state design
10. **Travel Updates (Situation Report)** — list of SituationReportCards
11. **Reviews** — average rating, review list, submission form (client-side only for now, wired in Phase 5)
12. **About Us** — company story, mission, contact info
13. **Contact** — contact form (client-side only for now, wired in Phase 4)
14. **Admin Login (UI shell only)** — a login form page with no working auth yet; clearly mark as non-functional placeholder in a code comment

## Mock data contracts

Each mock JSON file's shape must match what the Phase-3 backend API will return, e.g.:

```ts
// destinations.json
{ id, slug, name, region, images: string[], shortDescription, bestTimeToVisit,
  estimatedDuration, activities: string[], difficulty, approxCostPKR,
  nearbyHotelIds: string[], nearbyAttractionIds: string[], lat, lng }
```

Do the same for hotels, mountains, packages, weather, flights, situationReports, reviews. Keep every price field named clearly (`estimatedPricePKR`, not `price`) and add a `lastUpdated` field wherever the real spec calls for "estimated as of [date]."

## Non-negotiable rules

- Never hardcode a fake "live" number for weather, flights, or situation reports — always show a clearly labeled placeholder/mock state, and structure it so swapping in real data later requires no UI rework.
- All pricing shown must say "Estimated" and show a last-updated date.
- Fully responsive at 320/375/425/768/1024/1440px, no horizontal scroll.
- RTL must actually mirror layout, not just flip text direction of a couple of strings.
- SEO: proper `<title>`/meta description per page, Open Graph tags, semantic HTML, image alt text on every image.
- No exposed API keys anywhere in frontend code.
- Keep components in their own files under `/components`, organized by domain (`/components/destinations`, `/components/hotels`, etc.) — no God components.

## Phase breakdown for you (Claude Code) to follow

- **Phase 1:** Global setup + all components + all pages above, wired to mock data. STOP for review.
- **Phase 2:** Full working CostCalculator logic (recalculates live as the TripBuilderForm changes) against a mock pricing table in `/lib/mock-data/pricing.ts`. STOP for review.
- (Phases 3–7 happen in the backend prompt; once backend endpoints exist, a short "wiring" pass will replace mock fetches with real fetches — flagged separately when we get there.)
