import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface ThemeSwitcherProps {
  className?: string;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ className = '' }) => {
  const { mode, toggleMode } = useTheme(); return (
    <button
      onClick={toggleMode}
      className={`theme-switcher ${className}`}
      aria-label={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}
    >
      {mode === 'light' ? (
        <Moon size={18} />
      ) : (
        <Sun size={18} />
      )}

      <style jsx>{`
        .theme-switcher {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--border-radius);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .theme-switcher:hover {
          background: var(--hover-bg);
          color: var(--text-primary);
          border-color: var(--border-strong);
          transform: translateY(-1px);
        }

        .theme-switcher:active {
          transform: translateY(0);
        }
      `}</style>
    </button>
  );
};
