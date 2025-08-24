import cors from 'cors';
import express, { Request, Response } from 'express';
import http from 'http';
import { db, dbPath, runMigrations } from './db.js';
import { IngestEnvelope, RerunPipeline } from './schemas.js';
import { ensureId, normalizeCompany, normalizeLocation, stableHash } from './util.js';
import { EventBus } from './ws.js';

const PORT = 7766;

runMigrations();

const app = express();
app.use(cors({ origin: [/^http:\/\/localhost:\d+$/, /^http:\/\/127\.0\.0\.1:\d+$/] }));
app.use(express.json({ limit: '2mb' }));

const server = http.createServer(app);
const bus = new EventBus(server);

// MVP audit removed with *_mvp tables cleanup
function insertAudit() { /* no-op */ }

// Health
app.get('/health', (_req: Request, res: Response) => res.json({ ok: true }));

// Diagnostics
app.get('/daemon/info', (_req: Request, res: Response) => {
        const counts = db.prepare(`
            SELECT
                (SELECT COUNT(*) FROM job_postings) as postings
        `).get() as any;
        res.json({ ok: true, dbPath, wsClients: bus.clientCount(), counts, now: Date.now() });
});

app.get('/daemon/events', (req: Request, res: Response) => {
    const limit = Math.min(Number(req.query.limit ?? 50), 200);
    res.json({ ok: true, events: bus.getRecent(limit) });
});

// Ingest endpoints
app.post('/ingest/form', (req: Request, res: Response) => {
    const parse = IngestEnvelope.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
    const env = parse.data;
    const sourceHash = stableHash(JSON.stringify(env));
    // MVP: stash into job_postings if posting provided
    if (env.posting) {
        const id = ensureId();
        const company = normalizeCompany(env.posting.company);
        const location = normalizeLocation(env.posting.location);
        db.prepare(`INSERT OR IGNORE INTO job_postings (id, source_url, title, company_name_raw, location_raw, description_raw, raw_payload_json, hash, collected_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`)
            .run(id, env.url, env.posting.title ?? '', company, location, env.posting.desc_html ?? '', JSON.stringify(env.raw ?? {}), sourceHash);
    }
    // Queue task (MVP: inline process). Normalize to application row if looks like submission
    // For MVP, just ack
    res.status(202).json({ ingest_id: sourceHash });
});

// Draft ingest disabled (removed *_mvp tables)

app.post('/ingest/posting', (req: Request, res: Response) => {
    const parse = IngestEnvelope.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
    const env = parse.data;
    const id = ensureId();
    const company = normalizeCompany(env.posting?.company);
    const location = normalizeLocation(env.posting?.location);
    const hash = stableHash([env.url, env.posting?.title, company, location].join('|'));
    db.prepare(`INSERT OR IGNORE INTO job_postings (id, source_url, title, company_name_raw, location_raw, description_raw, raw_payload_json, hash, collected_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`)
        .run(id, env.url, env.posting?.title ?? '', company, location, env.posting?.desc_html ?? '', JSON.stringify(env.raw ?? {}), hash);
    bus.emit('events/posting.captured', { id, url: env.url });
    res.status(202).json({ id, hash });
});

// Applications API minimal
// Applications endpoints removed with *_mvp tables

// app.get('/apps/:id', ...) removed

// Status update endpoint removed

// Email link endpoint removed

app.post('/pipeline/rerun', (req: Request, res: Response) => {
    const parsed = RerunPipeline.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    // MVP: no-op, emit event
    bus.emit('events/pipeline.rerun', parsed.data);
    res.status(202).json({ ok: true });
});

server.listen(PORT, () => {
    console.log(`✅ JJUGG Daemon listening on http://127.0.0.1:${PORT}`);
});
