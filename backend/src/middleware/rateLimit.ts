import rateLimit from "express-rate-limit";

/**
 * Shared limiter for public write endpoints that anyone can hit without
 * auth (/trip-leads, /contact, and Phase 5's /reviews) — 10 requests per
 * 15 minutes per IP is generous for a genuine visitor filling out one
 * form, but throttles scripted spam.
 */
export const publicWriteRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again later." },
});

/**
 * Tighter limiter for POST /admin/login -- brute-forcing credentials is
 * a more sensitive case than form spam, so this allows fewer attempts.
 */
export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts. Please try again later." },
});
