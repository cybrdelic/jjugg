/**
 * Enhanced Quick Actions Component
 * Provides bulk operations with proper error handling and snackbar notifications
 */

import React, { useState } from 'react';
import { Application, ApplicationStage } from '@/types';
import { useSnackBar } from '@/contexts/SnackBarContext';

interface QuickActionsProps {
    selectedApplications: Application[];
    selectedIds: string[];
    onStageChange: (appIds: string[], newStage: ApplicationStage) => Promise<void>;
    onBulkDelete: () => Promise<void>;
    onExport: () => Promise<void>;
    onClearSelection: () => void;
    onBulkEdit: (appIds: string[]) => void;
}const stagesOrder: ApplicationStage[] = ['applied', 'screening', 'interview', 'offer', 'rejected'];

const getNextStage = (currentStage: ApplicationStage): ApplicationStage | null => {
    const currentIndex = stagesOrder.indexOf(currentStage);
    return currentIndex < stagesOrder.length - 1 ? stagesOrder[currentIndex + 1] : null;
};

const getMostCommonStage = (applications: Application[]): ApplicationStage => {
    const stageCounts = applications.reduce((acc, app) => {
        acc[app.stage] = (acc[app.stage] || 0) + 1;
        return acc;
    }, {} as Record<ApplicationStage, number>);

    return Object.entries(stageCounts).reduce((a, b) =>
        stageCounts[a[0] as ApplicationStage] > stageCounts[b[0] as ApplicationStage] ? a : b
    )[0] as ApplicationStage;
};

