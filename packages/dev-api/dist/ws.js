import { WebSocketServer, WebSocket } from 'ws';
export class EventBus {
    constructor(server) {
        this.recent = [];
        this.maxRecent = 200;
        this.wss = new WebSocketServer({ server, path: '/ws' });
        this.wss.on('connection', (ws) => {
            ws.send(JSON.stringify({ type: 'events/connected', data: { ts: Date.now() } }));
        });
    }
    emit(type, data) {
        const msgObj = { type, data };
        const msg = JSON.stringify(msgObj);
        this.recent.unshift({ type, data, ts: Date.now() });
        if (this.recent.length > this.maxRecent)
            this.recent.length = this.maxRecent;
        for (const client of this.wss.clients) {
            const c = client;
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
