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
    -- Core tables (lightweight ensure so job tracker can promote postings into applications)
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE,
      avatar TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS companies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      logo TEXT,
      industry TEXT,
      website TEXT,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      company_id INTEGER NOT NULL,
      position TEXT NOT NULL,
  stage TEXT NOT NULL,
      date_applied DATETIME NOT NULL,
      salary_range TEXT,
      job_description TEXT,
      notes TEXT,
      location TEXT,
      remote BOOLEAN,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(company_id) REFERENCES companies(id)
    );
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
    CREATE UNIQUE INDEX IF NOT EXISTS idx_job_postings_hash ON job_postings(hash);
    CREATE INDEX IF NOT EXISTS idx_job_postings_url ON job_postings(source_url);

    CREATE TABLE IF NOT EXISTS job_actions (
      id TEXT PRIMARY KEY,
      job_posting_id TEXT,
      action_type TEXT NOT NULL,
      url TEXT,
      details_json TEXT,
      occurred_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(job_posting_id) REFERENCES job_postings(id)
    );
    CREATE INDEX IF NOT EXISTS idx_job_actions_posting ON job_actions(job_posting_id);
    CREATE INDEX IF NOT EXISTS idx_job_actions_type ON job_actions(action_type);
  `);

  // Idempotent column additions for aggregation metrics
  const addCols: Array<[string,string]> = [
    ['last_seen_at', 'DATETIME'],
    ['time_spent_seconds', 'INTEGER DEFAULT 0'],
    ['max_scroll_pct', 'INTEGER DEFAULT 0'],
    ['apply_clicked_count', 'INTEGER DEFAULT 0']
  ];
  for (const [col, def] of addCols) {
    try {
      const exists = db.prepare(`PRAGMA table_info(job_postings)`).all().some((r:any)=> r.name === col);
      if (!exists) db.prepare(`ALTER TABLE job_postings ADD COLUMN ${col} ${def}`).run();
    } catch (e) {
      // ignore
    }
  }

  // Ensure application linking columns
  try {
    const appCols = db.prepare('PRAGMA table_info(applications)').all() as any[];
    const have = new Set(appCols.map(c=>c.name));
    if (!have.has('job_posting_id')) db.prepare('ALTER TABLE applications ADD COLUMN job_posting_id TEXT').run();
    if (!have.has('is_tracked_only')) db.prepare('ALTER TABLE applications ADD COLUMN is_tracked_only BOOLEAN DEFAULT 0').run();
    // simple index for lookups
    db.prepare('CREATE INDEX IF NOT EXISTS idx_app_job_posting_id ON applications(job_posting_id)').run();
  } catch {/* ignore */}

  // Guarantee a default user (id=1) for tracked applications
  try {
    const u = db.prepare('SELECT id FROM users WHERE id=1').get();
  if (!u) db.prepare('INSERT INTO users (id, name, email) VALUES (1, ?, ?)').run('Default User', 'default@example.com');
  } catch {/* ignore */}

    // If applications table has old CHECK constraint (without 'lead'), rebuild with new constraint
    try {
        const meta = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='applications'").get() as any;
        if (meta && meta.sql && /stage IN \('(applied|screening)/i.test(meta.sql) && !/\blead\b/i.test(meta.sql)) {
            console.log('[migrate] Rebuilding applications table to add LEAD stage constraint');
            db.exec('PRAGMA foreign_keys=OFF;');
            db.exec('BEGIN;');
            db.exec(`CREATE TABLE applications_new (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              user_id INTEGER NOT NULL,
              company_id INTEGER NOT NULL,
              position TEXT NOT NULL,
              stage TEXT NOT NULL CHECK (stage IN ('lead','applied','screening','interview','offer','rejected')),
              date_applied DATETIME NOT NULL,
              salary_range TEXT,
              job_description TEXT,
              notes TEXT,
              location TEXT,
              remote BOOLEAN,
              job_posting_id TEXT,
              is_tracked_only BOOLEAN DEFAULT 0,
              deleted_at DATETIME,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY(user_id) REFERENCES users(id),
              FOREIGN KEY(company_id) REFERENCES companies(id)
            );`);
            // Copy over matching columns (ignore extras if any missing)
            const oldCols = db.prepare('PRAGMA table_info(applications)').all() as any[];
            const colSet = new Set(oldCols.map(c=>c.name));
            const selectCols = [
              'id','user_id','company_id','position','stage','date_applied','salary_range','job_description','notes','location','remote','job_posting_id','is_tracked_only','deleted_at','created_at','updated_at'
            ].filter(c=>colSet.has(c));
            db.exec(`INSERT INTO applications_new (${selectCols.join(',')}) SELECT ${selectCols.join(',')} FROM applications;`);
            db.exec('DROP TABLE applications;');
            db.exec('ALTER TABLE applications_new RENAME TO applications;');
            db.exec('CREATE INDEX IF NOT EXISTS idx_app_job_posting_id ON applications(job_posting_id);');
            db.exec('COMMIT;');
            db.exec('PRAGMA foreign_keys=ON;');
            console.log('[migrate] Applications table upgraded with LEAD stage');
        }
    } catch (e) {
        console.warn('[migrate] Skipped applications LEAD stage rebuild:', (e as Error).message);
    }
}
