import path from 'path';

// Single source of truth for SQLite DB path so scripts and API routes use identical file.
// Using process.cwd() keeps alignment whether invoked via next dev or build.
export const DB_PATH = path.join(process.cwd(), 'database', 'jjugg.db');
