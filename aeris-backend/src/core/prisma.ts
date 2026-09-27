import { PrismaClient } from '@prisma/client';
import { logger } from './logger.js';

// PrismaClient is attached to the global object in development to prevent exhausting database connection limit.
declare global {
  var prismaClientGlobal: PrismaClient | undefined;
}

export const prisma =
  globalThis.prismaClientGlobal ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? [
            { emit: 'event', level: 'query' },
            { emit: 'stdout', level: 'error' },
            { emit: 'stdout', level: 'info' },
            { emit: 'stdout', level: 'warn' },
          ]
        : ['error'],
  });

if (process.env.NODE_ENV === 'development') {
  // @ts-ignore
  prisma.$on('query', (e: any) => {
    logger.debug(`Query: ${e.query} - Params: ${e.params} - Duration: ${e.duration}ms`);
  });
}

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaClientGlobal = prisma;
}
