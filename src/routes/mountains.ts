import { Router } from "express";
import { prisma } from "../lib/prisma";
import { serializeMountain } from "../serializers/mountain";

const router = Router();

// GET /mountains
router.get("/", async (_req, res) => {
  const mountains = await prisma.mountain.findMany({ orderBy: { heightMeters: "desc" } });
  res.json(mountains.map(serializeMountain));
});

// GET /mountains/:slug
router.get("/:slug", async (req, res) => {
  const mountain = await prisma.mountain.findUnique({ where: { slug: req.params.slug } });
  if (!mountain) {
    res.status(404).json({ error: "Mountain not found" });
    return;
  }
  res.json(serializeMountain(mountain));
});

export default router;
