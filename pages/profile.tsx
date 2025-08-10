import AppLayout from '../components/AppLayout';
import ProfileSettings from '@/components/sections/ProfileSettings';

export default function ProfilePage() {
    return (
        <AppLayout currentSection="profile-artifacts-section">
            <ProfileSettings />
        </AppLayout>
    );
}
