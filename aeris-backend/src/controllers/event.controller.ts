import { Request, Response, NextFunction } from 'express';
import { EventService } from '../services/event.service.js';

export class EventController {
  static async getOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const jurisdiction = (req.query.jurisdiction as string) || 'mumbai_mmr';
      const result = await EventService.getCommandCenterOverview(jurisdiction);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getActiveEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const jurisdiction = (req.query.jurisdiction as string) || 'mumbai_mmr';
      const events = await EventService.getActiveEvents(jurisdiction);
      res.status(200).json({ success: true, data: events });
    } catch (error) {
      next(error);
    }
  }

  static async getEventByCode(req: Request, res: Response, next: NextFunction) {
    try {
      const code = req.params.code as string;
      const event = await EventService.getEventByCode(code);
      res.status(200).json({ success: true, data: event });
    } catch (error) {
      next(error);
    }
  }

  static async createEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const event = await EventService.createEvent(req.body);
      res.status(201).json({ success: true, data: event });
    } catch (error) {
      next(error);
    }
  }
}
