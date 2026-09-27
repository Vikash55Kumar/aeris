import { IngestionService } from '../services/ingestion.service.js';
import { logger } from '../core/logger.js';
import { config } from '../core/config.js';

export class IngestionJob {
  private static intervalId: NodeJS.Timeout | null = null;

  static start() {
    if (this.intervalId) return;

    logger.info(`Starting background Ingestion Job (Interval: ${config.simulationTickIntervalMs}ms)`);
    this.intervalId = setInterval(async () => {
      try {
        await IngestionService.ingestMultiSensorSnapshot(config.defaultJurisdictionCode);
      } catch (error) {
        logger.error('Error during scheduled ingestion ticker:', error);
      }
    }, config.simulationTickIntervalMs);
  }

  static stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      logger.info('Stopped background Ingestion Job');
    }
  }
}
