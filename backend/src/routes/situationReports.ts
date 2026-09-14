import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { REGIONS } from "../lib/enums";
import { serializeSituationReport } from "../serializers/situationReport";

/**
 * Public read side of situation reports -- never built alongside the
 * Phase 6 admin CRUD, but the frontend's Travel Updates page needs a
 * source of truth to fetch from. Reports are exclusively admin-entered
 * (POST/PATCH live under /admin/situation-reports); this is read-only.
 */
const router = Router();

const querySchema = z.object({
  region: z.enum(REGIONS).optional(),
});

// GET /situation-reports?region=
router.get("/", async (req, res) => {
  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query parameters", details: parsed.error.flatten() });
    return;
  }

  const reports = await prisma.situationReport.findMany({
    where: parsed.data.region ? { region: parsed.data.region } : undefined,
    orderBy: { reportedAt: "desc" },
  });
  res.json(reports.map(serializeSituationReport));
});

export default router;
