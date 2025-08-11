-- Migration: 20250811T120000_cleanup_legacy_tables.sql
-- Description: Drop legacy MVP and FTS tables

-- UP Migration
BEGIN TRANSACTION;
DROP TABLE IF EXISTS applications_mvp;
DROP TABLE IF EXISTS companies_mvp;
DROP TABLE IF EXISTS contacts_mvp;
DROP TABLE IF EXISTS emails_mvp;
DROP TABLE IF EXISTS interview_events_mvp;
DROP TABLE IF EXISTS draft_forms_mvp;
DROP TABLE IF EXISTS audit_logs_mvp;
DROP TABLE IF EXISTS job_postings;
DROP TABLE IF EXISTS applications_fts;
DROP TABLE IF EXISTS applications_fts_config;
DROP TABLE IF EXISTS applications_fts_data;
DROP TABLE IF EXISTS applications_fts_docsize;
DROP TABLE IF EXISTS applications_fts_idx;
COMMIT;

-- DOWN Migration
-- BEGIN TRANSACTION;
-- (Add CREATE TABLE statements here if you want to restore these tables)
-- COMMIT;
