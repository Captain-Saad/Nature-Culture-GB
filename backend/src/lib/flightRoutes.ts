/**
 * The route legs the flight-status refresh job covers. Each leg costs
 * one AviationStack request per refresh (its `dep_iata`/`arr_iata`
 * filters can't be OR'd together in one call), which is why this list
 * stays limited to the route the site actually promotes (ISB<->KDU)
 * rather than also covering Gilgit -- see the refresh job's header
 * comment for the request-budget math that decision is based on.
 */
export interface FlightRouteLeg {
  /** Stable id -- primary key in FlightStatusCache, not a flight number (which varies day to day). */
  id: string;
  /** Fallback only -- the refresh job prefers whatever airline AviationStack actually reports, since PIA and Airblue both fly GB routes and which one shows up varies. */
  airline: string;
  originIata: string;
  originLabel: string;
  destinationIata: string;
  destinationLabel: string;
}

export const FLIGHT_ROUTES: FlightRouteLeg[] = [
  {
    id: "isb-kdu",
    airline: "PIA",
    originIata: "ISB",
    originLabel: "Islamabad (ISB)",
    destinationIata: "KDU",
    destinationLabel: "Skardu (KDU)",
  },
  {
    id: "kdu-isb",
    airline: "PIA",
    originIata: "KDU",
    originLabel: "Skardu (KDU)",
    destinationIata: "ISB",
    destinationLabel: "Islamabad (ISB)",
  },
];
