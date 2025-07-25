import { NextApiRequest, NextApiResponse } from 'next';
import { DatabaseService } from '../../../database/service';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const { userId } = req.query;
            const userIdNum = userId ? parseInt(userId as string) : undefined;

            const stats = DatabaseService.getApplicationStats(userIdNum);
            res.status(200).json(stats);
        } catch (error) {
            console.error('Error fetching stats:', error);
            res.status(500).json({ error: 'Failed to fetch stats' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
