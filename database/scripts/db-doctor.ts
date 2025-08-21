import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = process.env.JJUGG_DB_PATH || path.join(__dirname, '../jjugg.db');

type CheckResult = { ok: boolean; name: string; details?: string[] };

const argv = process.argv.slice(2);
const FIX = argv.includes('--fix');
const OPTIMIZE = argv.includes('--optimize');

function logSection(title: string) {
    console.log(`\n=== ${title} ===`);
}

function run(db: Database.Database, sql: string): any[] {
    try { return db.prepare(sql).all(); } catch (e) { return []; }
}

function integrityChecks(db: Database.Database): CheckResult[] {
    const out: CheckResult[] = [];
    logSection('Integrity checks');
    const quick = run(db, `PRAGMA quick_check`);
    const quickRes = quick?.[0]?.quick_check || quick?.[0]?.['quick_check'] || quick?.[0]?.integrity_check;
    if (quickRes === 'ok') {
        console.log('✅ PRAGMA quick_check: ok');
        out.push({ ok: true, name: 'quick_check' });
    } else {
        console.log('❌ PRAGMA quick_check reported issues');
        const full = run(db, `PRAGMA integrity_check`);
        const details = full.map((r: any) => r.integrity_check);
        details.slice(0, 20).forEach((d: string) => console.log(`  - ${d}`));
        out.push({ ok: false, name: 'integrity_check', details });
    }
    return out;
}

function ensureForeignKeysOn(db: Database.Database) {
    const fk = run(db, `PRAGMA foreign_keys`);
    const enabled = fk?.[0]?.foreign_keys === 1;
    if (!enabled) {
        db.pragma('foreign_keys = ON');
        console.log('⚠️ Enabled PRAGMA foreign_keys for this session (was OFF).');
    }
}

function foreignKeyChecks(db: Database.Database): CheckResult {
    logSection('Foreign key checks');
    ensureForeignKeysOn(db);
    const rows = run(db, `PRAGMA foreign_key_check`);
    if (!rows.length) {
        console.log('✅ No foreign key violations');
        return { ok: true, name: 'foreign_keys' };
    }
    const grouped: Record<string, number> = {};
    for (const r of rows) {
        const key = `${r.table} -> ${r.parent}`;
        grouped[key] = (grouped[key] || 0) + 1;
    }
    console.log('❌ Foreign key violations detected:');
    Object.entries(grouped).forEach(([k, v]) => console.log(`  - ${k}: ${v}`));
    console.log('↪ Suggested (review before running): for each child, delete or fix the offending rows.');
    return { ok: false, name: 'foreign_keys' };
}

function listTables(db: Database.Database): string[] {
    const rows = run(db, `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY 1`);
    return rows.map(r => r.name);
}

function expectedTablesCheck(db: Database.Database): CheckResult {
    logSection('Expected tables presence');
    const expected = ['users', 'companies', 'applications', 'interviews', 'activities', 'events', 'goals', 'contacts', 'migrations'];
    const present = new Set(listTables(db));
    const missing = expected.filter(t => !present.has(t));
    if (missing.length === 0) {
        console.log('✅ All expected tables present');
        return { ok: true, name: 'tables' };
    }
    console.log(`❌ Missing tables: ${missing.join(', ')}`);
    return { ok: false, name: 'tables', details: missing };
}

function indexExists(db: Database.Database, table: string, indexName: string): boolean {
    const rows = run(db, `PRAGMA index_list(${JSON.stringify(table)})`);
    return rows.some(r => r.name === indexName);
}

function createIndexIfMissing(db: Database.Database, table: string, col: string) {
    const idx = `idx_${table}_${col}`;
    if (indexExists(db, table, idx)) return false;
    db.exec(`CREATE INDEX IF NOT EXISTS ${idx} ON ${table}(${col})`);
    return true;
}

