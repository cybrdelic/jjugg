/**
 * Applications Controls Component
 * Manages view modes, filters, and table controls
 */

import React, { useState, useEffect } from 'react';
import {
  ListFilter, Calendar, TrendingUp, ChevronDown, Filter
} from 'lucide-react';
import Tooltip from '../../Tooltip';
import { ApplicationStage, Application } from '@/types';
import { QuickActions } from './QuickActions';

interface ApplicationsControlsProps {
  // View state
  isMobileView: boolean;
  isAutosizeEnabled: boolean;
  tableViewDensity: 'compact' | 'comfortable' | 'spacious';
  showAdvancedFilters: boolean;
  isColumnMenuOpen: boolean;

  // Filters
  quickFilters: {
    stage: ApplicationStage | 'all',
    dateRange: '7d' | '30d' | '90d' | 'all' | 'custom',
    customDateRange?: { start: Date | null; end: Date | null }
    salary: 'with' | 'without' | 'all'
  };
  visibleColumns: string[];

  // Selection state
  selectedRows: string[];
  selectedApplications: Application[];

  // Handlers
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
  onResetFilters?: () => void;
  activeFilters?: Record<string, string>;
  // Performance hint: prefetch Kanban chunk
  onPrefetchKanban?: () => void;
}

export function ApplicationsControls({
  isMobileView,
  isAutosizeEnabled,
  tableViewDensity,
  showAdvancedFilters,
  isColumnMenuOpen,
  quickFilters,
  visibleColumns,
  selectedRows,
  selectedApplications,
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
  onBulkEdit,
  onResetFilters,
  activeFilters = {},
  onPrefetchKanban
}: ApplicationsControlsProps) {
  const [stageDropdownOpen, setStageDropdownOpen] = useState(false);
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  // Inline range picker state
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
  const [viewMonth, setViewMonth] = useState<Date>(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  // Initialize range when opening the dropdown
  useEffect(() => {
    if (dateDropdownOpen) {
      const start = quickFilters.customDateRange?.start ?? null;
      const end = quickFilters.customDateRange?.end ?? null;
      setSelectedStartDate(start ? new Date(start) : null);
      setSelectedEndDate(end ? new Date(end) : null);
      const anchor = start || end || new Date();
      setViewMonth(new Date(anchor.getFullYear(), anchor.getMonth(), 1));
    }
  }, [dateDropdownOpen]);

  // Date helpers
  const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
  const addMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, 1);
  const isSameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const isBefore = (a: Date, b: Date) => a.getTime() < b.getTime();
  const startOfWeek = (d: Date) => {
    const day = d.getDay(); // 0=Sun
    const diff = d.getDate() - day;
    return new Date(d.getFullYear(), d.getMonth(), diff);
  };
  const endOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
  const beginOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  const buildMonthGrid = (month: Date) => {
    const first = startOfMonth(month);
    const gridStart = startOfWeek(first);
    return Array.from({ length: 42 }).map((_, i) => new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i));
  };

  const handleDayClick = (day: Date) => {
    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
      // Start a new selection
      setSelectedStartDate(day);
      setSelectedEndDate(null);
    } else if (selectedStartDate && !selectedEndDate) {
      let start = selectedStartDate;
      let end = day;
      if (isBefore(end, start)) {
        [start, end] = [end, start];
      }
      setSelectedStartDate(start);
      setSelectedEndDate(end);
      // Live-apply without closing the dropdown for snappy UX
      onQuickFiltersChange({
        dateRange: 'custom',
        customDateRange: { start: beginOfDay(start), end: endOfDay(end) }
      });
    }
  };

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

  const getDateDisplayText = (range: '7d' | '30d' | '90d' | 'all' | 'custom') => {
    switch (range) {
      case 'all': return 'All Time';
      case '7d': return 'Last 7 days';
      case '30d': return 'Last 30 days';
      case '90d': return 'Last 90 days';
      case 'custom': return 'Custom Range';
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
                  {(['all', '7d', '30d', '90d', 'custom'] as const).map((range) => (
                    <button
                      key={range}
                      className={`dropdown-item ${quickFilters.dateRange === range ? 'selected' : ''}`}
                      onClick={() => {
                        if (range === 'custom') {
                          onQuickFiltersChange({ dateRange: 'custom' });
                        } else {
                          onQuickFiltersChange({ dateRange: range });
                          setDateDropdownOpen(false);
                        }
                      }}
                    >
                      <Calendar size={12} className="item-icon" />
                      <span>{getDateDisplayText(range)}</span>
                      {quickFilters.dateRange === range && <div className="checkmark">✓</div>}
                    </button>
                  ))}

                  {quickFilters.dateRange === 'custom' && (
                    <div className="range-calendar" onClick={(e) => e.stopPropagation()}>
                      <div className="calendar-nav">
                        <button className="nav-btn" onClick={() => setViewMonth(addMonths(viewMonth, -1))} aria-label="Previous month">‹</button>
                        <div className="months-title">
                          {viewMonth.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
                          {'  ·  '}
                          {addMonths(viewMonth, 1).toLocaleString(undefined, { month: 'long', year: 'numeric' })}
                        </div>
                        <button className="nav-btn" onClick={() => setViewMonth(addMonths(viewMonth, 1))} aria-label="Next month">›</button>
                      </div>

                      <div className="months">
                        {[viewMonth, addMonths(viewMonth, 1)].map((m, idx) => {
                          const days = buildMonthGrid(m);
                          const monthIndex = m.getMonth();
                          const today = new Date();
                          return (
                            <div key={idx} className="month">
                              <div className="weekdays">
                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d) => (
                                  <div key={d} className="weekday">{d}</div>
                                ))}
                              </div>
                              <div className="grid">
                                {days.map((d, i) => {
                                  const inThisMonth = d.getMonth() === monthIndex;
                                  const isStart = selectedStartDate && isSameDay(d, selectedStartDate);
                                  const isEnd = selectedEndDate && isSameDay(d, selectedEndDate);
                                  const inRange = selectedStartDate && selectedEndDate && d >= beginOfDay(selectedStartDate) && d <= endOfDay(selectedEndDate);
                                  const isToday = isSameDay(d, today);
                                  return (
                                    <button
                                      key={i}
                                      className={`day ${inThisMonth ? '' : 'muted'} ${isToday ? 'today' : ''} ${inRange ? 'in-range' : ''} ${isStart ? 'start' : ''} ${isEnd ? 'end' : ''}`}
                                      onClick={() => handleDayClick(d)}
                                    >
                                      {d.getDate()}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="calendar-actions">
                        <button
                          className="clear-button"
                          onClick={() => {
                            setSelectedStartDate(null);
                            setSelectedEndDate(null);
                            onQuickFiltersChange({ dateRange: 'all', customDateRange: { start: null, end: null } });
                            setDateDropdownOpen(false);
                          }}
                        >Clear</button>
                        <button
                          className="apply-button"
                          disabled={!selectedStartDate}
                          onClick={() => {
                            // If only one date chosen, use single-day range
                            const start = selectedStartDate ? beginOfDay(selectedStartDate) : null;
                            const end = selectedEndDate ? endOfDay(selectedEndDate) : (selectedStartDate ? endOfDay(selectedStartDate) : null);
                            onQuickFiltersChange({ dateRange: 'custom', customDateRange: { start, end } });
                            setDateDropdownOpen(false);
                          }}
                        >Apply</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Reset Filters Button */}
          {Object.values(activeFilters).some(value => value) && (
            <div className="control-section reset-section">
              <button
                className="reset-filters-button"
                onClick={() => onResetFilters?.()}
                title="Clear all active filters"
              >
                <Filter size={14} />
                <span>Clear Filters</span>
                <span className="filter-count">
                  ({Object.values(activeFilters).filter(value => value).length})
                </span>
              </button>
            </div>
          )}

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
          margin-bottom: 0; /* Let parent toolbar control spacing */
        }

        .controls-main {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 0; /* unify with toolbar padding */
        }

        .controls-left {
          display: flex;
          align-items: center;
          gap: 12px;
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
          right: -6px;
          top: 50%;
          transform: translateY(-50%);
          width: 1px;
          height: 18px;
          background: var(--border);
        }

        .section-label {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: flex;
          align-items: center;
          gap: 4px;
          min-width: fit-content;
        }

        /* Filters Section - Enhanced */
        .filters-section {
          flex: 1;
          gap: 12px;
        }

        .filter-dropdown-container {
          position: relative;
          overflow: visible; /* prevent clipping */
        }

        .filter-dropdown {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 10px;
           background: var(--surface);
           border: 1px solid var(--border);
           border-radius: 8px;
           cursor: pointer;
           transition: all 0.2s ease;
           min-width: 140px;
           height: 36px; /* unify height */
           font-size: 13px;
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
           z-index: 2000;
           overflow: hidden; /* default for list menus */
           animation: dropdownSlideIn 0.2s cubic-bezier(0.4, 0, 0.2, 1);
           max-height: 240px;
           overflow-y: auto;
        }

        /* Date dropdown needs room for calendars */
        .date-dropdown {
          max-height: none;
          overflow: visible;
          left: auto;
          right: 0;
          width: max-content;
          min-width: 560px;
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
          padding: 8px 10px;
           background: transparent;
           border: none;
           width: 100%;
           text-align: left;
           cursor: pointer;
           transition: all 0.2s ease;
           font-size: 13px;
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

        /* Reset Filters Button */
        .reset-section {
          margin-left: auto;
        }

        .reset-filters-button {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background: rgba(var(--error-rgb, 239, 68, 68), 0.1);
          border: 1px solid rgba(var(--error-rgb, 239, 68, 68), 0.2);
          border-radius: 8px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
          color: var(--error, #ef4444);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(var(--blur-amount));
          -webkit-backdrop-filter: blur(var(--blur-amount));
          position: relative;
          overflow: hidden;
        }

        .reset-filters-button::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(var(--error-rgb, 239, 68, 68), 0.1), transparent);
          transform: translateX(-100%);
          transition: transform 0.5s ease;
        }

        .reset-filters-button:hover {
          background: rgba(var(--error-rgb, 239, 68, 68), 0.15);
          border-color: rgba(var(--error-rgb, 239, 68, 68), 0.3);
          transform: translateY(-1px);
          box-shadow: var(--shadow-sm);
        }

        .reset-filters-button:hover::before {
          transform: translateX(100%);
        }

        .reset-filters-button:active {
          transform: translateY(0);
          transition-duration: 0.1s;
        }

        .reset-filters-button .filter-count {
          font-size: 10px;
          font-weight: 600;
          background: rgba(var(--error-rgb, 239, 68, 68), 0.2);
          padding: 2px 6px;
          border-radius: 4px;
          line-height: 1;
        }

        /* Custom date range panel */
        .custom-actions { display: flex; gap: 8px; justify-content: flex-end; }
        .apply-button, .clear-button { padding: 6px 10px; border-radius: 8px; border: 1px solid var(--border); background: var(--background); }

         /* Responsive Design */
        @media (max-width: 768px) {
          .controls-container {
            flex-direction: column;
            gap: 12px;
            padding: 12px 0;
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

        .date-dropdown {
          padding: var(--space-2, 8px);
          min-width: 320px;
        }
        .range-calendar { padding: var(--space-2, 8px); }
        .calendar-nav {
          display: flex; align-items: center; justify-content: space-between;
          padding: var(--space-2, 8px) var(--space-3, 12px);
          border-bottom: 1px solid var(--border, rgba(0,0,0,0.08));
        }
        .months-title { font-weight: 600; color: var(--text-primary); letter-spacing: 0.2px; }
        .nav-btn {
          width: 28px; height: 28px; border-radius: 6px; border: 1px solid var(--border);
          background: var(--surface); color: var(--text-secondary);
          display: inline-flex; align-items: center; justify-content: center;
          transition: all 140ms var(--ease-microinteractive);
        }
        .nav-btn:hover { background: var(--background); color: var(--text-primary); }
        .months { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4, 16px); padding: var(--space-3, 12px); }
        .month { display: flex; flex-direction: column; gap: var(--space-2, 8px); }
        .weekdays { display: grid; grid-template-columns: repeat(7, 1fr); padding: 0 var(--space-1, 4px); color: var(--text-tertiary); font-size: 12px; }
        .weekday { text-align: center; }
        .grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
        .day {
          height: 32px; border-radius: 6px; border: 1px solid transparent; background: transparent;
          color: var(--text-primary); font-size: 13px; display: inline-flex; align-items: center; justify-content: center;
          transition: all 120ms var(--ease-microinteractive);
        }
        .day:hover { background: var(--background); border-color: var(--border); }
        .day.muted { color: var(--text-tertiary); }
        .day.today { box-shadow: inset 0 0 0 1px var(--primary); }
        .day.in-range { background: color-mix(in oklab, var(--primary) 12%, transparent); }
        .day.start, .day.end { background: color-mix(in oklab, var(--primary) 18%, transparent); color: var(--text-on-primary, #fff); }
        .calendar-actions { display: flex; justify-content: space-between; padding: var(--space-3, 12px); border-top: 1px solid var(--border); }
        .apply-button { background: var(--primary); color: var(--on-primary, #fff); border: 1px solid var(--primary); border-radius: 8px; padding: 6px 10px; font-weight: 600; }
        .apply-button:disabled { opacity: 0.5; cursor: not-allowed; }
        .clear-button { background: var(--surface); color: var(--text-secondary); border: 1px solid var(--border); border-radius: 8px; padding: 6px 10px; }
      `}</style>
    </div>
  );
}
