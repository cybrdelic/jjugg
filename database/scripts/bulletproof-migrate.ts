import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import Database from 'better-sqlite3';

const DB_PATH = process.env.JJUGG_DB_PATH || path.join(__dirname, '../jjugg.db');
const MIGRATIONS_DIR = path.join(__dirname, '../migrations');

function getChecksum(content: string) {
    return crypto.createHash('sha256').update(content).digest('hex');
}

function getMigrationFiles() {
    return fs.readdirSync(MIGRATIONS_DIR)
        .filter(f => f.endsWith('.sql'))
        .sort();
}

function parseMigration(file: string) {
    const content = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
    const upMatch = content.match(/-- UP Migration[\r\n]+([\s\S]*?)-- DOWN Migration/);
    const downMatch = content.match(/-- DOWN Migration[\r\n]+([\s\S]*)$/);
    return {
        up: upMatch ? upMatch[1].trim() : '',
        down: downMatch ? downMatch[1].trim() : '',
        checksum: getChecksum(content),
        content
    };
}

function ensureMigrationsTable(db: Database.Database) {
    db.exec(`CREATE TABLE IF NOT EXISTS migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    migration_id TEXT UNIQUE NOT NULL,
    checksum TEXT NOT NULL,
    executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
}

function getAppliedMigrations(db: Database.Database) {
    return db.prepare('SELECT migration_id, checksum FROM migrations ORDER BY migration_id').all();
}

function applyMigration(db: Database.Database, file: string, upSql: string, checksum: string) {
    const tx = db.transaction(() => {
        db.exec(upSql);
        db.prepare('INSERT INTO migrations (migration_id, checksum) VALUES (?, ?)').run(file, checksum);
    });
    tx();
}

function main() {
    const db = new Database(DB_PATH);
    ensureMigrationsTable(db);
    const applied = getAppliedMigrations(db);
    const appliedIds = new Set(applied.map(m => m.migration_id));
    const files = getMigrationFiles();
    for (const file of files) {
        if (appliedIds.has(file)) {
            // Check for checksum mismatch
            const migration = parseMigration(file);
            const appliedMigration = applied.find(m => m.migration_id === file);
            if (appliedMigration && appliedMigration.checksum !== migration.checksum) {
                console.error(`Checksum mismatch for migration ${file}. Migration file may have been altered.`);
                process.exit(1);
            }
            continue;
        }
        const migration = parseMigration(file);
        if (!migration.up) {
            console.warn(`No UP migration found in: ${file}`);
            continue;
        }
        console.log(`Applying migration: ${file}`);
        try {
            applyMigration(db, file, migration.up, migration.checksum);
            console.log(`✅ Migration completed: ${file}`);
        } catch (err) {
            console.error(`❌ Error applying migration ${file}:`, err);
            process.exit(1);
        }
    }
    db.close();
    console.log('🎉 All migrations completed successfully!');
}

main();
