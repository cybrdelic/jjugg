import { useTheme } from '@/contexts/ThemeContext';
import { Application, ApplicationStage } from '@/types';
import { ArrowDown, ArrowUp, Loader2 } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ApplicationTableRow from './ApplicationTableRow';

interface VirtualizedApplicationsTableProps {
  applications: Application[];
  visibleColumns: string[];
  sortConfig: { column: keyof Application | 'company.name'; direction: 'asc' | 'desc' };
  selectedRows: string[];
  isAutosizeEnabled: boolean;
  tableViewDensity: 'compact' | 'comfortable' | 'spacious';
  isMobileView: boolean;
  mounted: boolean;
  inlineEditingId: string | null;
  activeStageDropdown: string | null;
  isLoading: boolean;
  loadingMore?: boolean;
  hasMore: boolean;
  totalCount?: number;
  onSort: (column: keyof Application | 'company.name') => void;
  onRowSelect: (appId: string, selected: boolean) => void;
  onBulkRowSelect?: (appIds: string[], selected: boolean) => void;
  onRowClick: (appId: string, e: React.MouseEvent) => void;
  onContextMenu: (appId: string, e: React.MouseEvent) => void;
  onStageClick: (appId: string, e: React.MouseEvent) => void;
  onStageChange: (appId: string, stage: ApplicationStage) => void;
  tableRef: React.RefObject<HTMLDivElement | null>;
  stagesOrder: ApplicationStage[];
  itemHeight?: number; // base (comfortable)
  overscan?: number;
  onLoadMore?: () => void | Promise<void>;
}

// Minimal virtualizer -------------------------------------------------
function useVirtual(items: Application[], rowHeight: number, overscan: number) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerHRef = useRef(600);
  const setContainerHeight = (h: number) => { containerHRef.current = h; };

  const snapshot = useMemo(() => {
    const h = containerHRef.current;
    if (!h) return { start: 0, end: 0, offset: 0, items: [] as Application[], totalHeight: items.length * rowHeight };
    const start = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
    const viewportCount = Math.ceil(h / rowHeight);
    const end = Math.min(items.length, start + viewportCount + overscan * 2);
    return {
      start,
      end,
      offset: start * rowHeight,
      items: items.slice(start, end),
      totalHeight: items.length * rowHeight
    };
  }, [items, rowHeight, overscan, scrollTop]);

  return { virtual: snapshot, setScrollTop, setContainerHeight };
}

