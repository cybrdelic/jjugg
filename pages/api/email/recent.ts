import { DB_PATH } from '@/lib/dbPath';
import sqlite3 from 'better-sqlite3';
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
    const db = sqlite3(DB_PATH);
        // Detect columns (legacy DBs may miss parse_status)
        const cols = db.prepare('PRAGMA table_info(emails)').all() as { name: string }[];
        const hasParse = cols.some(c => c.name === 'parse_status');
        const hasParsedJson = cols.some(c => c.name === 'parsed_json');
        const hasParsedAt = cols.some(c => c.name === 'parsed_at');
        const hasOpenAIModel = cols.some(c => c.name === 'openai_model');

        const limit = Math.min(Number(req.query.limit) || 100, 500);
        const status = (req.query.status as string | undefined)?.toLowerCase();
        const where: string[] = [];
        if (hasParse && (status === 'pending' || status === 'parsed' || status === 'error')) {
            where.push(`e.parse_status = '${status}'`);
        }
        const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';
        const selectCols = [
            'e.id','e.date','e.subject','e.class','e.vendor','e.application_id'
        ];
        if (hasParse) selectCols.push('e.parse_status'); else selectCols.push("'' as parse_status");
        if (hasParsedAt) selectCols.push('e.parsed_at'); else selectCols.push("NULL as parsed_at");
        if (hasOpenAIModel) selectCols.push('e.openai_model'); else selectCols.push("NULL as openai_model");
        if (hasParsedJson) selectCols.push('e.parsed_json'); else selectCols.push("NULL as parsed_json");
        selectCols.push('c.name as company','a.position');

        const sql = `SELECT ${selectCols.join(', ')}
            FROM emails e
            LEFT JOIN applications a ON e.application_id = a.id
            LEFT JOIN companies c ON a.company_id = c.id
            ${whereClause}
            ORDER BY e.date DESC
            LIMIT ?`;

        const emails = db.prepare(sql).all(limit).map((row: any) => ({
            ...row,
            parsed_json: (() => { try { return row.parsed_json ? JSON.parse(row.parsed_json) : null; } catch { return null; } })()
        }));
        res.status(200).json({ emails });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: message });
    }
}
