-- migration_id: 20250820T230000_create_email_config_table
-- description: Create table to persist IMAP/Email configuration

BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS email_config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  host TEXT NOT NULL,
  port INTEGER NOT NULL DEFAULT 993,
  secure INTEGER NOT NULL DEFAULT 1, -- 1=true, 0=false
  user TEXT NOT NULL,
  password TEXT NOT NULL,
  mailbox TEXT NOT NULL DEFAULT 'INBOX',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

COMMIT;
