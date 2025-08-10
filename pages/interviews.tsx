import AppLayout from '../components/AppLayout';
import Interviews from '@/components/sections/Interviews';
import { useFeatureFlags } from '@/contexts/FeatureFlagContext';
import DisabledFeature from '@/components/DisabledFeature';

export default function InterviewsPage() {
    const { ENABLE_INTERVIEWS_SECTION } = useFeatureFlags();
    return (
        <AppLayout currentSection="interviews-section">
            {ENABLE_INTERVIEWS_SECTION ? (
                <Interviews />
            ) : (
                <DisabledFeature title="Interviews are disabled" description="Enable Interviews from Settings → Features to track conversations and schedules." />
            )}
        </AppLayout>
    );
}
