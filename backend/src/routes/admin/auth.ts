import { Router } from "express";
import { prisma } from "../../lib/prisma";
import { adminLoginSchema } from "../../validators/adminAuth";
import { comparePassword } from "../../lib/password";
import { signAdminToken } from "../../lib/jwt";
import { loginRateLimit } from "../../middleware/rateLimit";

const router = Router();

// POST /admin/login
router.post("/login", loginRateLimit, async (req, res) => {
  const parsed = adminLoginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid credentials payload", details: parsed.error.flatten() });
    return;
  }
  const { email, password } = parsed.data;

  const user = await prisma.adminUser.findUnique({ where: { email } });
  // Same generic message whether the email doesn't exist or the password
  // is wrong -- don't let the response shape confirm which admin emails exist.
  if (!user || !(await comparePassword(password, user.passwordHash))) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const token = signAdminToken({ sub: user.id, email: user.email, role: user.role });
  res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
});

export default router;
