import { AlertRepository } from '../repositories/alert.repository';

export class AlertService {
  static async getAlerts() {
    return AlertRepository.getActiveAlerts();
  }
}
