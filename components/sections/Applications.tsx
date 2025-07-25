'use client';
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  PlusCircle, Grid3x3, ListFilter, SlidersHorizontal, Download, X, Clock,
  ArrowUp, ArrowDown, Calendar, User, Briefcase, CheckSquare, Users,
  Edit2, Trash2, ChevronRight, Plus, Minus, Search, Loader2, ArrowLeft, ArrowRight,
  Smartphone, Monitor, Maximize2, Minimize2
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import CardHeader from '../CardHeader';
import ApplicationCard from '../applications/ApplicationCard';
import KanbanColumn from '../applications/KanbanColumn';
import ActionButton from '../dashboard/ActionButton';
import Tooltip from '../Tooltip';
import Portal from '../Portal';
import ApplicationDetailDrawer from '../applications/ApplicationDetailDrawer';
import { Application, ApplicationStage, InterviewEvent, StatusUpdate } from '@/types';
import { useAppData } from '../../contexts/AppDataContext';
import EnhancedSearch from '../EnhancedSearch';

// Helper Functions
const formatDate = (date: Date): string =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);

const getNextInterview = (interviews?: InterviewEvent[]): InterviewEvent | null => {
  if (!interviews) return null;
  const upcoming = interviews
    .filter(i => !i.completed && i.date > new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime());
  return upcoming[0] || null;
};

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

const getEventTypeColor = (type: string): string => {
  switch (type.toLowerCase()) {
    case 'phone': return 'var(--accent-blue)';
    case 'video': return 'var(--accent-purple)';
    case 'onsite': return 'var(--accent-green)';
    case 'technical': return 'var(--accent-yellow)';
    case 'final': return 'var(--accent-red)';
    case 'screening': return 'var(--accent-purple)';
    case 'interview':
    default: return 'var(--accent-blue)';
  }
};

const getStageLabel = (stage: ApplicationStage): string =>
  stage.charAt(0).toUpperCase() + stage.slice(1);

const calculateStageProgress = (stage: ApplicationStage): number => {
  const stages: ApplicationStage[] = ['applied', 'screening', 'interview', 'offer', 'rejected'];
  return Math.min(((stages.indexOf(stage) + 1) / stages.length) * 100, 100);
};

// Type Guard Function
const isInputElement = (element: EventTarget | null): element is HTMLInputElement => {
  return element instanceof HTMLInputElement;
};

