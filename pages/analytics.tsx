import AppLayout from '../components/AppLayout';

const AnalyticsSection = () => (
    <div className="glass-card">
        <h1 className="text-primary">Analytics</h1>
        <p className="text-secondary">Analytics data here...</p>
    </div>
);

export default function AnalyticsPage() {
    return (
        <AppLayout currentSection="analytics-section">
            <AnalyticsSection />
        </AppLayout>
    );
}
