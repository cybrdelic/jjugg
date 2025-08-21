import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../database/connection';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (process.env.NODE_ENV === 'production') return res.status(403).json({ error: 'Disabled in production' });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST' });
  const { sql, params } = req.body || {};
  if (!sql || typeof sql !== 'string') return res.status(400).json({ error: 'Missing sql' });
  try {
    const trimmed = sql.trim().toLowerCase();
    if (trimmed.startsWith('select') || trimmed.startsWith('pragma')) {
      const stmt = db.prepare(sql);
      const rows = Array.isArray(params) ? stmt.all(...params) : stmt.all();
      return res.status(200).json({ rows });
    } else {
      const stmt = db.prepare(sql);
      const info = Array.isArray(params) ? stmt.run(...params) : stmt.run();
      return res.status(200).json({ info });
    }
  } catch (e: any) {
    return res.status(400).json({ error: e?.message || 'Query failed' });
  }
}
