import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

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
    // Retain only non-_mvp tables we still support
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
}