function fkIndexChecks(db: Database.Database): CheckResult {
    logSection('Foreign key index suggestions');
    const fkCols: Array<[string, string]> = [
        ['applications', 'user_id'],
        ['applications', 'company_id'],
        ['interviews', 'application_id'],
        ['activities', 'user_id'],
        ['activities', 'application_id'],
        ['events', 'user_id'],
        ['events', 'application_id'],
        ['goals', 'user_id'],
        ['contacts', 'user_id'],
        ['contacts', 'company_id'],
    ];
    let created = 0;
    let missingPairs: Array<[string, string]> = [];
    for (const [t, c] of fkCols) {
        try {
            const idx = `idx_${t}_${c}`;
            if (!indexExists(db, t, idx)) {
                missingPairs.push([t, c]);
                if (FIX) { if (createIndexIfMissing(db, t, c)) created++; }
            }
        } catch { }
    }
    // After attempted creation, recompute what remains missing
    let missing: string[] = [];
    if (FIX) {
        for (const [t, c] of missingPairs) {
            const idx = `idx_${t}_${c}`;
            if (!indexExists(db, t, idx)) missing.push(`${t}(${c})`);
        }
    } else {
        missing = missingPairs.map(([t, c]) => `${t}(${c})`);
    }

    if (!missing.length) {
        console.log('✅ FK indexes present');
        return { ok: true, name: 'fk_indexes' };
    }
    if (FIX) {
        console.log(`🛠️ Created ${created} missing FK index(es)`);
    } else {
        console.log(`⚠️ Missing FK indexes: ${missing.join(', ')}`);
    }
    return { ok: missing.length === 0, name: 'fk_indexes', details: missing };
}

function migrationsTableCheck(db: Database.Database): CheckResult {
    logSection('Migrations table');
    const info = run(db, `PRAGMA table_info(migrations)`);
    if (!info.length) {
        console.log('⚠️ No migrations table found.');
        return { ok: false, name: 'migrations', details: ['missing table'] };
    }
    const cols = new Set(info.map((c: any) => c.name));
    const missing = ['id', 'migration_id', 'checksum', 'executed_at'].filter(n => !cols.has(n));
    if (missing.length) {
        console.log(`❌ migrations missing columns: ${missing.join(', ')}`);
        if (FIX && missing.includes('checksum')) {
            db.exec(`ALTER TABLE migrations ADD COLUMN checksum TEXT`);
            console.log('🛠️ Added migrations.checksum column');
        }
    } else {
        console.log('✅ migrations columns OK');
    }
    const dups = run(db, `SELECT migration_id, COUNT(*) c FROM migrations GROUP BY migration_id HAVING c>1`);
    if (dups.length) {
        console.log('❌ Duplicate migration_id rows:');
        dups.forEach(d => console.log(`  - ${d.migration_id} (${d.c})`));
    }
    if (FIX) {
        db.exec(`UPDATE migrations SET executed_at = COALESCE(executed_at, strftime('%Y-%m-%dT%H:%M:%fZ','now'))`);
    }
    return { ok: missing.length === 0 && dups.length === 0, name: 'migrations' };
}

function enumValueChecks(db: Database.Database): CheckResult[] {
    logSection('Enum/check constraint value audits');
    const checks: Array<{ table: string, col: string, allowed: string[] }> = [
        { table: 'applications', col: 'stage', allowed: ['applied', 'screening', 'interview', 'offer', 'rejected'] },
        { table: 'interviews', col: 'type', allowed: ['phone', 'video', 'onsite', 'technical', 'behavioral'] },
        { table: 'interviews', col: 'outcome', allowed: ['pending', 'passed', 'failed', 'cancelled'] },
        { table: 'activities', col: 'type', allowed: ['application', 'interview', 'network', 'follow_up', 'offer', 'rejection'] },
        { table: 'activities', col: 'priority', allowed: ['low', 'medium', 'high'] },
        { table: 'activities', col: 'status', allowed: ['pending', 'completed', 'cancelled'] },
        { table: 'events', col: 'event_type', allowed: ['interview', 'follow_up', 'deadline', 'networking', 'other'] },
        { table: 'goals', col: 'category', allowed: ['applications', 'interviews', 'networking', 'skills', 'other'] },
    ];
    const results: CheckResult[] = [];
    for (const ch of checks) {
        try {
            const rows = run(db, `SELECT ${ch.col} AS v, COUNT(*) c FROM ${ch.table} WHERE ${ch.col} NOT IN (${ch.allowed.map(a => `'${a}'`).join(',')}) AND ${ch.col} IS NOT NULL GROUP BY ${ch.col}`);
            if (!rows.length) {
                console.log(`✅ ${ch.table}.${ch.col}: all values valid`);
                results.push({ ok: true, name: `${ch.table}.${ch.col}` });
            } else {
                console.log(`❌ ${ch.table}.${ch.col}: invalid values`);
                rows.forEach(r => console.log(`  - '${r.v}': ${r.c}`));
                results.push({ ok: false, name: `${ch.table}.${ch.col}` });
            }
        } catch { }
    }
    return results;
}

