/**
 * Refactored Applications Component
 * Modern, maintainable, and performant job applications management
 */

'use client';
import React, { useEffect } from 'react';
import { useApplicationsLogic } from './hooks/useApplicationsLogic';
import { ApplicationsHeader } from './components/ApplicationsHeader';
import { ApplicationsControls } from './components/ApplicationsControls';
import { ApplicationsTable } from './components/ApplicationsTable';
import { ApplicationsKanban } from './components/ApplicationsKanban';
import { ApplicationsContextMenu } from './components/ApplicationsContextMenu';
import ApplicationDetailDrawer from './ApplicationDetailDrawer';

export default function Applications() {
  const {
    // Data
    filteredApplications,
    applicationStats,
    selectedAppData,
    applicationsByStage,
    stagesOrder,
    loading,
    error,

    // State
    searchTerm,
    viewMode,
    sortConfig,
    selectedApplication,
    mounted,
    isDetailModalVisible,
    selectedRows,
    visibleColumns,
    isColumnMenuOpen,
    statusUpdates,
    visibleApplications,
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
    <section className={`applications-home ${mounted ? 'mounted' : ''}`}>
      {/* Header with search and actions */}
      <ApplicationsHeader
        applications={filteredApplications}
        applicationStats={applicationStats}
        statusUpdates={statusUpdates}
        selectedRowsCount={selectedRows.length}
        hasGlobalUpdate={hasGlobalUpdate}
        onSearch={setSearchTerm}
        onAddApplication={handleCreateApplication}
        onBulkDelete={handleBulkDelete}
        onExport={handleExport}
      />

      {/* Main content area */}
      <div className="dashboard-content">
        <div className="table-container">
          {/* Controls for view mode, filters, etc. */}
          <ApplicationsControls
            viewMode={viewMode}
            isMobileView={isMobileView}
            isAutosizeEnabled={isAutosizeEnabled}
            tableViewDensity={tableViewDensity}
            showAdvancedFilters={showAdvancedFilters}
            isColumnMenuOpen={isColumnMenuOpen}
            quickFilters={quickFilters}
            visibleColumns={visibleColumns}
            onViewModeChange={setViewMode}
            onMobileViewToggle={() => setIsMobileView(!isMobileView)}
            onAutosizeToggle={() => setIsAutosizeEnabled(!isAutosizeEnabled)}
            onDensityChange={setTableViewDensity}
            onQuickFiltersChange={setQuickFilters}
            onAdvancedFiltersToggle={() => setShowAdvancedFilters(!showAdvancedFilters)}
            onColumnMenuToggle={() => setIsColumnMenuOpen(!isColumnMenuOpen)}
            onVisibleColumnsChange={setVisibleColumns}
          />

          {/* Table or Kanban view */}
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
          ) : (
            <ApplicationsTable
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
          )}
        </div>
      </div>

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

      <style jsx>{`
        .applications-home {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 16px;
          background: var(--actual-background, var(--background));
          border-radius: 8px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          --glass-bg-rgb: 255, 255, 255;
          position: relative;
          overflow-x: hidden;
          max-width: 100%;
          opacity: 0;
          transform: translateY(20px);
        }

        .applications-home.mounted {
          opacity: 1;
          transform: translateY(0);
        }

        .dashboard-content {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .table-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        /* Loading State */
        .applications-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          padding: 40px;
        }

        .loading-content {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--border-thin);
          border-top: 3px solid var(--accent-blue);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .loading-content h3 {
          margin: 0;
          color: var(--text-primary);
          font-size: 18px;
        }

        .loading-content p {
          margin: 0;
          color: var(--text-secondary);
          font-size: 14px;
        }

        /* Error State */
        .applications-error {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          padding: 40px;
        }

        .error-content {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          max-width: 400px;
        }

        .error-icon {
          font-size: 48px;
          opacity: 0.7;
        }

        .error-content h3 {
          margin: 0;
          color: var(--accent-red);
          font-size: 18px;
        }

        .error-content p {
          margin: 0;
          color: var(--text-secondary);
          font-size: 14px;
          line-height: 1.5;
        }

        .retry-button {
          background: var(--accent-blue);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .retry-button:hover {
          background: var(--accent-blue-dark);
          transform: translateY(-1px);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .applications-home {
            padding: 12px;
            gap: 8px;
          }
        }



        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
}
