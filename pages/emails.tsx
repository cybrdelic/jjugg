// Re-export the full ingest dashboard at /emails, replacing the legacy simplified page.
// Keeps single source of truth in email-ingest.tsx and satisfies request to "destroy" old page content.
import EmailIngestDashboard from './email-ingest';
export default EmailIngestDashboard;
