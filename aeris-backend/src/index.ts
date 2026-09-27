import http from 'http';
import { createApp } from './app.js';
import { config } from './core/config.js';
import { logger } from './core/logger.js';
import { prisma } from './core/prisma.js';
import { AerisWebSocketServer } from './websockets/ws-server.js';
import { IngestionJob } from './jobs/ingestion.job.js';
import { StormTrackerJob } from './jobs/storm-tracker.job.js';

const startServer = async () => {
  try {
    const app = createApp();
    const server = http.createServer(app);

    // Initialize WebSocket Streaming Server
    new AerisWebSocketServer(server);

    // Verify Database Connection
    try {
      await prisma.$connect();
      logger.info('Connected to PostgreSQL database successfully.');
    } catch (dbErr: any) {
      logger.warn(
        `Database connection warning: ${dbErr.message}. Ensure PostgreSQL is running on ${config.databaseUrl}. API fallback active.`
      );
    }

    // Start background simulation tickers
    IngestionJob.start();
    StormTrackerJob.start();

    // Listen on configured port
    server.listen(config.port, () => {
      logger.info(`=======================================================`);
      logger.info(`  AERIS Backend Server is running on port ${config.port}`);
      logger.info(`  Environment : ${config.nodeEnv}`);
      logger.info(`  REST API    : http://localhost:${config.port}${config.apiPrefix}`);
      logger.info(`  WebSockets  : ws://localhost:${config.port}/ws`);
      logger.info(`  CAP XML     : http://localhost:${config.port}${config.apiPrefix}/alerts/cap.xml`);
      logger.info(`=======================================================`);
    });

    // Graceful Shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Starting graceful shutdown...`);
      IngestionJob.stop();
      StormTrackerJob.stop();

      server.close(async () => {
        logger.info('HTTP & WebSocket servers closed.');
        await prisma.$disconnect();
        logger.info('Database disconnected. Process exit complete.');
        process.exit(0);
      });

      // Force close after 10s if hanging
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    logger.error('Fatal error during backend server startup:', error);
    process.exit(1);
  }
};

startServer();
