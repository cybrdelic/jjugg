import { DB_PATH } from '@/lib/dbPath';
import sqlite3 from 'better-sqlite3';
import type { NextApiRequest, NextApiResponse } from 'next';

/*
  Returns list of skipped non‑relevant email log entries (from ingestion_log) for the latest run.
  We do not persist full email bodies for skipped items, only subject + classification reason in the log.
*/
export default function handler(req: NextApiRequest, res: NextApiResponse){
  try {
    const limit = Math.min(Number(req.query.limit || 200), 1000);
    const db = sqlite3(DB_PATH);
    // Get latest run start timestamp
    const runStart = db.prepare(`SELECT created_at FROM ingestion_log WHERE phase='run' AND status='start' ORDER BY id DESC LIMIT 1`).get() as any;
    let rows: any[] = [];
    if (runStart) {
      rows = db.prepare(`SELECT id, created_at, uid, subject, detail FROM ingestion_log WHERE phase='fetch' AND status='skip_non_relevant' AND created_at >= ? ORDER BY id DESC LIMIT ?`).all(runStart.created_at, limit) as any[];
    } else {
      rows = db.prepare(`SELECT id, created_at, uid, subject, detail FROM ingestion_log WHERE phase='fetch' AND status='skip_non_relevant' ORDER BY id DESC LIMIT ?`).all(limit) as any[];
    }
    res.status(200).json({ success:true, count: rows.length, skipped: rows });
  } catch (e:any) {
    res.status(500).json({ success:false, error: e.message || 'Failed to load skipped emails' });
  }
}
