import AppLayout from '../components/AppLayout';
import { useFeatureFlags } from '@/contexts/FeatureFlagContext';
import Calendar from '@/components/sections/Calendar';

export default function CalendarPage() {
    const { ENABLE_CALENDAR_VIEW } = useFeatureFlags();

    if (!ENABLE_CALENDAR_VIEW) {
        return (
            <AppLayout currentSection="calendar-section">
                <div className="feature-disabled">
                    <h2>Calendar View</h2>
                    <p>This feature is currently disabled.</p>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout currentSection="calendar-section">
            <Calendar />
        </AppLayout>
    );
}
