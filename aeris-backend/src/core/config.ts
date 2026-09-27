import dotenv from 'dotenv';
import path from 'path';

// Load .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export interface AppConfig {
  port: number;
  nodeEnv: string;
  apiPrefix: string;
  corsOrigins: string[];
  databaseUrl: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  jwtRefreshSecret: string;
  jwtRefreshExpiresIn: string;
  defaultJurisdictionCode: string;
  simulationTickIntervalMs: number;
  capSenderId: string;
}

export const config: AppConfig = {
  port: parseInt(process.env.PORT || '8000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  apiPrefix: process.env.API_PREFIX || '/api/v1',
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000')
    .split(',')
    .map((s) => s.trim()),
  databaseUrl: process.env.DATABASE_URL || 'postgresql://aeris_user:aeris_password@localhost:5432/aeris_db?schema=public',
  jwtSecret: process.env.JWT_SECRET || 'aeris_super_secure_jwt_secret_key_2026_sdma_ndma',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'aeris_super_secure_refresh_key_2026_sdma_ndma',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  defaultJurisdictionCode: process.env.DEFAULT_JURISDICTION_CODE || 'mumbai_mmr',
  simulationTickIntervalMs: parseInt(process.env.SIMULATION_TICK_INTERVAL_MS || '15000', 10),
  capSenderId: process.env.CAP_SENDER_ID || 'sdma.officer@maharashtra.gov.in',
};
