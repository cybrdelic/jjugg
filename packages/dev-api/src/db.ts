import path from 'path';
import fs from 'fs';
import Database from 'better-sqlite3';

function findDbPath() {
    let dir = process.cwd();
    while (true) {
        const candidate = path.join(dir, 'database', 'jjugg.db');
        if (fs.existsSync(candidate)) return candidate;
        const parent = path.dirname(dir);
        if (parent === dir) break;
        dir = parent;
    }
    // fallback to workspace root assumption
    return path.join(process.cwd(), '..', '..', 'database', 'jjugg.db');
}

export const dbPath = findDbPath();
export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

export function runMigrations() {
    // MVP: ensure auxiliary tables exist
    db.exec(`
    CREATE TABLE IF NOT EXISTS job_postings (
      id TEXT PRIMARY KEY,
      source_url TEXT,
      title TEXT,
      company_name_raw TEXT,
      location_raw TEXT,
      description_raw TEXT,
      raw_payload_json TEXT,
      hash TEXT,
      collected_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
    db.exec(`
    CREATE TABLE IF NOT EXISTS applications_mvp (
      id TEXT PRIMARY KEY,
      company_id TEXT,
      job_posting_id TEXT,
      title TEXT,
      location TEXT,
      remote INTEGER DEFAULT 0,
      compensation_raw TEXT,
      source_url TEXT,
      status TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
    db.exec(`
    CREATE TABLE IF NOT EXISTS companies_mvp (
      id TEXT PRIMARY KEY,
      name TEXT,
      domain TEXT,
      linkedin_url TEXT
    );
  `);
    db.exec(`
    CREATE TABLE IF NOT EXISTS contacts_mvp (
      id TEXT PRIMARY KEY,
      company_id TEXT,
      application_id TEXT,
      name TEXT,
      email TEXT,
      phone TEXT,
      role TEXT,
      source TEXT,
      confidence REAL
    );
  `);
    db.exec(`
    CREATE TABLE IF NOT EXISTS emails_mvp (
      id TEXT PRIMARY KEY,
      provider_id TEXT,
      thread_id TEXT,
      from_addr TEXT,
      to_addrs TEXT,
      subject TEXT,
      date DATETIME,
      body_text TEXT,
      body_html TEXT,
      ics_blob BLOB,
      raw_headers_json TEXT,
      inferred_application_id TEXT,
      classification TEXT,
      confidence REAL
    );
  `);
    db.exec(`
    CREATE TABLE IF NOT EXISTS interview_events_mvp (
      id TEXT PRIMARY KEY,
      application_id TEXT,
      type TEXT,
      starts_at DATETIME,
      ends_at DATETIME,
      location TEXT,
      meeting_link TEXT,
      source_email_id TEXT,
      status TEXT
    );
  `);
    db.exec(`
    CREATE TABLE IF NOT EXISTS draft_forms_mvp (
      id TEXT PRIMARY KEY,
      scope_key TEXT,
      fields_json TEXT,
      last_seen_url TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
    db.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs_mvp (
      id TEXT PRIMARY KEY,
      entity TEXT,
      entity_id TEXT,
      action TEXT,
      before_json TEXT,
      after_json TEXT,
      ts DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}
