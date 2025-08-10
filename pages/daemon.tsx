import React, { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Activity, Wifi, WifiOff, Bug, Server, Database, Clock, FileText, Mail, RefreshCw, TrendingUp, Link as LinkIcon } from 'lucide-react';

export default function DaemonPage() {
    const [health, setHealth] = useState<{ ok: boolean } | null>(null);
    const [info, setInfo] = useState<any>(null);
    const [wsConnected, setWsConnected] = useState(false);
    const [events, setEvents] = useState<Array<{ type: string; data: any; ts: number }>>([]);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);

    const ORIGIN = 'http://127.0.0.1:7766';

    const load = async () => {
        try {
            const [h, i, e] = await Promise.all([
                fetch(`${ORIGIN}/health`).then(r => r.json()).catch(() => ({ ok: false })),
                fetch(`${ORIGIN}/daemon/info`).then(r => r.json()).catch(() => null),
                fetch(`${ORIGIN}/daemon/events?limit=50`).then(r => r.json()).catch(() => ({ events: [] }))
            ]);
            setHealth(h);
            setInfo(i);
            setEvents(e?.events || []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        const ws = new WebSocket('ws://127.0.0.1:7766/ws');
        ws.onopen = () => setWsConnected(true);
        ws.onclose = () => setWsConnected(false);
        ws.onerror = () => setWsConnected(false);
        ws.onmessage = (ev) => {
            try {
                const msg = JSON.parse(ev.data);
                setEvents(prev => [{ type: msg.type, data: msg.data, ts: Date.now() }, ...prev].slice(0, 200));
            } catch { }
        };
        return () => ws.close();
    }, []);

    const quickActions = [
        { label: 'Ping /health', icon: RefreshCw, onClick: () => load() },
        { label: 'Re-run pipeline', icon: Activity, onClick: async () => { setBusy(true); try { await fetch(`${ORIGIN}/pipeline/rerun`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ entity: 'application', id: 'daemon-ui', steps: ['normalize'] }) }); } finally { setBusy(false); } } },
        { label: 'Load apps summary', icon: TrendingUp, onClick: async () => { const j = await fetch(`${ORIGIN}/apps?limit=3`).then(r => r.json()); setEvents(prev => [{ type: 'debug.apps.summary', data: { total: j.total, rows: j.rows }, ts: Date.now() }, ...prev].slice(0, 200)); } },
    ];

    return (
        <AppLayout currentSection="profile-artifacts-section">
            <div className="daemon-page">
                <header className="header">
                    <div>
                        <h1 className="text-h1">Daemon</h1>
                        <p className="lead">Local Node/TS service for ingest, normalize, link, store, and notify.</p>
                    </div>
                    <div className="status">
                        <span className={`pill ${health?.ok ? 'ok' : 'err'}`}>{health?.ok ? 'Healthy' : 'Down'}</span>
                        <span className="pill ws">{wsConnected ? (<><Wifi size={14} /> WS Connected</>) : (<><WifiOff size={14} /> WS Disconnected</>)}</span>
                    </div>
                </header>

                <section className="grid">
                    <div className="card big">
                        <div className="card-head"><Activity size={16} /> Live Events</div>
                        <div className="log" role="log" aria-live="polite">
                            {events.length === 0 && <div className="muted">No events yet.</div>}
                            {events.map((e, i) => (
                                <div key={i} className="row">
                                    <div className="row-head">
                                        <span className="etype">{e.type}</span>
                                        <span className="time">{new Date(e.ts).toLocaleTimeString()}</span>
                                    </div>
                                    <pre>{JSON.stringify(e.data ?? null, null, 2)}</pre>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-head"><Server size={16} /> Service Info</div>
                        <ul className="list">
                            <li><strong>HTTP:</strong> {ORIGIN}</li>
                            <li><strong>WS:</strong> ws://127.0.0.1:7766/ws</li>
                            <li><strong>DB Path:</strong> {info?.dbPath || '—'}</li>
                            <li><strong>WS Clients:</strong> {info?.wsClients ?? 0}</li>
                            <li><strong>Now:</strong> {info?.now ? new Date(info.now).toLocaleString() : '—'}</li>
                        </ul>
                    </div>

                    <div className="card">
                        <div className="card-head"><Database size={16} /> Counts</div>
                        <ul className="list">
                            <li>Applications: <strong>{info?.counts?.apps ?? 0}</strong></li>
                            <li>Postings: <strong>{info?.counts?.postings ?? 0}</strong></li>
                            <li>Emails: <strong>{info?.counts?.emails ?? 0}</strong></li>
                            <li>Interviews: <strong>{info?.counts?.interviews ?? 0}</strong></li>
                            <li>Drafts: <strong>{info?.counts?.drafts ?? 0}</strong></li>
                            <li>Audits: <strong>{info?.counts?.audits ?? 0}</strong></li>
                        </ul>
                    </div>

                    <div className="card">
                        <div className="card-head"><FileText size={16} /> Quick Actions</div>
                        <div className="actions">
                            {quickActions.map((a, i) => (
                                <button key={i} className="btn" onClick={a.onClick} disabled={busy && a.label.includes('Re-run')}>
                                    <a.icon size={14} /> {a.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-head"><Mail size={16} /> Ingest Endpoints</div>
                        <ul className="list">
                            <li>POST /ingest/form</li>
                            <li>POST /ingest/draft</li>
                            <li>POST /ingest/posting</li>
                            <li>GET /apps, GET /apps/:id</li>
                            <li>POST /apps/:id/status</li>
                            <li>POST /emails/link</li>
                        </ul>
                    </div>

                    <div className="card">
                        <div className="card-head"><LinkIcon size={16} /> Links</div>
                        <ul className="list">
                            <li><a href={`${ORIGIN}/health`} target="_blank" rel="noreferrer">/health</a></li>
                            <li><a href={`${ORIGIN}/daemon/info`} target="_blank" rel="noreferrer">/daemon/info</a></li>
                            <li><a href={`${ORIGIN}/daemon/events`} target="_blank" rel="noreferrer">/daemon/events</a></li>
                        </ul>
                    </div>
                </section>

                <style jsx>{`
          .daemon-page { display: flex; flex-direction: column; gap: 16px; }
          .header { display: flex; align-items: center; justify-content: space-between; }
          .status { display: inline-flex; gap: 8px; }
          .pill { padding: 6px 10px; border-radius: 999px; border: 1px solid var(--border-thin); background: var(--glass-card-bg); font-weight: 600; }
          .pill.ok { color: var(--accent-green); border-color: rgba(var(--accent-green-rgb), .35); background: rgba(var(--accent-green-rgb), .12); }
          .pill.err { color: var(--accent-red); border-color: rgba(var(--accent-red-rgb), .35); background: rgba(var(--accent-red-rgb), .12); }
          .pill.ws { display: inline-flex; align-items: center; gap: 6px; }

          .grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 12px; }
          .card { background: var(--glass-card-bg); border: 1px solid var(--border-thin); border-radius: var(--border-radius); padding: 12px; }
          .card.big { grid-column: span 3; }
          .card-head { display: inline-flex; align-items: center; gap: 8px; font-weight: 700; margin-bottom: 8px; }
          .log { max-height: 480px; overflow: auto; display: flex; flex-direction: column; gap: 8px; }
          .row { border: 1px solid var(--border-thin); border-radius: 8px; padding: 8px; background: var(--surface, #fff); }
          .row-head { display: flex; gap: 8px; justify-content: space-between; }
          .etype { font-size: 12px; color: var(--text-secondary); font-weight: 700; }
          .time { font-size: 11px; color: var(--text-tertiary); }
          .list { margin: 0; padding-left: 16px; color: var(--text-secondary); }
          .actions { display: flex; flex-wrap: wrap; gap: 8px; }
          .btn { padding: 8px 10px; border-radius: 8px; border: 1px solid var(--border-thin); background: var(--glass-card-bg); cursor: pointer; }
          @media (max-width: 1100px) { .grid { grid-template-columns: 1fr 1fr; } .card.big { grid-column: span 2; } }
          @media (max-width: 800px) { .grid { grid-template-columns: 1fr; } .card.big { grid-column: span 1; } }
        `}</style>
            </div>
        </AppLayout>
    );
}
