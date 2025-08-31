import { DB_PATH } from '@/lib/dbPath';
import sqlite3 from 'better-sqlite3';
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse){
  if(req.method !== 'POST') return res.status(405).json({ success:false, error:'POST only' });
  try {
    const db = sqlite3(DB_PATH);
    const mailbox = process.env.IMAP_MAILBOX || 'INBOX';
    const { action } = req.body || {};
    const st = db.prepare('SELECT mailbox FROM email_backfill_state WHERE mailbox=?').get(mailbox) as any;
    if(!st){
      db.prepare('INSERT INTO email_backfill_state (mailbox, highest_uid_seen, lowest_uid_processed, active, started_at, updated_at, model_version) VALUES (?,?,?,?,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,?)')
        .run(mailbox, null, null, action==='start'?1:0, 'v1');
    } else {
      if(action === 'start'){
        db.prepare('UPDATE email_backfill_state SET active=1, started_at=COALESCE(started_at,CURRENT_TIMESTAMP), updated_at=CURRENT_TIMESTAMP WHERE mailbox=?').run(mailbox);
      } else if(action === 'pause') {
        db.prepare('UPDATE email_backfill_state SET active=0, updated_at=CURRENT_TIMESTAMP WHERE mailbox=?').run(mailbox);
      } else {
        return res.status(400).json({ success:false, error:'Unknown action'});
      }
    }
    const out = db.prepare('SELECT mailbox, active, highest_uid_seen, lowest_uid_processed FROM email_backfill_state WHERE mailbox=?').get(mailbox) as any;
    res.status(200).json({ success:true, state: out });
  } catch(e:any){
    res.status(500).json({ success:false, error:e.message });
  }
}
