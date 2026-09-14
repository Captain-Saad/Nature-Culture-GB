// Prisma 7 moved the datasource connection URL out of schema.prisma and
// into this file (see https://pris.ly/prisma-config-env-vars). Only used
// by the Prisma CLI (migrate, studio, db seed) — the running app still
// reads DATABASE_URL itself via dotenv in src/lib/prisma.ts.
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
