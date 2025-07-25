import React, { Suspense } from 'react';
import AppLayout from '../components/AppLayout';

// Dynamic imports for lazy loading
const ApplicationsLazy = React.lazy(() => import('../components/sections/Applications'));

export default function ApplicationsPage() {
    return (
        <AppLayout currentSection="applications-section">
            <Suspense fallback={<div>Loading Applications...</div>}>
                <ApplicationsLazy />
            </Suspense>
        </AppLayout>
    );
}
