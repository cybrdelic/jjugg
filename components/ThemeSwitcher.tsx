import React, { useState } from 'react';
import { useTheme, ThemeName } from '@/contexts/ThemeContext';
import { Sun, Moon, Palette, Check, ChevronDown } from 'lucide-react';
import SideDrawer from './SideDrawer';

const ThemeSwitcher: React.FC = () => {
  const { currentTheme, themeName, availableThemes, setThemeName, toggleColorMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const themeLabels: Record<ThemeName, string> = {
    professional: 'Professional',
    modern: 'Modern',
    creative: 'Creative',
    developer: 'Developer',
    custom: 'Custom',
  };

  const themeDescriptions: Record<ThemeName, string> = {
    professional: 'Clean and business-focused',
    modern: 'Tech startup aesthetic',
    creative: 'Warm and expressive',
    developer: 'Terminal-inspired',
    custom: 'Your personalized theme',
  };

  return (
    <div className="theme-switcher-container">
      <button
        className="theme-toggle-btn"
        aria-expanded={isOpen}
        aria-label="Toggle theme menu"
        onClick={() => setIsOpen(true)}
      >
        <Palette size={20} />
        <span>Theme</span>
        <ChevronDown size={16} className={`chevron ${isOpen ? 'rotate' : ''}`} />
      </button>

      <SideDrawer
        isVisible={isOpen}
        onClose={() => setIsOpen(false)}
        position="right"
        width="320px"
      >
        <div className="theme-drawer-content">
          <h2 className="theme-title">Theme Settings</h2>

          {/* Dark Mode Toggle */}
          <div className="dark-mode-section">
            <label className="dark-mode-label">Dark Mode</label>
            <button
              className={`dark-mode-toggle ${currentTheme.mode === 'dark' ? 'active' : ''}`}
              onClick={toggleColorMode}
            >
              <div className="toggle-track">
                <div className="toggle-thumb">
                  {currentTheme.mode === 'dark' ? <Moon size={12} /> : <Sun size={12} />}
                </div>
              </div>
              <span>{currentTheme.mode === 'dark' ? 'Dark' : 'Light'}</span>
            </button>
          </div>

          {/* Theme Presets */}
          <div className="theme-presets-section">
            <label className="section-label">Theme Presets</label>
            <div className="theme-list">
              {availableThemes.map((theme) => (
                <button
                  key={theme.name}
                  className={`theme-item ${themeName === theme.name ? 'active' : ''}`}
                  onClick={() => setThemeName(theme.name)}
                >
                  <div className="theme-info">
                    <div className="theme-name">{themeLabels[theme.name]}</div>
                    <div className="theme-description">{themeDescriptions[theme.name]}</div>
                  </div>
                  <div className="theme-colors">
                    <div
                      className="color-dot primary"
                      style={{ backgroundColor: theme.colors.primary }}
                    ></div>
                    <div
                      className="color-dot secondary"
                      style={{ backgroundColor: theme.colors.secondary }}
                    ></div>
                    <div
                      className="color-dot accent"
                      style={{ backgroundColor: theme.colors.accent }}
                    ></div>
                  </div>
                  {themeName === theme.name && (
                    <div className="active-indicator">
                      <Check size={16} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </SideDrawer>

      <style jsx>{`
        .theme-switcher-container {
          position: relative;
          z-index: var(--z-theme-switcher);
        }

        .theme-toggle-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: var(--glass-button-bg);
          border: 1px solid var(--border);
          border-radius: 8px;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
          backdrop-filter: blur(var(--blur-amount));
          -webkit-backdrop-filter: blur(var(--blur-amount));
          font-size: 0.875rem;
          font-weight: 500;
        }

        .theme-toggle-btn:hover {
          background: var(--hover-bg);
          color: var(--text-primary);
          border-color: var(--accent);
        }

        .chevron {
          transition: transform 0.2s ease;
        }

        .chevron.rotate {
          transform: rotate(180deg);
        }

        .theme-drawer-content {
          padding: 24px;
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .theme-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .dark-mode-section {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          background: var(--surface);
          border-radius: 12px;
          border: 1px solid var(--border);
        }

        .dark-mode-label {
          font-weight: 500;
          color: var(--text-primary);
          font-size: 0.875rem;
        }

        .dark-mode-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 0.875rem;
          color: var(--text-secondary);
          transition: color 0.2s ease;
        }

        .dark-mode-toggle:hover {
          color: var(--text-primary);
        }

        .toggle-track {
          width: 40px;
          height: 20px;
          background: var(--hover-bg);
          border-radius: 10px;
          position: relative;
          transition: background-color 0.2s ease;
        }

        .dark-mode-toggle.active .toggle-track {
          background: var(--primary);
        }

        .toggle-thumb {
          width: 16px;
          height: 16px;
          background: white;
          border-radius: 50%;
          position: absolute;
          top: 2px;
          left: 2px;
          transition: transform 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .dark-mode-toggle.active .toggle-thumb {
          transform: translateX(20px);
          background: var(--background);
        }

        .theme-presets-section {
          flex: 1;
        }

        .section-label {
          font-weight: 500;
          color: var(--text-primary);
          font-size: 0.875rem;
          margin-bottom: 12px;
          display: block;
        }

        .theme-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .theme-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }

        .theme-item:hover {
          background: var(--hover-bg);
          border-color: var(--accent);
        }

        .theme-item.active {
          background: var(--surface);
          border-color: var(--primary);
          box-shadow: 0 0 0 1px var(--primary);
        }

        .theme-info {
          flex: 1;
        }

        .theme-name {
          font-weight: 500;
          color: var(--text-primary);
          font-size: 0.875rem;
          margin-bottom: 2px;
        }

        .theme-description {
          font-size: 0.75rem;
          color: var(--text-tertiary);
        }

        .theme-colors {
          display: flex;
          gap: 4px;
          margin-right: 8px;
        }

        .color-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 1px solid var(--border);
        }

        .active-indicator {
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </div>
  );
};

export default ThemeSwitcher;
