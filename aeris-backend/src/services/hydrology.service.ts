import { HydrologyRepository } from '../repositories/hydrology.repository.js';
import { NotFoundError } from '../core/errors.js';

export class HydrologyService {
  static async getHydrologyOverview(jurisdictionCode = 'mumbai_mmr') {
    const gauges = await HydrologyRepository.getGaugeStations(jurisdictionCode);
    const inundationZones = await HydrologyRepository.getInundationZones('Mumbai MMR');

    // Synthesized Basin Hydro State
    const basinState = {
      basinRunoffM3s: 1420.0,
      soilMoistureSaturationPct: 88.0,
      soilInfiltrationRateMmHr: 4.5,
      peakRunoffEta: '+1h 45m (16:05 IST)',
      mithiRiverStageM: 3.82,
      mithiWarningThresholdM: 3.50,
      mithiDangerThresholdM: 4.20,
      waterloggingHotspotsCount: 5,
    };

    return {
      basinState,
      gauges: gauges.map((g: any) => ({
        id: g.id,
        code: g.stationCode,
        name: g.name,
        location: g.locationName,
        coords: [g.lat, g.lng],
        currentLevelM: g.currentLevelM,
        warningLevelM: g.warningLevelM,
        dangerLevelM: g.dangerLevelM,
        capacityPct: Math.round((g.currentLevelM / g.dangerLevelM) * 100),
        trendPerHourM: g.trendPerHourM,
        status: g.status,
        isWarning: g.currentLevelM >= g.warningLevelM,
        isDanger: g.currentLevelM >= g.dangerLevelM,
        updatedAt: g.updatedAt,
      })),
      inundationZones: inundationZones.map((z: any) => ({
        id: z.id,
        name: z.name,
        severity: z.severity,
        waterlogDepthCm: z.waterlogDepthCm,
        riskTag: z.riskTag,
        coords: JSON.parse(z.polygonCoordsJson || '[]'),
      })),
    };
  }

  static async updateGaugeReading(
    stationCode: string,
    data: { currentLevelM: number; dischargeM3s?: number; trendPerHourM?: number }
  ) {
    const gauge = await HydrologyRepository.getGaugeByCode(stationCode);
    if (!gauge) {
      throw new NotFoundError(`River gauge with code '${stationCode}'`);
    }

    return HydrologyRepository.updateGaugeReading(stationCode, data);
  }
}
