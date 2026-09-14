import { SituationReport } from "@/lib/types";

export const situationReports: SituationReport[] = [
  {
    id: "sit-01",
    title: "Karakoram Highway (Gilgit–Hunza section)",
    region: "Hunza",
    status: "Open",
    description: "Normal traffic flow reported. No landslide or closure advisories in effect.",
    source: "NHA Travel Advisory (mock)",
    timestamp: "2026-09-10T09:00:00+05:00",
  },
  {
    id: "sit-02",
    title: "Skardu–Deosai Road",
    region: "Skardu",
    status: "Open",
    description: "Seasonally open; road is passable for jeeps and cars in dry conditions.",
    source: "Local Tourism Office (mock)",
    timestamp: "2026-09-08T14:00:00+05:00",
  },
  {
    id: "sit-03",
    title: "Babusar Top Pass",
    region: "Diamer",
    status: "Restricted",
    description: "Restricted to daylight hours; expect delays due to ongoing road maintenance.",
    source: "District Administration (mock)",
    timestamp: "2026-09-05T11:30:00+05:00",
  },
  {
    id: "sit-04",
    title: "Astore–Fairy Meadows Jeep Track",
    region: "Astore",
    status: "Open",
    description: "Jeep track to Raikot Bridge and onward is operating normally.",
    source: "Local Tourism Office (mock)",
    timestamp: "2026-09-09T08:00:00+05:00",
  },
  {
    id: "sit-05",
    title: "Khunjerab Pass",
    region: "Hunza",
    status: "Closed",
    description: "Seasonal closure expected with the onset of winter; check back closer to your travel date.",
    source: "NHA Travel Advisory (mock)",
    timestamp: "2026-09-01T10:00:00+05:00",
  },
];
