import type { NextApiRequest, NextApiResponse } from 'next';
import Imap from 'imap-simple';

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
            authTimeout: 5000,
        }
    };

    if (type === 'gmail-oauth') {
        config.imap.xoauth2 = auth.refresh;
        config.imap.password = undefined;
    }

    try {
        const connection = await Imap.connect(config);
        await connection.openBox(imap.mailbox || 'INBOX');
        await connection.end();
        return res.status(200).json({ success: true, message: 'IMAP connection successful.' });
    } catch (error: any) {
        return res.status(200).json({ success: false, message: error.message || 'IMAP connection failed.' });
    }
}