export default function Applications() {
  const { currentTheme } = useTheme();
  const {
    applications: applicationsData,
    loading,
    error,
    createApplication,
    updateApplication,
    deleteApplication
  } = useAppData();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [sortConfig, setSortConfig] = useState<{ column: keyof Application | 'company.name'; direction: 'asc' | 'desc' }>(
    { column: 'dateApplied', direction: 'desc' }
  );
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null);
  const [mounted, setMounted] = useState<boolean>(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState<boolean>(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'company', 'position', 'dateApplied', 'stage', 'tasks', 'location', 'salary', 'bonus'
  ]);
  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState<boolean>(false);
  const [statusUpdates, setStatusUpdates] = useState<StatusUpdate[]>([]);
  const [visibleApplications, setVisibleApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [contextMenu, setContextMenu] = useState<{ id: string, x: number, y: number } | null>(null);
  const [isMobileView, setIsMobileView] = useState<boolean>(false);
  const [isAutosizeEnabled, setIsAutosizeEnabled] = useState<boolean>(false);
  const [tableViewDensity, setTableViewDensity] = useState<'compact' | 'comfortable' | 'spacious'>('comfortable');
  const [inlineEditingId, setInlineEditingId] = useState<string | null>(null);
  const [quickFilters, setQuickFilters] = useState<{
    stage: ApplicationStage | 'all',
    dateRange: '7d' | '30d' | '90d' | 'all',
    salary: 'with' | 'without' | 'all'
  }>({
    stage: 'all',
    dateRange: 'all',
    salary: 'all'
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);
  const tableRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const ITEMS_PER_PAGE = 10;

  // Check if viewport is mobile size
  const checkMobileView = () => {
    setIsMobileView(window.innerWidth <= 768);
  };

  useEffect(() => {
    console.log('Applications component mounted');
    setMounted(true);
    loadInitialApplications();
    checkMobileView();

    // Add resize listener for responsive adjustments
    window.addEventListener('resize', checkMobileView);
    return () => window.removeEventListener('resize', checkMobileView);
  }, []);

  const filteredApplications = useMemo(() => {
    if (!applicationsData) return [];
    let filtered = [...applicationsData];
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter((app: Application) =>
        app.position.toLowerCase().includes(search) ||
        app.company.name.toLowerCase().includes(search) ||
        app.location.toLowerCase().includes(search) ||
        app.notes.toLowerCase().includes(search)
      );
    }
    Object.entries(columnFilters).forEach(([column, filterValue]) => {
      if (filterValue) {
        filtered = filtered.filter((app: Application) => {
          let value: string | undefined;
          switch (column) {
            case 'company': value = app.company.name; break;
            case 'position': value = app.position; break;
            case 'dateApplied': value = formatDate(app.dateApplied); break;
            case 'stage': value = getStageLabel(app.stage); break;
            case 'location': value = app.location; break;
          }
          return value?.toLowerCase().includes(filterValue.toLowerCase());
        });
      }
    });
    filtered.sort((a, b) => {
      const { column, direction } = sortConfig;
      let valueA: any;
      let valueB: any;

      if (column === 'company.name') {
        valueA = a.company.name;
        valueB = b.company.name;
      } else {
        // Safe property access for known properties
        switch (column) {
          case 'position':
            valueA = a.position;
            valueB = b.position;
            break;
          case 'dateApplied':
            valueA = a.dateApplied;
            valueB = b.dateApplied;
            break;
          case 'stage':
            valueA = a.stage;
            valueB = b.stage;
            break;
          case 'location':
            valueA = a.location;
            valueB = b.location;
            break;
          case 'salary':
            valueA = a.salary;
            valueB = b.salary;
            break;
          default:
            valueA = '';
            valueB = '';
        }
      }

      if (valueA instanceof Date && valueB instanceof Date) {
        return direction === 'asc' ? valueA.getTime() - valueB.getTime() : valueB.getTime() - valueA.getTime();
      }
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return direction === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
      }
      return 0;
    });
    return filtered;
  }, [applicationsData, searchTerm, columnFilters, sortConfig]);

  const loadInitialApplications = () => {
    setVisibleApplications(filteredApplications.slice(0, ITEMS_PER_PAGE));
    setHasMore(filteredApplications.length > ITEMS_PER_PAGE);
  };

  const loadMoreApplications = useCallback(() => {
    if (!hasMore || isLoading) return;
    setIsLoading(true);
    setTimeout(() => {
      const nextBatch = filteredApplications.slice(visibleApplications.length, visibleApplications.length + ITEMS_PER_PAGE);
      setVisibleApplications(prev => [...prev, ...nextBatch]);
      setHasMore(filteredApplications.length > visibleApplications.length + nextBatch.length);
      setIsLoading(false);
    }, 500);
  }, [visibleApplications, filteredApplications, hasMore, isLoading]);

  const lastRowRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading || !node) return;
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) loadMoreApplications();
    }, { threshold: 1.0 });
    observerRef.current.observe(node);
  }, [isLoading, hasMore, loadMoreApplications]);

  useEffect(() => {
    loadInitialApplications();
  }, [filteredApplications]);

  const addStatusUpdate = (message: string, appId: string | null) => {
    const newId = `${appId || 'global'}-${Date.now()}`;
    setStatusUpdates(prev => {
      const isDuplicate = prev.some(update => update.message === message && update.appId === appId);
      if (isDuplicate) return prev;
      return [...prev, { id: newId, message, appId }];
    });
    setTimeout(() => setStatusUpdates(prev => prev.filter(update => update.id !== newId)), 3000);
  };

  const applicationStats = useMemo(() => ({
    applications: applicationsData?.length || 0,
    interviews: applicationsData?.flatMap((app: Application) => app.interviews || []).filter((i: any) => !i.completed && i.date > new Date()).length || 0,
  }), [applicationsData]);

  const selectedAppData = useMemo(() =>
    selectedApplication ? applicationsData?.find((app: Application) => app.id === selectedApplication) || null : null,
    [selectedApplication, applicationsData]
  );

  const applicationsByStage = useMemo(() => {
    const stages: Record<ApplicationStage, Application[]> = {
      applied: [], screening: [], interview: [], offer: [], rejected: []
    };
    filteredApplications.forEach((app: Application) => stages[app.stage as ApplicationStage]?.push(app));
    return stages;
  }, [filteredApplications]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value);
  const toggleViewMode = () => setViewMode(prev => prev === 'table' ? 'kanban' : 'table');
  const stagesOrder: ApplicationStage[] = ['applied', 'screening', 'interview', 'offer', 'rejected'];

  const handleStageChange = async (appId: string, newStage: ApplicationStage) => {
    try {
      await updateApplication(appId, { stage: newStage });
      addStatusUpdate(`Moved to ${getStageLabel(newStage)}`, appId);
    } catch (error) {
      console.error('Failed to update stage:', error);
      addStatusUpdate(`Failed to update stage`, appId);
    }
  };

  const handleIncrementStage = async (appId: string) => {
    const app = applicationsData?.find((a: Application) => a.id === appId);
    if (app && stagesOrder.indexOf(app.stage as ApplicationStage) < stagesOrder.length - 1) {
      const newStage = stagesOrder[stagesOrder.indexOf(app.stage as ApplicationStage) + 1];
      try {
        await updateApplication(appId, { stage: newStage });
        addStatusUpdate(`Progressed to ${getStageLabel(newStage)}`, appId);
      } catch (error) {
        console.error('Failed to increment stage:', error);
        addStatusUpdate(`Failed to update stage`, appId);
      }
    }
  };

  const handleDecrementStage = async (appId: string) => {
    const app = applicationsData?.find((a: Application) => a.id === appId);
    if (app && stagesOrder.indexOf(app.stage as ApplicationStage) > 0) {
      const newStage = stagesOrder[stagesOrder.indexOf(app.stage as ApplicationStage) - 1];
      try {
        await updateApplication(appId, { stage: newStage });
        addStatusUpdate(`Reverted to ${getStageLabel(newStage)}`, appId);
      } catch (error) {
        console.error('Failed to decrement stage:', error);
        addStatusUpdate(`Failed to update stage`, appId);
      }
    }
  };

  // Handle kanban drag and drop
  const handleKanbanDrop = async (draggedItemId: string, targetStage: ApplicationStage) => {
    try {
      const draggedApp = applicationsData?.find((app: Application) => app.id === draggedItemId);
      if (!draggedApp) return;

      if (draggedApp.stage !== targetStage) {
        await updateApplication(draggedItemId, { stage: targetStage });
        addStatusUpdate(`Moved to ${getStageLabel(targetStage)}`, draggedItemId);
      }
    } catch (error) {
      console.error('Failed to update stage via drag and drop:', error);
      addStatusUpdate('Failed to update stage', draggedItemId);
    }
  };

  const handleToggleShortlist = async (appId: string) => {
    try {
      const app = applicationsData?.find((a: Application) => a.id === appId);
      if (!app) return;

      const newShortlistStatus = !app.isShortlisted;

      // Update via the database hook
      await updateApplication(appId, {
        isShortlisted: newShortlistStatus,
        shortlistedAt: newShortlistStatus ? new Date().toISOString() : null
      });

      addStatusUpdate(
        newShortlistStatus ? 'Added to shortlist' : 'Removed from shortlist',
        appId
      );
    } catch (error) {
      console.error('Error toggling shortlist:', error);
      addStatusUpdate('Failed to update shortlist status', appId);
    }
  };

  const handleEditApplication = (appId: string) => {
    setSelectedApplication(appId);
    console.log(`Edit application ${appId}`);
  };

  const handleDeleteApplication = async (appId: string) => {
    if (confirm('Are you sure you want to delete this application?')) {
      try {
        await deleteApplication(appId);
        addStatusUpdate('Application Deleted', appId);
        if (selectedApplication === appId) setIsDetailModalVisible(false);
        setSelectedRows(prev => prev.filter(id => id !== appId));
      } catch (error) {
        console.error('Failed to delete application:', error);
        addStatusUpdate('Failed to delete application', appId);
      }
    }
  };

  const handleAddApplication = async () => {
    // For now, create a simple application with default values
    // TODO: Replace with proper modal form
    const position = prompt('Enter position title:');
    const companyName = prompt('Enter company name:');

    if (!position || !companyName) return;

    try {
      // First check if company exists, if not create it
      const newApp = await createApplication({
        position,
        company_id: 1, // Default to first company for now - TODO: proper company handling
        stage: 'applied',
        date_applied: new Date().toISOString(),
        notes: `Application for ${position} at ${companyName}`
      });

      addStatusUpdate('Application Added', newApp.id.toString());
    } catch (error) {
      console.error('Failed to create application:', error);
      addStatusUpdate('Failed to add application', null);
    }
  };
  const handleOpenDetailModal = (appId: string) => {
    setSelectedApplication(appId);
    setIsDetailModalVisible(true);
  };
  const handleCloseDetailModal = () => setIsDetailModalVisible(false);
  const handleRowSelect = (appId: string) =>
    setSelectedRows(prev => prev.includes(appId) ? prev.filter(id => id !== appId) : [...prev, appId]);
  const handleRowClick = (appId: string, e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (
      target.closest('.row-actions-menu') ||
      (isInputElement(e.target) && e.target.type === 'checkbox')
    ) {
      return;
    }
    handleOpenDetailModal(appId);
  };

  const handleContextMenu = (appId: string, e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({
      id: appId,
      x: e.clientX,
      y: e.clientY
    });
  };

  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu) setContextMenu(null);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (contextMenu) {
        if (e.key === 'Escape') {
          setContextMenu(null);
        } else if (e.key === 'Tab') {
          // Prevent focus from leaving the menu
          e.preventDefault();
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [contextMenu]);
  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedRows.length} application(s)?`)) {
      try {
        await Promise.all(selectedRows.map(appId => deleteApplication(appId)));
        addStatusUpdate(`Deleted ${selectedRows.length} applications`, null);
        setSelectedRows([]);
        if (selectedRows.includes(selectedApplication || '')) setIsDetailModalVisible(false);
      } catch (error) {
        console.error('Failed to delete applications:', error);
        addStatusUpdate('Failed to delete some applications', null);
      }
    }
  };
  const handleExport = () => {
    const csv = filteredApplications.map(app => ({
      Company: app.company.name,
      Position: app.position,
      'Date Applied': formatDate(app.dateApplied),
      Stage: getStageLabel(app.stage),
      Salary: app.salary,
      'Next Interview': getNextInterview(app.interviews)?.date ? formatDate(getNextInterview(app.interviews)!.date) : 'N/A',
      Tasks: (app.tasks || []).length,
      Contacts: (app.contacts || []).length,
      Location: app.location,
      Remote: app.remote ? 'Yes' : 'No'
    }));
    const csvContent = "data:text/csv;charset=utf-8," +
      [Object.keys(csv[0]).join(','), ...csv.map(row => Object.values(row).join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `applications_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const toggleColumnVisibility = (column: string) =>
    setVisibleColumns(prev => prev.includes(column) ? prev.filter(c => c !== column) : [...prev, column]);
  const hasGlobalUpdate = statusUpdates.some(update => !update.appId);

  return (
    <section className={`applications-home ${mounted ? 'mounted' : ''}`}>
      <CardHeader
        title={
          <div className="header-title-wrapper">
            <span className={hasGlobalUpdate ? 'pulsing' : ''}>Applications</span>
            <span className="stats">
              ({applicationStats.applications} Applied, {applicationStats.interviews} Upcoming)
            </span>
            {statusUpdates.filter(update => !update.appId).map(update => (
              <span key={update.id} className="global-status-text" role="status">
                {update.message}
                <div className="button-shine"></div>
              </span>
            ))}
          </div>
        }
        subtitle="Effortlessly track and manage your job applications"
        accentColor="var(--accent-blue)"
        variant="default"
      >
        <div className="header-actions">
          <EnhancedSearch
            applications={applicationsData || []}
            onSearch={setSearchTerm}
            placeholder="Search applications, companies, positions..."
            className="search-bar"
          />
          {selectedRows.length > 0 && (
            <ActionButton
              label={`Delete ${selectedRows.length}`}
              icon={Trash2}
              variant="danger"
              onClick={handleBulkDelete}
            />
          )}
          <ActionButton
            label="New Application"
            icon={PlusCircle}
            variant="primary"
            onClick={handleAddApplication}
          />
          <ActionButton
            label="Export CSV"
            icon={Download}
            variant="ghost"
            onClick={handleExport}
          />
        </div>
      </CardHeader>

      <div className="dashboard-content">
        <div className="table-container">
          <div className="dashboard-controls">
            <div className="view-toggle">
              <Tooltip content="List View" placement="bottom">
                <button
                  className={`control-btn ${viewMode === 'table' ? 'active' : ''}`}
                  onClick={() => setViewMode('table')}
                >
                  <ListFilter size={14} />
                </button>
              </Tooltip>
              <Tooltip content="Kanban View" placement="bottom">
                <button
                  className={`control-btn ${viewMode === 'kanban' ? 'active' : ''}`}
                  onClick={() => setViewMode('kanban')}
                >
                  <Grid3x3 size={14} />
                </button>
              </Tooltip>
              <Tooltip content={isMobileView ? "Switch to Desktop View" : "Switch to Mobile View"} placement="bottom">
                <button
                  className={`control-btn responsive-toggle ${isMobileView ? 'active' : ''}`}
                  onClick={() => setIsMobileView(!isMobileView)}
                >
                  {isMobileView ? <Monitor size={14} /> : <Smartphone size={14} />}
                </button>
              </Tooltip>
              <Tooltip content={isAutosizeEnabled ? "Switch to Fixed Columns" : "Switch to Auto Column Widths"} placement="bottom">
                <button
                  className={`control-btn autosize-toggle ${isAutosizeEnabled ? 'active' : ''}`}
                  onClick={() => setIsAutosizeEnabled(!isAutosizeEnabled)}
                >
                  {isAutosizeEnabled ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                </button>
              </Tooltip>
            </div>

            {/* Density Controls */}
            <div className="density-controls">
              <Tooltip content="Table Density" placement="bottom">
                <div className="density-selector">
                  <button
                    className={`density-btn ${tableViewDensity === 'compact' ? 'active' : ''}`}
                    onClick={() => setTableViewDensity('compact')}
                    title="Compact"
                  >
                    <Minus size={12} />
                  </button>
                  <button
                    className={`density-btn ${tableViewDensity === 'comfortable' ? 'active' : ''}`}
                    onClick={() => setTableViewDensity('comfortable')}
                    title="Comfortable"
                  >
                    <Grid3x3 size={12} />
                  </button>
                  <button
                    className={`density-btn ${tableViewDensity === 'spacious' ? 'active' : ''}`}
                    onClick={() => setTableViewDensity('spacious')}
                    title="Spacious"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </Tooltip>
            </div>

            {/* Quick Filters */}
            <div className="quick-filters">
              <select
                value={quickFilters.stage}
                onChange={(e) => setQuickFilters({ ...quickFilters, stage: e.target.value as ApplicationStage | 'all' })}
                className="quick-filter-select"
              >
                <option value="all">All Stages</option>
                <option value="applied">Applied</option>
                <option value="screening">Screening</option>
                <option value="interview">Interview</option>
                <option value="offer">Offer</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                value={quickFilters.dateRange}
                onChange={(e) => setQuickFilters({ ...quickFilters, dateRange: e.target.value as '7d' | '30d' | '90d' | 'all' })}
                className="quick-filter-select"
              >
                <option value="all">All Time</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>

              <button
                className={`control-btn ${showAdvancedFilters ? 'active' : ''}`}
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                title="Advanced Filters"
              >
                <SlidersHorizontal size={14} />
              </button>
            </div>

            <div className="control-actions">
              <Tooltip
                content="Customize Columns"
                placement="bottom"
              >
                <button
                  className="control-btn"
                  onClick={() => setIsColumnMenuOpen(!isColumnMenuOpen)}
                >
                  <SlidersHorizontal size={14} />
                </button>
              </Tooltip>
              {isColumnMenuOpen && (
                <div className="column-menu">
                  {['company', 'position', 'dateApplied', 'stage', 'tasks', 'location', 'salary', 'bonus'].map(col => (
                    <label key={col} className="column-item">
                      <input
                        type="checkbox"
                        checked={visibleColumns.includes(col)}
                        onChange={() => toggleColumnVisibility(col)}
                      />
                      {col.charAt(0).toUpperCase() + col.slice(1).replace(/([A-Z])/g, ' $1')}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {viewMode === 'kanban' ? (
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
                  onDrop={(draggedItemId) => handleKanbanDrop(draggedItemId, stage as ApplicationStage)}
                >
                  {applicationsByStage[stage].map(app => (
                    <div key={app.id} className="application-wrapper">
                      <div className="status-updates">
                        {statusUpdates.filter(update => update.appId === app.id).map(update => (
                          <div key={update.id} className="status-bubble" role="status">{update.message}</div>
                        ))}
                      </div>
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
                        onEdit={() => handleEditApplication(app.id)}
                        onDelete={() => handleDeleteApplication(app.id)}
                        onShortlistToggle={() => handleToggleShortlist(app.id)}
                        onClick={() => handleOpenDetailModal(app.id)}
                      />
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
            </div>
          ) : (
            <div className="dashboard-grid table-grid">
              <div className="dashboard-card table-card" ref={tableRef}>
                <div className="table-wrapper">
                  <div className={`table-header ${isAutosizeEnabled ? 'autosize' : ''}`}>
                    {visibleColumns.includes('company') && (
                      <div className={`header-cell ${sortConfig.column === 'company.name' ? 'sorted' : ''}`}>
                        <span
                          onClick={() => setSortConfig({
                            column: 'company.name',
                            direction: sortConfig.column === 'company.name' && sortConfig.direction === 'asc' ? 'desc' : 'asc'
                          })}
                        >
                          Company {sortConfig.column === 'company.name' &&
                            (sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                        </span>
                        <input
                          type="text"
                          placeholder="Filter"
                          value={columnFilters['company'] || ''}
                          onChange={(e) => setColumnFilters(prev => ({ ...prev, company: e.target.value }))}
                          className="filter-input"
                        />
                      </div>
                    )}
                    {visibleColumns.includes('position') && (
                      <div className={`header-cell ${sortConfig.column === 'position' ? 'sorted' : ''}`}>
                        <span
                          onClick={() => setSortConfig({
                            column: 'position',
                            direction: sortConfig.column === 'position' && sortConfig.direction === 'asc' ? 'desc' : 'asc'
                          })}
                        >
                          Position {sortConfig.column === 'position' &&
                            (sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                        </span>
                        <input
                          type="text"
                          placeholder="Filter"
                          value={columnFilters['position'] || ''}
                          onChange={(e) => setColumnFilters(prev => ({ ...prev, position: e.target.value }))}
                          className="filter-input"
                        />
                      </div>
                    )}
                    {visibleColumns.includes('dateApplied') && (
                      <div className={`header-cell ${sortConfig.column === 'dateApplied' ? 'sorted' : ''}`}>
                        <span
                          onClick={() => setSortConfig({
                            column: 'dateApplied',
                            direction: sortConfig.column === 'dateApplied' && sortConfig.direction === 'asc' ? 'desc' : 'asc'
                          })}
                        >
                          Date Applied {sortConfig.column === 'dateApplied' &&
                            (sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                        </span>
                        <input
                          type="text"
                          placeholder="Filter"
                          value={columnFilters['dateApplied'] || ''}
                          onChange={(e) => setColumnFilters(prev => ({ ...prev, dateApplied: e.target.value }))}
                          className="filter-input"
                        />
                      </div>
                    )}
                    {visibleColumns.includes('stage') && (
                      <div className="header-cell">
                        <span>Stage</span>
                        <input
                          type="text"
                          placeholder="Filter"
                          value={columnFilters['stage'] || ''}
                          onChange={(e) => setColumnFilters(prev => ({ ...prev, stage: e.target.value }))}
                          className="filter-input"
                        />
                      </div>
                    )}
                    {visibleColumns.includes('alert') && (
                      <div className="header-cell"><span>Alerts</span></div>
                    )}
                    {visibleColumns.includes('tasks') && (
                      <div className="header-cell"><span>Tasks</span></div>
                    )}
                    {visibleColumns.includes('location') && (
                      <div className="header-cell">
                        <span>Location</span>
                        <input
                          type="text"
                          placeholder="Filter"
                          value={columnFilters['location'] || ''}
                          onChange={(e) => setColumnFilters(prev => ({ ...prev, location: e.target.value }))}
                          className="filter-input"
                        />
                      </div>
                    )}
                    {visibleColumns.includes('salary') && (
                      <div className="header-cell"><span>Salary</span></div>
                    )}
                    {visibleColumns.includes('bonus') && (
                      <div className="header-cell"><span>Bonus</span></div>
                    )}
                    {visibleColumns.includes('benefits') && (
                      <div className="header-cell"><span>Benefits</span></div>
                    )}
                  </div>
                  <div className="table-body">
                    {visibleApplications.length === 0 ? (
                      <div className="empty-state">
                        <p>No applications match your criteria</p>
                        <button
                          className="action-btn"
                          onClick={() => { setSearchTerm(''); setColumnFilters({}); }}
                        >
                          <X size={14} /><span>Reset Filters</span>
                        </button>
                      </div>
                    ) : (
                      visibleApplications.map((app, index) => (
                        <div
                          key={app.id}
                          ref={index === visibleApplications.length - 1 ? lastRowRef : null}
                          className={`table-row ${selectedRows.includes(app.id) ? 'selected' : ''} ${mounted ? 'animate-in' : ''} ${isMobileView ? 'mobile-view' : ''} ${isAutosizeEnabled ? 'autosize' : ''} density-${tableViewDensity} ${inlineEditingId === app.id ? 'editing' : ''}`}
                          style={{ animationDelay: `${index * 0.05}s` }}
                          onClick={(e) => handleRowClick(app.id, e)}
                          onContextMenu={(e) => handleContextMenu(app.id, e)}
                        >
                          <div className="status-updates">
                            {statusUpdates.filter(update => update.appId === app.id).map(update => (
                              <div key={update.id} className="status-bubble" role="status">{update.message}</div>
                            ))}
                          </div>
                          {visibleColumns.includes('company') && (
                            <div className="cell" data-label="Company">
                              <div className="checkbox-wrapper" onClick={e => e.stopPropagation()}>
                                <input
                                  type="checkbox"
                                  id={`checkbox-${app.id}`}
                                  checked={selectedRows.includes(app.id)}
                                  onChange={() => handleRowSelect(app.id)}
                                  onClick={e => e.stopPropagation()}
                                  className="custom-checkbox"
                                />
                                <label
                                  htmlFor={`checkbox-${app.id}`}
                                  className="checkbox-label"
                                  onClick={e => e.stopPropagation()}
                                ></label>
                              </div>
                              <div className="company-cell">
                                {app.company.logo ? (
                                  <img
                                    src={app.company.logo}
                                    alt={app.company.name}
                                    className="company-logo"
                                  />
                                ) : (
                                  <div
                                    className="company-logo-placeholder"
                                    style={{
                                      backgroundColor: `hsl(${app.company.name.charCodeAt(0) * 5}, 70%, 60%)`
                                    }}
                                  >
                                    {app.company.name.charAt(0).toUpperCase()}
                                  </div>
                                )}
                                <Tooltip
                                  content={
                                    <div className="company-tooltip">
                                      <h4>{app.company.name}</h4>
                                      {app.company.industry && <p>Industry: {app.company.industry}</p>}
                                      {app.company.website && <p>Website: {app.company.website}</p>}
                                    </div>
                                  }
                                  placement="bottom"
                                >
                                  <span className="cell-value company-name">{app.company.name}</span>
                                </Tooltip>
                              </div>
                            </div>
                          )}
                          {visibleColumns.includes('position') && (
                            <div className="cell" data-label="Position">
                              <div className="position-cell">
                                <Tooltip
                                  content={
                                    <div className="position-tooltip">
                                      <h4>{app.position}</h4>
                                      <p>{app.jobDescription}</p>
                                    </div>
                                  }
                                  placement="bottom"
                                >
                                  <span className="cell-value position-title">{app.position}</span>
                                </Tooltip>
                                <div className="position-description">
                                  {app.jobDescription.substring(0, 80)}
                                  {app.jobDescription.length > 80 && '...'}
                                </div>
                              </div>
                            </div>
                          )}
                          {visibleColumns.includes('dateApplied') && (
                            <div className="cell" data-label="Date Applied">
                              <Calendar size={14} className="cell-icon" />
                              <span className="cell-value">{formatDate(app.dateApplied)}</span>
                            </div>
                          )}
                          {visibleColumns.includes('stage') && (
                            <div className="cell" data-label="Stage">
                              <div className="stage-container">
                                <Tooltip
                                  content={`Current application stage: ${getStageLabel(app.stage)}`}
                                  placement="top"
                                >
                                  <div
                                    className={`stage-badge stage-${app.stage}`}
                                    style={{ borderColor: getStageColor(app.stage) }}
                                  >
                                    <div
                                      className="stage-indicator"
                                      style={{ backgroundColor: getStageColor(app.stage) }}
                                    ></div>
                                    <span className="stage-label">{getStageLabel(app.stage)}</span>
                                  </div>
                                </Tooltip>
                                <div className="stage-progress-container">
                                  <div className="stage-progress-background">
                                    {stagesOrder.map((stage, idx) => (
                                      <div
                                        key={stage}
                                        className={`stage-step ${stagesOrder.indexOf(app.stage) >= idx ? 'completed' : ''}`}
                                        style={{ backgroundColor: stagesOrder.indexOf(app.stage) >= idx ? getStageColor(stage) : 'var(--border-thin)' }}
                                      />
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                          {visibleColumns.includes('alert') && (
                            <div className="cell" data-label="Alerts">
                              <div className="alerts-cell">
                                {getNextInterview(app.interviews) && (
                                  <div className="alert-item interview-alert">
                                    <Clock size={14} className="alert-icon" />
                                    <span>{formatDate(getNextInterview(app.interviews)!.date)}</span>
                                  </div>
                                )}
                                {(app.tasks || []).filter(t => !t.completed && t.dueDate && new Date(t.dueDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)).length > 0 && (
                                  <div className="alert-item task-alert">
                                    <CheckSquare size={14} className="alert-icon" />
                                    <span>{(app.tasks || []).filter(t => !t.completed && t.dueDate && new Date(t.dueDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)).length} due soon</span>
                                  </div>
                                )}
                                {app.stage === 'offer' && (
                                  <div className="alert-item offer-alert">
                                    <Briefcase size={14} className="alert-icon" />
                                    <span>Offer pending</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          {visibleColumns.includes('tasks') && (
                            <div className="cell" data-label="Tasks">
                              <div className="tasks-cell">
                                <div className="tasks-count-container">
                                  <CheckSquare size={14} className="cell-icon" />
                                  <span className="cell-value">
                                    {(app.tasks || []).length} total
                                  </span>
                                </div>
                                <div className="tasks-progress-container">
                                  <div className="tasks-progress-bar">
                                    <div
                                      className="tasks-progress-fill"
                                      style={{
                                        width: `${(app.tasks || []).length ?
                                          ((app.tasks || []).filter(t => t.completed).length / (app.tasks || []).length) * 100 : 0}%`,
                                        backgroundColor: (app.tasks || []).filter(t => !t.completed).length > 0 ?
                                          'var(--accent-blue)' : 'var(--accent-green)'
                                      }}
                                    />
                                  </div>
                                  <span className="tasks-pending-count">
                                    {(app.tasks || []).filter(t => !t.completed).length} pending
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                          {visibleColumns.includes('location') && (
                            <div className="cell" data-label="Location">
                              <div className="location-cell">
                                <div className="location-info">
                                  <Briefcase size={14} className="cell-icon" />
                                  <span className="cell-value">
                                    {app.location}
                                    {app.remote && <span className="remote-indicator">• Remote</span>}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                          {visibleColumns.includes('salary') && (
                            <div className="cell" data-label="Salary">
                              <div className="compensation-cell">
                                {app.salary ? (
                                  <span className="comp-value">{app.salary}</span>
                                ) : (
                                  <span className="no-comp">Not specified</span>
                                )}
                              </div>
                            </div>
                          )}
                          {visibleColumns.includes('bonus') && (
                            <div className="cell" data-label="Bonus">
                              <div className="compensation-cell">
                                {app.bonus ? (
                                  <span className="comp-value bonus-value">{app.bonus}</span>
                                ) : (
                                  <span className="no-comp">None</span>
                                )}
                              </div>
                            </div>
                          )}
                          {visibleColumns.includes('benefits') && (
                            <div className="cell" data-label="Benefits">
                              <div className="compensation-cell">
                                {app.benefits && app.benefits.length > 0 ? (
                                  <div className="benefits-container">
                                    <span className="benefits-count">{app.benefits.length}</span>
                                    {isMobileView ? (
                                      <div className="benefits-list">
                                        {app.benefits.map((benefit, i) => (
                                          <span key={i} className="benefit-tag">{benefit}</span>
                                        ))}
                                      </div>
                                    ) : (
                                      <Tooltip
                                        content={
                                          <div className="benefits-tooltip">
                                            <h4>Benefits</h4>
                                            <ul>
                                              {app.benefits.map((benefit, i) => (
                                                <li key={i}>{benefit}</li>
                                              ))}
                                            </ul>
                                          </div>
                                        }
                                        placement="left"
                                      >
                                        <span className="benefits-value">
                                          {app.benefits.slice(0, 1).join(', ')}
                                          {app.benefits.length > 1 && <span className="more-indicator">+{app.benefits.length - 1}</span>}
                                        </span>
                                      </Tooltip>
                                    )}
                                  </div>
                                ) : (
                                  <span className="no-comp">Not specified</span>
                                )}
                              </div>
                            </div>
                          )}
                          <div className="row-actions-menu" onClick={e => e.stopPropagation()}>
                            <div className="quick-actions">
                              <Tooltip content={app.isShortlisted ? "Remove from shortlist" : "Add to shortlist"} placement="top">
                                <button
                                  className={`quick-action-btn shortlist-btn ${app.isShortlisted ? 'active' : ''}`}
                                  onClick={() => handleToggleShortlist(app.id)}
                                >
                                  <CheckSquare size={12} />
                                </button>
                              </Tooltip>
                              <Tooltip content="Edit inline" placement="top">
                                <button
                                  className="quick-action-btn edit-btn"
                                  onClick={() => setInlineEditingId(inlineEditingId === app.id ? null : app.id)}
                                >
                                  <Edit2 size={12} />
                                </button>
                              </Tooltip>
                              <Tooltip content="Add note" placement="top">
                                <button
                                  className="quick-action-btn note-btn"
                                  onClick={() => console.log('Add note for', app.id)}
                                >
                                  <Plus size={12} />
                                </button>
                              </Tooltip>
                            </div>
                            <div className="row-stage-controls">
                              <Tooltip content="Previous stage" placement="top">
                                <button
                                  className="stage-control-btn prev-stage"
                                  onClick={() => handleDecrementStage(app.id)}
                                  disabled={stagesOrder.indexOf(app.stage) === 0}
                                >
                                  <ArrowLeft size={12} />
                                </button>
                              </Tooltip>
                              <Tooltip content="Next stage" placement="top">
                                <button
                                  className="stage-control-btn next-stage"
                                  onClick={() => handleIncrementStage(app.id)}
                                  disabled={stagesOrder.indexOf(app.stage) === stagesOrder.length - 1}
                                >
                                  <ArrowRight size={12} />
                                </button>
                              </Tooltip>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    {isLoading && (
                      <div className="loading-state">
                        <Loader2 size={20} className="spinner" />
                        <span>Loading more...</span>
                      </div>
                    )}
                    {!hasMore && visibleApplications.length > 0 && (
                      <div className="end-state">
                        <span>All applications loaded</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedAppData && (
        <ApplicationDetailDrawer
          id={selectedAppData.id}
          position={selectedAppData.position}
          company={selectedAppData.company}
          dateApplied={selectedAppData.dateApplied}
          stage={selectedAppData.stage}
          jobDescription={selectedAppData.jobDescription}
          salary={selectedAppData.salary}
          location={selectedAppData.location}
          remote={selectedAppData.remote}
          notes={selectedAppData.notes}
          contacts={selectedAppData.contacts}
          interviews={selectedAppData.interviews || []}
          tasks={selectedAppData.tasks || []}
          documents={selectedAppData.documents || []}
          allNotes={selectedAppData.allNotes || []}
          isVisible={isDetailModalVisible}
          onClose={handleCloseDetailModal}
          onEdit={() => handleEditApplication(selectedAppData.id)}
          onStageChange={(newStage) => handleStageChange(selectedAppData.id, newStage)}
        />
      )}

      {contextMenu && (
        <div
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
          <div
            className="context-menu-item"
            onClick={() => {
              handleOpenDetailModal(contextMenu.id);
              setContextMenu(null);
            }}
            role="menuitem"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleOpenDetailModal(contextMenu.id);
                setContextMenu(null);
              }
            }}
          >
            <ChevronRight size={14} className="context-icon" />
            <span>View Details</span>
          </div>
          <div
            className="context-menu-item"
            onClick={() => {
              handleEditApplication(contextMenu.id);
              setContextMenu(null);
            }}
            role="menuitem"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleEditApplication(contextMenu.id);
                setContextMenu(null);
              }
            }}
          >
            <Edit2 size={14} className="context-icon" />
            <span>Edit Application</span>
          </div>
          <div className="context-menu-divider"></div>
          <div
            className="context-menu-item"
            onClick={() => {
              const app = applicationsData?.find((a: Application) => a.id === contextMenu.id);
              if (app && stagesOrder.indexOf(app.stage as ApplicationStage) > 0) {
                handleDecrementStage(contextMenu.id);
              }
              setContextMenu(null);
            }}
            role="menuitem"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                const app = applicationsData?.find((a: Application) => a.id === contextMenu.id);
                if (app && stagesOrder.indexOf(app.stage as ApplicationStage) > 0) {
                  handleDecrementStage(contextMenu.id);
                }
                setContextMenu(null);
              }
            }}
          >
            <ArrowLeft size={14} className="context-icon" />
            <span>Previous Stage</span>
          </div>
          <div
            className="context-menu-item"
            onClick={() => {
              const app = applicationsData?.find((a: Application) => a.id === contextMenu.id);
              if (app && stagesOrder.indexOf(app.stage as ApplicationStage) < stagesOrder.length - 1) {
                handleIncrementStage(contextMenu.id);
              }
              setContextMenu(null);
            }}
            role="menuitem"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                const app = applicationsData?.find((a: Application) => a.id === contextMenu.id);
                if (app && stagesOrder.indexOf(app.stage as ApplicationStage) < stagesOrder.length - 1) {
                  handleIncrementStage(contextMenu.id);
                }
                setContextMenu(null);
              }
            }}
          >
            <ArrowRight size={14} className="context-icon" />
            <span>Next Stage</span>
          </div>
          <div className="context-menu-divider"></div>
          <div
            className="context-menu-item delete"
            onClick={() => {
              handleDeleteApplication(contextMenu.id);
              setContextMenu(null);
            }}
            role="menuitem"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleDeleteApplication(contextMenu.id);
                setContextMenu(null);
              }
            }}
          >
            <Trash2 size={14} className="context-icon" />
            <span>Delete</span>
          </div>
        </div>
      )}

      <style jsx>{`
        .applications-home {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 16px;
          background: var(--background);
          border-radius: 8px;
          transition: all 0.3s ease;
          --glass-bg-rgb: 255, 255, 255;
        }

        .applications-home.mounted {
          opacity: 1;
          transform: translateY(0);
        }

        .header-actions {
          display: flex;
          gap: 8px;
          align-items: center;
          flex-wrap: wrap;
          margin-top: 8px;
        }

        @media (max-width: 768px) {
          .header-actions {
            flex-direction: column;
            align-items: stretch;
          }

          .search-bar {
            max-width: 100%;
          }
        }

        .search-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: var(--glass-bg);
          border: 1px solid var(--border-thin);
          border-radius: 6px;
          min-width: 250px;
          flex-grow: 1;
          max-width: 350px;
        }

        .search-icon {
          color: var(--text-secondary);
          flex-shrink: 0;
        }

        .search-input {
          border: none;
          background: transparent;
          color: var(--text-primary);
          font-size: 14px;
          width: 100%;
          outline: none;
        }

        .filter-input {
          width: 100%;
          padding: 4px 8px;
          font-size: 12px;
          border: 1px solid var(--border-thin);
          border-radius: 4px;
          background: var(--glass-bg);
          color: var(--text-primary);
          margin-top: 4px;
        }

        .dashboard-content {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .table-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .dashboard-controls {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          background: var(--glass-bg);
          padding: 6px 10px;
          border-radius: 6px;
          border: 1px solid var(--border-thin);
        }

        .view-toggle {
          display: flex;
          gap: 4px;
        }

        .control-btn {
          padding: 6px 10px;
          background: var(--glass-bg);
          border: 1px solid var(--border-thin);
          border-radius: 6px;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .control-btn:hover {
          background: var(--hover-bg);
          color: var(--text-primary);
        }

        .control-btn.active {
          background: var(--accent-blue);
          color: white;
          border-color: var(--accent-blue);
        }

        .control-btn.responsive-toggle {
          margin-left: 8px;
          border-left: 1px solid var(--border-thin);
          padding-left: 12px;
        }

        .control-btn.autosize-toggle {
          margin-left: 4px;
        }

        @media (min-width: 768px) {
          .control-btn.responsive-toggle {
            display: none;
          }
        }

        /* Density Controls */
        .density-controls {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-left: 12px;
          padding-left: 12px;
          border-left: 1px solid var(--border-thin);
        }

        .density-selector {
          display: flex;
          align-items: center;
          gap: 2px;
          background: var(--glass-bg);
          border-radius: 6px;
          padding: 2px;
          border: 1px solid var(--border-thin);
        }

        .density-btn {
          padding: 4px 6px;
          border: none;
          background: transparent;
          border-radius: 4px;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 28px;
          height: 28px;
        }

        .density-btn:hover {
          background: var(--hover-bg);
          color: var(--text-primary);
        }

        .density-btn.active {
          background: var(--accent-blue);
          color: white;
        }

        /* Quick Filters */
        .quick-filters {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-left: 12px;
          padding-left: 12px;
          border-left: 1px solid var(--border-thin);
        }

        .quick-filter-select {
          padding: 4px 8px;
          border: 1px solid var(--border-thin);
          border-radius: 6px;
          background: var(--glass-bg);
          color: var(--text-primary);
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 100px;
        }

        .quick-filter-select:focus {
          outline: none;
          border-color: var(--accent-blue);
          box-shadow: 0 0 0 2px rgba(var(--accent-blue-rgb), 0.1);
        }

        .control-actions {
          margin-left: auto;
          position: relative;
        }

        .column-menu {
          position: absolute;
          top: calc(100% + 6px);
          right: 0;
          background: var(--glass-bg);
          border: 1px solid var(--border-thin);
          border-radius: 6px;
          padding: 8px;
          z-index: 100;
          animation: slideDown 0.3s ease-out;
        }

        .column-item {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 8px;
          font-size: 13px;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .column-item:hover {
          background: var(--hover-bg);
          color: var(--text-primary);
        }

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

        .table-grid {
          grid-template-columns: 1fr;
        }

        .dashboard-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 0;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        :global(.dark) .dashboard-card {
          background: #1f2937;
          border-color: #374151;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        }

        .table-wrapper {
          position: relative;
          background: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
        }

        :global(.dark) .table-wrapper {
          background: #1f2937;
          border-color: #374151;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        }

        .table-header {
          display: grid;
          grid-template-columns: 1.8fr 2.2fr 1fr 1.5fr 0.8fr 1.2fr 1fr 1fr;
          padding: 20px 24px;
          background: #f8fafc;
          border-bottom: 1px solid #e5e7eb;
          font-size: 13px;
          font-weight: 600;
          color: #374151;
          position: sticky;
          top: 0;
          z-index: 10;
          gap: 8px;
        }

        :global(.dark) .table-header {
          background: #374151;
          border-bottom-color: #4b5563;
          color: #d1d5db;
        }

        .table-header.autosize {
          grid-template-columns: auto auto auto auto auto auto auto auto;
        }

        @media (max-width: 1400px) {
          .table-header {
            grid-template-columns: 2fr 2.5fr 1fr 1.2fr 1fr 1.5fr 1.2fr 0;
          }
        }

        @media (max-width: 1200px) {
          .table-header {
            grid-template-columns: 2fr 2fr 1fr 1.2fr 1fr 1.5fr 0 0;
          }
        }

        @media (max-width: 992px) {
          .table-header {
            grid-template-columns: 2fr 2fr 1fr 1.2fr 0 0 0 0;
          }
        }

        @media (max-width: 768px) {
          .table-header {
            grid-template-columns: 2fr 2fr 1fr 1.2fr 0 0 0 0;
          }
        }

        .header-cell {
          display: flex;
          flex-direction: column;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .header-cell span {
          display: flex;
          align-items: center;
          gap: 4px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.025em;
          font-size: 11px;
          color: #6b7280;
          transition: color 0.2s ease;
        }

        :global(.dark) .header-cell span {
          color: #9ca3af;
        }

        .header-cell:hover span {
          color: #667eea;
        }

        .header-cell.sorted span {
          color: #667eea;
        }

        .filter-input {
          padding: 6px 8px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 12px;
          background: #ffffff;
          color: #374151;
          transition: all 0.2s ease;
        }

        :global(.dark) .filter-input {
          background: #4b5563;
          border-color: #6b7280;
          color: #f3f4f6;
        }

        .filter-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .table-body {
          max-height: calc(100vh - 300px);
          overflow-y: auto;
          background: #ffffff;
        }

        :global(.dark) .table-body {
          background: #1f2937;
        }

        .table-row {
          display: grid;
          grid-template-columns: 1.8fr 2.2fr 1fr 1.5fr 0.8fr 1.2fr 1fr 1fr;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid #f1f5f9;
          background: #ffffff;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          cursor: pointer;
          min-height: 60px;
          gap: 8px;
        }

        /* Density Variations */
        .table-row.density-compact {
          padding: 8px 16px;
          min-height: 44px;
          gap: 6px;
        }

        .table-row.density-comfortable {
          padding: 16px 20px;
          min-height: 60px;
          gap: 8px;
        }

        .table-row.density-spacious {
          padding: 24px 28px;
          min-height: 76px;
          gap: 12px;
        }

        :global(.dark) .table-row {
          background: #1f2937;
          border-bottom-color: #374151;
        }

        .table-row.autosize {
          grid-template-columns: auto auto auto auto auto auto auto auto;
        }

        @media (max-width: 1400px) {
          .table-row {
            grid-template-columns: 2fr 2.5fr 1fr 1.2fr 1fr 1.5fr 1.2fr 0;
          }
        }

        @media (max-width: 1200px) {
          .table-row {
            grid-template-columns: 2fr 2fr 1fr 1.2fr 1fr 1.5fr 0 0;
          }
        }

        @media (max-width: 992px) {
          .table-row {
            grid-template-columns: 2fr 2fr 1fr 1.2fr 0 0 0 0;
          }
        }

        @media (max-width: 768px) {
          .table-row {
            grid-template-columns: 2fr 2fr 1fr 1.2fr 0 0 0 0;
          }
        }

        .table-row::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          width: 4px;
          height: 100%;
          background: transparent;
          transition: background 0.2s ease;
        }

        .table-row:hover {
          background: #f8fafc;
          border-left: 4px solid #667eea;
          padding-left: 20px;
        }

        :global(.dark) .table-row:hover {
          background: #374151;
        }

        .table-row:hover::before {
          background: #667eea;
        }

        .table-row.selected {
          background: #eff6ff;
          border-left: 4px solid #667eea;
          padding-left: 20px;
        }

        :global(.dark) .table-row.selected {
          background: #1e3a8a;
        }

        .table-row.selected::before {
          background: #667eea;
        }

        .table-row.animate-in {
          animation: rowSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        @keyframes rowSlideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Mobile view styles */
        .table-row.mobile-view {
          display: flex;
          flex-direction: column;
          padding: 16px;
          gap: 10px;
        }

        .table-row.mobile-view > div:nth-child(1) { order: 1; } /* Company */
        .table-row.mobile-view > div:nth-child(2) { order: 2; } /* Position */
        .table-row.mobile-view > div:nth-child(4) { order: 3; } /* Stage */
        .table-row.mobile-view > div:nth-child(7) { order: 4; } /* Salary */
        .table-row.mobile-view > div:nth-child(8) { order: 5; } /* Bonus */
        .table-row.mobile-view > div:nth-child(6) { order: 6; } /* Location */
        .table-row.mobile-view > div:nth-child(5) { order: 7; } /* Tasks */
        .table-row.mobile-view > div:nth-child(3) { order: 8; } /* Date Applied */

        .table-row.mobile-view .cell {
          padding: 10px;
          width: 100%;
          background: rgba(var(--glass-bg-rgb), 0.5);
          border-radius: 8px;
          border: 1px solid var(--border-thin);
          display: flex;
          flex-direction: column;
        }

        .table-row.mobile-view .cell::before {
          content: attr(data-label);
          font-weight: 600;
          font-size: 13px;
          color: var(--text-secondary);
          margin-bottom: 8px;
          display: block;
          border-bottom: 1px solid var(--border-thin);
          padding-bottom: 4px;
        }

        .table-row.mobile-view .company-cell {
          width: 100%;
          display: flex;
          flex-direction: row;
          margin-top: 8px;
          align-items: center;
        }

        .table-row.mobile-view .position-cell {
          width: 100%;
        }

        .table-row.mobile-view .checkbox-wrapper {
          position: absolute;
          top: 16px;
          left: 16px;
        }

        .table-row.mobile-view .position-title {
          font-size: 16px;
          margin-bottom: 8px;
        }

        .table-row.mobile-view .stage-container {
          align-items: center;
        }

        .table-row.mobile-view .compensation-cell {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 10px;
        }

        .table-row.mobile-view .alerts-cell {
          flex-direction: row;
          flex-wrap: wrap;
        }

        .table-row.mobile-view .alert-item {
          margin-right: 8px;
        }

        .table-row.mobile-view .benefits-container {
          display: flex;
          flex-direction: column;
          width: 100%;
        }

        .table-row.mobile-view .benefits-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 8px;
        }

        .table-row.mobile-view .benefit-tag {
          background: rgba(var(--accent-blue-rgb), 0.1);
          color: var(--accent-blue);
          padding: 4px 8px;
          border-radius: 16px;
          font-size: 12px;
          display: inline-block;
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
          padding: 4px 10px;
          background: rgba(0, 0, 0, 0.85);
          color: white;
          font-size: 11px;
          border-radius: 16px;
          animation: bubbleFade 3s ease-in-out forwards;
        }

        .cell {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          color: #1f2937;
          position: relative;
          min-height: 40px;
        }

        :global(.dark) .cell {
          color: #f3f4f6;
        }

        .cell-icon {
          color: #9ca3af;
          flex-shrink: 0;
          width: 16px;
          height: 16px;
        }

        .cell-value {
          font-weight: 500;
          color: #1f2937;
        }

        :global(.dark) .cell-value {
          color: #f9fafb;
        }

        .checkbox-wrapper {
          position: relative;
          width: 20px;
          height: 20px;
          margin-right: 12px;
        }

        .custom-checkbox {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
        }

        .checkbox-label {
          position: absolute;
          top: 0;
          left: 0;
          width: 20px;
          height: 20px;
          background: #ffffff;
          border: 2px solid #d1d5db;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        :global(.dark) .checkbox-label {
          background: #374151;
          border-color: #6b7280;
        }

        .custom-checkbox:checked + .checkbox-label {
          background: #667eea;
          border-color: #667eea;
        }

        .custom-checkbox:checked + .checkbox-label::after {
          content: '✓';
          color: white;
          font-weight: bold;
          font-size: 12px;
        }

        .company-cell {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .company-logo {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          object-fit: cover;
          border: 1px solid #e5e7eb;
          flex-shrink: 0;
        }

        :global(.dark) .company-logo {
          border-color: #4b5563;
        }

        .company-logo-placeholder {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 14px;
          flex-shrink: 0;
        }

        .company-name {
          font-weight: 600;
          color: #1f2937;
          font-size: 14px;
          truncate: ellipsis;
          white-space: nowrap;
          overflow: hidden;
        }

        :global(.dark) .company-name {
          color: #f9fafb;
        }

        .position-cell {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
        }

        .position-title {
          font-weight: 600;
          color: #1f2937;
          font-size: 14px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        :global(.dark) .position-title {
          color: #f9fafb;
        }

        .position-description {
          font-size: 12px;
          color: #6b7280;
          line-height: 1.4;
        }

        :global(.dark) .position-description {
          color: #9ca3af;
        }
          text-overflow: ellipsis;
        }

        .position-description {
          font-size: 12px;
          color: var(--text-tertiary);
          line-height: 1.3;
          max-height: 32px;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        /* Tooltip styles */
        .company-tooltip h4,
        .position-tooltip h4,
        .benefits-tooltip h4 {
          margin: 0 0 8px 0;
          color: var(--accent-blue);
          font-size: 15px;
        }

        .company-tooltip p,
        .position-tooltip p {
          margin: 4px 0;
          font-size: 13px;
        }

        .position-tooltip p {
          max-width: 400px;
          white-space: normal;
          line-height: 1.4;
        }

        .benefits-tooltip ul {
          margin: 0;
          padding: 0 0 0 18px;
        }

        .benefits-tooltip li {
          margin-bottom: 4px;
          font-size: 13px;
        }

        .cell-value {
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }

        .cell-subvalue {
          font-size: 12px;
          color: var(--text-tertiary);
          margin-left: 4px;
          white-space: nowrap;
        }

        .cell-value.muted {
          color: var(--text-tertiary);
          font-style: italic;
        }

        .stage-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
          width: 100%;
        }

        .stage-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: capitalize;
          transition: all 0.2s ease;
          border: 1px solid transparent;
          max-width: fit-content;
        }

        .stage-applied {
          background: #eff6ff;
          color: #1d4ed8;
          border-color: #93c5fd;
        }

        :global(.dark) .stage-applied {
          background: #1e3a8a;
          color: #93c5fd;
          border-color: #3730a3;
        }

        .stage-screening {
          background: #fdf4ff;
          color: #a21caf;
          border-color: #d8b4fe;
        }

        :global(.dark) .stage-screening {
          background: #581c87;
          color: #d8b4fe;
          border-color: #6b21a8;
        }

        .stage-interview {
          background: #ecfdf5;
          color: #059669;
          border-color: #6ee7b7;
        }

        :global(.dark) .stage-interview {
          background: #064e3b;
          color: #6ee7b7;
          border-color: #047857;
        }

        .stage-offer {
          background: #f0fdf4;
          color: #16a34a;
          border-color: #86efac;
        }

        :global(.dark) .stage-offer {
          background: #14532d;
          color: #86efac;
          border-color: #15803d;
        }

        .stage-rejected {
          background: #fef2f2;
          color: #dc2626;
          border-color: #fca5a5;
        }

        :global(.dark) .stage-rejected {
          background: #7f1d1d;
          color: #fca5a5;
          border-color: #991b1b;
        }

        .stage-indicator {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
          background: currentColor;
        }

        .stage-label {
          font-weight: 600;
          color: inherit;
        }

        .stage-progress-container {
          width: 100%;
          margin-top: 6px;
        }

        .stage-progress-background {
          width: 100%;
          height: 4px;
          border-radius: 2px;
          background: #e5e7eb;
          overflow: hidden;
          position: relative;
        }

        :global(.dark) .stage-progress-background {
          background: #4b5563;
        }

        .stage-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #667eea, #764ba2);
          border-radius: 2px;
          transition: width 0.3s ease;
        }

        .interview-cell {
          display: flex;
          flex-direction: column;
          gap: 6px;
          width: 100%;
        }

        .interview-date-container {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .interview-type-tag {
          font-size: 11px;
          padding: 2px 8px;
          border-radius: 4px;
          color: white;
          font-weight: 500;
          display: inline-block;
          max-width: fit-content;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .no-interview {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          width: 100%;
          height: 100%;
        }

        .tasks-cell {
          display: flex;
          flex-direction: column;
          gap: 4px;
          width: 100%;
        }

        .tasks-count-container {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .tasks-progress-container {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
        }

        .tasks-progress-bar {
          height: 6px;
          background: var(--glass-bg);
          border-radius: 3px;
          flex-grow: 1;
          overflow: hidden;
          border: 1px solid var(--border-thin);
        }

        .tasks-progress-fill {
          height: 100%;
          transition: width 0.3s ease;
        }

        .tasks-pending-count {
          font-size: 11px;
          color: var(--text-secondary);
          white-space: nowrap;
        }

        .alerts-cell {
          display: flex;
          flex-direction: column;
          gap: 4px;
          width: 100%;
        }

        .alert-item {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 5px 10px;
          border-radius: 6px;
          font-size: 12px;
          max-width: 100%;
          margin-bottom: 4px;
          transition: all 0.2s ease;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateX(10px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .alert-icon {
          flex-shrink: 0;
        }

        .interview-alert {
          background: rgba(var(--accent-blue-rgb), 0.1);
          color: var(--accent-blue);
          border-left: 2px solid var(--accent-blue);
        }

        .interview-alert:hover {
          background: rgba(var(--accent-blue-rgb), 0.15);
          transform: translateX(-2px);
        }

        .task-alert {
          background: rgba(var(--accent-red-rgb), 0.1);
          color: var(--accent-red);
          border-left: 2px solid var(--accent-red);
        }

        .task-alert:hover {
          background: rgba(var(--accent-red-rgb), 0.15);
          transform: translateX(-2px);
        }

        .offer-alert {
          background: rgba(var(--accent-green-rgb), 0.1);
          color: var(--accent-green);
          font-weight: 600;
          border-left: 2px solid var(--accent-green);
          animation: pulseAlert 2s infinite;
        }

        .offer-alert:hover {
          background: rgba(var(--accent-green-rgb), 0.15);
          transform: translateX(-2px);
        }

        @keyframes pulseAlert {
          0% { box-shadow: 0 0 0 0 rgba(var(--accent-green-rgb), 0.2); }
          70% { box-shadow: 0 0 0 5px rgba(var(--accent-green-rgb), 0); }
          100% { box-shadow: 0 0 0 0 rgba(var(--accent-green-rgb), 0); }
        }

        .location-cell {
          display: flex;
          flex-direction: column;
          gap: 4px;
          width: 100%;
        }

        .location-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .remote-indicator {
          color: var(--accent-green);
          margin-left: 6px;
          font-weight: 500;
          font-size: 13px;
        }

        .compensation-cell {
          display: flex;
          flex-direction: column;
          width: 100%;
          gap: 2px;
        }

        .comp-value {
          font-weight: 600;
          color: var(--text-primary);
          font-size: 14px;
          padding: 3px 6px;
          background: rgba(var(--accent-blue-rgb), 0.075);
          border-radius: 4px;
          max-width: fit-content;
          transition: all 0.2s ease;
        }

        .table-row:hover .comp-value {
          background: rgba(var(--accent-blue-rgb), 0.1);
        }

        .bonus-value {
          color: var(--accent-green);
          background: rgba(var(--accent-green-rgb), 0.075);
        }

        .table-row:hover .bonus-value {
          background: rgba(var(--accent-green-rgb), 0.1);
        }

        .no-comp {
          font-size: 12px;
          color: var(--text-tertiary);
          font-style: italic;
        }

        .benefits-container {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .benefits-count {
          font-size: 12px;
          color: var(--text-secondary);
          padding: 1px 5px;
          background: var(--glass-bg);
          border-radius: 10px;
          max-width: fit-content;
        }

        .benefits-value {
          font-size: 12px;
          color: var(--text-primary);
          width: 100%;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .more-indicator {
          margin-left: 4px;
          color: var(--text-tertiary);
          font-size: 11px;
        }

        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(var(--accent-green-rgb), 0.4);
          }
          70% {
            box-shadow: 0 0 0 4px rgba(var(--accent-green-rgb), 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(var(--accent-green-rgb), 0);
          }
        }

        .contacts-cell {
          display: flex;
          flex-direction: column;
          gap: 6px;
          width: 100%;
        }

        .contacts-header {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .contact-avatars-container {
          display: flex;
          align-items: center;
          padding-left: 8px;
          height: 28px;
        }

        .no-contacts {
          font-size: 12px;
          color: var(--text-tertiary);
          font-style: italic;
        }

        .contact-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--accent-purple);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 600;
          position: relative;
          border: 2px solid var(--glass-bg);
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .contact-avatar:hover {
          transform: translateY(-2px) scale(1.05) !important;
          box-shadow: 0 3px 6px rgba(0,0,0,0.15);
          z-index: 10 !important;
        }

        .contact-more {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--glass-bg);
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 600;
          position: relative;
          border: 2px solid var(--glass-bg);
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .row-actions-menu {
          position: absolute;
          top: 0;
          right: 8px;
          height: 100%;
          display: flex;
          align-items: center;
          opacity: 0;
          transition: all 0.2s ease;
        }

        .table-row:hover .row-actions-menu {
          opacity: 1;
        }

        .row-stage-controls {
          display: flex;
          gap: 4px;
        }

        .quick-action-btn {
          width: 24px;
          height: 24px;
          border-radius: 4px;
          background: var(--glass-bg);
          border: 1px solid var(--border-thin);
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          padding: 0;
        }

        .quick-action-btn:hover {
          background: var(--hover-bg);
          color: var(--text-primary);
          transform: scale(1.1);
        }

        .quick-action-btn.shortlist-btn.active {
          background: rgba(var(--accent-green-rgb), 0.1);
          color: var(--accent-green);
          border-color: var(--accent-green);
        }

        .edit-btn:hover {
          background: rgba(var(--accent-blue-rgb), 0.1);
          color: var(--accent-blue);
        }

        .note-btn:hover {
          background: rgba(var(--accent-purple-rgb), 0.1);
          color: var(--accent-purple);
        }

        .stage-control-btn:hover:not(:disabled) {
          background: var(--hover-bg);
          color: var(--text-primary);
          transform: scale(1.1);
        }

        .stage-control-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .prev-stage:hover:not(:disabled) {
          background: rgba(var(--accent-blue-rgb), 0.1);
          color: var(--accent-blue);
        }

        .next-stage:hover:not(:disabled) {
          background: rgba(var(--accent-green-rgb), 0.1);
          color: var(--accent-green);
        }

        .context-menu {
          background: var(--glass-bg);
          border: 1px solid var(--border-thin);
          border-radius: 8px;
          box-shadow: var(--shadow);
          min-width: 180px;
          z-index: 1000;
          animation: fadeIn 0.2s ease;
          backdrop-filter: blur(10px);
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
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
        }

        .context-menu-item:hover {
          background: var(--hover-bg);
        }

        .context-icon {
          color: var(--text-secondary);
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

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px;
          color: var(--text-tertiary);
          font-size: 14px;
          gap: 12px;
          text-align: center;
          background: var(--glass-bg);
          border-radius: 8px;
        }

        .empty-state .action-btn {
          background: var(--accent-blue);
          color: white;
          padding: 6px 12px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .loading-state {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          color: var(--text-secondary);
          font-size: 13px;
          gap: 6px;
          background: var(--glass-bg);
          border-radius: 6px;
          margin: 12px;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        .end-state {
          text-align: center;
          padding: 16px;
          color: var(--text-tertiary);
          font-size: 13px;
          font-style: italic;
          background: var(--glass-bg);
          border-radius: 6px;
          margin: 12px;
        }

        @keyframes rowEnter {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }

        @keyframes statusFade {
          0% { opacity: 0; transform: translateY(10px); }
          20% { opacity: 1; transform: translateY(0); }
          80% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-10px); }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }

        @keyframes bubbleFade {
          0% { opacity: 0; transform: scale(0.9); }
          20% { opacity: 1; transform: scale(1); }
          80% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.9); }
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
}
