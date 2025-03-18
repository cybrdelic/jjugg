'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, Plus } from 'lucide-react';

interface GoalCardProps {
  id: string;
  goal: string;
  current: number;
  target: number;
  onClick?: () => void;
}

const GoalCard: React.FC<GoalCardProps> = ({
  id,
  goal,
  current,
  target,
  onClick
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [animatedProgress, setAnimatedProgress] = useState(0);
  
  useEffect(() => {
    // Calculate progress percentage
    const calculatedProgress = Math.min(Math.round((current / target) * 100), 100);
    setProgress(calculatedProgress);
    setIsCompleted(calculatedProgress >= 100);
    
    // Animate progress on mount
    const timer = setTimeout(() => {
      setAnimatedProgress(calculatedProgress);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [current, target]);
  
  // Get goal progress color
  const getGoalProgressColor = (progress: number): string => {
    if (progress >= 100) return 'var(--accent-success)';
    if (progress >= 60) return 'var(--accent-blue)';
    if (progress >= 30) return 'var(--accent-yellow)';
    return 'var(--accent-red)';
  };
  
  const progressColor = getGoalProgressColor(progress);
  
  // Calculate RGB value for background
  const rgbMatch = progressColor.match(/var\(--accent-(.*)-rgb\)/);
  const rgbVar = rgbMatch 
    ? progressColor.replace(')', '-rgb)') 
    : progressColor.replace('var(--accent-', 'var(--accent-').replace(')', '-rgb)');
  
  return (
    <div 
      className={`goal-card ${isHovered ? 'hovered' : ''} ${isCompleted ? 'completed' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      style={{
        '--progress-color': progressColor,
        '--progress-color-rgb': rgbVar,
        '--progress-width': `${animatedProgress}%`,
      } as React.CSSProperties}
    >
      <div className="goal-header">
        <h4 className="goal-title">{goal}</h4>
        <div className="goal-progress-text">
          <span className="current-value">{current}</span>
          <span className="separator">/</span>
          <span className="target-value">{target}</span>
        </div>
      </div>
      
      <div className="goal-progress-container">
        <div className="goal-progress-bg"></div>
        <div className="goal-progress-bar">
          {isCompleted && (
            <CheckCircle size={14} className="complete-icon" />
          )}
        </div>
        <div className="progress-milestones">
          <div className="milestone" style={{ left: '25%' }}></div>
          <div className="milestone" style={{ left: '50%' }}></div>
          <div className="milestone" style={{ left: '75%' }}></div>
        </div>
      </div>
      
      {isHovered && !isCompleted && (
        <button className="increment-button">
          <Plus size={14} />
        </button>
      )}
      
      <style jsx>{`
        .goal-card {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 16px;
          background: var(--glass-bg);
          border-radius: var(--border-radius);
          border: 1px solid var(--border-thin);
          transition: all 0.3s var(--easing-standard);
          position: relative;
          cursor: ${onClick ? 'pointer' : 'default'};
        }
        
        .goal-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            135deg, 
            rgba(var(--progress-color-rgb), 0.03) 0%, 
            rgba(var(--progress-color-rgb), 0) 70%
          );
          z-index: -1;
          opacity: 0;
          transition: opacity 0.5s var(--easing-standard);
          border-radius: var(--border-radius);
        }
        
        .goal-card.hovered {
          transform: translateY(-3px);
          box-shadow: var(--shadow);
          border-color: rgba(var(--progress-color-rgb), 0.3);
        }
        
        .goal-card.hovered::before {
          opacity: 1;
        }
        
        .goal-card.completed {
          border-color: rgba(var(--accent-success-rgb), 0.3);
        }
        
        .goal-card.completed.hovered {
          background: linear-gradient(
            to right,
            rgba(var(--accent-success-rgb), 0.05),
            var(--glass-bg) 70%
          );
        }
        
        .goal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .goal-title {
          margin: 0;
          font-size: 16px;
          font-weight: 500;
          color: var(--text-primary);
          transition: color 0.3s var(--easing-standard);
        }
        
        .goal-card.hovered .goal-title {
          color: var(--progress-color);
        }
        
        .goal-progress-text {
          font-size: 14px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 2px;
          transition: all 0.3s var(--easing-standard);
        }
        
        .goal-card.hovered .goal-progress-text {
          transform: scale(1.1);
        }
        
        .current-value {
          color: var(--progress-color);
          transition: color 0.3s var(--easing-standard);
        }
        
        .separator {
          margin: 0 2px;
          color: var(--text-tertiary);
        }
        
        .target-value {
          color: var(--text-secondary);
        }
        
        .goal-progress-container {
          height: 8px;
          position: relative;
          border-radius: 4px;
          overflow: visible;
        }
        
        .goal-progress-bg {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: var(--hover-bg);
          border-radius: 4px;
          overflow: hidden;
        }
        
        .goal-progress-bar {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: var(--progress-width);
          background-color: var(--progress-color);
          border-radius: 4px;
          transition: width 1s cubic-bezier(0.34, 1.56, 0.64, 1);
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding-right: 4px;
        }
        
        .goal-card.completed .goal-progress-bar {
          background: linear-gradient(
            to right,
            var(--accent-success),
            var(--accent-success-light, var(--accent-success))
          );
          box-shadow: 0 0 10px rgba(var(--accent-success-rgb), 0.5);
        }
        
        .complete-icon {
          color: white;
          opacity: 0;
          transform: scale(0);
          transition: all 0.3s 0.3s var(--easing-standard);
        }
        
        .goal-card.completed .complete-icon {
          opacity: 1;
          transform: scale(1);
        }
        
        .progress-milestones {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
        
        .milestone {
          position: absolute;
          top: 0;
          height: 8px;
          width: 1px;
          background-color: rgba(255, 255, 255, 0.3);
        }
        
        .increment-button {
          position: absolute;
          bottom: -10px;
          right: 16px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background-color: var(--progress-color);
          color: white;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transform: translateY(0);
          opacity: 0;
          animation: fadeInUp 0.3s var(--easing-standard) forwards;
          transition: all 0.2s var(--easing-standard);
          box-shadow: 0 2px 5px rgba(var(--progress-color-rgb), 0.5);
        }
        
        .increment-button:hover {
          transform: translateY(-2px) scale(1.1);
        }
        
        .increment-button:active {
          transform: translateY(0) scale(0.95);
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default GoalCard;