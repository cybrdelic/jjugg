/**
 * Applications Table Component
 * Handles table view rendering and interactions
 */

import React from 'react';
import { ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import { Application, ApplicationStage } from '@/types';
import ApplicationTableRow from './ApplicationTableRow';

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
  const getSortIcon = (column: keyof Application | 'company.name') => {
    if (sortConfig.column !== column) return null;
    return sortConfig.direction === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />;
  };

  const formatColumnHeader = (column: string): string => {
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
  };

  if (applications.length === 0 && !isLoading) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📋</div>
        <h3>No applications found</h3>
        <p>Get started by creating your first job application</p>
        <button className="action-btn">
          <span>Add Application</span>
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-grid table-grid">
      <div className="dashboard-card table-card" ref={tableRef}>
        <div className="table-wrapper">
          {/* Table Header */}
          <div className={`table-header ${isAutosizeEnabled ? 'autosize' : ''}`}>
            {/* Checkbox column header */}
            <div className="header-cell checkbox-header">
              <input
                type="checkbox"
                className="select-all-checkbox"
                checked={selectedRows.length === applications.length && applications.length > 0}
                onChange={(e) => {
                  const allSelected = e.target.checked;
                  applications.forEach(app => {
                    onRowSelect(app.id, allSelected);
                  });
                }}
              />
            </div>

            {visibleColumns.map(column => (
              <div
                key={column}
                className={`header-cell ${sortConfig.column === column ? 'sorted' : ''}`}
                onClick={() => onSort(column as keyof Application | 'company.name')}
              >
                <span>
                  {formatColumnHeader(column)}
                  {getSortIcon(column as keyof Application | 'company.name')}
                </span>
                <input
                  type="text"
                  className="filter-input"
                  placeholder={`Filter ${formatColumnHeader(column).toLowerCase()}...`}
                  value={columnFilters[column] || ''}
                  onChange={(e) => onFilterChange(column, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            ))}
          </div>

          {/* Table Body */}
          <div className="table-body">
            {applications.map((app, index) => (
              <ApplicationTableRow
                key={app.id}
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
                animationDelay={index * 0.05}
                onSelect={(selected: boolean) => onRowSelect(app.id, selected)}
                onRowClick={(e: React.MouseEvent) => onRowClick(app.id, e)}
                onContextMenu={(e: React.MouseEvent) => onContextMenu(app.id, e)}
                onStageClick={(e: React.MouseEvent) => onStageClick(app.id, e)}
                onStageChange={(stage: ApplicationStage) => onStageChange(app.id, stage)}
                stagesOrder={stagesOrder}
                ref={index === applications.length - 1 ? lastRowRef : null}
              />
            ))}

            {/* Loading State */}
            {isLoading && (
              <div className="loading-state">
                <Loader2 size={20} className="spinner" />
                <span>Loading applications...</span>
              </div>
            )}

            {/* End State */}
            {!hasMore && applications.length > 0 && (
              <div className="end-state">
                <span>All applications loaded</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .table-grid {
          grid-template-columns: 1fr;
        }

        .dashboard-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 0;
          overflow: hidden;
          box-shadow: var(--shadow-medium);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }

        .table-wrapper {
          position: relative;
          background: var(--surface);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: var(--shadow-medium);
          border: 1px solid var(--border);
          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);
          max-width: 100%;
        }

        .table-header {
          display: grid;
          grid-template-columns: 48px 2fr 2.5fr 1.2fr 1.5fr 1fr 1fr 1fr 0.8fr;
          align-items: center;
          justify-items: start;
          padding: 12px 16px;
          background: linear-gradient(135deg, var(--glass-card-bg, rgba(255, 255, 255, 0.05)), var(--glass-card-bg, rgba(255, 255, 255, 0.02)));
          border-bottom: 1px solid var(--border-accent, rgba(59, 130, 246, 0.2));
          font-size: 11px;
          font-weight: 700;
          color: var(--text-secondary, rgba(255, 255, 255, 0.8));
          position: sticky;
          top: 0;
          z-index: 100;
          gap: 12px;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow: 0 1px 0 rgba(255, 255, 255, 0.1), 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .table-header.autosize {
          grid-template-columns: 48px auto auto auto auto auto auto auto auto;
          gap: 12px;
        }

        @media (max-width: 1400px) {
          .table-header {
            grid-template-columns: 40px 2fr 2.5fr 1fr 1.2fr 1fr 1.5fr 1.2fr 0;
            gap: 10px;
          }
        }

        @media (max-width: 1200px) {
          .table-header {
            grid-template-columns: 40px 1.8fr 2fr 1fr 1.2fr 0.8fr 0 0 0;
            gap: 10px;
          }
        }

        @media (max-width: 992px) {
          .table-header {
            grid-template-columns: 40px 2fr 2fr 1fr 1.2fr 0 0 0 0;
            gap: 8px;
          }
        }

        @media (max-width: 768px) {
          .table-header {
            grid-template-columns: 36px 2fr 2fr 1fr 1fr 0 0 0 0;
            gap: 6px;
          }
        }

        .header-cell {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: flex-start;
          gap: 6px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          padding: 4px 0;
          text-align: left;
        }

        .header-cell::before {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 2px;
          background: var(--primary);
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .header-cell:hover::before {
          width: 100%;
        }

        .header-cell span {
          display: flex;
          align-items: center;
          gap: 4px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-size: 10px;
          color: var(--text-secondary);
          transition: all 0.2s ease;
          white-space: nowrap;
          text-align: left;
        }

        .header-cell:hover span {
          color: var(--primary);
          transform: translateY(-1px);
        }

        .header-cell.sorted span {
          color: var(--primary);
        }

        .checkbox-header {
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          padding: 0;
          gap: 0;
        }

        .select-all-checkbox {
          width: 18px;
          height: 18px;
          appearance: none;
          background: var(--surface);
          border: 1.5px solid var(--border);
          border-radius: 3px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }

        .select-all-checkbox::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 8px;
          height: 5px;
          border: 2px solid transparent;
          border-top: none;
          border-right: none;
          transform: translate(-50%, -60%) rotate(-45deg) scale(0);
          transition: transform 0.15s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        .select-all-checkbox:checked {
          background: var(--primary);
          border-color: var(--primary);
        }

        .select-all-checkbox:checked::after {
          border-color: var(--text-on-primary);
          transform: translate(-50%, -60%) rotate(-45deg) scale(1);
        }

        .select-all-checkbox:hover {
          border-color: var(--primary);
          background: var(--surface-hover);
        }

        .filter-input {
          padding: 6px 8px;
          border: 1px solid var(--border);
          border-radius: 6px;
          font-size: 12px;
          background: var(--surface);
          color: var(--text-primary);
          transition: all 0.2s ease;
          width: 100%;
        }

        .filter-input:focus {
          outline: none;
          border-color: var(--primary);
        }

        .table-body {
          max-height: calc(100vh - 300px);
          overflow-y: auto;
          overflow-x: hidden;
          background: var(--background);
        }

        .loading-state {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          color: var(--text-secondary);
          font-size: 13px;
          gap: 6px;
          background: var(--surface);
          border-radius: 6px;
          margin: 12px;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        .end-state {
          text-align: center;
          padding: 16px;
          color: var(--text-tertiary);
          font-size: 13px;
          font-style: italic;
          background: var(--surface);
          border-radius: 6px;
          margin: 12px;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px;
          color: var(--text-tertiary);
          font-size: 14px;
          gap: 12px;
          text-align: center;
          background: var(--surface);
          border-radius: 8px;
        }

        .empty-icon {
          font-size: 48px;
          opacity: 0.5;
        }

        .empty-state h3 {
          margin: 0;
          color: var(--text-primary);
          font-size: 18px;
        }

        .empty-state p {
          margin: 0;
          color: var(--text-secondary);
        }

        .action-btn {
          background: var(--primary);
          color: var(--text-on-primary);
          padding: 8px 16px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: all 0.2s ease;
        }

        .action-btn:hover {
          background: var(--primary-hover);
          transform: translateY(-1px);
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Clean, theme-based design */
        .dashboard-card.table-card {
          background: var(--surface) !important;
          backdrop-filter: blur(12px) !important;
          -webkit-backdrop-filter: blur(12px) !important;
          border: 1px solid var(--border) !important;
          border-radius: 12px !important;
          overflow: hidden;
          position: relative;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          contain: layout style paint;
        }

        .dashboard-card.table-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: var(--primary);
          opacity: 0.6;
        }

        .dashboard-card.table-card:hover {
          border-color: var(--border-hover);
          background: var(--surface-hover) !important;
        }

        .table-header {
          background: var(--surface-secondary);
          border-bottom: 1px solid var(--border);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          position: relative;
        }

        .table-body {
          background: var(--background);
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
