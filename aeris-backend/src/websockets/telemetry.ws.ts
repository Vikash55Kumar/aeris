import { WebSocket } from 'ws';
import { logger } from '../core/logger.js';
import { WeatherRepository } from '../repositories/weather.repository.js';

export class TelemetryWebSocketHandler {
  private static clients: Set<WebSocket> = new Set();
  private static intervalId: NodeJS.Timeout | null = null;

  static register(ws: WebSocket) {
    this.clients.add(ws);
    logger.info(`WebSocket: Telemetry client connected (Total: ${this.clients.size})`);

    ws.on('close', () => {
      this.clients.delete(ws);
      logger.info(`WebSocket: Telemetry client disconnected (Remaining: ${this.clients.size})`);
      if (this.clients.size === 0 && this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    });

    if (!this.intervalId) {
      this.startBroadcast();
    }
  }

  private static startBroadcast() {
    this.intervalId = setInterval(async () => {
      try {
        const latest = await WeatherRepository.getLatestTelemetry('mumbai_mmr');
        const payload = JSON.stringify({
          type: 'TELEMETRY_UPDATE',
          timestamp: new Date().toISOString(),
          data: {
            cloudTopTempCelsius: latest?.cloudTopTempCelsius ?? -72.4,
            radarReflectivityDbz: latest?.radarReflectivityDbz ?? 52.0,
            lightningFlashesPerMin: latest?.lightningFlashesPerMin ?? 36,
            precipitableWaterMm: latest?.precipitableWaterMm ?? 68.2,
            capeJkg: latest?.capeJkg ?? 2850,
            surfacePrecipRateMmHr: latest?.surfacePrecipRateMmHr ?? 92.0,
          },
        });

        for (const client of this.clients) {
          if (client.readyState === WebSocket.OPEN) {
            client.send(payload);
          }
        }
      } catch (e) {
        // Continue silently on error
      }
    }, 5000);
  }
}
