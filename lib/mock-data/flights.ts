import { Flight } from "@/lib/types";

/**
 * No live flight-status provider is wired up yet. Every entry is marked
 * isLive: false with null status fields — this may remain the permanent
 * state for this route, so the UI must handle it as a first-class case,
 * not a temporary loading state.
 */
export const flights: Flight[] = [
  {
    id: "flt-01",
    flightNumber: "PK-601",
    airline: "PIA",
    origin: "Islamabad (ISB)",
    destination: "Skardu (KDU)",
    isLive: false,
    status: null,
    scheduledDeparture: null,
    lastUpdated: null,
  },
  {
    id: "flt-02",
    flightNumber: "PK-602",
    airline: "PIA",
    origin: "Skardu (KDU)",
    destination: "Islamabad (ISB)",
    isLive: false,
    status: null,
    scheduledDeparture: null,
    lastUpdated: null,
  },
  {
    id: "flt-03",
    flightNumber: "PK-451",
    airline: "PIA",
    origin: "Islamabad (ISB)",
    destination: "Gilgit (GIL)",
    isLive: false,
    status: null,
    scheduledDeparture: null,
    lastUpdated: null,
  },
  {
    id: "flt-04",
    flightNumber: "PK-452",
    airline: "PIA",
    origin: "Gilgit (GIL)",
    destination: "Islamabad (ISB)",
    isLive: false,
    status: null,
    scheduledDeparture: null,
    lastUpdated: null,
  },
];
