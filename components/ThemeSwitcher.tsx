import React, { useState } from 'react';
import { useTheme, ThemeName } from '@/contexts/ThemeContext';
import { Sun, Moon, Palette, Check, ChevronDown, Play, Monitor, Heart, Code, Terminal, Eye, Gamepad2 } from 'lucide-react';
import SideDrawer from './SideDrawer';

const ThemeSwitcher: React.FC = () => {
  const { currentTheme, themeName, availableThemes, setThemeName, toggleColorMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const themeIcons: Record<ThemeName, React.ReactNode> = {
    professional: <Monitor size={16} />,
    modern: <Palette size={16} />,
    creative: <Palette size={16} />,
    developer: <Code size={16} />,
    netflix: <div style={{
      background: 'linear-gradient(45deg, #e50914, #ff1a1a)',
      borderRadius: '50%',
      width: '16px',
      height: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 0 8px rgba(229, 9, 20, 0.5)'
    }}><Play size={10} color="white" /></div>,
    hulu: <div style={{
      background: 'linear-gradient(45deg, #1ce783, #00ff7f)',
      borderRadius: '50%',
      width: '16px',
      height: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 0 8px rgba(28, 231, 131, 0.5)'
    }}><Play size={10} color="white" /></div>,
    barbie: <div style={{
      background: 'linear-gradient(45deg, #e91e63, #ff69b4)',
      borderRadius: '50%',
      width: '16px',
      height: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 0 8px rgba(233, 30, 99, 0.5)'
    }}><Heart size={10} color="white" /></div>,
    vscode: <div style={{
      background: 'linear-gradient(45deg, #007acc, #4fc3f7)',
      borderRadius: '50%',
      width: '16px',
      height: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 0 8px rgba(59, 130, 246, 0.5)'
    }}><Code size={10} color="white" /></div>,
    'terminal-hacker': <div style={{
      background: 'linear-gradient(45deg, #00ff41, #00cc33)',
      borderRadius: '50%',
      width: '16px',
      height: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 0 8px rgba(0, 255, 65, 0.5)'
    }}><Terminal size={10} color="black" /></div>,
    'mr-robot': <div style={{
      background: 'linear-gradient(45deg, #ff0040, #cc0033)',
      borderRadius: '50%',
      width: '16px',
      height: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 0 8px rgba(255, 0, 64, 0.5)'
    }}><Eye size={10} color="white" /></div>,
    fortnite: <div style={{
      background: 'linear-gradient(45deg, #8b5cf6, #f97316)',
      borderRadius: '50%',
      width: '16px',
      height: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 0 8px rgba(139, 92, 246, 0.5)'
    }}><Gamepad2 size={10} color="white" /></div>,
    custom: <Palette size={16} />,
  };

  const themeLabels: Record<ThemeName, string> = {
    professional: 'Professional',
    modern: 'Modern',
    creative: 'Creative',
    developer: 'Developer',
    netflix: 'Netflix',
    hulu: 'Hulu',
    barbie: 'Barbie',
    vscode: 'VS Code',
    'terminal-hacker': 'Terminal Hacker',
    'mr-robot': 'Mr Robot',
    fortnite: 'Fortnite',
    custom: 'Custom',
  };

  const themeDescriptions: Record<ThemeName, string> = {
    professional: 'Clean and business-focused',
    modern: 'Tech startup aesthetic',
    creative: 'Warm and expressive',
    developer: 'Terminal-inspired',
    netflix: 'Cinematic red and black',
    hulu: 'Fresh green streaming',
    barbie: 'Hot pink glamour',
    vscode: 'Developer dark blue',
    'terminal-hacker': 'Matrix-style cyberpunk',
    'mr-robot': 'Dark cyberpunk thriller',
    fortnite: 'Vibrant gaming theme',
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
                  <div className="theme-icon">{themeIcons[theme.name]}</div>
                  <div className="theme-info">
                    <div className="theme-name">{themeLabels[theme.name]}</div>
                    <div className="theme-description">{themeDescriptions[theme.name]}</div>
                  </div>
                  {['netflix', 'hulu', 'barbie', 'vscode', 'terminal-hacker', 'mr-robot', 'fortnite'].includes(theme.name) && (
                    <div className="premium-badge">NEW</div>
                  )}
                  {themeName === theme.name && (
                    <div className="active-indicator">
                      <Check size={14} />
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
          box-shadow: var(--shadow-sm, 0 1px 2px rgba(0, 0, 0, 0.1));
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
          gap: 4px;
        }

        .theme-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 12px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          min-height: 40px;
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

        .theme-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          flex-shrink: 0;
        }

        .theme-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .theme-name {
          font-weight: 500;
          color: var(--text-primary);
          font-size: 0.875rem;
          line-height: 1.2;
        }

        .theme-description {
          color: var(--text-tertiary);
          font-size: 0.75rem;
          line-height: 1.2;
          margin-top: 2px;
        }

        .premium-badge {
          background: linear-gradient(45deg, #ff6b6b, #feca57);
          color: white;
          font-size: 9px;
          font-weight: 700;
          padding: 2px 5px;
          border-radius: 4px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          animation: shimmer 2s infinite;
          box-shadow: 0 1px 3px rgba(255, 107, 107, 0.3);
          flex-shrink: 0;
        }

        .active-indicator {
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        @keyframes shimmer {
          0% { background: linear-gradient(45deg, #ff6b6b, #feca57); }
          50% { background: linear-gradient(45deg, #feca57, #ff6b6b); }
          100% { background: linear-gradient(45deg, #ff6b6b, #feca57); }
        }
      `}</style>
    </div>
  );
};

export default ThemeSwitcher;
