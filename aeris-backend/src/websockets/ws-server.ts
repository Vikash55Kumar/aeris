import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { parse } from 'url';
import { logger } from '../core/logger.js';
import { RadarWebSocketHandler } from './radar.ws.js';
import { TelemetryWebSocketHandler } from './telemetry.ws.js';
import { AlertsWebSocketHandler } from './alerts.ws.js';

export class AerisWebSocketServer {
  private wss: WebSocketServer;

  constructor(server: HttpServer) {
    this.wss = new WebSocketServer({ noServer: true });

    server.on('upgrade', (request, socket, head) => {
      const { pathname } = parse(request.url || '');

      if (
        pathname === '/ws/radar' ||
        pathname === '/ws/telemetry' ||
        pathname === '/ws/alerts' ||
        pathname === '/ws'
      ) {
        this.wss.handleUpgrade(request, socket, head, (ws) => {
          this.wss.emit('connection', ws, request);
        });
      } else {
        socket.destroy();
      }
    });

    this.wss.on('connection', (ws: WebSocket, request) => {
      const { pathname } = parse(request.url || '');

      if (pathname === '/ws/radar') {
        RadarWebSocketHandler.register(ws);
      } else if (pathname === '/ws/telemetry') {
        TelemetryWebSocketHandler.register(ws);
      } else if (pathname === '/ws/alerts') {
        AlertsWebSocketHandler.register(ws);
      } else {
        // Master all-in-one WebSocket connection
        RadarWebSocketHandler.register(ws);
        TelemetryWebSocketHandler.register(ws);
        AlertsWebSocketHandler.register(ws);
      }
    });

    logger.info('WebSocket Server initialized on routes: /ws/radar, /ws/telemetry, /ws/alerts, /ws');
  }
}
