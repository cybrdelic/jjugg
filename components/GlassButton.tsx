// components/GlassButton.tsx
'use client';

import React from 'react';

interface GlassButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: 'default' | 'primary';
    disabled?: boolean;
    ariaLabel?: string;
    className?: string;
}

const GlassButton: React.FC<GlassButtonProps> = ({
    children,
    onClick,
    variant = 'default',
    disabled = false,
    ariaLabel,
    className = '',
}) => {
    return (
        <button
            className={`glass-button ${variant} ${className}`}
            onClick={onClick}
            disabled={disabled}
            aria-label={ariaLabel}
        >
            {children}
            <style jsx>{`
        .glass-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: var(--border-radius);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          background: var(--glass-bg);
          backdrop-filter: blur(var(--blur-amount));
          border: 1px solid var(--border-thin);
          color: var(--text-primary);
        }

        .glass-button:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .glass-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .glass-button.primary {
          background: var(--accent-primary);
          color: white;
          border: none;
          box-shadow: 0 2px 6px rgba(var(--accent-primary-rgb), 0.25);
        }

        .glass-button.primary:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(var(--accent-primary-rgb), 0.3);
        }

        @media (max-width: 768px) {
          .glass-button {
            padding: 6px 12px;
            font-size: 12px;
          }
        }
      `}</style>
        </button>
    );
};

export default GlassButton;