export function VirtualizedApplicationsTable(props: VirtualizedApplicationsTableProps) {
  const {
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
    loadingMore,
    hasMore,
    stagesOrder,
    tableRef,
    itemHeight = 56,
    overscan = 8,
    onSort,
    onRowSelect,
    onBulkRowSelect,
    onLoadMore,
    onRowClick,
    onContextMenu,
    onStageClick,
    onStageChange,
    totalCount
  } = props;

  const { mode } = useTheme();
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadLockRef = useRef(false);
  const lastLenRef = useRef(0);

  const adjustedRowHeight = useMemo(() => (
    tableViewDensity === 'compact' ? Math.round(itemHeight * 0.85) :
    tableViewDensity === 'spacious' ? Math.round(itemHeight * 1.35) : itemHeight
  ), [itemHeight, tableViewDensity]);

  const rowGridTemplate = useMemo(() => {
    if (isAutosizeEnabled) return '36px repeat(8, minmax(100px, auto))';
    if (tableViewDensity === 'compact') return '32px minmax(120px, 2fr) minmax(160px, 2.5fr) minmax(80px, 1.2fr) minmax(70px, 1.5fr) minmax(60px, 1fr) minmax(60px, 1fr) minmax(60px, 1fr) minmax(50px, 0.8fr)';
    return '36px minmax(140px, 2fr) minmax(180px, 2.5fr) minmax(100px, 1.2fr) minmax(90px, 1.5fr) minmax(70px, 1fr) minmax(70px, 1fr) minmax(70px, 1fr) minmax(60px, 0.8fr)';
  }, [isAutosizeEnabled, tableViewDensity]);

  const { virtual, setScrollTop, setContainerHeight } = useVirtual(applications, adjustedRowHeight, overscan);

  // Measure container height
  useEffect(() => {
    const el = scrollRef.current; if (!el) return;
    const update = () => setContainerHeight(el.clientHeight);
    update();
    const ro = new ResizeObserver(update); ro.observe(el);
    return () => ro.disconnect();
  }, [setContainerHeight]);

  const tryLoadMore = useCallback(() => {
    if (!onLoadMore || !hasMore || loadLockRef.current || isLoading || loadingMore) return;
    loadLockRef.current = true;
    lastLenRef.current = applications.length;
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log('[VirtualTable] Trigger loadMore (apps:', applications.length, ')');
    }
    Promise.resolve(onLoadMore()).finally(() => setTimeout(() => { loadLockRef.current = false; }, 120));
  }, [onLoadMore, hasMore, isLoading, loadingMore, applications.length]);

  // Scroll trigger
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    setScrollTop(el.scrollTop);
    const distanceFromBottom = el.scrollHeight - (el.scrollTop + el.clientHeight);
    if (distanceFromBottom < adjustedRowHeight * 6 && applications.length !== lastLenRef.current) {
      tryLoadMore();
    }
  }, [adjustedRowHeight, applications.length, tryLoadMore, setScrollTop]);

  // Autofill trigger (tall viewport)
  useEffect(() => {
    const el = scrollRef.current; if (!el) return;
    if (hasMore && !isLoading && !loadingMore && el.scrollHeight - el.clientHeight < adjustedRowHeight * 4) {
      tryLoadMore();
    }
  }, [applications.length, hasMore, isLoading, loadingMore, adjustedRowHeight, tryLoadMore]);

  // IntersectionObserver sentinel (robust fallback)
  useEffect(() => {
    if (!hasMore || isLoading || loadingMore) return;
    const sentinel = sentinelRef.current; if (!sentinel) return;
    const root = scrollRef.current || undefined;
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          tryLoadMore();
        }
      }
    }, { root, rootMargin: '200px 0px', threshold: 0 });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoading, loadingMore, tryLoadMore]);

  // Sorting helpers
  const getSortIcon = useCallback((col: keyof Application | 'company.name') => {
    if (sortConfig.column !== col) return <ArrowUp size={12} style={{ opacity: 0.3 }} />;
    return sortConfig.direction === 'asc' ? <ArrowUp size={12} style={{ color: 'var(--primary)' }} /> : <ArrowDown size={12} style={{ color: 'var(--primary)' }} />;
  }, [sortConfig]);

  const formatHeader = useCallback((c: string) => {
    switch (c) {
      case 'company':
      case 'company.name': return 'Company';
      case 'position': return 'Position';
      case 'dateApplied': return 'Date Applied';
      case 'stage': return 'Stage';
      case 'tasks': return 'Tasks';
      case 'location': return 'Location';
      case 'salary': return 'Salary';
      case 'bonus': return 'Bonus';
      default: return c.charAt(0).toUpperCase() + c.slice(1);
    }
  }, []);

  // Selection
  const selectAllState = useMemo(() => ({
    checked: selectedRows.length > 0 && selectedRows.length === applications.length,
    indeterminate: selectedRows.length > 0 && selectedRows.length < applications.length
  }), [selectedRows.length, applications.length]);

  const handleSelectAll = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    if (onBulkRowSelect) onBulkRowSelect(applications.map(a => a.id), checked);
    else applications.forEach(a => onRowSelect(a.id, checked));
  }, [applications, onBulkRowSelect, onRowSelect]);

  if (applications.length === 0 && !isLoading) {
    return (
      <div className="professional-empty-state">
        <div className="empty-icon">📋</div>
        <h3 className="text-h3">No applications found</h3>
        <p className="text-body text-secondary">Create your first job application to begin tracking.</p>
      </div>
    );
  }

  return (
    <div data-theme={mode} className="professional-table-container">
      <div className="professional-table-card" ref={tableRef}>
        {/* Header */}
        <div className={`professional-table-header ${isAutosizeEnabled ? 'autosize' : ''}`} style={{ gridTemplateColumns: rowGridTemplate }}>
          <div className="header-cell-select">
            <input
              type="checkbox"
              className="professional-checkbox"
              checked={selectAllState.checked}
              ref={el => { if (el) el.indeterminate = selectAllState.indeterminate; }}
              onChange={handleSelectAll}
            />
          </div>
          {visibleColumns.map(col => (
            <div key={col} className={`professional-header-cell ${sortConfig.column === col ? 'sorted' : ''}`} onClick={() => onSort(col as any)}>
              <div className="header-label">
                <span className="text-label">{formatHeader(col)}</span>
                {getSortIcon(col as any)}
              </div>
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="professional-table-body virtualized" ref={scrollRef} onScroll={handleScroll} style={{ position: 'relative', height: '600px', overflowY: 'auto' }}>
          <div style={{ height: virtual.totalHeight, position: 'relative' }}>
            <div style={{ transform: `translateY(${virtual.offset}px)` }}>
              {virtual.items.map((app, i) => {
                const realIndex = virtual.start + i;
                return (
                  <ApplicationTableRow
                    key={`${app.id}-${app.dateApplied}`}
                    application={app}
                    visibleColumns={visibleColumns}
                    isSelected={selectedRows.includes(app.id)}
                    isLastRow={realIndex === applications.length - 1}
                    mounted={mounted}
                    isMobileView={isMobileView}
                    isAutosizeEnabled={isAutosizeEnabled}
                    tableViewDensity={tableViewDensity}
                    inlineEditingId={inlineEditingId}
                    activeStageDropdown={activeStageDropdown}
                    animationDelay={0}
                    onSelect={(s: boolean) => onRowSelect(app.id, s)}
                    onRowClick={(e: React.MouseEvent) => onRowClick(app.id, e)}
                    onContextMenu={(e: React.MouseEvent) => onContextMenu(app.id, e)}
                    onStageClick={(e: React.MouseEvent) => onStageClick(app.id, e)}
                    onStageChange={(st: ApplicationStage) => onStageChange(app.id, st)}
                    stagesOrder={stagesOrder}
                  />
                );
              })}
            </div>
          </div>
          {(loadingMore || (isLoading && applications.length > 0)) && (
            <div className="professional-loading-state" style={{ margin: '12px' }}>
              <Loader2 size={18} className="loading-spinner" />
              <span className="text-body-sm text-secondary">Loading more…</span>
            </div>
          )}
          {!hasMore && applications.length > 0 && (
            <div className="professional-end-state" style={{ padding: '12px', textAlign: 'center' }}>
              <span className="text-caption">All applications loaded</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="table-footer">
          <div className="footer-info">
            <span className="footer-text">Showing {applications.length}{typeof totalCount === 'number' ? ` of ${totalCount}` : ''} applications</span>
            {selectedRows.length > 0 && <span className="footer-selection">• {selectedRows.length} selected</span>}
            {isLoading && applications.length === 0 && <span className="text-caption">Loading…</span>}
          </div>
          <div className="footer-actions">
            {sortConfig.column && (
              <span className="sort-indicator">Sorted by {formatHeader(sortConfig.column as string)} ({sortConfig.direction === 'asc' ? 'A-Z' : 'Z-A'})</span>
            )}
            {hasMore && !isLoading && !loadingMore && (
              <button className="load-more-btn" onClick={() => tryLoadMore()} type="button">Load more</button>
            )}
          </div>
        </div>
        {/* Sentinel for intersection observer */}
        {hasMore && <div ref={sentinelRef} style={{ height: 1 }} />}
      </div>

      <style jsx>{`
        .professional-table-container { width: 100%; max-width: 100%; overflow: hidden; }
        .professional-table-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; position: relative; }
        .professional-table-card::before { content: ''; position: absolute; top:0; left:0; right:0; height:2px; background: linear-gradient(90deg,var(--primary),var(--accent)); }
        .professional-table-header { display:grid; align-items:center; padding: var(--space-2) var(--space-3); background: var(--surface); border-bottom:1px solid var(--border); gap: var(--space-2); position:sticky; top:0; z-index:5; }
        .professional-table-header.autosize { grid-template-columns: 48px repeat(8,minmax(100px,auto)); }
        .header-cell-select { display:flex; align-items:center; justify-content:center; min-width:48px; }
        .professional-header-cell { display:flex; flex-direction:column; gap:4px; cursor:pointer; position:relative; }
        .professional-header-cell:hover { transform: translateY(-1px); }
        .header-label { display:flex; align-items:center; gap:6px; min-height:18px; }
        .text-label { font-family: var(--font-interface); font-size: var(--text-xs); font-weight:600; letter-spacing:.05em; text-transform:uppercase; color: var(--text-secondary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .professional-header-cell.sorted .text-label { color: var(--primary); }
        .professional-header-cell.sorted::after { content:''; position:absolute; inset:auto 0 -8px 0; height:2px; background: linear-gradient(90deg,var(--primary),color-mix(in srgb,var(--primary) 25%,transparent)); }
        .professional-checkbox { width:18px; height:18px; appearance:none; background:var(--surface); border:1.5px solid var(--border-strong); border-radius:4px; cursor:pointer; position:relative; transition:all .15s; }
        .professional-checkbox::after { content:''; width:10px; height:6px; border:2px solid transparent; border-top:none; border-right:none; position:absolute; top:4px; left:3px; transform:rotate(-45deg) scale(0); transition:transform .15s; }
        .professional-checkbox:checked { background:var(--primary); border-color:var(--primary); }
        .professional-checkbox:checked::after { border-color:var(--text-inverse); transform:rotate(-45deg) scale(1); }
        .professional-table-body.virtualized { font-family: var(--font-interface); font-size: var(--text-sm); line-height:1.35; background: var(--background); }
        .professional-loading-state, .professional-end-state { display:flex; align-items:center; justify-content:center; gap:8px; padding:10px; color: var(--text-tertiary); }
        .loading-spinner { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .table-footer { display:flex; align-items:center; justify-content:space-between; padding: var(--space-3) var(--space-4); background: var(--surface); border:1px solid var(--border); border-top:none; gap: var(--space-4); }
        .footer-info { display:flex; align-items:center; gap: var(--space-2); flex:1; }
        .footer-text, .footer-selection { font-size: var(--text-sm); font-family: var(--font-interface); }
        .footer-selection { color: var(--primary); }
        .sort-indicator { font-size: var(--text-xs); font-family: var(--font-interface); background: var(--background); padding:4px 8px; border-radius:999px; border:1px solid var(--border); color: var(--text-tertiary); }
  .load-more-btn { font-size: var(--text-xs); padding: 6px 10px; background: var(--background); border:1px solid var(--border); border-radius: var(--radius-sm); cursor:pointer; }
  .load-more-btn:hover { border-color: var(--primary); color: var(--primary); }
        .professional-empty-state { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:80px 40px; background: var(--surface); border-radius: var(--radius-lg); gap:16px; }
        .empty-icon { font-size:48px; opacity:.4; }
      `}</style>
    </div>
  );
}

export default VirtualizedApplicationsTable;
