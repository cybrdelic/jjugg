import express, { Request, Response } from 'express';
import http from 'http';
import cors from 'cors';
import crypto from 'crypto';
import { db, runMigrations, dbPath } from './db.js';
import { IngestEnvelope, StatusUpdate, LinkEmail, RerunPipeline } from './schemas.js';
import { EventBus } from './ws.js';
import { ensureId, normalizeCompany, normalizeLocation, extractCompensation, stableHash, nowIso } from './util.js';

const PORT = 7766;

runMigrations();

const app = express();
app.use(cors({ origin: [/^http:\/\/localhost:\d+$/, /^http:\/\/127\.0\.0\.1:\d+$/] }));
app.use(express.json({ limit: '2mb' }));

const server = http.createServer(app);
const bus = new EventBus(server);

function insertAudit(entity: string, entity_id: string, action: string, before: any, after: any) {
    db.prepare(`INSERT INTO audit_logs_mvp (id, entity, entity_id, action, before_json, after_json, ts)
              VALUES (?, ?, ?, ?, ?, ?, ?)`)
        .run(ensureId(), entity, entity_id, action, JSON.stringify(before ?? null), JSON.stringify(after ?? null), nowIso());
}

// Health
app.get('/health', (_req: Request, res: Response) => res.json({ ok: true }));

// Diagnostics
app.get('/daemon/info', (_req: Request, res: Response) => {
    try {
        const counts = db.prepare(`
      SELECT
        (SELECT COUNT(*) FROM applications_mvp) as apps,
        (SELECT COUNT(*) FROM job_postings) as postings,
        (SELECT COUNT(*) FROM emails_mvp) as emails,
        (SELECT COUNT(*) FROM interview_events_mvp) as interviews,
        (SELECT COUNT(*) FROM draft_forms_mvp) as drafts,
        (SELECT COUNT(*) FROM audit_logs_mvp) as audits
    `).get() as any;
        res.json({
            ok: true,
            dbPath,
            wsClients: bus.clientCount(),
            counts,
            now: Date.now()
        });
    } catch (e: any) {
        res.status(500).json({ ok: false, error: String(e?.message || e) });
    }
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

app.post('/ingest/draft', (req: Request, res: Response) => {
    const parse = IngestEnvelope.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
    const env = parse.data;
    const id = ensureId();
    db.prepare(`INSERT INTO draft_forms_mvp (id, scope_key, fields_json, last_seen_url, updated_at)
              VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`)
        .run(id, env.scope, JSON.stringify(env.fields ?? {}), env.url);
    bus.emit('events/draft.updated', { id, scope: env.scope });
    res.json({ ok: true });
});

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
app.get('/apps', (req: Request, res: Response) => {
    const q = String(req.query.q ?? '');
    const status = String(req.query.status ?? '');
    const limit = Number(req.query.limit ?? 50);
    const offset = Number(req.query.offset ?? 0);
    const where: string[] = [];
    const params: any[] = [];
    if (q) { where.push('(title LIKE ? OR location LIKE ? OR source_url LIKE ?)'); params.push(`%${q}%`, `%${q}%`, `%${q}%`); }
    if (status) { where.push('status = ?'); params.push(status); }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const rows = db.prepare(`SELECT * FROM applications_mvp ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`).all(...params, limit, offset);
    const total = db.prepare(`SELECT COUNT(*) as c FROM applications_mvp ${whereSql}`).get(...params) as any;
    res.json({ rows, total: total.c });
});

app.get('/apps/:id', (req: Request, res: Response) => {
    const appRow = db.prepare('SELECT * FROM applications_mvp WHERE id = ?').get(req.params.id);
    if (!appRow) return res.status(404).json({ error: 'not found' });
    const emails = db.prepare('SELECT * FROM emails_mvp WHERE inferred_application_id = ?').all(req.params.id);
    const interviews = db.prepare('SELECT * FROM interview_events_mvp WHERE application_id = ?').all(req.params.id);
    res.json({ application: appRow, emails, interviews });
});

app.post('/apps/:id/status', (req: Request, res: Response) => {
    const parsed = StatusUpdate.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const appId = req.params.id;
    const before = db.prepare('SELECT * FROM applications_mvp WHERE id = ?').get(appId);
    db.prepare('UPDATE applications_mvp SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(parsed.data.status, appId);
    const after = db.prepare('SELECT * FROM applications_mvp WHERE id = ?').get(appId);
    insertAudit('application', appId, 'status_changed', before, after);
    bus.emit('events/stage.changed', { id: appId, status: parsed.data.status });
    res.json({ ok: true });
});

app.post('/emails/link', (req: Request, res: Response) => {
    const parsed = LinkEmail.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    db.prepare('UPDATE emails_mvp SET inferred_application_id = ? WHERE id = ?').run(parsed.data.application_id, parsed.data.email_id);
    bus.emit('events/email.linked', { email_id: parsed.data.email_id, application_id: parsed.data.application_id });
    res.json({ ok: true });
});

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
