#!/usr/bin/env node

import { MigrationRunner } from '../migrationRunner';
import { Command } from 'commander';

const program = new Command();
const migrationRunner = new MigrationRunner();

program
    .name('migrate')
    .description('Database migration tool for jjugg')
    .version('1.0.0');

program
    .command('create <name>')
    .description('Create a new migration file')
    .action(async (name: string) => {
        try {
            await migrationRunner.createMigration(name);
        } catch (error) {
            console.error('Error creating migration:', error);
            process.exit(1);
        }
    });

program
    .command('up')
    .description('Run pending migrations')
    .action(async () => {
        try {
            console.log('🚀 Running migrations...');
            await migrationRunner.runMigrations('up');
        } catch (error) {
            console.error('Error running migrations:', error);
            process.exit(1);
        }
    });

program
    .command('down')
    .description('Rollback the last migration')
    .action(async () => {
        try {
            console.log('🔄 Rolling back migrations...');
            await migrationRunner.runMigrations('down');
        } catch (error) {
            console.error('Error rolling back migrations:', error);
            process.exit(1);
        }
    });

program
    .command('status')
    .description('Show migration status')
    .action(async () => {
        try {
            await migrationRunner.getStatus();
        } catch (error) {
            console.error('Error getting migration status:', error);
            process.exit(1);
        }
    });

program.parse();
