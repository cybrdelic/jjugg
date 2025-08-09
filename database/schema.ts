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
      stage TEXT NOT NULL CHECK (stage IN ('applied', 'screening', 'interview', 'offer', 'rejected')),
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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE
    )
  `);

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

  console.log('✅ Database tables created successfully');
};

export const dropTables = () => {
  const tables = ['contacts', 'goals', 'events', 'activities', 'interviews', 'applications', 'companies', 'users'];

  tables.forEach(table => {
    db.exec(`DROP TABLE IF EXISTS ${table}`);
  });

  console.log('🗑️ Database tables dropped successfully');
};
