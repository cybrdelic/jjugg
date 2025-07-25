#!/usr/bin/env node

import { dropTables } from '../schema';

const runUnseed = async () => {
    try {
        console.log('🗑️ Starting database cleanup...');

        // Drop all tables
        dropTables();

        console.log('✅ Database cleanup completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during database cleanup:', error);
        process.exit(1);
    }
};

runUnseed();
