/**
 * Application Table Row Component
 * Individual row in the applications table
 */

import React, { forwardRef } from 'react';
import {
  Clock, CheckSquare, Briefcase, MapPin, DollarSign,
  Users, ArrowUp, ArrowDown, User
} from 'lucide-react';
import { Application, ApplicationStage } from '@/types';
import Tooltip from '../../Tooltip';
import Portal from '../../Portal';
import { useThemeColors } from '@/hooks/useThemeColors';

interface ApplicationTableRowProps {
  application: Application;
  visibleColumns: string[];
  isSelected: boolean;
  isLastRow: boolean;
  mounted: boolean;
  isMobileView: boolean;
  isAutosizeEnabled: boolean;
  tableViewDensity: 'compact' | 'comfortable' | 'spacious';
  inlineEditingId: string | null;
  activeStageDropdown: string | null;
  animationDelay: number;
  stagesOrder: ApplicationStage[];

  // Handlers
  onSelect: (selected: boolean) => void;
  onRowClick: (e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onStageClick: (e: React.MouseEvent) => void;
  onStageChange: (stage: ApplicationStage) => void;
}

const ApplicationTableRow = forwardRef<HTMLDivElement, ApplicationTableRowProps>(({
  application,
  visibleColumns,
  isSelected,
  isLastRow,
  mounted,
  isMobileView,
  isAutosizeEnabled,
  tableViewDensity,
  inlineEditingId,
  activeStageDropdown,
  animationDelay,
  stagesOrder,
  onSelect,
  onRowClick,
  onContextMenu,
  onStageClick,
  onStageChange
}, ref) => {
  const { applicationStage } = useThemeColors();

  const formatDate = (date: Date): string =>
    new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);

  const getStageColor = (stage: ApplicationStage): string => {
    return applicationStage.getColor(stage);
  };

  const getStageBackgroundColor = (stage: ApplicationStage): string => {
    return applicationStage.getBackgroundColor(stage);
  };

  const getStageLabel = (stage: ApplicationStage): string =>
    stage.charAt(0).toUpperCase() + stage.slice(1);

  const calculateStageProgress = (stage: ApplicationStage): number => {
    return Math.min(((stagesOrder.indexOf(stage) + 1) / stagesOrder.length) * 100, 100);
  };

  const getNextInterview = () => {
    if (!application.interviews) return null;
    const upcoming = application.interviews
      .filter(i => !i.completed && i.date > new Date())
      .sort((a, b) => a.date.getTime() - b.date.getTime());
    return upcoming[0] || null;
  };

  const getPendingTasks = () => {
    if (!application.tasks) return [];
    return application.tasks.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
  };

  return (
    <div
      ref={ref}
      className={`table-row ${isSelected ? 'selected' : ''} ${mounted ? 'animate-in' : ''} ${isMobileView ? 'mobile-view' : ''} ${isAutosizeEnabled ? 'autosize' : ''} density-${tableViewDensity} ${inlineEditingId === application.id ? 'editing' : ''}`}
      style={{ animationDelay: `${animationDelay}s` }}
      onClick={onRowClick}
      onContextMenu={onContextMenu}
    >
      {/* Checkbox */}
      <div className="checkbox-wrapper" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          className="custom-checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            onSelect(e.target.checked);
          }}
          onClick={(e) => e.stopPropagation()}
          id={`checkbox-${application.id}`}
        />
        <label htmlFor={`checkbox-${application.id}`} className="checkbox-label" onClick={(e) => e.stopPropagation()}></label>
      </div>

      {/* Company */}
      {visibleColumns.includes('company') && (
        <div className="cell company-cell" data-label="Company">
          <Tooltip
            content={
              <div className="company-tooltip">
                <h4>{application.company.name}</h4>
                {application.company.industry && <p><strong>Industry:</strong> {application.company.industry}</p>}
                {application.company.headquarters && <p><strong>Location:</strong> {application.company.headquarters}</p>}
                {application.company.size && <p><strong>Size:</strong> {application.company.size}</p>}
              </div>
            }
            placement="top"
          >
            <div className="company-info">
              <span className="company-name">{application.company.name}</span>
            </div>
          </Tooltip>
        </div>
      )}

