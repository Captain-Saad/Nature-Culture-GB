import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

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

const corsOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:3000")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

export const app = express();

app.use(helmet());
app.use(cors({ origin: corsOrigins }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

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
