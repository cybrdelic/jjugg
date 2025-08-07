/**
 * Application Table Row Component
 * Individual row in the applications table with performance optimizations
 */

import React, { forwardRef, useMemo, useCallback } from 'react';
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

  // Memoize expensive computations
  const formatDate = useCallback((date: Date): string =>
    new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date), []);

  const getStageColor = useCallback((stage: ApplicationStage): string => {
    return applicationStage.getColor(stage);
  }, [applicationStage]);

  const getStageBackgroundColor = useCallback((stage: ApplicationStage): string => {
    return applicationStage.getBackgroundColor(stage);
  }, [applicationStage]);

  const getStageLabel = useCallback((stage: ApplicationStage): string =>
    stage.charAt(0).toUpperCase() + stage.slice(1), []);

  const calculateStageProgress = useCallback((stage: ApplicationStage): number => {
    return Math.min(((stagesOrder.indexOf(stage) + 1) / stagesOrder.length) * 100, 100);
  }, [stagesOrder]);

  // Memoize next interview computation
  const nextInterview = useMemo(() => {
    if (!application.interviews) return null;
    const upcoming = application.interviews
      .filter(i => !i.completed && i.date > new Date())
      .sort((a, b) => a.date.getTime() - b.date.getTime());
    return upcoming[0] || null;
  }, [application.interviews]);

  // Memoize pending tasks computation
  const pendingTasks = useMemo(() => {
    if (!application.tasks) return [];
    return application.tasks.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
  }, [application.tasks]);

  // Memoize handlers to prevent re-renders
  const handleSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onSelect(e.target.checked);
  }, [onSelect]);

  const handleCheckboxClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  // Memoize CSS classes for better performance
  const cssClasses = useMemo(() =>
    `table-row ${isSelected ? 'selected' : ''} ${mounted ? 'animate-in' : ''} ${isMobileView ? 'mobile-view' : ''} ${isAutosizeEnabled ? 'autosize' : ''} density-${tableViewDensity} ${inlineEditingId === application.id ? 'editing' : ''}`,
    [isSelected, mounted, isMobileView, isAutosizeEnabled, tableViewDensity, inlineEditingId, application.id]
  );

  // Memoize style object
  const rowStyle = useMemo(() => ({
    animationDelay: `${animationDelay}s`
  }), [animationDelay]);

  return (
    <div
      ref={ref}
      className={cssClasses}
      style={rowStyle}
      onClick={onRowClick}
      onContextMenu={onContextMenu}
    >
      {/* Checkbox */}
      <div className="checkbox-wrapper" onClick={handleCheckboxClick}>
        <input
          type="checkbox"
          className="custom-checkbox"
          checked={isSelected}
          onChange={handleSelect}
          onClick={handleCheckboxClick}
          id={`checkbox-${application.id}`}
        />
        <label htmlFor={`checkbox-${application.id}`} className="checkbox-label" onClick={handleCheckboxClick}></label>
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
            {nextInterview && (
              <div className="alert-item interview-alert">
                <Clock size={14} className="alert-icon" />
                <span>{formatDate(nextInterview.date)}</span>
              </div>
            )}
            {pendingTasks.length > 0 && (
              <div className="alert-item task-alert">
                <CheckSquare size={14} className="alert-icon" />
                <span>{pendingTasks.length} due soon</span>
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
        /* ===================================
           PROFESSIONAL TABLE ROW DESIGN
           Enhanced Visual Quality & Polish
           ===================================== */

        .table-row {
          display: grid;
          grid-template-columns: 36px minmax(140px, 2fr) minmax(180px, 2.5fr) minmax(100px, 1.2fr) minmax(90px, 1.5fr) minmax(70px, 1fr) minmax(70px, 1fr) minmax(70px, 1fr) minmax(60px, 0.8fr);
          gap: var(--space-2);
          align-items: center;
          padding: var(--space-1) var(--space-3);
          background: var(--surface);
          border-bottom: 1px solid var(--border);
          position: relative;
          cursor: pointer;
          transition: all var(--duration-200) cubic-bezier(0.4, 0, 0.2, 1);
          min-height: 32px;
          overflow: hidden;
          isolation: isolate;
        }

        .table-row.autosize {
          grid-template-columns: 36px repeat(8, minmax(80px, auto));
        }

        /* Professional hover and selection states with enhanced visual feedback */
        .table-row {
          transition: all var(--duration-200) cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          isolation: isolate;
        }

        .table-row::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(var(--primary-rgb), 0.04) 50%,
            transparent 100%
          );
          transform: translateX(-100%);
          transition: transform var(--duration-300) cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 0;
        }

        .table-row:hover::before {
          transform: translateX(100%);
        }

        .table-row:hover {
          background: var(--card-hover);
          border-color: var(--border-strong);
          transform: translateY(-1px);
          box-shadow:
            0 2px 8px -2px rgba(0, 0, 0, 0.08),
            0 4px 16px -4px rgba(0, 0, 0, 0.04);
          z-index: 10;
        }

        .table-row:focus-within {
          background: var(--card-hover);
          outline: 2px solid var(--primary);
          outline-offset: -2px;
          transform: translateY(-1px);
          box-shadow:
            0 0 0 4px rgba(var(--primary-rgb), 0.12),
            0 2px 8px -2px rgba(0, 0, 0, 0.08);
          z-index: 15;
        }

        /* Enhanced selection state with premium styling */
        .table-row.selected {
          background: rgba(var(--primary-rgb), 0.06);
          border-color: rgba(var(--primary-rgb), 0.2);
          position: relative;
          z-index: 5;
        }

        .table-row.selected::after {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: linear-gradient(180deg, var(--primary), var(--primary-light));
          border-radius: 0 2px 2px 0;
          box-shadow: 0 0 8px rgba(var(--primary-rgb), 0.3);
        }

        .table-row.selected:hover {
          background: rgba(var(--primary-rgb), 0.08);
          transform: translateY(-1px);
          box-shadow:
            0 2px 12px -2px rgba(var(--primary-rgb), 0.15),
            0 4px 20px -4px rgba(0, 0, 0, 0.06);
          z-index: 20;
        }        /* Enhanced cell design with superior typography and spacing */
        .cell {
          transition: all var(--duration-200) cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          z-index: 1;
        }

        .table-row:hover .cell {
          color: var(--text-primary);
          transform: translateY(0);
        }

        .table-row.selected .cell {
          color: var(--text-primary);
        }

        /* Premium checkbox design with enhanced visual feedback */
        .checkbox-wrapper {
          position: relative;
          width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .checkbox-wrapper input[type="checkbox"] {
          transition: all var(--duration-200) cubic-bezier(0.4, 0, 0.2, 1);
          transform: scale(1);
        }

        .table-row:hover .checkbox-wrapper input[type="checkbox"] {
          transform: scale(1.05);
        }

        .table-row.selected .checkbox-wrapper input[type="checkbox"] {
          transform: scale(1.05);
        }

        /* Density variations with optimized spacing and proportions */
        .table-row.density-compact {
          padding: var(--space-0-5) var(--space-2);
          min-height: 24px;
          grid-template-columns: 32px minmax(120px, 2fr) minmax(160px, 2.5fr) minmax(80px, 1.2fr) minmax(70px, 1.5fr) minmax(60px, 1fr) minmax(60px, 1fr) minmax(60px, 1fr) minmax(50px, 0.8fr);
          gap: var(--space-1);
        }

        .table-row.density-comfortable {
          padding: var(--space-1) var(--space-3);
          grid-template-columns: 36px minmax(140px, 2fr) minmax(180px, 2.5fr) minmax(100px, 1.2fr) minmax(90px, 1.5fr) minmax(70px, 1fr) minmax(70px, 1fr) minmax(70px, 1fr) minmax(60px, 0.8fr);
          gap: var(--space-2);
          min-height: 32px;
        }

        .table-row.density-spacious {
          padding: var(--space-2) var(--space-4);
          grid-template-columns: 44px minmax(160px, 2fr) minmax(200px, 2.5fr) minmax(120px, 1.2fr) minmax(100px, 1.5fr) minmax(80px, 1fr) minmax(80px, 1fr) minmax(80px, 1fr) minmax(70px, 0.8fr);
          gap: var(--space-3);
          min-height: 40px;
        }

        /* Enhanced entry animations with premium feel */
        .table-row.animate-in {
          animation: rowSlideIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        @keyframes rowSlideIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.96);
            filter: blur(2px);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }

        /* Superior cell design with enhanced typography hierarchy */
        .cell {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: var(--space-1);
          font-family: var(--font-interface);
          font-size: var(--text-xs);
          font-weight: var(--font-medium);
          color: var(--text-primary);
          position: relative;
          min-height: 20px;
          padding: 0;
          z-index: 1;
          line-height: var(--leading-tight);
          letter-spacing: var(--tracking-tight);
          text-align: left;
        }

        .cell-icon {
          color: var(--text-tertiary);
          flex-shrink: 0;
          width: 14px;
          height: 14px;
          transition: color var(--duration-200) cubic-bezier(0.4, 0, 0.2, 1);
        }

        .table-row:hover .cell-icon {
          color: var(--text-secondary);
        }

        .cell-value {
          font-weight: var(--font-medium);
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-size: var(--text-xs);
          letter-spacing: var(--tracking-tight);
          text-align: left;
        }

        /* ===================================
           PREMIUM CHECKBOX DESIGN
           Enhanced Accessibility & Visual Polish
           ===================================== */

        .checkbox-wrapper {
          position: relative;
          width: 18px;
          height: 18px;
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
          width: 16px;
          height: 16px;
          background: var(--surface);
          border: 1px solid var(--border-strong);
          border-radius: var(--radius-xs);
          cursor: pointer;
          transition: all var(--duration-200) cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        .checkbox-label:hover {
          border-color: var(--primary);
          transform: scale(1.05);
          box-shadow:
            0 0 0 4px rgba(var(--primary-rgb), 0.12),
            0 2px 4px rgba(0, 0, 0, 0.08);
        }

        .checkbox-label::after {
          content: '';
          width: 8px;
          height: 4px;
          border: 1px solid transparent;
          border-top: none;
          border-right: none;
          transform: rotate(-45deg) scale(0);
          transition: transform var(--duration-200) cubic-bezier(0.34, 1.56, 0.64, 1);
          margin-top: -1px;
        }

        .custom-checkbox:checked + .checkbox-label {
          background: var(--primary);
          border-color: var(--primary);
          box-shadow:
            0 0 0 4px rgba(var(--primary-rgb), 0.12),
            0 2px 8px rgba(var(--primary-rgb), 0.2);
        }

        .custom-checkbox:checked + .checkbox-label::after {
          border-color: white;
          transform: rotate(-45deg) scale(1);
        }

        .custom-checkbox:focus + .checkbox-label {
          outline: 2px solid var(--primary);
          outline-offset: 2px;
        }

        /* ===================================
           PREMIUM CELL STYLING
           Enhanced Content Layout & Typography
           ===================================== */

        .cell {
          padding: 0;
          color: var(--text-primary);
          font-family: var(--font-interface);
          font-size: var(--text-xs);
          font-weight: var(--font-medium);
          line-height: var(--leading-tight);
          letter-spacing: var(--tracking-tight);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          transition: all var(--duration-200) cubic-bezier(0.4, 0, 0.2, 1);
        }

        .cell:first-child {
          padding-left: 0;
        }

        .cell:last-child {
          padding-right: 0;
        }

        /* Enhanced company cell with premium typography */
        .company-cell {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: var(--space-1);
          min-width: 0;
        }

        .company-info {
          min-width: 0;
          flex: 1;
          text-align: left;
        }

        .company-name {
          font-family: var(--font-interface);
          font-weight: var(--font-semibold);
          color: var(--text-primary);
          font-size: var(--text-xs);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          letter-spacing: var(--tracking-tight);
          line-height: var(--leading-tight);
          text-align: left;
        }

        /* Enhanced position cell with improved hierarchy */
        .position-cell {
          display: flex;
          flex-direction: column;
          gap: 0;
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
          font-family: var(--font-interface);
          font-weight: var(--font-semibold);
          color: var(--text-primary);
          font-size: var(--text-xs);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          letter-spacing: var(--tracking-tight);
          line-height: var(--leading-tight);
          text-align: left;
        }

        .position-description {
          font-family: var(--font-body);
          font-size: 10px;
          font-weight: var(--font-normal);
          color: var(--text-secondary);
          line-height: var(--leading-tight);
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
          max-height: 14px;
          text-align: left;
        }

        /* ===================================
           PREMIUM STAGE BADGE DESIGN
           Enhanced Visual Hierarchy & Interaction
           ===================================== */

        .stage-container {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: var(--space-1);
          width: 100%;
          cursor: pointer;
          position: relative;
          text-align: left;
        }

        .stage-badge {
          display: inline-flex;
          align-items: center;
          gap: var(--space-1);
          padding: 2px var(--space-2);
          border-radius: var(--radius-sm);
          font-family: var(--font-interface);
          font-size: 10px;
          font-weight: var(--font-semibold);
          text-transform: capitalize;
          letter-spacing: var(--tracking-wide);
          transition: all var(--duration-200) cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid var(--border-strong);
          white-space: nowrap;
          flex-shrink: 0;
          background: var(--surface);
          color: var(--text-secondary);
          position: relative;
          overflow: hidden;
          text-align: left;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        .stage-badge.clickable:hover {
          background: var(--card-hover);
          border-color: var(--border-strong);
          color: var(--text-primary);
          transform: translateY(-1px);
          box-shadow:
            0 2px 8px -2px rgba(0, 0, 0, 0.1),
            0 4px 16px -4px rgba(0, 0, 0, 0.06);
        }

        .stage-indicator {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
          box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.2);
          transition: all var(--duration-200) cubic-bezier(0.4, 0, 0.2, 1);
        }

        .stage-label {
          font-weight: var(--font-semibold);
          position: relative;
          z-index: 1;
          text-align: left;
        }        /* Enhanced progress visualization with premium animations */
        .stage-progress-container {
          flex: 1;
          min-width: 60px;
          max-width: 80px;
        }

        .stage-progress-background {
          width: 100%;
          height: 4px;
          border-radius: var(--radius-full);
          background: var(--surface);
          overflow: hidden;
          position: relative;
          display: flex;
          gap: 1px;
          box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
          border: 1px solid var(--border);
        }

        .stage-step {
          flex: 1;
          height: 100%;
          border-radius: var(--radius-xs);
          transition: all var(--duration-300) cubic-bezier(0.34, 1.56, 0.64, 1);
          min-width: 6px;
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
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transition: left var(--duration-500) cubic-bezier(0.4, 0, 0.2, 1);
        }

        .stage-step.completed {
          opacity: 1;
          box-shadow: 0 0 6px rgba(var(--primary-rgb), 0.4);
        }

        .stage-step.completed::before {
          left: 100%;
        }

        .stage-step:not(.completed) {
          opacity: 0.25;
        }

        /* Enhanced alert system with premium styling */
        .alerts-cell {
          display: flex;
          flex-direction: column;
          gap: 1px;
          width: 100%;
          align-items: flex-start;
          justify-content: flex-start;
        }

        .alert-item {
          display: flex;
          align-items: center;
          gap: var(--space-1);
          padding: 1px var(--space-1);
          border-radius: var(--radius-xs);
          font-family: var(--font-interface);
          font-size: 10px;
          font-weight: var(--font-semibold);
          margin-bottom: 1px;
          transition: all var(--duration-200) cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid transparent;
          animation: slideIn var(--duration-300) cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          text-align: left;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        .alert-icon {
          flex-shrink: 0;
          width: 10px;
          height: 10px;
        }

        .interview-alert {
          background: rgba(var(--info-rgb, 59, 130, 246), 0.12);
          color: var(--info, #3b82f6);
          border-color: rgba(var(--info-rgb, 59, 130, 246), 0.25);
        }

        .task-alert {
          background: rgba(var(--error-rgb, 239, 68, 68), 0.12);
          color: var(--error, #ef4444);
          border-color: rgba(var(--error-rgb, 239, 68, 68), 0.25);
        }

        .offer-alert {
          background: rgba(var(--success-rgb, 34, 197, 94), 0.12);
          color: var(--success, #22c55e);
          border-color: rgba(var(--success-rgb, 34, 197, 94), 0.25);
          animation: pulseAlert 2.5s infinite, slideIn var(--duration-400) cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        /* Enhanced tasks visualization with premium progress indicators */
        .tasks-cell {
          display: flex;
          flex-direction: column;
          gap: 1px;
          width: 100%;
          align-items: flex-start;
          justify-content: flex-start;
        }

        .tasks-count-container {
          display: flex;
          align-items: center;
          gap: var(--space-1);
          margin-bottom: 1px;
        }

        .tasks-progress-container {
          display: flex;
          align-items: center;
          gap: var(--space-1);
          width: 100%;
        }

        .tasks-progress-bar {
          height: 4px;
          background: var(--surface);
          border-radius: var(--radius-full);
          flex-grow: 1;
          overflow: hidden;
          box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
          position: relative;
          border: 1px solid var(--border);
        }

        .tasks-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--primary), var(--primary-light));
          border-radius: var(--radius-full);
          transition: width var(--duration-500) cubic-bezier(0.34, 1.56, 0.64, 1);
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
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          animation: progressShine 2.5s infinite;
        }

        @keyframes progressShine {
          0% { left: -50%; }
          100% { left: 100%; }
        }

        .tasks-pending-count {
          font-family: var(--font-interface);
          font-size: 10px;
          font-weight: var(--font-medium);
          color: var(--text-secondary);
          white-space: nowrap;
          text-align: left;
        }

        /* Enhanced location and compensation styling with premium badges */
        .location-cell,
        .compensation-cell {
          display: flex;
          flex-direction: column;
          gap: 1px;
          width: 100%;
          align-items: flex-start;
          justify-content: flex-start;
          text-align: left;
        }

        .location-info {
          display: flex;
          align-items: center;
          gap: var(--space-1);
          flex-wrap: wrap;
        }

        .comp-value {
          font-family: var(--font-interface);
          font-weight: var(--font-semibold);
          color: var(--text-primary);
          font-size: 10px;
          padding: 1px var(--space-1);
          background: var(--surface);
          border-radius: var(--radius-xs);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid var(--border);
          max-width: fit-content;
          transition: all var(--duration-200) cubic-bezier(0.4, 0, 0.2, 1);
          letter-spacing: var(--tracking-tight);
          text-align: left;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        .table-row:hover .comp-value {
          background: var(--card-hover);
          transform: translateY(-1px);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
        }

        .bonus-value {
          color: var(--success);
          background: rgba(var(--success-rgb, 34, 197, 94), 0.12);
          border-color: rgba(var(--success-rgb, 34, 197, 94), 0.25);
        }

        .remote-indicator {
          color: var(--success);
          font-family: var(--font-interface);
          font-weight: var(--font-semibold);
          font-size: 10px;
          padding: 1px var(--space-1);
          background: rgba(var(--success-rgb, 34, 197, 94), 0.12);
          border-radius: var(--radius-xs);
          border: 1px solid rgba(var(--success-rgb, 34, 197, 94), 0.25);
          text-align: left;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        /* Premium dropdown design with enhanced visual hierarchy */
        .stage-dropdown {
          background: var(--surface);
          border: 1px solid var(--border-strong);
          border-radius: var(--radius-lg);
          box-shadow:
            0 10px 38px -10px rgba(0, 0, 0, 0.35),
            0 10px 20px -15px rgba(0, 0, 0, 0.2);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          z-index: 1001;
          animation: dropdownSlideIn var(--duration-300) cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          min-width: 180px;
          max-height: 240px;
          overflow-y: auto;
          padding: var(--space-2);
        }

        @keyframes dropdownSlideIn {
          from {
            opacity: 0;
            transform: translateY(-12px) scale(0.94);
            filter: blur(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }

        .stage-option {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          cursor: pointer;
          transition: all var(--duration-200) cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: var(--radius-md);
          font-family: var(--font-interface);
          font-size: var(--text-sm);
          font-weight: var(--font-medium);
          position: relative;
          margin-bottom: var(--space-1);
          text-align: left;
        }

        .stage-option:hover {
          background: var(--card-hover);
          transform: translateX(4px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .stage-option.current {
          background: rgba(var(--primary-rgb), 0.12);
          color: var(--primary);
          border: 1px solid rgba(var(--primary-rgb), 0.25);
          box-shadow: 0 0 0 1px rgba(var(--primary-rgb), 0.12);
        }

        .stage-option-indicator {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          flex-shrink: 0;
          box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.2);
          transition: all var(--duration-200) cubic-bezier(0.4, 0, 0.2, 1);
        }

        .current-badge {
          margin-left: auto;
          font-family: var(--font-interface);
          font-size: var(--text-xs);
          font-weight: var(--font-bold);
          background: var(--primary);
          color: white;
          padding: var(--space-1) var(--space-2);
          border-radius: var(--radius-full);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }

        /* ===================================
           ENHANCED RESPONSIVE DESIGN
           Mobile-First with Better Breakpoints
           ===================================== */

        @media (max-width: 1400px) {
          .table-row {
            grid-template-columns: 32px minmax(120px, 2fr) minmax(160px, 2.5fr) minmax(90px, 1fr) minmax(80px, 1.2fr) minmax(70px, 1fr) minmax(80px, 1.5fr) minmax(70px, 1.2fr) 0;
            gap: var(--space-1);
          }
        }

        @media (max-width: 1200px) {
          .table-row {
            grid-template-columns: 32px minmax(110px, 1.8fr) minmax(140px, 2fr) minmax(80px, 1fr) minmax(80px, 1.2fr) minmax(60px, 0.8fr) 0 0 0;
            gap: var(--space-1);
            padding: var(--space-1) var(--space-2);
          }
        }

        @media (max-width: 992px) {
          .table-row {
            grid-template-columns: 28px minmax(100px, 2fr) minmax(120px, 2fr) minmax(70px, 1fr) minmax(70px, 1.2fr) 0 0 0 0;
            gap: var(--space-1);
            padding: var(--space-1) var(--space-2);
          }
        }

        @media (max-width: 768px) {
          .table-row {
            grid-template-columns: 24px minmax(80px, 2fr) minmax(100px, 2fr) minmax(60px, 1fr) minmax(60px, 1fr) 0 0 0 0;
            gap: var(--space-1);
            padding: var(--space-0-5) var(--space-2);
            min-height: 28px;
          }

          .cell {
            font-size: 10px;
            line-height: var(--leading-tight);
          }

          .checkbox-wrapper {
            width: 16px;
            height: 16px;
          }

          .checkbox-label {
            width: 14px;
            height: 14px;
          }
        }        /* Enhanced tooltip styles with premium typography */
        .company-tooltip h4,
        .position-tooltip h4 {
          margin: 0 0 var(--space-2) 0;
          color: var(--primary);
          font-family: var(--font-interface);
          font-size: var(--text-base);
          font-weight: var(--font-semibold);
        }

        .company-tooltip p,
        .position-tooltip p {
          margin: var(--space-1) 0;
          font-family: var(--font-body);
          font-size: var(--text-sm);
          line-height: var(--leading-relaxed);
        }

        .position-tooltip p {
          max-width: 420px;
          white-space: normal;
          line-height: var(--leading-relaxed);
        }

        /* Enhanced animation performance and accessibility */
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(16px);
            filter: blur(2px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
            filter: blur(0);
          }
        }

        @keyframes pulseAlert {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(var(--success-rgb, 34, 197, 94), 0.5);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(var(--success-rgb, 34, 197, 94), 0);
          }
        }

        /* Accessibility and performance optimizations */
        @media (prefers-reduced-motion: reduce) {
          .table-row,
          .stage-badge,
          .comp-value,
          .alert-item,
          .checkbox-label,
          .stage-option {
            transition: none;
            animation: none;
          }

          .stage-step::before,
          .tasks-progress-fill::after {
            animation: none;
          }

          .table-row::before {
            display: none;
          }
        }

        /* Enhanced focus states for better accessibility */
        .table-row:focus-visible {
          outline: 3px solid var(--primary);
          outline-offset: 2px;
        }

        .stage-badge:focus-visible,
        .comp-value:focus-visible {
          outline: 2px solid var(--primary);
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
});

ApplicationTableRow.displayName = 'ApplicationTableRow';

export default ApplicationTableRow;
