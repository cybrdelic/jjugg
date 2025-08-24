import { Application, ApplicationStage } from '@/types';
import { Loader2 } from 'lucide-react';
import React, { useEffect, useRef } from 'react';

// Utility to style stage labels
const stageClasses: Record<ApplicationStage, string> = {
  applied: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  screening: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  interview: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200',
  offer: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  rejected: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
};

interface BasicApplicationsTableProps {
  applications: Application[];
  visibleColumns: string[];
  selectedRows: string[];
  isLoading: boolean;
  loadingMore?: boolean;
  hasMore: boolean;
  totalCount?: number;
  onRowSelect: (appId: string, selected: boolean) => void;
  onRowClick: (appId: string, e: React.MouseEvent) => void;
  onLoadMore?: () => void | Promise<void>;
}

export function BasicApplicationsTable({
  applications,
  visibleColumns,
  selectedRows,
  isLoading,
  loadingMore,
  hasMore,
  totalCount,
  onRowSelect,
  onRowClick,
  onLoadMore
}: BasicApplicationsTableProps) {
  const tableRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!hasMore || !onLoadMore || isLoading || loadingMore) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            console.log('[BasicTable] Sentinel triggered, calling onLoadMore');
            onLoadMore();
          }
        });
      },
      { rootMargin: '200px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, onLoadMore, isLoading, loadingMore]);

  if (applications.length === 0 && !isLoading) {
    return (
      <div className="p-10 text-center">
        <h3>No applications found</h3>
        <p>Create your first application to get started.</p>
      </div>
    );
  }

  return (
    <div ref={tableRef} className="w-full rounded-xl shadow-sm border border-gray-200 overflow-hidden bg-white">
      {/* Simple table header */}
      <div className="grid grid-cols-[42px_1.2fr_1fr_120px_110px_120px_110px] gap-3 px-4 py-2 bg-gradient-to-b from-gray-50 to-white border-b border-gray-200 font-semibold text-[13px] tracking-wide sticky top-0 z-10">
        <div>Select</div>
        <div>Company</div>
        <div>Position</div>
        <div>Date Applied</div>
        <div>Stage</div>
        <div>Location</div>
        <div>Salary</div>
      </div>

      {/* Table body */}
      <div className="divide-y divide-gray-100">
        {applications.map((app) => (
          <div
            key={app.id}
            className={`group grid grid-cols-[42px_1.2fr_1fr_120px_110px_120px_110px] gap-3 px-4 py-2 text-sm cursor-pointer transition-colors ${
              selectedRows.includes(app.id)
                ? 'bg-blue-50/70 hover:bg-blue-50'
                : 'hover:bg-gray-50'
            }`}
            onClick={(e) => onRowClick(app.id, e)}
          >
            <input
              type="checkbox"
              title="Select application"
              checked={selectedRows.includes(app.id)}
              onChange={(e) => {
                e.stopPropagation();
                onRowSelect(app.id, e.target.checked);
              }}
            />
            <div className="font-medium text-gray-800 truncate flex items-center gap-2">
              <span className="truncate" title={app.company?.name || 'Unknown Company'}>
                {app.company?.name || 'Unknown Company'}
              </span>
              {app.isShortlisted && (
                <span className="text-amber-500 text-xs font-semibold">★</span>
              )}
            </div>
            <div className="text-gray-600 truncate" title={app.position}>{app.position}</div>
            <div className="text-gray-600 tabular-nums text-xs flex items-center" title={new Date(app.dateApplied).toLocaleString()}>
              {new Date(app.dateApplied).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' })}
            </div>
            <div className="flex items-center">
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-semibold leading-4 ${stageClasses[app.stage as ApplicationStage]}`}
              >
                {app.stage}
              </span>
            </div>
            <div className="text-gray-600 truncate" title={app.location || 'Remote'}>
              {app.location || 'Remote'}
            </div>
            <div className="text-gray-700 font-medium tabular-nums">
              {app.salary || '-'}
            </div>
          </div>
        ))}
      </div>

      {/* Loading states */}
      {loadingMore && (
        <div className="p-4 text-center text-sm text-gray-600 flex items-center justify-center gap-2 bg-white/60">
          <Loader2 size={18} className="animate-spin text-blue-500" />
          <span>Loading more applications...</span>
        </div>
      )}

      {/* End state */}
      {!hasMore && applications.length > 0 && (
        <div className="p-4 text-center text-xs uppercase tracking-wide text-gray-500 bg-gradient-to-t from-gray-50 to-white">
          All applications loaded ({applications.length} total)
        </div>
      )}

      {/* Footer info */}
      <div className="p-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs">
        <div className="text-gray-600">
          Showing <span className="font-semibold text-gray-800">{applications.length}</span>{' '}
          {totalCount ? <> of <span className="font-semibold text-gray-800">{totalCount}</span></> : ''} applications
        </div>
        {hasMore && (
          <button
            onClick={() => onLoadMore && onLoadMore()}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-600 text-white rounded-md text-xs font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition"
            disabled={loadingMore}
          >
            {loadingMore ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Loading...
              </>
            ) : (
              <>Load More</>
            )}
          </button>
        )}
      </div>

      {/* Intersection Observer Sentinel */}
      {hasMore && <div ref={sentinelRef} className="h-px" />}
    </div>
  );
}
