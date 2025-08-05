import { useMemo, createElement } from 'react';
import { useRouter } from 'next/router';
import { useFeatureFlags } from '@/contexts/FeatureFlagContext';
import { useAppData } from '@/contexts/AppDataContext';
import type { NavItemType } from '@/types';
import {
    NAVIGATION_CONFIG,
    NavigationItem,
    getRouteForSection,
    isNavigationItemVisible
} from '@/config/navigationConfig';

interface UseNavigationReturn {
    navigationItems: NavItemType[];
    handleNavigation: (sectionKey: string) => void;
}

export const useNavigation = (): UseNavigationReturn => {
    const router = useRouter();
    const featureFlags = useFeatureFlags();
    const { applications, upcomingEvents, activities, appStats } = useAppData();

    // Get badge count based on badge source
    const getBadgeCount = (item: NavigationItem): number | undefined => {
        if (!item.badgeSource) return undefined;

        switch (item.badgeSource) {
            case 'applications':
                return applications.length;
            case 'upcomingEvents':
                return upcomingEvents.length;
            case 'activities':
                return activities.length;
            case 'interviewsScheduled':
                return appStats?.interviewsScheduled || 0;
            case 'static':
                return item.staticBadgeCount;
            default:
                return undefined;
        }
    };

    // Generate navigation items based on configuration and feature flags
    const navigationItems = useMemo(() => {
        return NAVIGATION_CONFIG
            .filter(item => isNavigationItemVisible(item, featureFlags))
            .map(item => {
                const IconComponent = item.icon;
                const badgeCount = getBadgeCount(item);

                return {
                    id: item.id,
                    key: item.key,
                    label: item.label,
                    icon: createElement(IconComponent, { className: "w-5 h-5" }),
                    color: item.color,
                    ...(badgeCount !== undefined && { badge: { count: badgeCount } })
                } as NavItemType;
            });
    }, [featureFlags, applications.length, upcomingEvents.length, activities.length, appStats?.interviewsScheduled]);

    // Handle navigation using the centralized route mapping
    const handleNavigation = (sectionKey: string) => {
        const route = getRouteForSection(sectionKey as any);
        if (route) {
            router.push(route);
        }
    };

    return {
        navigationItems,
        handleNavigation
    };
};
