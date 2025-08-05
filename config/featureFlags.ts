// Feature flag configuration based on environment
// This would typically be loaded from environment variables or a configuration service

import type { FeatureFlags } from '../contexts/FeatureFlagContext';

// Development environment flags - enable all features for development
export const devFlags: Partial<FeatureFlags> = {
    ENABLE_CALENDAR_VIEW: false,
    ENABLE_TIMELINE_SECTION: false,
    ENABLE_GOALS_SECTION: false,
    ENABLE_ADVANCED_APPLICATION_FEATURES: false,
    ENABLE_DEBUG_PAGE: true,
    ENABLE_PROFILE_ARTIFACTS: false,
    ENABLE_DEVELOPMENT_FEATURES: true,
    ENABLE_DASHBOARD: true,
};

// Production environment flags - disable incomplete features
export const prodFlags: Partial<FeatureFlags> = {
    ENABLE_CALENDAR_VIEW: false,
    ENABLE_TIMELINE_SECTION: false,
    ENABLE_GOALS_SECTION: false,
    ENABLE_ADVANCED_APPLICATION_FEATURES: false,
    ENABLE_DEBUG_PAGE: false,
    ENABLE_PROFILE_ARTIFACTS: false,
    ENABLE_DEVELOPMENT_FEATURES: false,
    ENABLE_DASHBOARD: false,
};

// Staging environment flags - enable some features for testing
export const stagingFlags: Partial<FeatureFlags> = {
    ENABLE_CALENDAR_VIEW: true,
    ENABLE_TIMELINE_SECTION: false,
    ENABLE_GOALS_SECTION: true,
    ENABLE_ADVANCED_APPLICATION_FEATURES: false,
    ENABLE_DEBUG_PAGE: false,
    ENABLE_PROFILE_ARTIFACTS: true,
    ENABLE_DEVELOPMENT_FEATURES: false,
    ENABLE_DASHBOARD: false,
};

// Determine which environment we're in and return the appropriate flags
const getFeatureFlags = (): Partial<FeatureFlags> => {
    const environment = process.env.NODE_ENV || 'development';
    const customEnv = process.env.NEXT_PUBLIC_ENV;

    // Check for custom staging environment
    if (customEnv === 'staging') {
        return stagingFlags;
    }

    switch (environment) {
        case 'production':
            return prodFlags;
        case 'development':
        default:
            return devFlags;
    }
};

export default getFeatureFlags;
