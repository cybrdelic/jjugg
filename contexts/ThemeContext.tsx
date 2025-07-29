// contexts/ThemeContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type ColorMode = 'light' | 'dark';
export type ThemeName =
  | 'professional'
  | 'modern'
  | 'creative'
  | 'developer'
  | 'custom';

export type FontFamily = 'inter' | 'lexend' | 'fira-code' | 'jetbrains-mono' | 'jetbrains' | 'playfair' | 'crimson' | 'geist';
export type BorderRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
export type Animation = 'none' | 'minimal' | 'subtle' | 'moderate' | 'smooth' | 'playful' | 'intense';
export type GlassEffect = 'none' | 'subtle' | 'medium' | 'heavy' | 'extreme';
export type BackgroundType = 'solid' | 'gradient' | 'radial' | 'conic' | 'mesh' | 'pattern' | 'noise';
export type BackgroundPattern = 'none' | 'dots' | 'grid' | 'lines' | 'waves' | 'circuit' | 'geometric' | 'hexagons' | 'triangles' | 'diamonds';
export type BackgroundAnimation = 'none' | 'slow' | 'normal' | 'fast' | 'pulse' | 'shift' | 'parallax';
export type BackgroundBlend = 'normal' | 'overlay' | 'screen' | 'multiply' | 'darken' | 'lighten' | 'color-dodge' | 'color-burn' | 'hard-light' | 'soft-light';

export interface BackgroundMedia {
  type: 'image' | 'video' | 'gif';
  url: string;
  opacity: number;
  blur: number;
  scale: number;
}

export interface ColorPalette {
  // Core brand colors with hierarchy
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  accent: string;

  // Background system - consistent hierarchy
  background: string;        // Main app background
  backgroundSecondary: string; // Secondary areas (sidebars, panels)
  surface: string;           // Card/panel surfaces
  surfaceElevated: string;   // Elevated surfaces (modals, dropdowns)
  card: string;              // Individual card backgrounds
  cardHover: string;         // Card hover state

  // Border system with clear hierarchy
  border: string;            // Default borders
  borderLight: string;       // Subtle borders
  borderStrong: string;      // Emphasized borders

  // Text hierarchy with proper contrast
  text: {
    primary: string;         // Main text - highest contrast
    secondary: string;       // Secondary text
    tertiary: string;        // Muted text
    accent: string;          // Accent text (links, highlights)
    inverse: string;         // Text on dark/colored backgrounds
  };

  // Status system with light variants for backgrounds
  status: {
    success: string;
    successLight: string;
    warning: string;
    warningLight: string;
    error: string;
    errorLight: string;
    info: string;
    infoLight: string;
    pending: string;
    pendingLight: string;
  };

  // Application-specific colors with consistent theming
  application: {
    applied: string;
    appliedLight: string;
    screening: string;
    screeningLight: string;
    interview: string;
    interviewLight: string;
    offer: string;
    offerLight: string;
    rejected: string;
    rejectedLight: string;
  };

  // Interactive states for all UI elements
  interactive: {
    hover: string;           // Universal hover background
    active: string;          // Active/pressed states
    focus: string;           // Focus ring color
    disabled: string;        // Disabled backgrounds
    selected: string;        // Selected item backgrounds
  };

  // Glass morphism with proper opacity
  glass: {
    subtle: string;          // Very light glass (5-10% opacity)
    medium: string;          // Standard glass (15-25% opacity)
    strong: string;          // Prominent glass (30-40% opacity)
    overlay: string;         // Modal/overlay backgrounds
  };

  // Shadow system for proper depth
  shadows: {
    subtle: string;          // Light shadows for cards
    medium: string;          // Standard elevation shadows
    strong: string;          // Deep shadows for modals
    glow: string;            // Accent glows for focus states
  };
}

export interface BackgroundSettings {
  type: BackgroundType;
  colors: string[];
  pattern?: BackgroundPattern;
  patternOpacity?: number;
  noise?: boolean;
  noiseOpacity?: number;
  blur?: number;
  overlay?: string;
}

export interface ThemeSettings {
  name: ThemeName;
  label: string;
  description: string;
  category: 'modern' | 'dark' | 'creative' | 'professional' | 'technical';
  mode: ColorMode;
  fontFamily: FontFamily;
  borderRadius: BorderRadius;
  animation: Animation;
  glassEffect: GlassEffect;
  colors: ColorPalette;
  background: BackgroundSettings;
  customCSS?: string;
}

interface ThemeContextType {
  currentTheme: ThemeSettings;
  themeName: ThemeName;
  availableThemes: ThemeSettings[];
  setThemeName: (name: ThemeName) => void;
  updateTheme: (updates: Partial<ThemeSettings>) => void;
  toggleColorMode: () => void;
  getThemesByCategory: (category: string) => ThemeSettings[];
}

