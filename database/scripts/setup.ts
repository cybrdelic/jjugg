#!/usr/bin/env node

/**
 * Complete Database Setup Script
 *
 * This script will:
 * 1. Initialize the database
 * 2. Run all migrations
 * 3. Seed the database with sample data
 */

import { MigrationRunner } from '../migrationRunner';
import { createTables } from '../schema';

async function setupDatabase() {
    console.log('🔧 Setting up jjugg database...\n');

    try {
        // Step 1: Create base tables
        console.log('📝 Creating base database tables...');
        createTables();
        console.log('✅ Base tables created successfully!\n');

        // Step 2: Run migrations
        console.log('🚀 Running database migrations...');
        const migrationRunner = new MigrationRunner();
        await migrationRunner.runMigrations('up');
        console.log('✅ Migrations completed successfully!\n');

        // Step 3: Show migration status
        console.log('📊 Final migration status:');
        await migrationRunner.getStatus();

        console.log('\n🎉 Database setup completed successfully!');
        console.log('\n📚 Available commands:');
        console.log('  npm run db:migrate         - Run pending migrations');
        console.log('  npm run db:migrate:down    - Rollback last migration');
        console.log('  npm run db:migrate:status  - Show migration status');
        console.log('  npm run db:migrate:create "name" - Create new migration');
        console.log('  npm run db:seed            - Seed database with sample data');
        console.log('  npm run db:reset           - Reset and reseed database');

    } catch (error) {
        console.error('❌ Database setup failed:', error);
        process.exit(1);
    }
}

setupDatabase();
