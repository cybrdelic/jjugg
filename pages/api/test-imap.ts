import Imap from 'imap-simple';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { type, imap, auth } = req.body;

    let config: any = {
        imap: {
            user: imap.user,
            password: auth.pass || auth.secret || '',
            host: imap.host,
            port: imap.port,
            tls: true,
            connTimeout: 8000,
            authTimeout: 5000,
            tlsOptions: { rejectUnauthorized: false } // Quick local fix for Windows
        }
    };

    if (type === 'gmail-oauth') {
        config.imap.xoauth2 = auth.refresh;
        config.imap.password = undefined;
    }

    const debugSteps: any[] = [];
    let connection: any;
    const overallTimeoutMs = 12000;
    const withTimeout = <T,>(p: Promise<T>, label: string): Promise<T> => {
        return new Promise<T>((resolve, reject) => {
            const timer = setTimeout(() => {
                debugSteps.push({ step: 'Timeout', where: label });
                try { connection?.end?.(); } catch {}
                reject(new Error('Operation timed out'));
            }, overallTimeoutMs);
            p.then(v => { clearTimeout(timer); resolve(v); })
             .catch(e => { clearTimeout(timer); reject(e); });
        });
    };

    try {
        debugSteps.push({ step: 'Connecting to IMAP', host: imap.host, port: imap.port, user: imap.user });
        connection = await withTimeout(Imap.connect(config), 'connect');
        debugSteps.push({ step: 'Connected', status: 'success' });
        const boxInfo = await withTimeout(connection.openBox(imap.mailbox || 'INBOX'), 'openBox');
        debugSteps.push({ step: 'Opened mailbox', mailbox: imap.mailbox || 'INBOX' });

        // If mailbox empty, report success with no preview
        const total = (boxInfo as any)?.messages?.total ?? 0;
        if (!total) {
            try { await connection.end(); } catch {}
            debugSteps.push({ step: 'Mailbox empty' });
            return res.status(200).json({ success: true, message: 'Mailbox is empty.', preview: null, debugSteps });
        }

        // Fetch the latest message headers and a small text snippet safely
        const latestPreview = await withTimeout(new Promise<any>((resolve, reject) => {
            const seq = (connection as any).imap.seq.fetch(`${total}:${total}`, {
                bodies: [
                    'HEADER.FIELDS (FROM TO SUBJECT DATE)',
                    // Fetch first ~4KB of text body only to avoid heavy downloads
                    'BODY[TEXT]<0.4096>'
                ],
                struct: false
            });
            let headerRaw = '';
            let textRaw = '';
            let uid: number | null = null;
            seq.on('message', (msg: any) => {
                msg.on('body', (stream: any, info: any) => {
                    let buf = '';
                    stream.on('data', (chunk: any) => { buf += chunk.toString('utf8'); });
                    stream.once('end', () => {
                        const which = String(info.which || '').toUpperCase();
                        if (which.startsWith('HEADER')) headerRaw = buf;
                        else textRaw = buf;
                    });
                });
                msg.once('attributes', (attrs: any) => { uid = attrs?.uid ?? null; });
            });
            seq.once('error', (err: any) => reject(err));
            seq.once('end', () => {
                const pick = (h: string, name: string) => {
                    // naive unfolded header: join continued lines
                    const unfolded = h.replace(/\r?\n[\t ]+/g, ' ').split(/\r?\n/);
                    const line = unfolded.find(l => new RegExp(`^${name}:`, 'i').test(l));
                    if (!line) return '';
                    return line.split(':').slice(1).join(':').trim();
                };
                const subject = pick(headerRaw, 'Subject');
                const from = pick(headerRaw, 'From');
                const date = pick(headerRaw, 'Date');
                // Basic snippet cleanup
                const snippet = (textRaw || '')
                    .replace(/\r?\n/g, ' ')
                    .replace(/\s+/g, ' ')
                    .slice(0, 300)
                    .trim();
                resolve({ subject, from, date, snippet, uid });
            });
        }), 'fetch-latest');

        try { await connection.end(); } catch {}
        debugSteps.push({ step: 'Connection closed' });
        return res.status(200).json({ success: true, message: 'IMAP connection successful.', preview: latestPreview, debugSteps });
    } catch (error: any) {
        try { await connection?.end?.(); } catch {}
        debugSteps.push({ step: 'Error', error: error.message || String(error) });
        return res.status(200).json({ success: false, message: error.message || 'IMAP connection failed.', debugSteps });
    }
}
