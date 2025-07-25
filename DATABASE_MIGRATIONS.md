# Database Migration System

This project includes a robust database migration system to handle schema changes safely and consistently.

## Quick Start

### Initial Setup
```bash
# Set up the database for the first time
npm run db:setup
```

### Running Migrations
```bash
# Run all pending migrations
npm run db:migrate

# Check migration status
npm run db:migrate:status

# Rollback the last migration
npm run db:migrate:down
```

### Creating New Migrations
```bash
# Create a new migration file
npm run db:migrate:create "add_user_preferences"
```

## Migration Commands

| Command | Description |
|---------|-------------|
| `npm run db:setup` | Initial database setup (tables + migrations) |
| `npm run db:migrate` | Run all pending migrations |
| `npm run db:migrate:down` | Rollback the last migration |
| `npm run db:migrate:status` | Show migration status |
| `npm run db:migrate:create "name"` | Create a new migration file |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:reset` | Reset and reseed database |

## Migration Files

Migration files are stored in `/database/migrations/` and follow this naming convention:
```
YYYYMMDDHHMMSS_migration_name.sql
```

### Migration File Structure

```sql
-- Migration: 20250724120000_add_shortlist_functionality
-- Description: Add shortlist functionality to applications table
-- Created: 2025-07-24T12:00:00.000Z

-- UP Migration
BEGIN TRANSACTION;

-- Your schema changes here
ALTER TABLE applications ADD COLUMN is_shortlisted BOOLEAN DEFAULT FALSE;
ALTER TABLE applications ADD COLUMN shortlisted_at DATETIME;

COMMIT;

-- DOWN Migration
-- BEGIN TRANSACTION;
-- -- Rollback commands here (commented out for safety)
-- ALTER TABLE applications DROP COLUMN is_shortlisted;
-- ALTER TABLE applications DROP COLUMN shortlisted_at;
-- COMMIT;
```

## Current Migrations

### 20250724120000_add_shortlist_functionality
- Adds shortlist functionality to applications
- Adds location, remote, bonus, and benefits columns
- Creates indexes for better performance

### 20250724120100_add_search_indexes
- Creates full-text search capabilities
- Adds FTS virtual table for applications
- Creates triggers to keep search index in sync
- Adds performance indexes

## Best Practices

### 1. Always Test Migrations
```bash
# Check status before migrating
npm run db:migrate:status

# Run migrations
npm run db:migrate

# Verify the changes
npm run db:migrate:status
```

### 2. Writing Safe Migrations
- Always use transactions
- Add `IF NOT EXISTS` clauses where appropriate
- Provide meaningful rollback instructions
- Test both UP and DOWN migrations

### 3. Schema Changes
- Add new columns with DEFAULT values
- Use separate migrations for complex changes
- Consider performance impact of new indexes

### 4. Rollback Strategy
- Comment out DOWN migrations for safety
- Test rollbacks in development first
- Document any data loss implications

## Migration Tracking

The system tracks executed migrations in the `migrations` table:

```sql
CREATE TABLE migrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  migration_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Troubleshooting

### Migration Failed
1. Check the error message in the console
2. Verify the SQL syntax in your migration file
3. Ensure the database is not locked by another process
4. Check that all referenced tables/columns exist

### Migration Status Issues
```bash
# Reset migration tracking (DANGEROUS - use carefully)
npm run db:migrate:status

# If migrations table is corrupted, you may need to recreate it
# Contact the development team before doing this
```

### Starting Fresh
```bash
# Complete database reset
rm database/jjugg.db
npm run db:setup
npm run db:seed
```

## Development Workflow

1. **Planning**: Plan your schema changes
2. **Create**: `npm run db:migrate:create "descriptive_name"`
3. **Write**: Edit the generated migration file
4. **Test**: Run migration on development database
5. **Verify**: Check that the change works as expected
6. **Commit**: Commit the migration file to version control
7. **Deploy**: Run migrations on staging/production

## Advanced Usage

### Manual Migration Management

If you need to manually manage migrations, you can use the MigrationRunner class directly:

```typescript
import { MigrationRunner } from './database/migrationRunner';

const runner = new MigrationRunner();

// Create migration
await runner.createMigration('my_migration');

// Run migrations
await runner.runMigrations('up');

// Get status
await runner.getStatus();
```

### Search Integration

The system includes full-text search capabilities:

```sql
-- Search applications
SELECT * FROM applications_fts
WHERE applications_fts MATCH 'software engineer';

-- Search with ranking
SELECT a.*, rank
FROM applications a
JOIN (
  SELECT application_id, rank
  FROM applications_fts
  WHERE applications_fts MATCH 'javascript'
) fts ON a.id = fts.application_id
ORDER BY fts.rank;
```
