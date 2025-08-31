import { DB_PATH } from '@/lib/dbPath';
import sqlite3 from 'better-sqlite3';
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST' && req.method !== 'DELETE') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
  try {
  const db = sqlite3(DB_PATH);
    const deletedEmails = db.prepare('DELETE FROM emails').run().changes;
    const deletedLogs = db.prepare('DELETE FROM ingestion_log').run().changes;
    db.prepare('UPDATE email_sync_state SET last_uid = 0, updated_at = CURRENT_TIMESTAMP').run();
    res.status(200).json({ success: true, deletedEmails, deletedLogs });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message || 'Failed to delete emails' });
  }
}

export const config = { api: { bodyParser: false } };
