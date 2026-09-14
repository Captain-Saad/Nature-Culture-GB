import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma";

/**
 * Not named in backend_prompt.md's Phase 6 endpoint list (only
 * /admin/leads is) -- added because otherwise ContactMessage rows
 * created by Phase 4's POST /contact would be permanently invisible
 * and unmanageable, since ContactMessage also carries its own
 * NEW|READ status per the original schema.
 */
const router = Router();

const listQuerySchema = z.object({
  status: z.enum(["NEW", "READ"]).optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(["NEW", "READ"]),
});

// GET /admin/contact-messages?status=
router.get("/", async (req, res) => {
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query parameters", details: parsed.error.flatten() });
    return;
  }
  const messages = await prisma.contactMessage.findMany({
    where: parsed.data.status ? { status: parsed.data.status } : undefined,
    orderBy: { createdAt: "desc" },
  });
  res.json(messages);
});

// PATCH /admin/contact-messages/:id
router.patch("/:id", async (req, res) => {
  const parsed = updateStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
    return;
  }
  try {
    const message = await prisma.contactMessage.update({
      where: { id: req.params.id },
      data: { status: parsed.data.status },
    });
    res.json(message);
  } catch {
    res.status(404).json({ error: "Message not found" });
  }
});

export default router;
