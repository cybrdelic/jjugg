/**
 * Applications Header Component
 * Manages search, actions, and header controls
 */

import React from 'react';
import { PlusCircle, Download, Trash2 } from 'lucide-react';
import CardHeader from '../../CardHeader';
import ActionButton from '../../dashboard/ActionButton';
import ModernSearchBar from '../../ModernSearchBar';
import { Application, StatusUpdate } from '@/types';

interface ApplicationsHeaderProps {
    // Data
    applications: Application[];
    applicationStats: { applications: number; interviews: number };
    statusUpdates: StatusUpdate[];
    selectedRowsCount: number;

    // Handlers
    onSearch: (term: string) => void;
    onAddApplication: () => void;
    onBulkDelete: () => void;
    onExport: () => void;

    // Loading states
    hasGlobalUpdate: boolean;
}

export function ApplicationsHeader({
    applications,
    applicationStats,
    statusUpdates,
    selectedRowsCount,
    onSearch,
    onAddApplication,
    onBulkDelete,
    onExport,
    hasGlobalUpdate
}: ApplicationsHeaderProps) {
    return (
        <CardHeader
            title={
                <div className="header-title-wrapper">
                    <span className={hasGlobalUpdate ? 'pulsing' : ''}>Applications</span>
                    <span className="stats">
                        ({applicationStats.applications} Applied, {applicationStats.interviews} Upcoming)
                    </span>
                    {statusUpdates.filter(update => !update.appId).map(update => (
                        <span key={update.id} className="global-status-text" role="status">
                            {update.message}
                            <div className="button-shine"></div>
                        </span>
                    ))}
                </div>
            }
            subtitle="Effortlessly track and manage your job applications"
            accentColor="var(--accent-blue)"
            variant="default"
        >
            <div className="header-actions">
                <ModernSearchBar
                    applications={applications}
                    onSearch={onSearch}
                    placeholder="Search applications, companies, positions..."
                    className="search-component"
                />
                <div className="action-buttons">
                    {selectedRowsCount > 0 && (
                        <ActionButton
                            label={`Delete ${selectedRowsCount}`}
                            icon={Trash2}
                            variant="danger"
                            onClick={onBulkDelete}
                        />
                    )}
                    <ActionButton
                        label="New Application"
                        icon={PlusCircle}
                        variant="primary"
                        onClick={onAddApplication}
                    />
                    <ActionButton
                        label="Export CSV"
                        icon={Download}
                        variant="ghost"
                        onClick={onExport}
                    />
                </div>
            </div>

            <style jsx>{`
        .header-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-top: 16px;
          padding: 0;
          flex-wrap: wrap;
          max-width: 100%;
          overflow-x: hidden;
        }

        .search-component {
          flex: 1;
          min-width: 280px;
          max-width: 450px;
        }

        .action-buttons {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        @media (max-width: 768px) {
          .header-actions {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }

          .search-component {
            min-width: auto;
            max-width: none;
            width: 100%;
          }

          .action-buttons {
            justify-content: center;
            flex-wrap: wrap;
          }
        }

        .header-title-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .stats {
          font-size: 14px;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .pulsing {
          animation: pulse 2s infinite;
        }

        .global-status-text {
          background: var(--accent-green);
          color: white;
          padding: 4px 12px;
          border-radius: 16px;
          font-size: 12px;
          font-weight: 600;
          position: relative;
          overflow: hidden;
          animation: statusFade 3s ease-in-out forwards;
        }

        .button-shine {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
          );
          animation: shimmer 2s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }

        @keyframes statusFade {
          0% { opacity: 0; transform: translateY(10px); }
          20% { opacity: 1; transform: translateY(0); }
          80% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-10px); }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
        </CardHeader>
    );
}
