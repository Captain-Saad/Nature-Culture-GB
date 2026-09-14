import { Router } from "express";
import { prisma } from "../lib/prisma";
import { contactSchema } from "../validators/contact";
import { publicWriteRateLimit } from "../middleware/rateLimit";
import { sendNotificationEmail } from "../services/email";

const router = Router();

// POST /contact
router.post("/", publicWriteRateLimit, async (req, res) => {
  const parsed = contactSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid contact message", details: parsed.error.flatten() });
    return;
  }
  const data = parsed.data;

  const contactMessage = await prisma.contactMessage.create({ data });

  const email = await sendNotificationEmail({
    subject: data.subject ? `New contact message: ${data.subject}` : "New contact message",
    text: [
      `Name: ${data.name}`,
      `Email: ${data.email}`,
      data.subject ? `Subject: ${data.subject}` : undefined,
      "",
      data.message,
      "",
      `Message ID: ${contactMessage.id}`,
    ]
      .filter(Boolean)
      .join("\n"),
  });

  res.status(201).json({ id: contactMessage.id, status: contactMessage.status, emailSent: email.sent });
});

export default router;
