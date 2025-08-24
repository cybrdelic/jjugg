import { NextApiRequest, NextApiResponse } from 'next';
import { DatabaseService } from '../../../database/service';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        switch (req.method) {
            case 'GET': {
                const { userId, limit, offset } = req.query;
                const userIdNum = userId ? parseInt(userId as string) : undefined;
                // If limit/offset supplied, use paginated endpoint
                if (limit !== undefined || offset !== undefined) {
                    const lim = Math.max(1, Math.min(200, parseInt((limit as string) || '50'))); // clamp 1..200
                    const off = Math.max(0, parseInt((offset as string) || '0'));
                    const page = DatabaseService.getApplicationsPage({ userId: userIdNum, limit: lim, offset: off });
                    const hasMore = off + page.items.length < page.total;
                    res.status(200).json({
                        items: page.items,
                        total: page.total,
                        pageSize: lim,
                        offset: off,
                        hasMore
                    });
                } else {
                    // Legacy full fetch (will be deprecated)
                    const applications = DatabaseService.getAllApplications(userIdNum);
                    res.status(200).json(applications);
                }
                break; }

            case 'POST':
                const newApplication = req.body;
                const createdApp = DatabaseService.createApplication(newApplication);
                res.status(201).json(createdApp);
                break;

            case 'PUT':
                const { id } = req.query;
                const updates = req.body;
                if (!id) {
                    return res.status(400).json({ error: 'Application ID is required' });
                }
                const updatedApp = DatabaseService.updateApplication(parseInt(id as string), updates);
                res.status(200).json(updatedApp);
                break;

            case 'DELETE':
                const { id: deleteId } = req.query;
                if (!deleteId) {
                    return res.status(400).json({ error: 'Application ID is required' });
                }
                DatabaseService.deleteApplication(parseInt(deleteId as string));
                res.status(204).end();
                break;

            default:
                res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
                res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        console.error('Error in applications API:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
