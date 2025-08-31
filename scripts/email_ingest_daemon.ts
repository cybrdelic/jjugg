import sqlite3 from 'better-sqlite3';
import dotenv from 'dotenv';
import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import OpenAI from 'openai';
import { DB_PATH as SHARED_DB_PATH } from '../lib/dbPath';

dotenv.config();

// Use shared DB path util so API & daemon align exactly
const DB_PATH = SHARED_DB_PATH;
// Add a busy timeout so transient write locks don't make all logEvent inserts fail silently.
const db = sqlite3(DB_PATH, { timeout: 5000 });

// Hydrate IMAP-related env vars from database email_config table when not supplied via process env.
// This allows UI-stored credentials to drive the daemon without exporting secrets to the shell.
try {
  const row: any = db.prepare('SELECT host, port, secure, user, password, mailbox FROM email_config ORDER BY updated_at DESC LIMIT 1').get();
  if (row) {
    if (!process.env.IMAP_HOST && row.host) process.env.IMAP_HOST = row.host;
    if (!process.env.IMAP_PORT && row.port) process.env.IMAP_PORT = String(row.port || 993);
    if (!process.env.IMAP_SECURE && row.secure !== undefined) process.env.IMAP_SECURE = row.secure ? 'true' : 'false';
    if (!process.env.IMAP_USER && row.user) process.env.IMAP_USER = row.user;
    if (!process.env.IMAP_PASS && row.password) process.env.IMAP_PASS = row.password;
    if (!process.env.IMAP_MAILBOX && row.mailbox) process.env.IMAP_MAILBOX = row.mailbox;
    if (process.env.EMAIL_INGEST_CONSOLE_LOGS === 'true') {
      console.log('[ingest-config] hydrated from email_config table');
    }
  }
} catch { /* ignore hydration issues */ }

interface SyncState { mailbox: string; last_uid: number; }

const MAILBOX = process.env.IMAP_MAILBOX || 'INBOX';
const BATCH_LIMIT = Number(process.env.IMAP_BATCH_LIMIT || 50);
const MAX_INITIAL_SYNC = Number(process.env.IMAP_MAX_INITIAL_SYNC || BATCH_LIMIT);
const OPENAI_MODEL = process.env.OPENAI_EMAIL_MODEL || 'gpt-4o-mini';
// DTH (Debug Threshold): maximum number of verbose IMAP debug events to persist per run
const IMAP_DEBUG_MAX = Number(process.env.DTH || process.env.EMAIL_IMAP_DEBUG_MAX || 250);
// Backfill slice batch size (header-only historic crawl descending by UID)
const BACKFILL_BATCH = Number(process.env.EMAIL_BACKFILL_BATCH || 200);

const IMAP_CONFIG = {
  host: process.env.IMAP_HOST || '',
  port: Number(process.env.IMAP_PORT || 993),
  secure: process.env.IMAP_SECURE !== 'false',
  auth: { user: process.env.IMAP_USER || '', pass: process.env.IMAP_PASS || '' }
} as const;

const VERBOSE_IMAP = process.env.EMAIL_IMAP_VERBOSE === 'true';
let imapDebugEventCounter = 0;

function validateEnv(): void {
  const missing: string[] = [];
  if (!IMAP_CONFIG.host) missing.push('IMAP_HOST');
  if (!IMAP_CONFIG.auth.user) missing.push('IMAP_USER');
  if (!IMAP_CONFIG.auth.pass) missing.push('IMAP_PASS');
  if (missing.length) {
    const msg = '[daemon] Missing required IMAP env vars: ' + missing.join(', ');
    // If executing as standalone script, exit; otherwise throw so API caller can handle gracefully
    if (require.main === module) {
      console.error(msg);
      process.exit(1);
    } else {
      throw new Error(msg);
    }
  }
  if (!process.env.OPENAI_API_KEY) {
    console.warn('[daemon] OPENAI_API_KEY not set – parsing enrichment will be skipped.');
  }
}

