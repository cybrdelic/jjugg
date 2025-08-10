import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';

export type EventPayload = {
    type: string;
    data: any;
};

export class EventBus {
    private wss: WebSocketServer;
    private recent: Array<{ type: string; data: any; ts: number }> = [];
    private maxRecent = 200;

    constructor(server: Server) {
        this.wss = new WebSocketServer({ server, path: '/ws' });
        this.wss.on('connection', (ws: WebSocket) => {
            ws.send(JSON.stringify({ type: 'events/connected', data: { ts: Date.now() } }));
        });
    }

    emit(type: string, data: any) {
        const msgObj = { type, data };
        const msg = JSON.stringify(msgObj);
        this.recent.unshift({ type, data, ts: Date.now() });
        if (this.recent.length > this.maxRecent) this.recent.length = this.maxRecent;
        for (const client of this.wss.clients) {
            const c = client as WebSocket;
            if (c.readyState === WebSocket.OPEN) {
                c.send(msg);
            }
        }
    }

    getRecent(limit = 50) {
        return this.recent.slice(0, limit);
    }

    clientCount() {
        return this.wss.clients.size;
    }
}
