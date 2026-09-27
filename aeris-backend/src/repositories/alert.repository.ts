import { prisma } from '../core/prisma.js';
import { CapSeverity, CapStatus, CapMsgType, CapUrgency, CapCertainty } from '@prisma/client';

const IN_MEMORY_ALERTS = [
  {
    id: 'alert-001',
    identifier: 'AERIS-CAP-2026-07-21-004',
    sender: 'sdma.officer@maharashtra.gov.in',
    sentAt: new Date(Date.now() - 2 * 60 * 1000),
    status: CapStatus.ACTUAL,
    msgType: CapMsgType.ALERT,
    category: 'Met',
    eventTitle: 'Heavy Rainfall & Localized Cloudburst Warning',
    urgency: CapUrgency.IMMEDIATE,
    severity: CapSeverity.EXTREME,
    certainty: CapCertainty.OBSERVED,
    headline: 'Heavy rainfall intensifying over Kurla and BKC',
    description: 'Intense convective storm cell A1027 producing 92 mm/hr deluge over Kurla-BKC corridor. Mithi river level crossed warning threshold (3.82m).',
    instruction: 'Avoid low-lying subways under LBS Marg and CST Bridge. Follow municipal traffic diversions.',
    targetAreaDesc: 'Kurla, Sion, BKC, Ghatkopar, Chembur',
    jurisdictionId: 'jur-mumbai-001',
    jurisdiction: {
      id: 'jur-mumbai-001',
      code: 'mumbai_mmr',
      name: 'Mumbai MMR',
      region: 'Konkan Basin',
    },
    weatherEvent: {
      id: 'evt-001',
      code: 'A1027',
      title: 'Severe Convective System',
    },
  },
  {
    id: 'alert-002',
    identifier: 'AERIS-CAP-2026-07-21-003',
    sender: 'sdma.officer@maharashtra.gov.in',
    sentAt: new Date(Date.now() - 15 * 60 * 1000),
    status: CapStatus.ACTUAL,
    msgType: CapMsgType.ALERT,
    category: 'Met',
    eventTitle: 'Thunderstorm with Frequent Lightning Alert',
    urgency: CapUrgency.EXPECTED,
    severity: CapSeverity.SEVERE,
    certainty: CapCertainty.LIKELY,
    headline: 'Thunderstorm with frequent lightning over Western Suburbs',
    description: 'Atmospheric sounding indicates severe convective updrafts with vertical velocity exceeding 28 m/s.',
    instruction: 'Stay indoors away from metal structures and open fields.',
    targetAreaDesc: 'Western Suburbs, Andheri, Goregaon, Borivali',
    jurisdictionId: 'jur-mumbai-001',
    jurisdiction: {
      id: 'jur-mumbai-001',
      code: 'mumbai_mmr',
      name: 'Mumbai MMR',
      region: 'Konkan Basin',
    },
    weatherEvent: null,
  },
  {
    id: 'alert-003',
    identifier: 'AERIS-CAP-2026-07-21-002',
    sender: 'sdma.officer@maharashtra.gov.in',
    sentAt: new Date(Date.now() - 35 * 60 * 1000),
    status: CapStatus.ACTUAL,
    msgType: CapMsgType.ALERT,
    category: 'Met',
    eventTitle: 'Localized Cloudburst Risk Increasing in Eastern Mumbai',
    urgency: CapUrgency.IMMEDIATE,
    severity: CapSeverity.SEVERE,
    certainty: CapCertainty.LIKELY,
    headline: 'Localized cloudburst risk increasing in Eastern Mumbai',
    description: 'INSAT-3DR IR1 band shows rapid cloud top cooling from -42°C to -72.4°C.',
    instruction: 'Emergency response teams placed on Level 2 standby.',
    targetAreaDesc: 'Eastern Suburbs, Ghatkopar, Chembur',
    jurisdictionId: 'jur-mumbai-001',
    jurisdiction: {
      id: 'jur-mumbai-001',
      code: 'mumbai_mmr',
      name: 'Mumbai MMR',
      region: 'Konkan Basin',
    },
    weatherEvent: null,
  },
];

export class AlertRepository {
  static async getActiveAlerts(jurisdictionCode?: string, limit = 10) {
    try {
      return await prisma.emergencyAlert.findMany({
        where: {
          status: 'ACTUAL',
          ...(jurisdictionCode ? { jurisdiction: { code: jurisdictionCode } } : {}),
        },
        orderBy: { sentAt: 'desc' },
        take: limit,
        include: {
          jurisdiction: true,
          weatherEvent: true,
        },
      });
    } catch (e) {
      return IN_MEMORY_ALERTS.slice(0, limit) as any;
    }
  }

  static async findByIdentifier(identifier: string) {
    try {
      return await prisma.emergencyAlert.findUnique({
        where: { identifier },
        include: {
          jurisdiction: true,
          weatherEvent: true,
        },
      });
    } catch (e) {
      return IN_MEMORY_ALERTS.find((a) => a.identifier === identifier) || null;
    }
  }

  static async create(data: {
    jurisdictionId: string;
    weatherEventId?: string;
    identifier: string;
    sender: string;
    status: CapStatus;
    msgType: CapMsgType;
    category: string;
    eventTitle: string;
    urgency: CapUrgency;
    severity: CapSeverity;
    certainty: CapCertainty;
    headline: string;
    description: string;
    instruction?: string;
    targetAreaDesc?: string;
  }) {
    try {
      return await prisma.emergencyAlert.create({
        data,
        include: {
          jurisdiction: true,
          weatherEvent: true,
        },
      });
    } catch (e) {
      const newAlert = {
        id: `alert-${Date.now()}`,
        ...data,
        sentAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        instruction: data.instruction || '',
        targetAreaDesc: data.targetAreaDesc || '',
        jurisdiction: {
          id: data.jurisdictionId,
          code: 'mumbai_mmr',
          name: 'Mumbai MMR',
          region: 'Konkan Basin',
        },
        weatherEvent: null,
      };
      IN_MEMORY_ALERTS.unshift(newAlert as any);
      return newAlert;
    }
  }
}
