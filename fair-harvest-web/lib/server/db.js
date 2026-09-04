import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

export const prisma = globalForPrisma.__fairHarvestPrisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__fairHarvestPrisma = prisma;
}
