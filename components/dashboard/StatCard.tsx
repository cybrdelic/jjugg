'use client';

import React, { useState } from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  value: number | string;
  label: string;
  icon: LucideIcon;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  value,
  label,
  icon: Icon,
  color,
  trend,
  onClick
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // Calculate RGB values for background
  const rgbMatch = color.match(/var\(--accent-(.*)-rgb\)/);
  const rgbVar = rgbMatch ? rgbMatch[0] : 'var(--accent-blue-rgb)';

  return (
    <div
      className={`stat-card ${isHovered ? 'hovered' : ''} ${isPressed ? 'pressed' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onClick={onClick}
      style={{
        '--accent-color': color,
        '--accent-rgb': rgbVar
      } as React.CSSProperties}
    >
      <div className="stat-icon-wrapper">
        <div className="stat-icon-bg"></div>
        <Icon size={24} className="stat-icon" />
        <div className="stat-icon-glow"></div>
      </div>

      <div className="stat-content">
        <div className="stat-value-container">
          <span className="stat-value">{value}</span>
          {trend && (
            <span className={`stat-trend ${trend.isPositive ? 'positive' : 'negative'}`}>
              {trend.isPositive ? '↑' : '↓'} {trend.value}%
            </span>
          )}
        </div>
        <div className="stat-label">{label}</div>
      </div>

      <style jsx>{`
        .stat-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          transition: all 0.3s var(--easing-standard);
          cursor: ${onClick ? 'pointer' : 'default'};
          position: relative;
          overflow: hidden;
          z-index: 1;
        }

        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            135deg,
            rgba(var(--accent-rgb), 0.03) 0%,
            rgba(var(--accent-rgb), 0) 60%
          );
          z-index: -1;
          opacity: 0;
          transition: opacity 0.5s var(--easing-standard);
        }

        .stat-card.hovered {
          transform: translateY(-3px);
        }

        .stat-card.hovered::before {
          opacity: 1;
        }

        .stat-card.pressed {
          transform: translateY(0px);
        }

        .stat-icon-wrapper {
          position: relative;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--border-radius);
          overflow: hidden;
        }

        .stat-icon-bg {
          position: absolute;
          width: 100%;
          height: 100%;
          background-color: rgba(var(--accent-rgb), 0.1);
          transition: all 0.3s var(--easing-standard);
          transform-origin: center;
          border-radius: var(--border-radius);
        }

        .stat-card.hovered .stat-icon-bg {
          transform: scale(1.1);
          background-color: rgba(var(--accent-rgb), 0.15);
        }

        .stat-icon {
          position: relative;
          z-index: 1;
          color: var(--accent-color);
          transition: all 0.3s var(--easing-standard);
        }

        .stat-card.hovered .stat-icon {
          transform: scale(1.1);
        }

        .stat-icon-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 0;
          height: 0;
          background: radial-gradient(
            circle,
            rgba(var(--accent-rgb), 0.6) 0%,
            rgba(var(--accent-rgb), 0) 70%
          );
          border-radius: 50%;
          opacity: 0;
          transition: all 0.5s var(--easing-standard);
        }

        .stat-card.hovered .stat-icon-glow {
          width: 64px;
          height: 64px;
          opacity: 0.4;
        }

        .stat-content {
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .stat-value-container {
          display: flex;
          align-items: baseline;
          gap: 8px;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: var(--text-primary);
          transition: color 0.3s var(--easing-standard);
        }

        .stat-card.hovered .stat-value {
          color: var(--accent-color);
        }

        .stat-trend {
          font-size: 14px;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 10px;
        }

        .stat-trend.positive {
          color: var(--accent-success);
          background: rgba(var(--accent-success-rgb), 0.1);
        }

        .stat-trend.negative {
          color: var(--accent-red);
          background: rgba(var(--accent-red-rgb), 0.1);
        }

        .stat-label {
          font-size: 14px;
          color: var(--text-tertiary);
          transition: color 0.3s var(--easing-standard);
        }

        .stat-card.hovered .stat-label {
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
};

export default StatCard;
