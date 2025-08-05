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
      <div className="checkbox-wrapper">
        <input
          type="checkbox"
          className="custom-checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            onSelect(e.target.checked);
          }}
          id={`checkbox-${application.id}`}
        />
        <label htmlFor={`checkbox-${application.id}`} className="checkbox-label"></label>
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
              {application.company.logo ? (
                <img
                  src={application.company.logo}
                  alt={application.company.name}
                  className="company-logo"
                />
              ) : (
                <div
                  className="company-logo-placeholder"
                  style={{ backgroundColor: `hsl(${application.company.name.charCodeAt(0) * 7}, 70%, 50%)` }}
                >
                  {application.company.name.charAt(0).toUpperCase()}
                </div>
              )}
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
        .table-row {
          display: grid;
          grid-template-columns: 40px 1.8fr 2.2fr 1fr 1.5fr 0.8fr 1.2fr 1fr 1fr;
          align-items: center;
          justify-items: start;
          padding: 8px 16px;
          border-bottom: 1px solid var(--border);
          background: var(--surface);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          cursor: pointer;
          min-height: 44px;
          gap: 0;
        }

        /* Density Variations */
        .table-row.density-compact {
          padding: 6px 12px;
          min-height: 36px;
        }

        .table-row.density-comfortable {
          padding: 8px 16px;
          min-height: 44px;
        }

        .table-row.density-spacious {
          padding: 12px 20px;
          min-height: 52px;
        }



        .table-row.autosize {
          grid-template-columns: 40px auto auto auto auto auto auto auto auto;
        }

        @media (max-width: 1400px) {
          .table-row {
            grid-template-columns: 40px 2fr 2.5fr 1fr 1.2fr 1fr 1.5fr 1.2fr 0;
          }
        }

        @media (max-width: 1200px) {
          .table-row {
            grid-template-columns: 40px 2fr 2fr 1fr 1.2fr 1fr 1.5fr 0 0;
          }
        }

        @media (max-width: 992px) {
          .table-row {
            grid-template-columns: 40px 2fr 2fr 1fr 1.2fr 0 0 0 0;
          }
        }

        @media (max-width: 768px) {
          .table-row {
            grid-template-columns: 40px 2fr 2fr 1fr 1.2fr 0 0 0 0;
          }
        }

        .table-row::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          width: 4px;
          height: 100%;
          background: transparent;
          transition: background 0.2s ease;
        }

        .table-row:hover {
          background: var(--hover);
          border-left: 4px solid var(--primary);
          padding-left: 20px;
          transform: translateX(2px);
          box-shadow: var(--shadow-medium);
        }

        .table-row:hover::before {
          background: var(--primary);
        }

        .table-row.selected {
          background: var(--selected);
          border-left: 4px solid var(--primary);
          padding-left: 20px;
        }

        .table-row.selected::before {
          background: var(--primary);
        }

        .table-row.animate-in {
          animation: rowSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        @keyframes rowSlideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .cell {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--text-primary);
          position: relative;
          min-height: 32px;
          padding: 4px 0;
          justify-content: flex-start;
          text-align: left;
          width: 100%;
          margin: 0;
        }

        .cell-icon {
          color: var(--text-tertiary);
          flex-shrink: 0;
          width: 16px;
          height: 16px;
        }

        .cell-value {
          font-weight: 500;
          color: var(--text-primary);
          text-align: left;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
          font-size: 12px;
        }

        .checkbox-wrapper {
          position: relative;
          width: 20px;
          height: 20px;
          margin-right: 12px;
        }

        .custom-checkbox {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
        }

        .checkbox-label {
          position: absolute;
          top: 0;
          left: 0;
          width: 20px;
          height: 20px;
          background: var(--surface);
          border: 2px solid var(--border);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .custom-checkbox:checked + .checkbox-label {
          background: var(--primary);
          border-color: var(--primary);
        }

        .custom-checkbox:checked + .checkbox-label::after {
          content: '✓';
          color: var(--text-inverse, white);
          font-weight: bold;
          font-size: 12px;
        }

        .company-cell {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
          justify-content: flex-start;
          width: 100%;
        }

        .company-logo {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          object-fit: cover;
          border: 1px solid var(--border);
          flex-shrink: 0;
        }

        .company-logo-placeholder {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-inverse, white);
          font-weight: 700;
          font-size: 14px;
          flex-shrink: 0;
        }

        .company-name {
          font-weight: 600;
          color: var(--text-primary);
          font-size: 12px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          text-align: left;
          margin: 0;
          padding: 0;
        }

        .position-cell {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
          align-items: flex-start;
          width: 100%;
          text-align: left;
        }

        .position-title {
          font-weight: 600;
          color: var(--text-primary);
          font-size: 12px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          text-align: left;
          width: 100%;
          display: block;
        }

        .position-description {
          font-size: 10px;
          color: var(--text-secondary);
          line-height: 1.3;
          text-overflow: ellipsis;
          max-height: 28px;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          text-align: left;
          width: 100%;
        }

        .stage-container {
          display: flex;
          align-items: center;
          gap: 6px;
          width: 100%;
          min-height: 24px;
          justify-content: flex-start;
          margin: 0;
          padding: 0;
          position: relative;
          cursor: pointer;
        }

        .stage-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border-radius: 16px;
          font-size: 11px;
          font-weight: 600;
          text-transform: capitalize;
          transition: all 0.2s ease;
          border: 1px solid transparent;
          max-width: fit-content;
          white-space: nowrap;
          flex-shrink: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          background: rgba(var(--primary-rgb), 0.08);
          color: var(--primary);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }

        .stage-badge.clickable:hover {
          transform: translateY(-1px) scale(1.02);
          box-shadow: var(--shadow-medium);
          background: rgba(var(--primary-rgb), 0.12);
        }

        .stage-indicator {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          flex-shrink: 0;
          background: currentColor;
        }

        .stage-label {
          font-weight: 600;
          color: inherit;
        }

        .stage-progress-container {
          flex: 1;
          min-width: 60px;
          max-width: 120px;
        }

        .stage-progress-background {
          width: 100%;
          height: 3px;
          border-radius: 2px;
          background: var(--surface);
          overflow: hidden;
          position: relative;
          display: flex;
          gap: 1px;
        }

        .stage-step {
          flex: 1;
          height: 100%;
          border-radius: 1px;
          transition: background-color 0.3s ease;
          min-width: 8px;
        }

        .stage-step.completed {
          opacity: 1;
        }

        .stage-step:not(.completed) {
          opacity: 0.3;
        }

        .alerts-cell {
          display: flex;
          flex-direction: column;
          gap: 2px;
          width: 100%;
          justify-content: center;
        }

        .alert-item {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 5px 10px;
          border-radius: 6px;
          font-size: 12px;
          max-width: 100%;
          margin-bottom: 4px;
          transition: all 0.2s ease;
          box-shadow: var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05));
          animation: slideIn 0.3s ease;
        }

        .alert-icon {
          flex-shrink: 0;
        }

        .interview-alert {
          background: var(--info-light);
          color: var(--info);
          border-left: 2px solid var(--info);
        }

        .task-alert {
          background: var(--error-light);
          color: var(--error);
          border-left: 2px solid var(--error);
        }

        .offer-alert {
          background: var(--success-light);
          color: var(--success);
          font-weight: 600;
          border-left: 2px solid var(--success);
          animation: pulseAlert 2s infinite;
        }

        .tasks-cell {
          display: flex;
          flex-direction: column;
          gap: 2px;
          width: 100%;
          justify-content: center;
        }

        .tasks-count-container {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .tasks-progress-container {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
        }

        .tasks-progress-bar {
          height: 6px;
          background: var(--glass-bg);
          border-radius: 3px;
          flex-grow: 1;
          overflow: hidden;
          border: 1px solid var(--border);
        }

        .tasks-progress-fill {
          height: 100%;
          transition: width 0.3s ease;
        }

        .tasks-pending-count {
          font-size: 11px;
          color: var(--text-secondary);
          white-space: nowrap;
        }

        .location-cell {
          display: flex;
          flex-direction: column;
          gap: 4px;
          width: 100%;
        }

        .location-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .remote-indicator {
          color: var(--success);
          margin-left: 6px;
          font-weight: 500;
          font-size: 13px;
        }

        .compensation-cell {
          display: flex;
          flex-direction: column;
          width: 100%;
          gap: 2px;
        }

        .comp-value {
          font-weight: 600;
          color: var(--text-primary);
          font-size: 12px;
          padding: 3px 6px;
          background: rgba(var(--info-rgb), 0.075);
          border-radius: 4px;
          max-width: fit-content;
          transition: all 0.2s ease;
        }

        .table-row:hover .comp-value {
          background: var(--info-light);
        }

        .bonus-value {
          color: var(--success);
          background: var(--success-light);
        }

        .table-row:hover .bonus-value {
          background: var(--success-light);
        }

        .no-comp {
          font-size: 12px;
          color: var(--text-tertiary);
          font-style: italic;
        }

        /* Stage dropdown styles */
        .stage-dropdown {
          background: var(--glass-bg);
          border: 1px solid var(--border);
          border-radius: 8px;
          box-shadow: var(--shadow-lg, 0 8px 24px rgba(0, 0, 0, 0.1));
          z-index: 1001;
          animation: dropdownSlideIn 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(var(--blur-amount, 20px));
          -webkit-backdrop-filter: blur(var(--blur-amount, 20px));
          min-width: 160px;
          max-height: 200px;
          overflow-y: auto;
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
          transition: all 0.2s ease;
          border-radius: 4px;
          margin: 2px;
          font-size: 12px;
          position: relative;
        }

        .stage-option:hover {
          background: var(--hover-bg);
        }

        .stage-option.current {
          background: rgba(var(--primary-rgb), 0.1);
          color: var(--primary);
        }

        .stage-option-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .current-badge {
          margin-left: auto;
          font-size: 10px;
          color: var(--primary);
          font-weight: 600;
          background: rgba(var(--primary-rgb), 0.1);
          padding: 2px 6px;
          border-radius: 10px;
        }

        /* Tooltip styles */
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

        @keyframes slideIn {
          from { opacity: 0; transform: translateX(10px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes pulseAlert {
          0% { box-shadow: 0 0 0 0 rgba(var(--accent-green-rgb), 0.2); }
          70% { box-shadow: 0 0 0 5px rgba(var(--accent-green-rgb), 0); }
          100% { box-shadow: 0 0 0 0 rgba(var(--accent-green-rgb), 0); }
        }
      `}</style>
    </div>
  );
});

ApplicationTableRow.displayName = 'ApplicationTableRow';

export default ApplicationTableRow;
