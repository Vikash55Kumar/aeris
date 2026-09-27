import { MOCK_ALERTS } from '@/lib/data/mock/alerts';

export class AlertRepository {
  static async getActiveAlerts() {
    return MOCK_ALERTS;
  }
}
