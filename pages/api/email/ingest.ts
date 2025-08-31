import type { NextApiRequest, NextApiResponse } from 'next';
import { runEmailIngestOnce } from '../../../scripts/email_ingest_daemon';

// Simple in-memory concurrency guard (per server instance)
let ingestRunning = false;
let lastStart: number | null = null;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
  if (ingestRunning) {
    return res.status(202).json({ success: true, message: 'Ingest already running', running: true, startedAt: lastStart });
  }
  ingestRunning = true;
  lastStart = Date.now();
  // Kick off without awaiting; capture completion to reset flag
  runEmailIngestOnce()
    .catch((err: unknown) => {
      console.error('[api/email/ingest] ingest error', err);
    })
    .finally(() => { ingestRunning = false; });
  res.status(202).json({ success: true, message: 'Ingest started', running: true, startedAt: lastStart });
}

export const config = { api: { bodyParser: false } };
