import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { UPLOAD_DIR, UPLOAD_URL_PREFIX, ensureUploadDir } from "./lib/uploads";
import { prisma } from "./lib/prisma";

import destinationsRouter from "./routes/destinations";
import hotelsRouter from "./routes/hotels";
import mountainsRouter from "./routes/mountains";
import packagesRouter from "./routes/packages";
import tripLeadsRouter from "./routes/tripLeads";
import contactRouter from "./routes/contact";
import reviewsRouter from "./routes/reviews";
import adminRouter from "./routes/admin";
import weatherRouter from "./routes/weather";
import flightsRouter from "./routes/flights";
import situationReportsRouter from "./routes/situationReports";
import siteSettingsRouter from "./routes/siteSettings";

const corsOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:3000")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

export const app = express();

app.use(helmet());
app.use(cors({ origin: corsOrigins }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json());

/**
 * Doubles as the keep-alive target for both free-tier services this
 * runs on: hitting it keeps Render's instance from spinning down after
 * ~15 minutes idle, and the DB round trip below keeps Supabase's
 * project from being paused after a week with no activity. See
 * frontend/components/shared/KeepAlivePing.tsx for the client that
 * calls this on an interval.
 */
app.get("/health", async (_req, res) => {
  const startedAt = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", database: "ok", databaseLatencyMs: Date.now() - startedAt });
  } catch (err) {
    console.error("Health check DB query failed:", err);
    res.status(503).json({ status: "ok", database: "error" });
  }
});

// Uploaded media, served read-only. Writing and deleting happens only through
// the JWT-protected /admin/uploads routes -- this mount serves existing files
// and nothing else (no directory listing, no index fallback).
ensureUploadDir();
app.use(
  UPLOAD_URL_PREFIX,
  express.static(UPLOAD_DIR, {
    index: false,
    fallthrough: true,
    maxAge: "1y",
    setHeaders: (res) => {
      // helmet() sets Cross-Origin-Resource-Policy: same-origin globally,
      // which would stop the frontend on :3000 from rendering media served
      // from :4100. These files are public content by design.
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
  })
);

app.use("/destinations", destinationsRouter);
app.use("/hotels", hotelsRouter);
app.use("/mountains", mountainsRouter);
app.use("/packages", packagesRouter);
app.use("/trip-leads", tripLeadsRouter);
app.use("/contact", contactRouter);
app.use("/reviews", reviewsRouter);
app.use("/admin", adminRouter);
app.use("/weather", weatherRouter);
app.use("/flights", flightsRouter);
app.use("/situation-reports", situationReportsRouter);
app.use("/site-settings", siteSettingsRouter);

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Express 5 requires the 4-arg error-handler signature to be recognized
// as an error middleware, even though `_next` is unused.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});
