import { Request, Response, NextFunction } from 'express';
import { SecurityUtil, TokenPayload } from '../core/security.js';
import { UnauthorizedError, ForbiddenError } from '../core/errors.js';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('No authentication token provided'));
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = SecurityUtil.verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (error) {
    return next(new UnauthorizedError('Invalid or expired authentication token'));
  }
};

export const optionalAuthenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const payload = SecurityUtil.verifyAccessToken(token);
      req.user = payload;
    } catch (e) {
      // Ignore token verification errors for optional auth
    }
  }
  next();
};

export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `User role '${req.user.role}' is not authorized to access this resource. Required roles: ${allowedRoles.join(
            ', '
          )}`
        )
      );
    }

    next();
  };
};
