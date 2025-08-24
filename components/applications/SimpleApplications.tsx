import Modal from '@/components/Modal';
import { AppDataContext } from '@/contexts/AppDataContext';
import { Application } from '@/types';
import React, { useCallback, useContext, useState } from 'react';
import { BasicApplicationsTable } from './components/BasicApplicationsTable';

export default function SimpleApplications() {
  const context = useContext(AppDataContext);

  if (!context) {
    throw new Error('SimpleApplications must be used within an AppDataProvider');
  }

  const {
    applications,
    loading,
    applicationsLoadingMore,
    applicationsHasMore,
    loadMoreApplications,
    applicationsTotal
  } = context;

  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Debug pagination state
  console.log('[SimpleApplications] Render state:', {
    applicationCount: applications.length,
    hasMore: applicationsHasMore,
    isLoading: loading,
    loadingMore: applicationsLoadingMore,
    totalCount: applicationsTotal
  });

  const visibleColumns = [
    'company',
    'position',
    'dateApplied',
    'stage',
    'location',
    'salary'
  ];

  const handleRowSelect = useCallback((appId: string, selected: boolean) => {
    setSelectedRows(prev =>
      selected
        ? [...prev, appId]
        : prev.filter(id => id !== appId)
    );
  }, []);

  const handleRowClick = useCallback((appId: string, e: React.MouseEvent) => {
    // Don't open modal if clicking checkbox
    if ((e.target as HTMLElement).tagName === 'INPUT') return;

    const app = applications.find((a: Application) => a.id === appId);
    if (app) {
      setSelectedApplication(app);
      setIsModalOpen(true);
    }
  }, [applications]);

  const handleLoadMore = useCallback(async () => {
    console.log('[SimpleApplications] Manual loadMore triggered');
    if (loadMoreApplications) {
      try {
        await loadMoreApplications();
      } catch (error) {
        console.error('[SimpleApplications] LoadMore error:', error);
      }
    }
  }, [loadMoreApplications]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-800 via-slate-700 to-slate-500 dark:from-slate-100 dark:via-slate-300 dark:to-slate-500">
              Applications
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Track and manage your job search pipeline. Scroll to load more.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-[11px] font-medium">
            <span className="px-2 py-1 rounded bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              Loaded: {applications.length}
            </span>
            <span className={`px-2 py-1 rounded ${applicationsHasMore ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'}`}>
              {applicationsHasMore ? 'More Available' : 'All Loaded'}
            </span>
            <span className={`px-2 py-1 rounded ${loading ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>Init Load: {loading ? 'Yes' : 'No'}</span>
            <span className={`px-2 py-1 rounded ${applicationsLoadingMore ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>Loading More: {applicationsLoadingMore ? 'Yes' : 'No'}</span>
            {applicationsTotal && (
              <span className="px-2 py-1 rounded bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                DB Total: {applicationsTotal}
              </span>
            )}
          </div>
        </div>

        {/* Debug Panel */}
        <div className="relative group">
          <div className="transition-all duration-300 overflow-hidden max-h-0 group-hover:max-h-64">
            <div className="mt-2 p-4 bg-yellow-50/70 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-md backdrop-blur-sm shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm text-yellow-800 dark:text-yellow-300 flex items-center gap-2">
                  Debug Info
                </h3>
                <button
                  onClick={handleLoadMore}
                  disabled={!applicationsHasMore || applicationsLoadingMore}
                  className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white rounded shadow-sm disabled:opacity-60"
                >
                  {applicationsLoadingMore ? 'Loading…' : 'Manual Load More'}
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 text-[11px] leading-tight text-slate-700 dark:text-slate-300">
                <div className="p-2 rounded bg-white/60 dark:bg-slate-800/50 shadow-xs">Loaded: {applications.length}</div>
                <div className="p-2 rounded bg-white/60 dark:bg-slate-800/50 shadow-xs">HasMore: {String(applicationsHasMore)}</div>
                <div className="p-2 rounded bg-white/60 dark:bg-slate-800/50 shadow-xs">InitLoading: {String(loading)}</div>
                <div className="p-2 rounded bg-white/60 dark:bg-slate-800/50 shadow-xs">LoadingMore: {String(applicationsLoadingMore)}</div>
                <div className="p-2 rounded bg-white/60 dark:bg-slate-800/50 shadow-xs">TotalKnown: {applicationsTotal || 'null'}</div>
              </div>
              <p className="mt-3 text-[10px] text-yellow-700 dark:text-yellow-400 italic">
                Hover this area to reveal debug stats. Hidden by default to reduce UI noise.
              </p>
            </div>
          </div>
        </div>

        <div className="relative">
          <BasicApplicationsTable
            applications={applications}
            visibleColumns={visibleColumns}
            selectedRows={selectedRows}
            isLoading={loading}
            loadingMore={applicationsLoadingMore}
            hasMore={applicationsHasMore || false}
            totalCount={applicationsTotal || undefined}
            onRowSelect={handleRowSelect}
            onRowClick={handleRowClick}
            onLoadMore={handleLoadMore}
          />
          {/* Top gradient fade */}
          <div className="pointer-events-none absolute inset-x-0 -top-1 h-4 bg-gradient-to-b from-slate-50 via-slate-50/60 to-transparent dark:from-slate-900 dark:via-slate-900/60" />
        </div>

      {/* Application Detail Modal */}
        {selectedApplication && (
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title={`${selectedApplication.position} at ${selectedApplication.company?.name}`}
          >
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Position</div>
                  <div className="mt-0.5 font-medium text-slate-800 dark:text-slate-100">{selectedApplication.position}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Company</div>
                  <div className="mt-0.5 font-medium text-slate-800 dark:text-slate-100">{selectedApplication.company?.name}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Applied</div>
                  <div className="mt-0.5 text-slate-700 dark:text-slate-200">{new Date(selectedApplication.dateApplied).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Stage</div>
                  <div className="mt-0.5">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                      {selectedApplication.stage}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Location</div>
                  <div className="mt-0.5 text-slate-700 dark:text-slate-200">{selectedApplication.location || 'Remote'}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Salary</div>
                  <div className="mt-0.5 text-slate-700 dark:text-slate-200">{selectedApplication.salary || 'Not specified'}</div>
                </div>
              </div>
              {selectedApplication.notes && (
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Notes</div>
                  <p className="mt-1 text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {selectedApplication.notes}
                  </p>
                </div>
              )}
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}
