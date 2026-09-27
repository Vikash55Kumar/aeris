import { MOCK_ACTIVE_EVENT } from '@/lib/data/mock/events';
import { AerisEvent } from '@/types/event';

export class EventRepository {
  static async getActiveEvent(): Promise<AerisEvent> {
    return MOCK_ACTIVE_EVENT;
  }
}
