#!/usr/bin/env tsx
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'database', 'jjugg.db');
const db = new Database(dbPath);

function tableNames(): string[] {
  return db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map((r: any)=>r.name);
}

function executedDropMigration(): boolean {
  try {
    const rows = db.prepare("SELECT migration_id FROM migrations WHERE migration_id LIKE '%drop_mvp_tables%'").all();
    return rows.length > 0;
  } catch (e) {
    return false;
  }
}

const tables = tableNames();
const mvpTables = tables.filter(t=>t.endsWith('_mvp'));

console.log(JSON.stringify({
  dbPath,
  executedDropMigration: executedDropMigration(),
  mvpTablesRemaining: mvpTables,
  totalTables: tables.length
}, null, 2));
