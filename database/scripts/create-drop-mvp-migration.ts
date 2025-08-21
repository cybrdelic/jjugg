#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';
import { db } from '../connection';
import { MigrationRunner } from '../migrationRunner';

async function main() {
  const rows = db.prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name LIKE ? AND name NOT LIKE 'sqlite_%'"
  ).all('%_mvp') as { name: string }[];

  const tables = rows.map(r => r.name).sort();

  const runner = new MigrationRunner();
  const filePath = await runner.createMigration('drop_mvp_tables');

  const migrationId = path.basename(filePath, '.sql');

  const upStatements: string[] = [];
  upStatements.push('BEGIN TRANSACTION;');
  if (tables.length === 0) {
    // No-op but keep a valid transaction block
    upStatements.push("-- no _mvp tables found");
  } else {
    for (const name of tables) {
      // Quote the table name defensively
      const quoted = '"' + name.replace(/"/g, '""') + '"';
      upStatements.push(`DROP TABLE IF EXISTS ${quoted};`);
    }
  }
  upStatements.push('COMMIT;');

  const downStatements: string[] = [];
  downStatements.push('-- NOTE: This migration drops *_mvp tables and is not reversible automatically.');
  downStatements.push('-- Add CREATE TABLE statements here if you need to restore them.');

  const content = `-- Migration: ${migrationId}
-- Description: Drop all tables ending with _mvp
-- Created: ${new Date().toISOString()}

-- UP Migration
${upStatements.join('\n')}

-- DOWN Migration
${downStatements.join('\n')}
`;

  fs.writeFileSync(filePath, content, 'utf-8');

  console.log(`✅ Created migration to drop ${tables.length} *_mvp table(s): ${path.basename(filePath)}`);
  if (tables.length) {
    for (const t of tables) console.log(`  - ${t}`);
  }
}

main().catch(err => {
  console.error('Failed to create drop _mvp migration:', err);
  process.exit(1);
});
