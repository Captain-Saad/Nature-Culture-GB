import { Router } from "express";
import type { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { createReviewSchema, reviewQuerySchema } from "../validators/review";
import { moderateText } from "../lib/moderation";
import { publicWriteRateLimit } from "../middleware/rateLimit";
import { serializeReview } from "../serializers/review";

const router = Router();

// GET /reviews?status=APPROVED&destinationId=&hotelId=
// Public read -- always approved-only, regardless of the status query
// param's value (see the validator's comment for why).
router.get("/", async (req, res) => {
  const parsed = reviewQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query parameters", details: parsed.error.flatten() });
    return;
  }
  const { destinationId, hotelId } = parsed.data;

  const where: Prisma.ReviewWhereInput = { status: "APPROVED" };
  if (destinationId) where.destinationId = destinationId;
  if (hotelId) where.hotelId = hotelId;

  const reviews = await prisma.review.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      destination: { select: { name: true } },
      hotel: { select: { name: true } },
    },
  });
  res.json(reviews.map(serializeReview));
});

// POST /reviews -- always created as PENDING; never publicly visible
// until an admin approves it via Phase 6's CRUD.
router.post("/", publicWriteRateLimit, async (req, res) => {
  const parsed = createReviewSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid review", details: parsed.error.flatten() });
    return;
  }
  const data = parsed.data;

  const moderation = moderateText(`${data.name} ${data.text}`);
  if (moderation.flagged) {
    res.status(400).json({
      error: "Your review couldn't be submitted",
      reason: moderation.reason,
    });
    return;
  }

  const review = await prisma.review.create({
    data: {
      name: data.name,
      email: data.email,
      destinationId: data.destinationId,
      hotelId: data.hotelId,
      rating: data.rating,
      text: data.text,
      photoUrl: data.photoUrl,
    },
  });

  res.status(201).json({ id: review.id, status: review.status });
});

export default router;
