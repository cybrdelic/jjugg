import Database from 'better-sqlite3';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const DB_PATH = process.env.JJUGG_DB_PATH || path.join(__dirname, '../jjugg.db');

function hasColumn(db: Database.Database, table: string, column: string) {
  try {
    const rows = db.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>
    return rows.some(r => r.name === column);
  } catch {
    return false;
  }
}

function ensureMigrationsTable(db: Database.Database) {
  db.exec(`CREATE TABLE IF NOT EXISTS migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    migration_id TEXT UNIQUE NOT NULL,
    name TEXT,
    checksum TEXT,
    executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
}

function getChecksum(content: string) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

function sanitizeSql(content: string) {
  // Remove top-of-file comments and transaction wrappers
  return content
    .replace(/\r\n/g, '\n')
    .replace(/BEGIN\s+TRANSACTION;?/gi, '')
    .replace(/COMMIT;?/gi, '')
    .trim();
}

function main() {
  const args = process.argv.slice(2);
  const fileArgIndex = args.findIndex(a => a === '--file');
  if (fileArgIndex === -1 || !args[fileArgIndex + 1]) {
    console.error('Usage: tsx database/scripts/apply-single-migration.ts --file <path-to-sql>');
    process.exit(1);
  }
  const filePath = path.isAbsolute(args[fileArgIndex + 1])
    ? args[fileArgIndex + 1]
    : path.join(process.cwd(), args[fileArgIndex + 1]);

  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  const fileName = path.basename(filePath);
  const content = fs.readFileSync(filePath, 'utf8');
  const checksum = getChecksum(content);
  const upSql = sanitizeSql(content);

  const db = new Database(DB_PATH);
  ensureMigrationsTable(db);

  const tx = db.transaction(() => {
    if (upSql) db.exec(upSql);
    // Insert into migrations table with schema compatibility
    const cols: string[] = ['migration_id'];
    const vals: string[] = ['?'];
    const params: any[] = [fileName];

    if (hasColumn(db, 'migrations', 'name')) { cols.push('name'); vals.push('?'); params.push(fileName); }
    if (hasColumn(db, 'migrations', 'checksum')) { cols.push('checksum'); vals.push('?'); params.push(checksum); }

    // executed_at handled by DEFAULT if present
    const sql = `INSERT OR IGNORE INTO migrations (${cols.join(', ')}) VALUES (${vals.join(', ')})`;
    db.prepare(sql).run(...params);
  });

  try {
    tx();
    console.log(`✅ Applied single migration: ${fileName}`);
  } catch (err) {
    console.error(`❌ Failed applying ${fileName}:`, err);
    process.exit(1);
  } finally {
    db.close();
  }
}

main();
