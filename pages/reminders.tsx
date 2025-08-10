import AppLayout from '../components/AppLayout';
import DisabledFeature from '@/components/DisabledFeature';
import { useFeatureFlags } from '@/contexts/FeatureFlagContext';
import Reminders from '@/components/sections/Reminders';

export default function RemindersPage() {
    const { ENABLE_REMINDERS_SECTION } = useFeatureFlags();
    return (
        <AppLayout currentSection="reminders-section">
            {ENABLE_REMINDERS_SECTION ? (
                <Reminders />
            ) : (
                <DisabledFeature title="Reminders are disabled" description="Enable Reminders from Settings → Features to manage follow-ups and deadlines." />
            )}
        </AppLayout>
    );
}
