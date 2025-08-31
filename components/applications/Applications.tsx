/**
 * Applications — Header upgrade (cohesive, no "idle", token-pure)
 * - Tight 2-col layout (Title+meta | Stats)
 * - Live capsule only when updates exist
 * - One-shot polite announcement; no marquee
 * - CountUp respects prefers-reduced-motion
 * - Skip link for a11y
 */

'use client';
import EnhancedSearch from '@/components/EnhancedSearch';
import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import ApplicationDetailDrawer from './ApplicationDetailDrawer';
import { ApplicationsContextMenu } from './components/ApplicationsContextMenu';
import { ApplicationsControls } from './components/ApplicationsControls';
import { TableSkeleton } from './components/ApplicationsSkeleton';
import { ApplicationsTable } from './components/ApplicationsTable';
import { FilterBuilder } from './components/FilterBuilder';
import { VirtualizedApplicationsTable } from './components/VirtualizedApplicationsTable';
import { useApplicationsLogic } from './hooks/useApplicationsLogic';
import { detectDeviceCapabilities, getAdaptivePerformanceConfig } from './utils/performanceConfig';
import { usePerformanceMonitor } from './utils/performanceMonitor';

export default function Applications() {
  const [isFilterBuilderOpen, setIsFilterBuilderOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [showOverlaySkeleton, setShowOverlaySkeleton] = useState(false);
  const SKELETON_DELAY_MS = 120;
  const SKELETON_ITEM_THRESHOLD = 80;

  const {
  filteredApplications,
  visibleApplications,
    applicationStats,
    selectedAppData,
    selectedApplications,
    applicationsByStage,
    stagesOrder,
    loading,
    error,

    // State
    searchTerm,
    viewMode,
    sortConfig,
    mounted,
    isDetailModalVisible,
    selectedRows,
    visibleColumns,
    isColumnMenuOpen,
    statusUpdates,
    isLoading,
    hasMore,
    columnFilters,
    contextMenu,
    isMobileView,
    isAutosizeEnabled,
    tableViewDensity,
    inlineEditingId,
    activeStageDropdown,
    quickFilters,
    showAdvancedFilters,

    // Refs
    tableRef,
    lastRowRef,

    // Actions
    setSearchTerm,
    setViewMode,
    setSortConfig,
    setVisibleColumns,
    setSelectedRows,
    setIsDetailModalVisible,
    setIsColumnMenuOpen,
    setContextMenu,
    setActiveStageDropdown,
    setInlineEditingId,
    setColumnFilters,
    setQuickFilters,
    setShowAdvancedFilters,
    setTableViewDensity,
    setIsMobileView,
    setIsAutosizeEnabled,
    addStatusUpdate,

    // Ops
    handleCreateApplication,
    handleDeleteApplication,
    handleBulkDelete,
    handleStageChange,
    handleBulkStageChange,
    handleBulkEdit,
    handleIncrementStage,
    handleDecrementStage,
    handleToggleShortlist,
    handleKanbanDrop,
    handleOpenDetailModal,
    handleCloseDetailModal,
    handleEditApplication,
    handleRowClick,
    handleContextMenu,
    handleStageClick,
  handleExport,
  loadMoreApplications,
  applicationsTotal,
  applicationsHasMore,
  applicationsLoadingMore,
  handleResetFilters,
  } = useApplicationsLogic();

  const isInitialLoading = loading && !mounted;
  const shouldUseVirtualization = useMemo(() => visibleApplications.length > 50, [visibleApplications.length]);
  // Basic table removed; always use styled / virtualized tables
  const useBasicTable = false;

  // IntersectionObserver for non-virtualized original table infinite scroll
  useEffect(() => {
    if (useBasicTable) return; // handled internally there
    const more = (applicationsHasMore ?? hasMore);
    if (!more || !loadMoreApplications) return;
    const sentinelEl = lastRowRef.current;
    if (!sentinelEl) return;
    let loading = false;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !loading) {
          loading = true;
          Promise.resolve(loadMoreApplications()).finally(() => { loading = false; });
        }
      });
    }, { root: tableRef.current?.closest('.table-container') || undefined, rootMargin: '400px 0px', threshold: 0 });
    obs.observe(sentinelEl);
    return () => obs.disconnect();
  }, [useBasicTable, lastRowRef, visibleApplications.length, applicationsHasMore, hasMore, loadMoreApplications, tableRef]);

  // Debug pagination state
  console.log('[Applications] Pagination state:', {
    applicationsHasMore,
    hasMore,
    applicationsTotal,
    visibleApplicationsLength: visibleApplications.length,
    filteredApplicationsLength: filteredApplications.length
  });

  useEffect(() => {
    let t: number | undefined;
    if (isPending) t = window.setTimeout(() => setShowOverlaySkeleton(true), SKELETON_DELAY_MS);
    else setShowOverlaySkeleton(false);
    return () => { if (t) window.clearTimeout(t); };
  }, [isPending]);
  const shouldShowOverlaySkeleton = isPending && showOverlaySkeleton && filteredApplications.length > SKELETON_ITEM_THRESHOLD;

  const performanceConfig = useMemo(() => {
    const d = detectDeviceCapabilities();
    return getAdaptivePerformanceConfig(filteredApplications.length, d);
  }, [filteredApplications.length]);

  const { startMeasurement, endMeasurement, generateReport } = usePerformanceMonitor('Applications');
  useEffect(() => {
    startMeasurement();
    return () => {
      endMeasurement(filteredApplications.length);
      if (process.env.NODE_ENV === 'development' && filteredApplications.length > 100) {
        console.log('Applications Performance Report:', generateReport());
      }
    };
  }, [filteredApplications.length, startMeasurement, endMeasurement, generateReport]);

  // Global dismissal
  useEffect(() => {
    const click = () => {
      if (contextMenu) setContextMenu(null);
      if (activeStageDropdown) setActiveStageDropdown(null);
      if (isColumnMenuOpen) setIsColumnMenuOpen(false);
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (contextMenu) setContextMenu(null);
        if (activeStageDropdown) setActiveStageDropdown(null);
        if (isColumnMenuOpen) setIsColumnMenuOpen(false);
        if (isDetailModalVisible) handleCloseDetailModal();
        if (selectedRows.length) setSelectedRows([]);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setSelectedRows(filteredApplications.map(a => a.id));
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedRows.length > 0) {
        e.preventDefault();
        handleBulkDelete();
      }
      if (e.key === 'Enter' && selectedRows.length === 1) {
        handleOpenDetailModal(selectedRows[0]);
      }
    };
    document.addEventListener('click', click);
    document.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('click', click);
      document.removeEventListener('keydown', key);
    };
  }, [
    contextMenu, activeStageDropdown, isColumnMenuOpen, isDetailModalVisible,
    setContextMenu, setActiveStageDropdown, setIsColumnMenuOpen, handleCloseDetailModal,
    selectedRows, setSelectedRows, filteredApplications, handleBulkDelete, handleOpenDetailModal
  ]);

  if (error) {
    return (
      <div className="applications-error">
        <div className="error-content">
          <div className="error-icon">⚠️</div>
          <h3>Unable to Load Applications</h3>
          <p>{error}</p>
          <button className="retry-button" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  // —— Header state —— //
  const hasGlobalUpdate = statusUpdates.some(u => !u.appId);
  const latestGlobalMessage = useMemo(() => {
    const msgs = statusUpdates.filter(u => !u.appId);
    return msgs.length ? msgs[msgs.length - 1].message : '';
  }, [statusUpdates]);

  // polite single-shot announcer
  const liveRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (latestGlobalMessage && liveRef.current) {
      // set text for SR, then clear after announce window
      liveRef.current.textContent = latestGlobalMessage;
      const id = window.setTimeout(() => { if (liveRef.current) liveRef.current.textContent = ''; }, 3500);
      return () => window.clearTimeout(id);
    }
  }, [latestGlobalMessage]);

  const prefersReduced = usePrefersReducedMotion();

  // Compute active filters signature for reset button visibility/count
  const activeFilters = useMemo(() => {
    const entries: Record<string, string> = {};
    if (searchTerm) entries.search = searchTerm;
    const columnFilterCount = Object.values(columnFilters).filter(Boolean).length;
    if (columnFilterCount) entries.column = String(columnFilterCount);
    if (quickFilters.stage !== 'all') entries.stage = quickFilters.stage;
    if (quickFilters.dateRange !== 'all') entries.date = quickFilters.dateRange;
    if (quickFilters.dateRange === 'custom' && (quickFilters.customDateRange?.start || quickFilters.customDateRange?.end)) entries.dateCustom = 'custom';
    if (quickFilters.salary !== 'all') entries.salary = quickFilters.salary;
    return entries;
  }, [searchTerm, columnFilters, quickFilters]);

  return (
    <div className={`applications-page ${(mounted || isInitialLoading) ? 'mounted' : ''}`}>
      {/* Skip link for a11y */}
      <a href="#apps-table" className="skip-link">Skip to applications</a>



      {/* ===== Main Content ===== */}
      <main className="main-content">
        {/* Toolbar */}
        <div className="toolbar">
          {/* place in a column */}
          <div className="toolbar-title-col">
            <h1 className="title text-h2">Applications</h1>
            <p className="subtitle text-body-sm bottom">Manage your job applications and track progress</p>
          </div>
          <div className="toolbar-search">
            <EnhancedSearch
              size="compact"
              applications={visibleApplications}
              value={searchTerm}
              quickFilters={quickFilters}
              columnFilters={columnFilters}
              onSearch={(q, payload) => {
                if (payload?.quickFilters) setQuickFilters(payload.quickFilters);
                if (payload?.columnFilters) setColumnFilters(payload.columnFilters);
                if (typeof q === 'string') setSearchTerm(q);
              }}
              placeholder="Search companies, positions, stages…"
            />
          </div>

          <ApplicationsControls
            isMobileView={isMobileView}
            isAutosizeEnabled={isAutosizeEnabled}
            tableViewDensity={tableViewDensity}
            showAdvancedFilters={showAdvancedFilters}
            isColumnMenuOpen={isColumnMenuOpen}
            quickFilters={quickFilters}
            visibleColumns={visibleColumns}
            selectedRows={selectedRows}
            selectedApplications={selectedApplications}
            activeFilters={activeFilters}
            onResetFilters={handleResetFilters}
            onMobileViewToggle={() => setIsMobileView(!isMobileView)}
            onAutosizeToggle={() => setIsAutosizeEnabled(!isAutosizeEnabled)}
            onDensityChange={setTableViewDensity}
            onQuickFiltersChange={setQuickFilters}
            onAdvancedFiltersToggle={() => setShowAdvancedFilters(!showAdvancedFilters)}
            onColumnMenuToggle={() => setIsColumnMenuOpen(!isColumnMenuOpen)}
            onVisibleColumnsChange={setVisibleColumns}
            onClearSelection={() => setSelectedRows([])}
            onBulkDelete={handleBulkDelete}
            onBulkStageChange={handleBulkStageChange}
            onExport={handleExport}
            onBulkEdit={handleBulkEdit}
          />
        </div>

        {/* Table container */}
        <div className="table-container">
          {shouldShowOverlaySkeleton && (
            <TableSkeleton
              rows={10}
              columns={visibleColumns.length || 6}
              dense={tableViewDensity === 'compact'}
              hideHeader={true}
              rowGridTemplate={
                isAutosizeEnabled
                  ? '36px repeat(8, minmax(80px, auto))'
                  : (tableViewDensity === 'compact'
                    ? '32px minmax(120px, 2fr) minmax(160px, 2.5fr) minmax(80px, 1.2fr) minmax(70px, 1.5fr) minmax(60px, 1fr) minmax(60px, 1fr) minmax(60px, 1fr) minmax(60px, 1fr) minmax(50px, 0.8fr)'
                    : '36px minmax(140px, 2fr) minmax(180px, 2.5fr) minmax(100px, 1.2fr) minmax(90px, 1.5fr) minmax(70px, 1fr) minmax(70px, 1fr) minmax(70px, 1fr) minmax(60px, 0.8fr)'
                  )
              }
            />
          )}

          {shouldUseVirtualization && performanceConfig.enableVirtualization ? (
            <VirtualizedApplicationsTable
              applications={visibleApplications}
              visibleColumns={visibleColumns}
              sortConfig={sortConfig}
              selectedRows={selectedRows}
              isAutosizeEnabled={isAutosizeEnabled}
              tableViewDensity={tableViewDensity}
              isMobileView={isMobileView}
              mounted={mounted}
              inlineEditingId={inlineEditingId}
              activeStageDropdown={activeStageDropdown}
              isLoading={isLoading || isInitialLoading}
              loadingMore={applicationsLoadingMore}
              hasMore={applicationsHasMore ?? hasMore}
              onLoadMore={loadMoreApplications}
              totalCount={applicationsTotal ?? filteredApplications.length}
              onBulkRowSelect={(ids, selected) => setSelectedRows(selected ? Array.from(new Set([...selectedRows, ...ids])) : selectedRows.filter(id => !ids.includes(id)))}
              stagesOrder={stagesOrder}
              tableRef={tableRef}
              itemHeight={performanceConfig.itemHeight}
              overscan={performanceConfig.overscan}
              onSort={(column) => {
                const newDirection = sortConfig.column === column && sortConfig.direction === 'asc' ? 'desc' : 'asc';
                setSortConfig({ column, direction: newDirection });
              }}
              onRowSelect={(appId, selected) => {
                if (selected) setSelectedRows([...selectedRows, appId]);
                else setSelectedRows(selectedRows.filter(id => id !== appId));
              }}
              onRowClick={handleRowClick}
              onContextMenu={handleContextMenu}
              onStageClick={handleStageClick}
              onStageChange={handleStageChange}
            />
          ) : (
            <ApplicationsTable
              applications={visibleApplications}
              visibleColumns={visibleColumns}
              sortConfig={sortConfig}
              selectedRows={selectedRows}
              applicationStats={applicationStats}
              isAutosizeEnabled={isAutosizeEnabled}
              tableViewDensity={tableViewDensity}
              isMobileView={isMobileView}
              mounted={mounted}
              inlineEditingId={inlineEditingId}
              activeStageDropdown={activeStageDropdown}
              isLoading={isLoading || isInitialLoading}
              hasMore={hasMore}
              stagesOrder={stagesOrder}
              tableRef={tableRef}
              lastRowRef={lastRowRef}
              showPlaceholders={true}
              onSort={(column) => {
                const newDirection = sortConfig.column === column && sortConfig.direction === 'asc' ? 'desc' : 'asc';
                setSortConfig({ column, direction: newDirection });
              }}
              onRowSelect={(appId, selected) => {
                if (selected) setSelectedRows([...selectedRows, appId]);
                else setSelectedRows(selectedRows.filter(id => id !== appId));
              }}
              onBulkSelect={(appIds, selected) => { setSelectedRows(selected ? appIds : []); }}
              activeFilters={activeFilters}
              onResetFilters={handleResetFilters}
              onQuickFilter={() => { }}
              onRowClick={handleRowClick}
              onContextMenu={handleContextMenu}
              onStageClick={handleStageClick}
              onStageChange={handleStageChange}
            />
          )}
          {/* Manual Load More (non-virtual original table) */}
          {!(shouldUseVirtualization && performanceConfig.enableVirtualization) && (applicationsHasMore ?? hasMore) && (
            <div className="load-more-bar">
              <button
                className="load-more-btn"
                disabled={applicationsLoadingMore}
                onClick={() => loadMoreApplications?.()}
              >
                {applicationsLoadingMore ? 'Loading…' : 'Load More'}
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Context Menu */}
      <ApplicationsContextMenu
        contextMenu={contextMenu}
        applications={filteredApplications}
        stagesOrder={stagesOrder}
        onOpenDetailModal={handleOpenDetailModal}
        onEditApplication={handleEditApplication}
        onIncrementStage={handleIncrementStage}
        onDecrementStage={handleDecrementStage}
        onDeleteApplication={handleDeleteApplication}
        onClose={() => setContextMenu(null)}
      />

      {/* Detail Drawer */}
      {selectedAppData && (
        <ApplicationDetailDrawer
          id={selectedAppData.id}
          position={selectedAppData.position}
          company={selectedAppData.company}
          dateApplied={selectedAppData.dateApplied}
          stage={selectedAppData.stage}
          jobDescription={selectedAppData.jobDescription}
          salary={selectedAppData.salary}
          location={selectedAppData.location}
          remote={selectedAppData.remote}
          notes={selectedAppData.notes}
          contacts={selectedAppData.contacts}
          interviews={selectedAppData.interviews || []}
          tasks={selectedAppData.tasks || []}
          documents={selectedAppData.documents || []}
          allNotes={selectedAppData.allNotes || []}
          techStackJson={selectedAppData.tech_stack}
          benefitsJson={selectedAppData.benefits}
          isVisible={isDetailModalVisible}
          onClose={handleCloseDetailModal}
          onEdit={() => handleEditApplication(selectedAppData.id)}
          onStageChange={(s) => handleStageChange(selectedAppData.id, s)}
        />
      )}

      {/* Filter Builder */}
      <FilterBuilder
        isVisible={isFilterBuilderOpen}
        onClose={() => setIsFilterBuilderOpen(false)}
        onApplyFilters={(filters) => { setColumnFilters(filters); setIsFilterBuilderOpen(false); }}
        currentFilters={columnFilters}
        availableFields={[
          { key: 'stage', label: 'Application Stage', type: 'select', options: ['applied', 'screening', 'interview', 'offer', 'rejected'] },
          { key: 'company', label: 'Company Name', type: 'text' },
          { key: 'position', label: 'Position Title', type: 'text' },
          { key: 'location', label: 'Location', type: 'text' },
          { key: 'remote', label: 'Remote Work', type: 'select', options: ['true', 'false'] },
          { key: 'salary', label: 'Salary Range', type: 'text' },
          { key: 'dateApplied', label: 'Date Applied', type: 'date' },
          { key: 'isShortlisted', label: 'Shortlisted', type: 'select', options: ['true', 'false'] },
        ]}
      />

      <style jsx>{`
        /* Page container */
        .applications-page {
          position: relative;
          height: 100%;
          max-width: 100%;
          margin: 0 auto;
          padding: 0;
          font-family: var(--font-body);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          opacity: 0;
          transition: opacity var(--duration-300) var(--ease-smooth);
        }
        .applications-page.mounted { opacity: 1; }

        .skip-link {
          position: absolute;
          left: 8px; top: -40px;
          background: var(--surface);
          color: var(--text-primary);
          border: 1px solid var(--border);
          padding: var(--space-2) var(--space-3);
          border-radius: var(--radius-md);
          transition: top var(--duration-150) var(--ease-out);
          z-index: 10;
        }
        .skip-link:focus { top: 8px; }

        /* ===== Header ===== */
        .page-header {
          position: sticky;
          top: 0;
          z-index: 5;
          padding: var(--space-6) var(--space-6) var(--space-4);
          border-bottom: 1px solid var(--border);
          background: var(--surface);
          backdrop-filter: var(--glass-backdrop);
        }
        .header-grid {
          max-width: var(--max-content-width);
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: var(--space-6);
          align-items: start;
        }
        @media (max-width: 900px) {
          .header-grid { grid-template-columns: 1fr; gap: var(--space-4); }
        }

        .left { display: grid; gap: var(--space-2); min-width: 0; }
        .title-row { display: inline-flex; align-items: center; gap: var(--space-2); flex-wrap: wrap; }
        .title { margin: 0; font-size: var(--text-3xl); font-weight: var(--font-semibold); }
        .subtitle { margin: 0; color: var(--text-secondary); font-size: var(--text-sm); }

        /* live capsule — only present on updates */
        .live-cap {
          display: inline-flex; align-items: center; gap: var(--space-1-5);
          padding: var(--space-1) var(--space-2);
          border: 1px solid var(--border);
          background: var(--surface);
          border-radius: var(--radius-full);
          font-size: var(--text-xs);
          line-height: 1;
          color: var(--text-secondary);
          user-select: none;
        }
        .live-cap .dot {
          width: 6px; height: 6px; border-radius: var(--radius-full); background: var(--success);
          box-shadow: 0 0 0 0 rgba(16, 185, 129, .6);
          animation: ping 1.6s infinite;
        }
        .live-cap.no-anim .dot { animation: none; }
        @keyframes ping {
          0% { box-shadow: 0 0 0 0 rgba(16,185,129,.6) }
          70% { box-shadow: 0 0 0 10px rgba(16,185,129,0) }
          100% { box-shadow: 0 0 0 0 rgba(16,185,129,0) }
        }

        /* status line (visual only) */
        .status-line {
          display: inline-flex; align-items: center; gap: var(--space-2);
          padding: var(--space-1) var(--space-2);
          background: var(--success);
          color: var(--text-inverse);
          border-radius: var(--radius-md);
          font-size: var(--text-xs);
          max-width: 100%;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: opacity var(--duration-300) var(--ease-out);
        }

        /* right stats */
        .right {
          display: inline-flex; gap: var(--space-2); align-items: center; flex-wrap: wrap; justify-content: flex-end;
        }
        .pill {
          display: inline-flex; align-items: center; gap: var(--space-2);
          padding: var(--space-1-5) var(--space-2-5);
          border: 1px solid var(--border);
          background: var(--card);
          border-radius: var(--radius-full);
          font-size: var(--text-sm);
        }
        .pill .val { font-variant-numeric: tabular-nums; font-weight: var(--font-semibold); }
        .pill .lab { color: var(--text-secondary); }
        .pill.accent { border-color: var(--border-strong); }

        .sel-pill {
          padding: var(--space-1-5) var(--space-2-5);
          background: var(--primary);
          color: var(--text-inverse);
          border-radius: var(--radius-full);
          font-size: var(--text-xs);
        }

        /* Main */
        .main-content {
          flex: 1 1 auto;
          display: flex; flex-direction: column; min-height: 0;
          background: var(--surface);
        }

  .toolbar-title-col { display: flex; flex-direction: column; gap: var(--space-2); }

  .load-more-bar { display:flex; justify-content:center; padding: var(--space-3); background: var(--surface); border-top:1px solid var(--border); }
  .load-more-btn { font: inherit; background: var(--primary); color: var(--text-inverse); border: none; padding: var(--space-2) var(--space-4); border-radius: var(--radius-md); cursor: pointer; box-shadow: var(--shadow-sm,0 2px 4px rgba(0,0,0,.1)); }
  .load-more-btn:hover { opacity:.9; }
  .load-more-btn:disabled { opacity:.55; cursor: default; }

        .toolbar {
          flex: 0 0 auto;
          display: flex; align-items: center;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-5);
          border-bottom: 1px solid var(--border);
          background: var(--surface);
        }
        .toolbar-search { flex: 1; min-width: 240px; }

        .table-container {
          flex: 1 1 auto;
          min-height: 0;
          overflow: auto;
          background: var(--background);
          transition: opacity var(--duration-200) ease;
        }
        .table-container:has(.loading) { opacity: .85; }

        /* reduce motion */
        @media (prefers-reduced-motion: reduce) {
          .status-line { transition: none; }
        }

        /* sr-only util */
        .sr-only {
          position: absolute !important;
          width: 1px; height: 1px; padding: 0; margin: -1px;
          overflow: hidden; clip: rect(0, 0, 0, 0);
          white-space: nowrap; border: 0;
        }
      `}</style>
    </div>
  );
}

/* === Header helpers === */

  // Removed unused StatPill & CountUp components (duplicate of ApplicationsHeader stats)

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);
  return reduced;
}
