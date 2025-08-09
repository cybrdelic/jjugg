import React from 'react';
import AppLayout from '../components/AppLayout';
import dynamic from 'next/dynamic';

// Dynamic import for lazy loading with Next.js
const ApplicationsLazy = dynamic(() => import('../components/sections/Applications'), {
    ssr: false,
    loading: () => <div>Loading Applications...</div>,
});

export default function ApplicationsPage() {
    return (
        <AppLayout currentSection="applications-section">
            <ApplicationsLazy />
        </AppLayout>
    );
}
