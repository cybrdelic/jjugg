'use client';

import React, { createContext, useContext, ReactNode } from 'react';

// Define feature flag types here
export interface FeatureFlags {
    ENABLE_CALENDAR_VIEW: boolean;
    ENABLE_TIMELINE_SECTION: boolean;
    ENABLE_GOALS_SECTION: boolean;
    ENABLE_ADVANCED_APPLICATION_FEATURES: boolean;
    ENABLE_DEBUG_PAGE: boolean;
    ENABLE_PROFILE_ARTIFACTS: boolean;
    ENABLE_DEVELOPMENT_FEATURES: boolean;
}

// Default feature flag settings - all disabled by default
const defaultFeatureFlags: FeatureFlags = {
    ENABLE_CALENDAR_VIEW: false,
    ENABLE_TIMELINE_SECTION: false,
    ENABLE_GOALS_SECTION: false,
    ENABLE_ADVANCED_APPLICATION_FEATURES: false,
    ENABLE_DEBUG_PAGE: false,
    ENABLE_PROFILE_ARTIFACTS: false,
    ENABLE_DEVELOPMENT_FEATURES: false,
};

// Create the context
const FeatureFlagContext = createContext<FeatureFlags>(defaultFeatureFlags);

// Hook for using feature flags
export const useFeatureFlags = () => useContext(FeatureFlagContext);

// Provider component
interface FeatureFlagProviderProps {
    children: ReactNode;
    flags?: Partial<FeatureFlags>;
}

export const FeatureFlagProvider: React.FC<FeatureFlagProviderProps> = ({
    children,
    flags = {}
}) => {
    // Merge default flags with provided flags
    const mergedFlags = { ...defaultFeatureFlags, ...flags };

    return (
        <FeatureFlagContext.Provider value={mergedFlags}>
            {children}
        </FeatureFlagContext.Provider>
    );
};
