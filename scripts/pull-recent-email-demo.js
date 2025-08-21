// This demo script inserts a fake email into the emails table for testing
const sqlite3 = require('better-sqlite3');
const db = sqlite3('database/jjugg.db');

db.prepare(`INSERT INTO emails (
    message_id, date, subject, from_email, to_email, vendor, class, body, application_id, parsed
) VALUES (
    ?, datetime('now'), ?, ?, ?, ?, ?, ?, ?, ?
)`).run(
    'demo-message-id-001',
    'Demo Subject: Job Application Received',
    'hr@demo-company.com',
    'user@example.com',
    'DemoVendor',
    'applied',
    'Thank you for applying to Demo Company!',
    null,
    1
);

console.log('Inserted demo email into emails table.');
