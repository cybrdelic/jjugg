import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = process.env.JJUGG_DB_PATH || path.join(__dirname, '../jjugg.db');

function getAffinity(type) {
    const t = (type || '').trim().toUpperCase();
    if (t.includes('INT')) return 'INTEGER';
    if (t.includes('CHAR') || t.includes('CLOB') || t.includes('TEXT')) return 'TEXT';
    if (t.includes('BLOB') || t === '') return 'BLOB';
    if (t.includes('REAL') || t.includes('FLOA') || t.includes('DOUB')) return 'REAL';
    return 'NUMERIC';
}

function isImplicitNotNull(col) {
    return col.pk > 0 || !!col.notnull;
}

function ensureMigrationsTableColumns() {
    const db = new Database(DB_PATH);
    type MigrationCol = { name: string; type: string; pk: number; notnull: number };
    const info = db.prepare("PRAGMA table_info(migrations)").all() as MigrationCol[];
    const columns = info.map((col: MigrationCol) => col.name);
    // Canonical schema: Option B (keep id)
    const requiredSchema = [
        { name: 'id', affinity: 'INTEGER', pk: true, notnull: true },
        { name: 'migration_id', affinity: 'TEXT', pk: false, notnull: true },
        { name: 'checksum', affinity: 'TEXT', pk: false, notnull: true },
        { name: 'executed_at', affinity: 'TEXT', pk: false, notnull: true }
    ];
    const missing = requiredSchema.filter(col => !columns.includes(col.name)).map(col => col.name);
    const extra = columns.filter(col => !requiredSchema.some(r => r.name === col));
    console.log('--- Columns for table: migrations ---');
    info.forEach((col: MigrationCol) => {
        console.log(`  ${col.name} (${col.type})${col.pk ? ' PRIMARY KEY' : ''}${isImplicitNotNull(col) ? ' NOT NULL' : ''}`);
    });

    // Check for missing columns
    if (missing.length === 0) {
        console.log('✅ All required columns are present in table: migrations.');
    } else {
        console.log(`❌ Table 'migrations' is missing columns: ${missing.join(', ')}`);
        if (missing.includes('checksum')) {
            console.log("Adding missing 'checksum' column to table: migrations...");
            db.exec('ALTER TABLE migrations ADD COLUMN checksum TEXT');
            console.log("✅ Added 'checksum' column to table: migrations.");
        }
        // You can add more auto-fixes for other columns here if needed
    }

    // Check for type/constraint mismatches
    let mismatch = false;
    requiredSchema.forEach(req => {
        const col = info.find((c: MigrationCol) => c.name === req.name);
        if (!col) return;
        let problems: string[] = [];
        if (getAffinity(col.type) !== req.affinity) {
            problems.push(`Type affinity mismatch in table 'migrations': column '${req.name}' is ${col.type} (affinity ${getAffinity(col.type)}), but should be ${req.affinity}. This can cause issues with value encoding and migration runner compatibili`);
        }
        if (!!col.pk !== !!req.pk) {
            problems.push(`PRIMARY KEY mismatch in table 'migrations': column '${req.name}'${col.pk ? ' is' : ' is not'} PRIMARY KEY, but should${req.pk ? '' : ' not'} be. This affects uniqueness and migration tracking.`);
        }
        if (isImplicitNotNull(col) !== !!req.notnull) {
            problems.push(`NOT NULL mismatch in table 'migrations': column '${req.name}'${isImplicitNotNull(col) ? ' is' : ' is not'} marked NOT NULL, but should${req.notnull ? '' : ' not'} be. This can cause migration runner failures or allow invalid data.`);
        }
        if (problems.length) {
            mismatch = true;
            problems.forEach(msg => {
                console.log(`❌ ${msg}`);
            });
        }
    });

    if (extra.length) {
        console.log(`⚠️ Extra columns detected in table 'migrations': ${extra.join(', ')}. These will be dropped if you rebuild the table.`);
    }

    if (mismatch || extra.length) {
        console.log("\n⚠️ Detected type/constraint mismatches or extra columns in table: migrations. SQLite cannot alter column types/constraints directly.");
        console.log("To fix table 'migrations', run the following SQL steps manually:");
        console.log('--- SQL Migration Steps for table: migrations ---');
        console.log(`PRAGMA foreign_keys = OFF;\nBEGIN IMMEDIATE;\n\nUPDATE migrations\nSET executed_at = COALESCE(executed_at, strftime('%Y-%m-%dT%H:%M:%fZ','now'));\n\nWITH dups AS (\n  SELECT migration_id FROM migrations GROUP BY migration_id HAVING COUNT(*) > 1\n)\nSELECT CASE WHEN EXISTS(SELECT 1 FROM dups) THEN\n  RAISE(ABORT, 'duplicate migration_id(s) exist; resolve before rebuild')\nEND;\n\nCREATE TABLE migrations_new (\n  id           INTEGER PRIMARY KEY,\n  migration_id TEXT NOT NULL UNIQUE,\n  checksum     TEXT NOT NULL,\n  executed_at  TEXT NOT NULL\n);\n\nINSERT INTO migrations_new (id, migration_id, checksum, executed_at)\nSELECT\n  id,\n  migration_id,\n  COALESCE(checksum, ''),\n  CASE\n    WHEN typeof(executed_at) IN ('text','null') THEN executed_at\n    ELSE strftime('%Y-%m-%dT%H:%M:%fZ', executed_at)\n  END\nFROM migrations;\n\nDROP TABLE migrations;\nALTER TABLE migrations_new RENAME TO migrations;\n\nCOMMIT;\nPRAGMA foreign_keys = ON;`);
        console.log('--- End SQL Migration Steps for table: migrations ---');
    } else {
        console.log("✅ No type/constraint mismatches detected in table: migrations.");
    }
    db.close();
}

function main() {
    ensureMigrationsTableColumns();
    console.log('✅ Migrations table pre-check complete.');
}

main();
