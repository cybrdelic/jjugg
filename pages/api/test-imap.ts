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
        await withTimeout(connection.openBox(imap.mailbox || 'INBOX'), 'openBox');
        debugSteps.push({ step: 'Opened mailbox', mailbox: imap.mailbox || 'INBOX' });
        try { await connection.end(); } catch {}
        debugSteps.push({ step: 'Connection closed' });
        return res.status(200).json({ success: true, message: 'IMAP connection successful.', debugSteps });
    } catch (error: any) {
        try { await connection?.end?.(); } catch {}
        debugSteps.push({ step: 'Error', error: error.message || String(error) });
        return res.status(200).json({ success: false, message: error.message || 'IMAP connection failed.', debugSteps });
    }
}
