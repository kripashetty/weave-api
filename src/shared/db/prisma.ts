import { PrismaClient } from '@prisma/client';

type LogLevel = 'query' | 'info' | 'warn' | 'error';

function buildLogConfig(): LogLevel[] {
  if (process.env['NODE_ENV'] === 'production') {
    return ['warn', 'error'];
  }
  // query logging in development — surfaces N+1 problems early (ADR-06)
  return ['query', 'info', 'warn', 'error'];
}

// ADR-06: Prisma is the sole interface to PostgreSQL.
// Singleton prevents exhausting the connection pool during hot-reload in development.
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: buildLogConfig(),
  });

if (process.env['NODE_ENV'] !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Called by the graceful shutdown handler in app.ts.
// Allows in-flight queries to complete before the connection pool is drained.
export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
}
