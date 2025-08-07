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
  onRowClick: (appId: string, e: React.MouseEvent) => void;
  onContextMenu: (appId: string, e: React.MouseEvent) => void;
  onStageClick: (appId: string, e: React.MouseEvent) => void;
  onStageChange: (appId: string, stage: ApplicationStage) => void;

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
  onRowClick,
  onContextMenu,
  onStageClick,
  onStageChange,
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

  // Calculate visible items with improved performance
  const ROW_HEIGHT = tableViewDensity === 'compact' ? 48 : tableViewDensity === 'spacious' ? 64 : 56;
  const OVERSCAN = 3; // Reduced overscan for better performance
  const VIRTUAL_THRESHOLD = 20; // Lower threshold for more aggressive virtualization

  const visibleRange = useMemo(() => {
    if (applications.length <= VIRTUAL_THRESHOLD) {
      // For small datasets, render all
      return { start: 0, end: applications.length, offset: 0 };
    }

    const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
    const endIndex = Math.min(
      applications.length,
      startIndex + Math.ceil(containerHeight / ROW_HEIGHT) + OVERSCAN * 2
    );

    return {
      start: startIndex,
      end: endIndex,
      offset: startIndex * ROW_HEIGHT
    };
  }, [scrollTop, containerHeight, applications.length, ROW_HEIGHT]);

  // Handle scroll with throttling for better performance
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop;

    // Only update if scroll changed significantly (reduces re-renders)
    if (Math.abs(newScrollTop - scrollTop) > ROW_HEIGHT / 4) {
      setScrollTop(newScrollTop);
    }

    measureScrollPerformance(() => {
      // Handle scroll performance measurement
    });
  }, [measureScrollPerformance, scrollTop, ROW_HEIGHT]);

  // Measure container height
  useEffect(() => {
    if (bodyRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setContainerHeight(entry.contentRect.height);
        }
      });
      resizeObserver.observe(bodyRef.current);
      return () => resizeObserver.disconnect();
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
    applications.forEach(app => {
      onRowSelect(app.id, allSelected);
    });
  }, [applications, onRowSelect]);

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
          style={{ contain: 'layout style paint' }} // CSS containment for better performance
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
                      key={`${app.id}-${app.dateApplied}`}
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

        .professional-table-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          overflow: hidden;
          transition: all var(--duration-150) var(--ease-out);
          box-shadow: var(--shadow-sm);
          position: relative;
        }

        .professional-table-card:hover {
          border-color: var(--border-strong);
          box-shadow: var(--shadow-md);
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
    </div>
  );
}
