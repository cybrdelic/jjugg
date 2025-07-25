import { db } from '../connection';

console.log('Adding missing columns to applications table...');

try {
    // Add new columns to applications table if they don't exist
    db.exec(`
    ALTER TABLE applications ADD COLUMN location TEXT DEFAULT '';
  `);
    console.log('Added location column');
} catch (e: any) {
    console.log('Location column already exists or error:', e?.message || e);
}

try {
    db.exec(`
    ALTER TABLE applications ADD COLUMN remote BOOLEAN DEFAULT FALSE;
  `);
    console.log('Added remote column');
} catch (e: any) {
    console.log('Remote column already exists or error:', e?.message || e);
}

try {
    db.exec(`
    ALTER TABLE applications ADD COLUMN bonus TEXT;
  `);
    console.log('Added bonus column');
} catch (e: any) {
    console.log('Bonus column already exists or error:', e?.message || e);
}

try {
    db.exec(`
    ALTER TABLE applications ADD COLUMN benefits TEXT;
  `);
    console.log('Added benefits column');
} catch (e: any) {
    console.log('Benefits column already exists or error:', e?.message || e);
}

try {
    db.exec(`
    ALTER TABLE applications ADD COLUMN is_shortlisted BOOLEAN DEFAULT FALSE;
  `);
    console.log('Added is_shortlisted column');
} catch (e: any) {
    console.log('Is_shortlisted column already exists or error:', e?.message || e);
}

try {
    db.exec(`
    ALTER TABLE applications ADD COLUMN shortlisted_at DATETIME;
  `);
    console.log('Added shortlisted_at column');
} catch (e: any) {
    console.log('Shortlisted_at column already exists or error:', e?.message || e);
} console.log('Database schema update completed!');
