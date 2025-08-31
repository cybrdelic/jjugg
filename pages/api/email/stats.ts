import { DB_PATH } from '@/lib/dbPath';
import sqlite3 from 'better-sqlite3';
import type { NextApiRequest, NextApiResponse } from 'next';

interface EmailStatsResponse {
  success: boolean;
  counts: { total: number; parsed: number; pending: number; error: number };
  lastParsedAt: string | null;
  lastEmailDate: string | null;
  lastUid: number | null;
  vendors: Array<{ vendor: string; count: number }>;
  classes: Array<{ class: string; count: number }>;
  cost?: { total_usd: number; avg_per_email_usd: number; total_tokens: number };
  run?: any;
}

export default function handler(req: NextApiRequest, res: NextApiResponse<EmailStatsResponse | { success: false; error: string }>) {
  try {
  const db = sqlite3(DB_PATH);
    const cols = db.prepare('PRAGMA table_info(emails)').all() as { name: string }[];
    const hasParse = cols.some(c => c.name === 'parse_status');
    const countsRow = db.prepare(`SELECT
        COUNT(*) as total,
        ${hasParse ? "SUM(CASE WHEN parse_status='parsed' THEN 1 ELSE 0 END)" : '0'} as parsed,
        ${hasParse ? "SUM(CASE WHEN parse_status='pending' THEN 1 ELSE 0 END)" : '0'} as pending,
        ${hasParse ? "SUM(CASE WHEN parse_status='error' THEN 1 ELSE 0 END)" : '0'} as error
      FROM emails`).get() as any;
    const lastParsed = db.prepare(`SELECT parsed_at FROM emails WHERE parsed_at IS NOT NULL ORDER BY parsed_at DESC LIMIT 1`).get() as any;
    const lastDate = db.prepare(`SELECT date FROM emails ORDER BY date DESC LIMIT 1`).get() as any;
    const sync = db.prepare(`SELECT last_uid FROM email_sync_state ORDER BY updated_at DESC LIMIT 1`).get() as any;
    const vendors = db.prepare(`SELECT vendor, COUNT(*) as count FROM emails WHERE vendor IS NOT NULL AND vendor <> '' GROUP BY vendor ORDER BY count DESC LIMIT 10`).all() as any[];
    const classes = db.prepare(`SELECT class, COUNT(*) as count FROM emails WHERE class IS NOT NULL AND class <> '' GROUP BY class ORDER BY count DESC`).all() as any[];
    // Cost aggregation if columns exist
    const hasCost = cols.some(c => c.name === 'openai_cost_usd');
    let costSummary = { total_usd: 0, avg_per_email_usd: 0, total_tokens: 0 };
    if (hasCost) {
      const c = db.prepare(`SELECT SUM(openai_cost_usd) as total_usd, SUM(openai_total_tokens) as total_tokens, COUNT(*) as parsed_count FROM emails WHERE parse_status='parsed'`).get() as any;
      const parsedCount = c?.parsed_count || 0;
      costSummary.total_usd = Number((c?.total_usd || 0).toFixed(6));
      costSummary.total_tokens = c?.total_tokens || 0;
      costSummary.avg_per_email_usd = parsedCount ? Number((costSummary.total_usd / parsedCount).toFixed(6)) : 0;
      // Fallback: if total still zero, try openai_call_log aggregation (in case per-email columns not yet updated)
      if (costSummary.total_usd === 0) {
        try {
          const row = db.prepare(`SELECT SUM(cost_usd) as total_usd, SUM(total_tokens) as total_tokens, COUNT(DISTINCT email_id) as email_count FROM openai_call_log`).get() as any;
          if (row && row.total_usd) {
            costSummary.total_usd = Number((row.total_usd || 0).toFixed(6));
            costSummary.total_tokens = row.total_tokens || costSummary.total_tokens;
            const ec = row.email_count || parsedCount;
            costSummary.avg_per_email_usd = ec ? Number((costSummary.total_usd / ec).toFixed(6)) : 0;
          }
        } catch { /* ignore */ }
      }
    }

    // Run metrics (pull latest run start)
    let runMetrics: any = null;
    try {
      const runStart = db.prepare(`SELECT id, created_at FROM ingestion_log WHERE phase='run' AND status='start' ORDER BY id DESC LIMIT 1`).get() as any;
      if (runStart) {
        const startTs = runStart.created_at;
        const runEnd = db.prepare(`SELECT created_at FROM ingestion_log WHERE phase='run' AND status='end' AND created_at >= ? ORDER BY id DESC LIMIT 1`).get(startTs) as any;
        const current = db.prepare(`SELECT phase, status FROM ingestion_log WHERE created_at >= ? ORDER BY id DESC LIMIT 1`).get(startTs) as any;
        const fetchStored = db.prepare(`SELECT COUNT(*) as c FROM ingestion_log WHERE phase='fetch' AND status='stored' AND created_at >= ?`).get(startTs) as any;
        const fetchSkipped = db.prepare(`SELECT COUNT(*) as c FROM ingestion_log WHERE phase='fetch' AND status='skip_non_relevant' AND created_at >= ?`).get(startTs) as any;
        const parseParsed = db.prepare(`SELECT COUNT(*) as c FROM ingestion_log WHERE phase='parse' AND status='parsed' AND created_at >= ?`).get(startTs) as any;
        const parseErrors = db.prepare(`SELECT COUNT(*) as c FROM ingestion_log WHERE phase='parse' AND status='error' AND created_at >= ?`).get(startTs) as any;
        // Pending parse queue (overall) and after start filter same query acceptable
        const pendingParse = db.prepare(`SELECT COUNT(*) as c FROM emails WHERE parse_status='pending'`).get() as any;
        let tokensCost = { tokens: 0, cost: 0 };
        try {
          // Prefer call log
            const tc = db.prepare(`SELECT SUM(total_tokens) as tokens, SUM(cost_usd) as cost FROM openai_call_log WHERE created_at >= ?`).get(startTs) as any;
            if (tc && (tc.tokens || tc.cost)) tokensCost = { tokens: tc.tokens || 0, cost: Number((tc.cost || 0).toFixed(6)) };
            if (!tc || (!tc.tokens && !tc.cost)) {
              const ec = db.prepare(`SELECT SUM(openai_total_tokens) as tokens, SUM(openai_cost_usd) as cost FROM emails WHERE parsed_at >= ?`).get(startTs) as any;
              if (ec && (ec.tokens || ec.cost)) tokensCost = { tokens: ec.tokens || 0, cost: Number((ec.cost || 0).toFixed(6)) };
            }
        } catch { /* ignore */ }
        const endTs = runEnd?.created_at || null;
        // Protocol debug events count (imap_dbg) within this run window
        let protoCount = 0;
        try {
          const pc = db.prepare(`SELECT COUNT(*) as c FROM ingestion_log WHERE phase='imap_dbg' AND created_at >= ?`).get(startTs) as any;
          protoCount = pc?.c || 0;
        } catch { /* ignore */ }
        runMetrics = {
          start: startTs,
          end: endTs,
          in_progress: !endTs,
          current: current ? `${current.phase}:${current.status}` : null,
          duration_ms: endTs ? (new Date(endTs).getTime() - new Date(startTs).getTime()) : null,
          fetch: { stored: fetchStored?.c || 0, skipped_non_relevant: fetchSkipped?.c || 0 },
          parse: { parsed: parseParsed?.c || 0, errors: parseErrors?.c || 0, pending_queue: pendingParse?.c || 0 },
          openai: { tokens: tokensCost.tokens, cost_usd: tokensCost.cost },
          protocol: { count: protoCount, verbose: process.env.EMAIL_IMAP_VERBOSE === 'true' },
          env: {
            mailbox: process.env.IMAP_MAILBOX || 'INBOX',
            batch_limit: Number(process.env.IMAP_BATCH_LIMIT || 50),
            max_initial_sync: Number(process.env.IMAP_MAX_INITIAL_SYNC || process.env.IMAP_BATCH_LIMIT || 50),
            include_alerts: process.env.EMAIL_INCLUDE_ALERTS === 'true',
            imap_debug_max: Number(process.env.DTH || process.env.EMAIL_IMAP_DEBUG_MAX || 250),
            imap_verbose: process.env.EMAIL_IMAP_VERBOSE === 'true'
          }
        };
      }
    } catch { /* ignore run metrics errors */ }

    res.status(200).json({
      success: true,
      counts: {
        total: countsRow?.total || 0,
        parsed: countsRow?.parsed || 0,
        pending: countsRow?.pending || 0,
        error: countsRow?.error || 0
      },
      lastParsedAt: lastParsed?.parsed_at || null,
      lastEmailDate: lastDate?.date || null,
      lastUid: sync?.last_uid ?? null,
      vendors: vendors.map(v => ({ vendor: v.vendor, count: v.count })),
      classes: classes.map(c => ({ class: c.class, count: c.count })),
      cost: costSummary,
      run: runMetrics
    });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message || 'Failed to load stats' });
  }
}
