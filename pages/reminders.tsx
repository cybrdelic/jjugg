import AppLayout from '../components/AppLayout';
import Reminders from '@/components/sections/Reminders';

export default function RemindersPage() {
    return (
        <AppLayout currentSection="reminders-section">
            <Reminders />
        </AppLayout>
    );
}
