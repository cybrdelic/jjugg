import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo, startTransition } from 'react';

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
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setModeState(prefersDark ? 'dark' : 'light');
        }
    }, []);

    // Apply theme to document (defer to next frame to avoid blocking)
    useEffect(() => {
        const apply = () => {
            const root = document.documentElement;
            if (mode === 'dark') {
                root.setAttribute('data-theme', 'dark');
            } else {
                root.removeAttribute('data-theme');
            }
        };
        if (typeof window !== 'undefined' && 'requestAnimationFrame' in window) {
            requestAnimationFrame(apply);
        } else {
            apply();
        }

        const persist = () => {
            try { localStorage.setItem('theme-mode', mode); } catch { /* noop */ }
        };
        if (typeof window !== 'undefined' && (window as any).requestIdleCallback) {
            (window as any).requestIdleCallback(persist);
        } else {
            setTimeout(persist, 0);
        }
    }, [mode]);

    const toggleMode = useCallback(() => {
        startTransition(() => {
            setModeState(prev => (prev === 'light' ? 'dark' : 'light'));
        });
    }, []);

    const setMode = useCallback((newMode: ThemeMode) => {
        startTransition(() => setModeState(newMode));
    }, []);

    const value = useMemo(() => ({ mode, toggleMode, setMode }), [mode, toggleMode, setMode]);

    return (
        <ThemeContext.Provider value={value}>
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
