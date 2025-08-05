import {
    House, FileText, Bell, Users, User, Target, Clock, Calendar as CalendarIcon, BarChart3
} from 'lucide-react';
import type { SectionKey, NavItemType } from '@/types';
import type { FeatureFlags } from '@/contexts/FeatureFlagContext';

export interface NavigationItem {
    id: SectionKey;
    key: SectionKey;
    label: string;
    icon: typeof House; // Lucide icon component
    color: string;
    route: string;
    featureFlag?: keyof FeatureFlags; // Optional feature flag
    badgeSource?: 'applications' | 'upcomingEvents' | 'activities' | 'interviewsScheduled' | 'static'; // Where to get badge count
    staticBadgeCount?: number; // For static badge counts
}

// Central configuration for all navigation items
export const NAVIGATION_CONFIG: NavigationItem[] = [
    {
        id: 'dashboard-home',
        key: 'dashboard-home',
        label: 'Dashboard',
        icon: House,
        color: 'var(--accent-blue)',
        route: '/dashboard/home',
        featureFlag: 'ENABLE_DASHBOARD',
        badgeSource: 'static',
        staticBadgeCount: 3,
    },
    {
        id: 'applications-section',
        key: 'applications-section',
        label: 'Applications',
        icon: FileText,
        color: 'var(--accent-purple)',
        route: '/applications',
        badgeSource: 'applications',
    },
    {
        id: 'reminders-section',
        key: 'reminders-section',
        label: 'Reminders',
        icon: Bell,
        color: 'var(--accent-pink)',
        route: '/reminders',
        badgeSource: 'upcomingEvents',
    },
    {
        id: 'interviews-section',
        key: 'interviews-section',
        label: 'Interviews',
        icon: Users,
        color: 'var(--accent-orange)',
        route: '/interviews',
        badgeSource: 'interviewsScheduled',
    },
    {
        id: 'profile-artifacts-section',
        key: 'profile-artifacts-section',
        label: 'Profile',
        icon: User,
        color: 'var(--accent-green)',
        route: '/profile',
        featureFlag: 'ENABLE_PROFILE_ARTIFACTS',
    },
    {
        id: 'goals-section',
        key: 'goals-section',
        label: 'Goals',
        icon: Target,
        color: 'var(--accent-yellow)',
        route: '/goals',
        featureFlag: 'ENABLE_GOALS_SECTION',
    },
    {
        id: 'timeline-section',
        key: 'timeline-section',
        label: 'Timeline',
        icon: Clock,
        color: 'var(--accent-red)',
        route: '/timeline',
        featureFlag: 'ENABLE_TIMELINE_SECTION',
        badgeSource: 'activities',
    },
    {
        id: 'calendar-section',
        key: 'calendar-section',
        label: 'Calendar',
        icon: CalendarIcon,
        color: 'var(--accent-blue-light)',
        route: '/calendar',
        featureFlag: 'ENABLE_CALENDAR_VIEW',
        badgeSource: 'upcomingEvents',
    },
    {
        id: 'analytics-section',
        key: 'analytics-section',
        label: 'Analytics',
        icon: BarChart3,
        color: 'var(--accent-teal)',
        route: '/analytics',
    },
];

// Utility function to get route by section key
export const getRouteForSection = (sectionKey: SectionKey): string | undefined => {
    return NAVIGATION_CONFIG.find(item => item.key === sectionKey)?.route;
};

// Utility function to check if a navigation item should be visible based on feature flags
export const isNavigationItemVisible = (
    item: NavigationItem,
    featureFlags: FeatureFlags
): boolean => {
    if (!item.featureFlag) return true; // No feature flag means always visible
    return featureFlags[item.featureFlag] === true;
};
