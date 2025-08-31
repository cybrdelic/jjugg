import { DB_PATH } from '@/lib/dbPath';
import sqlite3 from 'better-sqlite3';
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse){
  try {
    const db = sqlite3(DB_PATH);
    const mailbox = process.env.IMAP_MAILBOX || 'INBOX';
    const st = db.prepare('SELECT mailbox, highest_uid_seen, lowest_uid_processed, active, started_at, updated_at, model_version FROM email_backfill_state WHERE mailbox=?').get(mailbox) as any;
    if(!st){ return res.status(200).json({ success:true, active:false, initialized:false }); }
    const counts = db.prepare(`SELECT decision, COUNT(*) as c FROM email_header_cache GROUP BY decision`).all() as any[];
    const agg:Record<string,number> = {}; counts.forEach(r=> agg[r.decision||''] = r.c);
    let percent = null;
    if(st.highest_uid_seen && st.lowest_uid_processed){
      const span = st.highest_uid_seen - 1; // target down to UID 1
      const done = st.highest_uid_seen - st.lowest_uid_processed;
      percent = span>0 ? Number(((done/span)*100).toFixed(2)) : 0;
    }
    return res.status(200).json({ success:true, active: !!st.active, initialized: st.highest_uid_seen!=null, state: st, counts: agg, percent });
  } catch(e:any){
    res.status(500).json({ success:false, error: e.message });
  }
}
