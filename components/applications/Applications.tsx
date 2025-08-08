/**
 * Refactored Applications Component
 * Modern, maintainable, and performant job applications management
 */

'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { useApplicationsLogic } from './hooks/useApplicationsLogic';
import { ApplicationsHeader } from './components/ApplicationsHeader';
import { ApplicationsControls } from './components/ApplicationsControls';
import { ApplicationsTable } from './components/ApplicationsTable';
import { VirtualizedApplicationsTable } from './components/VirtualizedApplicationsTable';
import { ApplicationsKanban } from './components/ApplicationsKanban';
import { ApplicationsContextMenu } from './components/ApplicationsContextMenu';
import { FilterBuilder } from './components/FilterBuilder';
import ApplicationDetailDrawer from './ApplicationDetailDrawer';
import { getAdaptivePerformanceConfig, detectDeviceCapabilities } from './utils/performanceConfig';
import { usePerformanceMonitor } from './utils/performanceMonitor';

export default function Applications() {
  const [isFilterBuilderOpen, setIsFilterBuilderOpen] = useState(false);

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

  // Determine if we should use virtualization based on dataset size
  const shouldUseVirtualization = useMemo(() => {
    return filteredApplications.length > 50; // Use virtualization for datasets > 50 items
  }, [filteredApplications.length]);

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
    setContextMenu, setActiveStageDropdown, setIsColumnMenuOpen, handleCloseDetailModal
  ]);

  // Show loading state
  if (loading && !mounted) {
    return (
      <div className="applications-loading">
        <div className="loading-content">
          <div className="spinner"></div>
          <h3>Loading Applications</h3>
          <p>Preparing your job application data...</p>
        </div>
      </div>
    );
  }

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
    <div className={`applications-page ${mounted ? 'mounted' : ''}`}>
      {/* Main Content */}
      <main className="main-content">
        {/* Toolbar - Controls, Filters, and Quick Actions */}
        <div className="toolbar">
          <ApplicationsControls
            viewMode={viewMode}
            isMobileView={isMobileView}
            isAutosizeEnabled={isAutosizeEnabled}
            tableViewDensity={tableViewDensity}
            showAdvancedFilters={showAdvancedFilters}
            isColumnMenuOpen={isColumnMenuOpen}
            quickFilters={quickFilters}
            visibleColumns={visibleColumns}
            selectedRows={selectedRows}
            selectedApplications={selectedApplications}
            activeFilters={columnFilters}
            onViewModeChange={setViewMode}
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
            onResetFilters={() => {
              setColumnFilters({});
            }}
            onOpenFilterBuilder={() => setIsFilterBuilderOpen(true)}
          />
        </div>

        {/* Data Table */}
        <div className="table-container">
          {viewMode === 'kanban' ? (
            <ApplicationsKanban
              applicationsByStage={applicationsByStage}
              statusUpdates={statusUpdates}
              isMobileView={isMobileView}
              stagesOrder={stagesOrder}
              onStageChange={handleStageChange}
              onKanbanDrop={handleKanbanDrop}
              onEditApplication={handleEditApplication}
              onDeleteApplication={handleDeleteApplication}
              onToggleShortlist={handleToggleShortlist}
              onOpenDetailModal={handleOpenDetailModal}
            />
          ) : false && filteredApplications.length > 50 ? (
            <VirtualizedApplicationsTable
              applications={filteredApplications}
              visibleColumns={visibleColumns}
              sortConfig={sortConfig}
              selectedRows={selectedRows}
              columnFilters={columnFilters}
              isAutosizeEnabled={isAutosizeEnabled}
              tableViewDensity={tableViewDensity}
              isMobileView={isMobileView}
              mounted={mounted}
              inlineEditingId={inlineEditingId}
              activeStageDropdown={activeStageDropdown}
              isLoading={isLoading}
              hasMore={hasMore}
              stagesOrder={stagesOrder}
              tableRef={tableRef}
              lastRowRef={lastRowRef}
              enableVirtualization={true}
              itemHeight={tableViewDensity === 'compact' ? 40 : tableViewDensity === 'spacious' ? 60 : 48}
              overscan={10}
              onSort={(column) => {
                const newDirection = sortConfig.column === column && sortConfig.direction === 'asc' ? 'desc' : 'asc';
                setSortConfig({ column, direction: newDirection });
              }}
              onFilterChange={(column, value) => {
                setColumnFilters({ ...columnFilters, [column]: value });
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
              columnFilters={columnFilters}
              applicationStats={applicationStats}
              isAutosizeEnabled={isAutosizeEnabled}
              tableViewDensity={tableViewDensity}
              isMobileView={isMobileView}
              mounted={mounted}
              inlineEditingId={inlineEditingId}
              activeStageDropdown={activeStageDropdown}
              isLoading={isLoading}
              hasMore={hasMore}
              stagesOrder={stagesOrder}
              tableRef={tableRef}
              lastRowRef={lastRowRef}
              onSort={(column) => {
                const newDirection = sortConfig.column === column && sortConfig.direction === 'asc' ? 'desc' : 'asc';
                setSortConfig({ column, direction: newDirection });
              }}
              onFilterChange={(column, value) => {
                setColumnFilters({ ...columnFilters, [column]: value });
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
                  // Select all applications
                  setSelectedRows(appIds);
                } else {
                  // Deselect all applications
                  setSelectedRows([]);
                }
              }}
              activeFilters={columnFilters}
              onResetFilters={() => {
                setColumnFilters({});
              }}
              onQuickFilter={(filterType, value) => {
                // Handle quick filter actions
                const newFilters = { ...columnFilters };

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
                      delete newFilters.dateApplied;
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

                setColumnFilters(newFilters);
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
          max-width: var(--max-content-width);
          margin: 0 auto;
          padding: var(--space-8) var(--space-6);
          font-family: var(--font-body);
          opacity: 0;
          transition: opacity var(--duration-300) var(--ease-smooth);
        }

        .applications-page.mounted {
          opacity: 1;
        }

        /* Main Content - Using Theme Cards */
        .main-content {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: var(--border-radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-small);
          transition: all var(--duration-200) var(--ease-microinteractive);
        }

        .main-content:hover {
          box-shadow: var(--shadow-medium);
        }

        /* Toolbar - Using Theme Spacing */
        .toolbar {
          padding: 0 var(--space-6);
          background: var(--surface);
          border-bottom: 1px solid var(--border-light);
        }

        /* Button Styles - Using Theme System */
        .btn {
          padding: var(--space-2) var(--space-4);
          border: 1px solid var(--border);
          border-radius: var(--border-radius);
          cursor: pointer;
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-medium);
          font-family: var(--font-interface);
          letter-spacing: var(--letter-spacing);
          transition: all var(--duration-150) var(--ease-microinteractive);
          background: var(--surface);
          color: var(--text-primary);
          position: relative;
          overflow: hidden;
          transform: translateZ(0);
        }

        .btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, var(--hover-bg), transparent);
          transition: left var(--duration-500) var(--ease-smooth);
          pointer-events: none;
        }

        .btn:hover {
          transform: translateY(var(--morph-translate)) scale(var(--morph-scale));
          box-shadow: var(--shadow-small);
        }

        .btn:hover::before {
          left: 100%;
        }

        .btn:active {
          transform: translateY(0) scale(var(--micro-scale));
          transition-duration: var(--duration-instant);
        }

        .btn-primary {
          background: var(--primary);
          border-color: var(--primary);
          color: var(--text-inverse);
        }

        .btn-primary:hover {
          background: var(--primary-dark);
          border-color: var(--primary-dark);
        }

        .btn-secondary {
          background: var(--surface-elevated);
          border-color: var(--border);
          color: var(--text-secondary);
        }

        .btn-secondary:hover {
          background: var(--card-hover);
          color: var(--text-primary);
          border-color: var(--border-strong);
        }

        .btn-danger {
          background: var(--error);
          border-color: var(--error);
          color: var(--text-inverse);
        }

        .btn-danger:hover {
          background: #b91c1c;
          border-color: #b91c1c;
        }

        .btn-ghost {
          background: transparent;
          border: none;
          color: var(--text-tertiary);
          padding: var(--space-2) var(--space-3);
        }

        .btn-ghost:hover {
          background: var(--hover-bg);
          color: var(--text-secondary);
        }

        /* Table Container - Using Theme */
        .table-container {
          background: transparent;
        }

        /* Loading & Error States - Using Theme Typography */
        .applications-loading,
        .applications-error {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          text-align: center;
          background: var(--background);
        }

        .loading-content,
        .error-content {
          max-width: 300px;
          padding: var(--space-8);
          background: var(--card);
          border-radius: var(--border-radius-lg);
          box-shadow: var(--shadow-medium);
        }

        .loading-content h3,
        .error-content h3 {
          margin: 0 0 var(--space-2) 0;
          font-size: var(--text-lg);
          font-weight: var(--font-weight-semibold);
          font-family: var(--font-interface);
          color: var(--text-primary);
          line-height: var(--leading-tight);
        }

        .loading-content p,
        .error-content p {
          margin: 0 0 var(--space-4) 0;
          font-size: var(--font-size-sm);
          font-family: var(--font-body);
          color: var(--text-secondary);
          line-height: var(--leading-normal);
        }

        .spinner {
          width: 32px;
          height: 32px;
          border: 3px solid var(--border);
          border-top: 3px solid var(--primary);
          border-radius: 50%;
          animation: spin var(--duration-1000) linear infinite;
          margin: 0 auto var(--space-4);
        }

        .retry-button {
          background: var(--primary);
          color: var(--text-inverse);
          border: none;
          padding: var(--space-2) var(--space-5);
          border-radius: var(--border-radius);
          cursor: pointer;
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-medium);
          font-family: var(--font-interface);
          letter-spacing: var(--letter-spacing);
          transition: all var(--duration-150) var(--ease-microinteractive);
        }

        .retry-button:hover {
          background: var(--primary-dark);
          transform: translateY(var(--morph-translate)) scale(var(--morph-scale));
          box-shadow: var(--shadow-small);
        }

        .retry-button:active {
          transform: translateY(0) scale(var(--micro-scale));
          transition-duration: var(--duration-instant);
        }

        .error-icon {
          font-size: var(--text-5xl);
          margin-bottom: var(--space-4);
        }

        .error-content h3 {
          color: var(--error);
        }

        /* Responsive Design - Using Theme Breakpoints */
        @media (max-width: 768px) {
          .applications-page {
            padding: var(--space-6) var(--space-4);
          }

          .toolbar {
            padding: var(--space-4);
          }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
