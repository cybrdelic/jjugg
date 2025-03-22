// components/GlassCard.tsx
'use client';

import React from 'react';

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    ariaLabel?: string;
    completed?: boolean;
    approved?: boolean;
}

const GlassCard: React.FC<GlassCardProps> = ({
    children,
    className = '',
    onClick,
    ariaLabel,
    completed,
    approved,
}) => {
    return (
        <div
            className={`glass-card ${completed ? 'completed' : ''} ${approved ? 'approved' : 'pending'} ${className}`}
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            aria-label={ariaLabel}
            tabIndex={onClick ? 0 : undefined}
        >
            {children}
            <style jsx>{`
        .glass-card {
          position: relative;
          background: var(--glass-card-bg);
          backdrop-filter: blur(var(--blur-amount)); /* Blur behind card */
          border: 1px solid var(--border-thin);
          border-radius: var(--border-radius);
          padding: 16px;
          transition: transform 0.2s ease, background 0.2s ease;
          box-shadow: var(--shadow-sharp);
        }

        .glass-card:hover {
          transform: translateY(-2px);
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02));
        }

        .glass-card.completed {
          opacity: 0.7;
        }

        .glass-card.approved {
          border-left: 4px solid var(--accent-success);
        }

        .glass-card.pending {
          border-left: 4px solid var(--accent-cyan);
        }

        @media (max-width: 768px) {
          .glass-card {
            padding: 12px;
          }
        }
      `}</style>
        </div>
    );
};

export default GlassCard;
