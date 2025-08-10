import AppLayout from '../../components/AppLayout';
import DashboardHome from '@/components/sections/DashboardHome';
import { useFeatureFlags } from '@/contexts/FeatureFlagContext';
import DisabledFeature from '@/components/DisabledFeature';

export default function DashboardHomePage() {
    const { ENABLE_DASHBOARD } = useFeatureFlags();
    return (
        <AppLayout currentSection="dashboard-home">
            {ENABLE_DASHBOARD ? (
                <DashboardHome />
            ) : (
                <DisabledFeature title="Dashboard is disabled" description="Enable Dashboard from Settings → Features to see your overview." />
            )}
        </AppLayout>
    );
}
