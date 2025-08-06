/**
 * Applications Controls Component
 * Manages view modes, filters, and table controls
 */

import React, { useState, useEffect } from 'react';
import {
  Grid3x3, ListFilter, Calendar, TrendingUp, ChevronDown, Filter
} from 'lucide-react';
import Tooltip from '../../Tooltip';
import { ApplicationStage, Application } from '@/types';
import { QuickActions } from './QuickActions';

interface ApplicationsControlsProps {
  // View state
  viewMode: 'table' | 'kanban';
  isMobileView: boolean;
  isAutosizeEnabled: boolean;
  tableViewDensity: 'compact' | 'comfortable' | 'spacious';
  showAdvancedFilters: boolean;
  isColumnMenuOpen: boolean;

  // Filters
  quickFilters: {
    stage: ApplicationStage | 'all',
    dateRange: '7d' | '30d' | '90d' | 'all',
    salary: 'with' | 'without' | 'all'
  };
  visibleColumns: string[];

  // Selection state
  selectedRows: string[];
  selectedApplications: Application[];

  // Handlers
  onViewModeChange: (mode: 'table' | 'kanban') => void;
  onMobileViewToggle: () => void;
  onAutosizeToggle: () => void;
  onDensityChange: (density: 'compact' | 'comfortable' | 'spacious') => void;
  onQuickFiltersChange: (filters: Partial<ApplicationsControlsProps['quickFilters']>) => void;
  onAdvancedFiltersToggle: () => void;
  onColumnMenuToggle: () => void;
  onVisibleColumnsChange: (columns: string[]) => void;
  onClearSelection: () => void;
  onBulkDelete: () => Promise<void>;
  onBulkStageChange: (appIds: string[], newStage: ApplicationStage) => Promise<void>;
  onExport: () => Promise<void>;
  onBulkEdit: (appIds: string[]) => void;
}

