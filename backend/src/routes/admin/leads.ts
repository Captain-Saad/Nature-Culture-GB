import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { sendNotificationEmail } from "../../services/email";
import { syncLeadInBackground, upsertLeadsInSheet } from "../../services/sheets";
import { leadDetailsHtml, leadDetailsText, leadHeadline } from "../../lib/leadDetails";

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

/**
 * POST /admin/leads/sync-sheet -- re-sends every lead to the Google Sheet.
 * For the first connection (backfilling existing leads) or catching up after
 * the sheet was unreachable; rows are matched on Lead ID, so it's safe to
 * run any number of times.
 */
router.post("/sync-sheet", async (_req, res) => {
  const leads = await prisma.tripLead.findMany({ orderBy: { createdAt: "asc" } });
  const result = await upsertLeadsInSheet(leads);
  if (!result.ok) {
    res.status(502).json({ error: `Google Sheet sync failed: ${result.reason}` });
    return;
  }
  res.json({ synced: result.count ?? leads.length });
});

// PATCH /admin/leads/:id
router.patch("/:id", async (req, res) => {
  const parsed = updateStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
    return;
  }

  const previous = await prisma.tripLead.findUnique({ where: { id: req.params.id }, select: { status: true } });
  if (!previous) {
    res.status(404).json({ error: "Lead not found" });
    return;
  }

  const lead = await prisma.tripLead.update({
    where: { id: req.params.id },
    data: { status: parsed.data.status },
  });

  // Keep the lead's row in the Google Sheet in step with its status.
  syncLeadInBackground(lead);

  // Closing a lead = the booking is confirmed: send its full details to the
  // business inbox. Only on the transition, so re-saving "Closed" doesn't
  // send it twice.
  let bookingEmail: { sent: boolean; reason?: string } | undefined;
  if (lead.status === "CLOSED" && previous.status !== "CLOSED") {
    bookingEmail = await sendNotificationEmail({
      subject: `Booking closed: ${lead.name} — ${leadHeadline(lead)}`,
      text: `This trip lead was marked Closed in Admin → Leads. Booking details:\n\n${leadDetailsText(lead)}`,
      html: leadDetailsHtml(lead, "Booking closed — details"),
      replyTo: lead.email ?? undefined,
    });
  }

  res.json({ ...lead, bookingEmail });
});

export default router;
