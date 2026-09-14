import { Router } from "express";

const router = Router();

/**
 * Researched before writing this (see the phase summary for sources):
 * no free/public API reliably covers live status for small Pakistani
 * domestic routes like Islamabad<->Skardu/Gilgit. OpenSky Network is
 * free but ADS-B-coverage-dependent and known-weak outside Europe/
 * North America; AviationStack and similar aggregators only offer
 * small metered free tiers unsuitable for a always-on feature; PIA has
 * no public developer API. So: no live source, no fabricated numbers --
 * an explicit unavailable response, per backend_prompt.md Phase 7.
 *
 * Route/flight numbers below are real (PK451/452 Islamabad<->Skardu,
 * PK601/602 Islamabad<->Gilgit) -- confirmed via flight-tracker listings
 * during this research pass. The frontend's Phase 1 mock data had these
 * two routes' numbers swapped; worth fixing there too during the wiring
 * pass, though it's cosmetic since mock data is being replaced anyway.
 */
const KNOWN_ROUTES = [
  {
    id: "flt-01",
    flightNumber: "PK451",
    airline: "PIA",
    origin: "Islamabad (ISB)",
    destination: "Skardu (KDU)",
  },
  {
    id: "flt-02",
    flightNumber: "PK452",
    airline: "PIA",
    origin: "Skardu (KDU)",
    destination: "Islamabad (ISB)",
  },
  {
    id: "flt-03",
    flightNumber: "PK601",
    airline: "PIA",
    origin: "Islamabad (ISB)",
    destination: "Gilgit (GIL)",
  },
  {
    id: "flt-04",
    flightNumber: "PK602",
    airline: "PIA",
    origin: "Gilgit (GIL)",
    destination: "Islamabad (ISB)",
  },
];

// GET /flights
router.get("/", (_req, res) => {
  res.json({
    available: false,
    message: "Live flight data unavailable",
    routes: KNOWN_ROUTES.map((route) => ({
      ...route,
      isLive: false,
      status: null,
      scheduledDeparture: null,
      lastUpdated: null,
    })),
  });
});

export default router;
