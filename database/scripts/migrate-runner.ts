#!/usr/bin/env node

/**
 * Database Migration Runner Script
 *
 * Usage:
 * npm run db:migrate                 - Run all pending migrations
 * npm run db:migrate:down           - Rollback last migration
 * npm run db:migrate:status         - Show migration status
 * npm run db:migrate:create "name"  - Create new migration file
 */

import { MigrationRunner } from '../migrationRunner';

async function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    const migrationRunner = new MigrationRunner();

    try {
        switch (command) {
            case 'up':
                console.log('🚀 Running pending migrations...');
                await migrationRunner.runMigrations('up');
                break;

            case 'down':
                console.log('🔄 Rolling back last migration...');
                await migrationRunner.runMigrations('down');
                break;

            case 'status':
                await migrationRunner.getStatus();
                break;

            case 'create':
                const migrationName = args[1];
                if (!migrationName) {
                    console.error('❌ Migration name is required');
                    console.log('Usage: npm run db:migrate:create "migration_name"');
                    process.exit(1);
                }
                await migrationRunner.createMigration(migrationName);
                break;

            default:
                console.log('🚀 Running pending migrations... (default action)');
                await migrationRunner.runMigrations('up');
                break;
        }
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

main();
