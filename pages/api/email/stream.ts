import { DB_PATH } from '@/lib/dbPath';
import sqlite3 from 'better-sqlite3';
import type { NextApiRequest, NextApiResponse } from 'next';

// Simple Server-Sent Events stream for ingestion_log tail.
// Polls the DB every second for new rows (id greater than last sent).
// Not intended for high scale; dev/observability use.

export const config = { api: { bodyParser: false } };

interface LogRow {
  id: number; created_at: string; phase: string; status: string; uid: number | null; message_id: string | null; subject: string | null; class: string | null; vendor: string | null; detail: string | null;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).end();
    return;
  }
  const db = sqlite3(DB_PATH);
  const initial = Math.min(Number(req.query.initial) || 120, 500);
  let lastId = 0;

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no'
  });

  const send = (event: string, data: any) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // Send initial tail (descending -> reverse for chronological append)
  try {
    const rows = db.prepare('SELECT * FROM ingestion_log ORDER BY id DESC LIMIT ?').all(initial) as LogRow[];
    const ordered = rows.sort((a,b)=>a.id - b.id);
    if (ordered.length) {
      lastId = ordered[ordered.length - 1].id;
      send('init', ordered);
    }
  } catch (e) {
    send('error', { message: (e as Error).message });
  }

  // Heartbeat to keep connection alive
  const heartbeat = setInterval(() => { res.write(':hb\n\n'); }, 25000);

  const interval = setInterval(() => {
    try {
      const rows = db.prepare('SELECT * FROM ingestion_log WHERE id > ? ORDER BY id ASC LIMIT 500').all(lastId) as LogRow[];
      if (rows.length) {
        lastId = rows[rows.length - 1].id;
        send('append', rows);
      }
    } catch (e) {
      send('error', { message: (e as Error).message });
    }
  }, 1000);

  req.on('close', () => {
    clearInterval(interval);
    clearInterval(heartbeat);
    res.end();
  });
}