      {/* Position */}
      {visibleColumns.includes('position') && (
        <div className="cell position-cell" data-label="Position">
          <Tooltip
            content={
              <div className="position-tooltip">
                <h4>{application.position}</h4>
                {application.jobDescription && <p>{application.jobDescription}</p>}
              </div>
            }
            placement="top"
          >
            <div className="position-info">
              <span className="position-title">{application.position}</span>
              {application.jobDescription && (
                <span className="position-description">{application.jobDescription}</span>
              )}
            </div>
          </Tooltip>
        </div>
      )}

      {/* Date Applied */}
      {visibleColumns.includes('dateApplied') && (
        <div className="cell" data-label="Date Applied">
          <span className="cell-value">{formatDate(application.dateApplied)}</span>
        </div>
      )}

      {/* Stage */}
      {visibleColumns.includes('stage') && (
        <div className="cell" data-label="Stage">
          <div className="stage-container" onClick={onStageClick}>
            <Tooltip
              content={`Click to change stage from: ${getStageLabel(application.stage)}`}
              placement="top"
            >
              <div
                className={`stage-badge stage-${application.stage} clickable`}
                style={{ borderColor: getStageColor(application.stage) }}
              >
                <div
                  className="stage-indicator"
                  style={{ backgroundColor: getStageColor(application.stage) }}
                ></div>
                <span className="stage-label">{getStageLabel(application.stage)}</span>
              </div>
            </Tooltip>
            <div className="stage-progress-container">
              <div className="stage-progress-background">
                {stagesOrder.map((stage, idx) => (
                  <div
                    key={stage}
                    className={`stage-step ${stagesOrder.indexOf(application.stage) >= idx ? 'completed' : ''}`}
                    style={{ backgroundColor: stagesOrder.indexOf(application.stage) >= idx ? getStageColor(stage) : 'var(--border)' }}
                  />
                ))}
              </div>
            </div>
            {activeStageDropdown === application.id && (
              <Portal>
                <div
                  className="stage-dropdown-overlay"
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    zIndex: 999,
                    pointerEvents: 'none'
                  }}
                >
                  <div
                    className="stage-dropdown"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      position: 'absolute',
                      top: 'var(--dropdown-top)',
                      left: 'var(--dropdown-left)',
                      pointerEvents: 'auto'
                    }}
                  >
                    {stagesOrder.map((stage) => (
                      <div
                        key={stage}
                        className={`stage-option ${stage === application.stage ? 'current' : ''}`}
                        onClick={() => {
                          onStageChange(stage);
                        }}
                      >
                        <div
                          className="stage-option-indicator"
                          style={{ backgroundColor: getStageColor(stage) }}
                        ></div>
                        <span>{getStageLabel(stage)}</span>
                        {stage === application.stage && <span className="current-badge">Current</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </Portal>
            )}
          </div>
        </div>
      )}

