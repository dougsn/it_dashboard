import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const SLOW_QUERY_MS = 500;

function createClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  const client = new PrismaClient({ adapter, log: [{ level: "query", emit: "event" }] });

  if (process.env.NODE_ENV !== "production") {
    client.$on("query", (e) => {
      if (e.duration >= SLOW_QUERY_MS) {
        console.warn(`[Prisma slow query] ${e.duration}ms — ${e.query.slice(0, 200)}`);
      }
    });
  }

  return client;
}

export const db = globalForPrisma.prisma || createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