export const QuickActions: React.FC<QuickActionsProps> = ({
    selectedApplications,
    selectedIds,
    onStageChange,
    onBulkDelete,
    onExport,
    onClearSelection,
    onBulkEdit
}) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const snackBar = useSnackBar();

    const handleMoveToNextStage = async () => {
        if (selectedApplications.length === 0 || isProcessing) return;

        setIsProcessing(true);
        try {
            // Group applications by current stage
            const stageGroups = selectedApplications.reduce((acc, app) => {
                if (!acc[app.stage]) acc[app.stage] = [];
                acc[app.stage].push(app);
                return acc;
            }, {} as Record<ApplicationStage, Application[]>);

            let totalMoved = 0;
            let totalSkipped = 0;

            // Process each stage group
            for (const [currentStage, apps] of Object.entries(stageGroups)) {
                const nextStage = getNextStage(currentStage as ApplicationStage);

                if (nextStage) {
                    const appIds = apps.map(app => app.id);
                    await onStageChange(appIds, nextStage);
                    totalMoved += apps.length;
                } else {
                    totalSkipped += apps.length;
                }
            }

            // Show summary notification
            if (totalMoved > 0 && totalSkipped > 0) {
                snackBar.showSuccess(
                    `Moved ${totalMoved} applications`,
                    `${totalSkipped} applications were already at the final stage`
                );
            } else if (totalMoved > 0) {
                snackBar.showSuccess(
                    `Successfully moved ${totalMoved} application${totalMoved > 1 ? 's' : ''}`,
                    'Applications advanced to next stage'
                );
            } else {
                snackBar.showWarning(
                    'No applications moved',
                    'All selected applications are already at the final stage'
                );
            }

        } catch (error) {
            snackBar.showError(
                'Failed to move applications',
                error instanceof Error ? error.message : 'An unexpected error occurred'
            );
        } finally {
            setIsProcessing(false);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0 || isProcessing) return;

        // Confirmation dialog
        const confirmed = window.confirm(
            `Are you sure you want to delete ${selectedIds.length} application${selectedIds.length > 1 ? 's' : ''}? This action cannot be undone.`
        );

        if (!confirmed) return;

        setIsProcessing(true);
        try {
            await onBulkDelete();

            snackBar.showSuccess(
                `Deleted ${selectedIds.length} application${selectedIds.length > 1 ? 's' : ''}`,
                'Applications have been permanently removed'
            );

            onClearSelection();
        } catch (error) {
            snackBar.showError(
                'Failed to delete applications',
                error instanceof Error ? error.message : 'An unexpected error occurred'
            );
        } finally {
            setIsProcessing(false);
        }
    };

    const handleExport = async () => {
        if (selectedIds.length === 0 || isProcessing) return;

        setIsProcessing(true);
        try {
            await onExport();

            snackBar.showSuccess(
                `Exported ${selectedIds.length} application${selectedIds.length > 1 ? 's' : ''}`,
                'CSV file has been downloaded'
            );
        } catch (error) {
            snackBar.showError(
                'Failed to export applications',
                error instanceof Error ? error.message : 'An unexpected error occurred'
            );
        } finally {
            setIsProcessing(false);
        }
    };

    const handleBulkEditClick = () => {
        onBulkEdit(selectedIds);
        snackBar.showInfo(
            'Bulk edit mode activated',
            `Editing ${selectedIds.length} application${selectedIds.length > 1 ? 's' : ''}`
        );
    };

    if (selectedIds.length === 0) return null;

    const mostCommonStage = getMostCommonStage(selectedApplications);
    const nextStage = getNextStage(mostCommonStage);
    const isMultiSelection = selectedIds.length > 1;

    return (
        <div className="quick-actions-section">
            <span className="section-label">
                <div className="selection-indicator"></div>
                {selectedIds.length} selected
            </span>
            <div className="action-buttons">
                {/* Move to Next Stage - Only show for bulk selections */}
                {isMultiSelection && (
                    <button
                        className={`action-btn action-btn-primary ${isProcessing ? 'processing' : ''}`}
                        onClick={handleMoveToNextStage}
                        disabled={isProcessing || !nextStage}
                        title={nextStage ? `Move to ${nextStage} stage` : 'Applications are at final stage'}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M7 13l3 3 7-7" />
                        </svg>
                    </button>
                )}

                {/* Bulk Edit - Show for both single and multiple selections */}
                <button
                    className={`action-btn action-btn-secondary ${isProcessing ? 'processing' : ''}`}
                    onClick={handleBulkEditClick}
                    disabled={isProcessing}
                    title={isMultiSelection ? "Edit selected applications" : "Edit application"}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                </button>

                {/* Export Selected */}
                <button
                    className={`action-btn action-btn-secondary ${isProcessing ? 'processing' : ''}`}
                    onClick={handleExport}
                    disabled={isProcessing}
                    title={isMultiSelection ? "Export selected applications" : "Export application"}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7,10 12,15 17,10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                </button>

                {/* Delete Selected */}
                <button
                    className={`action-btn action-btn-danger ${isProcessing ? 'processing' : ''}`}
                    onClick={handleBulkDelete}
                    disabled={isProcessing}
                    title={isMultiSelection ? "Delete selected applications" : "Delete application"}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3,6 5,6 21,6" />
                        <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2" />
                    </svg>
                </button>

                {/* Clear Selection */}
                <button
                    className="action-btn action-btn-ghost"
                    onClick={onClearSelection}
                    title="Clear selection"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
            </div>            <style jsx>{`
        .quick-actions-section {
          background: var(--primary-alpha-10);
          border-radius: var(--radius-md);
          padding: 4px 8px;
          animation: fadeIn var(--duration-200) var(--ease-out);
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .section-label {
          color: var(--primary);
          font-weight: 600;
          font-size: 10px;
          display: flex;
          align-items: center;
          gap: 3px;
          min-width: fit-content;
        }

        .selection-indicator {
          width: 6px;
          height: 6px;
          background: var(--primary);
          border-radius: var(--radius-full);
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.2);
          }
        }

        .action-buttons {
          display: flex;
          gap: 3px;
          align-items: center;
        }

        .action-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all var(--duration-150) var(--ease-out);
          background: var(--background);
          color: var(--text-secondary);
          position: relative;
        }

        .action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          pointer-events: none;
        }

        .action-btn:not(:disabled):hover {
          transform: translateY(-1px);
          box-shadow: var(--shadow-sm);
        }

        .action-btn:not(:disabled):active {
          transform: translateY(0);
          transition-duration: var(--duration-75);
        }

        .action-btn.processing {
          pointer-events: none;
        }

        .action-btn.processing::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 12px;
          height: 12px;
          margin: -6px 0 0 -6px;
          border: 1px solid transparent;
          border-top-color: currentColor;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .action-btn.processing svg {
          opacity: 0;
        }

        /* Button Variants */
        .action-btn-primary {
          background: var(--primary);
          border-color: var(--primary);
          color: white;
        }

        .action-btn-primary:not(:disabled):hover {
          background: var(--primary-dark);
          border-color: var(--primary-dark);
        }

        .action-btn-secondary {
          background: var(--surface);
          border-color: var(--border-strong);
          color: var(--text-primary);
        }

        .action-btn-secondary:not(:disabled):hover {
          background: var(--bg-hover);
          border-color: var(--border-focus);
        }

        .action-btn-danger {
          background: var(--surface);
          border-color: var(--error);
          color: var(--error);
        }

        .action-btn-danger:not(:disabled):hover {
          background: var(--error);
          color: white;
        }

        .action-btn-ghost {
          background: transparent;
          border-color: var(--border-subtle);
          color: var(--text-tertiary);
        }

        .action-btn-ghost:not(:disabled):hover {
          background: var(--bg-hover);
          border-color: var(--border);
          color: var(--text-secondary);
        }

        .action-btn svg {
          flex-shrink: 0;
          transition: transform var(--duration-150) var(--ease-out);
        }

        .action-btn:not(:disabled):hover svg {
          transform: scale(1.1);
        }
      `}</style>
        </div>
    );
};
