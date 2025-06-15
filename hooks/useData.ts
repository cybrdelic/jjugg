/**
 * React hooks for data management
 * Provides reactive access to persisted data
 */

import { useState, useEffect, useCallback } from 'react';
import {
    applicationService,
    companyService,
    activityService,
    eventService,
    reminderService,
    goalService,
    statsService,
    userService,
    syncData
} from '../lib/dataService';
import type {
    Application,
    Company,
    Activity,
    UpcomingEvent,
    Reminder,
    MonthlyGoal,
    AppStats,
    ApplicationStage
} from '../types';

// Generic hook for data with CRUD operations
function useDataService<T extends { id: string }>(
    service: {
        getAll(): T[];
        getById(id: string): T | null;
        create(item: Omit<T, 'id'>): T;
        update(id: string, updates: Partial<T>): T | null;
        delete(id: string): boolean;
    }
) {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(() => {
        try {
            setLoading(true);
            setError(null);
            const items = service.getAll();
            setData(items);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, [service]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const create = useCallback((item: Omit<T, 'id'>) => {
        try {
            const newItem = service.create(item);
            setData(prev => [...prev, newItem]);
            return newItem;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create item');
            throw err;
        }
    }, [service]);

    const update = useCallback((id: string, updates: Partial<T>) => {
        try {
            const updatedItem = service.update(id, updates);
            if (updatedItem) {
                setData(prev => prev.map(item => item.id === id ? updatedItem : item));
            }
            return updatedItem;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update item');
            throw err;
        }
    }, [service]);

    const remove = useCallback((id: string) => {
        try {
            const success = service.delete(id);
            if (success) {
                setData(prev => prev.filter(item => item.id !== id));
            }
            return success;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete item');
            throw err;
        }
    }, [service]);

    return {
        data,
        loading,
        error,
        refresh,
        create,
        update,
        remove
    };
}

// Specific hooks for each data type
export function useApplications() {
    const baseHook = useDataService(applicationService);

    const getByStage = useCallback((stage: ApplicationStage) => {
        return applicationService.getByStage(stage);
    }, []);

    const updateStage = useCallback((id: string, stage: ApplicationStage) => {
        try {
            const updatedApp = applicationService.updateStage(id, stage);
            if (updatedApp) {
                baseHook.refresh();
            }
            return updatedApp;
        } catch (err) {
            throw err;
        }
    }, [baseHook]);

    const getUpcomingInterviews = useCallback(() => {
        return applicationService.getUpcomingInterviews();
    }, []);

    return {
        ...baseHook,
        getByStage,
        updateStage,
        getUpcomingInterviews
    };
}

export function useCompanies() {
    const baseHook = useDataService(companyService);

    const getByIndustry = useCallback((industry: string) => {
        return companyService.getByIndustry(industry);
    }, []);

    const search = useCallback((query: string) => {
        return companyService.search(query);
    }, []);

    return {
        ...baseHook,
        getByIndustry,
        search
    };
}

export function useActivities() {
    const baseHook = useDataService(activityService);

    const getRecent = useCallback((limit?: number) => {
        return activityService.getRecent(limit);
    }, []);

    const getByType = useCallback((type: string) => {
        return activityService.getByType(type);
    }, []);

    return {
        ...baseHook,
        getRecent,
        getByType
    };
}

export function useEvents() {
    const baseHook = useDataService(eventService);

    const getUpcoming = useCallback((limit?: number) => {
        return eventService.getUpcoming(limit);
    }, []);

    const getToday = useCallback(() => {
        return eventService.getToday();
    }, []);

    const getByType = useCallback((type: string) => {
        return eventService.getByType(type);
    }, []);

    return {
        ...baseHook,
        getUpcoming,
        getToday,
        getByType
    };
}

export function useReminders() {
    const baseHook = useDataService(reminderService);

    const getPending = useCallback(() => {
        return reminderService.getPending();
    }, []);

    const getCompleted = useCallback(() => {
        return reminderService.getCompleted();
    }, []);

    const getUpcoming = useCallback((days: number = 7) => {
        return reminderService.getUpcoming(days);
    }, []);

    const getOverdue = useCallback(() => {
        return reminderService.getOverdue();
    }, []);

    const getDueToday = useCallback(() => {
        return reminderService.getDueToday();
    }, []);

    const getByPriority = useCallback((priority: string) => {
        return reminderService.getByPriority(priority as any);
    }, []);

    const getByApplication = useCallback((applicationId: string) => {
        return reminderService.getByApplication(applicationId);
    }, []);

    const markCompleted = useCallback((id: string) => {
        const updated = reminderService.markCompleted(id);
        if (updated) {
            baseHook.refresh();
        }
        return updated;
    }, [baseHook]);

    const markPending = useCallback((id: string) => {
        const updated = reminderService.markPending(id);
        if (updated) {
            baseHook.refresh();
        }
        return updated;
    }, [baseHook]);

    const updatePriority = useCallback((id: string, priority: string) => {
        const updated = reminderService.updatePriority(id, priority as any);
        if (updated) {
            baseHook.refresh();
        }
        return updated;
    }, [baseHook]);

    return {
        ...baseHook,
        getPending,
        getCompleted,
        getUpcoming,
        getOverdue,
        getDueToday,
        getByPriority,
        getByApplication,
        markCompleted,
        markPending,
        updatePriority
    };
}

export function useGoals() {
    const [goals, setGoals] = useState<MonthlyGoal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(() => {
        try {
            setLoading(true);
            setError(null);
            const data = goalService.getAll();
            setGoals(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const updateGoal = useCallback((id: string, updates: Partial<MonthlyGoal>) => {
        try {
            const updated = goalService.update(id, updates);
            if (updated) {
                setGoals(prev => prev.map(goal => goal.id === id ? updated : goal));
            }
            return updated;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update goal');
            throw err;
        }
    }, []);

    const updateProgress = useCallback((id: string, current: number) => {
        try {
            const updated = goalService.updateProgress(id, current);
            if (updated) {
                setGoals(prev => prev.map(goal => goal.id === id ? updated : goal));
            }
            return updated;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update progress');
            throw err;
        }
    }, []);

    return {
        goals,
        loading,
        error,
        refresh,
        updateGoal,
        updateProgress
    };
}

export function useStats() {
    const [stats, setStats] = useState<AppStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(() => {
        try {
            setLoading(true);
            setError(null);
            const data = statsService.getStats();
            setStats(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return {
        stats,
        loading,
        error,
        refresh
    };
}

export function useUserProfile() {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(() => {
        try {
            setLoading(true);
            setError(null);
            const data = userService.getProfile();
            setProfile(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const updateProfile = useCallback((updates: any) => {
        try {
            const updated = userService.updateProfile(updates);
            setProfile(updated);
            return updated;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update profile');
            throw err;
        }
    }, []);

    return {
        profile,
        loading,
        error,
        refresh,
        updateProfile
    };
}

// Data synchronization hook
export function useDataSync() {
    const [lastSync, setLastSync] = useState<Date | null>(null);
    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        setLastSync(syncData.lastSync());
    }, []);

    const initialize = useCallback(async () => {
        try {
            setSyncing(true);
            syncData.initialize();
            setLastSync(new Date());
        } catch (err) {
            console.error('Failed to initialize data:', err);
        } finally {
            setSyncing(false);
        }
    }, []);

    const reset = useCallback(async () => {
        try {
            setSyncing(true);
            syncData.reset();
            setLastSync(new Date());
        } catch (err) {
            console.error('Failed to reset data:', err);
        } finally {
            setSyncing(false);
        }
    }, []);

    return {
        lastSync,
        syncing,
        initialize,
        reset
    };
}

// Combined hook that refreshes all data
export function useAppData() {
    const applications = useApplications();
    const companies = useCompanies();
    const activities = useActivities();
    const events = useEvents();
    const reminders = useReminders();
    const goals = useGoals();
    const stats = useStats();
    const profile = useUserProfile();

    const refreshAll = useCallback(() => {
        applications.refresh();
        companies.refresh();
        activities.refresh();
        events.refresh();
        reminders.refresh();
        goals.refresh();
        stats.refresh();
        profile.refresh();
    }, [applications, companies, activities, events, reminders, goals, stats, profile]);

    const loading = applications.loading || companies.loading || activities.loading ||
        events.loading || reminders.loading || goals.loading || stats.loading || profile.loading;

    const error = applications.error || companies.error || activities.error ||
        events.error || reminders.error || goals.error || stats.error || profile.error;

    return {
        applications,
        companies,
        activities,
        events,
        reminders,
        goals,
        stats,
        profile,
        loading,
        error,
        refreshAll
    };
}
