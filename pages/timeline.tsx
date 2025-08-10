import AppLayout from '../components/AppLayout';
import { useFeatureFlags } from '@/contexts/FeatureFlagContext';
import Timeline from '@/components/sections/Timeline';

export default function TimelinePage() {
    const { ENABLE_TIMELINE_SECTION } = useFeatureFlags();

    if (!ENABLE_TIMELINE_SECTION) {
        return (
            <AppLayout currentSection="timeline-section">
                <div className="feature-disabled">
                    <h2 className="text-h2">Timeline View</h2>
                    <p className="lead">This feature is currently disabled.</p>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout currentSection="timeline-section">
            <Timeline />
        </AppLayout>
    );
}
