import AppLayout from '../components/AppLayout';
import { useFeatureFlags } from '@/contexts/FeatureFlagContext';
import DisabledFeature from '@/components/DisabledFeature';

const AnalyticsSection = () => (
    <div className="glass-card">
        <h1 className="text-h1">Analytics</h1>
        <p className="lead">High‑level KPIs and trends. Detailed charts coming soon.</p>
    </div>
);

export default function AnalyticsPage() {
    const { ENABLE_ANALYTICS } = useFeatureFlags();

    return (
        <AppLayout currentSection="analytics-section">
            {ENABLE_ANALYTICS ? (
                <AnalyticsSection />
            ) : (
                <DisabledFeature title="Analytics is disabled" description="Turn this on in Settings → Features to explore KPIs and trends." />
            )}
        </AppLayout>
    );
}
