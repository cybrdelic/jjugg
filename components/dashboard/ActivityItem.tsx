'use client';

import React, { useState } from 'react';
import { LucideIcon, FileText, Users, CheckCircle, Target, Activity, Bell, TrendingUp } from 'lucide-react';

export type ActivityType = 'application' | 'interview' | 'offer' | 'rejected' | 'assessment' | 'screening' | 'task' | 'email' | 'network';

interface ActivityItemProps {
  id: string;
  type: ActivityType;
  title: string;
  companyName: string;
  companyLogo?: string;
  timestamp: Date;
  details: string;
  isLast?: boolean;
  onClick?: () => void;
}

const ActivityItem: React.FC<ActivityItemProps> = ({
  id,
  type,
  title,
  companyName,
  companyLogo,
  timestamp,
  details,
  isLast = false,
  onClick
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Format date
  const formatDate = (date: Date) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dateToCheck = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (dateToCheck.getTime() === today.getTime()) {
      // If it's today, show the time
      return `Today at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    }

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (dateToCheck.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    }

    // Check if it's within the last 7 days
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(today.getDate() - 7);

    if (dateToCheck >= oneWeekAgo) {
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    }

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Get activity icon based on type
  const getActivityIcon = (type: ActivityType): React.ReactElement => {
    switch (type) {
      case 'application':
        return <FileText size={18} className="activity-icon application" />;
      case 'interview':
        return <Users size={18} className="activity-icon interview" />;
      case 'offer':
        return <CheckCircle size={18} className="activity-icon offer" />;
      case 'assessment':
        return <Target size={18} className="activity-icon assessment" />;
      case 'rejected':
        return <TrendingUp size={18} className="activity-icon rejected" />;
      case 'task':
        return <CheckCircle size={18} className="activity-icon task" />;
      case 'email':
        return <Bell size={18} className="activity-icon email" />;
      case 'screening':
        return <Activity size={18} className="activity-icon screening" />;
      default:
        return <Activity size={18} className="activity-icon" />;
    }
  };

  // Get color class based on type
  const getTypeColorVar = (type: ActivityType): string => {
    switch (type) {
      case 'application': return 'var(--accent-blue)';
      case 'interview': return 'var(--accent-green)';
      case 'offer': return 'var(--accent-success)';
      case 'assessment': return 'var(--accent-orange)';
      case 'rejected': return 'var(--accent-red)';
      case 'task': return 'var(--accent-purple)';
      case 'email': return 'var(--accent-yellow)';
      case 'screening': return 'var(--accent-secondary)';
      default: return 'var(--text-secondary)';
    }
  };

  const typeColor = getTypeColorVar(type);
  const icon = getActivityIcon(type);

  return (
    <div
      className={`timeline-item ${isHovered ? 'hovered' : ''} ${isExpanded ? 'expanded' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        if (onClick) onClick();
        setIsExpanded(!isExpanded);
      }}
      style={{
        '--type-color': typeColor,
        '--type-color-rgb': typeColor.replace('var(--accent-', 'var(--accent-').replace(')', '-rgb)')
      } as React.CSSProperties}
    >
      <div className="timeline-icon-wrapper">
        <div className="timeline-icon">
          {icon}
          <div className="icon-glow"></div>
        </div>
        {!isLast && <div className="timeline-connector"></div>}
      </div>

      <div className="timeline-content">
        <div className="timeline-header">
          <h4 className="timeline-title">{title}</h4>
          <span className="timeline-time">{formatDate(timestamp)}</span>
        </div>

        <div className="timeline-details">
          <div className="company-info">
            <span className="company-logo">
              {companyLogo ? (
                <img src={companyLogo} alt={companyName} />
              ) : (
                companyName.charAt(0)
              )}
            </span>
            <span className="company-name">{companyName}</span>
          </div>
          <p className={`timeline-description ${isExpanded ? 'expanded' : ''}`}>{details}</p>
        </div>
      </div>

      <style jsx>{`
        .timeline-item {
          display: flex;
          gap: 12px;
          padding: 12px;
          border-radius: var(--border-radius);
          transition: all 0.3s var(--easing-standard);
          cursor: pointer;
          position: relative;
        }

        .timeline-item.hovered {
          background: var(--hover-bg);
          transform: translateX(3px);
        }

        .timeline-icon-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }

        .timeline-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background-color: rgba(var(--type-color-rgb), 0.1);
          color: var(--type-color);
          position: relative;
          z-index: 2;
          transition: all 0.3s var(--easing-standard);
          flex-shrink: 0;
        }

        .timeline-item.hovered .timeline-icon {
          transform: scale(1.1);
          background-color: rgba(var(--type-color-rgb), 0.2);
          box-shadow: 0 0 0 4px rgba(var(--type-color-rgb), 0.1);
        }

        .icon-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 0;
          height: 0;
          background: radial-gradient(
            circle,
            rgba(var(--type-color-rgb), 0.8) 0%,
            rgba(var(--type-color-rgb), 0) 70%
          );
          border-radius: 50%;
          opacity: 0;
          transition: all 0.5s var(--easing-standard);
        }

        .timeline-item.hovered .icon-glow {
          width: 46px;
          height: 46px;
          opacity: 0.3;
        }

        .timeline-connector {
          position: absolute;
          top: 36px;
          bottom: 0;
          left: 18px;
          width: 2px;
          background: linear-gradient(
            to bottom,
            var(--type-color) 0%,
            var(--border-divider) 100%
          );
          z-index: 1;
        }

        .timeline-content {
          flex: 1;
          min-width: 0;
        }

        .timeline-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 8px;
          margin-bottom: 8px;
        }

        .timeline-title {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
          transition: color 0.3s var(--easing-standard);
        }

        .timeline-item.hovered .timeline-title {
          color: var(--type-color);
        }

        .timeline-time {
          font-size: 12px;
          color: var(--text-tertiary);
          white-space: nowrap;
          transition: all 0.3s var(--easing-standard);
          padding: 2px 6px;
          border-radius: 10px;
          background: transparent;
        }

        .timeline-item.hovered .timeline-time {
          background-color: rgba(var(--type-color-rgb), 0.1);
          color: var(--type-color);
        }

        .timeline-details {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .company-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .company-logo {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          background: linear-gradient(135deg, var(--type-color), rgba(var(--type-color-rgb), 0.7));
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 12px;
          font-weight: 600;
          transition: all 0.3s var(--easing-standard);
          overflow: hidden;
        }

        .company-logo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .timeline-item.hovered .company-logo {
          transform: scale(1.1) rotate(3deg);
          box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
        }

        .company-name {
          font-size: 14px;
          color: var(--text-secondary);
          font-weight: 500;
          transition: color 0.3s var(--easing-standard);
        }

        .timeline-item.hovered .company-name {
          color: var(--text-primary);
        }

        .timeline-description {
          margin: 0;
          font-size: 14px;
          color: var(--text-tertiary);
          line-height: 1.5;
          transition: all 0.3s var(--easing-standard);
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .timeline-description.expanded {
          -webkit-line-clamp: unset;
        }

        .timeline-item.hovered .timeline-description {
          color: var(--text-secondary);
        }

        .timeline-item.expanded {
          background: var(--hover-bg);
        }
      `}</style>
    </div>
  );
};

export default ActivityItem;
