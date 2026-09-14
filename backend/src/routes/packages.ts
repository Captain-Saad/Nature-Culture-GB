import { Router } from "express";
import { prisma } from "../lib/prisma";
import { serializePackage } from "../serializers/package";

const router = Router();

// GET /packages
router.get("/", async (_req, res) => {
  const packages = await prisma.package.findMany({ orderBy: { durationDays: "asc" } });
  res.json(packages.map(serializePackage));
});

// GET /packages/:slug
router.get("/:slug", async (req, res) => {
  const pkg = await prisma.package.findUnique({ where: { slug: req.params.slug } });
  if (!pkg) {
    res.status(404).json({ error: "Package not found" });
    return;
  }
  res.json(serializePackage(pkg));
});

export default router;
