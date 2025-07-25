'use client';

import React, { useState } from 'react';
import { PlusCircle, ChevronDown, ChevronUp, MoreHorizontal } from 'lucide-react';

interface KanbanColumnProps {
  title: string;
  count: number;
  color: string;
  children: React.ReactNode;
  onAddNew?: () => void;
  onCollapseToggle?: (collapsed: boolean) => void;
  onDrop?: (draggedItemId: string) => void;
  stage?: string;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  title,
  count,
  color,
  children,
  onAddNew,
  onCollapseToggle,
  onDrop,
  stage
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Calculate RGB value for backgrounds
  const rgbMatch = color.match(/var\(--accent-(.*)-rgb\)/);
  const rgbVar = rgbMatch
    ? color.replace(')', '-rgb)')
    : color.replace('var(--accent-', 'var(--accent-').replace(')', '-rgb)');

  // Toggle column collapse state
  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    if (onCollapseToggle) {
      onCollapseToggle(newState);
    }
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  // Handle drag leave
  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const draggedItemId = e.dataTransfer.getData('text/plain');
    if (draggedItemId && onDrop) {
      onDrop(draggedItemId);
    }
  };

  return (
    <div
      className={`kanban-column ${isCollapsed ? 'collapsed' : ''} ${isDragOver ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        '--column-color': color,
        '--column-color-rgb': rgbVar
      } as React.CSSProperties}
    >
      <div className="column-header">
        <div className="header-left">
          <span className="header-indicator"></span>
          <h3 className="column-title">{title}</h3>
          <span className="column-count">{count}</span>
        </div>

        <div className="header-actions">
          {onAddNew && (
            <button className="action-button add-button" onClick={onAddNew} title="Add new application">
              <PlusCircle size={16} />
            </button>
          )}

          <button className="action-button collapse-button" onClick={toggleCollapse} title={isCollapsed ? 'Expand' : 'Collapse'}>
            {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>

          <div className="menu-container">
            <button
              className="action-button menu-button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              title="More options"
            >
              <MoreHorizontal size={16} />
            </button>

            {isMenuOpen && (
              <div className="column-menu">
                <button className="menu-item">Sort by newest</button>
                <button className="menu-item">Sort by oldest</button>
                <button className="menu-item">Sort by company</button>
                <div className="menu-divider"></div>
                <button className="menu-item">Export this column</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="column-content">
        {children}

        {count === 0 && (
          <div className="empty-column">
            <p>No applications yet</p>
            {onAddNew && (
              <button className="add-card-button" onClick={onAddNew}>
                <PlusCircle size={16} />
                <span>Add application</span>
              </button>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .kanban-column {
          display: flex;
          flex-direction: column;
          min-width: 290px;
          width: 290px;
          height: 100%;
          background: var(--glass-bg);
          border-radius: var(--border-radius);
          border: 1px solid var(--border-thin);
          transition: all 0.3s var(--easing-standard);
          box-shadow: var(--shadow);
          position: relative;
          overflow: hidden;
        }

        .kanban-column::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 5px;
          background-color: var(--column-color);
          opacity: 0.8;
          transition: all 0.3s var(--easing-standard);
        }

        .kanban-column.hovered {
          transform: translateY(-3px);
          box-shadow: var(--shadow-lg), 0 0 15px rgba(var(--column-color-rgb), 0.1);
          border-color: rgba(var(--column-color-rgb), 0.3);
        }

        .kanban-column.hovered::before {
          height: 6px;
          opacity: 1;
        }

        .column-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          border-bottom: 1px solid var(--border-divider);
          transition: all 0.3s var(--easing-standard);
        }

        .kanban-column.collapsed {
          height: auto;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .header-indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background-color: var(--column-color);
          transition: all 0.3s var(--easing-standard);
        }

        .kanban-column.hovered .header-indicator {
          transform: scale(1.2);
          box-shadow: 0 0 8px rgba(var(--column-color-rgb), 0.5);
        }

        .column-title {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
          transition: color 0.3s var(--easing-standard);
        }

        .kanban-column.hovered .column-title {
          color: var(--column-color);
        }

        .column-count {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 24px;
          height: 24px;
          padding: 0 8px;
          background: var(--hover-bg);
          color: var(--text-secondary);
          border-radius: 12px;
          font-size: 13px;
          font-weight: 500;
          transition: all 0.3s var(--easing-standard);
        }

        .kanban-column.hovered .column-count {
          background-color: rgba(var(--column-color-rgb), 0.1);
          color: var(--column-color);
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .action-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          background: transparent;
          border: none;
          border-radius: var(--border-radius);
          color: var(--text-tertiary);
          cursor: pointer;
          transition: all 0.2s var(--easing-standard);
        }

        .action-button:hover {
          background: var(--hover-bg);
          color: var(--text-primary);
        }

        .add-button:hover {
          color: var(--column-color);
        }

        .menu-container {
          position: relative;
        }

        .column-menu {
          position: absolute;
          top: calc(100% + 5px);
          right: 0;
          width: 180px;
          background: var(--glass-card-bg);
          border-radius: var(--border-radius);
          border: 1px solid var(--border-thin);
          box-shadow: var(--shadow-lg);
          z-index: 10;
          overflow: hidden;
          animation: fadeInDown 0.2s var(--easing-standard);
        }

        .menu-item {
          display: flex;
          width: 100%;
          padding: 10px 15px;
          background: transparent;
          border: none;
          text-align: left;
          color: var(--text-secondary);
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s var(--easing-standard);
        }

        .menu-item:hover {
          background: var(--hover-bg);
          color: var(--text-primary);
        }

        .menu-divider {
          height: 1px;
          background: var(--border-divider);
          margin: 5px 0;
        }

        .column-content {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 16px;
          overflow-y: auto;
          max-height: calc(100vh - 220px);
          transition: all 0.3s var(--easing-standard);
        }

        .kanban-column.collapsed .column-content {
          max-height: 0;
          padding: 0 16px;
          overflow: hidden;
        }

        .empty-column {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 30px 0;
          text-align: center;
        }

        .empty-column p {
          margin: 0 0 15px 0;
          color: var(--text-tertiary);
          font-size: 14px;
        }

        .add-card-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 15px;
          background: rgba(var(--column-color-rgb), 0.1);
          border: 1px dashed rgba(var(--column-color-rgb), 0.3);
          border-radius: var(--border-radius);
          color: var(--column-color);
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s var(--easing-standard);
        }

        .add-card-button:hover {
          background: rgba(var(--column-color-rgb), 0.15);
          transform: translateY(-1px);
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default KanbanColumn;
