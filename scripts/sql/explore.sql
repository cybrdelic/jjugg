-- SQLite exploration bootstrap for jjugg
.headers on
.mode box
.timer on
.nullvalue NULL

-- Attach helpers for JSON preview
-- Use: SELECT id, json_extract(tech_stack,'$') AS tech FROM applications LIMIT 5;

-- Show basic info on open
.print '\n=== Database Info ==='
.databases
.print '\n=== Tables ==='
.tables

-- Handy views (create if not exists)
CREATE VIEW IF NOT EXISTS v_table_counts AS
SELECT name AS table_name,
       (SELECT COUNT(*) FROM sqlite_master sm
        WHERE sm.type = 'index' AND sm.tbl_name = m.name) AS index_count,
       (
         CASE WHEN name IN ('sqlite_sequence','migrations') THEN NULL
         ELSE (
            -- Try count, ignore errors for views/virtual tables
            (SELECT COUNT(*) FROM (
              SELECT 1 FROM (
                SELECT * FROM (
                  SELECT name FROM sqlite_master WHERE name = m.name
                )
              ) LIMIT 0
            ))
         END
       ) AS approx_rows
FROM sqlite_master m
WHERE m.type = 'table'
ORDER BY table_name;

-- Migrations quick peek
CREATE VIEW IF NOT EXISTS v_migrations AS
SELECT migration_id, name, executed_at
FROM migrations
ORDER BY executed_at DESC;

.print '\nTip: common commands'
.print '  .schema                # show schema'
.print '  .schema <table>        # table schema'
.print '  SELECT * FROM v_migrations LIMIT 20;'
.print '  SELECT * FROM v_table_counts;'
.print '  PRAGMA table_info(<table>);'
.print '  PRAGMA foreign_key_list(<table>);'

-- Default to main schema view
-- .schema
