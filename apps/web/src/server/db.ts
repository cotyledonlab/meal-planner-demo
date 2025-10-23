import { PrismaClient } from '@prisma/client';

import { env } from '~/env';

const createPrismaClient = () =>
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    // Connection pool configuration to prevent connection termination issues
    // https://www.prisma.io/docs/guides/performance-and-optimization/connection-management
    datasources: {
      db: {
        url: env.DATABASE_URL,
      },
    },
    // Error formatting for better debugging
    errorFormat: env.NODE_ENV === 'development' ? 'pretty' : 'minimal',
  });

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== 'production') globalForPrisma.prisma = db;

// Add connection retry logic and graceful shutdown handling
if (env.NODE_ENV === 'production') {
  // Handle graceful shutdown on process termination
  const gracefulShutdown = () => {
    db.$disconnect().catch((err) => console.error('Failed to disconnect:', err));
  };

  process.on('SIGINT', gracefulShutdown);
  process.on('SIGTERM', gracefulShutdown);
}
