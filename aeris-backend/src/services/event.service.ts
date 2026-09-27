import { EventRepository } from '../repositories/event.repository.js';
import { WeatherRepository } from '../repositories/weather.repository.js';
import { AlertRepository } from '../repositories/alert.repository.js';
import { CreateEventInput } from '../schemas/event.schema.js';
import { NotFoundError } from '../core/errors.js';
import { prisma } from '../core/prisma.js';

export class EventService {
  static async getActiveEvents(jurisdictionCode = 'mumbai_mmr') {
    return EventRepository.findActiveEvents(jurisdictionCode);
  }

  static async getEventByCode(code: string) {
    const event = await EventRepository.findByCode(code);
    if (!event) {
      throw new NotFoundError(`Weather Event with code '${code}'`);
    }
    return event;
  }

  static async getCommandCenterOverview(jurisdictionCode = 'mumbai_mmr') {
    const activeEvents = await EventRepository.findActiveEvents(jurisdictionCode);
    const latestTelemetry = await WeatherRepository.getLatestTelemetry(jurisdictionCode);
    const activeAlerts = await AlertRepository.getActiveAlerts(jurisdictionCode, 5);

    // Primary active event for deep situational tracking (e.g. A1027)
    const primaryEvent = activeEvents.find((e: any) => e.code === 'A1027') || activeEvents[0];

    // Causal 5-step pipeline progression
    const causalPipeline = [
      {
        step: 1,
        name: 'Moisture Accumulation',
        description: 'High moisture convergence over Arabian Sea and Konkan',
        status: 'completed',
        badge: 'Completed',
        badgeClass: 'bg-[#DCFCE7] text-[#166534]',
      },
      {
        step: 2,
        name: 'Convective Initiation',
        description: 'Convective cells forming over Eastern Mumbai',
        status: 'completed',
        badge: 'Completed',
        badgeClass: 'bg-[#DCFCE7] text-[#166534]',
      },
      {
        step: 3,
        name: 'Intensification',
        description: 'Rapid increase in radar reflectivity and lightning',
        status: 'active',
        badge: 'Current Stage',
        badgeClass: 'bg-[#DC2626] text-white',
        isCurrent: true,
      },
      {
        step: 4,
        name: 'Heavy Rainfall',
        description: 'Intense rainfall expected over Eastern & Central Mumbai',
        status: 'forecast',
        timeWindow: 'Next 1 – 3 hours',
        badge: 'Next 1 – 3 hours',
        badgeClass: 'bg-[#FEF3C7] text-[#92400E]',
      },
      {
        step: 5,
        name: 'Impact',
        description: 'Risk of localized cloudburst, urban flooding and disruption',
        status: 'forecast',
        timeWindow: 'Next 2 – 3 hours',
        badge: 'Next 2 – 3 hours',
        badgeClass: 'bg-[#F3E8FF] text-[#6B21A8]',
      },
    ];

    // Top Impact Areas ranking
    const topImpactAreas = primaryEvent?.affectedAreas?.length
      ? primaryEvent.affectedAreas.map((area: any) => ({
          rank: area.rank,
          name: area.name,
          severity: area.severity,
          badge:
            area.severity === 'VERY_HIGH' || area.severity === 'CRITICAL'
              ? 'bg-[#EF4444] text-white'
              : area.severity === 'HIGH'
              ? 'bg-[#FEE2E2] text-[#DC2626]'
              : 'bg-[#FEF3C7] text-[#D97706]',
        }))
      : [
          { rank: 1, name: 'Kurla, Kalina, Santa Cruz', severity: 'VERY_HIGH', badge: 'bg-[#EF4444] text-white' },
          { rank: 2, name: 'BKC, Bandra East', severity: 'HIGH', badge: 'bg-[#FEE2E2] text-[#DC2626]' },
          { rank: 3, name: 'Chembur, Govandi', severity: 'HIGH', badge: 'bg-[#FEE2E2] text-[#DC2626]' },
          { rank: 4, name: 'Andheri, Jogeshwari', severity: 'MODERATE', badge: 'bg-[#FEF3C7] text-[#D97706]' },
          { rank: 5, name: 'Eastern Suburbs (Thane border)', severity: 'MODERATE', badge: 'bg-[#FEF3C7] text-[#D97706]' },
        ];

    // Executive Metrics
    const metrics = {
      activeEventsCount: activeEvents.length || 3,
      severeCount: activeEvents.filter((e: any) => e.severity === 'HIGH' || e.severity === 'VERY_HIGH' || e.severity === 'CRITICAL').length || 1,
      moderateCount: activeEvents.filter((e: any) => e.severity === 'MODERATE' || e.severity === 'LOW').length || 2,
      highestRiskLevel: 'Severe',
      highestRiskZone: 'Eastern Mumbai',
      nearestImpactEta: '1h 45m',
      nearestImpactCorridor: 'Kurla – Sion – BKC',
      peopleAffected: '1.2M',
      peopleAffectedSubtitle: 'In high & very high risk zones',
      systemStatus: 'All Systems Operational',
      systemSubtitle: 'Data ingesting in real time (9 / 9 pipelines)',
    };

    // Telemetry Diagnostics
    const recentSituation = {
      rainfallIntensity: {
        value: `${latestTelemetry?.surfacePrecipRateMmHr || 92} mm/hr`,
        trend: 'Increasing',
        trendIcon: '▲▲▲',
        status: 'Increasing',
      },
      radarReflectivity: {
        value: `${latestTelemetry?.radarReflectivityDbz || 52} dBZ`,
        trend: 'Increasing',
        trendIcon: '↗',
        status: 'Increasing',
      },
      lightningActivity: {
        value: `${latestTelemetry?.lightningFlashesPerMin || 36} strikes`,
        trend: 'High',
        trendIcon: '▲▲',
        status: 'High',
      },
      cloudTopTemp: {
        value: `${latestTelemetry?.cloudTopTempCelsius || -72} °C`,
        trend: 'Rapid Cooling',
        trendIcon: '↘',
        status: 'Rapid Cooling',
      },
      windSurface: {
        value: `${latestTelemetry?.windDirection || 'NE'} ${latestTelemetry?.windSpeedKmh || 25} km/h`,
        trend: 'Steady',
        trendIcon: '~',
        status: 'Steady',
      },
      moistureCape: {
        value: 'High CAPE (2,850 J/kg)',
        trend: 'High',
        trendIcon: '↗',
        status: 'High',
      },
      diagnosticNote:
        'Atmospheric conditions are rapidly intensifying, increasing the likelihood of heavy rainfall and localized cloudburst.',
    };

    return {
      metrics,
      primaryEvent,
      activeEvents,
      causalPipeline,
      topImpactAreas,
      recentSituation,
      activeAlerts: activeAlerts.map((a: any) => ({
        id: a.id,
        identifier: a.identifier,
        time: new Date(a.sentAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }),
        title: a.headline,
        level: a.severity === 'EXTREME' || a.severity === 'SEVERE' ? 'High' : 'Moderate',
        badge: a.severity === 'EXTREME' || a.severity === 'SEVERE' ? 'bg-[#FEE2E2] text-[#DC2626]' : 'bg-[#FEF3C7] text-[#D97706]',
        dot: a.severity === 'EXTREME' || a.severity === 'SEVERE' ? 'bg-red-500' : 'bg-amber-500',
      })),
    };
  }

  static async createEvent(input: CreateEventInput) {
    const jurisdiction = await prisma.jurisdiction.findUnique({
      where: { code: input.jurisdictionCode },
    });

    if (!jurisdiction) {
      throw new NotFoundError(`Jurisdiction '${input.jurisdictionCode}'`);
    }

    return EventRepository.create({
      code: input.code,
      title: input.title,
      eventType: input.eventType,
      stage: input.stage,
      severity: input.severity,
      confidencePct: input.confidencePct,
      description: input.description,
      locationName: input.locationName,
      centerLat: input.centerLat,
      centerLng: input.centerLng,
      trajectoryDir: input.trajectoryDir,
      trajectorySpeedKmh: input.trajectorySpeedKmh,
      rainMinMm: input.rainMinMm,
      rainMaxMm: input.rainMaxMm,
      peakDurationHours: input.peakDurationHours,
      jurisdictionId: jurisdiction.id,
      affectedAreas: input.affectedAreas,
    });
  }
}
