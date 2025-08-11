-- Migration: 20250810_create_emails_table.sql
-- Description: Add emails table for IMAP-ingested job application emails

CREATE TABLE IF NOT EXISTS emails (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message_id TEXT UNIQUE,
    date DATETIME NOT NULL,
    subject TEXT NOT NULL,
    from_email TEXT,
    to_email TEXT,
    vendor TEXT,
    class TEXT, -- e.g. applied, interview, rejection, etc
    body TEXT,
    application_id INTEGER, -- FK to applications if linked
    parsed BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_emails_date ON emails(date);
CREATE INDEX IF NOT EXISTS idx_emails_class ON emails(class);
CREATE INDEX IF NOT EXISTS idx_emails_application_id ON emails(application_id);
