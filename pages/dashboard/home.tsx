import AppLayout from '../../components/AppLayout';
import DashboardHome from '@/components/sections/DashboardHome';

export default function DashboardHomePage() {
    return (
        <AppLayout currentSection="dashboard-home">
            <DashboardHome />
        </AppLayout>
    );
}
