/**
 * Virtualized Applications Table Component — Polished Typography & Hierarchy
 * Drop-in replacement: same props & behavior, upgraded visuals/scanability.
 */

import React, { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import { Application, ApplicationStage } from '@/types';
import ApplicationTableRow from './ApplicationTableRow';

interface VirtualizedApplicationsTableProps {
  // Data
  applications: Application[];
  visibleColumns: string[];
  sortConfig: { column: keyof Application | 'company.name'; direction: 'asc' | 'desc' };
  selectedRows: string[];

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
  showPlaceholders?: boolean;

  // Handlers
  onSort: (column: keyof Application | 'company.name') => void;
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

  // Virtualization settings
  enableVirtualization?: boolean;
  itemHeight?: number;
  overscan?: number;
}

// ---- Custom hook for virtual scrolling
function useVirtualization(
  items: Application[],
  containerHeight: number,
  itemHeight: number,
  overscan: number = 5
) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleItems = useMemo(() => {
    if (containerHeight === 0) return { startIndex: 0, endIndex: 0, items: [], offsetY: 0, totalHeight: 0 };

    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    return {
      startIndex,
      endIndex,
      items: items.slice(startIndex, endIndex + 1),
      offsetY: startIndex * itemHeight,
      totalHeight: items.length * itemHeight
    };
  }, [items, containerHeight, itemHeight, scrollTop, overscan]);

  return { visibleItems, setScrollTop };
}

