import type { NextApiRequest, NextApiResponse } from 'next';
import { DatabaseService } from '../../database/service';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const config = req.body;
            DatabaseService.setEmailConfig(config);
            res.status(200).json({ success: true });
        } catch (error) {
            res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
        }
    } else if (req.method === 'GET') {
        try {
            const config = DatabaseService.getEmailConfig();
            res.status(200).json({ success: true, config });
        } catch (error) {
            res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
        }
    } else if (req.method === 'DELETE') {
        try {
            DatabaseService.clearEmailConfig();
            res.status(200).json({ success: true });
        } catch (error) {
            res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
        }
    } else {
        res.status(405).json({ success: false, error: 'Method not allowed' });
    }
}
