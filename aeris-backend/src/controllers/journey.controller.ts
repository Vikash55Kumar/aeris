import { Request, Response, NextFunction } from 'express';
import { JourneyService } from '../services/journey.service.js';

export class JourneyController {
  static async getLocations(req: Request, res: Response, next: NextFunction) {
    try {
      const locations = JourneyService.getLocations();
      res.status(200).json({ success: true, data: locations });
    } catch (error) {
      next(error);
    }
  }

  static async getPresets(req: Request, res: Response, next: NextFunction) {
    try {
      const presets = await JourneyService.getPresets();
      res.status(200).json({ success: true, data: presets });
    } catch (error) {
      next(error);
    }
  }

  static async planJourney(req: Request, res: Response, next: NextFunction) {
    try {
      const result = JourneyService.planJourney(req.body);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async optimizeDeparture(req: Request, res: Response, next: NextFunction) {
    try {
      const result = JourneyService.optimizeDeparture(req.body);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
