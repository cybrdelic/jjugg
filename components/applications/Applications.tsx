/**
 * Refactored Applications Component
 * Modern, maintainable, and performant job applications management
 */

'use client';
import React, { useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import { useApplicationsLogic } from './hooks/useApplicationsLogic';
import { ApplicationsHeader } from './components/ApplicationsHeader';
import { ApplicationsControls } from './components/ApplicationsControls';
import { ApplicationsTable } from './components/ApplicationsTable';
import { VirtualizedApplicationsTable } from './components/VirtualizedApplicationsTable';
import { ApplicationsContextMenu } from './components/ApplicationsContextMenu';
import { FilterBuilder } from './components/FilterBuilder';
import ApplicationDetailDrawer from './ApplicationDetailDrawer';
import { getAdaptivePerformanceConfig, detectDeviceCapabilities } from './utils/performanceConfig';
import { usePerformanceMonitor } from './utils/performanceMonitor';
import { TableSkeleton, KanbanSkeleton } from './components/ApplicationsSkeleton';
import EnhancedSearch from '@/components/EnhancedSearch';

export default function Applications() {
  const [isFilterBuilderOpen, setIsFilterBuilderOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [pendingViewMode, setPendingViewMode] = useState<'table' | 'kanban' | null>(null);
  const [showOverlaySkeleton, setShowOverlaySkeleton] = useState(false);
  const SKELETON_DELAY_MS = 120; // don't show if transition resolves quickly
  const SKELETON_ITEM_THRESHOLD = 80; // only show for larger datasets

  const {
    // Data
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

    // Application Operations
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

  // Determine if we should use virtualization based on dataset size
  const shouldUseVirtualization = useMemo(() => {
    return filteredApplications.length > 50; // Use virtualization for datasets > 50 items
  }, [filteredApplications.length]);

  // Show skeleton only if transition is still pending after a short delay and dataset is large
  useEffect(() => {
    let timer: number | undefined;
    if (isPending) {
      timer = window.setTimeout(() => setShowOverlaySkeleton(true), SKELETON_DELAY_MS);
    } else {
      setShowOverlaySkeleton(false);
    }
    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [isPending]);

  const shouldShowOverlaySkeleton = isPending && showOverlaySkeleton && (filteredApplications.length > SKELETON_ITEM_THRESHOLD);

  // Get adaptive performance configuration based on device capabilities and dataset size
  const performanceConfig = useMemo(() => {
    const deviceCapabilities = detectDeviceCapabilities();
    return getAdaptivePerformanceConfig(filteredApplications.length, deviceCapabilities);
  }, [filteredApplications.length]);

  // Performance monitoring
  const { startMeasurement, endMeasurement, generateReport } = usePerformanceMonitor('Applications');

  // Monitor component performance
  useEffect(() => {
    startMeasurement();
    return () => {
      endMeasurement(filteredApplications.length);

      // Log performance report in development
      if (process.env.NODE_ENV === 'development' && filteredApplications.length > 100) {
        console.log('Applications Performance Report:', generateReport());
      }
    };
  }, [filteredApplications.length, startMeasurement, endMeasurement, generateReport]);

  // Global click handler for closing dropdowns and menus
  useEffect(() => {
    const handleGlobalClick = () => {
      if (contextMenu) setContextMenu(null);
      if (activeStageDropdown) setActiveStageDropdown(null);
      if (isColumnMenuOpen) setIsColumnMenuOpen(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (contextMenu) setContextMenu(null);
        if (activeStageDropdown) setActiveStageDropdown(null);
        if (isColumnMenuOpen) setIsColumnMenuOpen(false);
        if (isDetailModalVisible) handleCloseDetailModal();
        if (selectedRows.length) setSelectedRows([]);
      }

      // Grid hotkeys
      // Note: basic wiring; row focus/refs should already exist via table interactions
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        // Select all visible rows
        const allIds = filteredApplications.map(a => a.id);
        setSelectedRows(allIds);
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedRows.length > 0) {
          e.preventDefault();
          handleBulkDelete();
        }
      }

      if (e.key === 'Enter') {
        if (selectedRows.length === 1) {
          const id = selectedRows[0];
          handleOpenDetailModal(id);
        }
      }
    };

    document.addEventListener('click', handleGlobalClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('click', handleGlobalClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    contextMenu, activeStageDropdown, isColumnMenuOpen, isDetailModalVisible,
    setContextMenu, setActiveStageDropdown, setIsColumnMenuOpen, handleCloseDetailModal,
    selectedRows, setSelectedRows, filteredApplications, handleBulkDelete, handleOpenDetailModal
  ]);

  // Get rid of kanban: always table
  const viewModeAlwaysTable = 'table' as const;

  // Show error state
  if (error) {
    return (
      <div className="applications-error">
        <div className="error-content">
          <div className="error-icon">⚠️</div>
          <h3>Unable to Load Applications</h3>
          <p>{error}</p>
          <button
            className="retry-button"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const hasGlobalUpdate = statusUpdates.some(update => !update.appId);

  return (
    <div className={`applications-page ${(mounted || isInitialLoading) ? 'mounted' : ''}`}>
      {/* Main Content */}
      <main className="main-content">
        {/* Toolbar - Controls, Filters, and Quick Actions */}
        <div className="toolbar">
          {/* Global Search */}
          <div className="toolbar-search">
            <EnhancedSearch
              size="compact"
              applications={filteredApplications}
              value={searchTerm}
              quickFilters={quickFilters}
              columnFilters={columnFilters}
              onSearch={(q, payload) => {
                if (payload?.quickFilters) {
                  setQuickFilters(payload.quickFilters);
                }
                if (payload?.columnFilters) {
                  setColumnFilters(payload.columnFilters);
                }
                if (typeof q === 'string') {
                  setSearchTerm(q);
                }
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

        {/* Data Table */}
        <div className="table-container">
          {/* Instant skeleton overlay during view transitions */}
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
                if (selected) {
                  setSelectedRows([...selectedRows, appId]);
                } else {
                  setSelectedRows(selectedRows.filter(id => id !== appId));
                }
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
                if (selected) {
                  setSelectedRows([...selectedRows, appId]);
                } else {
                  setSelectedRows(selectedRows.filter(id => id !== appId));
                }
              }}
              onBulkSelect={(appIds, selected) => {
                if (selected) {
                  setSelectedRows(appIds);
                } else {
                  setSelectedRows([]);
                }
              }}
              activeFilters={{}}
              onResetFilters={undefined}
              onQuickFilter={(filterType, value) => {
                // Handle quick filter actions
                const newFilters: Record<string, string> = {};

                switch (filterType) {
                  case 'stage':
                    newFilters.stage = value || '';
                    break;
                  case 'timeframe':
                    if (value === 'thisWeek') {
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      newFilters.dateApplied = weekAgo.toISOString().split('T')[0];
                    } else if (value === 'thisMonth') {
                      const monthStart = new Date();
                      monthStart.setDate(1);
                      newFilters.dateApplied = monthStart.toISOString().split('T')[0];
                    } else {
                      // Clear timeframe filter
                      newFilters.dateApplied = '';
                    }
                    break;
                  case 'remote':
                    newFilters.remote = value === 'true' ? 'true' : '';
                    break;
                  case 'shortlisted':
                    newFilters.isShortlisted = value === 'true' ? 'true' : '';
                    break;
                  case 'salary':
                    newFilters.salary = value === 'hasValue' ? 'has-value' : '';
                    break;
                  case 'tasks':
                  case 'interviews':
                    // These would need special handling in the filtering logic
                    break;
                  default:
                    break;
                }

                // If quick filters should remain, wire them to state.quickFilters instead
                // For now we do nothing here since column filters were removed
              }}
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

      {/* Application Detail Drawer */}
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
          isVisible={isDetailModalVisible}
          onClose={handleCloseDetailModal}
          onEdit={() => handleEditApplication(selectedAppData.id)}
          onStageChange={(newStage) => handleStageChange(selectedAppData.id, newStage)}
        />
      )}

      {/* Advanced Filter Builder */}
      <FilterBuilder
        isVisible={isFilterBuilderOpen}
        onClose={() => setIsFilterBuilderOpen(false)}
        onApplyFilters={(filters) => {
          setColumnFilters(filters);
          setIsFilterBuilderOpen(false);
        }}
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
        /* Applications Page - Using Theme System */
        .applications-page {
          position: relative;
          height: 100%; /* was 100vh; avoid double-viewport stacking that caused extra scroll */
          max-width: 100%;
          margin: 0 auto;
          padding: 0; /* remove outer padding */
          font-family: var(--font-body);
          display: flex;
          flex-direction: column;
          overflow: hidden; /* prevent page scroll */
          opacity: 0;
          transition: opacity var(--duration-300) var(--ease-smooth);
        }

        .applications-page.mounted { opacity: 1; }

        /* Main Content fills remaining height */
        .main-content {
          flex: 1 1 auto;
          display: flex;
          flex-direction: column;
          min-height: 0; /* allows children to shrink for overflow */
          background: var(--surface);
          border-radius: 0;
          box-shadow: none;
          border: none;
        }

        /* Toolbar pinned at top */
        .toolbar {
          flex: 0 0 auto;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 12px; /* tighter */
          border-bottom: 1px solid var(--border, rgba(0,0,0,0.08));
          background: var(--surface, #fff);
        }
        .toolbar-search { flex: 1; display: flex; align-items: center; min-width: 240px; }

        /* Table container consumes all remaining space and scrolls internally */
        .table-container {
          flex: 1 1 auto;
          min-height: 0; /* important for overflow */
          overflow: auto; /* scroll only table, not page */
          background: var(--background);
        }

        /* Keep skeleton overlay behavior */
        .table-container { transition: opacity var(--duration-200) ease; }
        .table-container:has(.loading) { opacity: 0.8; }

        /* Remove old card wrappers */
        .main-content:hover { box-shadow: none; }

        @media (max-width: 768px) {
          .toolbar { padding: 8px; }
        }
      `}</style>
    </div>
  );
}
