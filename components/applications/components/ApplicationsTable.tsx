/**
 * Applications Table Component
 * World-Class Professional Design with Performance Optimizations
 */

import React, { useMemo, useCallback, useEffect, useState, useRef } from 'react';
import { ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import { Application, ApplicationStage } from '@/types';
import ApplicationTableRow from './ApplicationTableRow';
import { usePerformanceMonitor } from '../utils/performanceMonitor';

interface ApplicationsTableProps {
  // Data
  applications: Application[];
  visibleColumns: string[];
  sortConfig: { column: keyof Application | 'company.name'; direction: 'asc' | 'desc' };
  selectedRows: string[];
  columnFilters: Record<string, string>;
  applicationStats?: {
    applications: number;
    stageStats: {
      applied: number;
      screening: number;
      interview: number;
      offer: number;
      rejected: number;
    };
    appliedThisWeek: number;
    appliedThisMonth: number;
    interviews: number;
    interviewsThisWeek: number;
    pendingTasks: number;
    overdueTasks: number;
    shortlisted: number;
    remoteJobs: number;
    withSalary: number;
    responseRate: number;
    successRate: number;
    active: number;
  };

  // UI State
  isAutosizeEnabled: boolean;
  tableViewDensity: 'compact' | 'comfortable' | 'spacious';
  isMobileView: boolean;
  mounted: boolean;
  inlineEditingId: string | null;
  activeStageDropdown: string | null;

  // Loading states
  isLoading: boolean;
  hasMore: boolean;

  // Handlers
  onSort: (column: keyof Application | 'company.name') => void;
  onFilterChange: (column: string, value: string) => void;
  onRowSelect: (appId: string, selected: boolean) => void;
  onBulkSelect?: (appIds: string[], selected: boolean) => void;
  onRowClick: (appId: string, e: React.MouseEvent) => void;
  onContextMenu: (appId: string, e: React.MouseEvent) => void;
  onStageClick: (appId: string, e: React.MouseEvent) => void;
  onStageChange: (appId: string, stage: ApplicationStage) => void;
  onQuickFilter?: (filterType: string, value?: string) => void;
  onResetFilters?: () => void;
  activeFilters?: Record<string, string>;

  // Refs
  tableRef: React.RefObject<HTMLDivElement | null>;
  lastRowRef: React.RefObject<HTMLDivElement | null>;

  // Stage management
  stagesOrder: ApplicationStage[];
}

export function ApplicationsTable({
  applications,
  visibleColumns,
  sortConfig,
  selectedRows,
  columnFilters,
  applicationStats,
  isAutosizeEnabled,
  tableViewDensity,
  isMobileView,
  mounted,
  inlineEditingId,
  activeStageDropdown,
  isLoading,
  hasMore,
  onSort,
  onFilterChange,
  onRowSelect,
  onBulkSelect,
  onRowClick,
  onContextMenu,
  onStageClick,
  onStageChange,
  onQuickFilter,
  onResetFilters,
  activeFilters = {},
  tableRef,
  lastRowRef,
  stagesOrder
}: ApplicationsTableProps) {
  // Performance monitoring
  const { startMeasurement, endMeasurement, measureScrollPerformance } = usePerformanceMonitor('ApplicationsTable');

  // Simple virtual scrolling for performance
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(600);
  const bodyRef = useRef<HTMLDivElement>(null);

  // Debug mode for troubleshooting (remove in production)
  const [debugInfo, setDebugInfo] = useState<{
    scrollTop: number;
    containerHeight: number;
    visibleStart: number;
    visibleEnd: number;
    totalItems: number;
  } | null>(null);

  // Calculate visible items with improved performance
  const ROW_HEIGHT = tableViewDensity === 'compact' ? 48 : tableViewDensity === 'spacious' ? 64 : 56;
  const OVERSCAN = 10; // Increased overscan for better coverage during scroll
  const VIRTUAL_THRESHOLD = 30; // Lower threshold to ensure virtual scrolling kicks in earlier

  const visibleRange = useMemo(() => {
    if (applications.length <= VIRTUAL_THRESHOLD) {
      // For small datasets, render all
      const range = { start: 0, end: applications.length, offset: 0 };
      setDebugInfo({
        scrollTop,
        containerHeight,
        visibleStart: range.start,
        visibleEnd: range.end,
        totalItems: applications.length
      });
      return range;
    }

    const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
    const endIndex = Math.min(
      applications.length,
      startIndex + Math.ceil(containerHeight / ROW_HEIGHT) + OVERSCAN * 2
    );

    const range = {
      start: startIndex,
      end: endIndex,
      offset: startIndex * ROW_HEIGHT
    };

    setDebugInfo({
      scrollTop,
      containerHeight,
      visibleStart: range.start,
      visibleEnd: range.end,
      totalItems: applications.length
    });

    return range;
  }, [scrollTop, containerHeight, applications.length, ROW_HEIGHT]);

  // Handle scroll with throttling for better performance
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop;

    // Always update scroll position for virtual scrolling to work correctly
    setScrollTop(newScrollTop);

    measureScrollPerformance(() => {
      // Handle scroll performance measurement
    });
  }, [measureScrollPerformance]);

  // Measure container height
  useEffect(() => {
    if (bodyRef.current) {
      const updateHeight = () => {
        if (bodyRef.current) {
          const rect = bodyRef.current.getBoundingClientRect();
          setContainerHeight(rect.height);
        }
      };

      // Initial measurement
      updateHeight();

      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setContainerHeight(entry.contentRect.height);
        }
      });

      resizeObserver.observe(bodyRef.current);

      // Also listen to window resize for better responsiveness
      window.addEventListener('resize', updateHeight);

      return () => {
        resizeObserver.disconnect();
        window.removeEventListener('resize', updateHeight);
      };
    }
  }, []);

  // Start performance measurement on component render
  useEffect(() => {
    startMeasurement();
    return () => {
      endMeasurement(applications.length);
    };
  }, [applications.length, startMeasurement, endMeasurement]);

  // Memoize sort icon computation to prevent unnecessary re-renders
  const getSortIcon = useCallback((column: keyof Application | 'company.name') => {
    if (sortConfig.column !== column) {
      return <ArrowUp size={12} style={{ opacity: 0.3, transform: 'rotate(0deg)' }} />;
    }
    return sortConfig.direction === 'asc' ?
      <ArrowUp size={12} style={{ color: 'var(--primary)' }} /> :
      <ArrowDown size={12} style={{ color: 'var(--primary)' }} />;
  }, [sortConfig.column, sortConfig.direction]);

  // Memoize column header formatting
  const formatColumnHeader = useCallback((column: string): string => {
    switch (column) {
      case 'company': return 'Company';
      case 'position': return 'Position';
      case 'dateApplied': return 'Date Applied';
      case 'stage': return 'Stage';
      case 'tasks': return 'Tasks';
      case 'location': return 'Location';
      case 'salary': return 'Salary';
      case 'bonus': return 'Bonus';
      default: return column.charAt(0).toUpperCase() + column.slice(1);
    }
  }, []);

  // Memoize select all checkbox state to prevent unnecessary computations
  const selectAllState = useMemo(() => ({
    checked: selectedRows.length === applications.length && applications.length > 0,
    indeterminate: selectedRows.length > 0 && selectedRows.length < applications.length
  }), [selectedRows.length, applications.length]);

  // Memoize select all handler to prevent prop drilling re-renders
  const handleSelectAll = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const allSelected = e.target.checked;

    if (onBulkSelect) {
      // Use bulk selection handler if available (more efficient)
      const appIds = applications.map(app => app.id);
      onBulkSelect(appIds, allSelected);
    } else {
      // Fallback to individual selections
      applications.forEach(app => {
        onRowSelect(app.id, allSelected);
      });
    }
  }, [applications, onRowSelect, onBulkSelect]);

  // Memoize column sort handler to prevent re-renders
  const handleColumnSort = useCallback((column: keyof Application | 'company.name') => {
    onSort(column);
  }, [onSort]);

  // Memoize filter change handler
  const handleFilterChange = useCallback((column: string) => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      onFilterChange(column, e.target.value);
    };
  }, [onFilterChange]);

  // Memoize visible applications to prevent unnecessary re-renders
  const visibleApplications = useMemo(() => {
    if (applications.length <= VIRTUAL_THRESHOLD) {
      return applications;
    }
    return applications.slice(visibleRange.start, visibleRange.end);
  }, [applications, visibleRange.start, visibleRange.end, VIRTUAL_THRESHOLD]);

  // Memoize visible columns for header rendering
  const memoizedVisibleColumns = useMemo(() => visibleColumns, [visibleColumns]);

  if (applications.length === 0 && !isLoading) {
    return (
      <div className="professional-empty-state">
        <div className="empty-icon">📋</div>
        <h3 className="text-h3">No applications found</h3>
        <p className="text-body text-secondary">Get started by creating your first job application</p>
        <button className="clean-button">
          <span>Add Application</span>
        </button>
      </div>
    );
  }

  return (
    <div className="professional-table-container">
      {/* Interactive Filter Chips Status Bar */}
      <div className="filter-chips-bar">
        <div className="chips-container">
          {/* Total Applications - Always visible */}
          <div className="chip chip-total">
            <span className="chip-value">{applications.length}</span>
            <span className="chip-label">
              {applications.length === 1 ? 'application' : 'applications'}
            </span>
          </div>

          {applicationStats && (
            <>
              {/* Stage Filter Chips */}
              {applicationStats.stageStats.applied > 0 && (
                <button
                  className={`chip chip-filter chip-applied ${activeFilters.stage === 'applied' ? 'active' : ''}`}
                  onClick={() => onQuickFilter?.('stage', activeFilters.stage === 'applied' ? '' : 'applied')}
                  title={activeFilters.stage === 'applied' ? 'Clear Applied filter - Click to show all stages' : 'Filter by Applied stage - Click to show only applied applications'}
                  data-filter-preview={activeFilters.stage === 'applied' ? 'Showing only applied applications' : `Filter to ${applicationStats.stageStats.applied} applied applications`}
                >
                  <span className="chip-icon">📝</span>
                  <span className="chip-value">{applicationStats.stageStats.applied}</span>
                  <span className="chip-label">applied</span>
                  {activeFilters.stage === 'applied' ? (
                    <span className="active-indicator active">✓</span>
                  ) : (
                    <span className="hover-indicator">+</span>
                  )}
                  <div className="chip-tooltip">
                    {activeFilters.stage === 'applied' ? 'Clear filter' : 'Apply filter'}
                  </div>
                </button>
              )}

              {applicationStats.stageStats.screening > 0 && (
                <button
                  className="chip chip-filter chip-screening"
                  onClick={() => onQuickFilter?.('stage', 'screening')}
                  title="Filter by Screening stage"
                >
                  <span className="chip-icon">�</span>
                  <span className="chip-value">{applicationStats.stageStats.screening}</span>
                  <span className="chip-label">screening</span>
                </button>
              )}

              {applicationStats.stageStats.interview > 0 && (
                <button
                  className="chip chip-filter chip-interview"
                  onClick={() => onQuickFilter?.('stage', 'interview')}
                  title="Filter by Interview stage"
                >
                  <span className="chip-icon">�</span>
                  <span className="chip-value">{applicationStats.stageStats.interview}</span>
                  <span className="chip-label">interviews</span>
                </button>
              )}

              {applicationStats.stageStats.offer > 0 && (
                <button
                  className="chip chip-filter chip-offer"
                  onClick={() => onQuickFilter?.('stage', 'offer')}
                  title="Filter by Offer stage"
                >
                  <span className="chip-icon">🎉</span>
                  <span className="chip-value">{applicationStats.stageStats.offer}</span>
                  <span className="chip-label">offers</span>
                </button>
              )}

              {/* Time-based Filter Chips */}
              {applicationStats.appliedThisWeek > 0 && (
                <button
                  className="chip chip-filter chip-week"
                  onClick={() => onQuickFilter?.('timeframe', 'thisWeek')}
                  title="Filter applications from this week"
                >
                  <span className="chip-icon">📈</span>
                  <span className="chip-value">{applicationStats.appliedThisWeek}</span>
                  <span className="chip-label">this week</span>
                </button>
              )}

              {applicationStats.appliedThisMonth > 0 && (
                <button
                  className="chip chip-filter chip-month"
                  onClick={() => onQuickFilter?.('timeframe', 'thisMonth')}
                  title="Filter applications from this month"
                >
                  <span className="chip-icon">📊</span>
                  <span className="chip-value">{applicationStats.appliedThisMonth}</span>
                  <span className="chip-label">this month</span>
                </button>
              )}

              {/* Task-based Filter Chips */}
              {applicationStats.pendingTasks > 0 && (
                <button
                  className="chip chip-filter chip-tasks"
                  onClick={() => onQuickFilter?.('tasks', 'pending')}
                  title="Filter applications with pending tasks"
                >
                  <span className="chip-icon">✓</span>
                  <span className="chip-value">{applicationStats.pendingTasks}</span>
                  <span className="chip-label">
                    {applicationStats.overdueTasks > 0
                      ? `tasks (${applicationStats.overdueTasks} overdue)`
                      : 'tasks'
                    }
                  </span>
                </button>
              )}

              {applicationStats.interviews > 0 && (
                <button
                  className="chip chip-filter chip-upcoming"
                  onClick={() => onQuickFilter?.('interviews', 'upcoming')}
                  title="Filter applications with upcoming interviews"
                >
                  <span className="chip-icon">�</span>
                  <span className="chip-value">{applicationStats.interviews}</span>
                  <span className="chip-label">upcoming</span>
                </button>
              )}

              {/* Quality Filter Chips */}
              {applicationStats.shortlisted > 0 && (
                <button
                  className="chip chip-filter chip-shortlisted"
                  onClick={() => onQuickFilter?.('shortlisted', 'true')}
                  title="Filter shortlisted applications"
                >
                  <span className="chip-icon">⭐</span>
                  <span className="chip-value">{applicationStats.shortlisted}</span>
                  <span className="chip-label">shortlisted</span>
                </button>
              )}

              {applicationStats.remoteJobs > 0 && (
                <button
                  className="chip chip-filter chip-remote"
                  onClick={() => onQuickFilter?.('remote', 'true')}
                  title="Filter remote job applications"
                >
                  <span className="chip-icon">🏠</span>
                  <span className="chip-value">{applicationStats.remoteJobs}</span>
                  <span className="chip-label">remote</span>
                </button>
              )}

              {applicationStats.withSalary > 0 && (
                <button
                  className="chip chip-filter chip-salary"
                  onClick={() => onQuickFilter?.('salary', 'hasValue')}
                  title="Filter applications with salary information"
                >
                  <span className="chip-icon">�</span>
                  <span className="chip-value">{applicationStats.withSalary}</span>
                  <span className="chip-label">with salary</span>
                </button>
              )}
            </>
          )}
        </div>

        {/* Enhanced Status and Filter Actions */}
        <div className="status-actions">
          {/* Active Filters Summary with better UX */}
          {Object.values(activeFilters).some(value => value) && (
            <div className="filter-status-enhanced">
              <div className="filter-summary">
                <span className="filter-icon">🔍</span>
                <span className="filter-count">
                  {Object.values(activeFilters).filter(value => value).length} active filter{Object.values(activeFilters).filter(value => value).length > 1 ? 's' : ''}
                </span>
                <div className="active-filter-tags">
                  {Object.entries(activeFilters).filter(([key, value]) => value).map(([key, value]) => (
                    <span key={key} className="filter-tag">
                      <span className="filter-tag-label">{key}</span>
                      <span className="filter-tag-value">{value}</span>
                      <button
                        className="filter-tag-remove"
                        onClick={() => onQuickFilter?.(key, '')}
                        title={`Remove ${key} filter`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              <button
                className="reset-filters-btn-enhanced"
                onClick={() => onResetFilters?.()}
                title="Clear all active filters"
              >
                <span className="reset-icon">↻</span>
                Reset
              </button>
            </div>
          )}

          {/* Selection Indicator */}
          {selectedRows.length > 0 && (
            <div className="selected-indicator">
              <span className="selection-dot"></span>
              <span className="selection-text">{selectedRows.length} selected</span>
              {selectedRows.length === applications.length && (
                <span className="all-badge">All</span>
              )}
            </div>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="loading-indicator">
              <Loader2 size={14} className="loading-icon" />
              <span>Loading...</span>
            </div>
          )}
        </div>
      </div>

      <div className="professional-table-card" ref={tableRef}>
        {/* Professional Table Header */}
        <div className={`professional-table-header ${isAutosizeEnabled ? 'autosize' : ''}`}>
          {/* Selection Header */}
          <div className="header-cell-select">
            <input
              type="checkbox"
              className="professional-checkbox"
              checked={selectAllState.checked}
              ref={(el) => {
                if (el) el.indeterminate = selectAllState.indeterminate;
              }}
              onChange={handleSelectAll}
            />
          </div>

          {/* Column Headers */}
          {memoizedVisibleColumns.map(column => (
            <div
              key={column}
              className={`professional-header-cell ${sortConfig.column === column ? 'sorted' : ''}`}
              onClick={() => handleColumnSort(column as keyof Application | 'company.name')}
            >
              <div className="header-label">
                <span className="text-label">
                  {formatColumnHeader(column)}
                </span>
                {getSortIcon(column as keyof Application | 'company.name')}
              </div>
              <input
                type="text"
                className="minimal-input header-filter"
                placeholder={`Filter ${formatColumnHeader(column).toLowerCase()}...`}
                value={columnFilters[column] || ''}
                onChange={handleFilterChange(column)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          ))}
        </div>

        {/* Professional Table Body */}
        <div
          className="professional-table-body"
          ref={bodyRef}
          onScroll={handleScroll}
          style={{
            contain: 'layout style paint',
            scrollBehavior: 'auto' // Ensure smooth but immediate scroll updates
          }}
        >
          {applications.length > VIRTUAL_THRESHOLD ? (
            /* Virtual scrolling for large datasets */
            <div style={{
              height: applications.length * ROW_HEIGHT,
              position: 'relative',
              contain: 'layout style'
            }}>
              <div style={{
                transform: `translate3d(0, ${visibleRange.offset}px, 0)`, // Use translate3d for GPU acceleration
                willChange: 'transform' // Hint browser for optimization
              }}>
                {visibleApplications.map((app, virtualIndex) => {
                  const actualIndex = visibleRange.start + virtualIndex;
                  return (
                    <ApplicationTableRow
                      key={`${app.id}-${actualIndex}`} // Include index in key for better tracking
                      application={app}
                      visibleColumns={memoizedVisibleColumns}
                      isSelected={selectedRows.includes(app.id)}
                      isLastRow={actualIndex === applications.length - 1}
                      mounted={mounted}
                      isMobileView={isMobileView}
                      isAutosizeEnabled={isAutosizeEnabled}
                      tableViewDensity={tableViewDensity}
                      inlineEditingId={inlineEditingId}
                      activeStageDropdown={activeStageDropdown}
                      animationDelay={0} // Disable staggered animation for virtual rows
                      onSelect={(selected: boolean) => onRowSelect(app.id, selected)}
                      onRowClick={(e: React.MouseEvent) => onRowClick(app.id, e)}
                      onContextMenu={(e: React.MouseEvent) => onContextMenu(app.id, e)}
                      onStageClick={(e: React.MouseEvent) => onStageClick(app.id, e)}
                      onStageChange={(stage: ApplicationStage) => onStageChange(app.id, stage)}
                      stagesOrder={stagesOrder}
                      ref={actualIndex === applications.length - 1 ? lastRowRef : null}
                    />
                  );
                })}
              </div>
            </div>
          ) : (
            /* Regular rendering for small datasets */
            <div style={{ contain: 'layout style' }}>
              {applications.map((app, index) => (
                <ApplicationTableRow
                  key={`${app.id}-${app.dateApplied}`}
                  application={app}
                  visibleColumns={memoizedVisibleColumns}
                  isSelected={selectedRows.includes(app.id)}
                  isLastRow={index === applications.length - 1}
                  mounted={mounted}
                  isMobileView={isMobileView}
                  isAutosizeEnabled={isAutosizeEnabled}
                  tableViewDensity={tableViewDensity}
                  inlineEditingId={inlineEditingId}
                  activeStageDropdown={activeStageDropdown}
                  animationDelay={Math.min(index * 0.01, 0.5)} // Reduced animation delay
                  onSelect={(selected: boolean) => onRowSelect(app.id, selected)}
                  onRowClick={(e: React.MouseEvent) => onRowClick(app.id, e)}
                  onContextMenu={(e: React.MouseEvent) => onContextMenu(app.id, e)}
                  onStageClick={(e: React.MouseEvent) => onStageClick(app.id, e)}
                  onStageChange={(stage: ApplicationStage) => onStageChange(app.id, stage)}
                  stagesOrder={stagesOrder}
                  ref={index === applications.length - 1 ? lastRowRef : null}
                />
              ))}
            </div>
          )}

          {/* Professional Loading State */}
          {isLoading && (
            <div className="professional-loading-state">
              <Loader2 size={20} className="loading-spinner" />
              <span className="text-body-sm text-secondary">Loading applications...</span>
            </div>
          )}

          {/* Professional End State */}
          {!hasMore && applications.length > 0 && (
            <div className="professional-end-state">
              <span className="text-caption">All applications loaded</span>
            </div>
          )}
        </div>

        {/* Table Footer with Additional Info */}
        {applications.length > 0 && (
          <div className="table-footer">
            <div className="footer-info">
              <span className="footer-text">
                Showing {applications.length} of {applications.length} applications
              </span>
              {selectedRows.length > 0 && (
                <span className="footer-selection">
                  • {selectedRows.length} selected
                </span>
              )}
              {/* Debug info - remove in production */}
              {debugInfo && applications.length > VIRTUAL_THRESHOLD && (
                <span className="debug-info">
                  • Virtual: {debugInfo.visibleStart}-{debugInfo.visibleEnd} of {debugInfo.totalItems}
                  (scroll: {Math.round(debugInfo.scrollTop)}, height: {Math.round(debugInfo.containerHeight)})
                </span>
              )}
            </div>

            <div className="footer-actions">
              {sortConfig.column && (
                <span className="sort-indicator">
                  Sorted by {formatColumnHeader(sortConfig.column as string)}
                  ({sortConfig.direction === 'asc' ? 'A-Z' : 'Z-A'})
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        /* ===================================
           PROFESSIONAL TABLE DESIGN
           World-Class Flat Design System
           ===================================== */

        .professional-table-container {
          width: 100%;
          max-width: 100%;
          overflow: hidden;
        }

        /* ===================================
           INTERACTIVE FILTER CHIPS BAR
           Clickable Filter System
           ===================================== */

        .filter-chips-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-3) var(--space-4);
          background: var(--surface);
          border: 1px solid var(--border);
          border-bottom: none;
          border-radius: var(--radius-lg) var(--radius-lg) 0 0;
          gap: var(--space-4);
          min-height: 60px;
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .filter-chips-bar::-webkit-scrollbar {
          display: none;
        }

        .chips-container {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          flex: 1;
          min-width: 0;
        }

        /* Base Chip Styles */
        .chip {
          display: flex;
          align-items: center;
          gap: var(--space-1-5);
          padding: var(--space-2) var(--space-3);
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-full);
          font-family: var(--font-interface);
          font-size: var(--text-sm);
          font-weight: var(--font-medium);
          transition: all var(--duration-150) var(--ease-out);
          white-space: nowrap;
          flex-shrink: 0;
        }

        /* Total Applications Chip - Always visible, not clickable */
        .chip-total {
          background: var(--background);
          border-color: var(--border-strong);
          font-weight: var(--font-semibold);
        }

        .chip-total .chip-value {
          font-size: var(--text-lg);
          font-weight: var(--font-bold);
          color: var(--text-primary);
        }

        .chip-total .chip-label {
          color: var(--text-secondary);
          text-transform: lowercase;
        }

        /* Clickable Filter Chips */
        .chip-filter {
          cursor: pointer;
          transition: all var(--duration-150) var(--ease-out);
        }

        .chip-filter:hover {
          transform: translateY(-1px);
          box-shadow: var(--shadow-sm);
          border-color: var(--border-strong);
        }

        .chip-filter:active {
          transform: translateY(0);
          transition-duration: var(--duration-instant);
        }

        /* Stage-specific chip colors */
        .chip-applied {
          background: rgba(156, 163, 175, 0.1);
          border-color: rgba(156, 163, 175, 0.2);
          color: #6b7280;
        }

        .chip-applied:hover {
          background: rgba(156, 163, 175, 0.15);
          border-color: rgba(156, 163, 175, 0.3);
        }

        .chip-screening {
          background: rgba(59, 130, 246, 0.1);
          border-color: rgba(59, 130, 246, 0.2);
          color: #2563eb;
        }

        .chip-screening:hover {
          background: rgba(59, 130, 246, 0.15);
          border-color: rgba(59, 130, 246, 0.3);
        }

        .chip-interview {
          background: rgba(139, 92, 246, 0.1);
          border-color: rgba(139, 92, 246, 0.2);
          color: #7c3aed;
        }

        .chip-interview:hover {
          background: rgba(139, 92, 246, 0.15);
          border-color: rgba(139, 92, 246, 0.3);
        }

        .chip-offer {
          background: rgba(34, 197, 94, 0.1);
          border-color: rgba(34, 197, 94, 0.2);
          color: #16a34a;
        }

        .chip-offer:hover {
          background: rgba(34, 197, 94, 0.15);
          border-color: rgba(34, 197, 94, 0.3);
        }

        /* Time-based chips */
        .chip-week {
          background: rgba(var(--accent-rgb), 0.1);
          border-color: rgba(var(--accent-rgb), 0.2);
          color: var(--accent);
        }

        .chip-week:hover {
          background: rgba(var(--accent-rgb), 0.15);
          border-color: rgba(var(--accent-rgb), 0.3);
        }

        .chip-month {
          background: rgba(var(--primary-rgb), 0.1);
          border-color: rgba(var(--primary-rgb), 0.2);
          color: var(--primary);
        }

        .chip-month:hover {
          background: rgba(var(--primary-rgb), 0.15);
          border-color: rgba(var(--primary-rgb), 0.3);
        }

        /* Quality and task chips */
        .chip-tasks {
          background: rgba(251, 191, 36, 0.1);
          border-color: rgba(251, 191, 36, 0.2);
          color: #d97706;
        }

        .chip-tasks:hover {
          background: rgba(251, 191, 36, 0.15);
          border-color: rgba(251, 191, 36, 0.3);
        }

        .chip-upcoming {
          background: rgba(168, 85, 247, 0.1);
          border-color: rgba(168, 85, 247, 0.2);
          color: #9333ea;
        }

        .chip-upcoming:hover {
          background: rgba(168, 85, 247, 0.15);
          border-color: rgba(168, 85, 247, 0.3);
        }

        .chip-shortlisted {
          background: rgba(245, 158, 11, 0.1);
          border-color: rgba(245, 158, 11, 0.2);
          color: #d97706;
        }

        .chip-shortlisted:hover {
          background: rgba(245, 158, 11, 0.15);
          border-color: rgba(245, 158, 11, 0.3);
        }

        .chip-remote {
          background: rgba(16, 185, 129, 0.1);
          border-color: rgba(16, 185, 129, 0.2);
          color: #059669;
        }

        .chip-remote:hover {
          background: rgba(16, 185, 129, 0.15);
          border-color: rgba(16, 185, 129, 0.3);
        }

        .chip-salary {
          background: rgba(34, 197, 94, 0.1);
          border-color: rgba(34, 197, 94, 0.2);
          color: #16a34a;
        }

        .chip-salary:hover {
          background: rgba(34, 197, 94, 0.15);
          border-color: rgba(34, 197, 94, 0.3);
        }

        /* Chip elements */
        .chip-icon {
          font-size: var(--text-sm);
          opacity: 0.8;
          flex-shrink: 0;
        }

        .chip-value {
          font-weight: var(--font-bold);
          color: inherit;
          line-height: 1;
        }

        .chip-label {
          color: inherit;
          opacity: 0.8;
          text-transform: lowercase;
        }

        /* Active Filter States */
        .chip-filter.active {
          background: var(--primary) !important;
          border-color: var(--primary) !important;
          color: white !important;
          box-shadow: var(--shadow-sm);
          transform: translateY(-1px);
        }

        .chip-filter.active .chip-icon,
        .chip-filter.active .chip-value,
        .chip-filter.active .chip-label {
          color: white !important;
          opacity: 1;
        }

        .chip-filter.active:hover {
          background: var(--primary-dark) !important;
          border-color: var(--primary-dark) !important;
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .active-indicator {
          margin-left: var(--space-1);
          font-size: var(--text-xs);
          font-weight: var(--font-bold);
          opacity: 0.8;
          line-height: 1;
        }

        .active-indicator.active {
          color: white;
          opacity: 1;
        }

        .hover-indicator {
          margin-left: var(--space-1);
          font-size: var(--text-xs);
          font-weight: var(--font-bold);
          opacity: 0;
          line-height: 1;
          transition: opacity var(--duration-150) var(--ease-out);
        }

        .chip-filter:hover .hover-indicator {
          opacity: 0.6;
        }

        /* Enhanced Chip Tooltips */
        .chip-tooltip {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: var(--background);
          color: var(--text-primary);
          padding: var(--space-1-5) var(--space-2);
          border-radius: var(--radius-md);
          font-size: var(--text-xs);
          font-weight: var(--font-medium);
          white-space: nowrap;
          box-shadow: var(--shadow-md);
          border: 1px solid var(--border);
          opacity: 0;
          pointer-events: none;
          transition: all var(--duration-200) var(--ease-out);
          z-index: 1000;
          margin-bottom: var(--space-1);
        }

        .chip-tooltip::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 4px solid transparent;
          border-top-color: var(--border);
        }

        .chip-filter:hover .chip-tooltip {
          opacity: 1;
          transform: translateX(-50%) translateY(-2px);
        }

        /* Enhanced Chip Interactions */
        .chip-filter {
          position: relative;
          cursor: pointer;
          transition: all var(--duration-200) var(--ease-out);
          overflow: visible;
        }

        .chip-filter:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: var(--shadow-md);
          border-color: var(--border-strong);
          z-index: 10;
        }

        .chip-filter:active {
          transform: translateY(0) scale(0.98);
          transition-duration: var(--duration-instant);
        }

        .chip-filter[data-filter-preview]::before {
          content: attr(data-filter-preview);
          position: absolute;
          top: -40px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--primary);
          color: white;
          padding: var(--space-2) var(--space-3);
          border-radius: var(--radius-md);
          font-size: var(--text-xs);
          font-weight: var(--font-medium);
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: all var(--duration-200) var(--ease-out);
          z-index: 1001;
          box-shadow: var(--shadow-lg);
        }

        .chip-filter[data-filter-preview]:hover::before {
          opacity: 1;
          transform: translateX(-50%) translateY(-4px);
        }

        /* Status Actions */
        .status-actions {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          flex-shrink: 0;
        }

        .selected-indicator {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-1-5) var(--space-3);
          background: rgba(var(--primary-rgb), 0.1);
          border: 1px solid rgba(var(--primary-rgb), 0.2);
          border-radius: var(--radius-full);
          font-family: var(--font-interface);
          font-size: var(--text-sm);
          font-weight: var(--font-medium);
          color: var(--primary);
        }

        .selection-dot {
          width: 8px;
          height: 8px;
          background: var(--primary);
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        .selection-text {
          color: var(--primary);
        }

        .all-badge {
          font-size: var(--text-xs);
          font-weight: var(--font-bold);
          color: var(--text-inverse);
          background: var(--primary);
          padding: var(--space-1) var(--space-2);
          border-radius: var(--radius-sm);
          text-transform: uppercase;
          letter-spacing: var(--tracking-wide);
        }

        .filter-active {
          display: flex;
          align-items: center;
          gap: var(--space-1-5);
          padding: var(--space-1-5) var(--space-3);
          background: rgba(var(--accent-rgb), 0.1);
          border: 1px solid rgba(var(--accent-rgb), 0.2);
          border-radius: var(--radius-full);
          font-family: var(--font-interface);
          font-size: var(--text-sm);
          font-weight: var(--font-medium);
          color: var(--accent);
        }

        .filter-icon {
          font-size: var(--text-sm);
          opacity: 0.8;
        }

        .filter-text {
          color: var(--accent);
        }

        .loading-indicator {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          color: var(--text-tertiary);
          font-family: var(--font-interface);
          font-size: var(--text-sm);
          font-weight: var(--font-medium);
        }

        .loading-icon {
          animation: spin 1s linear infinite;
        }

        /* Enhanced Filter Status */
        .filter-status {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-1-5) var(--space-3);
          background: rgba(var(--accent-rgb), 0.1);
          border: 1px solid rgba(var(--accent-rgb), 0.2);
          border-radius: var(--radius-full);
          font-family: var(--font-interface);
          font-size: var(--text-sm);
          font-weight: var(--font-medium);
          color: var(--accent);
        }

        .filter-count {
          color: var(--accent);
          font-weight: var(--font-semibold);
        }

        .reset-filters-btn {
          background: transparent;
          border: none;
          color: var(--accent);
          cursor: pointer;
          font-size: var(--text-xs);
          font-weight: var(--font-medium);
          text-decoration: underline;
          padding: 0;
          margin-left: var(--space-1);
          transition: all var(--duration-150) var(--ease-out);
        }

        .reset-filters-btn:hover {
          color: var(--accent-dark);
          text-decoration: none;
        }

        /* Enhanced Filter Status with Better UX */
        .filter-status-enhanced {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-2) var(--space-4);
          background: rgba(var(--accent-rgb), 0.08);
          border: 1px solid rgba(var(--accent-rgb), 0.15);
          border-radius: var(--radius-lg);
          font-family: var(--font-interface);
          box-shadow: var(--shadow-xs);
          transition: all var(--duration-200) var(--ease-out);
        }

        .filter-summary {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          flex: 1;
        }

        .filter-count {
          color: var(--accent);
          font-weight: var(--font-semibold);
          font-size: var(--text-sm);
        }

        .active-filter-tags {
          display: flex;
          align-items: center;
          gap: var(--space-1-5);
          margin-left: var(--space-2);
        }

        .filter-tag {
          display: flex;
          align-items: center;
          gap: var(--space-1);
          padding: var(--space-1) var(--space-2);
          background: var(--primary);
          color: white;
          border-radius: var(--radius-md);
          font-size: var(--text-xs);
          font-weight: var(--font-medium);
          transition: all var(--duration-150) var(--ease-out);
        }

        .filter-tag:hover {
          background: var(--primary-dark);
          transform: translateY(-1px);
          box-shadow: var(--shadow-sm);
        }

        .filter-tag-label {
          opacity: 0.8;
          text-transform: capitalize;
        }

        .filter-tag-value {
          font-weight: var(--font-semibold);
        }

        .filter-tag-remove {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          font-size: var(--text-xs);
          font-weight: var(--font-bold);
          padding: 0;
          margin-left: var(--space-1);
          opacity: 0.7;
          transition: opacity var(--duration-150) var(--ease-out);
        }

        .filter-tag-remove:hover {
          opacity: 1;
        }

        .reset-filters-btn-enhanced {
          display: flex;
          align-items: center;
          gap: var(--space-1-5);
          background: var(--surface);
          border: 1px solid rgba(var(--accent-rgb), 0.2);
          color: var(--accent);
          cursor: pointer;
          font-size: var(--text-sm);
          font-weight: var(--font-medium);
          padding: var(--space-1-5) var(--space-3);
          border-radius: var(--radius-md);
          transition: all var(--duration-150) var(--ease-out);
        }

        .reset-filters-btn-enhanced:hover {
          background: var(--accent);
          color: white;
          border-color: var(--accent);
          transform: translateY(-1px);
          box-shadow: var(--shadow-sm);
        }

        .reset-icon {
          font-size: var(--text-sm);
          transition: transform var(--duration-200) var(--ease-out);
        }

        .reset-filters-btn-enhanced:hover .reset-icon {
          transform: rotate(180deg);
        }

        .total-count {
          display: flex;
          align-items: baseline;
          gap: var(--space-1);
        }

        .count-number {
          font-family: var(--font-interface);
          font-size: var(--text-lg);
          font-weight: var(--font-bold);
          color: var(--text-primary);
          line-height: 1;
        }

        .count-label {
          font-family: var(--font-interface);
          font-size: var(--text-sm);
          font-weight: var(--font-medium);
          color: var(--text-secondary);
          text-transform: lowercase;
        }

        .selected-count {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-1-5) var(--space-3);
          background: rgba(var(--primary-rgb), 0.1);
          border: 1px solid rgba(var(--primary-rgb), 0.2);
          border-radius: var(--radius-full);
          animation: slideInFromLeft 0.3s var(--ease-out);
        }

        .selection-indicator {
          display: flex;
          align-items: center;
          gap: var(--space-1-5);
          font-family: var(--font-interface);
          font-size: var(--text-sm);
          font-weight: var(--font-medium);
          color: var(--primary);
        }

        .selection-dot {
          width: 8px;
          height: 8px;
          background: var(--primary);
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        .all-selected-badge {
          font-family: var(--font-interface);
          font-size: var(--text-xs);
          font-weight: var(--font-bold);
          color: var(--text-inverse);
          background: var(--primary);
          padding: var(--space-1) var(--space-2);
          border-radius: var(--radius-sm);
          text-transform: uppercase;
          letter-spacing: var(--tracking-wide);
        }

        .filter-indicator {
          display: flex;
          align-items: center;
          gap: var(--space-1-5);
          padding: var(--space-1-5) var(--space-3);
          background: rgba(var(--accent-rgb), 0.1);
          border: 1px solid rgba(var(--accent-rgb), 0.2);
          border-radius: var(--radius-full);
          animation: slideInFromLeft 0.3s var(--ease-out) 0.1s both;
        }

        .filter-icon {
          font-size: var(--text-sm);
          opacity: 0.8;
        }

        .filter-text {
          font-family: var(--font-interface);
          font-size: var(--text-sm);
          font-weight: var(--font-medium);
          color: var(--accent);
        }

        .status-actions {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .bulk-actions {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .clear-selection-btn {
          font-family: var(--font-interface);
          font-size: var(--text-sm);
          font-weight: var(--font-medium);
          color: var(--text-secondary);
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: var(--space-1-5) var(--space-3);
          cursor: pointer;
          transition: all var(--duration-150) var(--ease-out);
          display: flex;
          align-items: center;
          gap: var(--space-1);
        }

        .clear-selection-btn:hover {
          color: var(--text-primary);
          border-color: var(--border-strong);
          background: var(--card-hover);
          transform: translateY(-1px);
        }

        .clear-selection-btn:active {
          transform: translateY(0);
        }

        .loading-indicator {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          color: var(--text-tertiary);
          font-family: var(--font-interface);
          font-size: var(--text-sm);
          font-weight: var(--font-medium);
        }

        .loading-icon {
          animation: spin 1s linear infinite;
        }

        /* ===================================
           TABLE FOOTER
           Additional Information Display
           ===================================== */

        .table-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-3) var(--space-4);
          background: var(--surface);
          border: 1px solid var(--border);
          border-top: none;
          border-radius: 0 0 var(--radius-lg) var(--radius-lg);
          gap: var(--space-4);
          min-height: 40px;
        }

        .footer-info {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          flex: 1;
        }

        .footer-text {
          font-family: var(--font-interface);
          font-size: var(--text-sm);
          font-weight: var(--font-medium);
          color: var(--text-secondary);
        }

        .footer-selection {
          font-family: var(--font-interface);
          font-size: var(--text-sm);
          font-weight: var(--font-medium);
          color: var(--primary);
        }

        .debug-info {
          font-family: var(--font-mono);
          font-size: var(--text-xs);
          font-weight: var(--font-medium);
          color: var(--text-tertiary);
          background: var(--background);
          padding: var(--space-1) var(--space-2);
          border-radius: var(--radius-sm);
          border: 1px solid var(--border);
        }

        .footer-actions {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .sort-indicator {
          font-family: var(--font-interface);
          font-size: var(--text-xs);
          font-weight: var(--font-medium);
          color: var(--text-tertiary);
          background: var(--background);
          padding: var(--space-1) var(--space-2);
          border-radius: var(--radius-sm);
          border: 1px solid var(--border);
        }

        .professional-table-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-top: none;
          border-bottom: none;
          border-radius: 0;
          overflow: hidden;
          transition: all var(--duration-150) var(--ease-out);
          box-shadow: var(--shadow-sm);
          position: relative;
        }

        .professional-table-card:hover {
          border-color: var(--border-strong);
          box-shadow: var(--shadow-md);
        }

        /* Update hover effect for the whole container */
        .professional-table-container:hover .table-status-bar,
        .professional-table-container:hover .table-footer {
          border-color: var(--border-strong);
        }

        .professional-table-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, var(--primary), var(--accent));
          opacity: 0.8;
        }

        /* ===================================
           PROFESSIONAL TABLE HEADER
           Clean Typography & Layout
           ===================================== */

        .professional-table-header {
          display: grid;
          grid-template-columns: 48px minmax(150px, 2fr) minmax(200px, 2.5fr) minmax(120px, 1.2fr) minmax(100px, 1.5fr) minmax(80px, 1fr) minmax(80px, 1fr) minmax(80px, 1fr) minmax(60px, 0.8fr);
          align-items: flex-start;
          padding: var(--space-4) var(--space-4);
          background: var(--surface);
          border-bottom: 1px solid var(--border);
          gap: var(--space-3);
          position: sticky;
          top: 0;
          z-index: 10;
          overflow: hidden;
        }

        .professional-table-header.autosize {
          grid-template-columns: 48px repeat(8, minmax(100px, auto));
        }

        @media (max-width: 1400px) {
          .professional-table-header {
            grid-template-columns: 40px minmax(120px, 2fr) minmax(180px, 2.5fr) minmax(100px, 1fr) minmax(100px, 1.2fr) minmax(80px, 1fr) minmax(100px, 1.5fr) minmax(80px, 1.2fr) 0;
            gap: var(--space-2);
          }
        }

        @media (max-width: 1200px) {
          .professional-table-header {
            grid-template-columns: 40px minmax(120px, 1.8fr) minmax(150px, 2fr) minmax(80px, 1fr) minmax(100px, 1.2fr) minmax(60px, 0.8fr) 0 0 0;
          }
        }

        @media (max-width: 992px) {
          .professional-table-header {
            grid-template-columns: 40px minmax(120px, 2fr) minmax(150px, 2fr) minmax(80px, 1fr) minmax(100px, 1.2fr) 0 0 0 0;
          }
        }

        @media (max-width: 768px) {
          .professional-table-header {
            grid-template-columns: 36px minmax(100px, 2fr) minmax(120px, 2fr) minmax(80px, 1fr) minmax(80px, 1fr) 0 0 0 0;
            padding: var(--space-3);
            gap: var(--space-2);
          }
        }

        /* Header Selection Cell */
        .header-cell-select {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-2) 0;
          min-width: 48px;
        }

        .professional-checkbox {
          width: 18px;
          height: 18px;
          appearance: none;
          background: var(--surface);
          border: 2px solid var(--border-strong);
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all var(--duration-150) var(--ease-out);
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .professional-checkbox::after {
          content: '';
          width: 10px;
          height: 6px;
          border: 2px solid transparent;
          border-top: none;
          border-right: none;
          transform: rotate(-45deg) scale(0);
          transition: transform var(--duration-150) var(--ease-out);
        }

        .professional-checkbox:checked {
          background: var(--primary);
          border-color: var(--primary);
        }

        .professional-checkbox:checked::after {
          border-color: var(--text-inverse);
          transform: rotate(-45deg) scale(1);
        }

        .professional-checkbox:hover {
          border-color: var(--primary);
          background: var(--hover-bg);
          transform: scale(1.05);
        }

        .professional-checkbox:focus-visible {
          outline: 2px solid var(--focus-ring);
          outline-offset: var(--focus-ring-offset);
        }

        /* Header Content Cells */
        .professional-header-cell {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          cursor: pointer;
          transition: all var(--duration-150) var(--ease-out);
          padding: var(--space-1) 0;
          min-width: 0;
          overflow: hidden;
          position: relative;
        }

        .professional-header-cell:hover {
          transform: translateY(-1px);
        }

        .professional-header-cell.sorted .header-label span {
          color: var(--primary);
          font-weight: var(--font-semibold);
        }

        .header-label {
          display: flex;
          align-items: center;
          gap: var(--space-1);
          min-height: 20px;
          flex-shrink: 0;
        }

        .header-label span {
          color: var(--text-secondary);
          font-weight: var(--font-medium);
          letter-spacing: var(--tracking-wide);
          text-transform: uppercase;
          transition: color var(--duration-150) var(--ease-out);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          user-select: none;
        }

        .professional-header-cell:hover .header-label span {
          color: var(--text-primary);
        }

        /* Sort icon styling */
        .header-label svg {
          transition: all var(--duration-150) var(--ease-out);
          flex-shrink: 0;
        }

        .professional-header-cell:hover .header-label svg {
          opacity: 1 !important;
          transform: scale(1.1);
        }

        .header-filter {
          width: 100%;
          min-width: 0;
          max-width: 100%;
          font-size: var(--text-xs);
          padding: var(--space-2) var(--space-3);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          background: var(--surface);
          color: var(--text-primary);
          transition: all var(--duration-150) var(--ease-out);
          box-sizing: border-box;
          position: relative;
          z-index: 1;
        }

        .header-filter:focus {
          outline: none;
          border-color: var(--primary);
          background: var(--card);
          box-shadow: 0 0 0 1px var(--primary);
          z-index: 10;
        }

        .header-filter::placeholder {
          color: var(--text-tertiary);
          font-size: var(--text-xs);
        }

        /* ===================================
           PROFESSIONAL TABLE BODY
           Clean Content Layout
           ===================================== */

        .professional-table-body {
          background: var(--background);
          min-height: 200px;
          max-height: 45vh;
          overflow-y: auto;
          overflow-x: hidden;
          /* Performance optimizations */
          will-change: scroll-position;
          transform: translateZ(0); /* Force GPU layer */
          backface-visibility: hidden;
          perspective: 1000;
        }

        /* ===================================
           PROFESSIONAL STATES
           Loading, Empty, End States
           ===================================== */

        .professional-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--space-16) var(--space-8);
          text-align: center;
          background: var(--surface);
          border-radius: var(--radius-lg);
          gap: var(--space-4);
        }

        .empty-icon {
          font-size: 48px;
          opacity: 0.4;
          margin-bottom: var(--space-2);
        }

        .professional-empty-state h3 {
          margin: 0;
          color: var(--text-primary);
        }

        .professional-empty-state p {
          margin: 0;
          max-width: 400px;
        }

        .professional-loading-state {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-8);
          gap: var(--space-3);
          background: var(--surface);
          margin: var(--space-4);
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
          animation: fadeIn var(--duration-300) var(--ease-out);
        }

        .loading-spinner {
          animation: spin 1s linear infinite;
          color: var(--primary);
          flex-shrink: 0;
        }

        .professional-end-state {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-4);
          background: var(--surface);
          margin: var(--space-4);
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
          animation: fadeIn var(--duration-300) var(--ease-out);
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(var(--space-2));
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInFromLeft {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.1);
          }
        }

        /* ===================================
           ANIMATIONS & INTERACTIONS
           Smooth Professional Transitions
           ===================================== */

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* Smooth scrollbar styling */
        .professional-table-body::-webkit-scrollbar {
          width: 8px;
        }

        .professional-table-body::-webkit-scrollbar-track {
          background: var(--surface);
          border-radius: var(--radius-full);
        }

        .professional-table-body::-webkit-scrollbar-thumb {
          background: var(--border-strong);
          border-radius: var(--radius-full);
          transition: background var(--duration-150) var(--ease-out);
        }

        .professional-table-body::-webkit-scrollbar-thumb:hover {
          background: var(--text-tertiary);
        }

        /* ===================================
           RESPONSIVE DESIGN
           Mobile-First Approach
           ===================================== */

        @media (max-width: 640px) {
          .professional-table-container {
            padding: 0;
          }

          .filter-chips-bar {
            padding: var(--space-2) var(--space-3);
            flex-direction: column;
            align-items: flex-start;
            gap: var(--space-2);
            min-height: auto;
            overflow-x: visible;
          }

          .chips-container {
            width: 100%;
            flex-wrap: wrap;
            gap: var(--space-1-5);
          }

          .chip {
            padding: var(--space-1) var(--space-2);
            font-size: var(--text-xs);
          }

          .chip-total .chip-value {
            font-size: var(--text-md);
          }

          .chip-value {
            font-size: var(--text-xs);
          }

          .chip-label {
            font-size: var(--text-2xs);
          }

          .chip-icon {
            font-size: var(--text-xs);
          }

          .status-actions {
            width: 100%;
            justify-content: flex-start;
            flex-wrap: wrap;
            gap: var(--space-2);
          }

          .selected-indicator {
            padding: var(--space-1) var(--space-2);
            font-size: var(--text-xs);
          }

          .filter-active {
            padding: var(--space-1) var(--space-2);
            font-size: var(--text-xs);
          }

          .status-actions {
            width: 100%;
            justify-content: flex-end;
          }

          .count-number {
            font-size: var(--text-md);
          }

          .selected-count,
          .filter-indicator {
            padding: var(--space-1) var(--space-2);
          }

          .selection-indicator,
          .filter-text {
            font-size: var(--text-xs);
          }

          .clear-selection-btn {
            padding: var(--space-1) var(--space-2);
            font-size: var(--text-xs);
          }

          .professional-table-card {
            border-radius: var(--radius-md);
            margin: 0;
          }

          .table-status-bar {
            border-radius: var(--radius-md) var(--radius-md) 0 0;
          }

          .table-footer {
            border-radius: 0 0 var(--radius-md) var(--radius-md);
            padding: var(--space-2) var(--space-3);
            flex-direction: column;
            align-items: flex-start;
            gap: var(--space-2);
            min-height: auto;
          }

          .footer-info {
            width: 100%;
            flex-direction: column;
            align-items: flex-start;
            gap: var(--space-1);
          }

          .footer-actions {
            width: 100%;
            justify-content: flex-start;
          }

          .footer-text,
          .footer-selection {
            font-size: var(--text-xs);
          }

          .sort-indicator {
            font-size: var(--text-2xs);
            padding: var(--space-0-5) var(--space-1-5);
          }

          .professional-table-card {
            border-radius: var(--radius-md);
            margin: 0;
          }

          .professional-table-header {
            padding: var(--space-3) var(--space-3);
            gap: var(--space-1);
          }

          .header-filter {
            font-size: var(--text-2xs);
            padding: var(--space-1-5) var(--space-2);
          }

          .professional-empty-state {
            padding: var(--space-8) var(--space-4);
          }

          .empty-icon {
            font-size: 36px;
          }
        }

        /* ===================================
           ACCESSIBILITY ENHANCEMENTS
           Professional Standards
           ===================================== */

        .professional-checkbox:focus-visible {
          outline: 2px solid var(--focus-ring);
          outline-offset: var(--focus-ring-offset);
        }

        .professional-header-cell:focus-visible {
          outline: 2px solid var(--focus-ring);
          outline-offset: var(--focus-ring-offset);
          border-radius: var(--radius-sm);
        }

        .header-filter:focus-visible {
          outline: 2px solid var(--focus-ring);
          outline-offset: var(--focus-ring-offset);
        }

        /* High contrast mode support */
        @media (prefers-contrast: high) {
          .professional-table-card {
            border-width: 2px;
          }

          .professional-checkbox {
            border-width: 2px;
          }

          .header-filter {
            border-width: 2px;
          }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div >
  );
}
