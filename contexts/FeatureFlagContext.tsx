'use client';

import React, { createContext, useContext, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';

// Define feature flag types here
export interface FeatureFlags {
    ENABLE_CALENDAR_VIEW: boolean;
    ENABLE_TIMELINE_SECTION: boolean;
    ENABLE_GOALS_SECTION: boolean;
    ENABLE_ADVANCED_APPLICATION_FEATURES: boolean;
    ENABLE_DEBUG_PAGE: boolean;
    ENABLE_PROFILE_ARTIFACTS: boolean;
    ENABLE_DEVELOPMENT_FEATURES: boolean;
    ENABLE_DASHBOARD: boolean; // New feature flag for dashboard
    ENABLE_PROFILE_IN_NAV: boolean; // Controls whether Profile appears in main navigation
    // New flags
    ENABLE_REMINDERS_SECTION: boolean;
    ENABLE_INTERVIEWS_SECTION: boolean;
    ENABLE_ANALYTICS: boolean;
    ENABLE_EMAILS_PAGE: boolean;
}

const LOCAL_STORAGE_KEY = 'jjugg_feature_flags_overrides';

// Default feature flag settings - all disabled by default
const defaultFeatureFlags: FeatureFlags = {
    ENABLE_CALENDAR_VIEW: false,
    ENABLE_TIMELINE_SECTION: false,
    ENABLE_GOALS_SECTION: false,
    ENABLE_ADVANCED_APPLICATION_FEATURES: false,
    ENABLE_DEBUG_PAGE: false,
    ENABLE_PROFILE_ARTIFACTS: false,
    ENABLE_DEVELOPMENT_FEATURES: false,
    ENABLE_DASHBOARD: false, // Default to false for new feature
    ENABLE_PROFILE_IN_NAV: false, // Hide profile from nav by default; access via profile dropdown
    // New flags default
    ENABLE_REMINDERS_SECTION: false,
    ENABLE_INTERVIEWS_SECTION: false,
    ENABLE_ANALYTICS: false,
    ENABLE_EMAILS_PAGE: false,
};

// Create the flags-only context (back-compat)
const FeatureFlagContext = createContext<FeatureFlags>(defaultFeatureFlags);

// Separate updater context so existing useFeatureFlags() readers don't break
interface FeatureFlagControls {
    flags: FeatureFlags;
    setFlag: (key: keyof FeatureFlags, value: boolean) => void;
    setFlags: (patch: Partial<FeatureFlags>) => void;
    resetOverrides: () => void;
}

const noop = () => { };
const FeatureFlagUpdateContext = createContext<FeatureFlagControls>({
    flags: defaultFeatureFlags,
    setFlag: noop,
    setFlags: noop as unknown as (patch: Partial<FeatureFlags>) => void,
    resetOverrides: noop,
});

// Hooks for using contexts
export const useFeatureFlags = () => useContext(FeatureFlagContext);
export const useFeatureFlagControls = () => useContext(FeatureFlagUpdateContext);

// Provider component
interface FeatureFlagProviderProps {
    children: ReactNode;
    flags?: Partial<FeatureFlags>;
}

export const FeatureFlagProvider: React.FC<FeatureFlagProviderProps> = ({
    children,
    flags = {}
}) => {
    // Merge default flags with provided flags (from env) and any local overrides
    const mergedFromProps: FeatureFlags = { ...defaultFeatureFlags, ...flags } as FeatureFlags;

    const loadOverrides = (): Partial<FeatureFlags> => {
        try {
            if (typeof window === 'undefined') return {};
            const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
            return raw ? (JSON.parse(raw) as Partial<FeatureFlags>) : {};
        } catch {
            return {};
        }
    };

    const [overrides, setOverrides] = useState<Partial<FeatureFlags>>(() => loadOverrides());

    useEffect(() => {
        try {
            if (typeof window === 'undefined') return;
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(overrides));
        } catch { }
    }, [overrides]);

    const effectiveFlags: FeatureFlags = useMemo(() => {
        return { ...mergedFromProps, ...overrides } as FeatureFlags;
    }, [mergedFromProps, overrides]);

    const setFlag = useCallback((key: keyof FeatureFlags, value: boolean) => {
        setOverrides(prev => ({ ...prev, [key]: value }));
    }, []);

    const setFlags = useCallback((patch: Partial<FeatureFlags>) => {
        setOverrides(prev => ({ ...prev, ...patch }));
    }, []);

    const resetOverrides = useCallback(() => setOverrides({}), []);

    return (
        <FeatureFlagContext.Provider value={effectiveFlags}>
            <FeatureFlagUpdateContext.Provider value={{ flags: effectiveFlags, setFlag, setFlags, resetOverrides }}>
                {children}
            </FeatureFlagUpdateContext.Provider>
        </FeatureFlagContext.Provider>
    );
};
