PRAGMA foreign_keys = OFF;
BEGIN IMMEDIATE;

UPDATE migrations
SET executed_at = COALESCE(executed_at, strftime('%Y-%m-%dT%H:%M:%fZ','now'));

-- Check for duplicate migration_id manually before running this script!
-- SELECT migration_id, COUNT(*) AS c FROM migrations GROUP BY migration_id HAVING c > 1;

CREATE TABLE migrations_new (
  id           INTEGER PRIMARY KEY,
  migration_id TEXT NOT NULL UNIQUE,
  checksum     TEXT NOT NULL,
  executed_at  TEXT NOT NULL
);

INSERT INTO migrations_new (id, migration_id, checksum, executed_at)
SELECT
  id,
  migration_id,
  COALESCE(checksum, ''),
  CASE
    WHEN typeof(executed_at) IN ('text','null') THEN executed_at
    ELSE strftime('%Y-%m-%dT%H:%M:%fZ', executed_at)
  END
FROM migrations;

DROP TABLE migrations;
ALTER TABLE migrations_new RENAME TO migrations;

COMMIT;
PRAGMA foreign_keys = ON;
