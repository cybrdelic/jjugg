-- Migration: 20250810_create_email_config_table.sql
-- Description: Add email_config table for IMAP credentials

CREATE TABLE IF NOT EXISTS email_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    host TEXT NOT NULL,
    port INTEGER NOT NULL,
    secure BOOLEAN NOT NULL,
    user TEXT NOT NULL,
    password TEXT NOT NULL,
    mailbox TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Only one config row is expected; use id=1
