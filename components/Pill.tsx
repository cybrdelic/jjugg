'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PillProps {
  label: string;
  icon?: LucideIcon;
  color?: string;
  active?: boolean;
  onClick?: () => void;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  className?: string;
}

const Pill: React.FC<PillProps> = ({
  label,
  icon: Icon,
  color,
  active = false,
  onClick,
  size = 'medium',
  disabled = false,
  className = '',
}) => {
  // Determine style properties based on props
  const getPadding = (): string => {
    switch (size) {
      case 'small': return '4px 8px';
      case 'large': return '6px 14px';
      default: return '5px 10px';
    }
  };

  const getFontSize = (): string => {
    switch (size) {
      case 'small': return '12px';
      case 'large': return '14px';
      default: return '13px';
    }
  };

  const getIconSize = (): number => {
    switch (size) {
      case 'small': return 12;
      case 'large': return 16;
      default: return 14;
    }
  };

  // Default color is blue if not specified
  const pillColor = color || 'var(--accent-blue)';
  const iconSize = getIconSize();

  return (
    <button
      className={`pill ${active ? 'active' : ''} ${disabled ? 'disabled' : ''} ${className}`}
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      style={{
        '--pill-color': pillColor,
        '--pill-color-rgb': pillColor.includes('var(')
          ? `var(--${pillColor.match(/var\(--([^)]+)\)/)?.[1]}-rgb)`
          : pillColor
      } as React.CSSProperties}
    >
      {Icon && <Icon size={iconSize} className="pill-icon" />}
      <span className="pill-label">{label}</span>

      <style jsx>{`
        .pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: ${getPadding()};
          background-color: transparent;
          border: 1px solid var(--border-thin);
          border-radius: 16px;
          color: var(--text-secondary);
          font-size: ${getFontSize()};
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
          position: relative;
          overflow: hidden;
        }

        .pill::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: var(--pill-color);
          opacity: 0;
          transition: opacity 0.2s ease;
          z-index: -1;
        }

        .pill::after {
          content: '';
          position: absolute;
          top: -1px;
          left: -1px;
          right: -1px;
          bottom: -1px;
          border: 2px solid var(--pill-color);
          border-radius: 16px;
          opacity: 0;
          transform: scale(1.1);
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          z-index: -1;
        }

        .pill:hover:not(.disabled) {
          color: var(--text-primary);
          border-color: var(--pill-color);
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .pill:hover::before {
          opacity: 0.08;
        }

        .pill:active:not(.disabled) {
          transform: translateY(0);
        }

        .pill.active {
          background-color: var(--pill-color);
          color: white;
          border-color: var(--pill-color);
          box-shadow: 0 2px 8px rgba(var(--pill-color-rgb), 0.3);
        }

        .pill.active::after {
          opacity: 1;
          transform: scale(1);
        }

        .pill.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pill-icon {
          transition: transform 0.2s ease;
        }

        .pill:hover:not(.disabled) .pill-icon {
          transform: scale(1.1);
        }

        @media (max-width: 768px) {
          .pill {
            padding: ${size === 'small' ? '3px 6px' : size === 'large' ? '5px 12px' : '4px 8px'};
            font-size: ${size === 'small' ? '11px' : size === 'large' ? '13px' : '12px'};
          }
        }
      `}</style>
    </button>
  );
};

// PillGroup component for managing collections of pills
interface PillGroupProps {
  children: React.ReactNode;
  activePill?: string;
  onPillChange?: (pill: string) => void;
  className?: string;
}

export const PillGroup: React.FC<PillGroupProps> = ({
  children,
  activePill,
  onPillChange,
  className = '',
}) => {
  return (
    <div className={`pill-group ${className}`}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          const pillId = (child.props as any)['data-id'] || '';
          const isActive = pillId === activePill;
          return React.cloneElement(child, {
            active: isActive,
            onClick: () => onPillChange?.(pillId),
          } as any);
        }
        return child;
      })}

      <style jsx>{`
        .pill-group {
          display: inline-flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: center;
        }

        @media (max-width: 768px) {
          .pill-group {
            gap: 6px;
          }
        }
      `}</style>
    </div>
  );
};

export default Pill;
