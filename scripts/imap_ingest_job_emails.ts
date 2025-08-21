import ImapFlow from 'imapflow';
import { simpleParser } from 'mailparser';
import sqlite3 from 'better-sqlite3';
import dotenv from 'dotenv';
dotenv.config();

const db = sqlite3('database/jjugg.db');

const IMAP_CONFIG = {
    host: process.env.IMAP_HOST,
    port: Number(process.env.IMAP_PORT || 993),
    secure: true,
    auth: {
        user: process.env.IMAP_USER,
        pass: process.env.IMAP_PASS
    }
};

const JOB_KEYWORDS = [
    'applied', 'interview', 'offer', 'rejection', 'application', 'thank you for applying',
    'schedule', 'greenhouse', 'lever', 'workday', 'your application', 'position', 'role', 'job', 'candidate'
];

async function ingestRecentJobEmails() {
    const client = new ImapFlow(IMAP_CONFIG);
    await client.connect();
    const mailbox = process.env.IMAP_MAILBOX || 'INBOX';
    await client.mailboxOpen(mailbox);

    // Only fetch emails from the last 30 days
    const sinceDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const searchCriteria = [
        'ALL',
        ['SINCE', sinceDate.toISOString().slice(0, 10)]
    ];
    const messages = await client.search(searchCriteria, { uid: true });

    for await (const msg of client.fetch(messages, { source: true, envelope: true })) {
        const parsed = await simpleParser(msg.source);
        const subject = parsed.subject || '';
        const body = parsed.text || '';
        // Only ingest if subject/body contains job keywords
        if (!JOB_KEYWORDS.some(k => subject.toLowerCase().includes(k) || body.toLowerCase().includes(k))) continue;

        // Insert if not already present
        try {
            db.prepare(`INSERT OR IGNORE INTO emails (message_id, date, subject, from_email, to_email, vendor, class, body, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
                .run(
                    parsed.messageId,
                    parsed.date ? parsed.date.toISOString() : new Date().toISOString(),
                    subject,
                    parsed.from?.text || '',
                    parsed.to?.text || '',
                    inferVendor(subject, body),
                    inferClass(subject, body),
                    body,
                    new Date().toISOString()
                );
        } catch (e) {
            // Ignore duplicate or bad inserts
        }
    }
    await client.logout();
    console.log('✅ IMAP ingest complete');
}

function inferVendor(subject: string, body: string): string {
    if (/greenhouse/i.test(subject + body)) return 'greenhouse';
    if (/lever/i.test(subject + body)) return 'lever';
    if (/workday/i.test(subject + body)) return 'workday';
    return '';
}
function inferClass(subject: string, body: string): string {
    if (/interview|schedule/i.test(subject + body)) return 'interview';
    if (/applied|application|thank you for applying/i.test(subject + body)) return 'applied';
    if (/offer/i.test(subject + body)) return 'offer';
    if (/reject|regret/i.test(subject + body)) return 'rejection';
    return '';
}

if (require.main === module) {
    ingestRecentJobEmails();
}
