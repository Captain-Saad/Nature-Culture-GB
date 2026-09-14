import { Router } from "express";
import { prisma } from "../lib/prisma";
import { serializeDestination } from "../serializers/destination";

const router = Router();

// GET /destinations
router.get("/", async (_req, res) => {
  const destinations = await prisma.destination.findMany({ orderBy: { name: "asc" } });
  res.json(destinations.map(serializeDestination));
});

// GET /destinations/:slug
router.get("/:slug", async (req, res) => {
  const destination = await prisma.destination.findUnique({ where: { slug: req.params.slug } });
  if (!destination) {
    res.status(404).json({ error: "Destination not found" });
    return;
  }
  res.json(serializeDestination(destination));
});

export default router;
