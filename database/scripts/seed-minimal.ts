#!/usr/bin/env node
import { db } from '../connection';
import { createTables } from '../schema';

async function main() {
  try {
    console.log('🌱 Creating tables (minimal seed)...');
    createTables();

    // Insert a default user (optional) and minimal settings only if not exists
    db.exec(`CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT
    );`);

    const insertSetting = db.prepare('INSERT OR IGNORE INTO app_settings (key, value) VALUES (?, ?)');
    insertSetting.run('schema_version', '1');
    insertSetting.run('job_tracker.enabled', 'true');
    insertSetting.run('job_tracker.version', '1');

    console.log('✅ Minimal seed complete (no fake job/application data).');
  } catch (e:any) {
    console.error('❌ Minimal seed failed', e);
    process.exit(1);
  }
}

main();