function ensureSchema() {
  // Create minimal tables if migrations not yet applied so daemon still runs
  db.prepare(`CREATE TABLE IF NOT EXISTS email_sync_state (
    mailbox TEXT PRIMARY KEY,
    last_uid INTEGER DEFAULT 0,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`).run();
  db.prepare(`CREATE TABLE IF NOT EXISTS ingestion_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    phase TEXT,
    status TEXT,
    uid INTEGER,
    message_id TEXT,
    subject TEXT,
    class TEXT,
    vendor TEXT,
    detail TEXT
  )`).run();
  db.prepare(`CREATE TABLE IF NOT EXISTS openai_call_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email_id INTEGER,
    model TEXT,
    prompt_tokens INTEGER,
    completion_tokens INTEGER,
    total_tokens INTEGER,
    cost_usd REAL,
    request_json TEXT,
    response_json TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`).run();
  // Baseline emails table columns (subset) if not present
  db.prepare(`CREATE TABLE IF NOT EXISTS emails (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message_id TEXT UNIQUE,
    date TEXT,
    subject TEXT,
    from_email TEXT,
    to_email TEXT,
    vendor TEXT,
    class TEXT,
    body TEXT,
    raw_headers TEXT,
    raw_html TEXT,
    parsed_json TEXT,
    parse_status TEXT,
    parsed_at TEXT,
    openai_model TEXT,
    uid INTEGER,
    mailbox TEXT,
    created_at TEXT,
    updated_at TEXT
  )`).run();
  // Ensure newer columns exist on legacy installations
  const required: Record<string,string> = {
    raw_headers: "ALTER TABLE emails ADD COLUMN raw_headers TEXT",
    raw_html: "ALTER TABLE emails ADD COLUMN raw_html TEXT",
    parsed_json: "ALTER TABLE emails ADD COLUMN parsed_json TEXT",
    parse_status: "ALTER TABLE emails ADD COLUMN parse_status TEXT DEFAULT 'pending'",
    parsed_at: "ALTER TABLE emails ADD COLUMN parsed_at TEXT",
    openai_model: "ALTER TABLE emails ADD COLUMN openai_model TEXT",
    uid: "ALTER TABLE emails ADD COLUMN uid INTEGER",
    mailbox: "ALTER TABLE emails ADD COLUMN mailbox TEXT",
    created_at: "ALTER TABLE emails ADD COLUMN created_at TEXT",
  updated_at: "ALTER TABLE emails ADD COLUMN updated_at TEXT",
  classification_confidence: "ALTER TABLE emails ADD COLUMN classification_confidence REAL",
  classification_reason: "ALTER TABLE emails ADD COLUMN classification_reason TEXT",
  openai_prompt_tokens: "ALTER TABLE emails ADD COLUMN openai_prompt_tokens INTEGER",
  openai_completion_tokens: "ALTER TABLE emails ADD COLUMN openai_completion_tokens INTEGER",
  openai_total_tokens: "ALTER TABLE emails ADD COLUMN openai_total_tokens INTEGER",
  openai_cost_usd: "ALTER TABLE emails ADD COLUMN openai_cost_usd REAL"
  };
  try {
    const cols = db.prepare("PRAGMA table_info(emails)").all() as { name: string }[];
    const existing = new Set(cols.map(c => c.name));
    for (const col of Object.keys(required)) {
      if (!existing.has(col)) {
        try { db.prepare(required[col]).run(); } catch { /* ignore */ }
      }
    }
  } catch { /* ignore */ }
  db.prepare(`INSERT OR IGNORE INTO email_sync_state (mailbox, last_uid) VALUES (?, 0)`).run(MAILBOX);
  // Log once per run that schema ensure executed (helps diagnose missing tables)
  logEvent({ phase: 'schema', status: 'ensured', detail: `db=${DB_PATH}` });

  // Backfill tables (header-level historic classification)
  try {
    db.prepare(`CREATE TABLE IF NOT EXISTS email_backfill_state (
      mailbox TEXT PRIMARY KEY,
      highest_uid_seen INTEGER,
      lowest_uid_processed INTEGER,
      active INTEGER DEFAULT 0,
      started_at TEXT,
      updated_at TEXT,
      model_version TEXT
    )`).run();
    db.prepare(`CREATE TABLE IF NOT EXISTS email_header_cache (
      uid INTEGER PRIMARY KEY,
      subject TEXT,
      from_email TEXT,
      date TEXT,
      size INTEGER,
      decision TEXT,
      score REAL,
      reason TEXT,
      model_version TEXT,
      promoted INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`).run();
    db.prepare(`CREATE INDEX IF NOT EXISTS idx_header_cache_decision ON email_header_cache(decision)` ).run();
    db.prepare(`CREATE INDEX IF NOT EXISTS idx_header_cache_model ON email_header_cache(model_version)` ).run();
    // Seed backfill state row if missing
    const bs = db.prepare('SELECT mailbox FROM email_backfill_state WHERE mailbox=?').get(MAILBOX) as any;
    if(!bs){
      db.prepare('INSERT INTO email_backfill_state (mailbox, highest_uid_seen, lowest_uid_processed, active, started_at, updated_at, model_version) VALUES (?,?,?,?,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,?)')
        .run(MAILBOX, null, null, 0, 'v1');
    }
  } catch(e){
    console.error('[backfill][schema][error]', (e as Error).message);
  }
}

interface BackfillState { mailbox:string; highest_uid_seen:number|null; lowest_uid_processed:number|null; active:number; }

function getBackfillState(): BackfillState | null {
  try { return db.prepare('SELECT mailbox, highest_uid_seen, lowest_uid_processed, active FROM email_backfill_state WHERE mailbox=?').get(MAILBOX) as any || null; } catch { return null; }
}

