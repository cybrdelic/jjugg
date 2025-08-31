-- UP Migration
BEGIN TRANSACTION;
ALTER TABLE emails ADD COLUMN raw_headers TEXT;
ALTER TABLE emails ADD COLUMN raw_html TEXT;
ALTER TABLE emails ADD COLUMN parsed_json TEXT;
ALTER TABLE emails ADD COLUMN parse_status TEXT DEFAULT 'pending';
ALTER TABLE emails ADD COLUMN parsed_at DATETIME;
ALTER TABLE emails ADD COLUMN openai_model TEXT;
ALTER TABLE emails ADD COLUMN uid INTEGER;
ALTER TABLE emails ADD COLUMN mailbox TEXT;
CREATE TABLE IF NOT EXISTS email_sync_state (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mailbox TEXT NOT NULL UNIQUE,
    last_uid INTEGER DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_emails_parse_status ON emails(parse_status);
CREATE INDEX IF NOT EXISTS idx_emails_uid ON emails(uid);
COMMIT;

-- DOWN Migration (commented out intentionally)
-- BEGIN TRANSACTION;
-- ALTER TABLE emails DROP COLUMN raw_headers;
-- ALTER TABLE emails DROP COLUMN raw_html;
-- ALTER TABLE emails DROP COLUMN parsed_json;
-- ALTER TABLE emails DROP COLUMN parse_status;
-- ALTER TABLE emails DROP COLUMN parsed_at;
-- ALTER TABLE emails DROP COLUMN openai_model;
-- ALTER TABLE emails DROP COLUMN uid;
-- ALTER TABLE emails DROP COLUMN mailbox;
-- DROP TABLE IF EXISTS email_sync_state;
-- COMMIT;