// Define comprehensive theme system
const createColorPalette = (
  primary: string,
  secondary: string,
  accent: string,
  background: string,
  surface: string,
  textPrimary: string,
  textSecondary: string,
  mode: ColorMode,
  customStatus?: {
    success?: string;
    warning?: string;
    error?: string;
    info?: string;
    pending?: string;
  }
): ColorPalette => {
  const isLight = mode === 'light';

  // Theme-specific or default status colors
  const statusColors = {
    success: customStatus?.success || (isLight ? '#10b981' : '#34d399'),
    warning: customStatus?.warning || (isLight ? '#f59e0b' : '#fbbf24'),
    error: customStatus?.error || (isLight ? '#ef4444' : '#f87171'),
    info: customStatus?.info || (isLight ? '#3b82f6' : '#60a5fa'),
    pending: customStatus?.pending || (isLight ? '#8b5cf6' : '#a78bfa'),
  };

  return {
    // Core brand colors with hierarchy
    primary,
    primaryLight: isLight ? lighten(primary, 0.2) : lighten(primary, 0.1),
    primaryDark: isLight ? darken(primary, 0.1) : darken(primary, 0.2),
    secondary,
    accent,

    // Background system - consistent hierarchy
    background,
    backgroundSecondary: isLight ? darken(background, 0.02) : lighten(background, 0.02),
    surface,
    surfaceElevated: isLight ? lighten(surface, 0.03) : lighten(surface, 0.05),
    card: surface,
    cardHover: isLight ? darken(surface, 0.02) : lighten(surface, 0.03),

    // Border system
    border: isLight ? '#e2e8f0' : '#334155',
    borderLight: isLight ? '#f1f5f9' : '#1e293b',
    borderStrong: isLight ? '#cbd5e1' : '#475569',

    // Text hierarchy
    text: {
      primary: textPrimary,
      secondary: textSecondary,
      tertiary: isLight ? '#64748b' : '#cbd5e1',
      accent,
      inverse: isLight ? '#ffffff' : '#000000',
    },

    // Status system with theme-specific colors and light variants
    status: {
      success: statusColors.success,
      successLight: isLight ? alpha(statusColors.success, 0.1) : alpha(statusColors.success, 0.2),
      warning: statusColors.warning,
      warningLight: isLight ? alpha(statusColors.warning, 0.1) : alpha(statusColors.warning, 0.2),
      error: statusColors.error,
      errorLight: isLight ? alpha(statusColors.error, 0.1) : alpha(statusColors.error, 0.2),
      info: statusColors.info,
      infoLight: isLight ? alpha(statusColors.info, 0.1) : alpha(statusColors.info, 0.2),
      pending: statusColors.pending,
      pendingLight: isLight ? alpha(statusColors.pending, 0.1) : alpha(statusColors.pending, 0.2),
    },

    // Application-specific colors that harmonize with the theme
    application: {
      applied: statusColors.info,
      appliedLight: isLight ? alpha(statusColors.info, 0.1) : alpha(statusColors.info, 0.2),
      screening: statusColors.pending,
      screeningLight: isLight ? alpha(statusColors.pending, 0.1) : alpha(statusColors.pending, 0.2),
      interview: statusColors.success,
      interviewLight: isLight ? alpha(statusColors.success, 0.1) : alpha(statusColors.success, 0.2),
      offer: darken(statusColors.success, 0.1),
      offerLight: isLight ? alpha(darken(statusColors.success, 0.1), 0.1) : alpha(darken(statusColors.success, 0.1), 0.2),
      rejected: statusColors.error,
      rejectedLight: isLight ? alpha(statusColors.error, 0.1) : alpha(statusColors.error, 0.2),
    },

    // Interactive states
    interactive: {
      hover: isLight ? '#f8fafc' : '#334155',
      active: isLight ? '#e2e8f0' : '#475569',
      focus: primary,
      disabled: isLight ? '#f1f5f9' : '#1e293b',
      selected: isLight ? lighten(primary, 0.4) : alpha(primary, 0.2),
    },

    // Glass morphism
    glass: {
      subtle: isLight ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
      medium: isLight ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
      strong: isLight ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)',
      overlay: isLight ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.6)',
    },

    // Shadow system
    shadows: {
      subtle: isLight ? '0 1px 3px rgba(0,0,0,0.08)' : '0 1px 3px rgba(0,0,0,0.3)',
      medium: isLight ? '0 4px 12px rgba(0,0,0,0.1)' : '0 4px 12px rgba(0,0,0,0.4)',
      strong: isLight ? '0 20px 25px rgba(0,0,0,0.15)' : '0 20px 25px rgba(0,0,0,0.5)',
      glow: `0 0 20px ${alpha(primary, 0.3)}`,
    },
  };
};

// Helper functions for color manipulation
const lighten = (color: string, amount: number): string => {
  // Simple lighten implementation - in production, use a proper color library
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const num = parseInt(hex, 16);
    const r = Math.min(255, Math.floor((num >> 16) + amount * 255));
    const g = Math.min(255, Math.floor(((num >> 8) & 0x00FF) + amount * 255));
    const b = Math.min(255, Math.floor((num & 0x0000FF) + amount * 255));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  }
  return color;
};

const darken = (color: string, amount: number): string => {
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const num = parseInt(hex, 16);
    const r = Math.max(0, Math.floor((num >> 16) - amount * 255));
    const g = Math.max(0, Math.floor(((num >> 8) & 0x00FF) - amount * 255));
    const b = Math.max(0, Math.floor((num & 0x0000FF) - amount * 255));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  }
  return color;
};

