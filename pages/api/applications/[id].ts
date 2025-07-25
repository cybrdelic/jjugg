import { NextApiRequest, NextApiResponse } from 'next';
import { DatabaseService } from '../../../database/service';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    if (!id || isNaN(parseInt(id as string))) {
        return res.status(400).json({ error: 'Invalid application ID' });
    }

    const appId = parseInt(id as string);

    try {
        switch (req.method) {
            case 'GET':
                const application = DatabaseService.getApplication(appId);
                if (!application) {
                    return res.status(404).json({ error: 'Application not found' });
                }
                res.status(200).json(application);
                break;

            case 'PUT':
            case 'PATCH':
                const updates = req.body;
                const updatedApp = DatabaseService.updateApplication(appId, updates);
                res.status(200).json(updatedApp);
                break;

            case 'DELETE':
                DatabaseService.deleteApplication(appId);
                res.status(204).end();
                break;

            default:
                res.setHeader('Allow', ['GET', 'PUT', 'PATCH', 'DELETE']);
                res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        console.error('Error in application API:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
