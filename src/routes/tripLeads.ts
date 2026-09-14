import { Router } from "express";
import { prisma } from "../lib/prisma";
import { tripLeadSchema } from "../validators/tripLead";
import { publicWriteRateLimit } from "../middleware/rateLimit";
import { sendNotificationEmail } from "../services/email";

const router = Router();

// POST /trip-leads
router.post("/", publicWriteRateLimit, async (req, res) => {
  const parsed = tripLeadSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid trip lead", details: parsed.error.flatten() });
    return;
  }
  const data = parsed.data;

  const lead = await prisma.tripLead.create({ data });

  const email = await sendNotificationEmail({
    subject: `New trip lead from ${data.name}`,
    text: [
      `Name: ${data.name}`,
      `Contact: ${data.contact}`,
      `Starting city: ${data.startingCity}`,
      `Days: ${data.days}`,
      `Travelers: ${data.travelers}`,
      data.budgetPKR !== undefined ? `Budget: PKR ${data.budgetPKR.toLocaleString()}` : undefined,
      data.hotelCategory ? `Hotel category: ${data.hotelCategory}` : undefined,
      data.transport ? `Transport: ${data.transport}` : undefined,
      data.destinationIds.length ? `Destinations: ${data.destinationIds.join(", ")}` : undefined,
      data.activities.length ? `Activities: ${data.activities.join(", ")}` : undefined,
      "",
      `Lead ID: ${lead.id}`,
    ]
      .filter(Boolean)
      .join("\n"),
  });

  res.status(201).json({ id: lead.id, status: lead.status, emailSent: email.sent });
});

export default router;
