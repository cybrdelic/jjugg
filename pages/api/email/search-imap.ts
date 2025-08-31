import { searchImap } from '@/lib/imapSearch';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const q = (req.query.q as string || '').trim();
  if (!q) return res.status(200).json({ results: { matches: [] } });
  try {
  const all = (req.query.all as string) === '1';
  const results = await searchImap(q, { limit: 120, includeBodySnippet: false, allMailboxes: all });
    res.status(200).json({ results: { matches: results } });
  } catch (e:any) {
    res.status(500).json({ error: e.message || 'imap search failed' });
  }
}
