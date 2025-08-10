import React from 'react';
import Link from 'next/link';

interface DisabledFeatureProps {
    title?: string;
    description?: string;
}

const DisabledFeature: React.FC<DisabledFeatureProps> = ({
    title = 'This feature is disabled',
    description = 'You can enable it from Settings → Features when you are ready.'
}) => {
    return (
        <div className="glass-card">
            <h1 className="text-h1">{title}</h1>
            <p className="lead">{description}</p>
            <div style={{ marginTop: '12px' }}>
                <Link href="/profile" className="btn-primary">Go to Settings</Link>
            </div>
        </div>
    );
};

export default DisabledFeature;
