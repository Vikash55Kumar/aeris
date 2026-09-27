import { Request, Response, NextFunction } from 'express';
import { logger } from '../core/logger.js';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const { method, originalUrl, ip } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    logger.info(`${method} ${originalUrl} ${statusCode} - ${duration}ms [${ip}]`);
  });

  next();
};
