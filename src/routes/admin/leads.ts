import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma";

const router = Router();

const listQuerySchema = z.object({
  status: z.enum(["NEW", "CONTACTED", "CLOSED"]).optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(["NEW", "CONTACTED", "CLOSED"]),
});

// GET /admin/leads?status=
router.get("/", async (req, res) => {
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query parameters", details: parsed.error.flatten() });
    return;
  }
  const leads = await prisma.tripLead.findMany({
    where: parsed.data.status ? { status: parsed.data.status } : undefined,
    orderBy: { createdAt: "desc" },
  });
  res.json(leads);
});

// PATCH /admin/leads/:id
router.patch("/:id", async (req, res) => {
  const parsed = updateStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
    return;
  }
  try {
    const lead = await prisma.tripLead.update({
      where: { id: req.params.id },
      data: { status: parsed.data.status },
    });
    res.json(lead);
  } catch {
    res.status(404).json({ error: "Lead not found" });
  }
});

export default router;
