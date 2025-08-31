import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';

export interface ImapSearchResultMeta {
  uid: number;
  seq?: number;
  subject: string;
  date?: string;
  from?: string;
  to?: string;
  snippet?: string;
  mailbox?: string;
}

export interface ImapSearchOptions {
  mailbox?: string;
  limit?: number;
  includeBodySnippet?: boolean;
  allMailboxes?: boolean;
  mailboxExcludePatterns?: RegExp[]; // e.g. [/spam/i, /trash/i]
}

function env(name:string, fallback?:string){
  const v = process.env[name];
  if(!v && fallback!==undefined) return fallback; return v;
}

export async function searchImap(query: string, opts: ImapSearchOptions = {}): Promise<ImapSearchResultMeta[]> {
  const host = env('IMAP_HOST');
  const user = env('IMAP_USER');
  const pass = env('IMAP_PASS');
  const port = Number(env('IMAP_PORT','993'));
  if(!host||!user||!pass) throw new Error('IMAP env not configured');
  const singleMailbox = opts.mailbox || env('IMAP_MAILBOX','INBOX') || 'INBOX';
  const limit = opts.limit ?? 50;

  const client = new ImapFlow({
    host, port, secure:true,
    auth:{ user, pass },
    logger: false
  });
  await client.connect();
  try {
    // Tokenize
    const tokens = query.split(/\s+/).filter(Boolean).slice(0,7);
    if(!tokens.length) return [];
    // Helper to build OR criteria arrays
    const buildOr = (terms:any[]): any => terms.length<=1? terms[0] : terms.slice(1).reduce((acc,cur)=>['OR', acc, cur], terms[0]);
    const subjectTerms: any[] = tokens.map(t=>['HEADER','SUBJECT',t]);
    const bodyTerms: any[] = tokens.map(t=>['TEXT',t]);
    const subjectCriteria: any = buildOr(subjectTerms);
    const bodyCriteria: any = buildOr(bodyTerms);

    const metas: ImapSearchResultMeta[] = [];
    const pushMailboxResults = async(mailboxName:string) => {
      try { await client.mailboxOpen(mailboxName); } catch { return; }
      let subjectUids: number[] = [];
      let bodyUids: number[] = [];
      try { const r = await client.search(['ALL', subjectCriteria] as any); if(r && Array.isArray(r)) subjectUids = r as number[]; } catch {}
      try { const r = await client.search(['ALL', bodyCriteria] as any); if(r && Array.isArray(r)) bodyUids = r as number[]; } catch {}
      const uidSet = Array.from(new Set([...subjectUids, ...bodyUids]));
      if(!uidSet.length) return;
      // Keep only newest chunk per mailbox (last 120) to bound fetch time
      const sliceSet = uidSet.slice(-120);
      const seq = sliceSet.sort((a,b)=>a-b).join(',');
      for await (const msg of client.fetch(seq, {envelope:true, internalDate:true, source: opts.includeBodySnippet ? true : false, uid: true})) {
        const { envelope, uid, internalDate, source } = msg as any;
        let snippet: string | undefined;
        if(opts.includeBodySnippet && source){
          try { const parsed = await simpleParser(source); const text = (parsed.text || '').replace(/\s+/g,' ').trim(); snippet = text.slice(0,160); } catch {}
        }
        metas.push({
          uid,
          subject: (envelope?.subject)||'(no subject)',
          date: internalDate ? new Date(internalDate).toISOString() : undefined,
          from: envelope?.from?.map((a:any)=>a.address).filter(Boolean).join(', '),
          to: envelope?.to?.map((a:any)=>a.address).filter(Boolean).join(', '),
          snippet,
          mailbox: mailboxName
        });
      }
    };

    if(opts.allMailboxes){
      const exclude = opts.mailboxExcludePatterns || [/spam/i, /trash/i, /junk/i, /draft/i];
      const boxes = await client.list();
      for (const box of boxes){
        const name: any = (box as any).path || (box as any).mailbox || (box as any).name;
        if(!name) continue;
        if(exclude.some(rx=>rx.test(name))) continue;
        if((box as any).flags?.includes('\\Noselect')) continue;
        await pushMailboxResults(String(name));
        if(metas.length >= limit) break; // early cut
      }
    } else {
      await pushMailboxResults(singleMailbox);
    }
    // Sort newest first and enforce global limit
    metas.sort((a,b)=> (b.date||'').localeCompare(a.date||''));
    return metas.slice(0, limit);
  } finally {
    try { await client.logout(); } catch {}
  }
}
