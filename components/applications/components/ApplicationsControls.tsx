/**
 * Applications Controls Component
 * Manages view modes, filters, and table controls
 */

import React, { useState } from 'react';
import {
  Grid3x3, ListFilter, Calendar, TrendingUp, ChevronDown, Filter
} from 'lucide-react';
import Tooltip from '../../Tooltip';
import { ApplicationStage } from '@/types';

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

  // Handlers
  onViewModeChange: (mode: 'table' | 'kanban') => void;
  onMobileViewToggle: () => void;
  onAutosizeToggle: () => void;
  onDensityChange: (density: 'compact' | 'comfortable' | 'spacious') => void;
  onQuickFiltersChange: (filters: Partial<ApplicationsControlsProps['quickFilters']>) => void;
  onAdvancedFiltersToggle: () => void;
  onColumnMenuToggle: () => void;
  onVisibleColumnsChange: (columns: string[]) => void;
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
  onViewModeChange,
  onMobileViewToggle,
  onAutosizeToggle,
  onDensityChange,
  onQuickFiltersChange,
  onAdvancedFiltersToggle,
  onColumnMenuToggle,
  onVisibleColumnsChange
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
      {/* View Mode Toggle - Enhanced */}
      <div className="control-section view-section">
        <span className="section-label">View</span>
        <div className="toggle-group">
          <Tooltip content="Table View - Detailed list with sortable columns" placement="bottom">
            <button
              className={`toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => onViewModeChange('table')}
            >
              <ListFilter size={16} />
              <span>Table</span>
            </button>
          </Tooltip>
          <Tooltip content="Kanban View - Visual board organized by stages" placement="bottom">
            <button
              className={`toggle-btn ${viewMode === 'kanban' ? 'active' : ''}`}
              onClick={() => onViewModeChange('kanban')}
            >
              <Grid3x3 size={16} />
              <span>Kanban</span>
            </button>
          </Tooltip>
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

      <style jsx>{`
        .controls-container {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 12px 16px;
          background: var(--glass-bg);
          backdrop-filter: blur(var(--blur-amount));
          -webkit-backdrop-filter: blur(var(--blur-amount));
          border: 1px solid var(--border);
          border-radius: 6px;
          box-shadow: var(--shadow-medium);
          margin-bottom: 16px;
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

        .toggle-group {
          display: flex;
          background: var(--surface);
          border-radius: 4px;
          padding: 2px;
          border: 1px solid var(--border);
        }

        .toggle-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          border: none;
          background: transparent;
          border-radius: 3px;
          font-size: 12px;
          font-weight: 500;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          min-width: 70px;
          justify-content: center;
        }

        .toggle-btn:hover:not(.active) {
          color: var(--text-primary);
          background: var(--hover);
        }

        .toggle-btn.active {
          color: var(--primary);
          background: var(--primary-light);
          font-weight: 600;
          box-shadow: var(--shadow-sm);
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

          .toggle-group {
            width: 100%;
          }

          .toggle-btn {
            flex: 1;
          }
        }
      `}</style>
    </div>
  );
}
