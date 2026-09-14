import { z } from "zod";
import { REGIONS } from "../../lib/enums";

// Every report requires source + reportedAt (non-optional below), per
// backend_prompt.md's "Date + Time + Source" rule for situation reports.
const situationReportFields = {
  title: z.string().trim().min(1).max(300),
  region: z.enum(REGIONS),
  status: z.enum(["Open", "Closed", "Restricted"]),
  details: z.string().trim().min(1),
  source: z.string().trim().min(1).max(300),
  reportedAt: z.coerce.date(),
  createdBy: z.string().trim().min(1).max(200),
};

export const createSituationReportSchema = z.object(situationReportFields);
export const updateSituationReportSchema = z.object(situationReportFields).partial();
