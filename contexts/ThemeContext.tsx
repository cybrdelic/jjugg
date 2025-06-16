// contexts/ThemeContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type ColorTheme = 'light' | 'dark';
export type AccentColor = 'blue' | 'purple' | 'pink' | 'orange' | 'green' | 'yellow' | 'red';
export type FontFamily = 'inter' | 'lexend';
export type BorderRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
export type Animation = 'minimal' | 'subtle' | 'moderate' | 'playful' | 'intense';
export type GlassEffect = 'none' | 'subtle' | 'medium' | 'heavy';

// Enhanced background types
export type BackgroundType = 'color' | 'gradient' | 'pattern' | 'image' | 'video' | 'gif';
export type BackgroundPattern = 'none' | 'dots' | 'grid' | 'lines' | 'waves' | 'circuit' | 'geometric' | 'noise' | 'bubbles' | 'hexagons';
export type BackgroundAnimation = 'none' | 'slow' | 'normal' | 'fast' | 'pulse' | 'shift' | 'parallax';
export type BackgroundBlend = 'normal' | 'overlay' | 'screen' | 'multiply' | 'darken' | 'lighten';

export interface BackgroundMedia {
  type: 'image' | 'video' | 'gif';
  url: string; // URL to media file (could be data URL or file path)
  opacity: number; // 0-100
  blur: number; // 0-10
  scale: number; // 50-150 (percentage)
}

export interface BackgroundSettings {
  type: BackgroundType;
  color1: string; // Primary color (used for solid color or gradient start)
  color2: string; // Secondary color (used for gradient end)
  useAccentColors: boolean; // Whether to use theme accent colors
  pattern: BackgroundPattern;
  patternColor: string; // Color of pattern elements
  patternOpacity: number; // 0-100
  patternScale: number; // 50-200 (percentage)
  animation: BackgroundAnimation;
  animationSpeed: number; // 1-10
  blendMode: BackgroundBlend;
  media?: BackgroundMedia; // Optional media settings
}

export interface ThemeSettings {
  colorTheme: ColorTheme;
  accentColor: AccentColor;
  fontFamily: FontFamily;
  borderRadius: BorderRadius;
  animation: Animation;
  glassEffect: GlassEffect;
  background: BackgroundSettings;
}

export type ThemeName = 'default' | 'minimal' | 'neon' | 'elegant' | 'playful' | 'corporate' | 'sunset' | 'oceanic' | 'monochrome' | 'custom';

export interface ThemeOption {
  name: ThemeName;
  label: string;
  settings: ThemeSettings;
  preview?: string;
}

interface ThemeContextType {
  currentTheme: ThemeSettings;
  themeName: ThemeName;
  availableThemes: ThemeOption[];
  setThemeName: (name: ThemeName) => void;
  updateThemeSetting: <K extends keyof ThemeSettings>(setting: K, value: ThemeSettings[K]) => void;
  updateBackgroundSetting: <K extends keyof BackgroundSettings>(setting: K, value: BackgroundSettings[K]) => void;
  setBackgroundMedia: (media: BackgroundMedia | undefined) => void;
  toggleColorTheme: () => void;
}

// Default background settings
const defaultBackground: BackgroundSettings = {
  type: 'gradient',
  color1: '#0f172a',
  color2: '#1e293b',
  useAccentColors: true,
  pattern: 'none',
  patternColor: 'rgba(255,255,255,0.05)',
  patternOpacity: 20,
  patternScale: 100,
  animation: 'normal',
  animationSpeed: 5,
  blendMode: 'normal',
};

