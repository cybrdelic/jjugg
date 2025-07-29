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
          grid-template-columns: 1.8fr 2.2fr 1fr 1.5fr 0.8fr 1.2fr 1fr 1fr;
          justify-items: start;
          padding: 12px 16px;
          background: var(--surface);
          border-bottom: 1px solid var(--border);
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
          position: sticky;
          top: 0;
          z-index: 10;
          gap: 0;
        }

        .table-header.autosize {
          grid-template-columns: auto auto auto auto auto auto auto auto;
        }

        @media (max-width: 1400px) {
          .table-header {
            grid-template-columns: 2fr 2.5fr 1fr 1.2fr 1fr 1.5fr 1.2fr 0;
            gap: 0;
          }
        }

        @media (max-width: 1200px) {
          .table-header {
            grid-template-columns: 2fr 2fr 1fr 1.2fr 1fr 1.5fr 0 0;
            gap: 0;
          }
        }

        @media (max-width: 992px) {
          .table-header {
            grid-template-columns: 2fr 2fr 1fr 1.2fr 0 0 0 0;
            gap: 0;
          }
        }

        @media (max-width: 768px) {
          .table-header {
            grid-template-columns: 2fr 2fr 1fr 1.2fr 0 0 0 0;
            gap: 0;
          }
        }

        .header-cell {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .header-cell span {
          display: flex;
          align-items: center;
          gap: 4px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.025em;
          font-size: 11px;
          color: var(--text-secondary);
          transition: color 0.2s ease;
        }

        .header-cell:hover span {
          color: var(--primary);
        }

        .header-cell.sorted span {
          color: var(--primary);
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
          box-shadow: var(--shadow-glow);
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
          color: var(--text-inverse);
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
          background: var(--primary-dark);
          transform: translateY(-1px);
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
}
