import { prisma } from '../core/prisma.js';
import { RiverGaugeStatus, SeverityLevel } from '@prisma/client';

const IN_MEMORY_GAUGES = [
  {
    id: 'gauge-001',
    jurisdictionId: 'jur-mumbai-001',
    stationCode: 'CST-BRIDGE-01',
    name: 'Mithi River - CST Bridge',
    locationName: 'Kurla / BKC',
    lat: 19.068,
    lng: 72.872,
    currentLevelM: 3.82,
    warningLevelM: 3.50,
    dangerLevelM: 4.20,
    trendPerHourM: 0.35,
    capacityPct: 91.0,
    dischargeM3s: 410.0,
    status: RiverGaugeStatus.WARNING,
    updatedAt: new Date(),
  },
  {
    id: 'gauge-002',
    jurisdictionId: 'jur-mumbai-001',
    stationCode: 'KRANTI-NAGAR-02',
    name: 'Mithi River - Kurla Kranti Nagar',
    locationName: 'Kurla West',
    lat: 19.075,
    lng: 72.880,
    currentLevelM: 3.65,
    warningLevelM: 3.40,
    dangerLevelM: 4.00,
    trendPerHourM: 0.28,
    capacityPct: 88.0,
    dischargeM3s: 380.0,
    status: RiverGaugeStatus.WARNING,
    updatedAt: new Date(),
  },
  {
    id: 'gauge-003',
    jurisdictionId: 'jur-mumbai-001',
    stationCode: 'DAHISAR-03',
    name: 'Dahisar River - WEH Bridge',
    locationName: 'Dahisar Check Naka',
    lat: 19.255,
    lng: 72.865,
    currentLevelM: 2.10,
    warningLevelM: 2.80,
    dangerLevelM: 3.50,
    trendPerHourM: 0.10,
    capacityPct: 60.0,
    dischargeM3s: 140.0,
    status: RiverGaugeStatus.NORMAL,
    updatedAt: new Date(),
  },
];

const IN_MEMORY_INUNDATION = [
  {
    id: 'inund-001',
    name: 'Mithi River Basin & Kurla West',
    region: 'Mumbai MMR',
    severity: SeverityLevel.CRITICAL,
    waterlogDepthCm: 42.0,
    riskTag: 'CRITICAL INUNDATION',
    polygonCoordsJson: JSON.stringify([
      [19.0600, 72.8650],
      [19.0850, 72.8700],
      [19.0800, 72.8950],
      [19.0550, 72.8800],
    ]),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'inund-002',
    name: 'Chembur & Chunabhatti Lowlands',
    region: 'Mumbai MMR',
    severity: SeverityLevel.HIGH,
    waterlogDepthCm: 28.0,
    riskTag: 'HIGH FLOOD RISK',
    polygonCoordsJson: JSON.stringify([
      [19.0450, 72.8850],
      [19.0700, 72.8950],
      [19.0650, 72.9200],
      [19.0350, 72.9050],
    ]),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'inund-003',
    name: 'Thane Creek Basin & Western Suburbs',
    region: 'Mumbai MMR',
    severity: SeverityLevel.MODERATE,
    waterlogDepthCm: 18.0,
    riskTag: 'MODERATE RISK',
    polygonCoordsJson: JSON.stringify([
      [19.1800, 72.9500],
      [19.2200, 72.9600],
      [19.2100, 72.9950],
      [19.1700, 72.9800],
    ]),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export class HydrologyRepository {
  static async getGaugeStations(jurisdictionCode?: string) {
    try {
      return await prisma.riverGauge.findMany({
        where: jurisdictionCode ? { jurisdiction: { code: jurisdictionCode } } : {},
        orderBy: { currentLevelM: 'desc' },
        include: { jurisdiction: true },
      });
    } catch (e) {
      return IN_MEMORY_GAUGES as any;
    }
  }

  static async getGaugeByCode(stationCode: string) {
    try {
      return await prisma.riverGauge.findUnique({
        where: { stationCode },
        include: { jurisdiction: true },
      });
    } catch (e) {
      return IN_MEMORY_GAUGES.find((g) => g.stationCode === stationCode) || null;
    }
  }

  static async updateGaugeReading(
    stationCode: string,
    data: { currentLevelM: number; dischargeM3s?: number; trendPerHourM?: number }
  ) {
    try {
      return await prisma.riverGauge.update({
        where: { stationCode },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });
    } catch (e) {
      const g = IN_MEMORY_GAUGES.find((item) => item.stationCode === stationCode);
      if (g) {
        g.currentLevelM = data.currentLevelM;
        if (data.dischargeM3s !== undefined) g.dischargeM3s = data.dischargeM3s;
        if (data.trendPerHourM !== undefined) g.trendPerHourM = data.trendPerHourM;
        g.updatedAt = new Date();
      }
      return g;
    }
  }

  static async getInundationZones(region = 'Mumbai MMR') {
    try {
      return await prisma.inundationZone.findMany({
        where: { region },
        orderBy: { waterlogDepthCm: 'desc' },
      });
    } catch (e) {
      return IN_MEMORY_INUNDATION;
    }
  }
}
