'use client';

import React, { useState } from 'react';
import { 
  Calendar, MoreVertical, MapPin, Building, 
  DollarSign, Globe, Clock, Edit, Trash2, ExternalLink
} from 'lucide-react';

interface Company {
  id: string;
  name: string;
  logo: string;
  industry: string;
}

type ApplicationStage = 'applied' | 'screening' | 'interview' | 'offer' | 'rejected';

interface ApplicationCardProps {
  id: string;
  position: string;
  company: Company;
  dateApplied: Date;
  stage: ApplicationStage;
  salary?: string;
  location?: string;
  remote?: boolean;
  notes?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onStageChange?: (stage: ApplicationStage) => void;
  onClick?: () => void;
}

const ApplicationCard: React.FC<ApplicationCardProps> = ({
  id,
  position,
  company,
  dateApplied,
  stage,
  salary,
  location,
  remote,
  notes,
  onEdit,
  onDelete,
  onStageChange,
  onClick
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Format date
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };
  
  // Get stage color
  const getStageColor = (stage: ApplicationStage): string => {
    switch (stage) {
      case 'applied': return 'var(--accent-blue)';
      case 'screening': return 'var(--accent-purple)';
      case 'interview': return 'var(--accent-green)';
      case 'offer': return 'var(--accent-success)';
      case 'rejected': return 'var(--accent-red)';
      default: return 'var(--text-secondary)';
    }
  };
  
  // Get stage display name
  const getStageLabel = (stage: ApplicationStage): string => {
    return stage.charAt(0).toUpperCase() + stage.slice(1);
  };
  
  const stageColor = getStageColor(stage);
  const stageLabel = getStageLabel(stage);
  
  // Calculate RGB value for effects
  const rgbMatch = stageColor.match(/var\(--accent-(.*)-rgb\)/);
  const rgbVar = rgbMatch 
    ? stageColor.replace(')', '-rgb)') 
    : stageColor.replace('var(--accent-', 'var(--accent-').replace(')', '-rgb)');
  
  return (
    <div 
      className={`app-card ${isHovered ? 'hovered' : ''} ${isExpanded ? 'expanded' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsMenuOpen(false);
      }}
      onClick={(e) => {
        // Only trigger onClick if not clicking the menu
        if (e.target instanceof Element && !e.target.closest('.card-menu') && !e.target.closest('.card-actions')) {
          if (onClick) {
            onClick();
          } else {
            setIsExpanded(!isExpanded);
          }
        }
      }}
      style={{
        '--stage-color': stageColor,
        '--stage-color-rgb': rgbVar
      } as React.CSSProperties}
    >
      <div className="card-highlight"></div>
      
      <div className="card-header">
        <div className="company-logo">
          {company.logo ? (
            <img src={company.logo} alt={company.name} />
          ) : (
            company.name.charAt(0)
          )}
        </div>
        
        <div className="card-title-container">
          <h3 className="card-position">{position}</h3>
          <div className="card-company">
            <Building size={14} />
            <span>{company.name}</span>
          </div>
        </div>
        
        <div className="card-stage" onClick={(e) => e.stopPropagation()}>
          <div className="stage-indicator"></div>
          <span className="stage-label">{stageLabel}</span>
          
          {isHovered && onStageChange && (
            <div className="stage-dropdown">
              <div className="stage-dropdown-arrow"></div>
              <div className="stage-dropdown-content">
                {['applied', 'screening', 'interview', 'offer', 'rejected'].map((s) => (
                  <button 
                    key={s}
                    className={`stage-option ${s === stage ? 'active' : ''}`}
                    onClick={() => onStageChange(s as ApplicationStage)}
                    style={{
                      '--option-color': getStageColor(s as ApplicationStage)
                    } as React.CSSProperties}
                  >
                    <div className="option-indicator"></div>
                    <span>{getStageLabel(s as ApplicationStage)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="card-menu">
          <button 
            className="menu-button"
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
          >
            <MoreVertical size={16} />
          </button>
          
          {isMenuOpen && (
            <div className="menu-dropdown">
              {onEdit && (
                <button className="menu-item" onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                  setIsMenuOpen(false);
                }}>
                  <Edit size={14} />
                  <span>Edit</span>
                </button>
              )}
              {onDelete && (
                <button className="menu-item delete" onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                  setIsMenuOpen(false);
                }}>
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              )}
              <button className="menu-item" onClick={(e) => {
                e.stopPropagation();
                // Open company website in new tab
                setIsMenuOpen(false);
              }}>
                <ExternalLink size={14} />
                <span>View Job</span>
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="card-content">
        <div className="card-meta">
          <div className="meta-item">
            <Calendar size={14} />
            <span>{formatDate(dateApplied)}</span>
          </div>
          
          {location && (
            <div className="meta-item">
              <MapPin size={14} />
              <span>{location}</span>
              {remote && <span className="remote-badge">Remote</span>}
            </div>
          )}
          
          {salary && (
            <div className="meta-item">
              <DollarSign size={14} />
              <span>{salary}</span>
            </div>
          )}
        </div>
        
        {notes && (
          <div className={`card-notes ${isExpanded ? 'expanded' : ''}`}>
            <p>{notes}</p>
          </div>
        )}
      </div>
      
      {isHovered && (
        <div className="card-actions">
          <button className="action-button edit" onClick={(e) => {
            e.stopPropagation();
            if (onEdit) onEdit();
          }}>
            <Edit size={14} />
          </button>
          <button className="action-button delete" onClick={(e) => {
            e.stopPropagation();
            if (onDelete) onDelete();
          }}>
            <Trash2 size={14} />
          </button>
        </div>
      )}
      
      <style jsx>{`
        .app-card {
          background: var(--glass-card-bg);
          border-radius: var(--border-radius);
          border: 1px solid var(--border-thin);
          position: relative;
          overflow: hidden;
          transition: all 0.3s var(--easing-standard);
          cursor: pointer;
          padding: 20px;
        }
        
        .app-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            135deg, 
            rgba(var(--stage-color-rgb), 0.03) 0%, 
            transparent 70%
          );
          z-index: -1;
          opacity: 0;
          transition: opacity 0.5s var(--easing-standard);
        }
        
        .app-card.hovered {
          transform: translateY(-3px);
          box-shadow: var(--shadow-lg);
          border-color: rgba(var(--stage-color-rgb), 0.3);
        }
        
        .app-card.hovered::before {
          opacity: 1;
        }
        
        .card-highlight {
          position: absolute;
          top: 0;
          left: 0;
          width: 5px;
          height: 100%;
          background-color: var(--stage-color);
          opacity: 0.7;
          transition: all 0.3s var(--easing-standard);
        }
        
        .app-card.hovered .card-highlight {
          width: 7px;
          opacity: 1;
        }
        
        .card-header {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          position: relative;
          z-index: 1;
        }
        
        .company-logo {
          width: 45px;
          height: 45px;
          border-radius: 10px;
          background: linear-gradient(135deg, var(--stage-color), rgba(var(--stage-color-rgb), 0.7));
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 20px;
          font-weight: 600;
          flex-shrink: 0;
          transition: all 0.3s var(--easing-standard);
          overflow: hidden;
          box-shadow: 0 3px 8px rgba(var(--stage-color-rgb), 0.2);
        }
        
        .company-logo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .app-card.hovered .company-logo {
          transform: scale(1.05) rotate(3deg);
          box-shadow: 0 5px 12px rgba(var(--stage-color-rgb), 0.4);
        }
        
        .card-title-container {
          flex: 1;
          min-width: 0;
        }
        
        .card-position {
          margin: 0 0 5px 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
          transition: color 0.3s var(--easing-standard);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .app-card.hovered .card-position {
          color: var(--stage-color);
        }
        
        .card-company {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          color: var(--text-secondary);
        }
        
        .card-company svg {
          color: var(--text-tertiary);
        }
        
        .card-stage {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 5px 10px;
          background-color: rgba(var(--stage-color-rgb), 0.1);
          border-radius: 20px;
          transition: all 0.3s var(--easing-standard);
          position: relative;
          flex-shrink: 0;
        }
        
        .app-card.hovered .card-stage {
          background-color: rgba(var(--stage-color-rgb), 0.2);
          transform: translateY(-2px);
        }
        
        .stage-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: var(--stage-color);
        }
        
        .stage-label {
          font-size: 13px;
          font-weight: 500;
          color: var(--stage-color);
        }
        
        .stage-dropdown {
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-top: 10px;
          background: var(--glass-card-bg);
          border-radius: var(--border-radius);
          border: 1px solid var(--border-thin);
          box-shadow: var(--shadow-lg);
          min-width: 150px;
          z-index: 10;
          opacity: 0;
          animation: fadeInDown 0.2s var(--easing-standard) forwards;
        }
        
        .stage-dropdown-arrow {
          position: absolute;
          top: -5px;
          left: 50%;
          transform: translateX(-50%) rotate(45deg);
          width: 10px;
          height: 10px;
          background: var(--glass-card-bg);
          border-top: 1px solid var(--border-thin);
          border-left: 1px solid var(--border-thin);
        }
        
        .stage-dropdown-content {
          display: flex;
          flex-direction: column;
          width: 100%;
          padding: 5px;
        }
        
        .stage-option {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 10px;
          background: transparent;
          border: none;
          border-radius: var(--border-radius);
          cursor: pointer;
          transition: all 0.2s var(--easing-standard);
          position: relative;
          text-align: left;
        }
        
        .stage-option:hover {
          background: var(--hover-bg);
        }
        
        .stage-option.active {
          background: rgba(var(--option-color-rgb), 0.1);
        }
        
        .option-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: var(--option-color, var(--text-tertiary));
        }
        
        .stage-option span {
          font-size: 13px;
          color: var(--text-primary);
        }
        
        .stage-option.active span {
          color: var(--option-color);
          font-weight: 500;
        }
        
        .card-menu {
          position: relative;
          z-index: 5;
        }
        
        .menu-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: transparent;
          border: none;
          color: var(--text-tertiary);
          cursor: pointer;
          transition: all 0.2s var(--easing-standard);
        }
        
        .menu-button:hover {
          background: var(--hover-bg);
          color: var(--text-secondary);
        }
        
        .menu-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 5px;
          background: var(--glass-card-bg);
          border-radius: var(--border-radius);
          border: 1px solid var(--border-thin);
          box-shadow: var(--shadow-lg);
          min-width: 150px;
          z-index: 10;
          overflow: hidden;
          opacity: 0;
          animation: fadeInDown 0.2s var(--easing-standard) forwards;
        }
        
        .menu-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 15px;
          width: 100%;
          background: transparent;
          border: none;
          text-align: left;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s var(--easing-standard);
        }
        
        .menu-item:hover {
          background: var(--hover-bg);
          color: var(--text-primary);
        }
        
        .menu-item.delete {
          color: var(--accent-red);
        }
        
        .menu-item.delete:hover {
          background: rgba(var(--accent-red-rgb), 0.1);
        }
        
        .card-content {
          margin-top: 16px;
          position: relative;
          z-index: 1;
        }
        
        .card-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
          margin-bottom: 12px;
        }
        
        .meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--text-tertiary);
          font-size: 13px;
          transition: all 0.3s var(--easing-standard);
        }
        
        .app-card.hovered .meta-item {
          color: var(--text-secondary);
        }
        
        .remote-badge {
          display: inline-block;
          padding: 2px 6px;
          background: rgba(var(--accent-green-rgb), 0.1);
          color: var(--accent-green);
          border-radius: 10px;
          font-size: 11px;
          font-weight: 500;
          margin-left: 4px;
        }
        
        .card-notes {
          font-size: 14px;
          color: var(--text-tertiary);
          line-height: 1.5;
          max-height: 40px;
          overflow: hidden;
          position: relative;
          transition: all 0.3s var(--easing-standard);
        }
        
        .card-notes::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 20px;
          background: linear-gradient(to top, var(--glass-card-bg), transparent);
          pointer-events: none;
          opacity: 1;
          transition: opacity 0.3s var(--easing-standard);
        }
        
        .card-notes.expanded {
          max-height: 200px;
        }
        
        .card-notes.expanded::after {
          opacity: 0;
        }
        
        .card-actions {
          position: absolute;
          bottom: -30px;
          right: 15px;
          display: flex;
          gap: 8px;
          z-index: 5;
          opacity: 0;
          animation: slideUp 0.3s var(--easing-standard) forwards;
        }
        
        .action-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          transition: all 0.2s var(--easing-standard);
          box-shadow: var(--shadow);
        }
        
        .action-button.edit {
          background: rgba(var(--accent-blue-rgb), 0.9);
          color: white;
        }
        
        .action-button.edit:hover {
          background: var(--accent-blue);
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(var(--accent-blue-rgb), 0.4);
        }
        
        .action-button.delete {
          background: rgba(var(--accent-red-rgb), 0.9);
          color: white;
        }
        
        .action-button.delete:hover {
          background: var(--accent-red);
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(var(--accent-red-rgb), 0.4);
        }
        
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-10px) translateX(-50%);
          }
          to {
            opacity: 1;
            transform: translateY(0) translateX(-50%);
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(-10px);
          }
        }
      `}</style>
    </div>
  );
};

export default ApplicationCard;