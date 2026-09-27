import { Request, Response, NextFunction } from 'express';
import { AppError } from '../core/errors.js';
import { logger } from '../core/logger.js';
import { config } from '../core/config.js';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    logger.warn(`Operational Error: ${err.message} (${err.statusCode})`, {
      path: req.originalUrl,
      method: req.method,
      details: err.details,
    });

    return res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        statusCode: err.statusCode,
        details: err.details,
      },
    });
  }

  // Unhandled / programmer errors
  logger.error(`Unhandled Internal Error: ${err.message}`, err.stack);

  const isDev = config.nodeEnv === 'development';
  return res.status(500).json({
    success: false,
    error: {
      message: isDev ? err.message : 'Internal Server Error. Please contact AERIS Support.',
      statusCode: 500,
      stack: isDev ? err.stack : undefined,
    },
  });
};
