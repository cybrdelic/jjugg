import React from 'react';

interface TableSkeletonProps {
    rows?: number;
    columns?: number;
    dense?: boolean;
    hideHeader?: boolean;
    rowGridTemplate?: string;
}

interface KanbanSkeletonProps {
    stages?: string[];
    cardsPerColumn?: number;
}

export function TableSkeleton({ rows = 10, columns = 6, dense = false, hideHeader = false, rowGridTemplate }: TableSkeletonProps) {
    const rowHeight = dense ? 44 : 56;
    return (
        <div className="skeleton-overlay" aria-hidden>
            <div className="skeleton-table">
                {/* Header */}
                {!hideHeader && (
                    <div className="skeleton-header" style={{ gridTemplateColumns: rowGridTemplate || `48px repeat(${columns}, minmax(100px, 1fr))` }}>
                        <div className="skeleton-checkbox" />
                        {Array.from({ length: columns }).map((_, i) => (
                            <div key={i} className="skeleton-header-cell">
                                <div className="skeleton-line short" />
                                <div className="skeleton-input" />
                            </div>
                        ))}
                    </div>
                )}
                {/* Rows */}
                <div className="skeleton-rows" style={{ flex: 1, overflow: 'hidden' }}>
                    {Array.from({ length: rows }).map((_, i) => (
                        <div key={i} className="skeleton-row" style={{ height: rowHeight, gridTemplateColumns: rowGridTemplate || `48px repeat(${columns}, minmax(100px, 1fr))` }}>
                            <div className="skeleton-checkbox" />
                            {Array.from({ length: columns }).map((__, j) => (
                                <div key={j} className="skeleton-cell">
                                    <div className={`skeleton-line ${j % 3 === 0 ? 'short' : j % 3 === 1 ? 'medium' : ''}`} />
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
            <style jsx>{`
        .skeleton-overlay {
          /* Fallbacks in case theme variables are undefined */
          --skeleton-base: var(--border, rgba(200, 210, 220, 0.35));
          --skeleton-rgb: 200, 210, 220;
          position: absolute;
          inset: 0;
          background: ${'${hideHeader ? "transparent" : "var(--surface, var(--card, #fff))"}'};
          border-left: none;
          border-right: none;
          z-index: 20;
          pointer-events: none;
        }
        .skeleton-table {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .skeleton-header {
          display: grid;
          gap: var(--space-3, 12px);
          padding: var(--space-2, 8px) var(--space-3, 12px);
          border-bottom: 1px solid var(--border, rgba(0,0,0,0.08));
          background: var(--surface, #fff);
        }
        .skeleton-row {
          display: grid;
          gap: var(--space-3, 12px);
          align-items: center;
          padding: 0 var(--space-3, 12px);
          border-bottom: 1px dashed var(--border, rgba(0,0,0,0.08));
          background: var(--surface, #fff);
        }
        .skeleton-checkbox {
          width: 18px;
          height: 18px;
          border-radius: var(--radius-sm, 6px);
          background: var(--skeleton-base);
          position: relative;
          overflow: hidden;
        }
        .skeleton-header-cell { display: flex; flex-direction: column; gap: var(--space-2, 8px); }
        .skeleton-input {
          height: 28px;
          border-radius: var(--radius-sm, 6px);
          background: var(--skeleton-base);
          position: relative;
          overflow: hidden;
        }
        .skeleton-cell { display: flex; align-items: center; }
        .skeleton-line {
          width: 80%;
          height: 12px;
          border-radius: var(--radius-sm, 6px);
          background: var(--skeleton-base);
          position: relative;
          overflow: hidden;
        }
        .skeleton-line.short { width: 40%; }
        .skeleton-line.medium { width: 60%; }

        /* Shimmer */
        .skeleton-line::after, .skeleton-input::after, .skeleton-checkbox::after {
          content: '';
          position: absolute;
          inset: 0;
          transform: translateX(-100%);
          background: linear-gradient(90deg,
            rgba(var(--skeleton-rgb), 0) 0%,
            rgba(var(--skeleton-rgb), 0.35) 50%,
            rgba(var(--skeleton-rgb), 0) 100%
          );
          animation: shimmer 700ms var(--ease-out, ease-out) infinite;
        }
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
        </div>
    );
}

export function KanbanSkeleton({ stages = ['Applied', 'Screening', 'Interview', 'Offer'], cardsPerColumn = 4 }: KanbanSkeletonProps) {
    return (
        <div className="skeleton-overlay" aria-hidden>
            <div className="kanban-skeleton">
                {stages.map((stage, i) => (
                    <div key={i} className="kanban-col">
                        <div className="kanban-col-header">
                            <div className="skeleton-line short" />
                        </div>
                        <div className="kanban-cards">
                            {Array.from({ length: cardsPerColumn }).map((_, j) => (
                                <div key={j} className="kanban-card">
                                    <div className="skeleton-line" />
                                    <div className="skeleton-line medium" />
                                    <div className="skeleton-line short" />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <style jsx>{`
        .skeleton-overlay {
          --skeleton-base: var(--border, rgba(200, 210, 220, 0.35));
          --skeleton-rgb: 200, 210, 220;
          position: absolute;
          inset: 0;
          background: var(--surface, var(--card, #fff));
          border-left: none;
          border-right: none;
          z-index: 20;
          pointer-events: none;
        }
        .kanban-skeleton {
          display: grid;
          grid-template-columns: repeat(${Math.max(1, stages.length)}, minmax(240px, 1fr));
          gap: var(--space-4, 16px);
          padding: var(--space-4, 16px);
        }
        .kanban-col { display: flex; flex-direction: column; gap: var(--space-3, 12px); }
        .kanban-col-header { padding: var(--space-2, 8px); }
        .kanban-cards { display: flex; flex-direction: column; gap: var(--space-3, 12px); }
        .kanban-card {
          padding: var(--space-3, 12px);
          border: 1px solid var(--border, rgba(0,0,0,0.08));
          border-radius: var(--radius-md, 10px);
          background: var(--skeleton-card, var(--background, #fafafa));
        }
        .skeleton-line {
          width: 80%;
          height: 12px;
          border-radius: var(--radius-sm, 6px);
          background: var(--skeleton-base);
          position: relative;
          overflow: hidden;
        }
        .skeleton-line.short { width: 40%; }
        .skeleton-line.medium { width: 60%; }
        .skeleton-line::after {
          content: '';
          position: absolute;
          inset: 0;
          transform: translateX(-100%);
          background: linear-gradient(90deg,
            rgba(var(--skeleton-rgb), 0) 0%,
            rgba(var(--skeleton-rgb), 0.35) 50%,
            rgba(var(--skeleton-rgb), 0) 100%
          );
          animation: shimmer 700ms var(--ease-out, ease-out) infinite;
        }
        @keyframes shimmer { 100% { transform: translateX(100%); } }
      `}</style>
        </div>
    );
}

export default TableSkeleton;
