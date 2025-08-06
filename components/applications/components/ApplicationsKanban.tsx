/**
 * Applications Kanban Component
 * Handles kanban view rendering and interactions
 */

import React from 'react';
import { Application, ApplicationStage, StatusUpdate } from '@/types';
import KanbanColumn from '../KanbanColumn';
import ApplicationCard from '../ApplicationCard';

interface ApplicationsKanbanProps {
  // Data
  applicationsByStage: Record<ApplicationStage, Application[]>;
  statusUpdates: StatusUpdate[];

  // UI State
  isMobileView: boolean;

  // Handlers
  onStageChange: (appId: string, stage: ApplicationStage) => void;
  onKanbanDrop: (draggedItemId: string, targetStage: ApplicationStage) => void;
  onEditApplication: (appId: string) => void;
  onDeleteApplication: (appId: string) => void;
  onToggleShortlist: (appId: string) => void;
  onOpenDetailModal: (appId: string) => void;

  // Stage management
  stagesOrder: ApplicationStage[];
}

export function ApplicationsKanban({
  applicationsByStage,
  statusUpdates,
  isMobileView,
  onStageChange,
  onKanbanDrop,
  onEditApplication,
  onDeleteApplication,
  onToggleShortlist,
  onOpenDetailModal,
  stagesOrder
}: ApplicationsKanbanProps) {
  const getStageLabel = (stage: ApplicationStage): string =>
    stage.charAt(0).toUpperCase() + stage.slice(1);

  const getStageColor = (stage: ApplicationStage): string => {
    switch (stage) {
      case 'applied': return 'var(--accent-blue)';
      case 'screening': return 'var(--accent-purple)';
      case 'interview': return 'var(--accent-green)';
      case 'offer': return 'var(--accent-success)';
      case 'rejected': return 'var(--accent-red)';
      default: return 'var(--text-tertiary)';
    }
  };

  const calculateStageProgress = (stage: ApplicationStage): number => {
    return Math.min(((stagesOrder.indexOf(stage) + 1) / stagesOrder.length) * 100, 100);
  };

  return (
    <div className={`dashboard-grid kanban-grid ${isMobileView ? 'mobile-view' : ''}`}>
      {stagesOrder.map(stage => (
        <KanbanColumn
          key={stage}
          title={getStageLabel(stage)}
          count={applicationsByStage[stage].length}
          color={getStageColor(stage)}
          stage={stage}
          onAddNew={() => { console.log(`Add new in ${stage}`); }}
          onCollapseToggle={(collapsed) => console.log(`${stage} column ${collapsed ? 'collapsed' : 'expanded'}`)}
          onDrop={(draggedItemId) => onKanbanDrop(draggedItemId, stage as ApplicationStage)}
        >
          {applicationsByStage[stage].map(app => (
            <div key={app.id} className="application-wrapper">
              {/* Status Updates for this application */}
              <div className="status-updates">
                {statusUpdates.filter(update => update.appId === app.id).map(update => (
                  <div key={update.id} className="status-bubble" role="status">
                    {update.message}
                  </div>
                ))}
              </div>

              {/* Application Card */}
              <ApplicationCard
                id={app.id}
                position={app.position}
                company={app.company}
                dateApplied={app.dateApplied}
                stage={app.stage}
                salary={app.salary}
                location={app.location}
                remote={app.remote}
                notes={app.notes}
                isShortlisted={app.isShortlisted}
                onEdit={() => onEditApplication(app.id)}
                onDelete={() => onDeleteApplication(app.id)}
                onShortlistToggle={() => onToggleShortlist(app.id)}
                onClick={() => onOpenDetailModal(app.id)}
              />

              {/* Progress Bar */}
              <div
                className="progress-bar"
                style={{
                  width: `${calculateStageProgress(app.stage)}%`,
                  backgroundColor: getStageColor(app.stage)
                }}
              />
            </div>
          ))}
        </KanbanColumn>
      ))}

      <style jsx>{`
        .dashboard-grid {
          display: grid;
          gap: 12px;
        }

        .kanban-grid {
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          overflow-x: auto;
          padding-bottom: 12px;
        }

        .kanban-grid.mobile-view {
          grid-template-columns: 1fr;
          overflow-y: auto;
          max-height: calc(100vh - 200px);
        }

        .application-wrapper {
          position: relative;
          margin-bottom: 12px;
        }

        .status-updates {
          position: absolute;
          top: 6px;
          right: 6px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          z-index: 5;
        }

        .status-bubble {
          padding: var(--space-1) var(--space-2-5);
          background: var(--glass-bg);
          backdrop-filter: var(--glass-backdrop);
          color: var(--text-inverse);
          font-size: var(--text-xs);
          font-family: var(--font-interface);
          font-weight: var(--font-weight-medium);
          border-radius: var(--border-radius-full);
          border: 1px solid var(--glass-border);
          animation: bubbleFade var(--duration-1000) var(--ease-smooth) forwards;
        }

        .progress-bar {
          height: 4px;
          background: var(--border);
          border-radius: var(--border-radius-sm);
          margin-top: var(--space-2);
          overflow: hidden;
          position: relative;
        }

        .progress-bar::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          background: inherit;
          border-radius: 2px;
          transition: width 0.3s ease;
        }

        @keyframes bubbleFade {
          0% { opacity: 0; transform: scale(0.9); }
          20% { opacity: 1; transform: scale(1); }
          80% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.9); }
        }
      `}</style>
    </div>
  );
}
