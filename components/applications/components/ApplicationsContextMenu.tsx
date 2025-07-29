/**
 * Applications Context Menu Component
 * Right-click context menu for application actions
 */

import React, { useEffect, useRef } from 'react';
import {
  ChevronRight, Edit2, ArrowLeft, ArrowRight, Trash2
} from 'lucide-react';
import { Application, ApplicationStage } from '@/types';

interface ApplicationsContextMenuProps {
  contextMenu: { id: string, x: number, y: number } | null;
  applications: Application[];
  stagesOrder: ApplicationStage[];

  // Handlers
  onOpenDetailModal: (appId: string) => void;
  onEditApplication: (appId: string) => void;
  onIncrementStage: (appId: string) => void;
  onDecrementStage: (appId: string) => void;
  onDeleteApplication: (appId: string) => void;
  onClose: () => void;
}

export function ApplicationsContextMenu({
  contextMenu,
  applications,
  stagesOrder,
  onOpenDetailModal,
  onEditApplication,
  onIncrementStage,
  onDecrementStage,
  onDeleteApplication,
  onClose
}: ApplicationsContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (contextMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [contextMenu, onClose]);

  if (!contextMenu) return null;

  const app = applications.find(a => a.id === contextMenu.id);
  if (!app) return null;

  const currentStageIndex = stagesOrder.indexOf(app.stage as ApplicationStage);
  const canMoveForward = currentStageIndex < stagesOrder.length - 1;
  const canMoveBackward = currentStageIndex > 0;

  const handleMenuItemClick = (action: () => void) => {
    action();
    onClose();
  };

  const handleMenuItemKeyDown = (event: React.KeyboardEvent, action: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleMenuItemClick(action);
    }
  };

  return (
    <div
      ref={menuRef}
      className="context-menu"
      style={{
        position: 'fixed',
        top: `${contextMenu.y}px`,
        left: `${contextMenu.x}px`
      }}
      role="menu"
      aria-label="Application actions"
      tabIndex={0}
    >
      {/* View Details */}
      <div
        className="context-menu-item"
        onClick={() => handleMenuItemClick(() => onOpenDetailModal(contextMenu.id))}
        role="menuitem"
        tabIndex={0}
        onKeyDown={(e) => handleMenuItemKeyDown(e, () => onOpenDetailModal(contextMenu.id))}
      >
        <ChevronRight size={14} className="context-icon" />
        <span>View Details</span>
      </div>

      {/* Edit Application */}
      <div
        className="context-menu-item"
        onClick={() => handleMenuItemClick(() => onEditApplication(contextMenu.id))}
        role="menuitem"
        tabIndex={0}
        onKeyDown={(e) => handleMenuItemKeyDown(e, () => onEditApplication(contextMenu.id))}
      >
        <Edit2 size={14} className="context-icon" />
        <span>Edit Application</span>
      </div>

      <div className="context-menu-divider"></div>

      {/* Previous Stage */}
      <div
        className={`context-menu-item ${!canMoveBackward ? 'disabled' : ''}`}
        onClick={() => canMoveBackward && handleMenuItemClick(() => onDecrementStage(contextMenu.id))}
        role="menuitem"
        tabIndex={canMoveBackward ? 0 : -1}
        onKeyDown={(e) => canMoveBackward && handleMenuItemKeyDown(e, () => onDecrementStage(contextMenu.id))}
        aria-disabled={!canMoveBackward}
      >
        <ArrowLeft size={14} className="context-icon" />
        <span>Previous Stage</span>
        {canMoveBackward && (
          <span className="stage-hint">
            ({stagesOrder[currentStageIndex - 1]})
          </span>
        )}
      </div>

      {/* Next Stage */}
      <div
        className={`context-menu-item ${!canMoveForward ? 'disabled' : ''}`}
        onClick={() => canMoveForward && handleMenuItemClick(() => onIncrementStage(contextMenu.id))}
        role="menuitem"
        tabIndex={canMoveForward ? 0 : -1}
        onKeyDown={(e) => canMoveForward && handleMenuItemKeyDown(e, () => onIncrementStage(contextMenu.id))}
        aria-disabled={!canMoveForward}
      >
        <ArrowRight size={14} className="context-icon" />
        <span>Next Stage</span>
        {canMoveForward && (
          <span className="stage-hint">
            ({stagesOrder[currentStageIndex + 1]})
          </span>
        )}
      </div>

      <div className="context-menu-divider"></div>

      {/* Delete */}
      <div
        className="context-menu-item delete"
        onClick={() => handleMenuItemClick(() => onDeleteApplication(contextMenu.id))}
        role="menuitem"
        tabIndex={0}
        onKeyDown={(e) => handleMenuItemKeyDown(e, () => onDeleteApplication(contextMenu.id))}
      >
        <Trash2 size={14} className="context-icon" />
        <span>Delete</span>
      </div>

      <style jsx>{`
        .context-menu {
          background: var(--glass-bg);
          border: 1px solid var(--border-thin);
          border-radius: 8px;
          box-shadow: var(--shadow);
          min-width: 180px;
          z-index: 1000;
          animation: fadeIn 0.2s ease;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          overflow: hidden;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .context-menu-item {
          padding: 10px 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.15s ease;
          color: var(--text-primary);
          border-radius: 4px;
          margin: 2px;
          font-size: 13px;
          position: relative;
        }

        .context-menu-item:hover:not(.disabled) {
          background: var(--hover-bg);
        }

        .context-menu-item:focus:not(.disabled) {
          background: var(--hover-bg);
          outline: none;
        }

        .context-menu-item.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .context-icon {
          color: var(--text-secondary);
          flex-shrink: 0;
        }

        .context-menu-item.delete {
          color: var(--accent-red);
        }

        .context-menu-item.delete:hover {
          background: rgba(var(--accent-red-rgb), 0.1);
        }

        .context-menu-item.delete .context-icon {
          color: var(--accent-red);
        }

        .context-menu-divider {
          height: 1px;
          background: var(--border-thin);
          margin: 4px 0;
        }

        .stage-hint {
          margin-left: auto;
          font-size: 11px;
          color: var(--text-tertiary);
          text-transform: capitalize;
        }

        /* Focus management for accessibility */
        .context-menu-item:first-child {
          margin-top: 4px;
        }

        .context-menu-item:last-child {
          margin-bottom: 4px;
        }


      `}</style>
    </div>
  );
}
