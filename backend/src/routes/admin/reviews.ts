import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma";

const router = Router();

const listQuerySchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
});

// GET /admin/reviews?status= -- all reviews (any status), unlike the
// public GET /reviews which is hardcoded to approved-only.
router.get("/", async (req, res) => {
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query parameters", details: parsed.error.flatten() });
    return;
  }
  const reviews = await prisma.review.findMany({
    where: parsed.data.status ? { status: parsed.data.status } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      destination: { select: { name: true } },
      hotel: { select: { name: true } },
    },
  });
  res.json(reviews);
});

// PATCH /admin/reviews/:id -- approve/reject (or reset to pending)
router.patch("/:id", async (req, res) => {
  const parsed = updateStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
    return;
  }
  try {
    const review = await prisma.review.update({
      where: { id: req.params.id },
      data: { status: parsed.data.status },
    });
    res.json(review);
  } catch {
    res.status(404).json({ error: "Review not found" });
  }
});

export default router;
