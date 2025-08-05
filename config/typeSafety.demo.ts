// This file demonstrates the type safety of the feature flag system
// You can delete this file - it's just for demonstration

import type { FeatureFlags } from '@/contexts/FeatureFlagContext';
import type { NavigationItem } from '@/config/navigationConfig';
import type { SectionKey } from '@/types';
import { House } from 'lucide-react';

// ✅ This works - all feature flags and section keys are valid
const validNavigationItems: NavigationItem[] = [
    {
        id: 'dashboard-home', // ✅ Valid SectionKey
        key: 'dashboard-home', // ✅ Valid SectionKey
        label: 'Test',
        icon: House,
        color: 'var(--accent-blue)',
        route: '/test',
        featureFlag: 'ENABLE_DASHBOARD', // ✅ Valid - exists in FeatureFlags
    },
    {
        id: 'goals-section', // ✅ Valid SectionKey
        key: 'goals-section', // ✅ Valid SectionKey
        label: 'Test 2',
        icon: House,
        color: 'var(--accent-blue)',
        route: '/test2',
        featureFlag: 'ENABLE_GOALS_SECTION', // ✅ Valid - exists in FeatureFlags
    }
];

// ❌ These would cause TypeScript errors if uncommented:
/*
const invalidNavigationItem: NavigationItem = {
  id: 'invalid-section', // ❌ TypeScript Error: not assignable to 'SectionKey'
  key: 'invalid-section', // ❌ TypeScript Error: not assignable to 'SectionKey'
  label: 'Invalid',
  icon: House,
  color: 'var(--accent-blue)',
  route: '/invalid',
  featureFlag: 'ENABLE_NONEXISTENT_FEATURE', // ❌ TypeScript Error: not assignable to 'keyof FeatureFlags'
};
*/

// Type demonstrations:
type ValidFeatureFlags = keyof FeatureFlags;
// Resolves to: 'ENABLE_CALENDAR_VIEW' | 'ENABLE_TIMELINE_SECTION' | 'ENABLE_GOALS_SECTION' | etc.

type ValidSectionKeys = SectionKey;
// Resolves to: 'dashboard-home' | 'applications-section' | 'reminders-section' | etc.

export { }; // Make this a module
