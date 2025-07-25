import React, { createContext, useContext, ReactNode } from 'react';
import { useDbData } from '@/hooks/useDatabaseData';

interface AppData {
    applications: any[];
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

const AppDataContext = createContext<AppData | undefined>(undefined);

export function AppDataProvider({ children }: { children: ReactNode }) {
    const {
        applications,
        activities,
        upcomingEvents,
        appStats,
        userProfile,
        loading,
        error,
        createApplication,
        updateApplication,
        deleteApplication
    } = useDbData();

    return (
        <AppDataContext.Provider value={{
            applications,
            activities,
            upcomingEvents,
            appStats,
            userProfile,
            loading,
            error,
            createApplication,
            updateApplication,
            deleteApplication
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
