import AppLayout from '../components/AppLayout';
import { useFeatureFlags } from '@/contexts/FeatureFlagContext';
import ProfileArtifacts from '@/components/sections/ProfileArtifacts';

export default function ProfilePage() {
    const { ENABLE_PROFILE_ARTIFACTS } = useFeatureFlags();

    if (!ENABLE_PROFILE_ARTIFACTS) {
        return (
            <AppLayout currentSection="profile-artifacts-section">
                <div className="feature-disabled">
                    <h2>Profile Artifacts View</h2>
                    <p>This feature is currently disabled.</p>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout currentSection="profile-artifacts-section">
            <ProfileArtifacts />
        </AppLayout>
    );
}
