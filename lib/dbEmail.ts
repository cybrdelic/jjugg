import sqlite3 from 'better-sqlite3';
import path from 'path';

// Central email DB connection (singleton per module load)
export const DB_PATH = path.join(process.cwd(), 'database', 'jjugg.db');
export const db = sqlite3(DB_PATH);

let schemaEnsured = false;
export function ensureEmailSchema() {
  if (schemaEnsured) return;
  // Minimal required tables for email features
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
    const cols = db.prepare('PRAGMA table_info(emails)').all() as { name: string }[];
    const existing = new Set(cols.map(c => c.name));
    for (const col of Object.keys(required)) {
      if (!existing.has(col)) {
        try { db.prepare(required[col]).run(); } catch { /* ignore */ }
      }
    }
  } catch { /* ignore */ }
  db.prepare(`INSERT OR IGNORE INTO email_sync_state (mailbox, last_uid) VALUES (?, 0)`).run(process.env.IMAP_MAILBOX || 'INBOX');
  schemaEnsured = true;
}
