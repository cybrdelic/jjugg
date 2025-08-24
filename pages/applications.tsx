import dynamic from 'next/dynamic';
import AppLayout from '../components/AppLayout';

// Load full Applications feature (client side for now)
const Applications = dynamic(() => import('../components/applications/Applications'), {
    ssr: false,
    loading: () => <div>Loading Applications...</div>,
});

export default function ApplicationsPage() {
    return (
        <AppLayout currentSection="applications-section">
            <Applications />
        </AppLayout>
    );
}
