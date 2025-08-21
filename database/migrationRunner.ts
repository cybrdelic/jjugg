import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { db } from './connection';

interface Migration {
    id: string;
    name: string;
    up: string;
    down: string;
    timestamp: string;
}

export class MigrationRunner {
    private migrationsPath: string;

    constructor() {
        this.migrationsPath = path.join(__dirname, 'migrations');
        this.initializeMigrationsTable();
    }

    private initializeMigrationsTable() {
        // Create migrations tracking table if it doesn't exist
        db.exec(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        migration_id TEXT UNIQUE NOT NULL,
        name TEXT,
        executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    }

    private hasColumn(table: string, column: string): boolean {
        try {
            const stmt = db.prepare(`PRAGMA table_info(${table})`);
            const rows = stmt.all() as { name: string }[];
            return rows.some(r => r.name === column);
        } catch {
            return false;
        }
    }

    private getColumnInfo(table: string): Array<{ name: string; notnull: number; dflt_value: string | null }> {
        try {
            const stmt = db.prepare(`PRAGMA table_info(${table})`);
            return stmt.all() as Array<{ name: string; notnull: number; dflt_value: string | null }>;
        } catch {
            return [];
        }
    }

    async createMigration(name: string): Promise<string> {
        const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '');
        const migrationId = `${timestamp}_${name.toLowerCase().replace(/\s+/g, '_')}`;
        const fileName = `${migrationId}.sql`;
        const filePath = path.join(this.migrationsPath, fileName);

        const migrationTemplate = `-- Migration: ${migrationId}
-- Description: ${name}
-- Created: ${new Date().toISOString()}

-- UP Migration
-- Add your schema changes here
BEGIN TRANSACTION;

-- Example:
-- ALTER TABLE applications ADD COLUMN is_shortlisted BOOLEAN DEFAULT FALSE;

COMMIT;

-- DOWN Migration
-- Add rollback commands here (commented out)
-- BEGIN TRANSACTION;
-- ALTER TABLE applications DROP COLUMN is_shortlisted;
-- COMMIT;
`;

        fs.writeFileSync(filePath, migrationTemplate);
        console.log(`✅ Migration created: ${fileName}`);
        return filePath;
    }

    async runMigrations(direction: 'up' | 'down' = 'up'): Promise<void> {
        const migrationFiles = this.getMigrationFiles();

        if (direction === 'up') {
            await this.runUpMigrations(migrationFiles);
        } else {
            await this.runDownMigrations(migrationFiles);
        }
    }

    private getMigrationFiles(): string[] {
        if (!fs.existsSync(this.migrationsPath)) {
            fs.mkdirSync(this.migrationsPath, { recursive: true });
            return [];
        }

        return fs.readdirSync(this.migrationsPath)
            .filter(file => file.endsWith('.sql'))
            .sort();
    }

    private async runUpMigrations(migrationFiles: string[]): Promise<void> {
        const executedMigrations = this.getExecutedMigrations();

        for (const file of migrationFiles) {
            const migrationId = path.basename(file, '.sql');

            if (executedMigrations.includes(migrationId)) {
                console.log(`⏭️  Skipping ${migrationId} (already executed)`);
                continue;
            }

            console.log(`🔄 Running migration: ${migrationId}`);

            try {
                const migrationFullPath = path.join(this.migrationsPath, file);
                const migrationContent = fs.readFileSync(
                    migrationFullPath,
                    'utf-8'
                );

                const upSection = this.extractUpMigration(migrationContent);
                const checksum = crypto.createHash('sha256').update(migrationContent).digest('hex');

                if (upSection.trim()) {
                    db.exec(upSection);

                    // Record successful migration (compat with older/newer schemas)
                    const hasName = this.hasColumn('migrations', 'name');
                    const hasChecksum = this.hasColumn('migrations', 'checksum');
                    const cols: string[] = ['migration_id'];
                    const vals: string[] = ['?'];
                    const params: any[] = [migrationId];

                    if (hasName) { cols.push('name'); vals.push('?'); params.push(file); }
                    if (hasChecksum) { cols.push('checksum'); vals.push('?'); params.push(checksum); }

                    // Handle executed_at NOT NULL without default
                    const info = this.getColumnInfo('migrations');
                    const executedAt = info.find(c => c.name === 'executed_at');
                    if (executedAt && executedAt.notnull && executedAt.dflt_value == null) {
                        cols.push('executed_at');
                        vals.push('CURRENT_TIMESTAMP');
                    }

                    const sql = `INSERT INTO migrations (${cols.join(', ')}) VALUES (${vals.join(', ')})`;
                    const stmt = db.prepare(sql);
                    stmt.run(...params);

                    console.log(`✅ Migration completed: ${migrationId}`);
                } else {
                    console.log(`⚠️  No UP migration found in: ${migrationId}`);
                }

            } catch (error) {
                console.error(`❌ Migration failed: ${migrationId}`);
                console.error(error);
                throw error;
            }
        }

        console.log('🎉 All migrations completed successfully!');
    }

