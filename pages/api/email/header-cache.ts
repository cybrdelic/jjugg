import { DB_PATH } from '@/lib/dbPath';
import sqlite3 from 'better-sqlite3';
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse){
  try {
    const db = sqlite3(DB_PATH);
    const limit = Math.min(Number(req.query.limit || 100), 500);
    const offset = Math.max(Number(req.query.offset || 0), 0);
    const decision = (req.query.decision || '').toString();
    let rows: any[] = [];
    if(decision){
      rows = db.prepare(`SELECT uid, subject, from_email, date, size, decision, score, reason, model_version, promoted FROM email_header_cache WHERE decision=? ORDER BY uid DESC LIMIT ? OFFSET ?`).all(decision, limit, offset) as any[];
    } else {
      rows = db.prepare(`SELECT uid, subject, from_email, date, size, decision, score, reason, model_version, promoted FROM email_header_cache ORDER BY uid DESC LIMIT ? OFFSET ?`).all(limit, offset) as any[];
    }
    res.status(200).json({ success:true, rows });
  } catch(e:any){
    res.status(500).json({ success:false, error:e.message });
  }
}