export function VirtualizedApplicationsTable({
  applications,
  visibleColumns,
  sortConfig,
  selectedRows,
  isAutosizeEnabled,
  tableViewDensity,
  isMobileView,
  mounted,
  inlineEditingId,
  activeStageDropdown,
  isLoading,
  hasMore,
  stagesOrder,
  tableRef,
  lastRowRef,
  enableVirtualization = true,
  itemHeight = 56,
  overscan = 8,
  showPlaceholders = true,
  onSort,
  onRowSelect,
  onRowClick,
  onContextMenu,
  onStageClick,
  onStageChange,
}: VirtualizedApplicationsTableProps) {
  const { mode } = useTheme();
  const [containerHeight, setContainerHeight] = useState(600);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [debugInfo, setDebugInfo] = useState<{
    visibleStart: number;
    visibleEnd: number;
    totalItems: number;
    containerHeight: number;
  } | null>(null);

  // Adjust item height based on density
  const adjustedItemHeight = useMemo(() => {
    switch (tableViewDensity) {
      case 'compact': return Math.round(itemHeight * 0.8);
      case 'spacious': return Math.round(itemHeight * 1.4);
      default: return itemHeight;
    }
  }, [itemHeight, tableViewDensity]);

  // Match ApplicationTableRow grid templates to avoid layout shift
  const rowGridTemplate = useMemo(() => {
    if (isAutosizeEnabled) return '36px repeat(8, minmax(100px, auto))';
    if (tableViewDensity === 'compact') {
      return '32px minmax(120px, 2fr) minmax(160px, 2.5fr) minmax(80px, 1.2fr) minmax(70px, 1.5fr) minmax(60px, 1fr) minmax(60px, 1fr) minmax(60px, 1fr) minmax(50px, 0.8fr)';
    }
    return '36px minmax(140px, 2fr) minmax(180px, 2.5fr) minmax(100px, 1.2fr) minmax(90px, 1.5fr) minmax(70px, 1fr) minmax(70px, 1fr) minmax(70px, 1fr) minmax(60px, 0.8fr)';
  }, [isAutosizeEnabled, tableViewDensity]);

  // Measure container height
  useEffect(() => {
    if (!enableVirtualization) return;

    const measureHeight = () => {
      if (containerRef.current) {
        const h = containerRef.current.clientHeight;
        if (h > 0) setContainerHeight(h);
      }
    };

    measureHeight();
    const resizeObserver = new ResizeObserver(measureHeight);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [enableVirtualization]);

  // Virtual scrolling logic
  const { visibleItems, setScrollTop } = useVirtualization(
    applications,
    containerHeight,
    adjustedItemHeight,
    overscan
  );

  // Update debug info whenever visible range or container metrics change
  useEffect(() => {
    const start = (visibleItems as any).startIndex ?? 0;
    const end = (visibleItems as any).endIndex ?? Math.max(0, applications.length - 1);
    setDebugInfo({
      visibleStart: start,
      visibleEnd: end,
      totalItems: applications.length,
      containerHeight
    });
  }, [applications.length, containerHeight, visibleItems]);

  // Memoized helpers
  const getSortIcon = useCallback((column: keyof Application | 'company.name') => {
    if (sortConfig.column !== column) {
      return <ArrowUp size={12} style={{ opacity: 0.35 }} />;
    }
    return sortConfig.direction === 'asc'
      ? <ArrowUp size={12} style={{ color: 'var(--primary)' }} />
      : <ArrowDown size={12} style={{ color: 'var(--primary)' }} />;
  }, [sortConfig.column, sortConfig.direction]);

  const formatColumnHeader = useCallback((column: string): string => {
    switch (column) {
      case 'company': return 'Company';
      case 'company.name': return 'Company';
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

  const selectAllState = useMemo(() => ({
    checked: selectedRows.length === applications.length && applications.length > 0,
    indeterminate: selectedRows.length > 0 && selectedRows.length < applications.length
  }), [selectedRows.length, applications.length]);

  const handleSelectAll = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const allSelected = e.target.checked;
    applications.forEach(app => {
      onRowSelect(app.id, allSelected);
    });
  }, [applications, onRowSelect]);

  const handleColumnSort = useCallback((column: keyof Application | 'company.name') => {
    onSort(column);
  }, [onSort]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (enableVirtualization) {
      setScrollTop(e.currentTarget.scrollTop);
    }
    const y = e.currentTarget.scrollTop;
    // avoid re-renders: only toggle when threshold crosses 0
    if (!scrolled && y > 0) setScrolled(true);
    else if (scrolled && y === 0) setScrolled(false);
  }, [enableVirtualization, setScrollTop, scrolled]);

  // Helper to mark a row element with selection/indices (without requiring changes to ApplicationTableRow)
  const enhanceRow = (node: React.ReactElement<any>, isSelected: boolean, index: number) => {
    // We attempt to pass through data-attrs/className; if the row component spreads props, it will apply.
    const baseClass = (node.props && node.props.className) ? node.props.className : '';
    return React.cloneElement(node as React.ReactElement<any>, {
      'data-row': true,
      'data-selected': isSelected ? 'true' : 'false',
      'data-index': index,
      className: `${baseClass} jjugg-row`,
    });
  };

  // Render items (virtualized or normal)
  const renderTableBody = () => {
    if (!enableVirtualization || applications.length <= 50) {
      // Simple rendering for small datasets
      const rows = applications.map((app, index) => {
        const base = (
          <ApplicationTableRow
            key={`${app.id}-${app.dateApplied}`}
            application={app}
            visibleColumns={visibleColumns}
            isSelected={selectedRows.includes(app.id)}
            isLastRow={index === applications.length - 1}
            mounted={mounted}
            isMobileView={isMobileView}
            isAutosizeEnabled={isAutosizeEnabled}
            tableViewDensity={tableViewDensity}
            inlineEditingId={inlineEditingId}
            activeStageDropdown={activeStageDropdown}
            animationDelay={Math.min(index * 0.02, 1)}
            onSelect={(selected: boolean) => onRowSelect(app.id, selected)}
            onRowClick={(e: React.MouseEvent) => onRowClick(app.id, e)}
            onContextMenu={(e: React.MouseEvent) => onContextMenu(app.id, e)}
            onStageClick={(e: React.MouseEvent) => onStageClick(app.id, e)}
            onStageChange={(stage: ApplicationStage) => onStageChange(app.id, stage)}
            stagesOrder={stagesOrder}
            ref={index === applications.length - 1 ? lastRowRef : null}
          />
        );
        return enhanceRow(base, selectedRows.includes(app.id), index);
      });

      if (applications.length === 0 && (isLoading || showPlaceholders)) {
        const phCount = Math.min(Math.max(Math.ceil(containerHeight / adjustedItemHeight) || 8, 6), 20);
        rows.push(
          ...Array.from({ length: phCount }).map((_, i) => (
            <div
              key={`ph-${i}`}
              className="placeholder-row"
              style={{
                height: adjustedItemHeight,
                gridTemplateColumns: rowGridTemplate
              } as React.CSSProperties}
            >
              <div className="placeholder-cell checkbox" />
              {visibleColumns.map((_, j) => (
                <div key={`phc-${i}-${j}`} className="placeholder-cell">
                  <div className={`skeleton-line ${j % 3 === 0 ? 'short' : j % 3 === 1 ? 'medium' : ''}`} />
                </div>
              ))}
            </div>
          ))
        );
      }
      return rows;
    }

    // Virtual rendering for large datasets
    const { items, offsetY, totalHeight, startIndex } = visibleItems as any;

    return (
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {(items as Application[]).map((app: Application, index: number) => {
            const actualIndex = startIndex + index;
            const base = (
              <ApplicationTableRow
                key={`${app.id}-${app.dateApplied}-virtual`}
                application={app}
                visibleColumns={visibleColumns}
                isSelected={selectedRows.includes(app.id)}
                isLastRow={actualIndex === applications.length - 1}
                mounted={mounted}
                isMobileView={isMobileView}
                isAutosizeEnabled={isAutosizeEnabled}
                tableViewDensity={tableViewDensity}
                inlineEditingId={inlineEditingId}
                activeStageDropdown={activeStageDropdown}
                animationDelay={0}
                onSelect={(selected: boolean) => onRowSelect(app.id, selected)}
                onRowClick={(e: React.MouseEvent) => onRowClick(app.id, e)}
                onContextMenu={(e: React.MouseEvent) => onContextMenu(app.id, e)}
                onStageClick={(e: React.MouseEvent) => onStageClick(app.id, e)}
                onStageChange={(stage: ApplicationStage) => onStageChange(app.id, stage)}
                stagesOrder={stagesOrder}
                ref={actualIndex === applications.length - 1 ? lastRowRef : null}
              />
            );
            return enhanceRow(base, selectedRows.includes(app.id), actualIndex);
          })}
        </div>
      </div>
    );
  };

  if (applications.length === 0 && !isLoading && !showPlaceholders) {
    return (
      <div className="professional-empty-state">
        <div className="empty-icon">📋</div>
        <h3 className="text-h3">No applications found</h3>
        <p className="text-body text-secondary">Get started by creating your first job application</p>
        <button className="clean-button">
          <span>Add Application</span>
        </button>
        <style jsx>{`
          .professional-empty-state {
            display: grid; place-items: center; gap: 10px;
            padding: 40px; border: 1px dashed var(--border); border-radius: var(--radius-lg);
            background: var(--surface);
          }
          .empty-icon { font-size: 24px; }
          .text-h3 { font-size: 16px; font-weight: 600; color: var(--text-primary); }
          .text-body { font-size: 13px; color: var(--text-secondary); }
          .clean-button { appearance: none; border: 1px solid var(--border); background: var(--background);
            padding: 8px 12px; border-radius: 10px; cursor: pointer; }
          .clean-button:hover { border-color: var(--primary); }
        `}</style>
      </div>
    );
  }

  return (
    <div data-theme={mode} className="professional-table-container">
      <div
        className="professional-table-card"
        ref={tableRef}
        // Expose grid template to header/body with a CSS var (keeps header/body aligned)
        style={{ ['--grid' as any]: rowGridTemplate } as React.CSSProperties}
      >
        {/* Professional Table Header */}
        <div className={`professional-table-header ${isAutosizeEnabled ? 'autosize' : ''} ${scrolled ? 'elevated' : ''}`}>
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
              aria-label="Select all"
            />
          </div>

          {/* Column Headers */}
          {visibleColumns.map(column => {
            const isNumeric = ['salary', 'bonus', 'tasks'].includes(column);
            const colKey = column as keyof Application | 'company.name';
            return (
              <div
                key={column}
                className={`professional-header-cell ${sortConfig.column === column ? 'sorted' : ''} ${isNumeric ? 'col--numeric' : ''}`}
                onClick={() => handleColumnSort(colKey)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleColumnSort(colKey); }}
                aria-sort={sortConfig.column === column ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                aria-label={`Sort by ${formatColumnHeader(column)}`}
              >
                <div className="header-label">
                  <span className="text-label">
                    {formatColumnHeader(column)}
                  </span>
                  {getSortIcon(colKey)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Professional Table Body with Virtual Scrolling */}
        <div
          className="professional-table-body virtualized"
          ref={containerRef}
          onScroll={handleScroll}
          style={{
            height: enableVirtualization ? '600px' : undefined,
            overflowY: 'auto'
          }}
        >
          {renderTableBody()}

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

        {/* Table Footer with Additional Info and Virtualization Debug */}
        <div className="table-footer">
          <div className="footer-info">
            <span className="footer-text">
              Showing {applications.length} of {applications.length} applications
            </span>
            {selectedRows.length > 0 && (
              <span className="footer-selection">• {selectedRows.length} selected</span>
            )}
            {debugInfo && (
              <span className="debug-info">
                • Virtual: {debugInfo.visibleStart}-{debugInfo.visibleEnd} of {debugInfo.totalItems}
                (height: {Math.round(debugInfo.containerHeight)})
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
      </div>

      <style jsx>{`
        /* =========================
           Polished Type & Hierarchy
           ========================= */

        :root {
          --ui-font: var(--font-interface, Inter, ui-sans-serif, system-ui, sans-serif);
          --mono-font: var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace);
          --text-xxs: 11px;
          --text-xs: 12px;
          --text-sm: 13px;
          --text-md: 14.5px;
          --lh-tight: 1.15;
          --lh-snug: 1.25;
          --lh-normal: 1.4;
        }

        /* Container & Card */
        .professional-table-container { width: 100%; max-width: 100%; overflow: hidden; contain: layout style paint; }
        .professional-table-card {
          position: relative;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          overflow: hidden;
          transition: all var(--duration-150) var(--ease-out);
          box-shadow: var(--shadow-sm);
          transform: translateZ(0);
        }
        .professional-table-card:hover { border-color: var(--border-strong); box-shadow: var(--shadow-md); }
        .professional-table-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, var(--primary), var(--accent)); opacity: 0.8;
        }

        /* Header (sticky rail) */
        .professional-table-header {
          display: grid;
          grid-template-columns: var(--grid, 48px minmax(150px, 2fr) minmax(200px, 2.5fr) minmax(120px, 1.2fr) minmax(100px, 1.5fr) minmax(80px, 1fr) minmax(80px, 1fr) minmax(80px, 1fr) minmax(60px, 0.8fr));
          align-items: center;
          padding: var(--space-2) var(--space-3);
          background: color-mix(in srgb, var(--surface) 88%, transparent);
          border-bottom: 1px solid var(--border);
          gap: var(--space-2);
          position: sticky;
          top: 0;
          z-index: 10;
          overflow: hidden;
          backdrop-filter: saturate(140%) blur(6px);
          -webkit-backdrop-filter: saturate(140%) blur(6px);
        }
        .professional-table-header.autosize { grid-template-columns: 48px repeat(8, minmax(100px, auto)); }
        .professional-table-header.elevated { box-shadow: 0 6px 10px -8px rgba(0,0,0,.25); }

        .header-cell-select { display: flex; align-items: center; justify-content: center; padding: var(--space-2) 0; min-width: 48px; }

        .professional-header-cell {
          display: flex; flex-direction: column; gap: var(--space-1);
          cursor: pointer; transition: all var(--duration-150) var(--ease-out);
          min-width: 0; overflow: hidden; position: relative;
          padding: 0;
        }
        .professional-header-cell:hover { transform: translateY(-1px); }

        .header-label { display: flex; align-items: center; gap: 6px; min-height: 18px; flex-shrink: 0; }
        .header-label .text-label {
          font-family: var(--ui-font);
          font-size: var(--text-xs);
          font-weight: 600;
          line-height: var(--lh-tight);
          color: var(--text-tertiary);
          font-variant-caps: all-small-caps;
          letter-spacing: .02em;
          user-select: none;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .professional-header-cell.sorted .text-label { color: var(--primary); }

        /* Column rail for sorted column (header accent) */
        .professional-header-cell.sorted::after {
          content: "";
          position: absolute;
          inset: auto 0 -10px 0;
          height: 2px;
          background: linear-gradient(90deg, var(--primary), color-mix(in srgb, var(--primary) 20%, transparent));
          opacity: .7;
        }

        /* Calm the sort icons */
        .professional-header-cell svg {
          opacity: .45;
          transition: transform .15s var(--ease-out), opacity .15s var(--ease-out);
          flex-shrink: 0;
        }
        .professional-header-cell.sorted svg { opacity: .9; }
        .professional-header-cell:hover svg { opacity: .75; transform: translateY(-1px); }

        /* Numeric columns: right align header content */
        .professional-header-cell.col--numeric .header-label {
          justify-content: flex-end;
        }

        /* Checkbox refinement */
        .professional-checkbox {
          width: 18px; height: 18px; appearance: none;
          background: var(--surface);
          border: 1.5px solid var(--border-strong);
          border-radius: var(--radius-sm);
          cursor: pointer; transition: all var(--duration-150) var(--ease-out);
          position: relative; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
          box-shadow: 0 1px 0 rgba(0,0,0,.03) inset;
        }
        .professional-checkbox::after {
          content: ''; width: 10px; height: 6px; border: 2px solid transparent; border-top: none; border-right: none;
          transform: rotate(-45deg) scale(0); transition: transform var(--duration-150) var(--ease-out);
        }
        .professional-checkbox:checked { background: var(--primary); border-color: var(--primary); }
        .professional-checkbox:checked::after { border-color: var(--text-inverse); transform: rotate(-45deg) scale(1); }
        .professional-checkbox:hover { border-color: var(--primary); background: var(--hover-bg); transform: scale(1.05); }

        /* Body container (virtualized) */
        .professional-table-body.virtualized {
          contain: layout style paint;
          will-change: transform;
          scrollbar-gutter: stable both-edges;
          font-family: var(--ui-font);
          font-size: var(--text-sm);
          line-height: var(--lh-normal);
        }
        .professional-table-body.virtualized > div { contain: layout style paint; }

        /* Row hover + selection tokens (works if row component forwards props; otherwise still applies :hover) */
        .professional-table-body.virtualized > *:hover {
          background: color-mix(in srgb, var(--surface) 92%, var(--background));
        }
        .professional-table-body.virtualized > *.jjugg-row[data-selected="true"] {
          background: color-mix(in srgb, var(--primary) 8%, var(--surface));
          outline: 1px solid color-mix(in srgb, var(--primary) 22%, transparent);
        }

        /* Placeholder rows (body-only skeleton) */
        .placeholder-row {
          display: grid;
          gap: var(--space-3);
          align-items: center;
          padding: 0 var(--space-4);
          border-bottom: 1px dashed var(--border);
          background: var(--surface);
          grid-template-columns: var(--grid, 48px minmax(150px, 2fr) minmax(200px, 2.5fr) minmax(120px, 1.2fr) minmax(100px, 1.5fr) minmax(80px, 1fr) minmax(80px, 1fr) minmax(80px, 1fr) minmax(60px, 0.8fr));
        }
        .placeholder-cell { display: flex; align-items: center; }
        .placeholder-cell.checkbox { justify-content: center; }
        .skeleton-line {
          width: 80%; height: 12px; border-radius: var(--radius-sm); background: var(--border); position: relative; overflow: hidden;
        }
        .skeleton-line.short { width: 40%; }
        .skeleton-line.medium { width: 60%; }
        .skeleton-line::after {
          content: ''; position: absolute; inset: 0; transform: translateX(-100%);
          background: linear-gradient(90deg, rgba(200,210,220,0) 0%, rgba(200,210,220,0.35) 50%, rgba(200,210,220,0) 100%);
          animation: shimmer 700ms ease-out infinite;
        }
        @keyframes shimmer { 100% { transform: translateX(100%); } }

        /* Loading & End states */
        .professional-loading-state,
        .professional-end-state {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 10px; color: var(--text-tertiary);
        }
        .loading-spinner { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Footer */
        .table-footer {
          display: flex; align-items: center; justify-content: space-between;
          padding: var(--space-3) var(--space-4);
          background: var(--surface);
          border: 1px solid var(--border); border-top: none;
          border-radius: 0 0 var(--radius-lg) var(--radius-lg);
          gap: var(--space-4); min-height: 40px;
        }
        .footer-info { display: flex; align-items: center; gap: var(--space-2); flex: 1; }
        .footer-text { font-family: var(--ui-font); font-size: var(--text-sm); font-weight: var(--font-medium, 500); color: var(--text-secondary); }
        .footer-selection { font-family: var(--ui-font); font-size: var(--text-sm); font-weight: var(--font-medium, 500); color: var(--primary); }
        .debug-info, .sort-indicator {
          font-family: var(--mono-font);
          font-size: var(--text-xxs);
          font-weight: var(--font-medium, 500);
          color: var(--text-tertiary);
          background: var(--background);
          padding: 4px 8px;
          border-radius: 999px;
          border: 1px solid var(--border, #d1d5db);
        }
      `}</style>
    </div>
  );
}

export default VirtualizedApplicationsTable;
