import { Request, Response, NextFunction } from 'express';
import { AlertService } from '../services/alert.service.js';

export class AlertController {
  static async getAlerts(req: Request, res: Response, next: NextFunction) {
    try {
      const jurisdiction = (req.query.jurisdiction as string) || 'mumbai_mmr';
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const alerts = await AlertService.getActiveAlerts(jurisdiction, limit);
      res.status(200).json({ success: true, data: alerts });
    } catch (error) {
      next(error);
    }
  }

  static async getAlertByIdentifier(req: Request, res: Response, next: NextFunction) {
    try {
      const identifier = req.params.identifier as string;
      const alert = await AlertService.getAlertByIdentifier(identifier);
      res.status(200).json({ success: true, data: alert });
    } catch (error) {
      next(error);
    }
  }

  static async createAlert(req: Request, res: Response, next: NextFunction) {
    try {
      const alert = await AlertService.createAlert(req.body);
      res.status(201).json({ success: true, data: alert });
    } catch (error) {
      next(error);
    }
  }

  static async getCapXml(req: Request, res: Response, next: NextFunction) {
    try {
      const jurisdiction = (req.query.jurisdiction as string) || 'mumbai_mmr';
      const xml = await AlertService.generateCapXml(jurisdiction);
      res.setHeader('Content-Type', 'application/xml');
      res.status(200).send(xml);
    } catch (error) {
      next(error);
    }
  }
}
