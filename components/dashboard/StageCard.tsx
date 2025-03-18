'use client';

import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';

type ApplicationStage = 'applied' | 'screening' | 'interview' | 'offer' | 'rejected';

interface StageCardProps {
  stageName: ApplicationStage;
  count: number;
  description: string;
  color: string;
  onClick?: () => void;
}

const StageCard: React.FC<StageCardProps> = ({
  stageName,
  count,
  description,
  color,
  onClick
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Format stage name with first letter capital
  const formattedStageName = stageName.charAt(0).toUpperCase() + stageName.slice(1);
  
  // Calculate RGB value for background
  const rgbMatch = color.match(/var\(--accent-(.*)-rgb\)/);
  const rgbVar = rgbMatch 
    ? color.replace(')', '-rgb)') 
    : color.replace('var(--accent-', 'var(--accent-').replace(')', '-rgb)');
  
  return (
    <div 
      className={`stage-card ${isHovered ? 'hovered' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      style={{
        '--stage-color': color,
        '--stage-color-rgb': rgbVar
      } as React.CSSProperties}
    >
      <div className="stage-header">
        <div className="stage-indicator"></div>
        <span className="stage-name">{formattedStageName}</span>
        <div className="stage-count-container">
          <span className="stage-count">{count}</span>
          {isHovered && onClick && <ChevronRight size={14} className="stage-chevron" />}
        </div>
      </div>
      
      <div className="stage-description">{description}</div>
      
      <div className="stage-animation-overlay"></div>
      
      <style jsx>{`
        .stage-card {
          background: var(--glass-card-bg);
          border-radius: var(--border-radius);
          border: 1px solid var(--border-thin);
          overflow: hidden;
          transition: all 0.3s var(--easing-standard);
          box-shadow: var(--shadow);
          position: relative;
          cursor: ${onClick ? 'pointer' : 'default'};
        }
        
        .stage-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
          background-color: var(--stage-color);
          opacity: 0.7;
          transition: all 0.3s var(--easing-standard);
          z-index: 1;
        }
        
        .stage-card.hovered {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg), 0 0 15px rgba(var(--stage-color-rgb), 0.2);
          border-color: rgba(var(--stage-color-rgb), 0.3);
        }
        
        .stage-card.hovered::before {
          width: 6px;
          opacity: 1;
        }
        
        .stage-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 16px;
          background-color: rgba(var(--stage-color-rgb), 0.1);
          position: relative;
          z-index: 2;
        }
        
        .stage-indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background-color: var(--stage-color);
          transition: all 0.3s var(--easing-standard);
          box-shadow: 0 0 0 rgba(var(--stage-color-rgb), 0.5);
        }
        
        .stage-card.hovered .stage-indicator {
          transform: scale(1.2);
          box-shadow: 0 0 8px rgba(var(--stage-color-rgb), 0.5);
        }
        
        .stage-name {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
          flex: 1;
          transition: all 0.3s var(--easing-standard);
        }
        
        .stage-card.hovered .stage-name {
          color: var(--stage-color);
          transform: translateX(3px);
        }
        
        .stage-count-container {
          display: flex;
          align-items: center;
          gap: 4px;
          transition: all 0.3s var(--easing-standard);
        }
        
        .stage-count {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
          background: var(--glass-bg);
          border-radius: var(--border-radius);
          padding: 2px 10px;
          min-width: 36px;
          text-align: center;
          transition: all 0.3s var(--easing-standard);
        }
        
        .stage-card.hovered .stage-count {
          background-color: var(--stage-color);
          color: white;
        }
        
        .stage-chevron {
          color: var(--stage-color);
          opacity: 0;
          transform: translateX(-5px);
          animation: slideInRight 0.3s var(--easing-standard) forwards;
        }
        
        .stage-description {
          padding: 16px;
          font-size: 14px;
          color: var(--text-tertiary);
          line-height: 1.5;
          position: relative;
          z-index: 2;
          transition: all 0.3s var(--easing-standard);
        }
        
        .stage-card.hovered .stage-description {
          color: var(--text-secondary);
        }
        
        .stage-animation-overlay {
          position: absolute;
          top: 0;
          right: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            135deg,
            transparent 30%,
            rgba(var(--stage-color-rgb), 0.03) 100%
          );
          opacity: 0;
          transition: opacity 0.5s var(--easing-standard);
          z-index: 0;
          pointer-events: none;
        }
        
        .stage-card.hovered .stage-animation-overlay {
          opacity: 1;
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(-5px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default StageCard;