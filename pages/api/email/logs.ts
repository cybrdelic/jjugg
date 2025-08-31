import { DB_PATH } from '@/lib/dbPath';
import sqlite3 from 'better-sqlite3';
import type { NextApiRequest, NextApiResponse } from 'next';

interface LogEntry {
  id: number;
  created_at: string;
  phase: string;
  status: string;
  uid: number | null;
  message_id: string | null;
  subject: string | null;
  class: string | null;
  vendor: string | null;
  detail: string | null;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
  const db = sqlite3(DB_PATH);
    const limit = Math.min(Number(req.query.limit) || 100, 500);
    const since = req.query.since ? String(req.query.since) : null; // ISO date filter
    let rows: LogEntry[] = [];
    if (since) {
      rows = db.prepare(`SELECT * FROM ingestion_log WHERE created_at >= ? ORDER BY id DESC LIMIT ?`).all(since, limit) as any;
    } else {
      rows = db.prepare(`SELECT * FROM ingestion_log ORDER BY id DESC LIMIT ?`).all(limit) as any;
    }
    res.status(200).json({ logs: rows });
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Failed to load logs' });
  }
}