      {/* Alerts */}
      {visibleColumns.includes('alert') && (
        <div className="cell" data-label="Alerts">
          <div className="alerts-cell">
            {getNextInterview() && (
              <div className="alert-item interview-alert">
                <Clock size={14} className="alert-icon" />
                <span>{formatDate(getNextInterview()!.date)}</span>
              </div>
            )}
            {getPendingTasks().length > 0 && (
              <div className="alert-item task-alert">
                <CheckSquare size={14} className="alert-icon" />
                <span>{getPendingTasks().length} due soon</span>
              </div>
            )}
            {application.stage === 'offer' && (
              <div className="alert-item offer-alert">
                <Briefcase size={14} className="alert-icon" />
                <span>Offer pending</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tasks */}
      {visibleColumns.includes('tasks') && (
        <div className="cell" data-label="Tasks">
          <div className="tasks-cell">
            <div className="tasks-count-container">
              <CheckSquare size={14} className="cell-icon" />
              <span className="cell-value">
                {application.tasks ? `${application.tasks.filter(t => t.completed).length}/${application.tasks.length}` : '0/0'}
              </span>
            </div>
            {application.tasks && application.tasks.length > 0 && (
              <div className="tasks-progress-container">
                <div className="tasks-progress-bar">
                  <div
                    className="tasks-progress-fill"
                    style={{
                      width: `${(application.tasks.filter(t => t.completed).length / application.tasks.length) * 100}%`,
                      backgroundColor: 'var(--success)'
                    }}
                  />
                </div>
                <span className="tasks-pending-count">
                  {application.tasks.filter(t => !t.completed).length} pending
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Location */}
      {visibleColumns.includes('location') && (
        <div className="cell" data-label="Location">
          <div className="location-cell">
            <div className="location-info">
              <MapPin size={14} className="cell-icon" />
              <span className="cell-value">{application.location || 'Not specified'}</span>
              {application.remote && <span className="remote-indicator">Remote</span>}
            </div>
          </div>
        </div>
      )}

      {/* Salary */}
      {visibleColumns.includes('salary') && (
        <div className="cell" data-label="Salary">
          <div className="compensation-cell">
            {application.salary ? (
              <span className="comp-value">{application.salary}</span>
            ) : (
              <span className="no-comp">Not specified</span>
            )}
          </div>
        </div>
      )}

      {/* Bonus */}
      {visibleColumns.includes('bonus') && (
        <div className="cell" data-label="Bonus">
          <div className="compensation-cell">
            {application.bonus ? (
              <span className="comp-value bonus-value">{application.bonus}</span>
            ) : (
              <span className="no-comp">None</span>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        /* Enhanced Table Row - Compact & Polished Design */
        .table-row {
          display: grid;
          grid-template-columns: 48px 2fr 2.5fr 1.2fr 1.5fr 1fr 1fr 1fr 0.8fr;
          gap: var(--space-3);
          align-items: center;
          padding: var(--space-2) var(--space-4);
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: var(--border-radius);
          margin-bottom: var(--space-0-5);
          position: relative;
          cursor: pointer;
          transition: all var(--duration-150) var(--ease-microinteractive);
          backdrop-filter: var(--glass-backdrop);
          -webkit-backdrop-filter: var(--glass-backdrop);
          contain: layout style paint;
          will-change: transform, box-shadow, background-color, border-color;
          overflow: hidden;
          min-height: 40px;
        }

        /* Elegant row animations */
        .table-row::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg,
            transparent 0%,
            var(--blob-primary) 50%,
            transparent 100%);
          opacity: 0;
          transition: opacity var(--duration-300) var(--ease-smooth);
          pointer-events: none;
          z-index: 0;
        }

        /* Row states with polished effects */
        .table-row:hover {
          transform: translateY(var(--morph-translate));
          background: var(--card-hover);
          border-color: var(--primary);
          box-shadow: var(--shadow-medium);
        }

        .table-row:hover::before {
          opacity: 1;
        }

        .table-row.selected {
          background: var(--blob-primary);
          border-color: var(--primary);
          box-shadow: var(--shadow-large);
        }

        .table-row.selected::before {
          opacity: 0.6;
        }        /* Density Variations */
        .table-row.density-compact {
          padding: 6px 12px;
          grid-template-columns: 40px 2fr 2.5fr 1.2fr 1.5fr 1fr 1fr 1fr 0.8fr;
          gap: 10px;
          min-height: 32px;
        }

        .table-row.density-comfortable {
          padding: 8px 16px;
          grid-template-columns: 44px 2fr 2.5fr 1.2fr 1.5fr 1fr 1fr 1fr 0.8fr;
          gap: 12px;
          min-height: 40px;
        }

        .table-row.density-spacious {
          padding: 12px 20px;
          grid-template-columns: 52px 2fr 2.5fr 1.2fr 1.5fr 1fr 1fr 1fr 0.8fr;
          gap: 14px;
          min-height: 48px;
        }

        /* Smooth entry animations */
        .table-row.animate-in {
          animation: rowSlideIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        @keyframes rowSlideIn {
          from {
            opacity: 0;
            transform: translateY(16px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* Enhanced Cell Design - Left Aligned & Compact */
        .cell {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 8px;
          font-size: 13px;
          color: var(--text-primary, #ffffff);
          position: relative;
          min-height: 28px;
          padding: 4px 0;
          z-index: 1;
          line-height: 1.3;
          font-weight: 500;
          text-align: left;
        }

        .cell-icon {
          color: var(--text-tertiary, rgba(255, 255, 255, 0.5));
          flex-shrink: 0;
          width: 18px;
          height: 18px;
          transition: color 0.2s ease;
        }

        .table-row:hover .cell-icon {
          color: var(--text-secondary, rgba(255, 255, 255, 0.7));
        }

        .cell-value {
          font-weight: 500;
          color: var(--text-primary, #ffffff);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-size: 13px;
          letter-spacing: -0.01em;
          text-align: left;
        }

        /* Modern Checkbox Design */
        .checkbox-wrapper {
          position: relative;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .custom-checkbox {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
        }

        .checkbox-label {
          position: relative;
          width: 20px;
          height: 20px;
          background: var(--glass-card-bg, rgba(255, 255, 255, 0.08));
          border: 1.5px solid var(--border-input, rgba(255, 255, 255, 0.25));
          border-radius: 3px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }

        .checkbox-label::after {
          content: '';
          width: 10px;
          height: 6px;
          border: 2px solid transparent;
          border-top: none;
          border-right: none;
          transform: rotate(-45deg) scale(0);
          transition: transform 0.15s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          margin-top: -1px;
        }

        .custom-checkbox:checked + .checkbox-label {
          background: var(--accent-blue, #3b82f6);
          border-color: var(--accent-blue, #3b82f6);
          box-shadow: 0 2px 6px rgba(var(--accent-blue-rgb, 59, 130, 246), 0.3);
        }

        .custom-checkbox:checked + .checkbox-label::after {
          border-color: white;
          transform: rotate(-45deg) scale(1);
        }

        .checkbox-label:hover {
          border-color: var(--accent-blue, #3b82f6);
          background: var(--glass-hover-bg, rgba(255, 255, 255, 0.12));
        }

        /* Enhanced Company Cell */
        .company-cell {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 8px;
          min-width: 0;
        }

        .company-info {
          min-width: 0;
          flex: 1;
          text-align: left;
        }

        .company-name {
          font-weight: 600;
          color: var(--text-primary, #ffffff);
          font-size: 13px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          letter-spacing: -0.01em;
          line-height: 1.2;
          text-align: left;
        }

        /* Enhanced Position Cell */
        .position-cell {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
          align-items: flex-start;
          justify-content: flex-start;
          text-align: left;
        }

        .position-info {
          width: 100%;
          text-align: left;
        }

        .position-title {
          font-weight: 600;
          color: var(--text-primary, #ffffff);
          font-size: 13px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          letter-spacing: -0.01em;
          line-height: 1.2;
          margin-bottom: 1px;
          text-align: left;
        }

        .position-description {
          font-size: 11px;
          color: var(--text-secondary, rgba(255, 255, 255, 0.7));
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
          max-height: 28px;
          text-align: left;
        }

        /* Compact Stage Badge */
        .stage-container {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 6px;
          width: 100%;
          cursor: pointer;
          position: relative;
          text-align: left;
        }

        .stage-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          border-radius: 3px;
          font-size: 11px;
          font-weight: 600;
          text-transform: capitalize;
          letter-spacing: 0.01em;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid transparent;
          white-space: nowrap;
          flex-shrink: 0;
          background: var(--glass-card-bg, rgba(255, 255, 255, 0.08));
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          position: relative;
          overflow: hidden;
          text-align: left;
        }

        .stage-badge::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg,
            rgba(255, 255, 255, 0.08) 0%,
            transparent 50%,
            rgba(255, 255, 255, 0.04) 100%);
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .stage-badge.clickable:hover {
          transform: translateY(-1px);
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.12);
          border-color: var(--accent-blue, #3b82f6);
        }

        .stage-badge:hover::before {
          opacity: 1;
        }

        .stage-indicator {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
          box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.2);
        }

        .stage-label {
          font-weight: 600;
          position: relative;
          z-index: 1;
          text-align: left;
        }        /* Compact Progress Visualization */
        .stage-progress-container {
          flex: 1;
          min-width: 60px;
          max-width: 100px;
        }

        .stage-progress-background {
          width: 100%;
          height: 4px;
          border-radius: 2px;
          background: var(--glass-card-bg, rgba(255, 255, 255, 0.1));
          overflow: hidden;
          position: relative;
          display: flex;
          gap: 1px;
          box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.15);
        }

        .stage-step {
          flex: 1;
          height: 100%;
          border-radius: 1px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          min-width: 8px;
          position: relative;
          overflow: hidden;
        }

        .stage-step::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.4s ease;
        }

        .stage-step.completed {
          opacity: 1;
          box-shadow: 0 0 4px rgba(var(--accent-blue-rgb, 59, 130, 246), 0.3);
        }

        .stage-step.completed::before {
          left: 100%;
        }

        .stage-step:not(.completed) {
          opacity: 0.3;
        }

        /* Compact Alert System */
        .alerts-cell {
          display: flex;
          flex-direction: column;
          gap: 3px;
          width: 100%;
          align-items: flex-start;
          justify-content: flex-start;
        }

        .alert-item {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 8px;
          border-radius: 3px;
          font-size: 11px;
          font-weight: 600;
          margin-bottom: 2px;
          transition: all 0.2s ease;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid transparent;
          animation: slideIn 0.3s ease forwards;
          text-align: left;
        }

        .alert-icon {
          flex-shrink: 0;
          width: 12px;
          height: 12px;
        }

        .interview-alert {
          background: rgba(var(--info-rgb, 59, 130, 246), 0.15);
          color: var(--info, #3b82f6);
          border-color: rgba(var(--info-rgb, 59, 130, 246), 0.3);
        }

        .task-alert {
          background: rgba(var(--error-rgb, 239, 68, 68), 0.15);
          color: var(--error, #ef4444);
          border-color: rgba(var(--error-rgb, 239, 68, 68), 0.3);
        }

        .offer-alert {
          background: rgba(var(--success-rgb, 34, 197, 94), 0.15);
          color: var(--success, #22c55e);
          border-color: rgba(var(--success-rgb, 34, 197, 94), 0.3);
          animation: pulseAlert 2s infinite, slideIn 0.4s ease forwards;
        }

        /* Compact Tasks Visualization */
        .tasks-cell {
          display: flex;
          flex-direction: column;
          gap: 3px;
          width: 100%;
          align-items: flex-start;
          justify-content: flex-start;
        }

        .tasks-progress-container {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
        }

        .tasks-progress-bar {
          height: 4px;
          background: var(--glass-card-bg, rgba(255, 255, 255, 0.1));
          border-radius: 2px;
          flex-grow: 1;
          overflow: hidden;
          box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.15);
          position: relative;
        }

        .tasks-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--accent-blue, #3b82f6), var(--accent-purple, #8b5cf6));
          border-radius: 2px;
          transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .tasks-progress-fill::after {
          content: '';
          position: absolute;
          top: 0;
          left: -50%;
          width: 50%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          animation: progressShine 2s infinite;
        }

        @keyframes progressShine {
          0% { left: -50%; }
          100% { left: 100%; }
        }

        .tasks-pending-count {
          font-size: 11px;
          color: var(--text-secondary, rgba(255, 255, 255, 0.7));
          font-weight: 500;
          white-space: nowrap;
          text-align: left;
        }

        /* Compact Location & Compensation */
        .location-cell,
        .compensation-cell {
          display: flex;
          flex-direction: column;
          gap: 2px;
          width: 100%;
          align-items: flex-start;
          justify-content: flex-start;
          text-align: left;
        }

        .comp-value {
          font-weight: 600;
          color: var(--text-primary, #ffffff);
          font-size: 12px;
          padding: 3px 6px;
          background: var(--glass-card-bg, rgba(255, 255, 255, 0.08));
          border-radius: 3px;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.1));
          max-width: fit-content;
          transition: all 0.2s ease;
          letter-spacing: -0.01em;
          text-align: left;
        }

        .table-row:hover .comp-value {
          background: var(--glass-hover-bg, rgba(255, 255, 255, 0.12));
          transform: translateY(-1px);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
        }

        .bonus-value {
          color: var(--success, #22c55e);
          background: rgba(var(--success-rgb, 34, 197, 94), 0.15);
          border-color: rgba(var(--success-rgb, 34, 197, 94), 0.3);
        }

        .remote-indicator {
          color: var(--success, #22c55e);
          font-weight: 600;
          font-size: 10px;
          padding: 2px 4px;
          background: rgba(var(--success-rgb, 34, 197, 94), 0.15);
          border-radius: 2px;
          border: 1px solid rgba(var(--success-rgb, 34, 197, 94), 0.3);
          text-align: left;
        }

        /* Compact Dropdown */
        .stage-dropdown {
          background: var(--glass-card-bg, rgba(20, 20, 20, 0.9));
          border: 1px solid var(--border-active, rgba(255, 255, 255, 0.2));
          border-radius: 6px;
          box-shadow:
            0 10px 25px rgba(0, 0, 0, 0.25),
            0 2px 8px rgba(0, 0, 0, 0.15);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          z-index: 1001;
          animation: dropdownSlideIn 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          min-width: 160px;
          max-height: 200px;
          overflow-y: auto;
          padding: 4px;
        }

        @keyframes dropdownSlideIn {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .stage-option {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          cursor: pointer;
          transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          position: relative;
          margin-bottom: 1px;
          text-align: left;
        }

        .stage-option:hover {
          background: var(--glass-hover-bg, rgba(255, 255, 255, 0.08));
          transform: translateX(2px);
        }

        .stage-option.current {
          background: rgba(var(--accent-blue-rgb, 59, 130, 246), 0.15);
          color: var(--accent-blue, #3b82f6);
          border: 1px solid rgba(var(--accent-blue-rgb, 59, 130, 246), 0.3);
        }

        .stage-option-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
          box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.2);
        }

        .current-badge {
          margin-left: auto;
          font-size: 9px;
          font-weight: 600;
          background: var(--accent-blue, #3b82f6);
          color: white;
          padding: 2px 6px;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }

        /* Responsive Design */
        @media (max-width: 1200px) {
          .table-row {
            grid-template-columns: 40px 1.8fr 2fr 1fr 1.2fr 0.8fr 0 0 0;
            gap: 10px;
            padding: 6px 14px;
          }
        }

        @media (max-width: 992px) {
          .table-row {
            grid-template-columns: 40px 2fr 2fr 1fr 1.2fr 0 0 0 0;
            gap: 8px;
            padding: 6px 12px;
          }
        }

        @media (max-width: 768px) {
          .table-row {
            grid-template-columns: 36px 2fr 2fr 1fr 1fr 0 0 0 0;
            gap: 6px;
            padding: 6px 10px;
            border-radius: 3px;
            min-height: 36px;
          }

          .cell {
            font-size: 12px;
            min-height: 24px;
          }
        }        /* Tooltip styles */
        .company-tooltip h4,
        .position-tooltip h4 {
          margin: 0 0 8px 0;
          color: var(--accent-blue);
          font-size: 15px;
        }

        .company-tooltip p,
        .position-tooltip p {
          margin: 4px 0;
          font-size: 13px;
        }

        .position-tooltip p {
          max-width: 400px;
          white-space: normal;
          line-height: 1.4;
        }

        /* Animation Performance */
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(12px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes pulseAlert {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(var(--success-rgb, 34, 197, 94), 0.4);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(var(--success-rgb, 34, 197, 94), 0);
          }
        }

        /* Accessibility & Performance */
        @media (prefers-reduced-motion: reduce) {
          .table-row,
          .stage-badge,
          .comp-value,
          .alert-item {
            transition: none;
            animation: none;
          }

          .stage-step::before,
          .tasks-progress-fill::after {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
});

ApplicationTableRow.displayName = 'ApplicationTableRow';

export default ApplicationTableRow;