function booleanNormalize(db: Database.Database): CheckResult[] {
    logSection('Boolean normalization');
    const bools: Array<[string, string]> = [
        ['applications', 'remote'],
        ['applications', 'is_shortlisted'],
        ['events', 'is_completed'],
        ['goals', 'is_completed'],
    ];
    const results: CheckResult[] = [];
    for (const [t, c] of bools) {
        try {
            const texty = run(db, `SELECT COUNT(*) n FROM ${t} WHERE LOWER(${c}) IN ('true','false')`)[0]?.n || 0;
            const nulls = run(db, `SELECT COUNT(*) n FROM ${t} WHERE ${c} IS NULL`)[0]?.n || 0;
            if (texty || nulls) {
                console.log(`⚠️ ${t}.${c}: ${texty} text booleans, ${nulls} NULLs`);
                if (FIX) {
                    db.exec(`UPDATE ${t} SET ${c}=CASE LOWER(${c}) WHEN 'true' THEN 1 WHEN 'false' THEN 0 ELSE ${c} END`);
                    db.exec(`UPDATE ${t} SET ${c}=COALESCE(${c},0)`);
                    console.log(`🛠️ ${t}.${c}: normalized`);
                }
                results.push({ ok: false, name: `${t}.${c}` });
            } else {
                console.log(`✅ ${t}.${c}: normalized`);
                results.push({ ok: true, name: `${t}.${c}` });
            }
        } catch { }
    }
    return results;
}

function usersEmailUniqueness(db: Database.Database): CheckResult {
    logSection('Users.email uniqueness');
    const dups = run(db, `SELECT email, COUNT(*) c FROM users WHERE email IS NOT NULL GROUP BY email HAVING c>1`);
    if (!dups.length) {
        console.log('✅ No duplicate emails');
        return { ok: true, name: 'users.email.duplicates' };
    }
    console.log('❌ Duplicate emails:');
    dups.slice(0, 20).forEach(d => console.log(`  - ${d.email}: ${d.c}`));
    console.log('↪ Resolve duplicates before enforcing UNIQUE index.');
    return { ok: false, name: 'users.email.duplicates' };
}

function maintenance(db: Database.Database) {
    if (!OPTIMIZE) return;
    logSection('Maintenance');
    try { db.exec('PRAGMA optimize'); console.log('✅ optimize'); } catch { }
    try { db.exec('ANALYZE'); console.log('✅ analyze'); } catch { }
    try { db.exec('VACUUM'); console.log('✅ vacuum'); } catch { }
}

function main() {
    const db = new Database(DB_PATH);
    console.log(`🔧 DB Doctor on ${DB_PATH}  (fix=${FIX}, optimize=${OPTIMIZE})`);
    const results: CheckResult[] = [];
    results.push(...integrityChecks(db));
    results.push(foreignKeyChecks(db));
    results.push(expectedTablesCheck(db));
    results.push(fkIndexChecks(db));
    results.push(migrationsTableCheck(db));
    results.push(usersEmailUniqueness(db));
    results.push(...enumValueChecks(db));
    results.push(...booleanNormalize(db));
    maintenance(db);
    db.close();

    const failed = results.filter(r => !r.ok).map(r => r.name);
    console.log('\n=== Summary ===');
    if (failed.length) {
        console.log(`❌ Issues in: ${failed.join(', ')}`);
        if (!FIX) console.log('Tip: run with --fix for safe auto-remediations (indexes, booleans, migrations.executed_at).');
    } else {
        console.log('✅ No issues detected by doctor.');
    }
}

main();
