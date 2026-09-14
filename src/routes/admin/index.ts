import { Router } from "express";
import { prisma } from "../../lib/prisma";
import { requireAdminAuth } from "../../middleware/requireAdminAuth";
import { createAdminCrudRouter } from "../../lib/adminCrudRouter";

import authRouter from "./auth";
import reviewsRouter from "./reviews";
import leadsRouter from "./leads";
import contactMessagesRouter from "./contactMessages";

import { createDestinationSchema, updateDestinationSchema } from "../../validators/admin/destination";
import { createHotelSchema, updateHotelSchema } from "../../validators/admin/hotel";
import { createMountainSchema, updateMountainSchema } from "../../validators/admin/mountain";
import { createPackageSchema, updatePackageSchema } from "../../validators/admin/package";
import {
  createSituationReportSchema,
  updateSituationReportSchema,
} from "../../validators/admin/situationReport";

const router = Router();

// POST /admin/login is the only public route under /admin.
router.use("/", authRouter);

// Everything registered from here down requires a valid admin JWT.
router.use(requireAdminAuth);

// GET /admin/me -- lightweight session-verification endpoint. The
// frontend calls this (not just checking cookie presence) to confirm a
// token is genuinely still valid before rendering a protected page.
router.get("/me", (req, res) => {
  // Matches the { id, email, role } shape POST /admin/login already
  // returns as `user`, rather than the JWT payload's raw `sub` field name.
  res.json({ id: req.admin!.sub, email: req.admin!.email, role: req.admin!.role });
});

router.use(
  "/destinations",
  createAdminCrudRouter({
    delegate: prisma.destination,
    createSchema: createDestinationSchema,
    updateSchema: updateDestinationSchema,
    orderBy: { name: "asc" },
  })
);

router.use(
  "/hotels",
  createAdminCrudRouter({
    delegate: prisma.hotel,
    createSchema: createHotelSchema,
    updateSchema: updateHotelSchema,
    orderBy: { name: "asc" },
  })
);

router.use(
  "/mountains",
  createAdminCrudRouter({
    delegate: prisma.mountain,
    createSchema: createMountainSchema,
    updateSchema: updateMountainSchema,
    orderBy: { heightMeters: "desc" },
  })
);

router.use(
  "/packages",
  createAdminCrudRouter({
    delegate: prisma.package,
    createSchema: createPackageSchema,
    updateSchema: updatePackageSchema,
    orderBy: { durationDays: "asc" },
  })
);

router.use(
  "/situation-reports",
  createAdminCrudRouter({
    delegate: prisma.situationReport,
    createSchema: createSituationReportSchema,
    updateSchema: updateSituationReportSchema,
    orderBy: { reportedAt: "desc" },
  })
);

router.use("/reviews", reviewsRouter);
router.use("/leads", leadsRouter);
router.use("/contact-messages", contactMessagesRouter);

export default router;
