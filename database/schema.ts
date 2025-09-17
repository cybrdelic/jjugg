import { db } from './connection';

export const createTables = () => {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      avatar TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Companies table
  db.exec(`
    CREATE TABLE IF NOT EXISTS companies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      logo TEXT,
      industry TEXT,
      website TEXT,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Applications table
  db.exec(`
    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      company_id INTEGER NOT NULL,
  position TEXT NOT NULL,
  stage TEXT NOT NULL CHECK (stage IN ('lead', 'applied', 'screening', 'interview', 'offer', 'rejected')),
      date_applied DATETIME NOT NULL,
      salary_range TEXT,
      job_description TEXT,
      notes TEXT,
      location TEXT DEFAULT '',
      remote BOOLEAN DEFAULT FALSE,
      bonus TEXT,
      benefits TEXT, -- JSON string of benefits array
      tech_stack TEXT, -- JSON string array of technologies
      is_shortlisted BOOLEAN DEFAULT FALSE,
      shortlisted_at DATETIME,
  job_posting_id TEXT,
  is_tracked_only BOOLEAN DEFAULT 0,
  deleted_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE
    )
  `);

  // Lightweight migration: if table exists without 'lead' in CHECK constraint, rebuild it to add 'lead'
  try {
    const row = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='applications'").get() as any;
    if (row && row.sql && !/\blead\b/.test(row.sql)) {
      console.log('⚙️ Migrating applications table to include LEAD stage...');
      db.exec('PRAGMA foreign_keys=OFF;');
      db.exec('BEGIN;');
      db.exec(`CREATE TABLE applications_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          company_id INTEGER NOT NULL,
          position TEXT NOT NULL,
          stage TEXT NOT NULL CHECK (stage IN ('lead', 'applied', 'screening', 'interview', 'offer', 'rejected')),
          date_applied DATETIME NOT NULL,
          salary_range TEXT,
          job_description TEXT,
          notes TEXT,
          location TEXT DEFAULT '',
          remote BOOLEAN DEFAULT FALSE,
          bonus TEXT,
          benefits TEXT,
          tech_stack TEXT,
          is_shortlisted BOOLEAN DEFAULT FALSE,
          shortlisted_at DATETIME,
          job_posting_id TEXT,
          is_tracked_only BOOLEAN DEFAULT 0,
          deleted_at DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
          FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE
        );`);
      db.exec(`INSERT INTO applications_new (
          id, user_id, company_id, position, stage, date_applied, salary_range, job_description, notes, location, remote,
          bonus, benefits, tech_stack, is_shortlisted, shortlisted_at, job_posting_id, is_tracked_only, deleted_at, created_at, updated_at
        )
        SELECT id, user_id, company_id, position, stage, date_applied, salary_range, job_description, notes, location, remote,
               bonus, benefits, tech_stack, is_shortlisted, shortlisted_at, job_posting_id, is_tracked_only, deleted_at, created_at, updated_at
        FROM applications;`);
      db.exec('DROP TABLE applications;');
      db.exec('ALTER TABLE applications_new RENAME TO applications;');
      db.exec('COMMIT;');
      db.exec('PRAGMA foreign_keys=ON;');
      console.log('✅ Applications table migrated to include LEAD stage');
    }
  } catch (e) {
    console.warn('⚠️ Could not perform LEAD stage migration:', (e as Error).message);
  }

  // Interviews table
  db.exec(`
    CREATE TABLE IF NOT EXISTS interviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      application_id INTEGER NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('phone', 'video', 'onsite', 'technical', 'behavioral')),
      scheduled_date DATETIME NOT NULL,
      duration INTEGER, -- in minutes
      interviewer_name TEXT,
      interviewer_role TEXT,
      notes TEXT,
      feedback TEXT,
      outcome TEXT CHECK (outcome IN ('pending', 'passed', 'failed', 'cancelled')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (application_id) REFERENCES applications (id) ON DELETE CASCADE
    )
  `);

  // Activities table (for timeline/history tracking)
  db.exec(`
    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      application_id INTEGER,
      type TEXT NOT NULL CHECK (type IN ('application', 'interview', 'network', 'follow_up', 'offer', 'rejection')),
      title TEXT NOT NULL,
      description TEXT,
      priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
      status TEXT CHECK (status IN ('pending', 'completed', 'cancelled')) DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (application_id) REFERENCES applications (id) ON DELETE CASCADE
    )
  `);

  // Reminders/Events table
  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      application_id INTEGER,
      title TEXT NOT NULL,
      description TEXT,
      event_date DATETIME NOT NULL,
      event_type TEXT CHECK (event_type IN ('interview', 'follow_up', 'deadline', 'networking', 'other')) DEFAULT 'other',
      is_completed BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (application_id) REFERENCES applications (id) ON DELETE CASCADE
    )
  `);

  // Goals table
  db.exec(`
    CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      target_value INTEGER NOT NULL,
      current_value INTEGER DEFAULT 0,
      target_date DATETIME,
      category TEXT CHECK (category IN ('applications', 'interviews', 'networking', 'skills', 'other')) DEFAULT 'other',
      is_completed BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Contacts table (for networking)
  db.exec(`
    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      company_id INTEGER,
      name TEXT NOT NULL,
      role TEXT,
      email TEXT,
      phone TEXT,
      linkedin TEXT,
      notes TEXT,
      relationship TEXT CHECK (relationship IN ('recruiter', 'hiring_manager', 'employee', 'referral', 'other')) DEFAULT 'other',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE SET NULL
    )
  `);

  // Email configuration (IMAP settings)
  db.exec(`
    CREATE TABLE IF NOT EXISTS email_config (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      host TEXT NOT NULL,
      port INTEGER NOT NULL DEFAULT 993,
      secure INTEGER NOT NULL DEFAULT 1,
      user TEXT NOT NULL,
      password TEXT NOT NULL,
      mailbox TEXT NOT NULL DEFAULT 'INBOX',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Minimal application settings (generic key/value)
  db.exec(`
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT
    )
  `);

  // Job tracking tables (from daemon)
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
      collected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_seen_at DATETIME,
      time_spent_seconds INTEGER DEFAULT 0,
      max_scroll_pct INTEGER DEFAULT 0,
      apply_clicked_count INTEGER DEFAULT 0
    )
  `);
  db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_job_postings_hash ON job_postings(hash);`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_job_postings_url ON job_postings(source_url);`);

  db.exec(`
    CREATE TABLE IF NOT EXISTS job_actions (
      id TEXT PRIMARY KEY,
      job_posting_id TEXT,
      action_type TEXT NOT NULL,
      url TEXT,
      details_json TEXT,
      occurred_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(job_posting_id) REFERENCES job_postings(id)
    )
  `);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_job_actions_posting ON job_actions(job_posting_id);`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_job_actions_type ON job_actions(action_type);`);

  // Email ingestion & parsing tables (structure only, no seed rows)
  db.exec(`
    CREATE TABLE IF NOT EXISTS email_sync_state (
      mailbox TEXT PRIMARY KEY,
      last_uid INTEGER DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS ingestion_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      phase TEXT,
      status TEXT,
      uid INTEGER,
      message_id TEXT,
      subject TEXT,
      class TEXT,
      vendor TEXT,
      detail TEXT
    )
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS openai_call_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email_id INTEGER,
      model TEXT,
      prompt_tokens INTEGER,
      completion_tokens INTEGER,
      total_tokens INTEGER,
      cost_usd REAL,
      request_json TEXT,
      response_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS emails (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message_id TEXT UNIQUE,
      date DATETIME,
      subject TEXT,
      from_email TEXT,
      to_email TEXT,
      vendor TEXT,
      class TEXT,
      body TEXT,
      raw_headers TEXT,
      raw_html TEXT,
      parsed_json TEXT,
      parse_status TEXT DEFAULT 'pending',
      parsed_at DATETIME,
      openai_model TEXT,
      openai_prompt_tokens INTEGER,
      openai_completion_tokens INTEGER,
      openai_total_tokens INTEGER,
      openai_cost_usd REAL,
      classification_confidence REAL,
      classification_reason TEXT,
      uid INTEGER,
      mailbox TEXT,
      created_at DATETIME,
      updated_at DATETIME
    )
  `);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_emails_message_id ON emails(message_id);`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_emails_class ON emails(class);`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_emails_vendor ON emails(vendor);`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_emails_parse_status ON emails(parse_status);`);

  db.exec(`
    CREATE TABLE IF NOT EXISTS email_backfill_state (
      mailbox TEXT PRIMARY KEY,
      highest_uid_seen INTEGER,
      lowest_uid_processed INTEGER,
      active INTEGER DEFAULT 0,
      started_at DATETIME,
      updated_at DATETIME,
      model_version TEXT
    )
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS email_header_cache (
      uid INTEGER PRIMARY KEY,
      subject TEXT,
      from_email TEXT,
      date DATETIME,
      size INTEGER,
      decision TEXT,
      score REAL,
      reason TEXT,
      model_version TEXT,
      promoted INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_email_header_decision ON email_header_cache(decision);`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_email_header_model ON email_header_cache(model_version);`);

  console.log('✅ Database tables created successfully');
};

export const dropTables = () => {
  const tables = [
    'email_header_cache',
    'email_backfill_state',
    'openai_call_log',
    'ingestion_log',
    'emails',
    'email_sync_state',
    'job_actions',
    'job_postings',
    'contacts',
    'goals',
    'events',
    'activities',
    'interviews',
    'applications',
    'companies',
    'users',
    'app_settings',
    'email_config'
  ];

  tables.forEach(table => {
    db.exec(`DROP TABLE IF EXISTS ${table}`);
  });

  console.log('🗑️ Database tables dropped successfully');
};