function updateBackfillState(p: Partial<{ highest_uid_seen:number; lowest_uid_processed:number; active:number }>) {
  const sets:string[]=[]; const vals:any[]=[]; Object.entries(p).forEach(([k,v])=>{ sets.push(`${k}=?`); vals.push(v); }); if(!sets.length) return; vals.push(MAILBOX);
  db.prepare(`UPDATE email_backfill_state SET ${sets.join(', ')}, updated_at=CURRENT_TIMESTAMP WHERE mailbox=?`).run(...vals);
}

// Lightweight header-only classification for historic backfill.
// Returns decision: relevant | skip | ambiguous along with score + reason.
function classifyHeader(subjectRaw: string, fromRaw: string): { decision: string; score: number; reason: string } {
  const subject = (subjectRaw || '').toLowerCase();
  const text = subject; // (future: include from, date heuristics)
  if(!subject) return { decision: 'ambiguous', score: 0, reason: 'empty_subject' };
  const relevantRules: { re: RegExp; tag: string; weight: number }[] = [
    { re: /(thank you for applying|application (received|submitted))/i, tag: 'applied', weight: 4 },
    { re: /(interview|phone screen|technical screen|onsite interview|schedule (a )?time)/i, tag: 'interview', weight: 6 },
    { re: /(offer letter|we are (pleased|excited) to offer|compensation package)/i, tag: 'offer', weight: 8 },
    { re: /(regret to inform|not moving forward|unfortunately we (will|are) not|decided to pursue other)/i, tag: 'rejection', weight: 7 }
  ];
  const skipRules: { re: RegExp; tag: string; weight: number }[] = [
    { re: /(job alert|new jobs|new job:|job recommendations|\d+ new jobs|more matches|daily digest)/i, tag: 'digest', weight: 5 },
    { re: /(weekly roundup|newsletter)/i, tag: 'newsletter', weight: 3 }
  ];
  let relScore = 0; const relReasons: string[] = [];
  for(const r of relevantRules){ if(r.re.test(subjectRaw)){ relScore += r.weight; relReasons.push(r.tag); } }
  let skipScore = 0; const skipReasons: string[] = [];
  for(const r of skipRules){ if(r.re.test(subjectRaw)){ skipScore += r.weight; skipReasons.push(r.tag); } }
  if(relScore && relScore >= skipScore){
    return { decision: 'relevant', score: relScore, reason: 'relevant:' + relReasons.join(',') };
  }
  if(skipScore && skipScore > relScore){
    return { decision: 'skip', score: skipScore, reason: 'skip:' + skipReasons.join(',') };
  }
  return { decision: 'ambiguous', score: 0.5, reason: 'no_rule_match' };
}

