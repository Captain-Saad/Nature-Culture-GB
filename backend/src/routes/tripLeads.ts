import { Router } from "express";
import { prisma } from "../lib/prisma";
import { tripLeadSchema } from "../validators/tripLead";
import { publicWriteRateLimit } from "../middleware/rateLimit";
import { sendNotificationEmail } from "../services/email";
import { syncLeadInBackground } from "../services/sheets";
import { leadDetailsHtml, leadDetailsText, leadHeadline } from "../lib/leadDetails";

const router = Router();

// POST /trip-leads
router.post("/", publicWriteRateLimit, async (req, res) => {
  const parsed = tripLeadSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid trip lead", details: parsed.error.flatten() });
    return;
  }

  const lead = await prisma.tripLead.create({ data: parsed.data });

  // New row in the Google Sheet (doesn't hold up the response).
  syncLeadInBackground(lead);

  const email = await sendNotificationEmail({
    subject: `New trip request: ${lead.name} — ${leadHeadline(lead)}`,
    text: `New trip request from the website.\n\n${leadDetailsText(lead)}`,
    html: leadDetailsHtml(lead, "New trip request"),
    replyTo: lead.email ?? undefined,
  });

  res.status(201).json({ id: lead.id, status: lead.status, emailSent: email.sent });
});

export default router;
