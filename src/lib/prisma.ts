import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Prisma 7 requires an explicit driver adapter at runtime — the schema's
// datasource block no longer carries a connection URL (see prisma.config.ts).
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

// Reuse a single PrismaClient across hot reloads / require cache in dev.
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma = global.__prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  global.__prisma = prisma;
}
