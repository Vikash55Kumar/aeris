import { Request, Response, NextFunction } from 'express';
import { WeatherService } from '../services/weather.service.js';

export class WeatherController {
  static async getOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const jurisdiction = (req.query.jurisdiction as string) || 'mumbai_mmr';
      const offsetHours = req.query.offsetHours ? parseInt(req.query.offsetHours as string, 10) : 0;
      const result = await WeatherService.getWeatherIntelligenceOverview(jurisdiction, offsetHours);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getDetailedAnalysis(req: Request, res: Response, next: NextFunction) {
    try {
      const category = (req.query.category as any) || 'telemetry';
      const result = await WeatherService.getDetailedAnalysis(category);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
