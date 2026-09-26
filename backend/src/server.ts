import "dotenv/config";
import { app } from "./app";
import { startScheduledJobs } from "./jobs/scheduler";
import { ensureStorageBucket, usingSupabaseStorage } from "./lib/uploads";

const port = Number(process.env.PORT ?? 4000);

app.listen(port, () => {
  console.log(`Nature & Culture GB API listening on http://localhost:${port}`);
  console.log(`Media uploads stored in ${usingSupabaseStorage ? "Supabase Storage" : "local disk (backend/uploads)"}`);
  startScheduledJobs();
  void ensureStorageBucket();
});
