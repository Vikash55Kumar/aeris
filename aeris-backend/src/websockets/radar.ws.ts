import { WebSocket } from 'ws';
import { logger } from '../core/logger.js';

export class RadarWebSocketHandler {
  private static clients: Set<WebSocket> = new Set();
  private static intervalId: NodeJS.Timeout | null = null;
  private static currentAngle = 0;

  static register(ws: WebSocket) {
    this.clients.add(ws);
    logger.info(`WebSocket: Radar client connected (Total: ${this.clients.size})`);

    // Send initial radar state
    ws.send(
      JSON.stringify({
        type: 'RADAR_INIT',
        timestamp: new Date().toISOString(),
        data: {
          radarStation: 'Mumbai Colaba S-Band (Santacruz)',
          peakReflectivityDbz: 56.8,
          coreCoords: [19.0728, 72.8797],
          rangeRingsKm: [30, 60, 90],
        },
      })
    );

    ws.on('close', () => {
      this.clients.delete(ws);
      logger.info(`WebSocket: Radar client disconnected (Remaining: ${this.clients.size})`);
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
    this.intervalId = setInterval(() => {
      this.currentAngle = (this.currentAngle + 15) % 360;
      const payload = JSON.stringify({
        type: 'RADAR_SWEEP_TICK',
        timestamp: new Date().toISOString(),
        data: {
          beamAngleDeg: this.currentAngle,
          coreDbz: 52 + Math.random() * 6,
          rainRateMmHr: 88 + Math.random() * 8,
        },
      });

      for (const client of this.clients) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(payload);
        }
      }
    }, 2000);
  }
}
