import { AlertRepository } from '../repositories/alert.repository.js';
import { CreateAlertInput } from '../schemas/alert.schema.js';
import { NotFoundError } from '../core/errors.js';
import { create } from 'xmlbuilder2';
import { prisma } from '../core/prisma.js';

export class AlertService {
  static async getActiveAlerts(jurisdictionCode = 'mumbai_mmr', limit = 10) {
    const alerts = await AlertRepository.getActiveAlerts(jurisdictionCode, limit);
    return alerts.map((a: any) => ({
      id: a.id,
      identifier: a.identifier,
      sender: a.sender,
      sentAt: a.sentAt instanceof Date ? a.sentAt.toISOString() : new Date(a.sentAt).toISOString(),
      timeAgo: this.getTimeAgo(new Date(a.sentAt)),
      status: a.status,
      msgType: a.msgType,
      category: a.category,
      eventTitle: a.eventTitle,
      urgency: a.urgency,
      severity: a.severity,
      certainty: a.certainty,
      headline: a.headline,
      description: a.description,
      instruction: a.instruction,
      targetAreaDesc: a.targetAreaDesc,
      jurisdiction: a.jurisdiction?.name,
    }));
  }

  static async getAlertByIdentifier(identifier: string) {
    const alert = await AlertRepository.findByIdentifier(identifier);
    if (!alert) {
      throw new NotFoundError(`Alert '${identifier}'`);
    }
    return alert;
  }

  static async createAlert(input: CreateAlertInput) {
    const jurisdiction = await prisma.jurisdiction.findUnique({
      where: { code: input.jurisdictionCode },
    });

    if (!jurisdiction) {
      throw new NotFoundError(`Jurisdiction '${input.jurisdictionCode}'`);
    }

    const timestamp = new Date();
    const identifier =
      input.identifier ||
      `AERIS-CAP-${timestamp.getFullYear()}-${String(timestamp.getMonth() + 1).padStart(2, '0')}-${String(
        timestamp.getDate()
      ).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

    return AlertRepository.create({
      jurisdictionId: jurisdiction.id,
      weatherEventId: input.weatherEventId,
      identifier,
      sender: input.sender,
      status: input.status,
      msgType: input.msgType,
      category: input.category,
      eventTitle: input.eventTitle,
      urgency: input.urgency,
      severity: input.severity,
      certainty: input.certainty,
      headline: input.headline,
      description: input.description,
      instruction: input.instruction,
      targetAreaDesc: input.targetAreaDesc,
    });
  }

  static async generateCapXml(jurisdictionCode = 'mumbai_mmr') {
    const alerts = await AlertRepository.getActiveAlerts(jurisdictionCode, 1);
    const alert = alerts[0];

    if (!alert) {
      // Return empty CAP XML envelope
      const doc = create({ version: '1.0', encoding: 'UTF-8' })
        .ele('alert', { xmlns: 'urn:oasis:names:tc:emergency:cap:1.2' })
        .ele('identifier').txt(`AERIS-EMPTY-${Date.now()}`).up()
        .ele('sender').txt('sdma.officer@maharashtra.gov.in').up()
        .ele('sent').txt(new Date().toISOString()).up()
        .ele('status').txt('Actual').up()
        .ele('msgType').txt('Alert').up()
        .ele('scope').txt('Public').up()
        .ele('info')
          .ele('category').txt('Met').up()
          .ele('event').txt('No Active Severe Weather Warning').up()
          .ele('urgency').txt('Past').up()
          .ele('severity').txt('Minor').up()
          .ele('certainty').txt('Observed').up()
          .ele('headline').txt('All weather parameters within normal baseline').up()
          .ele('description').txt('No active alerts at this time.').up()
        .up();
      return doc.end({ prettyPrint: true });
    }

    const sentAtStr = alert.sentAt instanceof Date ? alert.sentAt.toISOString() : new Date(alert.sentAt).toISOString();

    const doc = create({ version: '1.0', encoding: 'UTF-8' })
      .ele('alert', { xmlns: 'urn:oasis:names:tc:emergency:cap:1.2' })
      .ele('identifier').txt(alert.identifier).up()
      .ele('sender').txt(alert.sender).up()
      .ele('sent').txt(sentAtStr).up()
      .ele('status').txt(alert.status).up()
      .ele('msgType').txt(alert.msgType).up()
      .ele('scope').txt('Public').up()
      .ele('info')
        .ele('category').txt(alert.category).up()
        .ele('event').txt(alert.eventTitle).up()
        .ele('urgency').txt(alert.urgency).up()
        .ele('severity').txt(alert.severity).up()
        .ele('certainty').txt(alert.certainty).up()
        .ele('headline').txt(alert.headline).up()
        .ele('description').txt(alert.description).up()
        .ele('instruction').txt(alert.instruction || 'Avoid low-lying subways under LBS Marg and CST Bridge. Follow municipal traffic diversions.').up()
        .ele('area')
          .ele('areaDesc').txt(alert.targetAreaDesc || 'Kurla, Sion, BKC, Ghatkopar, Chembur').up()
          .ele('polygon').txt('19.0600,72.8650 19.0850,72.8700 19.0800,72.8950 19.0550,72.8800 19.0600,72.8650').up()
        .up()
      .up();

    return doc.end({ prettyPrint: true });
  }

  private static getTimeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  }
}
