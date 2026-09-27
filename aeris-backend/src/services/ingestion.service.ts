import { WeatherRepository } from '../repositories/weather.repository.js';
import { prisma } from '../core/prisma.js';
import { logger } from '../core/logger.js';

export class IngestionService {
  static async ingestMultiSensorSnapshot(jurisdictionCode = 'mumbai_mmr') {
    const jurisdiction = await prisma.jurisdiction.findUnique({
      where: { code: jurisdictionCode },
    });

    if (!jurisdiction) {
      logger.warn(`Ingestion skipped: jurisdiction '${jurisdictionCode}' not found`);
      return null;
    }

    // Dynamic variation to simulate real-time sensor fluctuation
    const jitter = (Math.random() - 0.5) * 2.0;

    const recorded = await WeatherRepository.recordTelemetry({
      jurisdictionId: jurisdiction.id,
      stationId: 'IMD_MUMBAI_S_BAND',
      cloudTopTempCelsius: -72.4 + jitter * 0.5,
      coolingRatePerHour: -8.2 + jitter * 0.2,
      radarReflectivityDbz: Math.min(65, Math.max(30, 52.0 + jitter)),
      dopplerRadialVelocityKt: 24.5 + jitter * 0.8,
      lightningFlashesPerMin: Math.max(0, Math.round(36 + jitter * 3)),
      precipitableWaterMm: 68.2 + jitter * 0.4,
      capeJkg: Math.round(2850 + jitter * 50),
      surfacePrecipRateMmHr: Math.max(0, Math.round(92 + jitter * 4)),
      windSpeedKmh: 25.0 + jitter * 0.5,
      windDirection: 'NE',
    });

    logger.info(`Multi-sensor snapshot ingested for ${jurisdictionCode}: ${recorded.radarReflectivityDbz} dBZ, ${recorded.surfacePrecipRateMmHr} mm/hr`);
    return recorded;
  }
}
