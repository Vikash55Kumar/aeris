import { prisma } from '../core/prisma.js';

const IN_MEMORY_TELEMETRY = [
  {
    id: 'tel-001',
    jurisdictionId: 'jur-mumbai-001',
    stationId: 'IMD_MUMBAI_S_BAND',
    cloudTopTempCelsius: -72.4,
    coolingRatePerHour: -8.2,
    radarReflectivityDbz: 52.0,
    dopplerRadialVelocityKt: 24.5,
    lightningFlashesPerMin: 36,
    precipitableWaterMm: 68.2,
    capeJkg: 2850.0,
    surfacePrecipRateMmHr: 92.0,
    windSpeedKmh: 25.0,
    windDirection: 'NE',
    recordedAt: new Date(),
    jurisdiction: {
      id: 'jur-mumbai-001',
      code: 'mumbai_mmr',
      name: 'Mumbai MMR',
      region: 'Konkan Basin',
    },
  },
];

export class WeatherRepository {
  static async getLatestTelemetry(jurisdictionCode?: string) {
    try {
      return await prisma.atmosphericTelemetry.findFirst({
        where: jurisdictionCode ? { jurisdiction: { code: jurisdictionCode } } : {},
        orderBy: { recordedAt: 'desc' },
        include: { jurisdiction: true },
      });
    } catch (e) {
      return IN_MEMORY_TELEMETRY[0];
    }
  }

  static async getTelemetryHistory(jurisdictionCode?: string, limit = 12) {
    try {
      return await prisma.atmosphericTelemetry.findMany({
        where: jurisdictionCode ? { jurisdiction: { code: jurisdictionCode } } : {},
        orderBy: { recordedAt: 'desc' },
        take: limit,
        include: { jurisdiction: true },
      });
    } catch (e) {
      return IN_MEMORY_TELEMETRY;
    }
  }

  static async recordTelemetry(data: {
    jurisdictionId: string;
    stationId?: string;
    cloudTopTempCelsius: number;
    coolingRatePerHour: number;
    radarReflectivityDbz: number;
    dopplerRadialVelocityKt: number;
    lightningFlashesPerMin: number;
    precipitableWaterMm: number;
    capeJkg: number;
    surfacePrecipRateMmHr: number;
    windSpeedKmh: number;
    windDirection: string;
  }) {
    try {
      return await prisma.atmosphericTelemetry.create({
        data,
      });
    } catch (e) {
      const rec = {
        id: `tel-${Date.now()}`,
        stationId: data.stationId || 'IMD_MUMBAI_S_BAND',
        ...data,
        recordedAt: new Date(),
        jurisdiction: {
          id: data.jurisdictionId,
          code: 'mumbai_mmr',
          name: 'Mumbai MMR',
          region: 'Konkan Basin',
        },
      };
      IN_MEMORY_TELEMETRY.unshift(rec);
      return rec;
    }
  }
}
