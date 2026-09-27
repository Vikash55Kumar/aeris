import { ForecastRepository } from '../repositories/forecast.repository';

export class ForecastService {
  static async getForecasts() {
    const hazards = await ForecastRepository.getHazardSummary();
    const timeline = await ForecastRepository.getTimelineSteps();
    return { hazards, timeline };
  }
}
