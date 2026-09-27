import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './core/config.js';
import { apiRouter } from './routes/index.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { requestLogger } from './middlewares/request-logger.middleware.js';
import { NotFoundError } from './core/errors.js';

export const createApp = () => {
  const app = express();

  // Security & Parsing Middlewares
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl) or matched origins
        if (!origin || config.corsOrigins.includes('*') || config.corsOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(null, true); // Permissive in development
        }
      },
      credentials: true,
    })
  );
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(requestLogger);

  // Root Welcome Endpoint
  app.get('/', (req, res) => {
    res.status(200).json({
      service: 'AERIS Weather Intelligence & Early Warning System API',
      status: 'ONLINE',
      version: '1.0.0',
      apiDocs: `${config.apiPrefix}`,
      health: `${config.apiPrefix}/health`,
    });
  });

  // Mount API V1 Router
  app.use(config.apiPrefix, apiRouter);

  // Catch-all 404 for undefined routes
  app.use((req, res, next) => {
    next(new NotFoundError(`Route ${req.method} ${req.originalUrl}`));
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
};
