import { WebSocket } from 'ws';
import { logger } from '../core/logger.js';

export class AlertsWebSocketHandler {
  private static clients: Set<WebSocket> = new Set();

  static register(ws: WebSocket) {
    this.clients.add(ws);
    logger.info(`WebSocket: Alerts subscriber connected (Total: ${this.clients.size})`);

    ws.on('close', () => {
      this.clients.delete(ws);
      logger.info(`WebSocket: Alerts subscriber disconnected (Remaining: ${this.clients.size})`);
    });
  }

  static broadcastNewAlert(alert: any) {
    const payload = JSON.stringify({
      type: 'NEW_EMERGENCY_ALERT',
      timestamp: new Date().toISOString(),
      data: alert,
    });

    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    }
  }
}
