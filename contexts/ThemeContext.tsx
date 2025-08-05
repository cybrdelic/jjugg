import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
    mode: ThemeMode;
    toggleMode: () => void;
    setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
    children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const [mode, setModeState] = useState<ThemeMode>('light');

    // Load saved theme on mount
    useEffect(() => {
        const savedMode = localStorage.getItem('theme-mode') as ThemeMode;
        if (savedMode && (savedMode === 'light' || savedMode === 'dark')) {
            setModeState(savedMode);
        } else {
            // Check system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setModeState(prefersDark ? 'dark' : 'light');
        }
    }, []);

    // Apply theme to document
    useEffect(() => {
        if (mode === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
        localStorage.setItem('theme-mode', mode);
    }, [mode]);

    const toggleMode = () => {
        setModeState(prev => prev === 'light' ? 'dark' : 'light');
    };

    const setMode = (newMode: ThemeMode) => {
        setModeState(newMode);
    };

    return (
        <ThemeContext.Provider value={{ mode, toggleMode, setMode }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
