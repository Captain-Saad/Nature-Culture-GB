import { Router } from "express";
import type { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { serializeHotel } from "../serializers/hotel";
import { hotelQuerySchema } from "../validators/hotelQuery";

const router = Router();

// GET /hotels?region=&category=&minPrice=&maxPrice=&minRating=&facilities=
router.get("/", async (req, res) => {
  const parsed = hotelQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query parameters", details: parsed.error.flatten() });
    return;
  }
  const { region, category, minPrice, maxPrice, minRating, facilities } = parsed.data;

  const where: Prisma.HotelWhereInput = {};
  if (region) where.region = region;
  if (category) where.category = category;
  if (minRating) where.starRating = { gte: minRating };
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.estimatedPricePerNightPKR = {
      ...(minPrice !== undefined ? { gte: minPrice } : {}),
      ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
    };
  }
  if (facilities && facilities.length > 0) {
    where.facilities = { hasEvery: facilities };
  }

  const hotels = await prisma.hotel.findMany({ where, orderBy: { name: "asc" } });
  res.json(hotels.map(serializeHotel));
});

// GET /hotels/:slug
router.get("/:slug", async (req, res) => {
  const hotel = await prisma.hotel.findUnique({ where: { slug: req.params.slug } });
  if (!hotel) {
    res.status(404).json({ error: "Hotel not found" });
    return;
  }
  res.json(serializeHotel(hotel));
});

export default router;