// Execute a single backfill slice: fetch a descending window of headers, classify & store.
async function runBackfillSlice() {
  const st = getBackfillState();
  if(!st || !st.active) return; // inactive or missing
  try {
    // Initialize high-water mark if unknown
    if(st.highest_uid_seen == null){
      // Prefer live mailbox for authoritative highest UID
      let client: ImapFlow | null = null;
      try {
        client = await connectImap();
        const mbox: any = (client as any).mailbox || {};
        const uidNext: number | undefined = mbox.uidNext;
        const highest = uidNext && uidNext > 0 ? uidNext - 1 : 0;
        if(highest > 0){
          updateBackfillState({ highest_uid_seen: highest, lowest_uid_processed: highest });
          logEvent({ phase:'backfill', status:'init', detail:`highest=${highest}` });
        } else {
          logEvent({ phase:'backfill', status:'init_zero', detail:'no messages present' });
          updateBackfillState({ highest_uid_seen: 0, lowest_uid_processed: 0, active: 0 });
        }
      } catch(e){
        logEvent({ phase:'backfill', status:'error', detail:'init_connect_fail: '+(e as Error).message });
      } finally {
        if(client) await client.logout().catch(()=>{});
      }
      return; // initialization slice only
    }
    // Already fully processed down to UID 1?
    if(st.lowest_uid_processed != null && st.lowest_uid_processed <= 1){
      logEvent({ phase:'backfill', status:'complete', detail:'reached_uid_1' });
      updateBackfillState({ active: 0 });
      return;
    }
    const startUid = (st.lowest_uid_processed == null ? st.highest_uid_seen : st.lowest_uid_processed - 1) as number;
    if(startUid <= 0){
      logEvent({ phase:'backfill', status:'complete', detail:'startUid<=0' });
      updateBackfillState({ active: 0, lowest_uid_processed: 1 });
      return;
    }
    const endUid = startUid; // descending window end (highest of slice)
    const beginUid = Math.max(1, endUid - BACKFILL_BATCH + 1);
    logEvent({ phase:'backfill', status:'slice_start', detail:`range=${beginUid}-${endUid}` });
    let client: ImapFlow | null = null;
    try {
      client = await connectImap();
      const criteria = { uid: `${beginUid}:${endUid}` };
      // Fetch minimal envelope data only (headers not needed fully). ImapFlow fetches ascending; we'll classify individually.
      const fetched: any[] = [];
      for await (const msg of (client as any).fetch(criteria, { uid: true, envelope: true, size: true })) {
        fetched.push(msg);
      }
      // Process in descending UID order for consistency
      fetched.sort((a,b)=> b.uid - a.uid);
      const insertStmt = db.prepare(`INSERT OR IGNORE INTO email_header_cache (uid, subject, from_email, date, size, decision, score, reason, model_version)
        VALUES (@uid, @subject, @from_email, @date, @size, @decision, @score, @reason, @model_version)`);
      let inserted = 0;
      for(const m of fetched){
        const uid = m.uid as number;
        if(!uid) continue;
        // Skip if already cached
        const exists = db.prepare('SELECT 1 FROM email_header_cache WHERE uid=?').get(uid) as any;
        if(exists) continue;
        const env = m.envelope || {};
        const subject = env.subject || '';
        const fromAddr = Array.isArray(env.from) && env.from.length ? (env.from[0].address || env.from[0].name || '') : '';
        const date = env.date ? (env.date instanceof Date ? env.date.toISOString() : new Date(env.date).toISOString()) : null;
        const size = m.size || null;
        const cls = classifyHeader(subject, fromAddr);
        insertStmt.run({ uid, subject, from_email: fromAddr, date, size, decision: cls.decision, score: cls.score, reason: cls.reason, model_version: 'v1' });
        inserted++;
      }
      // Update progress (lowest_uid_processed = beginUid)
      updateBackfillState({ lowest_uid_processed: beginUid });
      logEvent({ phase:'backfill', status:'slice_end', detail:`range=${beginUid}-${endUid}; inserted=${inserted}` });
    } catch(e){
      logEvent({ phase:'backfill', status:'error', detail:(e as Error).message });
    } finally {
      if(client) await client.logout().catch(()=>{});
    }
  } catch(e){
    logEvent({ phase:'backfill', status:'error', detail:(e as Error).message });
  }
}

let __logEventErrorCount = 0;
function logEvent(entry: Partial<{ phase: string; status: string; uid: number; message_id: string; subject: string; class: string; vendor: string; detail: string }>) {
  try {
    const payload = {
      phase: null as any,
      status: null as any,
      uid: null as any,
      message_id: null as any,
      subject: null as any,
      class: null as any,
      vendor: null as any,
      detail: null as any,
      ...entry
    };
    db.prepare(`INSERT INTO ingestion_log (phase, status, uid, message_id, subject, class, vendor, detail) VALUES (@phase, @status, @uid, @message_id, @subject, @class, @vendor, @detail)`).run(payload);
    if (process.env.EMAIL_INGEST_CONSOLE_LOGS === 'true') {
      // Lightweight console mirror for diagnostics (can be noisy, gated by env var)
      console.log('[ingest-log]', payload.phase, payload.status, payload.uid || '', (payload.detail || '').slice(0, 140));
    }
  } catch (err) {
    // Surface first few errors so we can diagnose why table stays empty.
    if (__logEventErrorCount < 5) {
      __logEventErrorCount++;
      console.error('[ingest-log][error]', (err as Error).message);
    }
  }
}

function getSyncState(): SyncState {
  const row = db.prepare('SELECT mailbox, last_uid FROM email_sync_state WHERE mailbox = ?').get(MAILBOX) as SyncState | undefined;
  return row || { mailbox: MAILBOX, last_uid: 0 };
}

function updateSyncState(uid: number) {
  db.prepare('UPDATE email_sync_state SET last_uid = ?, updated_at = CURRENT_TIMESTAMP WHERE mailbox = ?').run(uid, MAILBOX);
}

async function connectImap() {
  logEvent({ phase: 'imap', status: 'connect_start', detail: `connecting ${IMAP_CONFIG.host}:${IMAP_CONFIG.port}` });
  // Attach custom logger to capture useful wire-level events when verbose enabled
  const client = new ImapFlow(VERBOSE_IMAP ? {
    ...IMAP_CONFIG,
    logger: {
      // level: debug/info/warn/error
      debug: (msg: string, meta?: any) => captureImapDebug('debug', msg, meta),
      info: (msg: string, meta?: any) => captureImapDebug('info', msg, meta),
      warn: (msg: string, meta?: any) => captureImapDebug('warn', msg, meta),
      error: (msg: string, meta?: any) => captureImapDebug('error', msg, meta)
    }
  } : IMAP_CONFIG);
  await client.connect();
  logEvent({ phase: 'imap', status: 'connected', detail: 'authenticated' });
  await client.mailboxOpen(MAILBOX);
  logEvent({ phase: 'imap', status: 'mailbox_open', detail: `opened ${MAILBOX}` });
  return client;
}

