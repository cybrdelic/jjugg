import type { NextApiRequest, NextApiResponse } from 'next';
import sqlite3 from 'better-sqlite3';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const { table } = req.query;
    if (!table || typeof table !== 'string') {
        res.status(400).json({ error: 'Missing or invalid table name' });
        return;
    }
    try {
        const db = sqlite3('database/jjugg.db');
        const rows = db.prepare(`SELECT * FROM ${table} LIMIT 20`).all();
        res.status(200).json({ rows });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}
