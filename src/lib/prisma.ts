import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "@/src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL?.trim();

if (!connectionString) {
  throw new Error("DATABASE_URL fehlt.");
}

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

const adapter = new PrismaPg(pool);

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