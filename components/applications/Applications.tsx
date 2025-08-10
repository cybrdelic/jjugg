/**
 * Applications — Header upgrade (cohesive, no "idle", token-pure)
 * - Tight 2-col layout (Title+meta | Stats)
 * - Live capsule only when updates exist
 * - One-shot polite announcement; no marquee
 * - CountUp respects prefers-reduced-motion
 * - Skip link for a11y
 */

'use client';
import React, { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useApplicationsLogic } from './hooks/useApplicationsLogic';
import { ApplicationsControls } from './components/ApplicationsControls';
import { ApplicationsTable } from './components/ApplicationsTable';
import { VirtualizedApplicationsTable } from './components/VirtualizedApplicationsTable';
import { ApplicationsContextMenu } from './components/ApplicationsContextMenu';
import { FilterBuilder } from './components/FilterBuilder';
import ApplicationDetailDrawer from './ApplicationDetailDrawer';
import { getAdaptivePerformanceConfig, detectDeviceCapabilities } from './utils/performanceConfig';
import { usePerformanceMonitor } from './utils/performanceMonitor';
import { TableSkeleton } from './components/ApplicationsSkeleton';
import EnhancedSearch from '@/components/EnhancedSearch';
import { CheckCircle2, Activity } from 'lucide-react';

export default function Applications() {
  const [isFilterBuilderOpen, setIsFilterBuilderOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [showOverlaySkeleton, setShowOverlaySkeleton] = useState(false);
  const SKELETON_DELAY_MS = 120;
  const SKELETON_ITEM_THRESHOLD = 80;

  const {
    filteredApplications,
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
  } = useApplicationsLogic();

  const isInitialLoading = loading && !mounted;
  const shouldUseVirtualization = useMemo(() => filteredApplications.length > 50, [filteredApplications.length]);

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

  return (
    <div className={`applications-page ${(mounted || isInitialLoading) ? 'mounted' : ''}`}>
      {/* Skip link for a11y */}
      <a href="#apps-table" className="skip-link">Skip to applications</a>

      {/* ===== Page Header (cohesive, token-pure) ===== */}
      <header className="page-header" role="banner">
        <div className="header-grid">
          {/* Left: Title + meta */}
          <div className="left">
            <div className="title-row">
              <h1 className="title text-h2">Applications</h1>
              {/* Only show when updating */}
              {hasGlobalUpdate && (
                <span className={`live-cap ${prefersReduced ? 'no-anim' : ''}`} title="Background updates in progress">
                  <span className="dot" aria-hidden />
                  <Activity size={14} aria-hidden />
                  <span className="cap-txt">Live</span>
                </span>
              )}
            </div>
            <p className="subtitle text-body-sm">Manage your job applications and track progress</p>

            {/* one-line status (visual); SR gets a polite single-shot below */}
            {latestGlobalMessage && (
              <div className="status-line" role="status">
                <CheckCircle2 size={14} aria-hidden />
                <span className="status-text">{latestGlobalMessage}</span>
              </div>
            )}
            <div ref={liveRef} className="sr-only" aria-live="polite" />
          </div>

          {/* Right: Stats */}
          <div className="right" aria-label="Key stats">
            <StatPill label="Total" value={applicationStats.applications ?? 0} reduced={prefersReduced} />
            <StatPill label="Active" value={applicationStats.active ?? 0} reduced={prefersReduced} />
            <StatPill label="Interviews" value={applicationStats.interviews ?? 0} reduced={prefersReduced} tone="accent" />
            {selectedRows.length > 0 && (
              <span className="sel-pill" role="status" aria-live="polite">{selectedRows.length} selected</span>
            )}
          </div>
        </div>
      </header>

      {/* ===== Main Content ===== */}
      <main className="main-content">
        {/* Toolbar */}
        <div className="toolbar">
          <div className="toolbar-search">
            <EnhancedSearch
              size="compact"
              applications={filteredApplications}
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
            activeFilters={{}}
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
            onResetFilters={undefined}
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
              applications={filteredApplications}
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
              hasMore={hasMore}
              stagesOrder={stagesOrder}
              tableRef={tableRef}
              lastRowRef={lastRowRef}
              enableVirtualization={true}
              itemHeight={performanceConfig.itemHeight}
              overscan={performanceConfig.overscan}
              showPlaceholders={true}
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
              applications={filteredApplications}
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
              activeFilters={{}}
              onResetFilters={undefined}
              onQuickFilter={() => { }}
              onRowClick={handleRowClick}
              onContextMenu={handleContextMenu}
              onStageClick={handleStageClick}
              onStageChange={handleStageChange}
            />
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

function StatPill({ label, value, tone = 'default', reduced }: { label: string; value: number; tone?: 'default' | 'accent'; reduced: boolean; }) {
  return (
    <span className={`pill ${tone === 'accent' ? 'accent' : ''}`}>
      <span className="val"><CountUp n={value} reduced={reduced} /></span>
      <span className="lab">{label}</span>
    </span>
  );
}

function CountUp({ n, duration = 700, reduced }: { n: number; duration?: number; reduced: boolean; }) {
  const [v, setV] = useState(0);
  const target = Math.max(0, n);
  useEffect(() => {
    if (reduced) { setV(target); return; }
    const start = performance.now();
    const from = 0;
    let raf: number;
    const tick = (t: number) => {
      const e = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - e, 3);
      setV(Math.round(from + (target - from) * eased));
      if (e < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, reduced]);
  return <>{v.toLocaleString()}</>;
}

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
