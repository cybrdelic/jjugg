-- Migration: 20250724120100_add_search_indexes
-- Description: Add full-text search indexes and search optimization
-- Created: 2025-07-24T12:01:00.000Z

-- UP Migration
BEGIN TRANSACTION;

-- Create full-text search virtual table for applications
CREATE VIRTUAL TABLE IF NOT EXISTS applications_fts USING fts5(
  application_id,
  position,
  company_name,
  job_description,
  notes,
  content='applications',
  content_rowid='id'
);

-- Populate the FTS table with existing data
INSERT INTO applications_fts(application_id, position, company_name, job_description, notes)
SELECT
  a.id,
  a.position,
  c.name,
  a.job_description,
  a.notes
FROM applications a
JOIN companies c ON a.company_id = c.id;

-- Create triggers to keep FTS table in sync
CREATE TRIGGER IF NOT EXISTS applications_fts_insert AFTER INSERT ON applications
BEGIN
  INSERT INTO applications_fts(application_id, position, company_name, job_description, notes)
  SELECT
    NEW.id,
    NEW.position,
    c.name,
    NEW.job_description,
    NEW.notes
  FROM companies c WHERE c.id = NEW.company_id;
END;

CREATE TRIGGER IF NOT EXISTS applications_fts_update AFTER UPDATE ON applications
BEGIN
  UPDATE applications_fts
  SET
    position = NEW.position,
    job_description = NEW.job_description,
    notes = NEW.notes
  WHERE application_id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS applications_fts_delete AFTER DELETE ON applications
BEGIN
  DELETE FROM applications_fts WHERE application_id = OLD.id;
END;

-- Create additional search-optimized indexes
CREATE INDEX IF NOT EXISTS idx_applications_stage_date ON applications(stage, date_applied DESC);
CREATE INDEX IF NOT EXISTS idx_applications_company_position ON applications(company_id, position);
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);

COMMIT;

-- DOWN Migration
-- BEGIN TRANSACTION;
-- DROP TRIGGER IF EXISTS applications_fts_insert;
-- DROP TRIGGER IF EXISTS applications_fts_update;
-- DROP TRIGGER IF EXISTS applications_fts_delete;
-- DROP TABLE IF EXISTS applications_fts;
-- DROP INDEX IF EXISTS idx_applications_stage_date;
-- DROP INDEX IF EXISTS idx_applications_company_position;
-- DROP INDEX IF EXISTS idx_companies_name;
-- COMMIT;
