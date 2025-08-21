import type { NextApiRequest, NextApiResponse } from 'next';
import sqlite3 from 'better-sqlite3';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const db = sqlite3('database/jjugg.db');
        const rows = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name`).all();
        const tables: any[] = [];
        for (const row of rows as any[]) {
            const table = (row as any).name;
            const info = db.prepare(`PRAGMA table_info(${table})`).all();
            tables.push({
                name: table,
                columns: info.map((col: any) => ({
                    name: col.name,
                    type: col.type,
                    pk: !!col.pk,
                    notnull: !!col.notnull
                }))
            });
        }
        res.status(200).json({ tables });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}
