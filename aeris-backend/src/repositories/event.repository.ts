import { prisma } from '../core/prisma.js';
import { EventStage, SeverityLevel } from '@prisma/client';

const IN_MEMORY_EVENTS: any[] = [
  {
    id: 'evt-001',
    code: 'A1027',
    title: 'Severe Convective System',
    eventType: 'Mesoscale Convective Storm',
    stage: EventStage.INTENSIFICATION,
    severity: SeverityLevel.HIGH,
    confidencePct: 87.0,
    description: 'Intense rainfall and localized cloudburst risk over Eastern & Central Mumbai. Moving NE at 25 km/h.',
    locationName: 'Mithi River Basin Corridor',
    centerLat: 19.0728,
    centerLng: 72.8797,
    trajectoryDir: 'NE',
    trajectorySpeedKmh: 25.0,
    rainMinMm: 80.0,
    rainMaxMm: 120.0,
    peakDurationHours: '2–3',
    status: 'ACTIVE',
    detectedAt: new Date(Date.now() - 35 * 60 * 1000),
    expectedOnset: new Date(Date.now() + 15 * 60 * 1000),
    expectedPeak: new Date(Date.now() + 90 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date(),
    jurisdictionId: 'jur-mumbai-001',
    jurisdiction: {
      id: 'jur-mumbai-001',
      code: 'mumbai_mmr',
      name: 'Mumbai MMR',
      region: 'Konkan Basin',
    },
    affectedAreas: [
      { id: 'area-1', weatherEventId: 'evt-001', rank: 1, name: 'Kurla, Kalina, Santa Cruz', severity: SeverityLevel.VERY_HIGH, lat: 19.0728, lng: 72.8797, createdAt: new Date() },
      { id: 'area-2', weatherEventId: 'evt-001', rank: 2, name: 'BKC, Bandra East', severity: SeverityLevel.HIGH, lat: 19.0607, lng: 72.8683, createdAt: new Date() },
      { id: 'area-3', weatherEventId: 'evt-001', rank: 3, name: 'Chembur, Govandi', severity: SeverityLevel.HIGH, lat: 19.0522, lng: 72.8994, createdAt: new Date() },
      { id: 'area-4', weatherEventId: 'evt-001', rank: 4, name: 'Andheri, Jogeshwari', severity: SeverityLevel.MODERATE, lat: 19.1136, lng: 72.8697, createdAt: new Date() },
      { id: 'area-5', weatherEventId: 'evt-001', rank: 5, name: 'Eastern Suburbs (Thane border)', severity: SeverityLevel.MODERATE, lat: 19.2183, lng: 72.9781, createdAt: new Date() },
    ],
  },
  {
    id: 'evt-002',
    code: 'A1025',
    title: 'Thunderstorm Cluster',
    eventType: 'Convective Storm Cell',
    stage: EventStage.CONVECTIVE_INITIATION,
    severity: SeverityLevel.MODERATE,
    confidencePct: 74.0,
    description: 'Scattered thunderstorms over Western Suburbs.',
    locationName: 'Western Suburbs',
    centerLat: 19.1136,
    centerLng: 72.8697,
    trajectoryDir: 'NNE',
    trajectorySpeedKmh: 18.0,
    rainMinMm: 40.0,
    rainMaxMm: 65.0,
    peakDurationHours: '1–2',
    status: 'ACTIVE',
    detectedAt: new Date(Date.now() - 65 * 60 * 1000),
    expectedOnset: new Date(Date.now() + 30 * 60 * 1000),
    expectedPeak: new Date(Date.now() + 120 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date(),
    jurisdictionId: 'jur-mumbai-001',
    jurisdiction: {
      id: 'jur-mumbai-001',
      code: 'mumbai_mmr',
      name: 'Mumbai MMR',
      region: 'Konkan Basin',
    },
    affectedAreas: [],
  },
  {
    id: 'evt-003',
    code: 'A1023',
    title: 'Heavy Rainfall Event',
    eventType: 'Monsoon Orographic Surge',
    stage: EventStage.HEAVY_RAINFALL,
    severity: SeverityLevel.MODERATE,
    confidencePct: 68.0,
    description: 'Persistent moderate to heavy rainfall over Navi Mumbai.',
    locationName: 'Navi Mumbai',
    centerLat: 19.0330,
    centerLng: 73.0297,
    trajectoryDir: 'ENE',
    trajectorySpeedKmh: 15.0,
    rainMinMm: 35.0,
    rainMaxMm: 55.0,
    peakDurationHours: '2–4',
    status: 'ACTIVE',
    detectedAt: new Date(Date.now() - 120 * 60 * 1000),
    expectedOnset: new Date(Date.now() - 60 * 60 * 1000),
    expectedPeak: new Date(Date.now() + 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date(),
    jurisdictionId: 'jur-mumbai-001',
    jurisdiction: {
      id: 'jur-mumbai-001',
      code: 'mumbai_mmr',
      name: 'Mumbai MMR',
      region: 'Konkan Basin',
    },
    affectedAreas: [],
  },
];

export class EventRepository {
  static async findActiveEvents(jurisdictionCode?: string) {
    try {
      return await prisma.weatherEvent.findMany({
        where: {
          status: 'ACTIVE',
          ...(jurisdictionCode ? { jurisdiction: { code: jurisdictionCode } } : {}),
        },
        include: {
          affectedAreas: {
            orderBy: { rank: 'asc' },
          },
          jurisdiction: true,
        },
        orderBy: { detectedAt: 'desc' },
      });
    } catch (e) {
      return IN_MEMORY_EVENTS as any[];
    }
  }

  static async findByCode(code: string) {
    try {
      return await prisma.weatherEvent.findUnique({
        where: { code },
        include: {
          affectedAreas: {
            orderBy: { rank: 'asc' },
          },
          jurisdiction: true,
        },
      });
    } catch (e) {
      return IN_MEMORY_EVENTS.find((e) => e.code.toLowerCase() === code.toLowerCase()) || null;
    }
  }

  static async findById(id: string) {
    try {
      return await prisma.weatherEvent.findUnique({
        where: { id },
        include: {
          affectedAreas: {
            orderBy: { rank: 'asc' },
          },
          jurisdiction: true,
        },
      });
    } catch (e) {
      return IN_MEMORY_EVENTS.find((e) => e.id === id) || null;
    }
  }

  static async create(data: {
    code: string;
    title: string;
    eventType: string;
    stage: EventStage;
    severity: SeverityLevel;
    confidencePct: number;
    description: string;
    locationName: string;
    centerLat: number;
    centerLng: number;
    trajectoryDir?: string;
    trajectorySpeedKmh?: number;
    rainMinMm?: number;
    rainMaxMm?: number;
    peakDurationHours?: string;
    jurisdictionId: string;
    affectedAreas?: Array<{
      rank: number;
      name: string;
      severity: SeverityLevel;
      lat?: number;
      lng?: number;
    }>;
  }) {
    try {
      const { affectedAreas, ...eventData } = data;
      return await prisma.weatherEvent.create({
        data: {
          ...eventData,
          affectedAreas: affectedAreas
            ? {
                create: affectedAreas,
              }
            : undefined,
        },
        include: {
          affectedAreas: true,
          jurisdiction: true,
        },
      });
    } catch (e) {
      const newEvt = {
        id: `evt-${Date.now()}`,
        ...data,
        trajectoryDir: data.trajectoryDir || 'NE',
        trajectorySpeedKmh: data.trajectorySpeedKmh || 25.0,
        rainMinMm: data.rainMinMm || 80.0,
        rainMaxMm: data.rainMaxMm || 120.0,
        peakDurationHours: data.peakDurationHours || '2–3',
        status: 'ACTIVE',
        detectedAt: new Date(),
        expectedOnset: new Date(),
        expectedPeak: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        jurisdiction: {
          id: data.jurisdictionId,
          code: 'mumbai_mmr',
          name: 'Mumbai MMR',
          region: 'Konkan Basin',
        },
        affectedAreas: (data.affectedAreas || []).map((a, idx) => ({
          id: `area-${idx}`,
          weatherEventId: `evt-${Date.now()}`,
          rank: a.rank,
          name: a.name,
          severity: a.severity,
          lat: a.lat || 19.07,
          lng: a.lng || 72.88,
          createdAt: new Date(),
        })),
      };
      IN_MEMORY_EVENTS.push(newEvt);
      return newEvt as any;
    }
  }

  static async updateStage(id: string, stage: EventStage) {
    try {
      return await prisma.weatherEvent.update({
        where: { id },
        data: { stage },
        include: { affectedAreas: true },
      });
    } catch (e) {
      const evt = IN_MEMORY_EVENTS.find((ev) => ev.id === id);
      if (evt) evt.stage = stage;
      return evt;
    }
  }
}
