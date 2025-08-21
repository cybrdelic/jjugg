import type { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';

// This endpoint triggers IMAP fetch for recent email
export default function handler(req: NextApiRequest, res: NextApiResponse) {
    exec('node scripts/pull-recent-email-demo.js', (error, stdout, stderr) => {
        if (error) {
            res.status(500).json({ error: stderr || error.message });
        } else {
            res.status(200).json({ message: 'Pulled recent email', output: stdout });
        }
    });
}
