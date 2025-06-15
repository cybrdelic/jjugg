'use client';

import React, { useState } from 'react';
import { LucideIcon } from 'lucide-react';

interface TabButtonProps {
  label: string;
  icon?: LucideIcon;
  active?: boolean;
  onClick?: () => void;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  className?: string;
  role?: string;
  'aria-selected'?: boolean;
  accentColor?: string;
}

const TabButton: React.FC<TabButtonProps> = ({
  label,
  icon: Icon,
  active = false,
  onClick,
  size = 'medium',
  disabled = false,
  className = '',
  role = 'tab',
  'aria-selected': ariaSelected,
  accentColor,
}) => {
  // State for tracking hover to enhance animation experience
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // Determine appropriate ARIA attributes
  const isSelected = ariaSelected !== undefined ? ariaSelected : active;

  // Calculate size based on prop
  const getSize = (size: string): number => {
    switch (size) {
      case 'small': return 14;
      case 'large': return 18;
      default: return 16;
    }
  };

  const iconSize = getSize(size);

  return (
    <div
      className={`tab-button-wrapper ${active ? 'active' : ''} ${isHovered ? 'hovered' : ''}`}
    >
      <button
        className={`tab-button ${active ? 'active' : ''} ${isHovered ? 'hovered' : ''} ${isPressed ? 'pressed' : ''} ${disabled ? 'disabled' : ''} ${size} ${className}`}
        onClick={!disabled ? onClick : undefined}
        disabled={disabled}
        role={role}
        aria-selected={isSelected}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setIsPressed(false);
        }}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
      >
        {Icon && <Icon size={iconSize} className="tab-icon" />}
        <span className="tab-label">{label}</span>
      </button>

      <style jsx>{`
        .tab-button-wrapper {
          position: relative;
          display: inline-block;
          padding-bottom: 2px;
        }

        .tab-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: transparent;
          border: none;
          padding: ${size === 'small' ? '6px 12px' : size === 'large' ? '10px 18px' : '8px 16px'};
          border-radius: var(--border-radius);
          color: var(--text-secondary);
          font-size: ${size === 'small' ? '13px' : size === 'large' ? '15px' : '14px'};
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s var(--easing-standard);
          white-space: nowrap;
          width: auto;
          min-width: 0;
        }

        .tab-button.active {
          color: ${accentColor || 'var(--accent-primary)'};
        }

        .tab-button.hovered:not(.active) {
          color: var(--text-primary);
          background: var(--hover-bg);
        }

        .tab-button.pressed {
          transform: scale(0.97);
        }

        .tab-button.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .tab-icon {
          transition: all 0.2s var(--easing-standard);
        }

        .tab-button.active .tab-icon {
          color: ${accentColor || 'var(--accent-primary)'};
        }

        .tab-label {
          transition: all 0.2s var(--easing-standard);
        }

        .tab-button-wrapper::after {
          content: '';
          position: absolute;
          left: 10%;
          right: 10%;
          bottom: 0;
          height: 2px;
          background-color: ${accentColor || 'var(--accent-primary)'};
          border-radius: 1px;
          transition: all 0.3s var(--easing-standard);
          transform: scaleX(0);
          transform-origin: center;
          opacity: 0;
          box-shadow: 0 0 8px rgba(var(--accent-primary-rgb), 0);
        }

        .tab-button-wrapper.active::after {
          transform: scaleX(1);
          opacity: 1;
          box-shadow: 0 0 8px ${accentColor || 'var(--accent-primary)'};
        }

        .tab-button-wrapper.hovered:not(.active)::after {
          opacity: 0.3;
          transform: scaleX(0.4);
        }

        .tab-button-wrapper.active.hovered::after {
          box-shadow: 0 0 12px ${accentColor || 'var(--accent-primary)'};
        }

        @media (max-width: 768px) {
          .tab-button {
            padding: ${size === 'small' ? '4px 10px' : size === 'large' ? '8px 14px' : '6px 12px'};
            font-size: ${size === 'small' ? '12px' : size === 'large' ? '14px' : '13px'};
          }
        }
      `}</style>
    </div>
  );
};

// TabGroup component to manage a collection of tabs
interface TabGroupProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  className?: string;
}

export const TabGroup: React.FC<TabGroupProps> = ({
  children,
  activeTab,
  onTabChange,
  className = '',
}) => {
  return (
    <div className={`tab-group ${className}`} role="tablist">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          const tabId = (child.props as any)['data-id'] || '';
          return React.cloneElement(child, {
            active: tabId === activeTab,
            onClick: () => onTabChange(tabId),
            'aria-selected': tabId === activeTab,
          } as any);
        }
        return child;
      })}

      <style jsx>{`
        .tab-group {
          display: flex;
          gap: 8px;
          padding: 4px;
          overflow-x: auto;
          scrollbar-width: none; /* Firefox */
          position: relative;
          width: auto;
          align-items: flex-start;
        }

        .tab-group::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Edge */
        }

        /* Add a subtle background line that the active indicators will appear against */
        .tab-group::after {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 1px;
          background-color: var(--border-thin);
          opacity: 0.5;
        }

        @media (max-width: 768px) {
          .tab-group {
            padding: 2px;
            gap: 4px;
          }
        }
      `}</style>
    </div>
  );
};

export default TabButton;
