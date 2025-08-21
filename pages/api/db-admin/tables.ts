import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../database/connection';

function isProd() {
  return process.env.NODE_ENV === 'production';
}

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  if (isProd()) return res.status(403).json({ error: 'Disabled in production' });
  try {
    const stmt = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
    );
    const rows = stmt.all() as { name: string }[];
    res.status(200).json({ tables: rows.map(r => r.name) });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Unknown error' });
  }
}
