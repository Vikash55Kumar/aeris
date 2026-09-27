import { logger } from '../core/logger.js';
import { EventRepository } from '../repositories/event.repository.js';
import { EventStage } from '@prisma/client';

export class StormTrackerJob {
  private static intervalId: NodeJS.Timeout | null = null;

  static start() {
    if (this.intervalId) return;

    logger.info('Starting background Storm Tracker Job (Interval: 60000ms)');
    this.intervalId = setInterval(async () => {
      try {
        const activeEvents = await EventRepository.findActiveEvents('mumbai_mmr');
        for (const evt of activeEvents) {
          logger.debug(`Storm cell ${evt.code} tracked: Heading ${evt.trajectoryDir} @ ${evt.trajectorySpeedKmh} km/h`);
        }
      } catch (error) {
        logger.error('Error during storm tracker loop:', error);
      }
    }, 60000);
  }

  static stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      logger.info('Stopped background Storm Tracker Job');
    }
  }
}
