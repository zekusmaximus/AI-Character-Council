import { PrismaClient } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs';
import { app } from 'electron';

// Get the app data directory
const userDataPath = app.getPath('userData');
const dbDir = path.join(userDataPath, 'database');

// Ensure database directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Create database URL for user's app data directory
const dbPath = path.join(dbDir, 'ai_character_council.db');
const databaseUrl = `file:${dbPath}`;

// Configure Prisma client
const prismaClientSingleton = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });
};

// Create global type for PrismaClient
type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

// Create global reference
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

// Export the Prisma client
export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;