function captureImapDebug(level: string, msg: string, meta?: any) {
  if (!VERBOSE_IMAP) return;
  // Limit number of persisted events per run to avoid DB bloat
  if (imapDebugEventCounter >= IMAP_DEBUG_MAX) return;
  const m = (msg || '').toString();
  // In simplified mode: capture every line (still respecting cap). Keeping original filtered regex removed for clarity.
  imapDebugEventCounter++;
  try {
    logEvent({ phase: 'imap_dbg', status: level, detail: m.slice(0, 500) });
  } catch { /* ignore */ }
}

interface ClassificationResult { cls: string; confidence: number; reason: string; score: number; raw_scores: Record<string,number>; flags: string[]; }

const INCLUDE_ALERTS = process.env.EMAIL_INCLUDE_ALERTS === 'true';

function classifyEmail(subject: string, body: string): ClassificationResult {
  const text = (subject + '\n' + body).toLowerCase();
  const subjectLower = (subject || '').toLowerCase();
  const flags: string[] = [];
  // Detect date-only subjects (e.g., "August 22, 2025") which are almost never actionable application events
  if (/^([a-z]+ \d{1,2}, \d{4})$/.test(subjectLower.trim())) {
    return { cls: '', confidence: 0.2, reason: 'date_only_subject', score: 0, raw_scores: {}, flags: ['date_only'] };
  }
  // Quick pattern based early classification for bulk job alert digests
  const alertPatterns = [/\bnew jobs?\b/, /\bnew job:/, /\bnew match:/, /\bjob alert\b/, /\b\d+\+ new jobs\b/, /\bjobs on /, /\bmore matches\b/, /\bmatches - wellfound\b/];
  if (alertPatterns.some(r => r.test(subjectLower))) {
    flags.push('pattern:job_alert_subject');
  }
  // Digest vendor/domain hints
  if (/(wellfound|linkedin|indeed|welcometothejungle|simplyhired|glassdoor|ziprecruiter)/.test(text)) {
    flags.push('vendor:digest');
  }
  // Keyword groups with base weights
  const groups: { cls: string; keywords: string[]; excludes?: RegExp[]; weight: number; reason: string; minHits?: number }[] = [
    { cls: 'rejection', keywords: ['regret to inform', 'not moving forward', 'unfortunately', 'we have decided to pursue other'], weight: 6, reason: 'Rejection phrasing' },
    { cls: 'offer', keywords: ['offer letter', 'pleased to offer', 'we are excited to offer', 'compensation package', 'sign-on bonus'], weight: 6, reason: 'Offer phrasing' },
    { cls: 'interview', keywords: ['interview', 'phone screen', 'onsite interview', 'schedule time to talk', 'technical screen', 'coding exercise', 'take-home'], excludes: [/job alert/, /new jobs/], weight: 4, reason: 'Interview scheduling terms', minHits: 1 },
    { cls: 'applied', keywords: ['thank you for applying', 'application received', 'we received your application', 'we have received your application', 'application has been received'], weight: 3, reason: 'Application receipt' },
    { cls: 'job_alert', keywords: ['job alert', 'new jobs', 'new positions', 'job recommendations', 'we found new positions', 'new match:'], weight: 2, reason: 'Job alert phrasing' }
  ];
  const scores: Record<string, { score: number; reasons: Set<string>; hits: number; }> = {};
  for (const g of groups) {
    let hits = 0;
    for (const kw of g.keywords) if (text.includes(kw)) hits++;
    if (!hits) continue;
    if (g.minHits && hits < g.minHits) continue;
    if (g.excludes && g.excludes.some(ex => ex.test(text))) continue;
    const total = hits * g.weight;
    if (!scores[g.cls]) scores[g.cls] = { score: 0, reasons: new Set(), hits: 0 };
    scores[g.cls].score += total;
    scores[g.cls].reasons.add(g.reason + `(${hits})`);
    scores[g.cls].hits += hits;
  }
  // Force job_alert if strong patterns present and no stronger category
  if (flags.includes('pattern:job_alert_subject') && !scores['offer'] && !scores['rejection'] && !scores['interview'] && !scores['applied']) {
    scores['job_alert'] = scores['job_alert'] || { score: 2, reasons: new Set(['subject pattern']), hits: 1 };
  }
  if (!Object.keys(scores).length) return { cls: '', confidence: 0, reason: 'no rule matched', score: 0, raw_scores: {}, flags };
  const ranked = Object.entries(scores).sort((a,b)=>b[1].score - a[1].score);
  const top = ranked[0];
  const maxScore = top[1].score;
  const nextScore = ranked[1]?.[1].score || 0;
  // Confidence incorporates separation and absolute score (dampen single low hit high confidence issue)
  const sep = maxScore === 0 ? 0 : 1 - (nextScore / maxScore);
  const abs = Math.min(1, maxScore / 10); // assume 10 ~= strong evidence
  const confidence = Number(((sep * 0.6) + (abs * 0.4)).toFixed(2));
  const raw_scores: Record<string,number> = Object.fromEntries(ranked.map(r => [r[0], r[1].score]));
  let cls = top[0];
  let reason = Array.from(top[1].reasons).join('; ');
  // If looks like a digest alert (flags) but classified as interview without strong scheduling signals, downgrade to job_alert
  if (cls === 'interview' && (flags.includes('pattern:job_alert_subject') || flags.includes('vendor:digest'))) {
    const strongSchedule = /(schedule|confirm|availability|zoom|teams meeting|google meet|calendar invite)/.test(text);
    if (!strongSchedule) {
      cls = 'job_alert';
      reason += '; downgraded_to_job_alert_digest';
    }
  }
  return { cls, confidence, reason, score: maxScore, raw_scores, flags };
}