    private async runDownMigrations(migrationFiles: string[]): Promise<void> {
        const executedMigrations = this.getExecutedMigrations();
        const reversedFiles = migrationFiles.reverse();

        for (const file of reversedFiles) {
            const migrationId = path.basename(file, '.sql');

            if (!executedMigrations.includes(migrationId)) {
                console.log(`⏭️  Skipping ${migrationId} (not executed)`);
                continue;
            }

            console.log(`🔄 Rolling back migration: ${migrationId}`);

            try {
                const migrationContent = fs.readFileSync(
                    path.join(this.migrationsPath, file),
                    'utf-8'
                );

                const downSection = this.extractDownMigration(migrationContent);

                if (downSection.trim()) {
                    db.exec(downSection);

                    // Remove migration record
                    const stmt = db.prepare('DELETE FROM migrations WHERE migration_id = ?');
                    stmt.run(migrationId);

                    console.log(`✅ Rollback completed: ${migrationId}`);
                } else {
                    console.log(`⚠️  No DOWN migration found in: ${migrationId}`);
                }

            } catch (error) {
                console.error(`❌ Rollback failed: ${migrationId}`);
                console.error(error);
                throw error;
            }
        }

        console.log('🎉 All rollbacks completed successfully!');
    }

    private getExecutedMigrations(): string[] {
    const orderBy = this.hasColumn('migrations', 'executed_at') ? 'executed_at' : 'id';
    const stmt = db.prepare(`SELECT migration_id FROM migrations ORDER BY ${orderBy}`);
        const results = stmt.all() as { migration_id: string }[];
        return results.map(r => r.migration_id);
    }

    private extractUpMigration(content: string): string {
        const upMatch = content.match(/-- UP Migration([\s\S]*?)(?=-- DOWN Migration|$)/i);
        if (!upMatch) return '';

        return upMatch[1]
            .split('\n')
            .filter(line => !line.trim().startsWith('--') && line.trim() !== '')
            .join('\n');
    }

    private extractDownMigration(content: string): string {
        const downMatch = content.match(/-- DOWN Migration([\s\S]*?)$/i);
        if (!downMatch) return '';

        return downMatch[1]
            .split('\n')
            .filter(line => {
                const trimmed = line.trim();
                return !trimmed.startsWith('--') && trimmed !== '';
            })
            .join('\n');
    }

    async getStatus(): Promise<void> {
        const migrationFiles = this.getMigrationFiles();
        const executedMigrations = this.getExecutedMigrations();

        console.log('\n📊 Migration Status:');
        console.log('===================');

        if (migrationFiles.length === 0) {
            console.log('No migrations found.');
            return;
        }

        for (const file of migrationFiles) {
            const migrationId = path.basename(file, '.sql');
            const status = executedMigrations.includes(migrationId) ? '✅ Executed' : '⏳ Pending';
            console.log(`${status} - ${migrationId}`);
        }

        console.log(`\nTotal: ${migrationFiles.length} migrations`);
        console.log(`Executed: ${executedMigrations.length}`);
        console.log(`Pending: ${migrationFiles.length - executedMigrations.length}`);
    }
}
