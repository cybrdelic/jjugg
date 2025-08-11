-- Migration: 20250811T114804_create_emails_table
-- Description: create_emails_table
-- Created: 2025-08-11T11:48:04.848Z


-- UP
BEGIN TRANSACTION;
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
	updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_emails_date ON emails(date);
CREATE INDEX IF NOT EXISTS idx_emails_class ON emails(class);
CREATE INDEX IF NOT EXISTS idx_emails_application_id ON emails(application_id);
COMMIT;

-- DOWN Migration

-- DOWN Migration
-- DOWN
BEGIN TRANSACTION;
DROP TABLE IF EXISTS emails;
COMMIT;
