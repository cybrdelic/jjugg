/**
 * Applications Controls Component
 * Manages view modes, filters, and table controls
 */

import React from 'react';
import {
    Grid3x3, ListFilter, SlidersHorizontal, Smartphone,
    Monitor, Maximize2, Minimize2
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
    const allColumns = ['company', 'position', 'dateApplied', 'stage', 'tasks', 'location', 'salary', 'bonus'];

    return (
        <div className="dashboard-controls">
            {/* View Toggle */}
            <div className="view-toggle">
                <Tooltip content="List View" placement="bottom">
                    <button
                        className={`control-btn ${viewMode === 'table' ? 'active' : ''}`}
                        onClick={() => onViewModeChange('table')}
                    >
                        <ListFilter size={14} />
                    </button>
                </Tooltip>
                <Tooltip content="Kanban View" placement="bottom">
                    <button
                        className={`control-btn ${viewMode === 'kanban' ? 'active' : ''}`}
                        onClick={() => onViewModeChange('kanban')}
                    >
                        <Grid3x3 size={14} />
                    </button>
                </Tooltip>
                <Tooltip content={isMobileView ? "Switch to Desktop View" : "Switch to Mobile View"} placement="bottom">
                    <button
                        className={`control-btn responsive-toggle ${isMobileView ? 'active' : ''}`}
                        onClick={onMobileViewToggle}
                    >
                        {isMobileView ? <Monitor size={14} /> : <Smartphone size={14} />}
                    </button>
                </Tooltip>
                <Tooltip content={isAutosizeEnabled ? "Switch to Fixed Columns" : "Switch to Auto Column Widths"} placement="bottom">
                    <button
                        className={`control-btn autosize-toggle ${isAutosizeEnabled ? 'active' : ''}`}
                        onClick={onAutosizeToggle}
                    >
                        {isAutosizeEnabled ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                    </button>
                </Tooltip>
            </div>

            {/* Density Controls */}
            <div className="density-controls">
                <Tooltip content="Table Density" placement="bottom">
                    <div className="density-selector">
                        <button
                            className={`density-btn ${tableViewDensity === 'compact' ? 'active' : ''}`}
                            onClick={() => onDensityChange('compact')}
                            title="Compact"
                        >
                            <div className="density-icon compact-icon"></div>
                        </button>
                        <button
                            className={`density-btn ${tableViewDensity === 'comfortable' ? 'active' : ''}`}
                            onClick={() => onDensityChange('comfortable')}
                            title="Comfortable"
                        >
                            <div className="density-icon comfortable-icon"></div>
                        </button>
                        <button
                            className={`density-btn ${tableViewDensity === 'spacious' ? 'active' : ''}`}
                            onClick={() => onDensityChange('spacious')}
                            title="Spacious"
                        >
                            <div className="density-icon spacious-icon"></div>
                        </button>
                    </div>
                </Tooltip>
            </div>

            {/* Quick Filters */}
            <div className="quick-filters">
                <select
                    value={quickFilters.stage}
                    onChange={(e) => onQuickFiltersChange({ stage: e.target.value as ApplicationStage | 'all' })}
                    className="quick-filter-select"
                >
                    <option value="all">All Stages</option>
                    <option value="applied">Applied</option>
                    <option value="screening">Screening</option>
                    <option value="interview">Interview</option>
                    <option value="offer">Offer</option>
                    <option value="rejected">Rejected</option>
                </select>

                <select
                    value={quickFilters.dateRange}
                    onChange={(e) => onQuickFiltersChange({ dateRange: e.target.value as '7d' | '30d' | '90d' | 'all' })}
                    className="quick-filter-select"
                >
                    <option value="all">All Time</option>
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                </select>

                <button
                    className={`control-btn ${showAdvancedFilters ? 'active' : ''}`}
                    onClick={onAdvancedFiltersToggle}
                    title="Advanced Filters"
                >
                    <SlidersHorizontal size={14} />
                </button>
            </div>

            {/* Column Controls */}
            <div className="control-actions">
                <Tooltip content="Customize Columns" placement="bottom">
                    <button
                        className="control-btn"
                        onClick={onColumnMenuToggle}
                    >
                        <SlidersHorizontal size={14} />
                    </button>
                </Tooltip>
                {isColumnMenuOpen && (
                    <div className="column-menu">
                        {allColumns.map(col => (
                            <label key={col} className="column-item">
                                <input
                                    type="checkbox"
                                    checked={visibleColumns.includes(col)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            onVisibleColumnsChange([...visibleColumns, col]);
                                        } else {
                                            onVisibleColumnsChange(visibleColumns.filter(c => c !== col));
                                        }
                                    }}
                                />
                                <span>{col.charAt(0).toUpperCase() + col.slice(1)}</span>
                            </label>
                        ))}
                    </div>
                )}
            </div>

            <style jsx>{`
        .dashboard-controls {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          background: var(--glass-card-container-bg, var(--surface));
          padding: 6px 10px;
          border-radius: 6px;
          border: 1px solid var(--border-thin);
        }

        .view-toggle {
          display: flex;
          gap: 4px;
        }

        .control-btn {
          padding: 6px 10px;
          background: var(--glass-button-bg, var(--card));
          border: 1px solid var(--border-thin);
          border-radius: 6px;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .control-btn:hover {
          background: var(--glass-hover-bg, var(--hover-bg));
          color: var(--text-primary);
        }

        .control-btn.active {
          background: var(--accent-blue);
          color: var(--text-inverse);
          border-color: var(--accent-blue);
        }

        .control-btn.responsive-toggle {
          margin-left: 8px;
          border-left: 1px solid var(--border-thin);
          padding-left: 12px;
        }

        .control-btn.autosize-toggle {
          margin-left: 4px;
        }

        @media (min-width: 768px) {
          .control-btn.responsive-toggle {
            display: none;
          }
        }

        /* Density Controls */
        .density-controls {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-left: 12px;
          padding-left: 12px;
          border-left: 1px solid var(--border-thin);
        }

        .density-selector {
          display: flex;
          align-items: center;
          gap: 2px;
          background: var(--glass-card-container-bg, var(--surface));
          border-radius: 6px;
          padding: 2px;
          border: 1px solid var(--border-thin);
        }

        .density-btn {
          padding: 4px 6px;
          border: none;
          background: transparent;
          border-radius: 4px;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 28px;
          height: 28px;
        }

        .density-btn:hover {
          background: var(--hover-bg);
          color: var(--text-primary);
        }

        .density-btn.active {
          background: var(--accent-blue);
          color: var(--text-inverse);
        }

        .density-icon {
          width: 12px;
          height: 8px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .density-icon::before,
        .density-icon::after {
          content: '';
          width: 100%;
          background: currentColor;
          border-radius: 1px;
        }

        .compact-icon::before,
        .compact-icon::after {
          height: 1px;
        }

        .comfortable-icon::before,
        .comfortable-icon::after {
          height: 2px;
        }

        .spacious-icon::before,
        .spacious-icon::after {
          height: 3px;
        }

        /* Quick Filters */
        .quick-filters {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-left: 12px;
          padding-left: 12px;
          border-left: 1px solid var(--border-thin);
        }

        .quick-filter-select {
          padding: 4px 8px;
          border: 1px solid var(--border-thin);
          border-radius: 6px;
          background: var(--glass-bg);
          color: var(--text-primary);
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 100px;
        }

        .quick-filter-select:focus {
          outline: none;
          border-color: var(--accent-blue);
          box-shadow: 0 0 0 2px rgba(var(--accent-blue-rgb), 0.1);
        }

        .control-actions {
          margin-left: auto;
          position: relative;
        }

        .column-menu {
          position: absolute;
          top: calc(100% + 6px);
          right: 0;
          background: var(--glass-bg);
          border: 1px solid var(--border-thin);
          border-radius: 6px;
          padding: 8px;
          z-index: 100;
          animation: slideDown 0.3s ease-out;
          min-width: 180px;
        }

        .column-item {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 8px;
          font-size: 13px;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .column-item:hover {
          background: var(--hover-bg);
          color: var(--text-primary);
        }

        .column-item input[type="checkbox"] {
          margin: 0;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    );
}
