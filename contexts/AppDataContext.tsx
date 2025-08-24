import { useDbData } from '@/hooks/useDatabaseData';
import { usePaginatedApplications } from '@/hooks/usePaginatedApplications';
import { createContext, ReactNode, useContext } from 'react';

interface AppData {
    applications: any[];
    paginatedApplications?: any[];
    applicationsTotal?: number | null;
    applicationsHasMore?: boolean;
    applicationsLoadingMore?: boolean;
    loadMoreApplications?: () => Promise<void>;
    prefetchNextApplications?: () => Promise<void>;
    applicationsPrefetching?: boolean;
    activities: any[];
    upcomingEvents: any[];
    appStats: any;
    userProfile: any;
    loading: boolean;
    error: string | null;
    createApplication: (data: any) => Promise<any>;
    updateApplication: (id: string, data: any) => Promise<any>;
    deleteApplication: (id: string) => Promise<void>;
}

export const AppDataContext = createContext<AppData | undefined>(undefined);

export function AppDataProvider({ children }: { children: ReactNode }) {
    const db = useDbData();
    const {
        items: paginatedApplications,
        total: applicationsTotal,
        hasMore: applicationsHasMore,
        loadMore: loadMoreApplications,
        loadingInitial: applicationsLoadingInitial,
    loadingMore: applicationsLoadingMore,
    prefetchNext,
    prefetching
    } = usePaginatedApplications({ userId: 1, pageSize: 50 });

    // Debug logging
    console.log(`[AppDataContext] db.applications: ${db.applications?.length || 0}, paginatedApplications: ${paginatedApplications?.length || 0}`);

    // Preserve existing full list consumers (temporary: could be deprecated)
    const applications = paginatedApplications;
    const loading = db.loading || applicationsLoadingInitial;
    const error = db.error;

    return (
        <AppDataContext.Provider value={{
            applications,
            paginatedApplications,
            applicationsTotal,
            applicationsHasMore,
            applicationsLoadingMore,
            loadMoreApplications,
            prefetchNextApplications: prefetchNext,
            applicationsPrefetching: prefetching,
            activities: db.activities,
            upcomingEvents: db.upcomingEvents,
            appStats: db.appStats,
            userProfile: db.userProfile,
            loading,
            error,
            createApplication: db.createApplication,
            updateApplication: db.updateApplication,
            deleteApplication: db.deleteApplication
        }}>
            {children}
        </AppDataContext.Provider>
    );
}

export function useAppData() {
    const context = useContext(AppDataContext);
    if (context === undefined) {
        throw new Error('useAppData must be used within an AppDataProvider');
    }
    return context;
}
