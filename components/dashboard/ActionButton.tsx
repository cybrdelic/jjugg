'use client';

import React, { useState } from 'react';
import { LucideIcon } from 'lucide-react';

interface ActionButtonProps {
  label: string;
  icon: LucideIcon;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  className?: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  icon: Icon,
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  
  // Determine color based on variant
  const getColorVar = (variant: string): string => {
    switch (variant) {
      case 'primary': return 'var(--accent-primary)';
      case 'secondary': return 'var(--accent-secondary)';
      case 'danger': return 'var(--accent-red)';
      default: return 'var(--text-secondary)';
    }
  };
  
  // Calculate size based on prop
  const getSize = (size: string): string => {
    switch (size) {
      case 'small': return '30px';
      case 'large': return '46px';
      default: return '38px';
    }
  };
  
  const colorVar = getColorVar(variant);
  const buttonHeight = getSize(size);
  
  // Calculate RGB values for effects
  const rgbMatch = colorVar.match(/var\(--accent-(.*)-rgb\)/);
  const rgbVar = rgbMatch 
    ? colorVar.replace(')', '-rgb)') 
    : colorVar.replace('var(--accent-', 'var(--accent-').replace(')', '-rgb)');
  
  // Special styling for AI badge button
  const isAiBadge = className?.includes('ai-badge');
  
  return (
    <button 
      className={`action-button ${variant} ${size} ${isHovered ? 'hovered' : ''} ${isPressed ? 'pressed' : ''} ${disabled ? 'disabled' : ''} ${isAiBadge ? 'ai-variant' : ''} ${className}`}
      onClick={!disabled ? onClick : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      disabled={disabled}
      style={{
        '--button-color': isAiBadge ? 'var(--accent-purple)' : colorVar,
        '--button-color-rgb': isAiBadge ? 'var(--accent-purple-rgb)' : rgbVar,
        '--button-height': buttonHeight
      } as React.CSSProperties}
    >
      <div className="button-bg"></div>
      <div className="button-content">
        <Icon size={size === 'small' ? 14 : size === 'large' ? 18 : 16} className="button-icon" />
        <span className="button-label">{label}</span>
      </div>
      <div className="button-shine"></div>
      
      <style jsx>{`
        .action-button {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          height: var(--button-height);
          padding: 0 16px;
          border-radius: calc(var(--button-height) / 2);
          border: none;
          outline: none;
          cursor: pointer;
          overflow: hidden;
          transition: all 0.3s var(--easing-standard);
          transform: translateZ(0);
          will-change: transform;
        }
        
        .action-button.disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .button-bg {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          transition: all 0.3s var(--easing-standard);
          z-index: 0;
        }
        
        /* Primary variant */
        .action-button.primary .button-bg {
          background: linear-gradient(
            135deg,
            var(--button-color),
            color-mix(in srgb, var(--button-color), transparent 30%)
          );
          box-shadow: 0 2px 6px rgba(var(--button-color-rgb), 0.5);
        }
        
        .action-button.primary.hovered .button-bg {
          background: linear-gradient(
            135deg,
            var(--button-color),
            color-mix(in srgb, var(--button-color), transparent 15%)
          );
          box-shadow: 0 4px 12px rgba(var(--button-color-rgb), 0.6);
        }
        
        .action-button.primary.pressed .button-bg {
          background: linear-gradient(
            135deg,
            color-mix(in srgb, var(--button-color), black 5%),
            var(--button-color)
          );
          box-shadow: 0 1px 4px rgba(var(--button-color-rgb), 0.6);
        }
        
        /* Secondary variant */
        .action-button.secondary .button-bg {
          background: rgba(var(--button-color-rgb), 0.1);
          border: 1px solid rgba(var(--button-color-rgb), 0.2);
        }
        
        .action-button.secondary.hovered .button-bg {
          background: rgba(var(--button-color-rgb), 0.15);
          border: 1px solid rgba(var(--button-color-rgb), 0.3);
        }
        
        .action-button.secondary.pressed .button-bg {
          background: rgba(var(--button-color-rgb), 0.2);
        }
        
        /* Ghost variant */
        .action-button.ghost .button-bg {
          background: transparent;
        }
        
        .action-button.ghost.hovered .button-bg {
          background: rgba(var(--button-color-rgb), 0.1);
        }
        
        .action-button.ghost.pressed .button-bg {
          background: rgba(var(--button-color-rgb), 0.15);
        }
        
        /* Danger variant */
        .action-button.danger .button-bg {
          background: rgba(var(--accent-red-rgb), 0.1);
          border: 1px solid rgba(var(--accent-red-rgb), 0.2);
        }
        
        .action-button.danger.hovered .button-bg {
          background: var(--accent-red);
          border: 1px solid var(--accent-red);
        }
        
        /* Button content */
        .button-content {
          display: flex;
          align-items: center;
          gap: 8px;
          position: relative;
          z-index: 1;
          transition: all 0.3s var(--easing-standard);
        }
        
        .button-icon {
          color: var(--primary, --secondary) ? 'white' : var(--button-color);
          transition: all 0.3s var(--easing-standard);
        }
        
        /* AI variant */
        .action-button.ai-variant {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(14, 165, 233, 0.1));
          border: 1px solid rgba(139, 92, 246, 0.15);
          overflow: hidden;
        }
        
        .action-button.ai-variant .button-bg {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(14, 165, 233, 0.15));
          box-shadow: 0 2px 8px rgba(139, 92, 246, 0.15);
        }
        
        .action-button.ai-variant .button-icon {
          color: var(--accent-purple);
          animation: sparkle-pulse 2s infinite;
        }
        
        .action-button.ai-variant .button-label {
          color: var(--text-primary);
          font-weight: 600;
        }
        
        .action-button.ai-variant.hovered .button-bg {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(14, 165, 233, 0.2));
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
        }
        
        .action-button.ai-variant.pressed .button-bg {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(14, 165, 233, 0.25));
        }
        
        @keyframes sparkle-pulse {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); filter: brightness(1.2); }
        }
        
        .button-label {
          font-size: ${size === 'small' ? '12px' : size === 'large' ? '15px' : '14px'};
          font-weight: 500;
          color: ${variant === 'primary' ? 'white' : 'var(--button-color)'};
          transition: all 0.3s var(--easing-standard);
          white-space: nowrap;
        }
        
        .action-button.hovered .button-content {
          transform: translateY(-1px);
        }
        
        .action-button.pressed .button-content {
          transform: translateY(1px);
        }
        
        .action-button.danger.hovered .button-label,
        .action-button.danger.hovered .button-icon {
          color: white;
        }
        
        /* Button shine effect */
        .button-shine {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
          transform: skewX(-20deg);
          transition: all 0.5s var(--easing-standard);
          z-index: 0;
        }
        
        .action-button.hovered .button-shine {
          left: 100%;
        }
        
        /* Size adjustments */
        .action-button.small {
          padding: 0 12px;
        }
        
        .action-button.large {
          padding: 0 20px;
        }
        
        /* Scale animation */
        .action-button.hovered {
          transform: translateY(-2px) scale(1.02);
        }
        
        .action-button.pressed {
          transform: translateY(0) scale(0.98);
        }
        
        @media (max-width: 768px) {
          .action-button {
            padding: 0 12px;
          }
          
          .button-label {
            font-size: ${size === 'small' ? '12px' : size === 'large' ? '14px' : '13px'};
          }
        }
      `}</style>
    </button>
  );
};

export default ActionButton;