// src/lib/db.js
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    // Prisma 7 programmatic adapter configuration structure
    adapter: null, 
    datasource: {
      url: process.env.DATABASE_URL,
    },
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}