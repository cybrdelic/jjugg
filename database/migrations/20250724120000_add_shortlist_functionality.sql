-- Migration: 20250724120000_add_shortlist_functionality
-- Description: Add shortlist functionality to applications table
-- Created: 2025-07-24T12:00:00.000Z

-- UP Migration
BEGIN TRANSACTION;

-- Add shortlist columns to applications table
ALTER TABLE applications ADD COLUMN is_shortlisted BOOLEAN DEFAULT FALSE;
ALTER TABLE applications ADD COLUMN shortlisted_at DATETIME;

-- Add location and remote columns if they don't exist
ALTER TABLE applications ADD COLUMN location TEXT DEFAULT '';
ALTER TABLE applications ADD COLUMN remote BOOLEAN DEFAULT FALSE;

-- Add bonus and benefits columns
ALTER TABLE applications ADD COLUMN bonus TEXT;
ALTER TABLE applications ADD COLUMN benefits TEXT; -- JSON string of benefits array

-- Create index for shortlisted applications for better performance
CREATE INDEX IF NOT EXISTS idx_applications_shortlisted ON applications(is_shortlisted) WHERE is_shortlisted = TRUE;

-- Create index for location filtering
CREATE INDEX IF NOT EXISTS idx_applications_location ON applications(location);

COMMIT;

-- DOWN Migration
-- BEGIN TRANSACTION;
-- DROP INDEX IF EXISTS idx_applications_shortlisted;
-- DROP INDEX IF EXISTS idx_applications_location;
-- ALTER TABLE applications DROP COLUMN is_shortlisted;
-- ALTER TABLE applications DROP COLUMN shortlisted_at;
-- ALTER TABLE applications DROP COLUMN location;
-- ALTER TABLE applications DROP COLUMN remote;
-- ALTER TABLE applications DROP COLUMN bonus;
-- ALTER TABLE applications DROP COLUMN benefits;
-- COMMIT;
