import { MOCK_HAZARD_SUMMARY, MOCK_TIMELINE_STEPS } from '@/lib/data/mock/forecasts';

export class ForecastRepository {
  static async getHazardSummary() {
    return MOCK_HAZARD_SUMMARY;
  }

  static async getTimelineSteps() {
    return MOCK_TIMELINE_STEPS;
  }
}
