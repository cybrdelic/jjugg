# Theme System Refactor Guide

## The Problem with the Old Approach

The previous theme injection system had several issues:

```tsx
// ❌ OLD: Janky inline CSS variable generation
<style jsx>{`
  .navbar {
    --border-radius: ${currentTheme?.borderRadius === 'none' ? '0px' :
      currentTheme?.borderRadius === 'sm' ? '4px' :
        currentTheme?.borderRadius === 'md' ? '6px' : /* ... */};
    --transition: ${currentTheme?.animation === 'none' ? '0s' :
      currentTheme?.animation === 'minimal' ? '0.1s' : /* ... */};
  }
`}</style>
```

### Issues:
- **Repetitive Logic** - Same ternary chains everywhere
- **Runtime Computation** - CSS variables computed on every render
- **Hard to Maintain** - Changes require updating multiple components
- **No Type Safety** - Values aren't validated
- **Performance** - Unnecessary re-computations
- **DRY Violation** - Same logic duplicated across components

## The New Clean Approach

### 1. Centralized Theme CSS Utility (`lib/theme/themeCSS.ts`)

```typescript
// ✅ NEW: Clean, typed, centralized mapping
const borderRadiusMap: Record<BorderRadius, string> = {
  'none': '0px',
  'sm': '4px',
  'md': '6px',
  'lg': '8px',
  'xl': '12px',
  'full': '9999px'
};

export const getThemeCSS = (theme: ThemeSettings | null) => {
  if (!theme) return {};

  return {
    '--button-border-radius': borderRadiusMap[theme.borderRadius] || '8px',
    '--transition-fast': animationMap[theme.animation] || '0.2s',
    // ... all other CSS variables
  };
};
```

### 2. Performant Hook (`lib/theme/useThemeVariables.ts`)

```typescript
// ✅ NEW: Memoized hook prevents unnecessary re-computation
export const useThemeVariables = () => {
  const { currentTheme } = useTheme();

  // Memoized - only recalculates when theme actually changes
  const cssVariables = useMemo(() => {
    return getThemeCSS(currentTheme);
  }, [currentTheme]);

  const toCSSDeclarations = () => {
    return Object.entries(cssVariables)
      .map(([key, value]) => `${key}: ${value};`)
      .join('\n    ');
  };

  return { cssVariables, toCSSDeclarations, theme: currentTheme };
};
```

### 3. Clean Component Usage

```tsx
// ✅ NEW: Simple, clean, and performant
export default function ModernNavbar() {
  const { toCSSDeclarations } = useThemeVariables();

  return (
    <>
      <nav className="modern-navbar">
        {/* Component content */}
      </nav>

      <style jsx>{`
        .modern-navbar {
          ${toCSSDeclarations()}
        }
      `}</style>
    </>
  );
}
```

## Benefits of the New Approach

### 🚀 **Performance**
- **Memoization** - CSS variables only recalculated when theme changes
- **No Runtime Ternaries** - All mapping done once at build/theme change
- **Reduced Bundle Size** - No repeated mapping logic

### 🛡️ **Type Safety**
- **Typed Mappings** - `Record<BorderRadius, string>` ensures all values covered
- **Compile-time Validation** - TypeScript catches missing mappings
- **IntelliSense** - Full autocomplete for theme properties

### 🧹 **Maintainability**
- **Single Source of Truth** - All theme mappings in one place
- **DRY Principle** - No repeated mapping logic
- **Easy to Extend** - Add new theme properties in one place

### 🔧 **Developer Experience**
- **Clean Component Code** - No complex inline logic
- **Reusable** - Use the hook in any component
- **Debuggable** - Easy to inspect generated CSS variables

## Migration Guide

### For Existing Components:

1. **Replace the old imports:**
```typescript
// OLD
import { useTheme } from '@/contexts/ThemeContext';

// NEW
import { useThemeVariables } from '@/lib/theme/useThemeVariables';
```

2. **Replace the CSS variable generation:**
```tsx
// OLD
const { currentTheme } = useTheme();
<style jsx>{`
  .component {
    --border-radius: ${currentTheme?.borderRadius === 'sm' ? '4px' : '8px'};
  }
`}</style>

// NEW
const { toCSSDeclarations } = useThemeVariables();
<style jsx>{`
  .component {
    ${toCSSDeclarations()}
  }
`}</style>
```

### For New Components:

Simply use the hook and apply the CSS declarations:

```tsx
import { useThemeVariables } from '@/lib/theme/useThemeVariables';

export default function MyComponent() {
  const { toCSSDeclarations } = useThemeVariables();

  return (
    <>
      <div className="my-component">Content</div>
      <style jsx>{`
        .my-component {
          ${toCSSDeclarations()}
          /* Your custom styles here */
        }
      `}</style>
    </>
  );
}
```

## Adding New Theme Properties

To add a new theme property (e.g., `shadows`):

1. **Add to the theme types** (if not already there)
2. **Add mapping in `themeCSS.ts`:**

```typescript
const shadowMap: Record<ShadowLevel, string> = {
  'none': 'none',
  'sm': '0 1px 2px rgba(0,0,0,0.05)',
  'md': '0 4px 6px rgba(0,0,0,0.1)',
  'lg': '0 10px 15px rgba(0,0,0,0.15)'
};

// In getThemeCSS function:
return {
  // ... existing variables
  '--shadow': shadowMap[theme.shadow] || shadowMap.md,
};
```

3. **Use in components** - automatically available via `toCSSDeclarations()`

That's it! The new property is now available across all components using the theme system.