export function ApplicationsControls({
  viewMode,
  isMobileView,
  isAutosizeEnabled,
  tableViewDensity,
  showAdvancedFilters,
  isColumnMenuOpen,
  quickFilters,
  visibleColumns,
  selectedRows,
  selectedApplications,
  onViewModeChange,
  onMobileViewToggle,
  onAutosizeToggle,
  onDensityChange,
  onQuickFiltersChange,
  onAdvancedFiltersToggle,
  onColumnMenuToggle,
  onVisibleColumnsChange,
  onClearSelection,
  onBulkDelete,
  onBulkStageChange,
  onExport,
  onBulkEdit
}: ApplicationsControlsProps) {
  const [stageDropdownOpen, setStageDropdownOpen] = useState(false);
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);

  const getStageDisplayText = (stage: ApplicationStage | 'all') => {
    switch (stage) {
      case 'all': return 'All Stages';
      case 'applied': return 'Applied';
      case 'screening': return 'Screening';
      case 'interview': return 'Interview';
      case 'offer': return 'Offer';
      case 'rejected': return 'Rejected';
      default: return 'All Stages';
    }
  };

  const getDateDisplayText = (range: '7d' | '30d' | '90d' | 'all') => {
    switch (range) {
      case 'all': return 'All Time';
      case '7d': return 'Last 7 days';
      case '30d': return 'Last 30 days';
      case '90d': return 'Last 90 days';
      default: return 'All Time';
    }
  };

  const getStageColor = (stage: ApplicationStage | 'all') => {
    switch (stage) {
      case 'applied': return 'var(--info)';
      case 'screening': return 'var(--warning)';
      case 'interview': return 'var(--primary)';
      case 'offer': return 'var(--success)';
      case 'rejected': return 'var(--error)';
      default: return 'var(--text-secondary)';
    }
  };

  return (
    <div className="controls-container">
      <div className="controls-main">
        {/* Left side controls */}
        <div className="controls-left">
          {/* View Mode Toggle - Refined with Micro-interactions */}
          <div className="control-section view-section">
            <span className="section-label">View</span>
            <div className="toggle-wrapper">
              <div className="toggle-button" onClick={() => {
                const slider = document.querySelector('.toggle-slider') as HTMLElement;
                const currentActive = document.querySelector('.toggle-option.active');

                // Add icon animation to current active
                currentActive?.classList.add('switching');

                // Smooth slider transition
                slider?.classList.add('moving');
                setTimeout(() => {
                  slider?.classList.remove('moving');
                }, 500);

                // Clean up icon animation
                setTimeout(() => {
                  currentActive?.classList.remove('switching');
                }, 400);

                // Change view mode
                const newMode = viewMode === 'table' ? 'kanban' : 'table';
                onViewModeChange(newMode);
              }}>
                <Tooltip content="Table View - Detailed list with sortable columns" placement="bottom">
                  <div className={`toggle-option table ${viewMode === 'table' ? 'active' : ''}`}>
                    <ListFilter size={18} />
                  </div>
                </Tooltip>
                <Tooltip content="Kanban View - Visual board organized by stages" placement="bottom">
                  <div className={`toggle-option kanban ${viewMode === 'kanban' ? 'active' : ''}`}>
                    <Grid3x3 size={18} />
                  </div>
                </Tooltip>
                <div className={`toggle-slider ${viewMode === 'kanban' ? 'kanban' : ''}`}></div>
              </div>
            </div>
          </div>

          {/* Filters Section - Enhanced */}
          <div className="control-section filters-section">
            <span className="section-label">
              <Filter size={14} />
              Filters
            </span>

            {/* Stage Filter */}
            <div className="filter-dropdown-container">
              <button
                className={`filter-dropdown ${stageDropdownOpen ? 'open' : ''}`}
                onClick={() => setStageDropdownOpen(!stageDropdownOpen)}
              >
                <div className="filter-content">
                  <TrendingUp size={14} />
                  <span className="filter-label">Stage:</span>
                  <span
                    className="filter-value"
                    style={{ color: getStageColor(quickFilters.stage) }}
                  >
                    {getStageDisplayText(quickFilters.stage)}
                  </span>
                </div>
                <ChevronDown size={14} className={`chevron ${stageDropdownOpen ? 'rotated' : ''}`} />
              </button>

              {stageDropdownOpen && (
                <div className="dropdown-menu stage-dropdown">
                  {(['all', 'applied', 'screening', 'interview', 'offer', 'rejected'] as const).map((stage) => (
                    <button
                      key={stage}
                      className={`dropdown-item ${quickFilters.stage === stage ? 'selected' : ''}`}
                      onClick={() => {
                        onQuickFiltersChange({ stage });
                        setStageDropdownOpen(false);
                      }}
                    >
                      <div
                        className="stage-indicator"
                        style={{ backgroundColor: getStageColor(stage) }}
                      />
                      <span>{getStageDisplayText(stage)}</span>
                      {quickFilters.stage === stage && <div className="checkmark">✓</div>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Date Range Filter */}
            <div className="filter-dropdown-container">
              <button
                className={`filter-dropdown ${dateDropdownOpen ? 'open' : ''}`}
                onClick={() => setDateDropdownOpen(!dateDropdownOpen)}
              >
                <div className="filter-content">
                  <Calendar size={14} />
                  <span className="filter-label">Period:</span>
                  <span className="filter-value">
                    {getDateDisplayText(quickFilters.dateRange)}
                  </span>
                </div>
                <ChevronDown size={14} className={`chevron ${dateDropdownOpen ? 'rotated' : ''}`} />
              </button>

              {dateDropdownOpen && (
                <div className="dropdown-menu date-dropdown">
                  {(['all', '7d', '30d', '90d'] as const).map((range) => (
                    <button
                      key={range}
                      className={`dropdown-item ${quickFilters.dateRange === range ? 'selected' : ''}`}
                      onClick={() => {
                        onQuickFiltersChange({ dateRange: range });
                        setDateDropdownOpen(false);
                      }}
                    >
                      <Calendar size={12} className="item-icon" />
                      <span>{getDateDisplayText(range)}</span>
                      {quickFilters.dateRange === range && <div className="checkmark">✓</div>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right side - Quick Actions inline with controls */}
          <div className="controls-right">
            <div className={`quick-actions-inline ${selectedRows.length > 0 ? 'visible' : 'hidden'}`}>
              <QuickActions
                selectedApplications={selectedApplications}
                selectedIds={selectedRows}
                onStageChange={onBulkStageChange}
                onBulkDelete={onBulkDelete}
                onExport={onExport}
                onClearSelection={onClearSelection}
                onBulkEdit={onBulkEdit}
              />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .controls-container {
          display: flex;
          flex-direction: column;
          gap: 0;
          margin-bottom: 16px;
        }

        .controls-main {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 12px 16px;
        }

        .controls-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .controls-right {
          display: flex;
          align-items: center;
          min-width: 0;
          flex-shrink: 0;
        }

        /* Inline quick actions - no layout shift */
        .quick-actions-inline {
          transition: all var(--duration-300) var(--ease-out);
          transform-origin: right center;
          overflow: hidden;
        }

        .quick-actions-inline.hidden {
          opacity: 0;
          transform: scale(0.8);
          width: 0;
          pointer-events: none;
        }

        .quick-actions-inline.visible {
          opacity: 1;
          transform: scale(1);
          width: auto;
          pointer-events: all;
        }

        .control-section {
          display: flex;
          align-items: center;
          gap: 8px;
          position: relative;
        }

        .control-section:not(:last-child)::after {
          content: '';
          position: absolute;
          right: -8px;
          top: 50%;
          transform: translateY(-50%);
          width: 1px;
          height: 20px;
          background: var(--border);
        }

        .section-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: flex;
          align-items: center;
          gap: 4px;
          min-width: fit-content;
        }

        .view-section {
          min-width: fit-content;
        }

        /* Modern Glass Toggle - Matches Theme */
        .toggle-wrapper {
          position: relative;
          background: var(--glass-bg);
          backdrop-filter: blur(var(--blur-amount));
          -webkit-backdrop-filter: blur(var(--blur-amount));
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 3px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: var(--shadow-sm);
          overflow: hidden;
        }

        /* Liquid surface tension effect */
        .toggle-wrapper::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at var(--mouse-x, 50%) var(--mouse-y, 50%),
            rgba(var(--primary-rgb), 0.05) 0%,
            transparent 50%
          );
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }

        .toggle-wrapper:hover::before {
          opacity: 1;
        }

        .toggle-wrapper:hover {
          border-color: var(--border-hover);
          transform: translateY(-1px);
          box-shadow: var(--shadow-md);
        }

        .toggle-button {
          display: flex;
          position: relative;
          width: 100px;
          height: 38px;
          cursor: pointer;
          overflow: visible;
        }

        .toggle-option {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 1;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          color: var(--text-secondary);
          opacity: 0.7;
          transform: scale(0.95);
        }

        .toggle-option::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          background: radial-gradient(ellipse at center,
            rgba(var(--primary-rgb), 0.3) 0%,
            rgba(var(--primary-rgb), 0.1) 40%,
            transparent 70%
          );
          border-radius: 50%;
          transform: translate(-50%, -50%);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          opacity: 0;
          pointer-events: none;
          filter: blur(10px);
        }

        .toggle-option:hover::before {
          width: 40px;
          height: 40px;
          opacity: 0.3;
          animation: magnetic-pulse 2s ease-in-out infinite;
        }

        @keyframes magnetic-pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.1); }
        }

        .toggle-option.active {
          color: var(--text-primary);
          font-weight: 500;
          z-index: 10;
          opacity: 1;
          transform: scale(1);
        }

        .toggle-option svg {
          width: 16px;
          height: 16px;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .toggle-option:hover:not(.active) {
          color: var(--text-secondary);
          opacity: 0.85;
          transform: scale(0.97);
        }

        .toggle-option:hover:not(.active) svg {
          transform: scale(1.1);
        }

        .toggle-option.active svg {
          transform: scale(1.05);
        }

        .toggle-slider {
          position: absolute;
          top: 3px;
          left: 3px;
          width: calc(50% - 3px);
          height: calc(100% - 6px);
          background: var(--surface);
          border-radius: 9px;
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 2;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(var(--border-rgb), 0.5);
          overflow: hidden;
        }

        /* Liquid shine effect */
        .toggle-slider::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle at 30% 30%,
            rgba(255, 255, 255, 0.3) 0%,
            rgba(255, 255, 255, 0.1) 20%,
            transparent 40%
          );
          transform: rotate(-45deg);
          transition: all 0.6s ease;
          opacity: 0.7;
        }

        /* Liquid magnetic attraction effect */
        .toggle-slider::after {
          content: '';
          position: absolute;
          inset: -20px;
          background: radial-gradient(ellipse at center,
            var(--primary) 0%,
            transparent 50%
          );
          opacity: 0;
          filter: blur(20px);
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          transform: scale(0.5);
        }

        .toggle-wrapper:hover .toggle-slider::after {
          opacity: 0.1;
          transform: scale(1);
        }        .toggle-slider.kanban {
          left: calc(50%);
        }

        /* Clean press feedback */
        .toggle-wrapper:active {
          transform: translateY(0) scale(0.99);
        }

        .toggle-wrapper:active .toggle-slider {
          transform: scale(0.95);
        }

        /* Icon micro-animation on toggle */
        .toggle-option.switching svg {
          animation: icon-bounce 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes icon-bounce {
          0% { transform: scale(1.05); }
          50% { transform: scale(1.25) rotate(5deg); }
          100% { transform: scale(1.05) rotate(0deg); }
        }

        /* Liquid smooth slider movement */
        .toggle-slider.moving {
          transition: left 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                      transform 0.3s ease;
        }

        .toggle-slider.moving::before {
          animation: liquid-flow 0.6s ease-out;
        }

        @keyframes liquid-flow {
          0% { transform: rotate(-45deg) translateX(0); }
          50% { transform: rotate(-45deg) translateX(10%); }
          100% { transform: rotate(-45deg) translateX(0); }
        }

        /* Subtle icon animations */
        .toggle-option.active svg {
          animation: icon-fade-in 0.4s ease-out;
        }

        @keyframes icon-fade-in {
          from {
            opacity: 0.5;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1.05);
          }
        }

        /* Magnetic liquid effect on active option */
        .toggle-option.active::after {
          content: '';
          position: absolute;
          inset: -8px;
          background: radial-gradient(circle at center, var(--primary) 0%, transparent 40%);
          border-radius: 50%;
          opacity: 0.08;
          filter: blur(12px);
          transform: scale(0.8);
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .toggle-option.active:hover::after {
          transform: scale(1.1);
          opacity: 0.12;
        }

        /* Focus for accessibility */
        .toggle-wrapper:focus-within {
          outline: 2px solid var(--primary);
          outline-offset: 2px;
        }

        .filters-section {
          flex: 1;
          gap: 12px;
        }

        .filter-dropdown-container {
          position: relative;
        }

        .filter-dropdown {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 140px;
          font-size: 12px;
        }

        .filter-dropdown:hover {
          border-color: var(--primary);
          box-shadow: var(--shadow-glow);
        }

        .filter-dropdown.open {
          border-color: var(--primary);
          box-shadow: var(--shadow-glow);
        }

        .filter-content {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .filter-label {
          color: var(--text-tertiary);
          font-weight: 500;
        }

        .filter-value {
          color: var(--text-primary);
          font-weight: 600;
        }

        .chevron {
          transition: transform 0.2s ease;
          color: var(--text-secondary);
        }

        .chevron.rotated {
          transform: rotate(180deg);
        }

        .dropdown-menu {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          right: 0;
          background: var(--glass-bg);
          backdrop-filter: blur(var(--blur-amount));
          -webkit-backdrop-filter: blur(var(--blur-amount));
          border: 1px solid var(--border);
          border-radius: 4px;
          box-shadow: var(--shadow-lg);
          z-index: 1000;
          overflow: hidden;
          animation: dropdownSlideIn 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          max-height: 240px;
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

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          background: transparent;
          border: none;
          width: 100%;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 12px;
          color: var(--text-primary);
        }

        .dropdown-item:hover {
          background: var(--hover);
          color: var(--primary);
        }

        .dropdown-item.selected {
          background: var(--primary-light);
          color: var(--primary);
          font-weight: 600;
        }

        .stage-indicator {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .item-icon {
          color: var(--text-tertiary);
          flex-shrink: 0;
        }

        .checkmark {
          margin-left: auto;
          color: var(--primary);
          font-weight: bold;
          font-size: 10px;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .controls-container {
            flex-direction: column;
            gap: 12px;
            padding: 12px;
          }

          .control-section {
            width: 100%;
            justify-content: space-between;
          }

          .control-section::after {
            display: none;
          }

          .filters-section {
            flex-direction: column;
            gap: 8px;
            width: 100%;
          }

          .filter-dropdown {
            width: 100%;
          }

          .toggle-wrapper {
            width: 100%;
          }

          .toggle-button {
            width: 100%;
          }

          .quick-actions {
            flex-direction: column;
            gap: var(--space-4);
            align-items: stretch;
            padding: var(--space-4);
          }

          .selection-info {
            justify-content: center;
          }

          .action-buttons {
            justify-content: center;
            flex-wrap: wrap;
          }

          .action-btn {
            flex: 1;
            min-width: 0;
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .toggle-button {
            height: 36px;
            width: 90px;
          }

          .toggle-option svg {
            width: 14px;
            height: 14px;
          }

          .action-buttons {
            grid-template-columns: 1fr 1fr;
            display: grid;
            gap: var(--space-2);
          }

          .action-btn-ghost {
            grid-column: span 2;
          }
        }
      `}</style>
    </div>
  );
}
