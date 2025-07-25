#!/usr/bin/env node

import { createTables } from '../schema';
import { seedData } from '../seed';

const runSeed = async () => {
    try {
        console.log('🚀 Starting database setup and seeding...');

        // Create tables
        createTables();

        // Seed data
        seedData();

        console.log('🎉 Database setup and seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during database seeding:', error);
        process.exit(1);
    }
};

runSeed();
