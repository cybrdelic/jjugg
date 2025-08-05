# Example: Adding a New "Reports" Feature

## Before (Old Approach)
To add a new "Reports" section, you would need to:

1. Add the section key to types.ts
2. Add route mapping in AppLayout.tsx
3. Add feature flag destructuring
4. Add manual feature flag check with spread operator
5. Create icon element inline
6. Set up badge logic

**Required changes in AppLayout.tsx:**
```typescript
// Add to route map
'reports-section': '/reports',

// Add to feature flag destructuring
const { ..., ENABLE_REPORTS } = useFeatureFlags();

// Add to sidebar items array
...(ENABLE_REPORTS ? [{
  id: 'reports-section' as SectionKey,
  key: 'reports-section' as SectionKey,
  label: 'Reports',
  icon: <FileBarChart className="w-5 h-5" />,
  color: 'var(--accent-cyan)',
  badge: { count: reports.length }
}] : []),
```

## After (New Approach)
To add a new "Reports" section, you only need to:

1. Add one entry to the navigation config
2. Add the feature flag to the FeatureFlags interface

**Add to navigationConfig.ts:**
```typescript
{
  id: 'reports-section',
  key: 'reports-section',
  label: 'Reports',
  icon: FileBarChart,
  color: 'var(--accent-cyan)',
  route: '/reports',
  featureFlag: 'ENABLE_REPORTS', // TypeScript ensures this exists in FeatureFlags interface
  badgeSource: 'reports', // Automatically counts from data
}
```

**Add to FeatureFlagContext.tsx:**
```typescript
export interface FeatureFlags {
  // ... existing flags
  ENABLE_REPORTS: boolean;
}
```

## Type Safety Benefits

The navigation system has **full type safety** across multiple dimensions:

### Feature Flags (`keyof FeatureFlags`)
- ✅ **Compile-time validation** - TypeScript will error if you reference a non-existent feature flag
- ✅ **IntelliSense support** - Your IDE will autocomplete available feature flags
- ✅ **Refactoring safety** - Renaming a feature flag updates all references

### Section Keys (`SectionKey`)
- ✅ **Valid section enforcement** - Only predefined section keys are allowed
- ✅ **Consistency guarantee** - Prevents mismatched id/key pairs
- ✅ **Route mapping safety** - All section keys have corresponding routes

### Examples:
```typescript
// ✅ This works - both feature flag and section key are valid
{
  id: 'goals-section', // Must be a valid SectionKey
  featureFlag: 'ENABLE_GOALS_SECTION' // Must be a valid FeatureFlags key
}

// ❌ These will cause TypeScript errors:
{
  id: 'invalid-section', // Error: not assignable to type 'SectionKey'
  featureFlag: 'ENABLE_INVALID' // Error: not assignable to type 'keyof FeatureFlags'
}
```

This **double type safety** means you can't accidentally:
- Reference non-existent feature flags
- Use invalid section identifiers
- Create navigation items that don't map to real routes
- Have typos in critical navigation configuration

That's it! The navigation system handles:
- ✅ Route mapping automatically
- ✅ Feature flag checking automatically
- ✅ Icon rendering automatically
- ✅ Badge counting automatically
- ✅ TypeScript types automatically

## Lines of Code Comparison
- **Before:** ~15 lines across multiple files with repetitive patterns
- **After:** ~8 lines total with zero repetition

## Maintainability Wins
- ✅ Single source of truth for navigation
- ✅ No manual route mapping
- ✅ No inline feature flag logic
- ✅ Consistent badge handling
- ✅ Full type safety
- ✅ Easy to test and modify
