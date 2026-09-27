import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from './config.js';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  jurisdictionId?: string | null;
}

export class SecurityUtil {
  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static generateAccessToken(payload: TokenPayload): string {
    const options: SignOptions = {
      expiresIn: config.jwtExpiresIn as any,
    };
    return jwt.sign(payload, config.jwtSecret, options);
  }

  static generateRefreshToken(payload: TokenPayload): string {
    const options: SignOptions = {
      expiresIn: config.jwtRefreshExpiresIn as any,
    };
    return jwt.sign(payload, config.jwtRefreshSecret, options);
  }

  static verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, config.jwtSecret) as TokenPayload;
  }

  static verifyRefreshToken(token: string): TokenPayload {
    return jwt.verify(token, config.jwtRefreshSecret) as TokenPayload;
  }
}
