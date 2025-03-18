// contexts/ThemeContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type ColorTheme = 'light' | 'dark';
export type AccentColor = 'blue' | 'purple' | 'pink' | 'orange' | 'green' | 'yellow' | 'red';
export type FontFamily = 'inter' | 'lexend' | 'roboto' | 'poppins' | 'montserrat';
export type BorderRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
export type Animation = 'minimal' | 'subtle' | 'moderate' | 'playful' | 'intense';
export type GlassEffect = 'none' | 'subtle' | 'medium' | 'heavy';

export interface ThemeSettings {
  colorTheme: ColorTheme;
  accentColor: AccentColor;
  fontFamily: FontFamily;
  borderRadius: BorderRadius;
  animation: Animation;
  glassEffect: GlassEffect;
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
  toggleColorTheme: () => void;
}

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
    },
  },
  {
    name: 'elegant',
    label: 'Premium',
    settings: {
      colorTheme: 'dark',
      accentColor: 'purple',
      fontFamily: 'montserrat',
      borderRadius: 'md',
      animation: 'moderate',
      glassEffect: 'medium',
    },
  },
  {
    name: 'playful',
    label: 'Playful',
    settings: {
      colorTheme: 'light',
      accentColor: 'orange',
      fontFamily: 'poppins',
      borderRadius: 'xl',
      animation: 'playful',
      glassEffect: 'medium',
    },
  },
  {
    name: 'corporate',
    label: 'Enterprise',
    settings: {
      colorTheme: 'light',
      accentColor: 'green',
      fontFamily: 'roboto',
      borderRadius: 'sm',
      animation: 'minimal',
      glassEffect: 'subtle',
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
    },
  },
  {
    name: 'oceanic',
    label: 'Deep Sea',
    settings: {
      colorTheme: 'dark',
      accentColor: 'blue',
      fontFamily: 'poppins',
      borderRadius: 'xl',
      animation: 'subtle',
      glassEffect: 'heavy',
    },
  },
  {
    name: 'monochrome',
    label: 'Monochrome',
    settings: {
      colorTheme: 'light',
      accentColor: 'blue',
      fontFamily: 'montserrat',
      borderRadius: 'md',
      animation: 'minimal',
      glassEffect: 'none',
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