const alpha = (color: string, opacity: number): string => {
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const num = parseInt(hex, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return color;
};

// Comprehensive theme definitions with dynamic light/dark support
const themes: ThemeSettings[] = [
  // Professional Theme - Clean and business-focused
  {
    name: 'professional',
    label: 'Professional',
    description: 'Clean and professional design perfect for business',
    category: 'professional',
    mode: 'light', // This will be dynamically toggled
    fontFamily: 'inter',
    borderRadius: 'lg',
    animation: 'subtle',
    glassEffect: 'medium',
    colors: createColorPalette(
      '#2563eb', '#3b82f6', '#1d4ed8',
      '#ffffff', '#f8fafc',
      '#0f172a', '#475569', 'light',
      {
        success: '#059669',
        warning: '#d97706',
        error: '#dc2626',
        info: '#0284c7',
        pending: '#7c3aed'
      }
    ),
    background: {
      type: 'gradient',
      colors: ['#ffffff', '#f8fafc', '#f1f5f9'],
      pattern: 'none',
      patternOpacity: 0.0,
    },
  },

  // Modern Theme - Tech startup aesthetic
  {
    name: 'modern',
    label: 'Modern',
    description: 'Cutting-edge tech aesthetic with vibrant accents',
    category: 'modern',
    mode: 'light',
    fontFamily: 'inter',
    borderRadius: 'xl',
    animation: 'moderate',
    glassEffect: 'medium',
    colors: createColorPalette(
      '#0ea5e9', '#06b6d4', '#0284c7',
      '#ffffff', '#f0f9ff',
      '#0c4a6e', '#64748b', 'light',
      {
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#38bdf8',
        pending: '#a78bfa'
      }
    ),
    background: {
      type: 'gradient',
      colors: ['#ffffff', '#f0f9ff', '#e0f2fe'],
      pattern: 'none',
      patternOpacity: 0.0,
    },
  },

  // Creative Theme - Artistic and expressive
  {
    name: 'creative',
    label: 'Creative',
    description: 'Inspiring creative palette for designers and artists',
    category: 'creative',
    mode: 'light',
    fontFamily: 'geist',
    borderRadius: 'lg',
    animation: 'smooth',
    glassEffect: 'subtle',
    colors: createColorPalette(
      '#ea580c', '#f97316', '#dc2626',
      '#fffbeb', '#fef3c7',
      '#1c1917', '#78716c', 'light',
      {
        success: '#059669',
        warning: '#d97706',
        error: '#dc2626',
        info: '#0ea5e9',
        pending: '#8b5cf6'
      }
    ),
    background: {
      type: 'gradient',
      colors: ['#fffbeb', '#fef3c7', '#fde68a'],
      pattern: 'none',
      patternOpacity: 0.0,
    },
  },

  // Developer Theme - Code-focused with excellent readability
  {
    name: 'developer',
    label: 'Developer',
    description: 'Optimized for coding with excellent readability',
    category: 'technical',
    mode: 'light',
    fontFamily: 'jetbrains-mono',
    borderRadius: 'md',
    animation: 'minimal',
    glassEffect: 'subtle',
    colors: createColorPalette(
      '#059669', '#0d9488', '#0f766e',
      '#f0fdfa', '#ecfdf5',
      '#064e3b', '#065f46', 'light',
      {
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#0ea5e9',
        pending: '#8b5cf6'
      }
    ),
    background: {
      type: 'solid',
      colors: ['#f0fdfa'],
      pattern: 'none',
      patternOpacity: 0.0,
    },
  },
];

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const getInitialTheme = (): ThemeName => {
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('themeName');
    if (savedTheme && themes.some(t => t.name === savedTheme)) {
      return savedTheme as ThemeName;
    }
  }
  return 'professional';
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [themeName, setThemeName] = useState<ThemeName>('professional');
  const [currentTheme, setCurrentTheme] = useState<ThemeSettings>(themes[0]);

  // Load saved theme on mount
  useEffect(() => {
    const initialThemeName = getInitialTheme();
    setThemeName(initialThemeName);

    const savedThemeSettings = localStorage.getItem('themeSettings');
    const savedMode = localStorage.getItem('currentMode') as ColorMode | null;

    if (initialThemeName === 'custom' && savedThemeSettings) {
      try {
        const parsedSettings = JSON.parse(savedThemeSettings) as ThemeSettings;
        setCurrentTheme(parsedSettings);
      } catch (e) {
        const defaultTheme = themes.find(t => t.name === initialThemeName) || themes[0];
        setCurrentTheme(defaultTheme);
      }
    } else {
      const themeOption = themes.find(t => t.name === initialThemeName);
      if (themeOption) {
        if (savedMode && savedMode !== themeOption.mode) {
          // Apply saved mode to the theme
          const updatedTheme = { ...themeOption, mode: savedMode };
          setCurrentTheme(updatedTheme);
        } else {
          setCurrentTheme(themeOption);
        }
      }
    }
  }, []);

  // Apply theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Apply theme classes
    const themeClasses = [
      currentTheme.mode,
      `font-${currentTheme.fontFamily}`,
      `rounded-${currentTheme.borderRadius}`,
      `anim-${currentTheme.animation}`,
      `glass-${currentTheme.glassEffect}`,
    ];

    // Clean up old theme classes but preserve other classes
    const preservedBodyClasses = document.body.className
      .split(' ')
      .filter(cls => !['light', 'dark', 'font-inter', 'font-lexend', 'font-fira-code', 'font-jetbrains-mono', 'font-jetbrains', 'font-playfair', 'font-crimson', 'font-geist', 'rounded-none', 'rounded-sm', 'rounded-md', 'rounded-lg', 'rounded-xl', 'rounded-full', 'anim-none', 'anim-minimal', 'anim-subtle', 'anim-moderate', 'anim-smooth', 'anim-playful', 'anim-intense', 'glass-none', 'glass-subtle', 'glass-medium', 'glass-heavy', 'glass-extreme'].includes(cls));

    const preservedDocClasses = document.documentElement.className
      .split(' ')
      .filter(cls => !['light', 'dark', 'font-inter', 'font-lexend', 'font-fira-code', 'font-jetbrains-mono', 'font-jetbrains', 'font-playfair', 'font-crimson', 'font-geist', 'rounded-none', 'rounded-sm', 'rounded-md', 'rounded-lg', 'rounded-xl', 'rounded-full', 'anim-none', 'anim-minimal', 'anim-subtle', 'anim-moderate', 'anim-smooth', 'anim-playful', 'anim-intense', 'glass-none', 'glass-subtle', 'glass-medium', 'glass-heavy', 'glass-extreme'].includes(cls));

    // Apply new theme classes while preserving existing ones
    document.body.className = [...preservedBodyClasses, ...themeClasses].join(' ');
    document.documentElement.className = [...preservedDocClasses, ...themeClasses].join(' ');

    // Apply CSS variables for colors
    const { colors, background } = currentTheme;

    Object.entries(colors).forEach(([key, value]) => {
      if (typeof value === 'string') {
        document.documentElement.style.setProperty(`--${key}`, value);
      } else if (typeof value === 'object' && value !== null) {
        Object.entries(value).forEach(([subKey, subValue]) => {
          if (typeof subValue === 'string') {
            document.documentElement.style.setProperty(`--${key}-${subKey}`, subValue);
          }
        });
      }
    });

    // Apply comprehensive background system - NO OVERLAYS OR PATTERNS
    const applyBackground = () => {
      const body = document.body;
      const { type, colors: bgColors } = background;

      // Completely reset all background properties
      body.style.background = '';
      body.style.backgroundImage = '';
      body.style.backgroundColor = '';
      body.style.backgroundAttachment = '';
      body.style.backgroundSize = '';
      body.style.backgroundRepeat = '';

      // Apply ONLY the clean base background - NO PATTERNS OR OVERLAYS
      switch (type) {
        case 'solid':
          body.style.backgroundColor = bgColors[0] || currentTheme.colors.background;
          console.log('Applied solid background to body:', bgColors[0] || currentTheme.colors.background);
          break;

        case 'gradient':
          if (bgColors.length >= 2) {
            body.style.background = `linear-gradient(135deg, ${bgColors.join(', ')})`;
            console.log('Applied gradient background to body:', `linear-gradient(135deg, ${bgColors.join(', ')})`);
          } else {
            body.style.backgroundColor = bgColors[0] || currentTheme.colors.background;
            console.log('Applied single color background to body:', bgColors[0] || currentTheme.colors.background);
          }
          break;

        case 'radial':
          if (bgColors.length >= 2) {
            body.style.background = `radial-gradient(ellipse at center, ${bgColors.join(', ')})`;
          } else {
            body.style.backgroundColor = bgColors[0] || currentTheme.colors.background;
          }
          break;

        case 'conic':
          if (bgColors.length >= 2) {
            body.style.background = `conic-gradient(from 0deg at 50% 50%, ${bgColors.join(', ')})`;
          } else {
            body.style.backgroundColor = bgColors[0] || currentTheme.colors.background;
          }
          break;

        case 'mesh':
          if (bgColors.length >= 2) {
            // Simple clean gradient - no complex mesh patterns
            body.style.background = `linear-gradient(135deg, ${bgColors[0]}, ${bgColors[1]})`;
          } else {
            body.style.backgroundColor = bgColors[0] || currentTheme.colors.background;
          }
          break;

        default:
          body.style.backgroundColor = currentTheme.colors.background;
      }

      // Set background attachment for stability
      body.style.backgroundAttachment = 'fixed';

      // Set CSS custom properties for components
      document.documentElement.style.setProperty('--actual-background', body.style.background || body.style.backgroundColor);
    }; applyBackground();

    // Apply comprehensive theme variables for enhanced visual differentiation
    const docStyle = document.documentElement.style;

    // Core colors
    Object.entries(currentTheme.colors).forEach(([key, value]) => {
      if (typeof value === 'string') {
        docStyle.setProperty(`--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`, value);
      }
    });

    // Text colors with new hierarchy
    docStyle.setProperty('--text-primary', currentTheme.colors.text.primary);
    docStyle.setProperty('--text-secondary', currentTheme.colors.text.secondary);
    docStyle.setProperty('--text-tertiary', currentTheme.colors.text.tertiary);
    docStyle.setProperty('--text-accent', currentTheme.colors.text.accent);
    docStyle.setProperty('--text-inverse', currentTheme.colors.text.inverse);

    // Enhanced background system
    docStyle.setProperty('--background-secondary', currentTheme.colors.backgroundSecondary);
    docStyle.setProperty('--surface-elevated', currentTheme.colors.surfaceElevated);
    docStyle.setProperty('--card-hover', currentTheme.colors.cardHover);

    // Border system
    docStyle.setProperty('--border-light', currentTheme.colors.borderLight);
    docStyle.setProperty('--border-strong', currentTheme.colors.borderStrong);

    // Status colors with light variants
    docStyle.setProperty('--status-success', currentTheme.colors.status.success);
    docStyle.setProperty('--status-success-light', currentTheme.colors.status.successLight);
    docStyle.setProperty('--status-warning', currentTheme.colors.status.warning);
    docStyle.setProperty('--status-warning-light', currentTheme.colors.status.warningLight);
    docStyle.setProperty('--status-error', currentTheme.colors.status.error);
    docStyle.setProperty('--status-error-light', currentTheme.colors.status.errorLight);
    docStyle.setProperty('--status-info', currentTheme.colors.status.info);
    docStyle.setProperty('--status-info-light', currentTheme.colors.status.infoLight);
    docStyle.setProperty('--status-pending', currentTheme.colors.status.pending);
    docStyle.setProperty('--status-pending-light', currentTheme.colors.status.pendingLight);

    // Application stage colors with light variants
    docStyle.setProperty('--application-applied', currentTheme.colors.application.applied);
    docStyle.setProperty('--application-applied-light', currentTheme.colors.application.appliedLight);
    docStyle.setProperty('--application-screening', currentTheme.colors.application.screening);
    docStyle.setProperty('--application-screening-light', currentTheme.colors.application.screeningLight);
    docStyle.setProperty('--application-interview', currentTheme.colors.application.interview);
    docStyle.setProperty('--application-interview-light', currentTheme.colors.application.interviewLight);
    docStyle.setProperty('--application-offer', currentTheme.colors.application.offer);
    docStyle.setProperty('--application-offer-light', currentTheme.colors.application.offerLight);
    docStyle.setProperty('--application-rejected', currentTheme.colors.application.rejected);
    docStyle.setProperty('--application-rejected-light', currentTheme.colors.application.rejectedLight);

    // Interactive states
    docStyle.setProperty('--hover-bg', currentTheme.colors.interactive.hover);
    docStyle.setProperty('--active-bg', currentTheme.colors.interactive.active);
    docStyle.setProperty('--focus-ring', currentTheme.colors.interactive.focus);
    docStyle.setProperty('--disabled-bg', currentTheme.colors.interactive.disabled);
    docStyle.setProperty('--selected-bg', currentTheme.colors.interactive.selected);

    // Glass morphism system
    docStyle.setProperty('--glass-subtle', currentTheme.colors.glass.subtle);
    docStyle.setProperty('--glass-medium', currentTheme.colors.glass.medium);
    docStyle.setProperty('--glass-strong', currentTheme.colors.glass.strong);
    docStyle.setProperty('--glass-overlay', currentTheme.colors.glass.overlay);

    // Shadow system
    docStyle.setProperty('--shadow-subtle', currentTheme.colors.shadows.subtle);
    docStyle.setProperty('--shadow-medium', currentTheme.colors.shadows.medium);
    docStyle.setProperty('--shadow-strong', currentTheme.colors.shadows.strong);
    docStyle.setProperty('--shadow-glow', currentTheme.colors.shadows.glow);

    // Enhanced backgrounds with theme-specific adjustments - SOLID COLORS ONLY
    const bgColor = background.colors[0] || currentTheme.colors.background;
    const surfaceColor = background.colors[1] || currentTheme.colors.surface;

    // Parse RGB values for dynamic glass effects
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '255, 255, 255';
    };

    const bgRgb = hexToRgb(bgColor);
    const surfaceRgb = hexToRgb(surfaceColor);
    const primaryRgb = hexToRgb(currentTheme.colors.primary);

    // Critical component variables that are missing - ADDED AFTER primaryRgb is defined
    docStyle.setProperty('--accent-primary', currentTheme.colors.primary);
    docStyle.setProperty('--accent-primary-rgb', primaryRgb);
    docStyle.setProperty('--border-thin', `rgba(${primaryRgb}, ${currentTheme.mode === 'dark' ? '0.3' : '0.15'})`);

    // Essential CSS variables for consistent theming
    docStyle.setProperty('--primary', currentTheme.colors.primary);
    docStyle.setProperty('--secondary', currentTheme.colors.secondary);
    docStyle.setProperty('--accent', currentTheme.colors.accent);
    docStyle.setProperty('--background', currentTheme.colors.background);
    docStyle.setProperty('--surface', currentTheme.colors.surface);
    docStyle.setProperty('--card', currentTheme.colors.card);
    docStyle.setProperty('--border', currentTheme.colors.border);

    // Debug: Log the background color being set
    console.log('Setting --background to:', currentTheme.colors.background, 'for mode:', currentTheme.mode);

    // Essential accent colors used throughout the app
    const isLight = currentTheme.mode === 'light';
    docStyle.setProperty('--accent-blue', isLight ? '#3b82f6' : '#60a5fa');
    docStyle.setProperty('--accent-purple', isLight ? '#8b5cf6' : '#a78bfa');
    docStyle.setProperty('--accent-pink', isLight ? '#ec4899' : '#f472b6');
    docStyle.setProperty('--accent-orange', isLight ? '#f97316' : '#fb923c');
    docStyle.setProperty('--accent-green', isLight ? '#10b981' : '#34d399');
    docStyle.setProperty('--accent-yellow', isLight ? '#f59e0b' : '#fbbf24');
    docStyle.setProperty('--accent-red', isLight ? '#ef4444' : '#f87171');
    docStyle.setProperty('--accent-blue-light', isLight ? '#0ea5e9' : '#38bdf8');

    const hasBackgroundImage = background.type === 'pattern' || background.pattern !== 'none';

    // Only use glassmorphic effects if there's a background image/pattern
    if (hasBackgroundImage) {
      const glassIntensity = { none: 0, subtle: 0.05, medium: 0.1, heavy: 0.15, extreme: 0.2 }[currentTheme.glassEffect] || 0.1;
      const hoverBg = `rgba(${primaryRgb}, 0.05)`;

      docStyle.setProperty('--glass-bg', `rgba(${bgRgb}, ${glassIntensity})`);
      docStyle.setProperty('--glass-card-bg', `rgba(${surfaceRgb}, ${glassIntensity + 0.05})`);
      docStyle.setProperty('--glass-sidebar-bg', `rgba(${bgRgb}, ${glassIntensity + 0.02})`);
      docStyle.setProperty('--glass-hover-bg', hoverBg);
      docStyle.setProperty('--glass-button-bg', `rgba(${primaryRgb}, 0.08)`);
      docStyle.setProperty('--glass-input-bg', `rgba(${surfaceRgb}, ${glassIntensity + 0.03})`);
      docStyle.setProperty('--glass-selected-bg', `rgba(${primaryRgb}, 0.1)`);

      // Set the hover-bg variable that components expect
      docStyle.setProperty('--hover-bg', hoverBg);
    } else {
      // Use solid theme colors when no background image - with fallbacks for missing interactive properties
      const hoverBg = currentTheme.colors.interactive?.hover || `rgba(${primaryRgb}, 0.05)`;
      const selectedBg = currentTheme.colors.interactive?.selected || `rgba(${primaryRgb}, 0.1)`;

      docStyle.setProperty('--glass-bg', currentTheme.colors.background);
      docStyle.setProperty('--glass-card-bg', currentTheme.colors.card);
      docStyle.setProperty('--glass-sidebar-bg', currentTheme.colors.background);
      docStyle.setProperty('--glass-hover-bg', hoverBg);
      docStyle.setProperty('--glass-button-bg', currentTheme.colors.card);
      docStyle.setProperty('--glass-input-bg', currentTheme.colors.card);
      docStyle.setProperty('--glass-selected-bg', selectedBg);

      // Set the hover-bg variable that components expect
      docStyle.setProperty('--hover-bg', hoverBg);
    }

    const secondaryRgb = hexToRgb(currentTheme.colors.secondary);
    const accentRgb = hexToRgb(currentTheme.colors.accent);

    // Get theme-specific styling configuration for COMPLETE visual overhaul
    const defaultGlassIntensity = 0.1; // Default for theme config
    const themeConfig = getThemeSpecificStyling(currentTheme.name, primaryRgb, secondaryRgb, accentRgb, bgRgb, defaultGlassIntensity, currentTheme, hasBackgroundImage);

    // Apply ALL theme-specific variables for RADICAL styling changes
    Object.entries(themeConfig).forEach(([key, value]) => {
      docStyle.setProperty(`--${key}`, value);
    });

    // Borders with theme-specific styling
    docStyle.setProperty('--border-thin', `rgba(${primaryRgb}, 0.15)`);
    docStyle.setProperty('--border-divider', `rgba(${primaryRgb}, 0.08)`);
    docStyle.setProperty('--border-hover', `rgba(${primaryRgb}, 0.25)`);

    // Shadows with theme colors
    const shadowColor = currentTheme.mode === 'dark' ? '0, 0, 0' : primaryRgb;
    docStyle.setProperty('--shadow-sm', `0 1px 2px rgba(${shadowColor}, 0.1)`);
    docStyle.setProperty('--shadow-md', `0 4px 6px rgba(${shadowColor}, 0.1)`);
    docStyle.setProperty('--shadow-lg', `0 10px 15px rgba(${shadowColor}, 0.1)`);

    // Font and styling based on theme
    docStyle.setProperty('--font-family', getFontFamily(currentTheme.fontFamily));
    docStyle.setProperty('--border-radius', getBorderRadius(currentTheme.borderRadius));
    docStyle.setProperty('--blur-amount', getBlurAmount(currentTheme.glassEffect));

    // RGB values for components
    docStyle.setProperty('--accent-primary-rgb', primaryRgb);
    docStyle.setProperty('--accent-secondary-rgb', secondaryRgb);
    docStyle.setProperty('--accent-tertiary-rgb', accentRgb);

    // Background color variables for components that need theme-aware backgrounds
    docStyle.setProperty('--bg-primary', background.colors[0] || currentTheme.colors.background);
    docStyle.setProperty('--bg-secondary', background.colors[1] || currentTheme.colors.surface);
    docStyle.setProperty('--bg-tertiary', background.colors[2] || currentTheme.colors.card);

    // Additional theme-specific RGB backgrounds for dynamic coloring
    docStyle.setProperty('--bg-primary-rgb', bgRgb);
    docStyle.setProperty('--bg-surface-rgb', surfaceRgb);

    // Background color variables for components
    docStyle.setProperty('--bg-color-primary', background.colors[0] || currentTheme.colors.background);
    docStyle.setProperty('--bg-color-secondary', background.colors[1] || currentTheme.colors.surface);
    docStyle.setProperty('--bg-color-tertiary', background.colors[2] || currentTheme.colors.card);

    // Add missing navbar and component variables
    docStyle.setProperty('--max-content-width', '1400px');
    docStyle.setProperty('--navbar-left-gap', '40px');
    docStyle.setProperty('--button-padding-sm', '8px');
    docStyle.setProperty('--transition-normal', '0.3s');
    docStyle.setProperty('--transition-fast', '0.2s');
    docStyle.setProperty('--easing-standard', 'cubic-bezier(0.4, 0, 0.2, 1)');

    // Save theme preferences
    localStorage.setItem('themeName', themeName);
    if (themeName === 'custom') {
      localStorage.setItem('themeSettings', JSON.stringify(currentTheme));
    }
  }, [currentTheme, themeName]);

  const getThemeSpecificStyling = (themeName: ThemeName, primaryRgb: string, secondaryRgb: string, accentRgb: string, bgRgb: string, glassIntensity: number, theme: ThemeSettings, hasBackgroundImage: boolean) => {
    const baseTheme = themeName.replace('-dark', '') as string;

    const themeConfigs = {
      'startup': {
        // Modern, clean, minimal - SOLID BACKGROUNDS
        'glass-navbar-bg': hasBackgroundImage ? `linear-gradient(90deg, rgba(${primaryRgb}, 0.08), rgba(${bgRgb}, 0.1))` : theme.colors.background,
        'glass-container-bg': hasBackgroundImage ? `rgba(${primaryRgb}, 0.03)` : theme.colors.card,
        'glass-card-container-bg': hasBackgroundImage ? `rgba(${primaryRgb}, 0.05)` : theme.colors.card,
        'glass-period-selector-bg': hasBackgroundImage ? `rgba(${primaryRgb}, 0.08)` : theme.colors.card,
        'navbar-border': `1px solid rgba(${primaryRgb}, 0.2)`,
        'navbar-shadow': `0 4px 12px rgba(${primaryRgb}, 0.15)`,
        'card-border-radius': '12px',
        'button-border-radius': '8px',
        'input-border-radius': '8px',
        'table-border-radius': '10px',
        'container-border-radius': '16px',
        'navbar-border-radius': '0px',
        'sidebar-width': '280px',
        'search-height': '44px',
        'card-padding': '24px',
        'container-padding': '32px',
        'button-padding': '12px 20px',
        'text-transform': 'none',
        'font-weight-primary': '500',
        'font-weight-secondary': '400',
        'font-weight-headers': '600',
        'letter-spacing': '-0.01em',
        'button-shadow': `0 2px 8px rgba(${primaryRgb}, 0.2)`,
        'card-shadow': `0 4px 12px rgba(${primaryRgb}, 0.1)`,
        'table-header-bg': `rgba(${primaryRgb}, 0.1)`,
        'table-row-hover': `rgba(${primaryRgb}, 0.05)`,
        'navbar-height': '64px',
        'sidebar-border': `1px solid rgba(${primaryRgb}, 0.1)`
      },
      'gothic': {
        // Dark, dramatic, sharp edges - SOLID BACKGROUNDS
        'glass-navbar-bg': hasBackgroundImage ? `linear-gradient(90deg, rgba(${primaryRgb}, 0.15), rgba(0, 0, 0, 0.3))` : theme.colors.background,
        'glass-container-bg': hasBackgroundImage ? `rgba(${primaryRgb}, 0.08)` : theme.colors.card,
        'glass-card-container-bg': hasBackgroundImage ? `rgba(${primaryRgb}, 0.1)` : theme.colors.card,
        'glass-period-selector-bg': hasBackgroundImage ? `rgba(${primaryRgb}, 0.12)` : theme.colors.card,
        'navbar-border': `2px solid rgba(${primaryRgb}, 0.4)`,
        'navbar-shadow': `0 8px 25px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(${primaryRgb}, 0.3)`,
        'card-border-radius': '2px',
        'button-border-radius': '0px',
        'input-border-radius': '0px',
        'table-border-radius': '0px',
        'container-border-radius': '4px',
        'navbar-border-radius': '0px',
        'sidebar-width': '300px',
        'search-height': '48px',
        'card-padding': '32px',
        'container-padding': '40px',
        'button-padding': '16px 32px',
        'text-transform': 'uppercase',
        'font-weight-primary': '700',
        'font-weight-secondary': '600',
        'font-weight-headers': '800',
        'letter-spacing': '0.05em',
        'button-shadow': `0 0 15px rgba(${primaryRgb}, 0.4)`,
        'card-shadow': `0 8px 32px rgba(0, 0, 0, 0.4)`,
        'table-header-bg': `rgba(${primaryRgb}, 0.2)`,
        'table-row-hover': `rgba(${primaryRgb}, 0.1)`,
        'navbar-height': '72px',
        'sidebar-border': `2px solid rgba(${primaryRgb}, 0.3)`
      },
      'cyberpunk': {
        // Neon, glowing, futuristic - SOLID BACKGROUNDS
        'glass-navbar-bg': hasBackgroundImage ? `linear-gradient(45deg, rgba(${primaryRgb}, 0.2), rgba(${bgRgb}, 0.1))` : theme.colors.background,
        'glass-container-bg': hasBackgroundImage ? `rgba(${bgRgb}, 0.08)` : theme.colors.card,
        'glass-card-container-bg': hasBackgroundImage ? `rgba(${bgRgb}, 0.1)` : theme.colors.card,
        'glass-period-selector-bg': hasBackgroundImage ? `linear-gradient(45deg, rgba(${primaryRgb}, 0.15), rgba(${accentRgb}, 0.1))` : theme.colors.card,
        'navbar-border': `2px solid rgba(${primaryRgb}, 0.8)`,
        'navbar-shadow': `0 0 30px rgba(${primaryRgb}, 0.5), inset 0 1px 0 rgba(${primaryRgb}, 0.3), 0 0 60px rgba(${accentRgb}, 0.3)`,
        'card-border-radius': '0px',
        'button-border-radius': '0px',
        'input-border-radius': '0px',
        'table-border-radius': '0px',
        'container-border-radius': '0px',
        'navbar-border-radius': '0px',
        'sidebar-width': '320px',
        'search-height': '52px',
        'card-padding': '28px',
        'container-padding': '36px',
        'button-padding': '16px 32px',
        'text-transform': 'none',
        'font-weight-primary': '700',
        'font-weight-secondary': '600',
        'font-weight-headers': '800',
        'letter-spacing': '0.1em',
        'button-shadow': `0 0 20px rgba(${primaryRgb}, 0.6), inset 0 1px 0 rgba(${primaryRgb}, 0.4)`,
        'card-shadow': `0 0 25px rgba(${primaryRgb}, 0.3)`,
        'table-header-bg': `linear-gradient(45deg, rgba(${primaryRgb}, 0.2), rgba(${accentRgb}, 0.15))`,
        'table-row-hover': `rgba(${primaryRgb}, 0.15)`,
        'navbar-height': '68px',
        'sidebar-border': `2px solid rgba(${primaryRgb}, 0.6)`
      },
      'enterprise': {
        // Professional, corporate, subtle - SOLID BACKGROUNDS
        'glass-navbar-bg': hasBackgroundImage ? `linear-gradient(90deg, rgba(${primaryRgb}, 0.06), rgba(${secondaryRgb}, 0.04))` : theme.colors.background,
        'glass-container-bg': hasBackgroundImage ? `rgba(${primaryRgb}, 0.03)` : theme.colors.card,
        'glass-card-container-bg': hasBackgroundImage ? `rgba(${primaryRgb}, 0.04)` : theme.colors.card,
        'glass-period-selector-bg': hasBackgroundImage ? `rgba(${primaryRgb}, 0.05)` : theme.colors.card,
        'navbar-border': `1px solid rgba(${primaryRgb}, 0.08)`,
        'navbar-shadow': `0 1px 3px rgba(0, 0, 0, 0.1)`,
        'card-border-radius': '6px',
        'button-border-radius': '4px',
        'input-border-radius': '4px',
        'table-border-radius': '6px',
        'container-border-radius': '8px',
        'navbar-border-radius': '0px',
        'sidebar-width': '260px',
        'search-height': '40px',
        'card-padding': '20px',
        'container-padding': '24px',
        'button-padding': '10px 16px',
        'text-transform': 'none',
        'font-weight-primary': '400',
        'font-weight-secondary': '300',
        'font-weight-headers': '500',
        'letter-spacing': '0em',
        'button-shadow': `0 1px 3px rgba(${primaryRgb}, 0.1)`,
        'card-shadow': `0 2px 8px rgba(0, 0, 0, 0.08)`,
        'table-header-bg': `rgba(${primaryRgb}, 0.05)`,
        'table-row-hover': `rgba(${primaryRgb}, 0.03)`,
        'navbar-height': '56px',
        'sidebar-border': `1px solid rgba(${primaryRgb}, 0.1)`
      },
      'developer': {
        // Code-focused, technical, monospace - SOLID BACKGROUNDS
        'glass-navbar-bg': hasBackgroundImage ? `linear-gradient(90deg, rgba(${primaryRgb}, 0.1), rgba(${accentRgb}, 0.08))` : theme.colors.background,
        'glass-container-bg': hasBackgroundImage ? `rgba(${primaryRgb}, 0.05)` : theme.colors.card,
        'glass-card-container-bg': hasBackgroundImage ? `rgba(${primaryRgb}, 0.07)` : theme.colors.card,
        'glass-period-selector-bg': hasBackgroundImage ? `rgba(${primaryRgb}, 0.09)` : theme.colors.card,
        'navbar-border': `2px solid rgba(${primaryRgb}, 0.3)`,
        'navbar-shadow': `inset 0 1px 0 rgba(${primaryRgb}, 0.2), 0 2px 4px rgba(${primaryRgb}, 0.1)`,
        'card-border-radius': '8px',
        'button-border-radius': '6px',
        'input-border-radius': '6px',
        'table-border-radius': '8px',
        'container-border-radius': '10px',
        'navbar-border-radius': '0px',
        'sidebar-width': '300px',
        'search-height': '46px',
        'card-padding': '24px',
        'container-padding': '32px',
        'button-padding': '12px 24px',
        'text-transform': 'none',
        'font-weight-primary': '500',
        'font-weight-secondary': '400',
        'font-weight-headers': '600',
        'letter-spacing': '0.02em',
        'button-shadow': `inset 0 1px 0 rgba(${primaryRgb}, 0.2)`,
        'card-shadow': `0 4px 8px rgba(${primaryRgb}, 0.1)`,
        'table-header-bg': `rgba(${primaryRgb}, 0.1)`,
        'table-row-hover': `rgba(${primaryRgb}, 0.06)`,
        'navbar-height': '60px',
        'sidebar-border': `2px solid rgba(${primaryRgb}, 0.2)`
      },
      'luxury': {
        // Premium, elegant, refined - SOLID BACKGROUNDS
        'glass-navbar-bg': hasBackgroundImage ? `linear-gradient(90deg, rgba(${primaryRgb}, 0.1), rgba(${accentRgb}, 0.06))` : theme.colors.background,
        'glass-container-bg': hasBackgroundImage ? `rgba(${primaryRgb}, 0.03)` : theme.colors.card,
        'glass-card-container-bg': hasBackgroundImage ? `rgba(${primaryRgb}, 0.05)` : theme.colors.card,
        'glass-period-selector-bg': hasBackgroundImage ? `rgba(${primaryRgb}, 0.07)` : theme.colors.card,
        'navbar-border': `1px solid rgba(${primaryRgb}, 0.25)`,
        'navbar-shadow': `0 6px 20px rgba(${primaryRgb}, 0.2), 0 1px 3px rgba(${primaryRgb}, 0.1)`,
        'card-border-radius': '16px',
        'button-border-radius': '12px',
        'input-border-radius': '12px',
        'table-border-radius': '14px',
        'container-border-radius': '20px',
        'navbar-border-radius': '0px',
        'sidebar-width': '290px',
        'search-height': '50px',
        'card-padding': '30px',
        'container-padding': '40px',
        'button-padding': '16px 28px',
        'text-transform': 'none',
        'font-weight-primary': '500',
        'font-weight-secondary': '400',
        'font-weight-headers': '600',
        'letter-spacing': '0.01em',
        'button-shadow': `0 4px 12px rgba(${primaryRgb}, 0.25)`,
        'card-shadow': `0 8px 24px rgba(${primaryRgb}, 0.15)`,
        'table-header-bg': `rgba(${primaryRgb}, 0.08)`,
        'table-row-hover': `rgba(${primaryRgb}, 0.04)`,
        'navbar-height': '70px',
        'sidebar-border': `1px solid rgba(${primaryRgb}, 0.15)`
      }
    };

    return themeConfigs[baseTheme as keyof typeof themeConfigs] || themeConfigs['startup'];
  }; const getFontFamily = (font: FontFamily): string => {
    const fontMap = {
      'inter': 'Inter, system-ui, sans-serif',
      'lexend': 'Lexend, system-ui, sans-serif',
      'fira-code': 'Fira Code, Monaco, Consolas, monospace',
      'jetbrains-mono': 'JetBrains Mono, Monaco, Consolas, monospace',
      'jetbrains': 'JetBrains Mono, Monaco, Consolas, monospace',
      'playfair': 'Playfair Display, Georgia, serif',
      'crimson': 'Crimson Text, Georgia, serif',
      'geist': 'Geist, Inter, system-ui, sans-serif'
    };
    return fontMap[font] || fontMap.inter;
  };

  const getBorderRadius = (radius: BorderRadius): string => {
    const radiusMap = {
      none: '0px',
      sm: '4px',
      md: '6px',
      lg: '8px',
      xl: '12px',
      full: '9999px'
    };
    return radiusMap[radius] || '6px';
  };

  const getBlurAmount = (glass: GlassEffect): string => {
    const blurMap = {
      none: '0px',
      subtle: '4px',
      medium: '12px',
      heavy: '20px',
      extreme: '40px'
    };
    return blurMap[glass] || '12px';
  };

  const getNavbarStyle = (themeName: ThemeName, bgRgb: string, primaryRgb: string, glassIntensity: number) => {
    // Theme-specific navbar styling
    const themeStyles = {
      'startup': {
        background: `rgba(${bgRgb}, 0.95)`,
        border: `1px solid rgba(${primaryRgb}, 0.2)`,
        shadow: `0 4px 12px rgba(${primaryRgb}, 0.15)`
      },
      'gothic': {
        background: `rgba(${bgRgb}, 0.9)`,
        border: `1px solid rgba(${primaryRgb}, 0.3)`,
        shadow: `0 8px 25px rgba(0, 0, 0, 0.4)`
      },
      'cyberpunk': {
        background: `linear-gradient(45deg, rgba(${primaryRgb}, 0.15), rgba(${bgRgb}, 0.9))`,
        border: `1px solid rgba(${primaryRgb}, 0.5)`,
        shadow: `0 0 20px rgba(${primaryRgb}, 0.3)`
      },
      'enterprise': {
        background: `rgba(${bgRgb}, 0.98)`,
        border: `1px solid rgba(${primaryRgb}, 0.1)`,
        shadow: `0 2px 8px rgba(0, 0, 0, 0.1)`
      },
      'developer': {
        background: `rgba(${bgRgb}, 0.95)`,
        border: `2px solid rgba(${primaryRgb}, 0.3)`,
        shadow: `inset 0 1px 0 rgba(${primaryRgb}, 0.1)`
      }
    };

    // Get base theme name (remove -dark suffix)
    const baseTheme = themeName.replace('-dark', '') as keyof typeof themeStyles;
    return themeStyles[baseTheme] || {
      background: `rgba(${bgRgb}, ${glassIntensity + 0.1})`,
      border: `1px solid rgba(${primaryRgb}, 0.15)`,
      shadow: `0 4px 12px rgba(${primaryRgb}, 0.1)`
    };
  };

  // Helper function to generate pattern SVG
  const generatePatternSvg = (pattern: BackgroundPattern, color: string, opacity: number): string => {
    // Ensure opacity is reasonable to avoid overwhelming the background
    const safeOpacity = Math.min(opacity, 0.15);

    const svgPatterns: Record<BackgroundPattern, string> = {
      'none': '',
      'dots': `<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="1" fill="${color}" fill-opacity="${safeOpacity}"/></svg>`,
      'grid': `<svg width="40" height="40" xmlns="http://www.w3.org/2000/svg"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="${color}" stroke-opacity="${safeOpacity}" stroke-width="0.5"/></svg>`,
      'lines': `<svg width="20" height="20" xmlns="http://www.w3.org/2000/svg"><path d="M 0 20 L 20 0" fill="none" stroke="${color}" stroke-opacity="${safeOpacity}" stroke-width="0.5"/></svg>`,
      'waves': `<svg width="60" height="30" xmlns="http://www.w3.org/2000/svg"><path d="M 0 15 Q 15 5 30 15 T 60 15" fill="none" stroke="${color}" stroke-opacity="${safeOpacity}" stroke-width="1"/></svg>`,
      'circuit': `<svg width="40" height="40" xmlns="http://www.w3.org/2000/svg"><g stroke="${color}" stroke-opacity="${safeOpacity}" stroke-width="0.5" fill="none"><path d="M 0 20 L 15 20"/><path d="M 25 20 L 40 20"/><path d="M 20 0 L 20 15"/><path d="M 20 25 L 20 40"/><circle cx="20" cy="20" r="3"/></g></svg>`,
      'geometric': `<svg width="30" height="30" xmlns="http://www.w3.org/2000/svg"><polygon points="15,2 27,15 15,28 3,15" fill="none" stroke="${color}" stroke-opacity="${safeOpacity}" stroke-width="0.5"/></svg>`,
      'hexagons': `<svg width="52" height="60" xmlns="http://www.w3.org/2000/svg"><polygon points="26,5 40,15 40,35 26,45 12,35 12,15" fill="none" stroke="${color}" stroke-opacity="${safeOpacity}" stroke-width="0.5"/></svg>`,
      'triangles': `<svg width="30" height="26" xmlns="http://www.w3.org/2000/svg"><polygon points="15,2 28,24 2,24" fill="none" stroke="${color}" stroke-opacity="${safeOpacity}" stroke-width="0.5"/></svg>`,
      'diamonds': `<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg"><polygon points="12,2 22,12 12,22 2,12" fill="none" stroke="${color}" stroke-opacity="${safeOpacity}" stroke-width="0.5"/></svg>`,
    };

    const patternSvg = svgPatterns[pattern] || '';
    return patternSvg ? `data:image/svg+xml;base64,${btoa(patternSvg)}` : '';
  };

  // Helper function to generate noise SVG
  const generateNoiseSvg = (opacity: number): string => {
    // Keep noise very subtle
    const safeOpacity = Math.min(opacity, 0.08);
    const size = 50; // Smaller noise pattern
    let noiseData = '';

    // Generate fewer noise points for better performance
    for (let i = 0; i < size; i += 2) {
      for (let j = 0; j < size; j += 2) {
        if (Math.random() > 0.7) { // Only 30% chance of noise pixel
          const alpha = Math.random() * safeOpacity;
          const brightness = Math.random() > 0.5 ? 255 : 0; // Pure white or black
          noiseData += `<rect x="${i}" y="${j}" width="1" height="1" fill="rgb(${brightness},${brightness},${brightness})" fill-opacity="${alpha}"/>`;
        }
      }
    }

    const noiseSvg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">${noiseData}</svg>`;
    return `data:image/svg+xml;base64,${btoa(noiseSvg)}`;
  }; const handleThemeChange = (name: ThemeName) => {
    setThemeName(name);

    if (name !== 'custom') {
      const theme = themes.find(t => t.name === name);
      if (theme) {
        setCurrentTheme(theme);
      }
    }
  };

  const updateTheme = (updates: Partial<ThemeSettings>) => {
    setCurrentTheme(prev => ({ ...prev, ...updates }));
    setThemeName('custom');
  };

  const toggleColorMode = () => {
    const currentMode = currentTheme.mode;
    const newMode = currentMode === 'dark' ? 'light' : 'dark';

    console.log('🔄 toggleColorMode called:', { currentMode, newMode, themeName });

    // Update the current theme's mode and regenerate its colors for the new mode
    const updatedTheme = { ...currentTheme, mode: newMode };

    // Regenerate colors for the new mode while keeping the same theme aesthetics
    const themeData = themes.find(t => t.name === themeName);
    console.log('📋 Found theme data:', themeData?.name);
    if (themeData) {
      // Get the base theme configuration
      const baseTheme = { ...themeData };

      // Update the mode
      baseTheme.mode = newMode;

      // Regenerate colors with the same parameters but new mode
      if (themeName === 'professional') {
        baseTheme.colors = createColorPalette(
          '#2563eb', '#3b82f6', '#1d4ed8',
          newMode === 'light' ? '#ffffff' : '#0f172a',
          newMode === 'light' ? '#f8fafc' : '#1e293b',
          newMode === 'light' ? '#0f172a' : '#f1f5f9',
          newMode === 'light' ? '#475569' : '#94a3b8',
          newMode,
          {
            success: '#059669',
            warning: '#d97706',
            error: '#dc2626',
            info: '#0284c7',
            pending: '#7c3aed'
          }
        );
        baseTheme.background = {
          type: 'gradient',
          colors: newMode === 'light'
            ? ['#ffffff', '#f8fafc', '#f1f5f9']
            : ['#0f172a', '#1e293b', '#334155'],
          pattern: 'none',
          patternOpacity: 0.0,
        };
      } else if (themeName === 'modern') {
        baseTheme.colors = createColorPalette(
          '#0ea5e9', '#06b6d4', '#0284c7',
          newMode === 'light' ? '#ffffff' : '#0c111b',
          newMode === 'light' ? '#f0f9ff' : '#1e293b',
          newMode === 'light' ? '#0c4a6e' : '#f0f9ff',
          newMode === 'light' ? '#64748b' : '#94a3b8',
          newMode,
          {
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
            info: '#38bdf8',
            pending: '#a78bfa'
          }
        );
        baseTheme.background = {
          type: 'gradient',
          colors: newMode === 'light'
            ? ['#ffffff', '#f0f9ff', '#e0f2fe']
            : ['#0c111b', '#1e293b', '#0f172a'],
          pattern: 'none',
          patternOpacity: 0.0,
        };
      } else if (themeName === 'creative') {
        baseTheme.colors = createColorPalette(
          '#ea580c', '#f97316', '#dc2626',
          newMode === 'light' ? '#fffbeb' : '#1c1917',
          newMode === 'light' ? '#fef3c7' : '#292524',
          newMode === 'light' ? '#1c1917' : '#fbbf24',
          newMode === 'light' ? '#78716c' : '#fcd34d',
          newMode,
          {
            success: '#059669',
            warning: '#d97706',
            error: '#dc2626',
            info: '#0ea5e9',
            pending: '#8b5cf6'
          }
        );
        baseTheme.background = {
          type: 'gradient',
          colors: newMode === 'light'
            ? ['#fffbeb', '#fef3c7', '#fde68a']
            : ['#1c1917', '#292524', '#44403c'],
          pattern: 'none',
          patternOpacity: 0.0,
        };
      } else if (themeName === 'developer') {
        baseTheme.colors = createColorPalette(
          '#059669', '#0d9488', '#0f766e',
          newMode === 'light' ? '#f0fdfa' : '#064e3b',
          newMode === 'light' ? '#ecfdf5' : '#065f46',
          newMode === 'light' ? '#064e3b' : '#a7f3d0',
          newMode === 'light' ? '#065f46' : '#6ee7b7',
          newMode,
          {
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
            info: '#0ea5e9',
            pending: '#8b5cf6'
          }
        );
        baseTheme.background = {
          type: 'solid',
          colors: newMode === 'light' ? ['#f0fdfa'] : ['#064e3b'],
          pattern: 'none',
          patternOpacity: 0.0,
        };
      }

      console.log('✅ Setting new theme:', {
        mode: baseTheme.mode,
        background: baseTheme.colors.background,
        backgroundColors: baseTheme.background.colors
      });
      setCurrentTheme(baseTheme);
      localStorage.setItem('currentMode', newMode);
    }
  };

  const getThemesByCategory = (category: string) => {
    return themes.filter(theme => theme.category === category);
  };

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        themeName,
        availableThemes: themes,
        setThemeName: handleThemeChange,
        updateTheme,
        toggleColorMode,
        getThemesByCategory,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
