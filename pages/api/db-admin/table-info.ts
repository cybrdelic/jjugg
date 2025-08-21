import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../database/connection';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (process.env.NODE_ENV === 'production') return res.status(403).json({ error: 'Disabled in production' });
  const { table } = req.query;
  if (!table || typeof table !== 'string') return res.status(400).json({ error: 'Missing table' });
  try {
    const pragma = db.prepare(`PRAGMA table_info(${table})`).all();
    const fkeys = db.prepare(`PRAGMA foreign_key_list(${table})`).all();
    const indexes = db.prepare("SELECT name, sql FROM sqlite_master WHERE type='index' AND tbl_name=? ORDER BY name").all(table);
    res.status(200).json({ pragma, fkeys, indexes });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Unknown error' });
  }
}
