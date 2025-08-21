import type { NextApiRequest, NextApiResponse } from 'next';
import sqlite3 from 'better-sqlite3';

// This endpoint returns recent parsed job application emails from the local SQLite DB
export default function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const db = sqlite3('database/jjugg.db');
        // You may need to adjust table/column names based on your ingest daemon
        const emails = db.prepare(`
            SELECT e.id, e.date, e.subject, e.class, e.vendor, e.application_id, c.name as company, a.position
            FROM emails e
            LEFT JOIN applications a ON e.application_id = a.id
            LEFT JOIN companies c ON a.company_id = c.id
            WHERE e.class IS NOT NULL
            ORDER BY e.date DESC
            LIMIT 50
        `).all();
        res.status(200).json({ emails });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: message });
    }
}
