import { MOCK_ATMOSPHERIC_OBSERVATIONS } from '@/lib/data/mock/atmospheric';

export class WeatherIntelligenceService {
  static getAtmosphericObservations() {
    return MOCK_ATMOSPHERIC_OBSERVATIONS;
  }
}
