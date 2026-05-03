import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/src/generated/prisma/client";

const connectionString =
  process.env.SUPABASE_DATABASE_URL?.trim() || process.env.DATABASE_URL?.trim();

if (!connectionString) {
  throw new Error("SUPABASE_DATABASE_URL oder DATABASE_URL fehlt.");
}

const adapter = new PrismaPg({
  connectionString,
  max: 1,
  idleTimeoutMillis: 10_000,
  connectionTimeoutMillis: 10_000,
});

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}