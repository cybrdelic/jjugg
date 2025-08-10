import AppLayout from '../components/AppLayout';
import { useFeatureFlags } from '@/contexts/FeatureFlagContext';
import Goals from '@/components/sections/Goals';

export default function GoalsPage() {
    const { ENABLE_GOALS_SECTION } = useFeatureFlags();

    if (!ENABLE_GOALS_SECTION) {
        return (
            <AppLayout currentSection="goals-section">
                <div className="feature-disabled">
                    <h2 className="text-h2">Goals View</h2>
                    <p className="lead">This feature is currently disabled.</p>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout currentSection="goals-section">
            <Goals />
        </AppLayout>
    );
}