// Define predefined themes with distinct design aesthetics
const themeOptions: ThemeOption[] = [
  {
    name: 'default',
    label: 'Default',
    settings: {
      colorTheme: 'dark',
      accentColor: 'blue',
      fontFamily: 'inter',
      borderRadius: 'md',
      animation: 'subtle',
      glassEffect: 'medium',
      background: {
        ...defaultBackground,
        type: 'gradient',
        useAccentColors: true,
        pattern: 'dots',
        animation: 'normal'
      }
    },
  },
  {
    name: 'minimal',
    label: 'Minimalist',
    settings: {
      colorTheme: 'light',
      accentColor: 'blue',
      fontFamily: 'inter',
      borderRadius: 'sm',
      animation: 'minimal',
      glassEffect: 'subtle',
      background: {
        ...defaultBackground,
        type: 'color',
        color1: '#f8fafc',
        useAccentColors: false,
        pattern: 'none',
        animation: 'none'
      }
    },
  },
  {
    name: 'neon',
    label: 'Cyberpunk',
    settings: {
      colorTheme: 'dark',
      accentColor: 'pink',
      fontFamily: 'lexend',
      borderRadius: 'lg',
      animation: 'intense',
      glassEffect: 'heavy',
      background: {
        ...defaultBackground,
        type: 'gradient',
        color1: '#0f0a1e',
        color2: '#1a0b2e',
        useAccentColors: true,
        pattern: 'grid',
        patternScale: 80,
        animation: 'pulse',
        animationSpeed: 8
      }
    },
  },
  {
    name: 'elegant',
    label: 'Premium', settings: {
      colorTheme: 'dark',
      accentColor: 'purple',
      fontFamily: 'lexend',
      borderRadius: 'md',
      animation: 'moderate',
      glassEffect: 'medium',
      background: {
        ...defaultBackground,
        type: 'gradient',
        color1: '#0f0514',
        color2: '#1a0b23',
        useAccentColors: true,
        pattern: 'noise',
        patternOpacity: 10,
        animation: 'slow',
        blendMode: 'overlay'
      }
    },
  },
  {
    name: 'playful',
    label: 'Playful', settings: {
      colorTheme: 'light',
      accentColor: 'orange',
      fontFamily: 'inter',
      borderRadius: 'xl',
      animation: 'playful',
      glassEffect: 'medium',
      background: {
        ...defaultBackground,
        type: 'gradient',
        color1: '#f9fafb',
        color2: '#fff7ed',
        useAccentColors: true,
        pattern: 'bubbles',
        patternScale: 120,
        animation: 'fast',
        patternOpacity: 30
      }
    },
  },
  {
    name: 'corporate',
    label: 'Enterprise', settings: {
      colorTheme: 'light',
      accentColor: 'green',
      fontFamily: 'inter',
      borderRadius: 'sm',
      animation: 'minimal',
      glassEffect: 'subtle',
      background: {
        ...defaultBackground,
        type: 'color',
        color1: '#f9fafb',
        useAccentColors: false,
        pattern: 'lines',
        patternOpacity: 5,
        patternScale: 150,
        animation: 'none'
      }
    },
  },
  {
    name: 'sunset',
    label: 'Warm',
    settings: {
      colorTheme: 'dark',
      accentColor: 'orange',
      fontFamily: 'lexend',
      borderRadius: 'lg',
      animation: 'moderate',
      glassEffect: 'heavy',
      background: {
        ...defaultBackground,
        type: 'gradient',
        color1: '#27150f',
        color2: '#1c1311',
        useAccentColors: true,
        pattern: 'waves',
        patternOpacity: 30,
        animation: 'shift'
      }
    },
  },
  {
    name: 'oceanic',
    label: 'Deep Sea', settings: {
      colorTheme: 'dark',
      accentColor: 'blue',
      fontFamily: 'lexend',
      borderRadius: 'xl',
      animation: 'subtle',
      glassEffect: 'heavy',
      background: {
        ...defaultBackground,
        type: 'gradient',
        color1: '#0c4a6e',
        color2: '#0f172a',
        useAccentColors: true,
        pattern: 'waves',
        patternOpacity: 40,
        animation: 'parallax'
      }
    },
  },
  {
    name: 'monochrome',
    label: 'Monochrome', settings: {
      colorTheme: 'light',
      accentColor: 'blue',
      fontFamily: 'inter',
      borderRadius: 'md',
      animation: 'minimal',
      glassEffect: 'none',
      background: {
        ...defaultBackground,
        type: 'color',
        color1: '#ffffff',
        useAccentColors: false,
        pattern: 'none',
        animation: 'none'
      }
    },
  },
  {
    name: 'custom',
    label: 'Custom',
    settings: {
      colorTheme: 'dark',
      accentColor: 'blue',
      fontFamily: 'inter',
      borderRadius: 'md',
      animation: 'subtle',
      glassEffect: 'medium',
      background: {
        ...defaultBackground
      }
    },
  },
];

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const getInitialTheme = (): ThemeName => {
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('themeName');
    if (savedTheme && themeOptions.some(t => t.name === savedTheme)) {
      return savedTheme as ThemeName;
    }
  }
  return 'default';
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [themeName, setThemeName] = useState<ThemeName>('default');
  const [currentTheme, setCurrentTheme] = useState<ThemeSettings>(themeOptions[0].settings);

  // Load saved theme on mount
  useEffect(() => {
    const initialThemeName = getInitialTheme();
    setThemeName(initialThemeName);

    const savedThemeSettings = localStorage.getItem('themeSettings');
    if (initialThemeName === 'custom' && savedThemeSettings) {
      try {
        const parsedSettings = JSON.parse(savedThemeSettings) as ThemeSettings;
        setCurrentTheme(parsedSettings);
      } catch (e) {
        // If parsing fails, use default theme
        const defaultTheme = themeOptions.find(t => t.name === initialThemeName)?.settings || themeOptions[0].settings;
        setCurrentTheme(defaultTheme);
      }
    } else {
      const themeOption = themeOptions.find(t => t.name === initialThemeName);
      if (themeOption) {
        setCurrentTheme(themeOption.settings);
      }
    }
  }, []);

  // Apply theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Core theme classes
    const themeClasses = [
      currentTheme.colorTheme,
      `accent-${currentTheme.accentColor}`,
      `font-${currentTheme.fontFamily}`,
      `rounded-${currentTheme.borderRadius}`,
      `anim-${currentTheme.animation}`,
      `glass-${currentTheme.glassEffect}`,
    ];

    // Clean up old theme classes
    document.body.className = '';
    document.documentElement.className = '';

    // Apply new theme classes
    themeClasses.forEach(cls => {
      document.body.classList.add(cls);
      document.documentElement.classList.add(cls);
    });

    // Apply background styles directly for more flexibility
    const bg = currentTheme.background;

    // Create CSS variables for background
    document.documentElement.style.setProperty('--bg-color1', bg.color1);
    document.documentElement.style.setProperty('--bg-color2', bg.color2 || bg.color1);
    document.documentElement.style.setProperty('--bg-pattern-color', bg.patternColor);
    document.documentElement.style.setProperty('--bg-pattern-opacity', `${bg.patternOpacity / 100}`);
    document.documentElement.style.setProperty('--bg-pattern-scale', `${bg.patternScale}%`);
    document.documentElement.style.setProperty('--bg-animation-speed', `${11 - bg.animationSpeed}s`);

    // Apply background type class
    document.body.classList.add(`bg-type-${bg.type}`);

    // Apply pattern class if applicable
    if (bg.pattern !== 'none') {
      document.body.classList.add(`bg-pattern-${bg.pattern}`);
    }

    // Apply animation class if applicable
    if (bg.animation !== 'none') {
      document.body.classList.add(`bg-anim-${bg.animation}`);
    }

    // Apply blend mode
    document.body.classList.add(`bg-blend-${bg.blendMode}`);

    // Apply accent colors flag
    if (bg.useAccentColors) {
      document.body.classList.add('bg-use-accent');
    }

    // Apply media background if present
    const appContainer = document.querySelector('.app-container');
    if (appContainer) {
      if (bg.media) {
        const { type, url, opacity, blur, scale } = bg.media;

        // Create or get the media element
        let mediaElement = document.getElementById('theme-bg-media');
        if (!mediaElement) {
          mediaElement = document.createElement('div');
          mediaElement.id = 'theme-bg-media';
          appContainer.insertBefore(mediaElement, appContainer.firstChild);
        }

        // Set styles according to media type
        mediaElement.style.opacity = `${opacity / 100}`;
        mediaElement.style.filter = `blur(${blur}px)`;
        mediaElement.style.transform = `scale(${scale / 100})`;

        if (type === 'image' || type === 'gif') {
          mediaElement.style.backgroundImage = `url(${url})`;
          mediaElement.style.backgroundSize = 'cover';
          mediaElement.style.backgroundPosition = 'center';
        } else if (type === 'video') {
          // Clear previous content
          mediaElement.innerHTML = '';

          // Create video element
          const video = document.createElement('video');
          video.src = url;
          video.autoplay = true;
          video.loop = true;
          video.muted = true;
          video.style.width = '100%';
          video.style.height = '100%';
          video.style.objectFit = 'cover';

          mediaElement.appendChild(video);
        }
      } else {
        // Remove media element if no media is set
        const mediaElement = document.getElementById('theme-bg-media');
        if (mediaElement) {
          mediaElement.remove();
        }
      }
    }

    // Save theme preferences
    if (typeof window !== 'undefined') {
      localStorage.setItem('themeName', themeName);
      if (themeName === 'custom') {
        localStorage.setItem('themeSettings', JSON.stringify(currentTheme));
      }
    }
  }, [currentTheme, themeName]);

  const handleThemeChange = (name: ThemeName) => {
    setThemeName(name);

    if (name !== 'custom') {
      const themeOption = themeOptions.find(t => t.name === name);
      if (themeOption) {
        setCurrentTheme(themeOption.settings);
      }
    }
  };

  const updateThemeSetting = <K extends keyof ThemeSettings>(
    setting: K,
    value: ThemeSettings[K]
  ) => {
    setCurrentTheme(prev => ({ ...prev, [setting]: value }));

    // When changing a specific setting, we're now in custom mode
    setThemeName('custom');
  };

  const updateBackgroundSetting = <K extends keyof BackgroundSettings>(
    setting: K,
    value: BackgroundSettings[K]
  ) => {
    setCurrentTheme(prev => ({
      ...prev,
      background: {
        ...prev.background,
        [setting]: value
      }
    }));

    // When changing a specific setting, we're now in custom mode
    setThemeName('custom');
  };

  const setBackgroundMedia = (media: BackgroundMedia | undefined) => {
    setCurrentTheme(prev => ({
      ...prev,
      background: {
        ...prev.background,
        media,
        type: media ? 'image' : prev.background.type
      }
    }));

    // When changing a specific setting, we're now in custom mode
    setThemeName('custom');
  };

  const toggleColorTheme = () => {
    updateThemeSetting('colorTheme', currentTheme.colorTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        themeName,
        availableThemes: themeOptions,
        setThemeName: handleThemeChange,
        updateThemeSetting,
        updateBackgroundSetting,
        setBackgroundMedia,
        toggleColorTheme,
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
