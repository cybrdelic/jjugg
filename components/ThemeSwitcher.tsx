// components/ThemeSwitcher.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useTheme, ThemeName, ThemeSettings, ColorTheme, AccentColor, FontFamily, BorderRadius, Animation, GlassEffect, BackgroundType, BackgroundPattern, BackgroundAnimation } from '@/contexts/ThemeContext';
import { Sun, Moon, Palette, Check, ChevronDown, RefreshCw, Layers, Grid, CloudRain, Image } from 'lucide-react';
import SideDrawer from './SideDrawer';
import BackgroundCustomizer from './BackgroundCustomizer';
import EnhancedDropdown from './EnhancedDropdown';

const ThemeSwitcher: React.FC = () => {
  const { currentTheme, themeName, availableThemes, setThemeName, updateThemeSetting, toggleColorTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'presets' | 'customize' | 'background'>('presets');

  // Values for color swatches
  const accentColors: AccentColor[] = ['blue', 'purple', 'pink', 'orange', 'green', 'yellow', 'red'];
  const fontFamilies: FontFamily[] = ['inter', 'lexend', 'roboto', 'poppins', 'montserrat'];
  const borderRadii: BorderRadius[] = ['none', 'sm', 'md', 'lg', 'xl', 'full'];
  const animations: Animation[] = ['minimal', 'subtle', 'moderate', 'playful', 'intense'];
  const glassEffects: GlassEffect[] = ['none', 'subtle', 'medium', 'heavy'];

  const colorDisplayNames: Record<ColorTheme, string> = {
    light: 'Light',
    dark: 'Dark',
  };

  const accentColorLabels: Record<AccentColor, string> = {
    blue: 'Blue',
    purple: 'Purple',
    pink: 'Pink',
    orange: 'Orange',
    green: 'Green',
    yellow: 'Yellow',
    red: 'Red',
  };

  const fontFamilyLabels: Record<FontFamily, string> = {
    inter: 'Inter',
    lexend: 'Lexend',
    roboto: 'Roboto',
    poppins: 'Poppins',
    montserrat: 'Montserrat',
  };

  const borderRadiusLabels: Record<BorderRadius, string> = {
    none: 'None',
    sm: 'Small',
    md: 'Medium',
    lg: 'Large',
    xl: 'Extra Large',
    full: 'Full',
  };

  const animationLabels: Record<Animation, string> = {
    minimal: 'Minimal',
    subtle: 'Subtle',
    moderate: 'Moderate',
    playful: 'Playful',
    intense: 'Intense',
  };

  const glassEffectLabels: Record<GlassEffect, string> = {
    none: 'None',
    subtle: 'Subtle',
    medium: 'Medium',
    heavy: 'Heavy',
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
        width={activeTab === 'background' ? '480px' : '400px'}
      >
        <div className="theme-drawer-content">
          <h2 className="theme-title">Theme Settings</h2>

          <div className="theme-tabs">
            <button
              className={`tab-btn ${activeTab === 'presets' ? 'active' : ''}`}
              onClick={() => setActiveTab('presets')}
            >
              Presets
            </button>
            <button
              className={`tab-btn ${activeTab === 'customize' ? 'active' : ''}`}
              onClick={() => setActiveTab('customize')}
            >
              Style
            </button>
            <button
              className={`tab-btn ${activeTab === 'background' ? 'active' : ''}`}
              onClick={() => setActiveTab('background')}
            >
              Background
            </button>
          </div>

          {activeTab === 'presets' && (
            <div className="theme-presets">
              {availableThemes.filter(theme => theme.name !== 'custom').map((theme) => (
                <button
                  key={theme.name}
                  className={`theme-preset-btn ${themeName === theme.name ? 'active' : ''}`}
                  onClick={() => {
                    setThemeName(theme.name);
                  }}
                >
                  <div className={`theme-preview accent-${theme.settings.accentColor} ${theme.settings.colorTheme} radius-${theme.settings.borderRadius}`}>
                    <div className="preview-sidebar"></div>
                    <div className="preview-content">
                      <div className="preview-card"></div>
                      <div className="preview-card"></div>
                    </div>
                    <div className="preview-accent" style={{ background: `var(--accent-${theme.settings.accentColor})` }}></div>

                    {/* Background preview indicator */}
                    <div className={`preview-bg-type preview-bg-${theme.settings.background.type}`}>
                      {theme.settings.background.pattern !== 'none' && (
                        <div className={`preview-pattern preview-pattern-${theme.settings.background.pattern}`}></div>
                      )}
                    </div>
                  </div>
                  <div className="theme-name">
                    {theme.label}
                    {themeName === theme.name && <Check size={14} className="check-icon" />}
                  </div>
                </button>
              ))}
            </div>
          )}

          {activeTab === 'customize' && (
            <div className="theme-customize">
              <div className="theme-option">
                <label>Mode</label>
                <div className="toggle-group">
                  <button
                    className={`toggle-btn ${currentTheme.colorTheme === 'light' ? 'active' : ''}`}
                    onClick={() => updateThemeSetting('colorTheme', 'light')}
                  >
                    <Sun size={14} />
                    <span>Light</span>
                  </button>
                  <button
                    className={`toggle-btn ${currentTheme.colorTheme === 'dark' ? 'active' : ''}`}
                    onClick={() => updateThemeSetting('colorTheme', 'dark')}
                  >
                    <Moon size={14} />
                    <span>Dark</span>
                  </button>
                </div>
              </div>

              <div className="theme-option">
                <label>Accent Color</label>
                <div className="color-swatches">
                  {accentColors.map(color => (
                    <button
                      key={color}
                      className={`color-swatch ${color} ${currentTheme.accentColor === color ? 'active' : ''}`}
                      style={{ backgroundColor: `var(--accent-${color})` }}
                      onClick={() => updateThemeSetting('accentColor', color)}
                      title={accentColorLabels[color]}
                      aria-label={`Set accent color to ${accentColorLabels[color]}`}
                    >
                      {currentTheme.accentColor === color && <Check size={12} />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="theme-option">
                <label>Font Family</label>
                <EnhancedDropdown
                  options={fontFamilies.map(font => ({
                    value: font,
                    label: fontFamilyLabels[font]
                  }))}
                  value={currentTheme.fontFamily}
                  onChange={(value) => updateThemeSetting('fontFamily', value as FontFamily)}
                  placeholder="Select font family"
                />
              </div>

              <div className="theme-option">
                <label>Border Radius</label>
                <EnhancedDropdown
                  options={borderRadii.map(radius => ({
                    value: radius,
                    label: borderRadiusLabels[radius]
                  }))}
                  value={currentTheme.borderRadius}
                  onChange={(value) => updateThemeSetting('borderRadius', value as BorderRadius)}
                  placeholder="Select border radius"
                />
              </div>

              <div className="theme-option">
                <label>Animation Level</label>
                <EnhancedDropdown
                  options={animations.map(anim => ({
                    value: anim,
                    label: animationLabels[anim]
                  }))}
                  value={currentTheme.animation}
                  onChange={(value) => updateThemeSetting('animation', value as Animation)}
                  placeholder="Select animation level"
                />
              </div>

              <div className="theme-option">
                <label>Glass Effect</label>
                <EnhancedDropdown
                  options={glassEffects.map(effect => ({
                    value: effect,
                    label: glassEffectLabels[effect]
                  }))}
                  value={currentTheme.glassEffect}
                  onChange={(value) => updateThemeSetting('glassEffect', value as GlassEffect)}
                  placeholder="Select glass effect"
                />
              </div>

              <button className="reset-btn" onClick={() => setThemeName('default')}>
                <RefreshCw size={14} />
                <span>Reset to Default</span>
              </button>
            </div>
          )}

          {activeTab === 'background' && (
            <div className="background-tab">
              <BackgroundCustomizer />
            </div>
          )}
        </div>
      </SideDrawer>

      <style jsx>{`
        .theme-switcher-container {
          position: relative;
        }

        .theme-toggle-btn {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 8px;
          background: var(--glass-bg);
          border: 1px solid var(--border-thin);
          border-radius: var(--border-radius-md);
          padding: 8px 12px;
          color: var(--text-primary);
          font-size: 0.9rem;
          transition: all 0.15s ease;
          backdrop-filter: blur(var(--blur-amount));
          -webkit-backdrop-filter: blur(var(--blur-amount));
        }

        .theme-toggle-btn:hover {
          background: var(--hover-bg);
          transform: translateY(-1px);
        }

        .chevron {
          transition: transform 0.2s ease;
        }

        .chevron.rotate {
          transform: rotate(180deg);
        }

        .background-tab {
          padding: 0;
          flex: 1;
          overflow-y: auto;
        }
      `}</style>

      {/* Global styles for the dropdown content */}
      <style jsx global>{`
        .theme-drawer-content {
          display: flex;
          flex-direction: column;
          height: 100%;
          padding-top: 30px;
        }

        .theme-title {
          font-size: 20px;
          font-weight: 600;
          margin: 0 0 20px 0;
          color: var(--text-primary);
        }

        .theme-tabs {
          display: flex;
          border-bottom: 1px solid var(--border-thin);
          margin-bottom: 20px;
        }

        .tab-btn {
          flex: 1;
          padding: 12px;
          border: none;
          background: none;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .tab-btn:hover {
          color: var(--text-primary);
        }

        .tab-btn.active {
          color: var(--text-accent);
          position: relative;
        }

        .tab-btn.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 25%;
          width: 50%;
          height: 2px;
          background-color: var(--text-accent);
          border-radius: 2px;
        }

        .theme-presets {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          padding: 0 0 16px 0;
          overflow-y: auto;
          flex: 1;
        }

        .theme-preset-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: none;
          border: none;
          cursor: pointer;
          border-radius: var(--border-radius-md);
          padding: 6px;
          transition: all 0.2s ease;
        }

        .theme-preset-btn:hover {
          background: var(--hover-bg);
        }

        .theme-preset-btn.active {
          background: var(--active-bg);
        }

        .theme-preview {
          width: 70px;
          height: 70px;
          border-radius: var(--border-radius);
          border: 2px solid transparent;
          margin-bottom: 8px;
          overflow: hidden;
          display: flex;
          position: relative;
          transition: all var(--transition-normal) var(--easing-standard);
          box-shadow: var(--shadow-sharp);
        }

        .active .theme-preview {
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 1px var(--accent-primary), var(--shadow);
          transform: translateY(-3px) scale(1.05);
        }

        /* Preview background type indicator */
        .preview-bg-type {
          position: absolute;
          bottom: 8px;
          right: 8px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .preview-bg-gradient {
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
        }

        .preview-bg-pattern {
          position: relative;
        }

        .preview-pattern {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0.3;
          background-size: 4px 4px;
        }

        .preview-pattern-dots {
          background-image: radial-gradient(circle, currentColor 1px, transparent 1px);
        }

        .preview-pattern-grid {
          background-image:
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px);
        }

        .preview-pattern-waves {
          background-image: repeating-linear-gradient(45deg, currentColor 0, currentColor 1px, transparent 0, transparent 4px);
        }

        /* Custom backgrounds for each theme to make them more distinct */
        .theme-preview.light {
          background: linear-gradient(135deg, #f8fafc, #f1f5f9);
        }

        .theme-preview.dark {
          background: linear-gradient(135deg, #0f172a, #1e293b);
        }

        /* Cyberpunk theme preview */
        .active .theme-preview.dark.accent-pink.radius-lg {
          background: linear-gradient(135deg, #0f172a, #1e1b31);
          box-shadow: 0 0 0 1px var(--accent-pink), 0 0 15px rgba(236, 72, 153, 0.5);
        }

        /* Premium theme preview */
        .active .theme-preview.dark.accent-purple.radius-md {
          background: linear-gradient(135deg, #1a1625, #2d2541);
          box-shadow: 0 0 0 1px rgba(255, 215, 0, 0.3), 0 0 15px rgba(139, 92, 246, 0.5);
        }

        /* Enterprise theme preview */
        .active .theme-preview.light.accent-green.radius-sm {
          background: linear-gradient(135deg, #f8fafc, #ecfdf5);
          box-shadow: 0 0 0 1px rgba(16, 185, 129, 0.3), 0 0 10px rgba(16, 185, 129, 0.2);
        }

        /* Warm theme preview */
        .active .theme-preview.dark.accent-orange.radius-lg {
          background: linear-gradient(135deg, #1c1917, #292524);
          box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.3), 0 0 12px rgba(249, 115, 22, 0.4);
        }

        /* Deep Sea theme preview */
        .active .theme-preview.dark.accent-blue.radius-xl {
          background: linear-gradient(135deg, #0c4a6e, #164e63);
          box-shadow: 0 0 0 1px rgba(14, 165, 233, 0.3), 0 0 12px rgba(14, 165, 233, 0.4);
        }

        /* Monochrome theme preview */
        .active .theme-preview.light.accent-blue.radius-md.glass-none {
          background: linear-gradient(135deg, #ffffff, #f5f5f5);
          box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1), 0 0 8px rgba(0, 0, 0, 0.1);
        }

        .theme-preset-btn:hover .theme-preview {
          transform: translateY(-3px) scale(1.02);
          box-shadow: var(--shadow);
        }

        .preview-accent {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 12px;
          height: 12px;
          border-radius: var(--border-radius-full);
          box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);
        }

        .dark .preview-accent {
          box-shadow: 0 0 8px rgba(0, 0, 0, 0.4), 0 0 12px currentColor;
        }

        /* Border radius variations in the preview */
        .theme-preview.radius-none .preview-card {
          border-radius: 0;
        }

        .theme-preview.radius-sm .preview-card {
          border-radius: 2px;
        }

        .theme-preview.radius-md .preview-card {
          border-radius: 3px;
        }

        .theme-preview.radius-lg .preview-card {
          border-radius: 4px;
        }

        .theme-preview.radius-xl .preview-card {
          border-radius: 6px;
        }

        .theme-preview.radius-full .preview-card {
          border-radius: 8px;
        }

        .preview-sidebar {
          width: 25%;
          height: 100%;
          background-color: rgba(255, 255, 255, 0.1);
          border-right: 1px solid var(--border-thin);
        }

        .preview-content {
          width: 75%;
          height: 100%;
          padding: 6px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .preview-card {
          width: 100%;
          height: 40%;
          border-radius: 2px;
          background-color: rgba(255, 255, 255, 0.15);
        }

        .theme-name {
          font-size: 0.8rem;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .check-icon {
          color: var(--text-accent);
        }

        .theme-customize {
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 16px;
          flex: 1;
          overflow-y: auto;
        }

        .theme-option {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .theme-option label {
          font-size: 0.8rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .toggle-group {
          display: flex;
          border-radius: var(--border-radius-md);
          overflow: hidden;
          border: 1px solid var(--border-thin);
        }

        .toggle-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px;
          background: var(--glass-bg);
          border: none;
          cursor: pointer;
          color: var(--text-secondary);
          transition: all 0.2s ease;
        }

        .toggle-btn:hover {
          background: var(--hover-bg);
        }

        .toggle-btn.active {
          background: var(--active-bg);
          color: var(--text-accent);
        }

        .color-swatches {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .color-swatch {
          width: 32px;
          height: 32px;
          border-radius: var(--border-radius-md);
          border: 2px solid transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--transition-normal) var(--easing-standard);
          color: white;
          box-shadow: var(--shadow-sharp);
          position: relative;
          overflow: hidden;
        }

        .color-swatch:hover {
          transform: scale(1.1);
          box-shadow: var(--shadow);
        }

        .color-swatch.active {
          border-color: var(--text-primary);
          transform: scale(1.15);
          box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.5), var(--shadow);
        }

        .color-swatch::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), transparent 50%);
          border-radius: calc(var(--border-radius-md) - 2px);
        }

        .dark .color-swatch.active {
          box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.3), 0 0 5px 2px var(--accent-primary);
        }

        .select-dropdown {
          padding: 8px 12px;
          border-radius: var(--border-radius-md);
          background: var(--glass-bg);
          color: var(--text-primary);
          border: 1px solid var(--border-thin);
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 8px center;
          background-size: 16px;
          padding-right: 30px;
          box-shadow: var(--shadow-sharp);
          transition: all var(--transition-normal) var(--easing-standard);
          backdrop-filter: blur(var(--blur-amount));
          -webkit-backdrop-filter: blur(var(--blur-amount));
          font-weight: 500;
          width: 100%;
        }

        .select-dropdown:hover {
          border-color: var(--text-accent);
          box-shadow: var(--shadow);
          transform: translateY(-1px);
        }

        .select-dropdown:focus {
          outline: none;
          border-color: var(--text-accent);
          box-shadow: 0 0 0 2px var(--ring-color), var(--shadow);
          transform: translateY(-1px);
        }

        .dark .select-dropdown:focus {
          box-shadow: 0 0 0 2px var(--ring-color), var(--accent-glow);
        }

        .reset-btn {
          margin-top: 16px;
          padding: 10px 16px;
          background: var(--glass-bg);
          color: var(--text-primary);
          border: 1px solid var(--border-thin);
          border-radius: var(--border-radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          transition: all var(--transition-normal) var(--easing-standard);
          font-weight: 500;
          backdrop-filter: blur(var(--blur-amount));
          -webkit-backdrop-filter: blur(var(--blur-amount));
          box-shadow: var(--shadow-sharp);
          position: relative;
          overflow: hidden;
        }

        .reset-btn::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), transparent 50%);
          opacity: 0;
          transition: opacity var(--transition-normal) var(--easing-standard);
        }

        .reset-btn:hover {
          background: var(--hover-bg);
          transform: translateY(-2px);
          box-shadow: var(--shadow);
          border-color: var(--border-divider);
        }

        .reset-btn:hover::after {
          opacity: 1;
        }

        .dark .reset-btn:hover {
          box-shadow: var(--shadow), var(--accent-glow);
        }

        /* Define accent colors */
        .accent-blue { --accent-color: var(--accent-primary); }
        .accent-purple { --accent-color: var(--accent-secondary); }
        .accent-pink { --accent-color: var(--accent-vibrant); }
        .accent-orange { --accent-color: var(--accent-warning); }
        .accent-green { --accent-color: var(--accent-success); }
        .accent-yellow { --accent-color: var(--accent-warning); }
        .accent-red { --accent-color: var(--accent-danger); }

        /* Responsive styles for smaller screens */
        @media (max-width: 480px) {
          .theme-presets {
            grid-template-columns: repeat(2, 1fr);
          }

          .theme-tabs .tab-btn {
            padding: 10px 6px;
            font-size: 0.8rem;
          }

          .theme-customize {
            padding: 0 0 60px 0; /* Add padding at bottom for smaller screens */
          }

          .theme-drawer-content {
            padding-bottom: 60px;
          }
        }
      `}</style>
    </div>
  );
};

export default ThemeSwitcher;
