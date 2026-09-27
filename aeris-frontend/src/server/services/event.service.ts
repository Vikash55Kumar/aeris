import { EventRepository } from '../repositories/event.repository';

export class EventService {
  static async getActiveEvent() {
    return EventRepository.getActiveEvent();
  }
}
