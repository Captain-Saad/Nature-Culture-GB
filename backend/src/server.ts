import "dotenv/config";
import { app } from "./app";
import { startScheduledJobs } from "./jobs/scheduler";

const port = Number(process.env.PORT ?? 4000);

app.listen(port, () => {
  console.log(`Nature & Culture GB API listening on http://localhost:${port}`);
  startScheduledJobs();
});
