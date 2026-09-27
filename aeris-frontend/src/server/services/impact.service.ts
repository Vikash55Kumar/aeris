import { MOCK_HYDROLOGY } from '@/lib/data/mock/hydrology';

export class ImpactService {
  static async getHydrologicalImpact() {
    return MOCK_HYDROLOGY;
  }
}