// Determine whether a classification should be persisted (job application lifecycle vs generic alerts)
function isRelevantClassification(cls: string, classification: ClassificationResult, subject: string, body: string): boolean {
  if (!cls) return false;
  if (cls === 'job_alert' && !INCLUDE_ALERTS) return false;
  // For interview require supporting context (company or role words)
  if (cls === 'interview') {
    const combined = (subject + '\n' + body).toLowerCase();
    const hasContext = /(engineer|developer|designer|product manager|data scientist|application|position|role|candidate)/.test(combined);
    if (!hasContext) return false;
  }
  return ['applied','interview','offer','rejection','job_alert'].includes(cls);
}

function upsertEmail(parsed: any, uid: number, raw: Buffer, mailbox: string) {
  const stmt = db.prepare(`INSERT INTO emails (message_id, date, subject, from_email, to_email, vendor, class, body, created_at, raw_headers, raw_html, parsed_json, parse_status, uid, mailbox)
    VALUES (@message_id, @date, @subject, @from_email, @to_email, @vendor, @class, @body, @created_at, @raw_headers, @raw_html, @parsed_json, @parse_status, @uid, @mailbox)
    ON CONFLICT(message_id) DO UPDATE SET date=excluded.date, subject=excluded.subject, from_email=excluded.from_email, to_email=excluded.to_email, vendor=excluded.vendor, class=excluded.class, body=excluded.body, updated_at=CURRENT_TIMESTAMP, raw_headers=excluded.raw_headers, raw_html=excluded.raw_html, parse_status=excluded.parse_status, uid=excluded.uid, mailbox=excluded.mailbox;`);

  const textBody = parsed.text || '';
  const htmlBody = parsed.html && typeof parsed.html === 'string' ? parsed.html : '';
  const joined = (parsed.subject || '') + ' ' + textBody;
  const lower = joined.toLowerCase();
  const classification = classifyEmail(parsed.subject || '', textBody);
  if (!isRelevantClassification(classification.cls, classification, parsed.subject || '', textBody)) {
    logEvent({ phase: 'fetch', status: 'skip_non_relevant', uid, subject: parsed.subject || '', detail: classification.reason || 'no reason' });
    return; // do not persist non-relevant email
  }
  const vendor = /greenhouse/.test(lower) ? 'greenhouse' : /lever/.test(lower) ? 'lever' : /workday/.test(lower) ? 'workday' : '';

  stmt.run({
    message_id: parsed.messageId,
    date: parsed.date ? parsed.date.toISOString() : new Date().toISOString(),
    subject: parsed.subject || '(no subject)',
    from_email: parsed.from?.text || '',
    to_email: parsed.to?.text || '',
    vendor,
    class: classification.cls,
    body: textBody,
    created_at: new Date().toISOString(),
  raw_headers: parsed.headerLines?.map((h: any) => `${h.key}: ${h.line}`)?.join('\n') || '',
    raw_html: htmlBody,
    parsed_json: null,
    parse_status: 'pending',
    uid,
    mailbox
  });
  // Update classification details if columns exist
  try {
    db.prepare('UPDATE emails SET classification_confidence = ?, classification_reason = ? WHERE message_id = ?')
      .run(classification.confidence, classification.reason, parsed.messageId);
  } catch { /* ignore */ }
  logEvent({ phase: 'fetch', status: 'stored', uid, message_id: parsed.messageId, subject: parsed.subject || '', class: classification.cls, vendor, detail: classification.reason });
}

