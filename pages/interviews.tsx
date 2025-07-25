import AppLayout from '../components/AppLayout';
import Interviews from '@/components/sections/Interviews';

export default function InterviewsPage() {
    return (
        <AppLayout currentSection="interviews-section">
            <Interviews />
        </AppLayout>
    );
}
