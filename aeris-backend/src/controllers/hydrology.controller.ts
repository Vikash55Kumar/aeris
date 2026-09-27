import { Request, Response, NextFunction } from 'express';
import { HydrologyService } from '../services/hydrology.service.js';

export class HydrologyController {
  static async getOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const jurisdiction = (req.query.jurisdiction as string) || 'mumbai_mmr';
      const result = await HydrologyService.getHydrologyOverview(jurisdiction);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async updateGauge(req: Request, res: Response, next: NextFunction) {
    try {
      const stationCode = req.params.stationCode as string;
      const result = await HydrologyService.updateGaugeReading(stationCode, req.body);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
