import type { NextApiRequest, NextApiResponse } from 'next';
import { db, ensureEmailSchema } from '../../../lib/dbEmail';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const id = Number(req.query.id);
    if (!id) return res.status(400).json({ success: false, error: 'Missing id' });
  ensureEmailSchema();
    const email = db.prepare(`SELECT * FROM emails WHERE id = ?`).get(id) as any;
    if (!email) return res.status(404).json({ success: false, error: 'Not found' });
    let parsed_json: any = null;
    if (email.parsed_json) {
      try { parsed_json = JSON.parse(email.parsed_json); } catch { parsed_json = { raw: email.parsed_json }; }
    }
    let calls: any[] = [];
  calls = db.prepare(`SELECT id, model, prompt_tokens, completion_tokens, total_tokens, cost_usd, created_at FROM openai_call_log WHERE email_id = ? ORDER BY id ASC`).all(id) as any[];
    res.status(200).json({ success: true, email: { ...email, parsed_json }, calls });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message || 'Failed' });
  }
}

export const config = { api: { bodyParser: false } };
