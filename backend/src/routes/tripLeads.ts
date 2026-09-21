import { Router } from "express";
import { prisma } from "../lib/prisma";
import { tripLeadSchema, type TripLeadInput } from "../validators/tripLead";
import { publicWriteRateLimit } from "../middleware/rateLimit";
import { sendNotificationEmail } from "../services/email";

const router = Router();

function formatCartItem(item: TripLeadInput["cartItems"][number]): string {
  switch (item.type) {
    case "destination":
      return `  - Destination: ${item.name} (${item.region})`;
    case "package":
      return `  - Package: ${item.name} (${item.durationDays} days)`;
    case "hotelRoom":
      return `  - Hotel room: ${item.hotelName} — ${item.roomType} (check-in ${item.checkIn}, ${item.nights} night${item.nights === 1 ? "" : "s"}, ${item.guests} guest${item.guests === 1 ? "" : "s"})`;
  }
}

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
      data.email ? `Email: ${data.email}` : undefined,
      data.preferredDates ? `Preferred dates: ${data.preferredDates}` : undefined,
      data.travelers !== undefined ? `Travelers: ${data.travelers}` : undefined,
      data.startingCity ? `Starting city: ${data.startingCity}` : undefined,
      data.days !== undefined ? `Days: ${data.days}` : undefined,
      data.budgetPKR !== undefined ? `Budget: PKR ${data.budgetPKR.toLocaleString()}` : undefined,
      data.hotelCategory ? `Hotel category: ${data.hotelCategory}` : undefined,
      data.transport ? `Transport: ${data.transport}` : undefined,
      data.destinationIds.length ? `Destination IDs: ${data.destinationIds.join(", ")}` : undefined,
      data.activities.length ? `Activities: ${data.activities.join(", ")}` : undefined,
      data.cartItems.length ? ["", "Trip cart:", ...data.cartItems.map(formatCartItem)].join("\n") : undefined,
      data.notes ? `\nNotes: ${data.notes}` : undefined,
      "",
      `Lead ID: ${lead.id}`,
    ]
      .filter(Boolean)
      .join("\n"),
  });

  res.status(201).json({ id: lead.id, status: lead.status, emailSent: email.sent });
});

export default router;
