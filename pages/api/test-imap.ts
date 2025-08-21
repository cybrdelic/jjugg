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
            tlsOptions: { rejectUnauthorized: false } // Quick local fix for Windows
        }
    };

    if (type === 'gmail-oauth') {
        config.imap.xoauth2 = auth.refresh;
        config.imap.password = undefined;
    }

    const debugSteps = [];
    try {
        debugSteps.push({ step: 'Connecting to IMAP', config });
        const connection = await Imap.connect(config);
        debugSteps.push({ step: 'Connected', status: 'success' });
        await connection.openBox(imap.mailbox || 'INBOX');
        debugSteps.push({ step: 'Opened mailbox', mailbox: imap.mailbox || 'INBOX' });
        // Search for all messages, get the latest one
        const fetchOptions = {
            bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)', 'TEXT'],
            struct: true
        };
        debugSteps.push({ step: 'Searching for messages', fetchOptions });
        const searchResults = await connection.search(['ALL'], fetchOptions);
        debugSteps.push({ step: 'Search complete', messageCount: searchResults.length });
        let latestEmail = null;
        if (searchResults && searchResults.length > 0) {
            // Get the last message
            const msg = searchResults[searchResults.length - 1];
            const headerPart = msg.parts.find((p: any) => p.which === 'HEADER.FIELDS (FROM TO SUBJECT DATE)');
            const textPart = msg.parts.find((p: any) => p.which === 'TEXT');
            latestEmail = {
                subject: headerPart && headerPart.body.subject ? headerPart.body.subject[0] : '',
                from: headerPart && headerPart.body.from ? headerPart.body.from[0] : '',
                to: headerPart && headerPart.body.to ? headerPart.body.to[0] : '',
                date: headerPart && headerPart.body.date ? headerPart.body.date[0] : '',
                body: textPart ? textPart.body : ''
            };
            debugSteps.push({ step: 'Fetched latest email', latestEmail });
        } else {
            debugSteps.push({ step: 'No messages found' });
        }
        await connection.end();
        debugSteps.push({ step: 'Connection closed' });
        return res.status(200).json({ success: true, message: 'IMAP connection successful.', latestEmail, debugSteps });
    } catch (error: any) {
        debugSteps.push({ step: 'Error', error: error.message || String(error) });
        return res.status(200).json({ success: false, message: error.message || 'IMAP connection failed.', debugSteps });
    }
}
