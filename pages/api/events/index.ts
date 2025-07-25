import { NextApiRequest, NextApiResponse } from 'next';
import { DatabaseService } from '../../../database/service';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const { userId } = req.query;
            const userIdNum = userId ? parseInt(userId as string) : undefined;

            const events = DatabaseService.getUpcomingEvents(userIdNum);
            res.status(200).json(events);
        } catch (error) {
            console.error('Error fetching events:', error);
            res.status(500).json({ error: 'Failed to fetch events' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
