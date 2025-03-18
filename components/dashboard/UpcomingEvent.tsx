'use client';

import React, { useState } from 'react';
import { Calendar, Users, CheckCircle, Clock, ExternalLink } from 'lucide-react';

export type EventType = 'Interview' | 'Task' | 'Deadline';

interface UpcomingEventProps {
  id: string;
  title: string;
  companyName: string;
  companyLogo?: string;
  date: Date;
  time: string;
  type: EventType;
  details: string;
  location?: string;
  duration?: number;
  onClick?: () => void;
}

const UpcomingEvent: React.FC<UpcomingEventProps> = ({
  id,
  title,
  companyName,
  companyLogo,
  date,
  time,
  type,
  details,
  location,
  duration,
  onClick
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);
  
  // Format date
  const formatDate = (date: Date) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dateToCheck = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (dateToCheck.getTime() === today.getTime()) {
      return 'Today';
    }
    
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    if (dateToCheck.getTime() === tomorrow.getTime()) {
      return 'Tomorrow';
    }
    
    // Check if it's within the next 7 days
    const oneWeekLater = new Date(today);
    oneWeekLater.setDate(today.getDate() + 7);
    
    if (dateToCheck <= oneWeekLater) {
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    }
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  // Get event icon based on type
  const getEventIcon = (type: EventType) => {
    switch (type) {
      case 'Interview':
        return <Users size={18} className="event-icon interview" />;
      case 'Task':
        return <CheckCircle size={18} className="event-icon task" />;
      case 'Deadline':
        return <Clock size={18} className="event-icon deadline" />;
      default:
        return <Calendar size={18} className="event-icon" />;
    }
  };
  
  // Get color variable based on event type
  const getTypeColor = (type: EventType): string => {
    switch (type) {
      case 'Interview': return 'var(--accent-green)';
      case 'Task': return 'var(--accent-purple)';
      case 'Deadline': return 'var(--accent-red)';
      default: return 'var(--accent-blue)';
    }
  };
  
  const typeColor = getTypeColor(type);
  
  // Calculate if the event is today
  const isToday = formatDate(date) === 'Today';
  
  // Calculate if the event is soon (within 2 days)
  const isSoon = (
    formatDate(date) === 'Today' || 
    formatDate(date) === 'Tomorrow'
  );
  
  return (
    <div 
      className={`event-item ${isHovered ? 'hovered' : ''} ${isToday ? 'today' : ''} ${isSoon ? 'soon' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        if (onClick) onClick();
        setIsDetailsVisible(!isDetailsVisible);
      }}
      style={{
        '--type-color': typeColor,
        '--type-color-rgb': typeColor.replace('var(--accent-', 'var(--accent-').replace(')', '-rgb)')
      } as React.CSSProperties}
    >
      <div className="event-date">
        <div className="date-label">{formatDate(date)}</div>
        <div className="time-label">{time}</div>
        {duration && <div className="duration-label">{duration} min</div>}
      </div>
      
      <div className="event-content">
        <div className="event-header">
          <h4 className="event-title">{title}</h4>
          <span className={`event-type ${type.toLowerCase()}`}>
            {getEventIcon(type)}
            <span>{type}</span>
          </span>
        </div>
        
        <div className="event-company">
          <span className="company-logo">
            {companyLogo ? (
              <img src={companyLogo} alt={companyName} />
            ) : (
              companyName.charAt(0)
            )}
          </span>
          <span className="company-name">{companyName}</span>
        </div>
        
        {location && (
          <div className={`event-location ${isDetailsVisible ? 'visible' : ''}`}>
            <span className="location-label">Location:</span>
            <span className="location-value">{location}</span>
          </div>
        )}
        
        {details && (
          <div className={`event-details ${isDetailsVisible ? 'visible' : ''}`}>
            <p>{details}</p>
          </div>
        )}
        
        <div className="event-actions">
          {isHovered && (
            <button className="action-button join-btn">
              <ExternalLink size={14} />
              <span>Join</span>
            </button>
          )}
        </div>
      </div>
      
      <style jsx>{`
        .event-item {
          display: flex;
          gap: 16px;
          padding: 16px;
          background: var(--glass-bg);
          border-radius: var(--border-radius);
          border: 1px solid var(--border-thin);
          transition: all 0.3s var(--easing-standard);
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }
        
        .event-item::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 4px;
          background-color: var(--type-color);
          opacity: 0.5;
          transition: all 0.3s var(--easing-standard);
        }
        
        .event-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            135deg, 
            rgba(var(--type-color-rgb), 0.05) 0%, 
            rgba(var(--type-color-rgb), 0) 60%
          );
          z-index: -1;
          opacity: 0;
          transition: opacity 0.5s var(--easing-standard);
        }
        
        .event-item.hovered {
          transform: translateY(-3px);
          box-shadow: var(--shadow);
          border-color: rgba(var(--type-color-rgb), 0.3);
        }
        
        .event-item.hovered::after {
          width: 6px;
          opacity: 1;
        }
        
        .event-item.hovered::before {
          opacity: 1;
        }
        
        .event-item.today {
          border-color: rgba(var(--type-color-rgb), 0.3);
          background: linear-gradient(
            to right,
            rgba(var(--type-color-rgb), 0.05),
            var(--glass-bg) 50%
          );
        }
        
        .event-item.soon .date-label {
          font-weight: 700;
          color: var(--type-color);
        }
        
        .event-date {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 70px;
          padding: 10px;
          background: var(--hover-bg);
          border-radius: var(--border-radius);
          transition: all 0.3s var(--easing-standard);
        }
        
        .event-item.hovered .event-date {
          background: rgba(var(--type-color-rgb), 0.1);
          transform: scale(1.05);
        }
        
        .date-label {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          transition: all 0.3s var(--easing-standard);
        }
        
        .event-item.hovered .date-label {
          color: var(--type-color);
        }
        
        .time-label {
          font-size: 13px;
          color: var(--text-tertiary);
          margin-top: 4px;
          transition: all 0.3s var(--easing-standard);
        }
        
        .event-item.hovered .time-label {
          color: var(--text-secondary);
        }
        
        .duration-label {
          font-size: 11px;
          color: var(--text-tertiary);
          margin-top: 2px;
          padding: 1px 5px;
          background: rgba(var(--type-color-rgb), 0.1);
          border-radius: 10px;
          opacity: 0;
          transform: translateY(5px);
          transition: all 0.3s var(--easing-standard);
        }
        
        .event-item.hovered .duration-label {
          opacity: 1;
          transform: translateY(0);
        }
        
        .event-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .event-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 8px;
        }
        
        .event-title {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
          transition: color 0.3s var(--easing-standard);
        }
        
        .event-item.hovered .event-title {
          color: var(--type-color);
        }
        
        .event-type {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 8px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          white-space: nowrap;
          transition: all 0.3s var(--easing-standard);
        }
        
        .event-type.interview {
          background: rgba(var(--accent-green-rgb), 0.1);
          color: var(--accent-green);
        }
        
        .event-type.task {
          background: rgba(var(--accent-purple-rgb), 0.1);
          color: var(--accent-purple);
        }
        
        .event-type.deadline {
          background: rgba(var(--accent-red-rgb), 0.1);
          color: var(--accent-red);
        }
        
        .event-item.hovered .event-type {
          background: rgba(var(--type-color-rgb), 0.2);
          transform: translateY(-2px);
        }
        
        .event-icon {
          width: 16px;
          height: 16px;
        }
        
        .event-company {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
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
        
        .event-item.hovered .company-logo {
          transform: scale(1.1) rotate(3deg);
          box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
        }
        
        .company-name {
          font-size: 14px;
          color: var(--text-secondary);
          font-weight: 500;
          transition: color 0.3s var(--easing-standard);
        }
        
        .event-item.hovered .company-name {
          color: var(--text-primary);
        }
        
        .event-location {
          font-size: 14px;
          color: var(--text-tertiary);
          opacity: 0;
          max-height: 0;
          overflow: hidden;
          transition: all 0.3s var(--easing-standard);
        }
        
        .event-location.visible {
          opacity: 1;
          max-height: 60px;
          margin-top: 4px;
        }
        
        .event-item.hovered .event-location {
          color: var(--text-secondary);
        }
        
        .location-label {
          margin-right: 4px;
          font-weight: 500;
        }
        
        .event-details {
          opacity: 0;
          max-height: 0;
          overflow: hidden;
          transition: all 0.3s var(--easing-standard);
        }
        
        .event-details.visible {
          opacity: 1;
          max-height: 200px;
          margin-top: 8px;
        }
        
        .event-details p {
          margin: 0;
          font-size: 14px;
          color: var(--text-tertiary);
          line-height: 1.5;
        }
        
        .event-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          margin-top: 8px;
          height: 28px;
        }
        
        .action-button {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: var(--border-radius);
          border: 1px solid rgba(var(--type-color-rgb), 0.3);
          background: rgba(var(--type-color-rgb), 0.1);
          color: var(--type-color);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s var(--easing-standard);
          opacity: 0;
          transform: translateY(10px);
          animation: fadeInUp 0.3s var(--easing-standard) forwards;
        }
        
        .action-button:hover {
          background: rgba(var(--type-color-rgb), 0.2);
          transform: translateY(-1px);
        }
        
        .action-button:active {
          transform: translateY(0);
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
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

export default UpcomingEvent;