async function enrichWithOpenAI(limit = 10) {
  if (!process.env.OPENAI_API_KEY) {
    logEvent({ phase: 'parse', status: 'skip_no_api_key', detail: 'OPENAI_API_KEY not set' });
    return; // skip silently but logged
  }
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const rows = db.prepare(`SELECT id, subject, body FROM emails WHERE parse_status = 'pending' ORDER BY id DESC LIMIT ?`).all(limit) as { id: number; subject: string; body: string; }[];
  if (!rows.length) return;
  logEvent({ phase: 'parse', status: 'batch_start', detail: `pending_count=${rows.length}` });
  for (const row of rows) {
    try {
      logEvent({ phase: 'parse', status: 'item_start', uid: row.id, subject: row.subject });
      const prompt = `Extract structured job application email info as JSON with keys: company, role, next_action, action_date(if any), sentiment(one of neutral,positive,negative), summary(<=160 chars).\nSubject: ${row.subject}\nBody: ${row.body.slice(0, 4000)}`;
      const completion = await openai.chat.completions.create({
        model: OPENAI_MODEL,
        messages: [
          { role: 'system', content: 'You extract structured fields from job application related emails.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
        max_tokens: 300
      });
      const content = completion.choices[0].message.content || '';
      const usage: any = (completion as any).usage || {};
      // Naive pricing table (adjust as needed / keep in sync with model pricing)
  const promptTokens = usage.prompt_tokens || 0;
  const completionTokens = usage.completion_tokens || 0;
  const totalTokens = usage.total_tokens || (promptTokens + completionTokens);
  // Pricing: allow separate prompt/completion per 1K token prices (USD). Defaults approximate small model.
  const promptPer1K = Number(process.env.OPENAI_PRICE_PROMPT_PER_1K || '0.15'); // $0.15 / 1K tokens default
  const completionPer1K = Number(process.env.OPENAI_PRICE_COMPLETION_PER_1K || '0.60'); // $0.60 / 1K tokens default
  const costRaw = (promptTokens / 1000) * promptPer1K + (completionTokens / 1000) * completionPer1K;
  const cost = Number(costRaw.toFixed(6));
      let parsedJson: any = null;
      try { parsedJson = JSON.parse(content.replace(/```json|```/g, '').trim()); } catch { parsedJson = { raw: content }; }
      db.prepare(`UPDATE emails SET parsed_json = ?, parse_status = 'parsed', parsed_at = CURRENT_TIMESTAMP, openai_model = ?, openai_prompt_tokens = ?, openai_completion_tokens = ?, openai_total_tokens = ?, openai_cost_usd = ? WHERE id = ?`)
        .run(JSON.stringify(parsedJson), OPENAI_MODEL, promptTokens, completionTokens, totalTokens, cost, row.id);
      try {
        db.prepare(`INSERT INTO openai_call_log (email_id, model, prompt_tokens, completion_tokens, total_tokens, cost_usd, request_json, response_json)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?);`).run(
            row.id,
            OPENAI_MODEL,
            promptTokens,
            completionTokens,
            totalTokens,
            cost,
            JSON.stringify({ system: 'You extract structured fields...', user: prompt.slice(0, 8000) }),
            JSON.stringify({ content: content.slice(0, 8000) })
          );
      } catch { /* ignore */ }
  logEvent({ phase: 'parse', status: 'parsed', uid: row.id, subject: row.subject, detail: `tokens prompt=${promptTokens} completion=${completionTokens} total=${totalTokens} cost=$${cost}` });
    } catch (e) {
      db.prepare(`UPDATE emails SET parse_status = 'error', parsed_at = CURRENT_TIMESTAMP WHERE id = ?`).run(row.id);
      logEvent({ phase: 'parse', status: 'error', uid: row.id, subject: row.subject, detail: (e as Error).message });
    }
  }
  const remaining = db.prepare("SELECT COUNT(*) as c FROM emails WHERE parse_status='pending'").get() as any;
  logEvent({ phase: 'parse', status: 'batch_end', detail: `remaining_pending=${remaining?.c ?? 0}` });
}

async function runOnce() {
  // Always ensure schema & emit a start event so UI shows something even if env invalid.
  ensureSchema();
  logEvent({ phase: 'run', status: 'start', detail: 'ingest cycle start' });
  try {
    try {
      validateEnv();
    } catch (envErr) {
      logEvent({ phase: 'run', status: 'error', detail: 'env_validation_failed: ' + (envErr as Error).message });
      logEvent({ phase: 'run', status: 'end', detail: 'aborted (env)' });
      return;
    }
    imapDebugEventCounter = 0; // reset per run
    logEvent({ phase: 'run', status: 'config', detail: `imap_debug_max=${IMAP_DEBUG_MAX}; verbose=${VERBOSE_IMAP}` });
    const sync = getSyncState();
    let client: ImapFlow | null = null;
    try {
      client = await connectImap();
    } catch (e) {
      logEvent({ phase: 'imap', status: 'error', detail: (e as Error).message });
      logEvent({ phase: 'run', status: 'end', detail: 'aborted (imap_connect)' });
      return;
    }
    try {
      const effectiveLimit = sync.last_uid === 0 ? Math.min(MAX_INITIAL_SYNC, BATCH_LIMIT) : BATCH_LIMIT;
      let criteria: any;
      if (sync.last_uid > 0) {
        criteria = { uid: `${sync.last_uid + 1}:*` };
      } else {
        const mbox: any = (client as any).mailbox || {};
        const uidNext: number | undefined = mbox.uidNext;
        const highest = uidNext && uidNext > 0 ? uidNext - 1 : undefined;
        let startUid: number;
        if (highest) {
          startUid = Math.max(1, highest - effectiveLimit + 1);
        } else {
          const exists: number | undefined = mbox.exists;
          startUid = Math.max(1, (exists || effectiveLimit) - effectiveLimit + 1);
        }
        criteria = { uid: `${startUid}:*` };
        logEvent({ phase: 'search', status: 'initial_window', detail: `uid_window=${(criteria.uid as string)}` });
      }
      logEvent({ phase: 'search', status: 'criteria', detail: JSON.stringify(criteria) });
      logEvent({ phase: 'search', status: 'start', detail: 'iterating via fetch()' });
      let processed = 0;
      let lastUid = 0;
      for await (const msg of (client as any).fetch(criteria, { uid: true, source: true })) {
        const uid: number = msg.uid;
        if (sync.last_uid && uid <= sync.last_uid) continue;
        logEvent({ phase: 'fetch', status: 'start', uid, detail: 'fetching source' });
        const rawSource: Buffer | undefined = (msg as any).source;
        if (!rawSource) { logEvent({ phase: 'fetch', status: 'skip', uid, detail: 'no source' }); continue; }
        try {
          const parsed = await simpleParser(rawSource);
          upsertEmail(parsed, uid, rawSource, MAILBOX);
          updateSyncState(uid);
        } catch (parseErr) {
          logEvent({ phase: 'fetch', status: 'error', uid, detail: 'parse_fail: ' + (parseErr as Error).message });
        }
        lastUid = uid;
        processed++;
        if (processed >= effectiveLimit) break;
      }
      logEvent({ phase: 'search', status: 'found', detail: `processed ${processed} messages`, uid: lastUid || undefined });
    } finally {
      if (client) await client.logout().catch(()=>{});
    }
    try {
      await enrichWithOpenAI(Number(process.env.OPENAI_PARSE_BATCH || 5));
    } catch (aiErr) {
      logEvent({ phase: 'parse', status: 'error', detail: 'openai_enrich_fail: ' + (aiErr as Error).message });
    }
    // Run a single backfill slice if active (header-only historic crawl)
    try {
      await runBackfillSlice();
    } catch (bfErr) {
      logEvent({ phase: 'backfill', status: 'error', detail: 'slice_fail: ' + (bfErr as Error).message });
    }
    logEvent({ phase: 'run', status: 'end', detail: 'ingest cycle end' });
  } catch (fatal) {
    // Catch any fall-through fatal error
    logEvent({ phase: 'run', status: 'error', detail: 'fatal: ' + (fatal as Error).message });
    logEvent({ phase: 'run', status: 'end', detail: 'ingest cycle end (fatal)' });
    throw fatal; // preserve rejection for API route to observe
  }
}

if (require.main === module) {
  runOnce().catch(err => { console.error('Email ingest daemon error', err); process.exit(1); });
}

export { runOnce as runEmailIngestOnce };

// Utility to reclassify existing emails (can be imported in a script or API route)
export function reclassifyExisting(limit = 1000) {
  const rows = db.prepare('SELECT id, message_id, subject, body FROM emails ORDER BY id DESC LIMIT ?').all(limit) as any[];
  const update = db.prepare('UPDATE emails SET class = ?, classification_confidence = ?, classification_reason = ? WHERE id = ?');
  let updated = 0;
  for (const r of rows) {
    const c = classifyEmail(r.subject || '', r.body || '');
    if (!isRelevantClassification(c.cls, c, r.subject || '', r.body || '')) {
      // Delete or mark as irrelevant. Here we delete to reduce noise.
      try { db.prepare('DELETE FROM emails WHERE id = ?').run(r.id); } catch { /* ignore */ }
    } else {
      update.run(c.cls, c.confidence, c.reason, r.id);
      updated++;
    }
  }
  logEvent({ phase: 'parse', status: 'reclassify', detail: `reclassified=${updated}` });
  return updated;
}

// Utility to purge currently stored non-relevant (e.g., previously stored alerts) without full reclassify
export function purgeIrrelevant() {
  const deleted = db.prepare("DELETE FROM emails WHERE class IS NULL OR class = '' OR class = 'job_alert'").run();
  logEvent({ phase: 'parse', status: 'purge', detail: `purge_deleted=${deleted.changes}` });
  return deleted.changes;
}
