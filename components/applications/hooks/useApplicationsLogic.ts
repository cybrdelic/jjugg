/**
 * Central business logic hook for Applications component
 * Manages all application state, operations, and side effects with performance optimizations
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Application, ApplicationStage, StatusUpdate } from '@/types';
import { useAppData } from '@/contexts/AppDataContext';
import { createErrorHandler, ApplicationsErrorHandler } from '../utils/errorHandler';

// Custom hook for debouncing values to improve performance
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    const isFirstRender = useRef(true);

    useEffect(() => {
        // On first render, set the value immediately to avoid empty state
        if (isFirstRender.current) {
            setDebouncedValue(value);
            isFirstRender.current = false;
            return;
        }

        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

export interface ApplicationsState {
    // UI State
    searchTerm: string;
    viewMode: 'table' | 'kanban';
    sortConfig: { column: keyof Application | 'company.name'; direction: 'asc' | 'desc' };
    selectedApplication: string | null;
    mounted: boolean;
    isDetailModalVisible: boolean;
    selectedRows: string[];
    visibleColumns: string[];
    isColumnMenuOpen: boolean;
    statusUpdates: StatusUpdate[];
    visibleApplications: Application[];
    isLoading: boolean;
    hasMore: boolean;
    columnFilters: Record<string, string>;
    contextMenu: { id: string, x: number, y: number } | null;
    isMobileView: boolean;
    isAutosizeEnabled: boolean;
    tableViewDensity: 'compact' | 'comfortable' | 'spacious';
    inlineEditingId: string | null;
    activeStageDropdown: string | null;

    // Filters
    quickFilters: {
        stage: ApplicationStage | 'all',
        dateRange: '7d' | '30d' | '90d' | 'all',
        salary: 'with' | 'without' | 'all'
    };
    showAdvancedFilters: boolean;
}

export interface ApplicationsActions {
    // Search and Filter
    setSearchTerm: (term: string) => void;
    setColumnFilters: (filters: Record<string, string>) => void;
    setQuickFilters: (filters: Partial<ApplicationsState['quickFilters']>) => void;
    setShowAdvancedFilters: (show: boolean) => void;

    // View Management
    setViewMode: (mode: 'table' | 'kanban') => void;
    setSortConfig: (config: ApplicationsState['sortConfig']) => void;
    setVisibleColumns: (columns: string[]) => void;
    setTableViewDensity: (density: ApplicationsState['tableViewDensity']) => void;
    setIsMobileView: (mobile: boolean) => void;
    setIsAutosizeEnabled: (enabled: boolean) => void;

    // Selection and UI
    setSelectedRows: (rows: string[]) => void;
    setSelectedApplication: (id: string | null) => void;
    setIsDetailModalVisible: (visible: boolean) => void;
    setIsColumnMenuOpen: (open: boolean) => void;
    setContextMenu: (menu: ApplicationsState['contextMenu']) => void;
    setActiveStageDropdown: (id: string | null) => void;
    setInlineEditingId: (id: string | null) => void;

    // Status Updates
    addStatusUpdate: (message: string, appId: string | null) => void;

    // Application Operations
    handleCreateApplication: () => Promise<void>;
    handleUpdateApplication: (id: string, updates: Partial<Application>) => Promise<void>;
    handleDeleteApplication: (id: string) => Promise<void>;
    handleBulkDelete: () => Promise<void>;
    handleStageChange: (appId: string, newStage: ApplicationStage) => Promise<void>;
    handleBulkStageChange: (appIds: string[], newStage: ApplicationStage) => Promise<void>;
    handleBulkEdit: (appIds: string[]) => void;
    handleIncrementStage: (appId: string) => Promise<void>;
    handleDecrementStage: (appId: string) => Promise<void>;
    handleToggleShortlist: (appId: string) => Promise<void>;
    handleKanbanDrop: (draggedItemId: string, targetStage: ApplicationStage) => Promise<void>;

    // Modal Management
    handleOpenDetailModal: (appId: string) => void;
    handleCloseDetailModal: () => void;
    handleEditApplication: (appId: string) => void;

    // Event Handlers
    handleRowClick: (appId: string, e: React.MouseEvent) => void;
    handleContextMenu: (appId: string, e: React.MouseEvent) => void;
    handleStageClick: (appId: string, e: React.MouseEvent) => void;

    // Export and Utility
    handleExport: () => Promise<void>;
    loadInitialApplications: () => Promise<void>;
}

export interface ApplicationsHookReturn extends ApplicationsState, ApplicationsActions {
    // Computed Values
    filteredApplications: Application[];
    applicationStats: {
        applications: number;
        stageStats: {
            applied: number;
            screening: number;
            interview: number;
            offer: number;
            rejected: number;
        };
        appliedThisWeek: number;
        appliedThisMonth: number;
        interviews: number;
        interviewsThisWeek: number;
        pendingTasks: number;
        overdueTasks: number;
        shortlisted: number;
        remoteJobs: number;
        withSalary: number;
        responseRate: number;
        successRate: number;
        active: number;
    };
    selectedAppData: Application | null;
    selectedApplications: Application[];
    applicationsByStage: Record<ApplicationStage, Application[]>;
    stagesOrder: ApplicationStage[];

    // Loading States
    loading: boolean;
    error: string | null;

    // Refs
    tableRef: React.RefObject<HTMLDivElement | null>;
    lastRowRef: React.RefObject<HTMLDivElement | null>;
}

const ITEMS_PER_PAGE = 10;
const stagesOrder: ApplicationStage[] = ['applied', 'screening', 'interview', 'offer', 'rejected'];

export function useApplicationsLogic(): ApplicationsHookReturn {
    const {
        applications: applicationsData,
        loading,
        error,
        createApplication,
        updateApplication,
        deleteApplication
    } = useAppData();

    // Initialize error handler
    const [errorHandler] = useState<ApplicationsErrorHandler>(() =>
        createErrorHandler({
            onStatusUpdate: (message: string, appId?: string | null) => {
                addStatusUpdate(message, appId || null);
            },
            enableRetry: true
        })
    );

    // UI State
    const [state, setState] = useState<ApplicationsState>({
        searchTerm: '',
        viewMode: 'table',
        sortConfig: { column: 'dateApplied', direction: 'desc' },
        selectedApplication: null,
        mounted: false,
        isDetailModalVisible: false,
        selectedRows: [],
        visibleColumns: ['company', 'position', 'dateApplied', 'stage', 'tasks', 'location', 'salary', 'bonus'],
        isColumnMenuOpen: false,
        statusUpdates: [],
        visibleApplications: [],
        isLoading: false,
        hasMore: true,
        columnFilters: {},
        contextMenu: null,
        isMobileView: false,
        isAutosizeEnabled: false,
        tableViewDensity: 'comfortable',
        inlineEditingId: null,
        activeStageDropdown: null,
        quickFilters: {
            stage: 'all',
            dateRange: 'all',
            salary: 'all'
        },
        showAdvancedFilters: false,
    });

    // Refs
    const tableRef = useRef<HTMLDivElement>(null);
    const lastRowRef = useRef<HTMLDivElement>(null);

    // Helper function to update state
    const updateState = useCallback(<K extends keyof ApplicationsState>(
        key: K,
        value: ApplicationsState[K]
    ) => {
        setState(prev => ({ ...prev, [key]: value }));
    }, []);

    // Status Updates Management
    const addStatusUpdate = useCallback((message: string, appId: string | null) => {
        const newId = Date.now().toString();
        setState(prev => ({
            ...prev,
            statusUpdates: [...prev.statusUpdates, { id: newId, message, appId }]
        }));

        // Auto-remove after 3 seconds
        setTimeout(() => {
            setState(prev => ({
                ...prev,
                statusUpdates: prev.statusUpdates.filter(update => update.id !== newId)
            }));
        }, 3000);
    }, []);

    // Check if viewport is mobile size
    const checkMobileView = useCallback(() => {
        updateState('isMobileView', window.innerWidth <= 768);
    }, [updateState]);

    // Load initial applications
    const loadInitialApplications = useCallback(async () => {
        try {
            updateState('isLoading', true);
            // Applications are loaded via the context
            const initialApps = applicationsData?.slice(0, ITEMS_PER_PAGE) || [];
            updateState('visibleApplications', initialApps);
            updateState('hasMore', (applicationsData?.length || 0) > ITEMS_PER_PAGE);
        } catch (error) {
            errorHandler.handleError(error, 'load_applications');
        } finally {
            updateState('isLoading', false);
        }
    }, [applicationsData, errorHandler, updateState]);

    // Initialize component
    useEffect(() => {
        updateState('mounted', true);
        loadInitialApplications();
        checkMobileView();

        // Add resize listener for responsive adjustments
        window.addEventListener('resize', checkMobileView);
        return () => window.removeEventListener('resize', checkMobileView);
    }, [loadInitialApplications, checkMobileView, updateState]);

    // Debounce search term and column filters for better performance
    const debouncedSearchTerm = useDebounce(state.searchTerm, 300);
    const debouncedColumnFilters = useDebounce(state.columnFilters, 300);

    // Filtered applications computation with performance optimizations
    const filteredApplications = useMemo(() => {
        if (!applicationsData) return [];

        let filtered = [...applicationsData];

        // Apply search filter (debounced)
        if (debouncedSearchTerm) {
            const search = debouncedSearchTerm.toLowerCase();
            filtered = filtered.filter((app: Application) =>
                app.position.toLowerCase().includes(search) ||
                app.company.name.toLowerCase().includes(search) ||
                app.location.toLowerCase().includes(search) ||
                app.notes.toLowerCase().includes(search)
            );
        }

        // Apply column filters (debounced)
        Object.entries(debouncedColumnFilters).forEach(([column, filterValue]) => {
            if (filterValue) {
                filtered = filtered.filter((app: Application) => {
                    let value: string | undefined;
                    switch (column) {
                        case 'company': value = app.company.name; break;
                        case 'position': value = app.position; break;
                        case 'dateApplied': value = app.dateApplied.toLocaleDateString(); break;
                        case 'stage': value = app.stage.charAt(0).toUpperCase() + app.stage.slice(1); break;
                        case 'location': value = app.location; break;
                    }
                    return value?.toLowerCase().includes(filterValue.toLowerCase());
                });
            }
        });

        // Apply quick filters
        if (state.quickFilters.stage !== 'all') {
            filtered = filtered.filter(app => app.stage === state.quickFilters.stage);
        }

        if (state.quickFilters.dateRange !== 'all') {
            const now = new Date();
            const daysBack = {
                '7d': 7,
                '30d': 30,
                '90d': 90
            }[state.quickFilters.dateRange];

            if (daysBack) {
                const cutoffDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
                filtered = filtered.filter(app => app.dateApplied >= cutoffDate);
            }
        }

        if (state.quickFilters.salary !== 'all') {
            filtered = filtered.filter(app => {
                const hasSalary = app.salary && app.salary.trim() !== '';
                return state.quickFilters.salary === 'with' ? hasSalary : !hasSalary;
            });
        }

        // Apply sorting
        filtered.sort((a, b) => {
            const { column, direction } = state.sortConfig;
            let valueA: any;
            let valueB: any;

            if (column === 'company.name') {
                valueA = a.company.name;
                valueB = b.company.name;
            } else {
                switch (column) {
                    case 'position': valueA = a.position; valueB = b.position; break;
                    case 'dateApplied': valueA = a.dateApplied; valueB = b.dateApplied; break;
                    case 'stage': valueA = a.stage; valueB = b.stage; break;
                    case 'location': valueA = a.location; valueB = b.location; break;
                    case 'salary': valueA = a.salary; valueB = b.salary; break;
                    default: valueA = ''; valueB = '';
                }
            }

            if (valueA instanceof Date && valueB instanceof Date) {
                return direction === 'asc'
                    ? valueA.getTime() - valueB.getTime()
                    : valueB.getTime() - valueA.getTime();
            }

            if (typeof valueA === 'string' && typeof valueB === 'string') {
                return direction === 'asc'
                    ? valueA.localeCompare(valueB)
                    : valueB.localeCompare(valueA);
            }

            return 0;
        });

        return filtered;
    }, [applicationsData, debouncedSearchTerm, debouncedColumnFilters, state.quickFilters, state.sortConfig]);

    // Debug logging for filtered applications
    useEffect(() => {
        console.log('useApplicationsLogic - applicationsData:', applicationsData?.length || 0, applicationsData);
        console.log('useApplicationsLogic - filteredApplications:', filteredApplications.length, filteredApplications);
        console.log('useApplicationsLogic - debouncedSearchTerm:', debouncedSearchTerm);
        console.log('useApplicationsLogic - debouncedColumnFilters:', debouncedColumnFilters);
        console.log('useApplicationsLogic - quickFilters:', state.quickFilters);
    }, [applicationsData, filteredApplications, debouncedSearchTerm, debouncedColumnFilters, state.quickFilters]);

    // Computed values
    const applicationStats = useMemo(() => {
        const apps = applicationsData || [];
        const now = new Date();
        const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        return {
            // Core counts
            applications: apps.length,

            // Stage-based counts
            stageStats: {
                applied: apps.filter(app => app.stage === 'applied').length,
                screening: apps.filter(app => app.stage === 'screening').length,
                interview: apps.filter(app => app.stage === 'interview').length,
                offer: apps.filter(app => app.stage === 'offer').length,
                rejected: apps.filter(app => app.stage === 'rejected').length,
            },

            // Time-based counts
            appliedThisWeek: apps.filter(app => new Date(app.dateApplied) >= thisWeek).length,
            appliedThisMonth: apps.filter(app => new Date(app.dateApplied) >= thisMonth).length,

            // Interview metrics
            interviews: apps.flatMap(app => app.interviews || [])
                .filter(interview => !interview.completed && new Date(interview.date) > now).length,
            interviewsThisWeek: apps.flatMap(app => app.interviews || [])
                .filter(interview => {
                    const interviewDate = new Date(interview.date);
                    return interviewDate >= thisWeek && interviewDate <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                }).length,

            // Task and follow-up metrics
            pendingTasks: apps.flatMap(app => app.tasks || [])
                .filter(task => !task.completed).length,
            overdueTasks: apps.flatMap(app => app.tasks || [])
                .filter(task => !task.completed && new Date(task.dueDate) < now).length,

            // Quality metrics
            shortlisted: apps.filter(app => app.isShortlisted).length,
            remoteJobs: apps.filter(app => app.remote).length,
            withSalary: apps.filter(app => app.salary && app.salary.trim() !== '').length,

            // Response rate calculation
            responseRate: apps.length > 0
                ? Math.round((apps.filter(app => app.stage !== 'applied').length / apps.length) * 100)
                : 0,

            // Success rate (offers vs applications)
            successRate: apps.length > 0
                ? Math.round((apps.filter(app => app.stage === 'offer').length / apps.length) * 100)
                : 0,

            // Active applications (not rejected or offer accepted)
            active: apps.filter(app => !['rejected'].includes(app.stage)).length,
        };
    }, [applicationsData]);

    const selectedAppData = useMemo(() =>
        state.selectedApplication
            ? applicationsData?.find((app: Application) => app.id === state.selectedApplication) || null
            : null,
        [state.selectedApplication, applicationsData]
    );

    const selectedApplications = useMemo(() =>
        state.selectedRows.length > 0
            ? applicationsData?.filter((app: Application) => state.selectedRows.includes(app.id)) || []
            : [],
        [state.selectedRows, applicationsData]
    );

    const applicationsByStage = useMemo(() => {
        const stages: Record<ApplicationStage, Application[]> = {
            applied: [], screening: [], interview: [], offer: [], rejected: []
        };
        filteredApplications.forEach((app: Application) =>
            stages[app.stage as ApplicationStage]?.push(app)
        );
        return stages;
    }, [filteredApplications]);

    // Application Operations
    const handleCreateApplication = useCallback(async () => {
        try {
            const position = prompt('Enter position:');
            const companyName = prompt('Enter company name:');

            if (!position || !companyName) return;

            const newApp = await createApplication({
                position,
                company_id: 1, // Default to first company for now
                stage: 'applied',
                date_applied: new Date().toISOString(),
                notes: `Application for ${position} at ${companyName}`
            });

            addStatusUpdate('Application Added', newApp.id.toString());
        } catch (error) {
            errorHandler.handleError(error, 'create_application');
        }
    }, [createApplication, errorHandler, addStatusUpdate]);

    const handleUpdateApplication = useCallback(async (id: string, updates: Partial<Application>) => {
        try {
            await updateApplication(id, updates);
            addStatusUpdate('Application updated', id);
        } catch (error) {
            errorHandler.handleError(error, 'update_application', id);
        }
    }, [updateApplication, errorHandler, addStatusUpdate]);

    const handleDeleteApplication = useCallback(async (id: string) => {
        try {
            if (!confirm('Are you sure you want to delete this application?')) return;

            await deleteApplication(id);
            addStatusUpdate('Application deleted', id);

            if (state.selectedApplication === id) {
                updateState('isDetailModalVisible', false);
                updateState('selectedApplication', null);
            }
        } catch (error) {
            errorHandler.handleError(error, 'delete_application', id);
        }
    }, [deleteApplication, errorHandler, addStatusUpdate, state.selectedApplication, updateState]);

    const handleBulkDelete = useCallback(async () => {
        if (state.selectedRows.length === 0) return;

        try {
            if (!confirm(`Are you sure you want to delete ${state.selectedRows.length} application(s)?`)) {
                return;
            }

            await Promise.all(state.selectedRows.map(appId => deleteApplication(appId)));
            addStatusUpdate(`Deleted ${state.selectedRows.length} applications`, null);
            updateState('selectedRows', []);

            if (state.selectedRows.includes(state.selectedApplication || '')) {
                updateState('isDetailModalVisible', false);
                updateState('selectedApplication', null);
            }
        } catch (error) {
            errorHandler.handleError(error, 'bulk_delete');
        }
    }, [state.selectedRows, state.selectedApplication, deleteApplication, errorHandler, addStatusUpdate, updateState]);

    const handleStageChange = useCallback(async (appId: string, newStage: ApplicationStage) => {
        try {
            await updateApplication(appId, { stage: newStage });
            addStatusUpdate(`Moved to ${newStage.charAt(0).toUpperCase() + newStage.slice(1)}`, appId);
        } catch (error) {
            errorHandler.handleError(error, 'update_stage', appId);
        }
    }, [updateApplication, errorHandler, addStatusUpdate]);

    const handleBulkStageChange = useCallback(async (appIds: string[], newStage: ApplicationStage) => {
        try {
            await Promise.all(appIds.map(appId => updateApplication(appId, { stage: newStage })));
            addStatusUpdate(`Moved ${appIds.length} applications to ${newStage.charAt(0).toUpperCase() + newStage.slice(1)}`, null);
        } catch (error) {
            errorHandler.handleError(error, 'bulk_stage_change');
        }
    }, [updateApplication, errorHandler, addStatusUpdate]);

    const handleBulkEdit = useCallback((appIds: string[]) => {
        // For now, just show the detail modal for bulk editing
        // In a full implementation, this would open a bulk edit modal
        if (appIds.length === 1) {
            handleOpenDetailModal(appIds[0]);
        } else {
            addStatusUpdate(`Bulk edit for ${appIds.length} applications (feature coming soon)`, null);
        }
    }, [addStatusUpdate]);

    const handleIncrementStage = useCallback(async (appId: string) => {
        const app = applicationsData?.find((a: Application) => a.id === appId);
        if (app && stagesOrder.indexOf(app.stage as ApplicationStage) < stagesOrder.length - 1) {
            const newStage = stagesOrder[stagesOrder.indexOf(app.stage as ApplicationStage) + 1];
            await handleStageChange(appId, newStage);
        }
    }, [applicationsData, handleStageChange]);

    const handleDecrementStage = useCallback(async (appId: string) => {
        const app = applicationsData?.find((a: Application) => a.id === appId);
        if (app && stagesOrder.indexOf(app.stage as ApplicationStage) > 0) {
            const newStage = stagesOrder[stagesOrder.indexOf(app.stage as ApplicationStage) - 1];
            await handleStageChange(appId, newStage);
        }
    }, [applicationsData, handleStageChange]);

    const handleToggleShortlist = useCallback(async (appId: string) => {
        try {
            const app = applicationsData?.find((a: Application) => a.id === appId);
            if (!app) return;

            const newShortlistStatus = !app.isShortlisted;
            await updateApplication(appId, {
                isShortlisted: newShortlistStatus,
                shortlistedAt: newShortlistStatus ? new Date().toISOString() : null
            });

            addStatusUpdate(
                newShortlistStatus ? 'Added to shortlist' : 'Removed from shortlist',
                appId
            );
        } catch (error) {
            errorHandler.handleError(error, 'toggle_shortlist', appId);
        }
    }, [applicationsData, updateApplication, errorHandler, addStatusUpdate]);

    const handleKanbanDrop = useCallback(async (draggedItemId: string, targetStage: ApplicationStage) => {
        try {
            const draggedApp = applicationsData?.find((app: Application) => app.id === draggedItemId);
            if (!draggedApp) return;

            if (draggedApp.stage !== targetStage) {
                await updateApplication(draggedItemId, { stage: targetStage });
                addStatusUpdate(`Moved to ${targetStage.charAt(0).toUpperCase() + targetStage.slice(1)}`, draggedItemId);
            }
        } catch (error) {
            errorHandler.handleError(error, 'update_stage', draggedItemId);
        }
    }, [applicationsData, updateApplication, errorHandler, addStatusUpdate]);

    // Modal Management
    const handleOpenDetailModal = useCallback((appId: string) => {
        updateState('selectedApplication', appId);
        updateState('isDetailModalVisible', true);
    }, [updateState]);

    const handleCloseDetailModal = useCallback(() => {
        updateState('isDetailModalVisible', false);
        updateState('selectedApplication', null);
    }, [updateState]);

    const handleEditApplication = useCallback((appId: string) => {
        // TODO: Implement edit modal
        console.log('Edit application:', appId);
    }, []);

    // Event Handlers
    const handleRowClick = useCallback((appId: string, e: React.MouseEvent) => {
        const target = e.target as HTMLElement;

        // Don't open modal if clicking on interactive elements
        if (target.closest('.stage-container') ||
            target.closest('.stage-dropdown') ||
            (target instanceof HTMLInputElement && target.type === 'checkbox')) {
            return;
        }

        handleOpenDetailModal(appId);
    }, [handleOpenDetailModal]);

    const handleContextMenu = useCallback((appId: string, e: React.MouseEvent) => {
        e.preventDefault();
        updateState('contextMenu', {
            id: appId,
            x: e.clientX,
            y: e.clientY
        });
    }, [updateState]);

    const handleStageClick = useCallback((appId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        updateState('activeStageDropdown', state.activeStageDropdown === appId ? null : appId);
    }, [state.activeStageDropdown, updateState]);

    // Export functionality
    const handleExport = useCallback(async () => {
        try {
            if (!applicationsData?.length) {
                addStatusUpdate('No applications to export', null);
                return;
            }

            const csvData = applicationsData.map((app: Application) => ({
                Position: app.position,
                Company: app.company.name,
                'Date Applied': app.dateApplied.toLocaleDateString(),
                Stage: app.stage,
                Location: app.location,
                Salary: app.salary || '',
                Remote: app.remote ? 'Yes' : 'No',
                Notes: app.notes
            }));

            const csvString = [
                Object.keys(csvData[0]).join(','),
                ...csvData.map(row => Object.values(row).map(val =>
                    typeof val === 'string' && val.includes(',') ? `"${val}"` : val
                ).join(','))
            ].join('\n');

            const blob = new Blob([csvString], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `applications_${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
            window.URL.revokeObjectURL(url);

            addStatusUpdate('Applications exported successfully', null);
        } catch (error) {
            errorHandler.handleError(error, 'export_applications');
        }
    }, [applicationsData, errorHandler, addStatusUpdate]);

    // Simple setters
    const setSearchTerm = useCallback((term: string) => updateState('searchTerm', term), [updateState]);
    const setViewMode = useCallback((mode: 'table' | 'kanban') => updateState('viewMode', mode), [updateState]);
    const setSortConfig = useCallback((config: ApplicationsState['sortConfig']) => updateState('sortConfig', config), [updateState]);
    const setVisibleColumns = useCallback((columns: string[]) => updateState('visibleColumns', columns), [updateState]);
    const setSelectedRows = useCallback((rows: string[]) => updateState('selectedRows', rows), [updateState]);
    const setIsDetailModalVisible = useCallback((visible: boolean) => updateState('isDetailModalVisible', visible), [updateState]);
    const setSelectedApplication = useCallback((id: string | null) => updateState('selectedApplication', id), [updateState]);
    const setIsColumnMenuOpen = useCallback((open: boolean) => updateState('isColumnMenuOpen', open), [updateState]);
    const setContextMenu = useCallback((menu: ApplicationsState['contextMenu']) => updateState('contextMenu', menu), [updateState]);
    const setActiveStageDropdown = useCallback((id: string | null) => updateState('activeStageDropdown', id), [updateState]);
    const setInlineEditingId = useCallback((id: string | null) => updateState('inlineEditingId', id), [updateState]);
    const setColumnFilters = useCallback((filters: Record<string, string>) => updateState('columnFilters', filters), [updateState]);
    const setQuickFilters = useCallback((filters: Partial<ApplicationsState['quickFilters']>) => {
        updateState('quickFilters', { ...state.quickFilters, ...filters });
    }, [updateState, state.quickFilters]);
    const setShowAdvancedFilters = useCallback((show: boolean) => updateState('showAdvancedFilters', show), [updateState]);
    const setTableViewDensity = useCallback((density: ApplicationsState['tableViewDensity']) => updateState('tableViewDensity', density), [updateState]);
    const setIsMobileView = useCallback((mobile: boolean) => updateState('isMobileView', mobile), [updateState]);
    const setIsAutosizeEnabled = useCallback((enabled: boolean) => updateState('isAutosizeEnabled', enabled), [updateState]);

    return {
        // State
        ...state,

        // Computed Values
        filteredApplications,
        applicationStats,
        selectedAppData,
        selectedApplications,
        applicationsByStage,
        stagesOrder,

        // Loading States
        loading,
        error,

        // Refs
        tableRef,
        lastRowRef,

        // Actions
        setSearchTerm,
        setColumnFilters,
        setQuickFilters,
        setShowAdvancedFilters,
        setViewMode,
        setSortConfig,
        setVisibleColumns,
        setTableViewDensity,
        setIsMobileView,
        setIsAutosizeEnabled,
        setSelectedRows,
        setSelectedApplication,
        setIsDetailModalVisible,
        setIsColumnMenuOpen,
        setContextMenu,
        setActiveStageDropdown,
        setInlineEditingId,
        addStatusUpdate,
        handleCreateApplication,
        handleUpdateApplication,
        handleDeleteApplication,
        handleBulkDelete,
        handleStageChange,
        handleBulkStageChange,
        handleBulkEdit,
        handleIncrementStage,
        handleDecrementStage,
        handleToggleShortlist,
        handleKanbanDrop,
        handleOpenDetailModal,
        handleCloseDetailModal,
        handleEditApplication,
        handleRowClick,
        handleContextMenu,
        handleStageClick,
        handleExport,
        loadInitialApplications,
    };
}
