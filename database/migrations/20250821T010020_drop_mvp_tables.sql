-- Migration: 20250821T010020_drop_mvp_tables
-- Description: Drop all tables ending with _mvp
-- Created: 2025-08-21T01:00:20.392Z

-- UP Migration
BEGIN TRANSACTION;
DROP TABLE IF EXISTS "applications_mvp";
DROP TABLE IF EXISTS "audit_logs_mvp";
DROP TABLE IF EXISTS "companies_mvp";
DROP TABLE IF EXISTS "contacts_mvp";
DROP TABLE IF EXISTS "draft_forms_mvp";
DROP TABLE IF EXISTS "emails_mvp";
DROP TABLE IF EXISTS "interview_events_mvp";
COMMIT;

-- DOWN Migration
-- NOTE: This migration drops *_mvp tables and is not reversible automatically.
-- Add CREATE TABLE statements here if you need to restore them.
