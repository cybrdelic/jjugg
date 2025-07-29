// contexts/ThemeContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type ColorMode = 'light' | 'dark';
export type ThemeName =
  | 'professional'
  | 'modern'
  | 'creative'
  | 'developer'
  | 'netflix'
  | 'hulu'
  | 'barbie'
  | 'vscode'
  | 'terminal-hacker'
  | 'mr-robot'
  | 'fortnite'
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

// Create light and dark variants of a theme
const createThemeVariants = (baseTheme: Omit<ThemeSettings, 'mode' | 'colors'>, lightColors: ColorPalette, darkColors: ColorPalette): ThemeSettings[] => {
  return [
    {
      ...baseTheme,
      mode: 'light' as ColorMode,
      colors: lightColors,
      name: baseTheme.name,
      label: baseTheme.label,
      description: baseTheme.description,
    },
    {
      ...baseTheme,
      mode: 'dark' as ColorMode,
      colors: darkColors,
      name: baseTheme.name,
      label: `${baseTheme.label} (Dark)`,
      description: `${baseTheme.description} - Dark mode`,
    }
  ];
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
    customCSS: `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

      :root {
        --professional-primary: #2563eb;
        --professional-primary-light: #3b82f6;
        --professional-primary-dark: #1d4ed8;
        --professional-success: #059669;
        --professional-warning: #d97706;
        --professional-error: #dc2626;
        --professional-info: #0284c7;
      }

      * {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif !important;
        font-feature-settings: 'cv11', 'ss01';
        font-optical-sizing: auto;
      }

      .applications-home {
        background: var(--professional-bg) !important;
        position: relative;
        max-width: 100%;
        overflow-x: hidden;
      }

      :root {
        --professional-bg: linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%);
        --professional-card-bg: rgba(255, 255, 255, 0.95);
        --professional-border: rgba(37, 99, 235, 0.1);
        --professional-shadow: 0 8px 32px rgba(15, 23, 42, 0.08), 0 1px 0 rgba(255, 255, 255, 0.05);
        --professional-text: #0f172a;
        --professional-text-muted: #475569;
        --professional-header-bg: rgba(255, 255, 255, 0.98);
        --professional-row-bg: rgba(255, 255, 255, 0.6);
        --professional-row-hover: linear-gradient(90deg, rgba(37, 99, 235, 0.04) 0%, rgba(248, 250, 252, 0.95) 100%);
        --professional-control-bg: rgba(255, 255, 255, 0.9);
        --professional-control-text: #0f172a;
        --professional-input-bg: rgba(255, 255, 255, 0.95);
        --professional-input-text: #0f172a;
        --professional-dropdown-bg: rgba(255, 255, 255, 0.98);
        --professional-option-text: #0f172a;
      }

      :global(.dark) {
        --professional-bg: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
        --professional-card-bg: rgba(15, 23, 42, 0.95);
        --professional-border: rgba(59, 130, 246, 0.2);
        --professional-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 0 1px 0 rgba(59, 130, 246, 0.1);
        --professional-text: #f1f5f9;
        --professional-text-muted: #94a3b8;
        --professional-header-bg: rgba(15, 23, 42, 0.98);
        --professional-row-bg: rgba(30, 41, 59, 0.7);
        --professional-row-hover: linear-gradient(90deg, rgba(37, 99, 235, 0.15) 0%, rgba(30, 41, 59, 0.9) 100%);
        --professional-control-bg: rgba(30, 41, 59, 0.8);
        --professional-control-text: #f1f5f9;
        --professional-input-bg: rgba(30, 41, 59, 0.8);
        --professional-input-text: #f1f5f9;
        --professional-dropdown-bg: rgba(15, 23, 42, 0.98);
        --professional-option-text: #f1f5f9;
      }

      .applications-home::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: var(--professional-overlay);
        pointer-events: none;
        z-index: 0;
      }

      :root {
        --professional-overlay: radial-gradient(circle at 20% 20%, rgba(37, 99, 235, 0.03) 0%, transparent 60%),
                                radial-gradient(circle at 80% 80%, rgba(37, 99, 235, 0.02) 0%, transparent 60%);
      }

      :global(.dark) {
        --professional-overlay: radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.08) 0%, transparent 60%),
                                radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.05) 0%, transparent 60%);
      }

      .header-title-wrapper span:first-child {
        font-family: 'Inter', sans-serif !important;
        font-size: 1.875rem !important;
        font-weight: 800 !important;
        color: var(--professional-primary) !important;
        letter-spacing: -0.025em;
        background: linear-gradient(135deg, var(--professional-primary), var(--professional-primary-light));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        position: relative;
      }

      .header-title-wrapper span:first-child::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 0;
        width: 40%;
        height: 3px;
        background: linear-gradient(90deg, var(--professional-primary), transparent);
        border-radius: 2px;
      }

      .table-wrapper,
      .dashboard-card {
        background: var(--professional-card-bg) !important;
        border: 1px solid var(--professional-border) !important;
        border-radius: 12px !important;
        box-shadow: var(--professional-shadow);
        backdrop-filter: blur(20px);
      }

      .table-header {
        background: var(--professional-header-bg) !important;
        border-bottom: 2px solid var(--professional-primary) !important;
        color: var(--professional-text) !important;
        font-weight: 600 !important;
        font-size: 0.875rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        border-radius: 12px 12px 0 0 !important;
      }

      .table-row {
        background: var(--professional-row-bg) !important;
        border-bottom: 1px solid rgba(37, 99, 235, 0.08) !important;
        color: var(--professional-text) !important;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
      }

      .table-row:hover {
        background: var(--professional-row-hover) !important;
        border-left: 4px solid var(--professional-primary) !important;
        transform: translateX(2px) !important;
        box-shadow: 0 4px 20px rgba(37, 99, 235, 0.1);
      }

      .stage-badge {
        font-family: 'Inter', sans-serif !important;
        font-weight: 600 !important;
        font-size: 0.75rem !important;
        padding: 6px 14px !important;
        border-radius: 8px !important;
        background: linear-gradient(135deg, var(--professional-primary), var(--professional-primary-light)) !important;
        border: none !important;
        color: #ffffff !important;
        box-shadow: 0 2px 8px rgba(37, 99, 235, 0.25);
        transition: all 0.2s ease !important;
        text-transform: uppercase;
        letter-spacing: 0.025em;
      }

      .stage-badge:hover {
        background: linear-gradient(135deg, var(--professional-primary-dark), var(--professional-primary)) !important;
        transform: translateY(-1px) scale(1.02) !important;
        box-shadow: 0 4px 16px rgba(37, 99, 235, 0.35);
      }

      .control-btn,
      .quick-filter-select {
        background: var(--professional-control-bg) !important;
        color: var(--professional-control-text) !important;
        border: 1px solid var(--professional-border) !important;
        border-radius: 8px !important;
        font-weight: 500 !important;
        font-size: 0.875rem;
        transition: all 0.2s ease;
      }

      .control-btn:hover {
        background: var(--professional-primary) !important;
        color: #ffffff !important;
        border-color: var(--professional-primary) !important;
        transform: translateY(-1px) !important;
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
      }

      input, textarea, select {
        background: var(--professional-input-bg) !important;
        color: var(--professional-input-text) !important;
        border: 2px solid var(--professional-border) !important;
        border-radius: 8px !important;
        font-weight: 400;
        transition: all 0.2s ease;
      }

      input:focus, textarea:focus, select:focus {
        border-color: var(--professional-primary) !important;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1) !important;
        outline: none !important;
      }

      .stage-dropdown {
        background: var(--professional-dropdown-bg) !important;
        border: 2px solid var(--professional-primary) !important;
        border-radius: 12px !important;
        box-shadow: 0 20px 60px rgba(15, 23, 42, 0.15);
        backdrop-filter: blur(25px);
      }

      .stage-option {
        font-family: 'Inter', sans-serif !important;
        font-weight: 500 !important;
        color: var(--professional-option-text) !important;
        border-radius: 8px !important;
        transition: all 0.15s ease;
      }

      .stage-option:hover {
        background: rgba(37, 99, 235, 0.1) !important;
        color: var(--professional-primary) !important;
      }
    `
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
    customCSS: `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

      :root {
        --modern-primary: #0ea5e9;
        --modern-primary-light: #06b6d4;
        --modern-primary-dark: #0284c7;
        --modern-accent: #38bdf8;
        --modern-success: #10b981;
        --modern-warning: #f59e0b;
        --modern-error: #ef4444;
        --modern-neon: #00f5ff;
      }

      * {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif !important;
        font-feature-settings: 'cv11', 'ss01';
      }

      .applications-home {
        background: var(--modern-bg) !important;
        position: relative;
        max-width: 100%;
        overflow-x: hidden;
      }

      :root {
        --modern-bg: linear-gradient(135deg, #ffffff 0%, #f0f9ff 50%, #e0f2fe 100%);
        --modern-card-bg: rgba(255, 255, 255, 0.92);
        --modern-border: rgba(14, 165, 233, 0.12);
        --modern-shadow: 0 8px 32px rgba(12, 74, 110, 0.1), 0 1px 0 rgba(56, 189, 248, 0.05);
        --modern-text: #0c4a6e;
        --modern-text-muted: #64748b;
        --modern-header-bg: rgba(240, 249, 255, 0.98);
        --modern-row-bg: rgba(255, 255, 255, 0.7);
        --modern-row-hover: linear-gradient(90deg, rgba(14, 165, 233, 0.06) 0%, rgba(240, 249, 255, 0.95) 100%);
        --modern-control-bg: rgba(255, 255, 255, 0.9);
        --modern-control-text: #0c4a6e;
        --modern-input-bg: rgba(255, 255, 255, 0.95);
        --modern-input-text: #0c4a6e;
        --modern-dropdown-bg: rgba(255, 255, 255, 0.98);
        --modern-option-text: #0c4a6e;
      }

      :global(.dark) {
        --modern-bg: linear-gradient(135deg, #0c111b 0%, #1e293b 50%, #0f172a 100%);
        --modern-card-bg: rgba(12, 17, 27, 0.95);
        --modern-border: rgba(56, 189, 248, 0.2);
        --modern-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 0 1px 0 rgba(56, 189, 248, 0.1);
        --modern-text: #f0f9ff;
        --modern-text-muted: #94a3b8;
        --modern-header-bg: rgba(12, 17, 27, 0.98);
        --modern-row-bg: rgba(30, 41, 59, 0.7);
        --modern-row-hover: linear-gradient(90deg, rgba(14, 165, 233, 0.15) 0%, rgba(30, 41, 59, 0.9) 100%);
        --modern-control-bg: rgba(30, 41, 59, 0.8);
        --modern-control-text: #f0f9ff;
        --modern-input-bg: rgba(30, 41, 59, 0.8);
        --modern-input-text: #f0f9ff;
        --modern-dropdown-bg: rgba(12, 17, 27, 0.98);
        --modern-option-text: #f0f9ff;
      }

      .applications-home::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: var(--modern-overlay);
        pointer-events: none;
        z-index: 0;
      }

      :root {
        --modern-overlay: radial-gradient(circle at 25% 25%, rgba(14, 165, 233, 0.04) 0%, transparent 50%),
                         radial-gradient(circle at 75% 75%, rgba(56, 189, 248, 0.03) 0%, transparent 50%),
                         conic-gradient(from 45deg at 50% 50%, transparent 0deg, rgba(14, 165, 233, 0.01) 90deg, transparent 180deg);
      }

      :global(.dark) {
        --modern-overlay: radial-gradient(circle at 25% 25%, rgba(14, 165, 233, 0.08) 0%, transparent 50%),
                         radial-gradient(circle at 75% 75%, rgba(56, 189, 248, 0.06) 0%, transparent 50%),
                         conic-gradient(from 45deg at 50% 50%, transparent 0deg, rgba(0, 245, 255, 0.02) 90deg, transparent 180deg);
      }

      .header-title-wrapper span:first-child {
        font-family: 'Inter', sans-serif !important;
        font-size: 1.875rem !important;
        font-weight: 800 !important;
        background: linear-gradient(135deg, var(--modern-primary), var(--modern-accent), var(--modern-neon)) !important;
        background-size: 200% 200%;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        letter-spacing: -0.025em;
        animation: modernGradient 4s ease-in-out infinite;
        position: relative;
      }

      @keyframes modernGradient {
        0%, 100% {
          background-position: 0% 50%;
          filter: drop-shadow(0 0 8px rgba(14, 165, 233, 0.3));
        }
        50% {
          background-position: 100% 50%;
          filter: drop-shadow(0 0 16px rgba(56, 189, 248, 0.5));
        }
      }

      .header-title-wrapper span:first-child::after {
        content: '';
        position: absolute;
        bottom: -4px;
        left: 0;
        width: 50%;
        height: 2px;
        background: linear-gradient(90deg, var(--modern-primary), var(--modern-accent), transparent);
        border-radius: 2px;
        animation: modernUnderline 3s ease-in-out infinite;
      }

      @keyframes modernUnderline {
        0%, 100% { width: 30%; opacity: 0.6; }
        50% { width: 60%; opacity: 1; }
      }

      .table-wrapper,
      .dashboard-card {
        background: var(--modern-card-bg) !important;
        border: 1px solid var(--modern-border) !important;
        border-radius: 16px !important;
        box-shadow: var(--modern-shadow);
        backdrop-filter: blur(20px);
        position: relative;
        overflow: hidden;
      }

      .table-wrapper::before,
      .dashboard-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 1px;
        background: linear-gradient(90deg, transparent, var(--modern-accent), transparent);
        opacity: 0.6;
      }

      .table-header {
        background: var(--modern-header-bg) !important;
        border-bottom: 2px solid var(--modern-primary) !important;
        color: var(--modern-text) !important;
        font-weight: 600 !important;
        font-size: 0.875rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        border-radius: 16px 16px 0 0 !important;
        position: relative;
      }

      .table-header::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(90deg, var(--modern-primary), var(--modern-accent), var(--modern-primary));
      }

      .table-row {
        background: var(--modern-row-bg) !important;
        border-bottom: 1px solid rgba(14, 165, 233, 0.08) !important;
        color: var(--modern-text) !important;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        position: relative;
      }

      .table-row:hover {
        background: var(--modern-row-hover) !important;
        border-left: 4px solid var(--modern-accent) !important;
        transform: translateX(3px) !important;
        box-shadow: 0 4px 20px rgba(14, 165, 233, 0.15);
      }

      .table-row:hover::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 2px;
        background: linear-gradient(180deg, var(--modern-accent), var(--modern-neon));
        animation: modernPulse 1.5s ease-in-out infinite;
      }

      @keyframes modernPulse {
        0%, 100% { opacity: 0.7; transform: scaleY(1); }
        50% { opacity: 1; transform: scaleY(1.1); }
      }

      .stage-badge {
        font-family: 'JetBrains Mono', monospace !important;
        font-weight: 600 !important;
        font-size: 0.75rem !important;
        padding: 6px 14px !important;
        border-radius: 12px !important;
        background: linear-gradient(135deg, var(--modern-primary), var(--modern-accent)) !important;
        border: 1px solid rgba(56, 189, 248, 0.3) !important;
        color: #ffffff !important;
        box-shadow: 0 2px 8px rgba(14, 165, 233, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2);
        transition: all 0.2s ease !important;
        text-transform: uppercase;
        letter-spacing: 0.025em;
        position: relative;
        overflow: hidden;
      }

      .stage-badge::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        transition: left 0.5s ease;
      }

      .stage-badge:hover {
        background: linear-gradient(135deg, var(--modern-primary-dark), var(--modern-neon)) !important;
        transform: translateY(-1px) scale(1.02) !important;
        box-shadow: 0 4px 16px rgba(14, 165, 233, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.3);
      }

      .stage-badge:hover::before {
        left: 100%;
      }

      .control-btn,
      .quick-filter-select {
        background: var(--modern-control-bg) !important;
        color: var(--modern-control-text) !important;
        border: 1px solid var(--modern-border) !important;
        border-radius: 12px !important;
        font-weight: 500 !important;
        font-size: 0.875rem;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      }

      .control-btn:hover {
        background: var(--modern-primary) !important;
        color: #ffffff !important;
        border-color: var(--modern-accent) !important;
        transform: translateY(-1px) !important;
        box-shadow: 0 4px 12px rgba(14, 165, 233, 0.25);
      }

      input, textarea, select {
        background: var(--modern-input-bg) !important;
        color: var(--modern-input-text) !important;
        border: 2px solid var(--modern-border) !important;
        border-radius: 12px !important;
        font-weight: 400;
        transition: all 0.3s ease;
      }

      input:focus, textarea:focus, select:focus {
        border-color: var(--modern-accent) !important;
        box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1), 0 0 20px rgba(56, 189, 248, 0.1) !important;
        outline: none !important;
      }

      .stage-dropdown {
        background: var(--modern-dropdown-bg) !important;
        border: 2px solid var(--modern-accent) !important;
        border-radius: 16px !important;
        box-shadow: 0 20px 60px rgba(12, 74, 110, 0.15);
        backdrop-filter: blur(25px);
      }

      .stage-option {
        font-family: 'Inter', sans-serif !important;
        font-weight: 500 !important;
        color: var(--modern-option-text) !important;
        border-radius: 10px !important;
        transition: all 0.2s ease;
      }

      .stage-option:hover {
        background: rgba(14, 165, 233, 0.1) !important;
        color: var(--modern-primary) !important;
        transform: translateX(2px);
      }
    `
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
    customCSS: `
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800&family=Dancing+Script:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap');

      :root {
        --creative-primary: #ea580c;
        --creative-secondary: #f97316;
        --creative-accent: #dc2626;
        --creative-warm: #fbbf24;
        --creative-gold: #d97706;
        --creative-success: #059669;
      }

      * {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif !important;
      }

      .applications-home {
        background: var(--creative-bg) !important;
        position: relative;
        max-width: 100%;
        overflow-x: hidden;
      }

      :root {
        --creative-bg: linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #fde68a 100%);
        --creative-card-bg: rgba(255, 251, 235, 0.95);
        --creative-border: rgba(234, 88, 12, 0.15);
        --creative-shadow: 0 8px 32px rgba(28, 25, 23, 0.1), 0 1px 0 rgba(249, 115, 22, 0.05);
        --creative-text: #1c1917;
        --creative-text-muted: #78716c;
        --creative-header-bg: rgba(254, 243, 199, 0.98);
        --creative-row-bg: rgba(255, 251, 235, 0.8);
        --creative-row-hover: linear-gradient(90deg, rgba(234, 88, 12, 0.08) 0%, rgba(254, 243, 199, 0.95) 100%);
        --creative-control-bg: rgba(255, 251, 235, 0.9);
        --creative-control-text: #1c1917;
        --creative-input-bg: rgba(255, 251, 235, 0.95);
        --creative-input-text: #1c1917;
        --creative-dropdown-bg: rgba(255, 251, 235, 0.98);
        --creative-option-text: #1c1917;
      }

      :global(.dark) {
        --creative-bg: linear-gradient(135deg, #1c1917 0%, #292524 50%, #44403c 100%);
        --creative-card-bg: rgba(28, 25, 23, 0.95);
        --creative-border: rgba(249, 115, 22, 0.2);
        --creative-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 0 1px 0 rgba(249, 115, 22, 0.1);
        --creative-text: #fef3c7;
        --creative-text-muted: #a8a29e;
        --creative-header-bg: rgba(28, 25, 23, 0.98);
        --creative-row-bg: rgba(41, 37, 36, 0.7);
        --creative-row-hover: linear-gradient(90deg, rgba(234, 88, 12, 0.15) 0%, rgba(41, 37, 36, 0.9) 100%);
        --creative-control-bg: rgba(41, 37, 36, 0.8);
        --creative-control-text: #fef3c7;
        --creative-input-bg: rgba(41, 37, 36, 0.8);
        --creative-input-text: #fef3c7;
        --creative-dropdown-bg: rgba(28, 25, 23, 0.98);
        --creative-option-text: #fef3c7;
      }

      .applications-home::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: var(--creative-overlay);
        pointer-events: none;
        z-index: 0;
      }

      :root {
        --creative-overlay: radial-gradient(circle at 30% 40%, rgba(234, 88, 12, 0.05) 0%, transparent 50%),
                           radial-gradient(circle at 70% 60%, rgba(249, 115, 22, 0.04) 0%, transparent 50%),
                           conic-gradient(from 30deg at 40% 70%, transparent 0deg, rgba(251, 191, 36, 0.03) 60deg, transparent 120deg);
      }

      :global(.dark) {
        --creative-overlay: radial-gradient(circle at 30% 40%, rgba(234, 88, 12, 0.1) 0%, transparent 50%),
                           radial-gradient(circle at 70% 60%, rgba(249, 115, 22, 0.08) 0%, transparent 50%),
                           conic-gradient(from 30deg at 40% 70%, transparent 0deg, rgba(251, 191, 36, 0.06) 60deg, transparent 120deg);
      }

      .header-title-wrapper span:first-child {
        font-family: 'Playfair Display', serif !important;
        font-size: 2rem !important;
        font-weight: 700 !important;
        background: linear-gradient(135deg, var(--creative-primary), var(--creative-secondary), var(--creative-warm)) !important;
        background-size: 300% 300%;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        letter-spacing: -0.02em;
        animation: creativeFlow 6s ease-in-out infinite;
        position: relative;
        text-shadow: 0 2px 4px rgba(234, 88, 12, 0.1);
      }

      @keyframes creativeFlow {
        0%, 100% {
          background-position: 0% 50%;
          transform: scale(1);
        }
        33% {
          background-position: 100% 50%;
          transform: scale(1.02);
        }
        66% {
          background-position: 50% 100%;
          transform: scale(0.98);
        }
      }

      .header-title-wrapper span:first-child::after {
        content: '';
        position: absolute;
        bottom: -6px;
        left: 0;
        width: 60%;
        height: 3px;
        background: linear-gradient(90deg, var(--creative-primary), var(--creative-warm), var(--creative-secondary));
        border-radius: 3px;
        animation: creativeUnderline 4s ease-in-out infinite;
      }

      @keyframes creativeUnderline {
        0%, 100% {
          width: 40%;
          opacity: 0.7;
          transform: translateX(0);
        }
        50% {
          width: 70%;
          opacity: 1;
          transform: translateX(10px);
        }
      }

      .table-wrapper,
      .dashboard-card {
        background: var(--creative-card-bg) !important;
        border: 1px solid var(--creative-border) !important;
        border-radius: 20px !important;
        box-shadow: var(--creative-shadow);
        backdrop-filter: blur(20px);
        position: relative;
        overflow: hidden;
      }

      .table-wrapper::before,
      .dashboard-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, var(--creative-primary), var(--creative-secondary), var(--creative-warm), var(--creative-primary));
        background-size: 200% 100%;
        animation: creativeShimmer 3s ease-in-out infinite;
      }

      @keyframes creativeShimmer {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
      }

      .table-header {
        background: var(--creative-header-bg) !important;
        border-bottom: 2px solid var(--creative-primary) !important;
        color: var(--creative-text) !important;
        font-weight: 600 !important;
        font-size: 0.875rem;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        border-radius: 20px 20px 0 0 !important;
        position: relative;
      }

      .table-row {
        background: var(--creative-row-bg) !important;
        border-bottom: 1px solid rgba(234, 88, 12, 0.1) !important;
        color: var(--creative-text) !important;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        position: relative;
      }

      .table-row:hover {
        background: var(--creative-row-hover) !important;
        border-left: 5px solid var(--creative-secondary) !important;
        transform: translateX(3px) !important;
        box-shadow: 0 6px 25px rgba(234, 88, 12, 0.15);
      }

      .table-row:hover::before {
        content: '✨';
        position: absolute;
        left: -15px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 12px;
        animation: creativeSparkle 1.5s ease-in-out infinite;
      }

      @keyframes creativeSparkle {
        0%, 100% {
          opacity: 0.6;
          transform: translateY(-50%) scale(1);
        }
        50% {
          opacity: 1;
          transform: translateY(-50%) scale(1.2);
        }
      }

      .stage-badge {
        font-family: 'Dancing Script', cursive !important;
        font-weight: 600 !important;
        font-size: 0.9rem !important;
        padding: 8px 16px !important;
        border-radius: 25px !important;
        background: linear-gradient(135deg, var(--creative-primary), var(--creative-secondary), var(--creative-warm)) !important;
        background-size: 200% 200%;
        border: 2px solid rgba(249, 115, 22, 0.3) !important;
        color: #ffffff !important;
        box-shadow: 0 4px 15px rgba(234, 88, 12, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2);
        transition: all 0.3s ease !important;
        position: relative;
        overflow: hidden;
        animation: creativeGlow 4s ease-in-out infinite;
      }

      @keyframes creativeGlow {
        0%, 100% {
          background-position: 0% 50%;
          box-shadow: 0 4px 15px rgba(234, 88, 12, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }
        50% {
          background-position: 100% 50%;
          box-shadow: 0 6px 20px rgba(249, 115, 22, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3);
        }
      }

      .stage-badge:hover {
        transform: translateY(-2px) scale(1.05) rotate(1deg) !important;
        box-shadow: 0 8px 25px rgba(234, 88, 12, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.3);
      }

      .control-btn,
      .quick-filter-select {
        background: var(--creative-control-bg) !important;
        color: var(--creative-control-text) !important;
        border: 2px solid var(--creative-border) !important;
        border-radius: 15px !important;
        font-weight: 500 !important;
        font-size: 0.875rem;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      }

      .control-btn:hover {
        background: linear-gradient(135deg, var(--creative-primary), var(--creative-secondary)) !important;
        color: #ffffff !important;
        border-color: var(--creative-warm) !important;
        transform: translateY(-2px) !important;
        box-shadow: 0 6px 20px rgba(234, 88, 12, 0.3);
      }

      input, textarea, select {
        background: var(--creative-input-bg) !important;
        color: var(--creative-input-text) !important;
        border: 2px solid var(--creative-border) !important;
        border-radius: 15px !important;
        font-weight: 400;
        transition: all 0.3s ease;
      }

      input:focus, textarea:focus, select:focus {
        border-color: var(--creative-secondary) !important;
        box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.1), 0 0 20px rgba(249, 115, 22, 0.1) !important;
        outline: none !important;
        transform: scale(1.02);
      }

      .stage-dropdown {
        background: var(--creative-dropdown-bg) !important;
        border: 2px solid var(--creative-secondary) !important;
        border-radius: 20px !important;
        box-shadow: 0 20px 60px rgba(28, 25, 23, 0.15);
        backdrop-filter: blur(25px);
      }

      .stage-option {
        font-family: 'Inter', sans-serif !important;
        font-weight: 500 !important;
        color: var(--creative-option-text) !important;
        border-radius: 12px !important;
        transition: all 0.2s ease;
      }

      .stage-option:hover {
        background: rgba(234, 88, 12, 0.1) !important;
        color: var(--creative-primary) !important;
        transform: translateX(4px);
      }
    `
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
    customCSS: `
      @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&family=Fira+Code:wght@300;400;500;600&family=Source+Code+Pro:wght@300;400;500;600;700&display=swap');

      :root {
        --dev-primary: #059669;
        --dev-secondary: #0d9488;
        --dev-accent: #0f766e;
        --dev-terminal: #064e3b;
        --dev-success: #10b981;
        --dev-warning: #f59e0b;
        --dev-error: #ef4444;
        --dev-matrix: #00ff41;
      }

      * {
        font-family: 'JetBrains Mono', 'Fira Code', 'Source Code Pro', monospace !important;
        font-variant-ligatures: common-ligatures;
        font-feature-settings: 'liga' 1, 'calt' 1;
      }

      .applications-home {
        background: var(--dev-bg) !important;
        position: relative;
        max-width: 100%;
        overflow-x: hidden;
      }

      :root {
        --dev-bg: #f0fdfa;
        --dev-card-bg: rgba(240, 253, 250, 0.98);
        --dev-border: rgba(5, 150, 105, 0.15);
        --dev-shadow: 0 4px 20px rgba(6, 78, 59, 0.08), 0 1px 0 rgba(13, 148, 136, 0.05);
        --dev-text: #064e3b;
        --dev-text-muted: #065f46;
        --dev-header-bg: rgba(236, 253, 245, 0.98);
        --dev-row-bg: rgba(240, 253, 250, 0.9);
        --dev-row-hover: linear-gradient(90deg, rgba(5, 150, 105, 0.06) 0%, rgba(236, 253, 245, 0.95) 100%);
        --dev-control-bg: rgba(236, 253, 245, 0.9);
        --dev-control-text: #064e3b;
        --dev-input-bg: rgba(240, 253, 250, 0.98);
        --dev-input-text: #064e3b;
        --dev-dropdown-bg: rgba(240, 253, 250, 0.99);
        --dev-option-text: #064e3b;
      }

      :global(.dark) {
        --dev-bg: #064e3b;
        --dev-card-bg: rgba(6, 78, 59, 0.98);
        --dev-border: rgba(13, 148, 136, 0.2);
        --dev-shadow: 0 4px 20px rgba(0, 0, 0, 0.3), 0 1px 0 rgba(16, 185, 129, 0.1);
        --dev-text: #a7f3d0;
        --dev-text-muted: #6ee7b7;
        --dev-header-bg: rgba(6, 78, 59, 0.99);
        --dev-row-bg: rgba(6, 95, 70, 0.8);
        --dev-row-hover: linear-gradient(90deg, rgba(5, 150, 105, 0.15) 0%, rgba(6, 95, 70, 0.9) 100%);
        --dev-control-bg: rgba(6, 95, 70, 0.8);
        --dev-control-text: #a7f3d0;
        --dev-input-bg: rgba(6, 78, 59, 0.9);
        --dev-input-text: #a7f3d0;
        --dev-dropdown-bg: rgba(6, 78, 59, 0.99);
        --dev-option-text: #a7f3d0;
      }

      .applications-home::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: var(--dev-overlay);
        pointer-events: none;
        z-index: 0;
      }

      :root {
        --dev-overlay:
          linear-gradient(45deg, transparent 0%, rgba(5, 150, 105, 0.02) 25%, transparent 50%),
          repeating-linear-gradient(
            90deg,
            transparent,
            transparent 100px,
            rgba(13, 148, 136, 0.01) 100px,
            rgba(13, 148, 136, 0.01) 101px
          );
      }

      :global(.dark) {
        --dev-overlay:
          linear-gradient(45deg, transparent 0%, rgba(0, 255, 65, 0.03) 25%, transparent 50%),
          repeating-linear-gradient(
            90deg,
            transparent,
            transparent 100px,
            rgba(16, 185, 129, 0.02) 100px,
            rgba(16, 185, 129, 0.02) 101px
          );
      }

      .header-title-wrapper span:first-child {
        font-family: 'JetBrains Mono', monospace !important;
        font-size: 1.5rem !important;
        font-weight: 700 !important;
        color: var(--dev-primary) !important;
        letter-spacing: 0.05em;
        position: relative;
        animation: devBlink 2s ease-in-out infinite;
      }

      .header-title-wrapper span:first-child::before {
        content: '$ ';
        color: var(--dev-secondary);
        opacity: 0.8;
      }

      .header-title-wrapper span:first-child::after {
        content: '_';
        animation: devCursor 1s ease-in-out infinite;
        color: var(--dev-primary);
        opacity: 0.8;
      }

      @keyframes devBlink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.9; }
      }

      @keyframes devCursor {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0; }
      }

      .table-wrapper,
      .dashboard-card {
        background: var(--dev-card-bg) !important;
        border: 1px solid var(--dev-border) !important;
        border-radius: 8px !important;
        box-shadow: var(--dev-shadow);
        backdrop-filter: blur(10px);
        font-family: 'JetBrains Mono', monospace !important;
        position: relative;
      }

      .table-wrapper::before,
      .dashboard-card::before {
        content: '/* Code Block */';
        position: absolute;
        top: 4px;
        left: 8px;
        font-size: 10px;
        color: var(--dev-secondary);
        opacity: 0.6;
        font-family: 'JetBrains Mono', monospace;
        pointer-events: none;
      }

      .table-header {
        background: var(--dev-header-bg) !important;
        border-bottom: 2px solid var(--dev-primary) !important;
        color: var(--dev-text) !important;
        font-weight: 600 !important;
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        font-family: 'JetBrains Mono', monospace !important;
        border-radius: 8px 8px 0 0 !important;
        padding-top: 20px !important;
      }

      .table-row {
        background: var(--dev-row-bg) !important;
        border-bottom: 1px solid rgba(5, 150, 105, 0.1) !important;
        color: var(--dev-text) !important;
        transition: all 0.2s ease !important;
        font-family: 'JetBrains Mono', monospace !important;
        font-size: 0.875rem;
        position: relative;
      }

      .table-row:hover {
        background: var(--dev-row-hover) !important;
        border-left: 3px solid var(--dev-secondary) !important;
        transform: translateX(2px) !important;
        box-shadow: 0 2px 12px rgba(5, 150, 105, 0.1);
      }

      .table-row:hover::before {
        content: '>';
        position: absolute;
        left: -10px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--dev-secondary);
        font-weight: bold;
        font-size: 12px;
        animation: devPointer 1s ease-in-out infinite;
      }

      @keyframes devPointer {
        0%, 100% { transform: translateY(-50%) translateX(0); }
        50% { transform: translateY(-50%) translateX(2px); }
      }

      .stage-badge {
        font-family: 'JetBrains Mono', monospace !important;
        font-weight: 500 !important;
        font-size: 0.7rem !important;
        padding: 4px 10px !important;
        border-radius: 4px !important;
        background: linear-gradient(135deg, var(--dev-primary), var(--dev-secondary)) !important;
        border: 1px solid var(--dev-accent) !important;
        color: #ffffff !important;
        box-shadow: 0 2px 8px rgba(5, 150, 105, 0.25);
        transition: all 0.2s ease !important;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        position: relative;
      }

      .stage-badge::before {
        content: '[';
        position: absolute;
        left: -2px;
        color: var(--dev-accent);
        font-weight: bold;
      }

      .stage-badge::after {
        content: ']';
        position: absolute;
        right: -2px;
        color: var(--dev-accent);
        font-weight: bold;
      }

      .stage-badge:hover {
        background: linear-gradient(135deg, var(--dev-secondary), var(--dev-accent)) !important;
        transform: translateY(-1px) scale(1.02) !important;
        box-shadow: 0 4px 12px rgba(5, 150, 105, 0.35);
      }

      .control-btn,
      .quick-filter-select {
        background: var(--dev-control-bg) !important;
        color: var(--dev-control-text) !important;
        border: 1px solid var(--dev-border) !important;
        border-radius: 4px !important;
        font-weight: 500 !important;
        font-size: 0.875rem;
        font-family: 'JetBrains Mono', monospace !important;
        transition: all 0.2s ease;
      }

      .control-btn:hover {
        background: var(--dev-primary) !important;
        color: #ffffff !important;
        border-color: var(--dev-secondary) !important;
        transform: translateY(-1px) !important;
        box-shadow: 0 3px 10px rgba(5, 150, 105, 0.25);
      }

      input, textarea, select {
        background: var(--dev-input-bg) !important;
        color: var(--dev-input-text) !important;
        border: 1px solid var(--dev-border) !important;
        border-radius: 4px !important;
        font-weight: 400;
        font-family: 'JetBrains Mono', monospace !important;
        transition: all 0.2s ease;
      }

      input:focus, textarea:focus, select:focus {
        border-color: var(--dev-secondary) !important;
        box-shadow: 0 0 0 2px rgba(5, 150, 105, 0.1) !important;
        outline: none !important;
        background: var(--dev-primary) !important;
        color: #ffffff !important;
      }

      .stage-dropdown {
        background: var(--dev-dropdown-bg) !important;
        border: 2px solid var(--dev-primary) !important;
        border-radius: 8px !important;
        box-shadow: 0 10px 40px rgba(6, 78, 59, 0.15);
        backdrop-filter: blur(15px);
        font-family: 'JetBrains Mono', monospace !important;
      }

      .stage-option {
        font-family: 'JetBrains Mono', monospace !important;
        font-weight: 500 !important;
        color: var(--dev-option-text) !important;
        border-radius: 4px !important;
        transition: all 0.15s ease;
        font-size: 0.875rem;
      }

      .stage-option:hover {
        background: rgba(5, 150, 105, 0.1) !important;
        color: var(--dev-primary) !important;
        transform: translateX(2px);
      }

      .stage-option::before {
        content: '→ ';
        opacity: 0;
        transition: opacity 0.15s ease;
      }

      .stage-option:hover::before {
        opacity: 1;
      }
    `
  },

  // Netflix Theme - Bold red and black cinematic experience
  {
    name: 'netflix',
    label: 'Netflix',
    description: 'Cinematic red and black theme inspired by Netflix',
    category: 'creative',
    mode: 'dark',
    fontFamily: 'inter',
    borderRadius: 'sm',
    animation: 'smooth',
    glassEffect: 'subtle',
    colors: createColorPalette(
      '#e50914', '#ff1a1a', '#b81d24',
      '#141414', '#0a0a0a',
      '#ffffff', '#e5e5e5', 'dark',
      {
        success: '#46d369',
        warning: '#f9c23c',
        error: '#e50914',
        info: '#0ea5e9',
        pending: '#f5c518'
      }
    ),
    background: {
      type: 'solid',
      colors: ['#141414'],
      pattern: 'none',
      patternOpacity: 0.0,
    },
    customCSS: `
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue:wght@400&family=Graphik:wght@300;400;500;600;700&display=swap');

      :root {
        --netflix-red: #e50914;
        --netflix-dark: #141414;
        --netflix-darker: #0a0a0a;
        --netflix-accent: #ff1a1a;
        --netflix-light: #f5f5f1;
        --netflix-text-light: #333333;
      }

      :root {
        --netflix-mode-bg: #141414;
        --netflix-card-bg: rgba(20, 20, 20, 0.85);
        --netflix-border: rgba(255, 255, 255, 0.15);
        --netflix-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
        --netflix-text: #ffffff;
        --netflix-text-muted: #b3b3b3;
        --netflix-header-bg: rgba(20, 20, 20, 0.95);
        --netflix-header-text: #ffffff;
        --netflix-row-bg: rgba(20, 20, 20, 0.5);
        --netflix-row-text: #ffffff;
        --netflix-row-hover: var(--glass-hover-bg);
        --netflix-control-bg: rgba(20, 20, 20, 0.8);
        --netflix-control-text: #ffffff;
        --netflix-input-bg: rgba(20, 20, 20, 0.8);
        --netflix-input-text: #ffffff;
        --netflix-overlay-bg: var(--glass-bg);
        --netflix-badge-bg: var(--glass-button-bg);
        --netflix-badge-text: #ffffff;
        --netflix-badge-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        --netflix-table-row-bg: rgba(20, 20, 20, 0.6);
        --netflix-table-text: #ffffff;
        --netflix-table-row-hover: var(--glass-hover-bg);
        --netflix-card-shadow: 0 6px 24px rgba(0, 0, 0, 0.3);
        --netflix-dropdown-bg: rgba(20, 20, 20, 0.95);
        --netflix-option-text: #ffffff;
        --netflix-overlay: var(--glass-bg);
      }

      :global(.light) {
        --netflix-mode-bg: #ffffff;
        --netflix-card-bg: rgba(255, 255, 255, 0.9);
        --netflix-border: rgba(229, 9, 20, 0.15);
        --netflix-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
        --netflix-text: var(--netflix-text-light);
        --netflix-text-muted: #666666;
        --netflix-header-bg: rgba(255, 255, 255, 0.95);
        --netflix-header-text: var(--netflix-text-light);
        --netflix-row-bg: rgba(255, 255, 255, 0.8);
        --netflix-row-text: var(--netflix-text-light);
        --netflix-row-hover: var(--glass-hover-bg);
        --netflix-control-bg: rgba(255, 255, 255, 0.9);
        --netflix-control-text: var(--netflix-text-light);
        --netflix-input-bg: rgba(255, 255, 255, 0.95);
        --netflix-input-text: var(--netflix-text-light);
        --netflix-dropdown-bg: rgba(255, 255, 255, 0.95);
        --netflix-option-text: var(--netflix-text-light);
        --netflix-overlay: var(--glass-bg);
        --netflix-overlay-bg: var(--glass-bg);
        --netflix-badge-bg: var(--glass-button-bg);
        --netflix-badge-text: #141414;
        --netflix-badge-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        --netflix-table-row-bg: rgba(255, 255, 255, 0.8);
        --netflix-table-text: #141414;
        --netflix-table-row-hover: var(--glass-hover-bg);
        --netflix-card-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
      }

      * {
        font-family: 'Graphik', 'Helvetica Neue', Arial, sans-serif !important;
        letter-spacing: 0.5px;
      }

      .applications-home {
        background: var(--netflix-mode-bg) !important;
        position: relative;
        max-width: 100%;
        overflow-x: hidden;
      }

      .applications-home {
        background: var(--netflix-mode-bg, linear-gradient(135deg, #0a0a0a 0%, #141414 50%, #1a1a1a 100%)) !important;
      }

      .applications-home::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: var(--netflix-overlay-bg,
          var(--glass-bg));
        pointer-events: none;
        z-index: 0;
      }

      .header-title-wrapper span:first-child {
        font-family: 'Bebas Neue', cursive !important;
        font-size: 2rem !important;
        font-weight: 400 !important;
        background: linear-gradient(45deg, #e50914, #ff1a1a, #e50914);
        background-size: 200% 200%;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        text-shadow: 0 0 30px rgba(229, 9, 20, 0.8);
        animation: netflixGlow 3s ease-in-out infinite alternate;
        text-transform: uppercase;
        letter-spacing: 2px;
        white-space: nowrap;
        overflow: hidden;
      }

      @keyframes netflixGlow {
        0% {
          background-position: 0% 50%;
          filter: drop-shadow(0 0 10px rgba(229, 9, 20, 0.5));
        }
        100% {
          background-position: 100% 50%;
          filter: drop-shadow(0 0 25px rgba(229, 9, 20, 0.9));
        }
      }

      .stage-badge {
        font-family: 'Oswald', sans-serif !important;
        font-weight: 600 !important;
        text-transform: uppercase !important;
        letter-spacing: 1px !important;
        font-size: 10px !important;
        padding: 4px 10px !important;
        border-radius: 0px !important;
        background: var(--glass-button-bg, var(--hover-bg)) !important;
        border: 1px solid var(--netflix-red) !important;
        color: var(--netflix-badge-text, #ffffff) !important;
        box-shadow: var(--netflix-badge-shadow,
          0 0 15px rgba(229, 9, 20, 0.4),
          inset 0 1px 0 rgba(255, 255, 255, 0.1));
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        max-width: fit-content;
        white-space: nowrap;
        overflow: hidden;
      }

      .stage-badge:hover {
        background: var(--glass-hover-bg, var(--hover-bg)) !important;
        transform: translateY(-1px) scale(1.02) !important;
        box-shadow:
          0 6px 20px rgba(229, 9, 20, 0.6),
          inset 0 1px 0 rgba(255, 255, 255, 0.2);
      }

      .table-row {
        background: var(--glass-bg, var(--background)) !important;
        border-bottom: 1px solid rgba(229, 9, 20, 0.2) !important;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        color: var(--text-primary) !important;
      }

      .table-row:hover {
        background: var(--table-row-hover, var(--hover-bg)) !important;
        border-left: 3px solid var(--netflix-red) !important;
        transform: translateX(2px) !important;
        box-shadow: 0 2px 15px rgba(229, 9, 20, 0.3);
      }

      .dashboard-card {
        background: var(--glass-card-bg, var(--card)) !important;
        border: 1px solid rgba(229, 9, 20, 0.3) !important;
        border-radius: 0px !important;
        box-shadow: var(--netflix-card-shadow,
          0 10px 40px rgba(0, 0, 0, 0.5),
          0 0 20px rgba(229, 9, 20, 0.2));
        backdrop-filter: blur(20px);
      }

      .table-header {
        background: var(--netflix-header-bg, linear-gradient(90deg, rgba(10, 10, 10, 0.9), rgba(20, 20, 20, 0.9))) !important;
        border-bottom: 1px solid var(--netflix-red) !important;
        color: var(--netflix-header-text, #ffffff) !important;
        font-family: 'Oswald', sans-serif !important;
        text-transform: uppercase !important;
        letter-spacing: 0.5px !important;
        font-weight: 500 !important;
      }

      .company-name, .position-title, .cell-value {
        font-family: 'Oswald', sans-serif !important;
        font-weight: 400 !important;
        color: var(--text-primary) !important;
      }

      .action-buttons button {
        font-family: 'Oswald', sans-serif !important;
        text-transform: uppercase !important;
        letter-spacing: 0.5px !important;
        font-weight: 500 !important;
        border-radius: 0px !important;
        transition: all 0.3s ease !important;
        background: var(--glass-button-bg, var(--hover-bg)) !important;
        border: 1px solid var(--netflix-red) !important;
        color: white !important;
      }

      .action-buttons button:hover {
        background: var(--glass-hover-bg, var(--hover-bg)) !important;
        box-shadow: 0 0 15px rgba(229, 9, 20, 0.6);
      }

      .stage-dropdown {
        background: var(--glass-card-bg, var(--card)) !important;
        border: 2px solid var(--netflix-red) !important;
        border-radius: 0px !important;
        box-shadow: var(--shadow-xl);
        backdrop-filter: blur(25px);
      }

      .stage-option {
        font-family: 'Oswald', sans-serif !important;
        text-transform: uppercase !important;
        letter-spacing: 1px !important;
        color: var(--text-primary) !important;
        border-radius: 0px !important;
      }

      .stage-option:hover {
        background: rgba(229, 9, 20, 0.2) !important;
      }
    `
  },

  // Hulu Theme - Fresh green and white modern streaming
  {
    name: 'hulu',
    label: 'Hulu',
    description: 'Fresh green streaming interface inspired by Hulu',
    category: 'modern',
    mode: 'light',
    fontFamily: 'inter',
    borderRadius: 'lg',
    animation: 'playful',
    glassEffect: 'medium',
    colors: createColorPalette(
      '#1ce783', '#00ff7f', '#00d563',
      '#ffffff', '#f0fff8',
      '#0a0a0a', '#333333', 'light',
      {
        success: '#1ce783',
        warning: '#ffa500',
        error: '#ff4757',
        info: '#3742fa',
        pending: '#9c88ff'
      }
    ),
    background: {
      type: 'gradient',
      colors: ['#ffffff', '#f0fff8', '#e6ffef'],
      pattern: 'dots',
      patternOpacity: 0.02,
    },
    customCSS: `
      @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');

      :root {
        --hulu-green: #1ce783;
        --hulu-light: #00ff7f;
        --hulu-dark: #00d563;
      }

      * {
        font-family: 'Space Grotesk', 'Poppins', sans-serif !important;
      }

      .applications-home {
        background: var(--background) !important;
        position: relative;
        max-width: 100%;
        overflow-x: hidden;
      }

      .applications-home::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background:
          radial-gradient(circle at 30% 40%, rgba(28, 231, 131, 0.08) 0%, transparent 50%),
          radial-gradient(circle at 70% 80%, rgba(28, 231, 131, 0.05) 0%, transparent 50%),
          url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%231ce783' fill-opacity='0.03'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3C/g%3E%3C/svg%3E");
        pointer-events: none;
      }

      .header-title-wrapper span:first-child {
        font-family: 'Inter', sans-serif !important;
        font-size: 1.5rem !important;
        font-weight: 600 !important;
        color: var(--text-primary) !important;
        text-transform: capitalize !important;
        letter-spacing: 0.025em;
        white-space: nowrap;
        overflow: hidden;
      }

      .stage-badge {
        font-family: 'Inter', sans-serif !important;
        font-weight: 500 !important;
        text-transform: capitalize !important;
        letter-spacing: 0px !important;
        font-size: 11px !important;
        padding: 6px 14px !important;
        border-radius: 20px !important;
        background: var(--glass-button-bg, var(--hover-bg)) !important;
        border: 1px solid rgba(28, 231, 131, 0.4) !important;
        color: var(--hulu-dark) !important;
        box-shadow: 0 3px 12px rgba(28, 231, 131, 0.2);
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
        max-width: fit-content;
        white-space: nowrap;
        overflow: hidden;
      }

      .stage-badge:hover {
        background: linear-gradient(45deg, rgba(28, 231, 131, 0.25), rgba(28, 231, 131, 0.35)) !important;
        border-color: var(--hulu-green) !important;
        transform: translateY(-2px) scale(1.05) !important;
        box-shadow: 0 8px 25px rgba(28, 231, 131, 0.4);
      }

      .table-row {
        background: var(--glass-bg, var(--background)) !important;
        border-bottom: 1px solid rgba(28, 231, 131, 0.1) !important;
        border-radius: 12px !important;
        margin-bottom: 4px !important;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
      }

      .table-row:hover {
        background: var(--table-row-hover, var(--hover-bg)) !important;
        border-left: 4px solid var(--hulu-green) !important;
        transform: translateX(3px) scale(1.005) !important;
        box-shadow: 0 6px 20px rgba(28, 231, 131, 0.15);
        border-radius: 0 10px 10px 0 !important;
      }

      .dashboard-card {
        background: var(--glass-card-bg, var(--card)) !important;
        border: 1px solid rgba(28, 231, 131, 0.2) !important;
        border-radius: 15px !important;
        box-shadow:
          0 15px 50px rgba(28, 231, 131, 0.1),
          0 0 20px rgba(255, 255, 255, 0.5);
        backdrop-filter: blur(25px);
      }

      .company-name, .position-title {
        font-family: 'Space Grotesk', sans-serif !important;
        font-weight: 500 !important;
      }

      .cell-value {
        font-family: 'Poppins', sans-serif !important;
        font-weight: 400 !important;
      }

      .action-buttons button {
        font-family: 'Space Grotesk', sans-serif !important;
        text-transform: lowercase !important;
        font-weight: 600 !important;
        border-radius: 15px !important;
        background: var(--glass-button-bg, var(--hover-bg)) !important;
        border: 1px solid rgba(28, 231, 131, 0.4) !important;
        color: var(--hulu-dark) !important;
        transition: all 0.3s ease !important;
      }

      .action-buttons button:hover {
        background: var(--glass-hover-bg, var(--hover-bg)) !important;
        border-color: var(--hulu-green) !important;
        transform: translateY(-1px) !important;
        box-shadow: 0 6px 20px rgba(28, 231, 131, 0.3);
      }

      .stage-dropdown {
        border-radius: 20px !important;
        border: 2px solid rgba(28, 231, 131, 0.3) !important;
        background: rgba(255, 255, 255, 0.95) !important;
        box-shadow: 0 20px 60px rgba(28, 231, 131, 0.2);
      }
    `
  },

  // Barbie Theme - Hot pink glamorous design
  {
    name: 'barbie',
    label: 'Barbie',
    description: 'Fabulous hot pink glamour inspired by Barbie',
    category: 'creative',
    mode: 'light',
    fontFamily: 'playfair',
    borderRadius: 'xl',
    animation: 'playful',
    glassEffect: 'heavy',
    colors: createColorPalette(
      '#e91e63', '#ff69b4', '#c2185b',
      '#fef7f7', '#ffe4e6',
      '#1a1a1a', '#4a4a4a', 'light',
      {
        success: '#e91e63',
        warning: '#ff6b35',
        error: '#d32f2f',
        info: '#7b1fa2',
        pending: '#ff4081'
      }
    ),
    background: {
      type: 'solid',
      colors: ['#fdf2f8'],
      pattern: 'none',
      patternOpacity: 0.0,
    },
    customCSS: `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

      :root {
        --barbie-pink: #e91e63;
        --barbie-light: #ff69b4;
        --barbie-accent: #f8bbd9;
      }

      * {
        font-family: 'Inter', sans-serif !important;
      }

      .applications-home {
        background: var(--background) !important;
        position: relative;
        max-width: 100%;
        overflow-x: hidden;
      }

      .applications-home::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: var(--glass-bg);
        pointer-events: none;
      }

      .header-title-wrapper span:first-child {
        font-family: 'Inter', sans-serif !important;
        font-size: 1.5rem !important;
        font-weight: 600 !important;
        color: var(--text-primary) !important;
        text-transform: capitalize !important;
        letter-spacing: 0.5px;
      }

      .stage-badge {
        font-family: 'Inter', sans-serif !important;
        font-weight: 500 !important;
        text-transform: capitalize !important;
        letter-spacing: 0.025em !important;
        font-size: 11px !important;
        padding: 6px 12px !important;
        border-radius: 8px !important;
        background: var(--glass-button-bg, var(--hover-bg)) !important;
        border: 1px solid rgba(233, 30, 99, 0.2) !important;
        color: var(--barbie-pink) !important;
        box-shadow: var(--shadow-sm);
        transition: all 0.2s ease !important;
        max-width: fit-content;
        white-space: nowrap;
        overflow: hidden;
      }

      .stage-badge:hover {
        background: var(--glass-hover-bg, var(--hover-bg)) !important;
        border-color: var(--barbie-pink) !important;
        transform: translateY(-1px) !important;
        box-shadow:
          0 10px 30px rgba(233, 30, 99, 0.5),
          inset 0 2px 0 rgba(255, 255, 255, 0.4);
      }

      .table-row {
        background: var(--glass-bg, var(--background)) !important;
        border-bottom: 2px solid rgba(233, 30, 99, 0.1) !important;
        border-radius: 20px !important;
        margin-bottom: 6px !important;
        transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1) !important;
      }

      .table-row:hover {
        background: var(--table-row-hover, var(--hover-bg)) !important;
        border-left: 5px solid var(--barbie-pink) !important;
        transform: translateX(4px) scale(1.01) !important;
        box-shadow:
          0 8px 25px rgba(233, 30, 99, 0.25),
          0 0 15px rgba(255, 255, 255, 0.8);
        border-radius: 0 15px 15px 0 !important;
      }

      .dashboard-card {
        background: rgba(255, 255, 255, 0.9) !important;
        border: 2px solid rgba(233, 30, 99, 0.3) !important;
        border-radius: 20px !important;
        box-shadow:
          0 20px 60px rgba(233, 30, 99, 0.2),
          0 0 30px rgba(255, 255, 255, 0.6);
        backdrop-filter: blur(30px);
      }

      .company-name {
        font-family: 'Playfair Display', serif !important;
        font-weight: 600 !important;
        font-style: italic !important;
      }

      .position-title {
        font-family: 'Crimson Text', serif !important;
        font-weight: 600 !important;
      }

      .action-buttons button {
        font-family: 'Crimson Text', serif !important;
        text-transform: capitalize !important;
        font-weight: 600 !important;
        border-radius: 20px !important;
        background: var(--glass-button-bg, var(--hover-bg)) !important;
        border: 2px solid rgba(233, 30, 99, 0.4) !important;
        color: var(--barbie-pink) !important;
        transition: all 0.4s ease !important;
      }

      .action-buttons button:hover {
        background: var(--glass-hover-bg, var(--hover-bg)) !important;
        border-color: var(--barbie-pink) !important;
        transform: translateY(-2px) scale(1.05) !important;
        box-shadow: 0 10px 30px rgba(233, 30, 99, 0.4);
      }

      .stage-dropdown {
        border-radius: 20px !important;
        border: 2px solid rgba(233, 30, 99, 0.4) !important;
        background: rgba(255, 255, 255, 0.95) !important;
        box-shadow: 0 25px 70px rgba(233, 30, 99, 0.3);
      }
    `
  },

  // VS Code Theme - Developer focused dark blue theme
  {
    name: 'vscode',
    label: 'VS Code',
    description: 'Developer-focused theme inspired by VS Code',
    category: 'technical',
    mode: 'dark',
    fontFamily: 'jetbrains-mono',
    borderRadius: 'sm',
    animation: 'minimal',
    glassEffect: 'subtle',
    colors: createColorPalette(
      '#007acc', '#4fc3f7', '#005a9e',
      '#1e1e1e', '#252526',
      '#cccccc', '#969696', 'dark',
      {
        success: '#4ec9b0',
        warning: '#ffcc02',
        error: '#f44747',
        info: '#007acc',
        pending: '#c586c0'
      }
    ),
    background: {
      type: 'solid',
      colors: ['#1e1e1e'],
      pattern: 'grid',
      patternOpacity: 0.02,
    },
    customCSS: `
      @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800&family=Fira+Code:wght@300;400;500;600;700&display=swap');

      :root {
        --vscode-blue: #007acc;
        --vscode-dark: #1e1e1e;
        --vscode-darker: #252526;
        --vscode-light: #4fc3f7;
      }

      * {
        font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace !important;
        font-variant-ligatures: common-ligatures;
      }

      .applications-home {
        background: var(--background) !important;
        position: relative;
        max-width: 100%;
        overflow-x: hidden;
      }

      .applications-home::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background:
          linear-gradient(90deg, transparent 98%, rgba(0, 122, 204, 0.03) 100%),
          linear-gradient(0deg, transparent 98%, rgba(0, 122, 204, 0.03) 100%);
        background-size: 25px 25px;
        pointer-events: none;
      }

      .header-title-wrapper span:first-child {
        font-family: 'JetBrains Mono', monospace !important;
        font-size: 1.8rem !important;
        font-weight: 600 !important;
        color: var(--text-primary) !important;
        text-transform: lowercase !important;
        letter-spacing: 2px;
        position: relative;
      }

      .header-title-wrapper span:first-child::before {
        content: '// ';
        color: #6a9955;
        font-weight: normal;
      }

      .header-title-wrapper span:first-child::after {
        content: '';
        display: inline-block;
        width: 2px;
        height: 20px;
        background: var(--vscode-blue);
        margin-left: 8px;
        animation: vscodeBlinkCursor 1.2s infinite;
      }

      @keyframes vscodeBlinkCursor {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0; }
      }

      .stage-badge {
        font-family: 'JetBrains Mono', monospace !important;
        font-weight: 500 !important;
        text-transform: lowercase !important;
        font-size: 11px !important;
        padding: 6px 12px !important;
        border-radius: 4px !important;
        background: rgba(0, 122, 204, 0.15) !important;
        border: 1px solid rgba(0, 122, 204, 0.4) !important;
        color: #4fc3f7 !important;
        letter-spacing: 1px;
        transition: all 0.2s ease !important;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
      }

      .stage-badge:hover {
        background: rgba(0, 122, 204, 0.25) !important;
        border-color: var(--vscode-blue) !important;
        box-shadow:
          0 0 12px rgba(0, 122, 204, 0.4),
          inset 0 1px 0 rgba(255, 255, 255, 0.2);
      }

      .table-row {
        background: var(--glass-bg, var(--surface)) !important;
        border-bottom: 1px solid var(--border-thin, var(--border)) !important;
        transition: all 0.15s ease !important;
      }

      .table-row:hover {
        background: var(--table-row-hover, var(--hover-bg)) !important;
        border-left: 3px solid var(--vscode-blue) !important;
        transform: translateX(2px) !important;
      }

      .dashboard-card {
        background: var(--glass-card-bg, var(--card)) !important;
        border: 1px solid var(--border-thin, var(--border)) !important;
        border-radius: 0 !important;
        box-shadow: var(--card-shadow, var(--shadow-md));
      }

      .table-header {
        background: var(--glass-container-bg, var(--surface)) !important;
        border-bottom: 1px solid var(--border-thin, var(--border)) !important;
        font-family: 'JetBrains Mono', monospace !important;
        text-transform: lowercase !important;
        letter-spacing: 1px !important;
        color: var(--text-secondary) !important;
      }

      .company-name, .position-title, .cell-value {
        font-family: 'JetBrains Mono', monospace !important;
        color: var(--text-primary) !important;
        font-weight: 400 !important;
      }

      .stage-dropdown {
        background: var(--glass-card-bg, var(--card)) !important;
        border: 1px solid var(--border-thin, var(--border)) !important;
        border-radius: 0 !important;
        box-shadow: var(--shadow-xl);
      }

      .stage-option {
        font-family: 'JetBrains Mono', monospace !important;
        font-size: 11px !important;
        letter-spacing: 1px !important;
        color: var(--text-primary) !important;
        border-radius: 0 !important;
      }

      .stage-option:hover {
        background: var(--hover-bg) !important;
      }

      .stage-option.current {
        background: var(--glass-selected-bg, var(--hover-bg)) !important;
        color: var(--vscode-blue) !important;
      }

      /* Add syntax highlighting colors for various elements */
      .header-cell span {
        color: var(--text-secondary) !important; /* Variable color */
      }

      .action-buttons button {
        font-family: 'JetBrains Mono', monospace !important;
        text-transform: lowercase !important;
        background: rgba(0, 122, 204, 0.1) !important;
        border: 1px solid rgba(0, 122, 204, 0.3) !important;
        color: #4fc3f7 !important;
      }

      /* VS Code theme uses proper CSS variables - no hardcoded dark mode */
    `
  },

  // Terminal Hacker Theme - Green matrix-style cyberpunk theme
  {
    name: 'terminal-hacker',
    label: 'Terminal Hacker',
    description: 'Matrix-inspired green cyberpunk terminal aesthetic',
    category: 'technical',
    mode: 'dark',
    fontFamily: 'jetbrains-mono',
    borderRadius: 'none',
    animation: 'intense',
    glassEffect: 'subtle',
    colors: createColorPalette(
      '#00ff41', '#00d435', '#00b82e',
      '#000000', '#0a0a0a',
      '#00ff41', '#00cc33', 'dark',
      {
        success: '#00ff41',
        warning: '#ffcc00',
        error: '#ff0040',
        info: '#00ccff',
        pending: '#cc00ff'
      }
    ),
    background: {
      type: 'solid',
      colors: ['#000000'],
      pattern: 'grid',
      patternOpacity: 0.1,
    },
    customCSS: `
      @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&family=Source+Code+Pro:wght@300;400;500;600;700&display=swap');

      :root {
        --matrix-green: #00ff41;
        --matrix-dark-green: #00cc33;
        --matrix-bg: #000000;
        --matrix-text: #00ff41;
      }

      * {
        font-family: 'JetBrains Mono', 'Source Code Pro', monospace !important;
        letter-spacing: 0.05em;
      }

      .applications-home {
        background:
          linear-gradient(90deg, transparent 98%, rgba(0, 255, 65, 0.03) 100%),
          linear-gradient(0deg, transparent 98%, rgba(0, 255, 65, 0.03) 100%),
          #000000 !important;
        background-size: 20px 20px, 20px 20px, cover;
        position: relative;
        animation: matrixScan 3s linear infinite;
        max-width: 100%;
        overflow-x: hidden;
      }

      @keyframes matrixScan {
        0% { background-position: 0 0, 0 0; }
        100% { background-position: 20px 20px, 0 0; }
      }

      .applications-home::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(
          180deg,
          rgba(0, 255, 65, 0.03) 0%,
          transparent 20%,
          transparent 80%,
          rgba(0, 255, 65, 0.03) 100%
        );
        pointer-events: none;
        z-index: 0;
        animation: scanline 2s linear infinite;
      }

      @keyframes scanline {
        0% { background-position: 0 -100%; }
        100% { background-position: 0 100%; }
      }

      .header-title-wrapper span:first-child {
        font-family: 'JetBrains Mono', monospace !important;
        font-size: 1.8rem !important;
        font-weight: 700 !important;
        color: var(--matrix-green) !important;
        text-shadow: 0 0 10px rgba(0, 255, 65, 0.5), 0 0 20px rgba(0, 255, 65, 0.3);
        animation: terminalGlow 2s ease-in-out infinite alternate;
      }

      @keyframes terminalGlow {
        0% {
          text-shadow: 0 0 5px rgba(0, 255, 65, 0.5), 0 0 10px rgba(0, 255, 65, 0.3);
          transform: scale(1);
        }
        100% {
          text-shadow: 0 0 10px rgba(0, 255, 65, 0.8), 0 0 20px rgba(0, 255, 65, 0.5), 0 0 30px rgba(0, 255, 65, 0.3);
          transform: scale(1.02);
        }
      }

      .table-wrapper,
      .dashboard-card {
        background: rgba(0, 20, 0, 0.9) !important;
        border: 1px solid var(--matrix-green) !important;
        box-shadow:
          0 0 10px rgba(0, 255, 65, 0.2),
          inset 0 0 10px rgba(0, 255, 65, 0.05) !important;
      }

      .table-header {
        background: var(--glass-container-bg, var(--surface)) !important;
        border-bottom: 1px solid var(--matrix-green) !important;
        color: var(--matrix-green) !important;
      }

      .table-row {
        background: var(--glass-bg, var(--background)) !important;
        border-bottom: 1px solid rgba(0, 255, 65, 0.2) !important;
        color: var(--matrix-green) !important;
      }

      .table-row:hover {
        background: var(--table-row-hover, var(--hover-bg)) !important;
        border-left: 3px solid var(--matrix-green) !important;
        box-shadow: 0 0 15px rgba(0, 255, 65, 0.3) !important;
      }

      .stage-badge {
        background: rgba(0, 30, 0, 0.9) !important;
        color: var(--matrix-green) !important;
        border: 1px solid var(--matrix-green) !important;
        box-shadow: 0 0 5px rgba(0, 255, 65, 0.3) !important;
      }

      .control-btn,
      .quick-filter-select {
        background: rgba(0, 30, 0, 0.9) !important;
        color: var(--matrix-green) !important;
        border: 1px solid var(--matrix-green) !important;
      }

      .control-btn:hover {
        background: rgba(0, 50, 0, 0.9) !important;
        box-shadow: 0 0 10px rgba(0, 255, 65, 0.4) !important;
      }

      input, textarea, select {
        background: rgba(0, 20, 0, 0.9) !important;
        color: var(--matrix-green) !important;
        border: 1px solid var(--matrix-green) !important;
        caret-color: var(--matrix-green) !important;
      }

      input:focus, textarea:focus, select:focus {
        box-shadow: 0 0 10px rgba(0, 255, 65, 0.5) !important;
        border-color: var(--matrix-green) !important;
      }
    `
  },

  // Mr Robot Theme - Dark cyberpunk with red accents
  {
    name: 'mr-robot',
    label: 'Mr Robot',
    description: 'Dark cyberpunk theme inspired by the Mr Robot series',
    category: 'dark',
    mode: 'dark',
    fontFamily: 'jetbrains-mono',
    borderRadius: 'sm',
    animation: 'intense',
    glassEffect: 'medium',
    colors: createColorPalette(
      '#ff0040', '#cc0033', '#990026',
      '#0d1421', '#1a1d2e',
      '#ffffff', '#cccccc', 'dark',
      {
        success: '#00ff88',
        warning: '#ffcc00',
        error: '#ff0040',
        info: '#00aaff',
        pending: '#aa00ff'
      }
    ),
    background: {
      type: 'gradient',
      colors: ['#0d1421', '#1a1d2e', '#151825'],
      pattern: 'circuit',
      patternOpacity: 0.1,
    },
    customCSS: `
      @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&family=Courier+Prime:wght@400;700&display=swap');

      :root {
        --mrrobot-red: #ff0040;
        --mrrobot-dark: #0d1421;
        --mrrobot-darker: #0a0f1a;
        --mrrobot-accent: #00aaff;
      }

      * {
        font-family: 'JetBrains Mono', 'Courier Prime', monospace !important;
        letter-spacing: 0.03em;
      }

      .applications-home {
        background:
          radial-gradient(circle at 30% 20%, rgba(255, 0, 64, 0.05) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(0, 170, 255, 0.05) 0%, transparent 50%),
          linear-gradient(135deg, #0d1421 0%, #1a1d2e 50%, #151825 100%) !important;
        position: relative;
        max-width: 100%;
        overflow-x: hidden;
      }

      .applications-home::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image:
          linear-gradient(90deg, transparent 79px, rgba(255, 0, 64, 0.03) 81px, transparent 82px),
          linear-gradient(rgba(255, 0, 64, 0.03) 50%, transparent 50%);
        background-size: 82px 4px, 100% 4px;
        pointer-events: none;
        z-index: 0;
        animation: glitchScan 4s linear infinite;
      }

      @keyframes glitchScan {
        0% { opacity: 0.8; }
        45% { opacity: 0.8; }
        50% { opacity: 0.2; transform: scaleX(1.02); }
        55% { opacity: 0.8; transform: scaleX(1); }
        100% { opacity: 0.8; }
      }

      .header-title-wrapper span:first-child {
        font-family: 'JetBrains Mono', monospace !important;
        font-size: 1.8rem !important;
        font-weight: 700 !important;
        color: var(--mrrobot-red) !important;
        text-shadow: 0 0 10px rgba(255, 0, 64, 0.5);
        animation: robotGlitch 3s ease-in-out infinite;
      }

      @keyframes robotGlitch {
        0%, 90%, 100% {
          transform: translateX(0) scaleX(1);
          filter: hue-rotate(0deg);
        }
        5% {
          transform: translateX(2px) scaleX(1.01);
          filter: hue-rotate(90deg);
        }
        10% {
          transform: translateX(-2px) scaleX(0.99);
          filter: hue-rotate(-90deg);
        }
        15% {
          transform: translateX(0) scaleX(1);
          filter: hue-rotate(0deg);
        }
      }

      .table-wrapper,
      .dashboard-card {
        background: rgba(13, 20, 33, 0.95) !important;
        border: 1px solid rgba(255, 0, 64, 0.3) !important;
        box-shadow:
          0 0 20px rgba(255, 0, 64, 0.1),
          inset 0 0 20px rgba(0, 170, 255, 0.05) !important;
      }

      .table-header {
        background: var(--glass-container-bg, var(--surface)) !important;
        border-bottom: 1px solid var(--mrrobot-red) !important;
        color: var(--text-primary) !important;
      }

      .table-row {
        background: var(--glass-bg, var(--background)) !important;
        border-bottom: 1px solid rgba(255, 0, 64, 0.2) !important;
        color: var(--text-primary) !important;
      }

      .table-row:hover {
        background: var(--table-row-hover, var(--hover-bg)) !important;
        border-left: 3px solid var(--mrrobot-red) !important;
        box-shadow: 0 0 15px rgba(255, 0, 64, 0.2) !important;
      }

      .stage-badge {
        background: var(--glass-card-bg, var(--card)) !important;
        color: var(--text-primary) !important;
        border: 1px solid var(--mrrobot-accent) !important;
      }

      .control-btn,
      .quick-filter-select {
        background: rgba(13, 20, 33, 0.9) !important;
        color: #cccccc !important;
        border: 1px solid rgba(255, 0, 64, 0.4) !important;
      }

      .control-btn:hover {
        background: rgba(26, 29, 46, 0.9) !important;
        border-color: var(--mrrobot-red) !important;
        box-shadow: 0 0 10px rgba(255, 0, 64, 0.3) !important;
      }
    `
  },

  // Fortnite Theme - Vibrant gaming theme with purple and orange
  {
    name: 'fortnite',
    label: 'Fortnite',
    description: 'Vibrant gaming theme inspired by Fortnite',
    category: 'creative',
    mode: 'dark',
    fontFamily: 'inter',
    borderRadius: 'xl',
    animation: 'playful',
    glassEffect: 'heavy',
    colors: createColorPalette(
      '#8b5cf6', '#a855f7', '#7c3aed',
      '#0f0f23', '#1a1a3a',
      '#ffffff', '#e2e8f0', 'dark',
      {
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#06b6d4',
        pending: '#8b5cf6'
      }
    ),
    background: {
      type: 'gradient',
      colors: ['#0f0f23', '#1a1a3a', '#2d1b69'],
      pattern: 'geometric',
      patternOpacity: 0.1,
    },
    customCSS: `
      @import url('https://fonts.googleapis.com/css2?family=Fredoka+One:wght@400&family=Nunito:wght@400;600;700;800&display=swap');

      :root {
        --fortnite-purple: #8b5cf6;
        --fortnite-orange: #f97316;
        --fortnite-blue: #06b6d4;
        --fortnite-pink: #ec4899;
        --fortnite-dark: #0f0f23;
      }

      * {
        font-family: 'Nunito', 'Arial', sans-serif !important;
        letter-spacing: 0.02em;
      }

      .applications-home {
        background:
          radial-gradient(circle at 20% 30%, rgba(139, 92, 246, 0.15) 0%, transparent 60%),
          radial-gradient(circle at 80% 70%, rgba(249, 115, 22, 0.15) 0%, transparent 60%),
          radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.1) 0%, transparent 80%),
          linear-gradient(135deg, #0f0f23 0%, #1a1a3a 50%, #2d1b69 100%) !important;
        position: relative;
        animation: fortniteShift 6s ease-in-out infinite;
        max-width: 100%;
        overflow-x: hidden;
      }

      @keyframes fortniteShift {
        0%, 100% { filter: hue-rotate(0deg) saturate(1); }
        25% { filter: hue-rotate(15deg) saturate(1.1); }
        50% { filter: hue-rotate(30deg) saturate(1.2); }
        75% { filter: hue-rotate(15deg) saturate(1.1); }
      }

      .applications-home::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background:
          linear-gradient(45deg, transparent 48%, rgba(139, 92, 246, 0.05) 49%, rgba(139, 92, 246, 0.05) 51%, transparent 52%),
          linear-gradient(-45deg, transparent 48%, rgba(249, 115, 22, 0.05) 49%, rgba(249, 115, 22, 0.05) 51%, transparent 52%);
        background-size: 40px 40px, 60px 60px;
        pointer-events: none;
        z-index: 0;
        animation: geometricMove 8s linear infinite;
      }

      @keyframes geometricMove {
        0% { background-position: 0 0, 0 0; }
        100% { background-position: 40px 40px, -60px 60px; }
      }

      .header-title-wrapper span:first-child {
        font-family: 'Fredoka One', cursive !important;
        font-size: 2rem !important;
        font-weight: 400 !important;
        background: linear-gradient(45deg, var(--fortnite-purple), var(--fortnite-orange), var(--fortnite-blue), var(--fortnite-pink));
        background-size: 400% 400%;
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: fortniteRainbow 3s ease-in-out infinite;
        filter: drop-shadow(0 0 8px rgba(139, 92, 246, 0.5));
      }

      @keyframes fortniteRainbow {
        0%, 100% {
          background-position: 0% 50%;
          transform: scale(1);
        }
        25% {
          background-position: 100% 50%;
          transform: scale(1.05);
        }
        50% {
          background-position: 100% 100%;
          transform: scale(1.02);
        }
        75% {
          background-position: 0% 100%;
          transform: scale(1.05);
        }
      }

      .table-wrapper,
      .dashboard-card {
        background: rgba(15, 15, 35, 0.9) !important;
        border: 2px solid transparent !important;
        background-image: linear-gradient(rgba(15, 15, 35, 0.9), rgba(15, 15, 35, 0.9)),
                         linear-gradient(45deg, var(--fortnite-purple), var(--fortnite-orange), var(--fortnite-blue)) !important;
        background-origin: border-box !important;
        background-clip: padding-box, border-box !important;
        box-shadow:
          0 0 30px rgba(139, 92, 246, 0.15),
          0 0 60px rgba(249, 115, 22, 0.1) !important;
      }

      .table-header {
        background: var(--glass-container-bg, var(--surface)) !important;
        border-bottom: 2px solid var(--fortnite-purple) !important;
        color: var(--text-primary) !important;
      }

      .table-row {
        background: var(--glass-bg, var(--background)) !important;
        border-bottom: 1px solid rgba(139, 92, 246, 0.2) !important;
        color: var(--text-primary) !important;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
      }

      .table-row:hover {
        background: rgba(26, 26, 58, 0.9) !important;
        border-left: 4px solid var(--fortnite-orange) !important;
        box-shadow: 0 0 20px rgba(139, 92, 246, 0.2) !important;
        transform: translateX(4px) !important;
      }

      .stage-badge {
        background: linear-gradient(45deg, var(--fortnite-purple), var(--fortnite-blue)) !important;
        color: var(--text-primary) !important;
        border: none !important;
        font-weight: 700 !important;
        box-shadow: 0 0 15px rgba(139, 92, 246, 0.4) !important;
      }

      .control-btn,
      .quick-filter-select {
        background: var(--glass-card-bg, var(--card)) !important;
        color: var(--text-primary) !important;
        border: 2px solid var(--fortnite-purple) !important;
        font-weight: 600 !important;
      }

      .control-btn:hover {
        background: var(--fortnite-purple) !important;
        color: var(--text-inverse) !important;
        transform: translateY(-2px) scale(1.05) !important;
        box-shadow: 0 5px 20px rgba(139, 92, 246, 0.4) !important;
      }
    `
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

    // Remove existing custom theme styles
    const existingStyle = document.getElementById('custom-theme-styles');
    if (existingStyle) {
      existingStyle.remove();
    }

    // Apply current theme's custom CSS with enhanced font loading
    if (currentTheme.customCSS) {
      const style = document.createElement('style');
      style.id = 'custom-theme-styles';
      style.textContent = currentTheme.customCSS;
      document.head.appendChild(style);
    }

    // Force typography changes for different themes
    const fontFamily = currentTheme.fontFamily || 'inter';
    let fontStack = '';

    switch (fontFamily) {
      case 'inter':
        fontStack = '"Inter", -apple-system, BlinkMacSystemFont, sans-serif';
        break;
      case 'playfair':
        fontStack = '"Playfair Display", Georgia, serif';
        break;
      case 'jetbrains-mono':
        fontStack = '"JetBrains Mono", "Fira Code", "Consolas", monospace';
        break;
      default:
        fontStack = '-apple-system, BlinkMacSystemFont, sans-serif';
    }

    // Apply font family to entire document
    document.documentElement.style.setProperty('--theme-font-family', fontStack);

    // Store theme and settings
    localStorage.setItem('themeName', themeName);
    localStorage.setItem('currentMode', currentTheme.mode);
    if (themeName === 'custom') {
      localStorage.setItem('themeSettings', JSON.stringify(currentTheme));
    }
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

    // Enhanced border system for proper theming
    docStyle.setProperty('--border-light', currentTheme.colors.borderLight);
    docStyle.setProperty('--border-strong', currentTheme.colors.borderStrong);

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

    // Glass accent variables for status badges with proper contrast
    docStyle.setProperty('--glass-accent-blue', isLight ? '#1e40af' : '#3b82f6');
    docStyle.setProperty('--glass-accent-blue-light', isLight ? 'rgba(59, 130, 246, 0.1)' : 'rgba(96, 165, 250, 0.2)');
    docStyle.setProperty('--glass-accent-blue-border', isLight ? 'rgba(59, 130, 246, 0.2)' : 'rgba(96, 165, 250, 0.3)');

    docStyle.setProperty('--glass-accent-purple', isLight ? '#7c3aed' : '#8b5cf6');
    docStyle.setProperty('--glass-accent-purple-light', isLight ? 'rgba(139, 92, 246, 0.1)' : 'rgba(167, 139, 250, 0.2)');
    docStyle.setProperty('--glass-accent-purple-border', isLight ? 'rgba(139, 92, 246, 0.2)' : 'rgba(167, 139, 250, 0.3)');

    docStyle.setProperty('--glass-accent-green', isLight ? '#047857' : '#10b981');
    docStyle.setProperty('--glass-accent-green-light', isLight ? 'rgba(16, 185, 129, 0.1)' : 'rgba(52, 211, 153, 0.2)');
    docStyle.setProperty('--glass-accent-green-border', isLight ? 'rgba(16, 185, 129, 0.2)' : 'rgba(52, 211, 153, 0.3)');

    docStyle.setProperty('--glass-accent-success', isLight ? '#047857' : '#10b981');
    docStyle.setProperty('--glass-accent-success-light', isLight ? 'rgba(16, 185, 129, 0.1)' : 'rgba(52, 211, 153, 0.2)');
    docStyle.setProperty('--glass-accent-success-border', isLight ? 'rgba(16, 185, 129, 0.2)' : 'rgba(52, 211, 153, 0.3)');

    docStyle.setProperty('--glass-accent-red', isLight ? '#dc2626' : '#ef4444');
    docStyle.setProperty('--glass-accent-red-light', isLight ? 'rgba(239, 68, 68, 0.1)' : 'rgba(248, 113, 113, 0.2)');
    docStyle.setProperty('--glass-accent-red-border', isLight ? 'rgba(239, 68, 68, 0.2)' : 'rgba(248, 113, 113, 0.3)');

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

      // Additional variables that components expect
      docStyle.setProperty('--glass-container-bg', currentTheme.colors.surface);
      docStyle.setProperty('--glass-card-container-bg', currentTheme.colors.card);
      docStyle.setProperty('--table-header-bg', currentTheme.colors.surface);
      docStyle.setProperty('--table-row-bg', currentTheme.colors.card);
      docStyle.setProperty('--table-row-hover', hoverBg);

      // Modal and overlay variables
      const modalBackdrop = currentTheme.mode === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)';
      docStyle.setProperty('--modal-backdrop', modalBackdrop);

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
    docStyle.setProperty('--border-thin', `1px solid ${currentTheme.colors.border}`);
    docStyle.setProperty('--border-divider', `1px solid ${currentTheme.colors.borderLight}`);
    docStyle.setProperty('--border-hover', `1px solid ${currentTheme.colors.borderStrong}`);

    // Shadows with theme colors
    const shadowColor = currentTheme.mode === 'dark' ? '0, 0, 0' : primaryRgb;
    docStyle.setProperty('--shadow-sm', `0 1px 2px rgba(${shadowColor}, 0.1)`);
    docStyle.setProperty('--shadow-md', `0 4px 6px rgba(${shadowColor}, 0.1)`);
    docStyle.setProperty('--shadow-lg', `0 10px 15px rgba(${shadowColor}, 0.1)`);

    // Modal backdrop
    docStyle.setProperty('--modal-backdrop', currentTheme.mode === 'dark' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.3)');

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

    // Apply custom CSS if present
    let customStyleElement = document.getElementById('theme-custom-css');
    if (currentTheme.customCSS) {
      if (!customStyleElement) {
        customStyleElement = document.createElement('style');
        customStyleElement.id = 'theme-custom-css';
        document.head.appendChild(customStyleElement);
      }
      customStyleElement.innerHTML = currentTheme.customCSS;
    } else if (customStyleElement) {
      customStyleElement.remove();
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
      } else if (themeName === 'netflix') {
        baseTheme.colors = createColorPalette(
          '#e50914', '#ff1a1a', '#b81d24',
          newMode === 'light' ? '#f5f5f1' : '#141414',
          newMode === 'light' ? '#fafafa' : '#0a0a0a',
          newMode === 'light' ? '#333333' : '#ffffff',
          newMode === 'light' ? '#666666' : '#e5e5e5',
          newMode,
          {
            success: '#46d369',
            warning: '#f9c23c',
            error: '#e50914',
            info: '#0ea5e9',
            pending: '#f5c518'
          }
        );
        baseTheme.background = {
          type: 'gradient',
          colors: newMode === 'light'
            ? ['#f5f5f1', '#ffffff', '#fafafa']
            : ['#0a0a0a', '#141414', '#1a1a1a'],
          pattern: 'none',
          patternOpacity: 0.0,
        };
      } else if (themeName === 'hulu') {
        baseTheme.colors = createColorPalette(
          '#1ce783', '#00ff7f', '#00d563',
          newMode === 'light' ? '#ffffff' : '#0a0a0a',
          newMode === 'light' ? '#f0fff8' : '#1a1a1a',
          newMode === 'light' ? '#0a0a0a' : '#ffffff',
          newMode === 'light' ? '#333333' : '#e5e5e5',
          newMode,
          {
            success: '#1ce783',
            warning: '#ffb347',
            error: '#ff6b6b',
            info: '#4ecdc4',
            pending: '#a78bfa'
          }
        );
        baseTheme.background = {
          type: 'gradient',
          colors: newMode === 'light'
            ? ['#ffffff', '#f0fff8', '#e8fffe']
            : ['#0a0a0a', '#1a1a1a', '#0d2818'],
          pattern: 'none',
          patternOpacity: 0.0,
        };
      } else if (themeName === 'barbie') {
        baseTheme.colors = createColorPalette(
          '#ff1493', '#ff69b4', '#db7093',
          newMode === 'light' ? '#fff0f5' : '#2d1b2e',
          newMode === 'light' ? '#ffe4e6' : '#1f0a1f',
          newMode === 'light' ? '#2d1b2e' : '#ffb3d9',
          newMode === 'light' ? '#8b4a8b' : '#ff99cc',
          newMode,
          {
            success: '#ff69b4',
            warning: '#ffd700',
            error: '#ff1493',
            info: '#ff91a4',
            pending: '#da70d6'
          }
        );
        baseTheme.background = {
          type: 'gradient',
          colors: newMode === 'light'
            ? ['#fff0f5', '#ffe4e6', '#ffc0cb']
            : ['#2d1b2e', '#1f0a1f', '#4a1a4a'],
          pattern: 'none',
          patternOpacity: 0.0,
        };
      } else if (themeName === 'vscode') {
        baseTheme.colors = createColorPalette(
          '#007acc', '#0098ff', '#005a9e',
          newMode === 'light' ? '#f3f3f3' : '#1e1e1e',
          newMode === 'light' ? '#ffffff' : '#252526',
          newMode === 'light' ? '#1e1e1e' : '#ffffff',
          newMode === 'light' ? '#333333' : '#cccccc',
          newMode,
          {
            success: '#89d185',
            warning: '#ffcc02',
            error: '#f85149',
            info: '#007acc',
            pending: '#b180d7'
          }
        );
        baseTheme.background = {
          type: 'solid',
          colors: newMode === 'light' ? ['#f3f3f3'] : ['#1e1e1e'],
          pattern: 'none',
          patternOpacity: 0.0,
        };
      } else if (themeName === 'terminal-hacker') {
        baseTheme.colors = createColorPalette(
          '#00ff00', '#39ff14', '#32cd32',
          newMode === 'light' ? '#f0f8f0' : '#000000',
          newMode === 'light' ? '#e8ffe8' : '#0a0a0a',
          newMode === 'light' ? '#000000' : '#00ff00',
          newMode === 'light' ? '#006600' : '#39ff14',
          newMode,
          {
            success: '#00ff00',
            warning: '#ffff00',
            error: '#ff0000',
            info: '#00ffff',
            pending: '#ff00ff'
          }
        );
        baseTheme.background = {
          type: 'solid',
          colors: newMode === 'light' ? ['#f0f8f0'] : ['#000000'],
          pattern: 'none',
          patternOpacity: 0.0,
        };
      } else if (themeName === 'mr-robot') {
        baseTheme.colors = createColorPalette(
          '#ff0000', '#ff4444', '#cc0000',
          newMode === 'light' ? '#fafafa' : '#0a0a0a',
          newMode === 'light' ? '#f5f5f5' : '#1a1a1a',
          newMode === 'light' ? '#0a0a0a' : '#ffffff',
          newMode === 'light' ? '#666666' : '#cccccc',
          newMode,
          {
            success: '#00ff00',
            warning: '#ffff00',
            error: '#ff0000',
            info: '#00ffff',
            pending: '#ff00ff'
          }
        );
        baseTheme.background = {
          type: 'gradient',
          colors: newMode === 'light'
            ? ['#fafafa', '#f5f5f5', '#f0f0f0']
            : ['#0a0a0a', '#1a1a1a', '#2a2a2a'],
          pattern: 'none',
          patternOpacity: 0.0,
        };
      } else if (themeName === 'fortnite') {
        baseTheme.colors = createColorPalette(
          '#007eff', '#40e0d0', '#00bfff',
          newMode === 'light' ? '#f0f8ff' : '#1a1a2e',
          newMode === 'light' ? '#e8f4ff' : '#16213e',
          newMode === 'light' ? '#1a1a2e' : '#ffffff',
          newMode === 'light' ? '#4169e1' : '#e0e6ff',
          newMode,
          {
            success: '#00ff88',
            warning: '#ffd700',
            error: '#ff4444',
            info: '#007eff',
            pending: '#9966cc'
          }
        );
        baseTheme.background = {
          type: 'gradient',
          colors: newMode === 'light'
            ? ['#f0f8ff', '#e8f4ff', '#ddeeff']
            : ['#1a1a2e', '#16213e', '#0f1419'],
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
