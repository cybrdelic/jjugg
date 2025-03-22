'use client';
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  PlusCircle, Grid3x3, ListFilter, SlidersHorizontal, Download, X, Clock,
  ArrowUp, ArrowDown, Calendar, User, Briefcase, CheckSquare, Users,
  Edit2, Trash2, ChevronRight, Plus, Minus, Search, Loader2, ArrowLeft, ArrowRight,
  Smartphone, Monitor
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import CardHeader from '../CardHeader';
import ApplicationCard from '../applications/ApplicationCard';
import KanbanColumn from '../applications/KanbanColumn';
import ActionButton from '../dashboard/ActionButton';
import ApplicationDetailDrawer from '../applications/ApplicationDetailDrawer';
import { applications as mockApplications, companies as mockCompanies } from '../../pages/data';
import { Application, ApplicationStage, InterviewEvent, StatusUpdate } from '@/types';

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
  switch(type.toLowerCase()) {
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

const companies = mockCompanies;
const applications = mockApplications;

// Type Guard Function
const isInputElement = (element: EventTarget | null): element is HTMLInputElement => {
  return element instanceof HTMLInputElement;
};

export default function Applications() {
  const { currentTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [sortConfig, setSortConfig] = useState<{ column: keyof Application | 'company.name'; direction: 'asc' | 'desc' }>(
    { column: 'dateApplied', direction: 'desc' }
  );
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null);
  const [applicationData, setApplicationData] = useState<Application[]>(applications);
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
  const [contextMenu, setContextMenu] = useState<{id: string, x: number, y: number} | null>(null);
  const [isMobileView, setIsMobileView] = useState<boolean>(false);
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
    let filtered = [...applicationData];
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(app =>
        app.position.toLowerCase().includes(search) ||
        app.company.name.toLowerCase().includes(search) ||
        app.location.toLowerCase().includes(search) ||
        app.notes.toLowerCase().includes(search)
      );
    }
    Object.entries(columnFilters).forEach(([column, filterValue]) => {
      if (filterValue) {
        filtered = filtered.filter(app => {
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
      let valueA = column === 'company.name' ? a.company.name : a[column as keyof Application];
      let valueB = column === 'company.name' ? b.company.name : b[column as keyof Application];
      if (valueA instanceof Date && valueB instanceof Date) {
        return direction === 'asc' ? valueA.getTime() - valueB.getTime() : valueB.getTime() - valueA.getTime();
      }
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return direction === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
      }
      return 0;
    });
    return filtered;
  }, [applicationData, searchTerm, columnFilters, sortConfig]);

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
    applications: applicationData.length,
    interviews: applicationData.flatMap(app => app.interviews || []).filter(i => !i.completed && i.date > new Date()).length,
  }), [applicationData]);

  const selectedAppData = useMemo(() =>
    selectedApplication ? applicationData.find(app => app.id === selectedApplication) || null : null,
    [selectedApplication, applicationData]
  );

  const applicationsByStage = useMemo(() => {
    const stages: Record<ApplicationStage, Application[]> = {
      applied: [], screening: [], interview: [], offer: [], rejected: []
    };
    filteredApplications.forEach(app => stages[app.stage].push(app));
    return stages;
  }, [filteredApplications]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value);
  const toggleViewMode = () => setViewMode(prev => prev === 'table' ? 'kanban' : 'table');
  const stagesOrder: ApplicationStage[] = ['applied', 'screening', 'interview', 'offer', 'rejected'];

  const handleStageChange = (appId: string, newStage: ApplicationStage) => {
    setApplicationData(prev => prev.map(app =>
      app.id === appId ? { ...app, stage: newStage } : app
    ));
    addStatusUpdate(`Moved to ${getStageLabel(newStage)}`, appId);
  };

  const handleIncrementStage = (appId: string) => {
    setApplicationData(prev => prev.map(app => {
      if (app.id === appId && stagesOrder.indexOf(app.stage) < stagesOrder.length - 1) {
        const newStage = stagesOrder[stagesOrder.indexOf(app.stage) + 1];
        addStatusUpdate(`Progressed to ${getStageLabel(newStage)}`, appId);
        return { ...app, stage: newStage };
      }
      return app;
    }));
  };

  const handleDecrementStage = (appId: string) => {
    setApplicationData(prev => prev.map(app => {
      if (app.id === appId && stagesOrder.indexOf(app.stage) > 0) {
        const newStage = stagesOrder[stagesOrder.indexOf(app.stage) - 1];
        addStatusUpdate(`Reverted to ${getStageLabel(newStage)}`, appId);
        return { ...app, stage: newStage };
      }
      return app;
    }));
  };

  const handleEditApplication = (appId: string) => {
    setSelectedApplication(appId);
    console.log(`Edit application ${appId}`);
  };

  const handleDeleteApplication = (appId: string) => {
    if (confirm('Are you sure you want to delete this application?')) {
      setApplicationData(prev => prev.filter(app => app.id !== appId));
      addStatusUpdate('Application Deleted', appId);
      if (selectedApplication === appId) setIsDetailModalVisible(false);
      setSelectedRows(prev => prev.filter(id => id !== appId));
    }
  };

  const handleAddApplication = () => { console.log('Add new application'); };
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
  const handleBulkDelete = () => {
    if (selectedRows.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedRows.length} application(s)?`)) {
      setApplicationData(prev => prev.filter(app => !selectedRows.includes(app.id)));
      addStatusUpdate(`Deleted ${selectedRows.length} applications`, null);
      setSelectedRows([]);
      if (selectedRows.includes(selectedApplication || '')) setIsDetailModalVisible(false);
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
          <div className="search-bar">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search by position, company, or notes..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
          </div>
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
              <button
                className={`control-btn ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => setViewMode('table')}
                title="List View"
              >
                <ListFilter size={14} />
              </button>
              <button
                className={`control-btn ${viewMode === 'kanban' ? 'active' : ''}`}
                onClick={() => setViewMode('kanban')}
                title="Kanban View"
              >
                <Grid3x3 size={14} />
              </button>
              <button
                className={`control-btn responsive-toggle ${isMobileView ? 'active' : ''}`}
                onClick={() => setIsMobileView(!isMobileView)}
                title={isMobileView ? "Desktop View" : "Mobile View"}
              >
                {isMobileView ? <Monitor size={14} /> : <Smartphone size={14} />}
              </button>
            </div>
            <div className="control-actions">
              <button
                className="control-btn"
                onClick={() => setIsColumnMenuOpen(!isColumnMenuOpen)}
                title="Customize Columns"
              >
                <SlidersHorizontal size={14} />
              </button>
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
                  onAddNew={() => { console.log(`Add new in ${stage}`); }}
                  onCollapseToggle={(collapsed) => console.log(`${stage} column ${collapsed ? 'collapsed' : 'expanded'}`)}
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
                        onEdit={() => handleEditApplication(app.id)}
                        onDelete={() => handleDeleteApplication(app.id)}
                        onStageChange={(newStage) => handleStageChange(app.id, newStage)}
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
                  <div className="table-header">
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
                          className={`table-row ${selectedRows.includes(app.id) ? 'selected' : ''} ${mounted ? 'animate-in' : ''} ${isMobileView ? 'mobile-view' : ''}`}
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
                              <div className="checkbox-wrapper">
                                <input
                                  type="checkbox"
                                  id={`checkbox-${app.id}`}
                                  checked={selectedRows.includes(app.id)}
                                  onChange={() => handleRowSelect(app.id)}
                                  onClick={e => e.stopPropagation()}
                                  className="custom-checkbox"
                                />
                                <label htmlFor={`checkbox-${app.id}`} className="checkbox-label"></label>
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
                                <span className="cell-value company-name">{app.company.name}</span>
                              </div>
                            </div>
                          )}
                          {visibleColumns.includes('position') && (
                            <div className="cell" data-label="Position">
                              <div className="position-cell">
                                <span className="cell-value position-title">{app.position}</span>
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
                                      <span className="benefits-value">
                                        {app.benefits.slice(0, 1).join(', ')}
                                        {app.benefits.length > 1 && <span className="more-indicator">+{app.benefits.length - 1}</span>}
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="no-comp">Not specified</span>
                                )}
                              </div>
                            </div>
                          )}
                          <div className="row-actions-menu" onClick={e => e.stopPropagation()}>
                            <div className="row-stage-controls">
                              <button
                                className="stage-control-btn prev-stage"
                                onClick={() => handleDecrementStage(app.id)}
                                disabled={stagesOrder.indexOf(app.stage) === 0}
                                title="Move to previous stage"
                              >
                                <ArrowLeft size={14} />
                              </button>
                              <button
                                className="stage-control-btn next-stage"
                                onClick={() => handleIncrementStage(app.id)}
                                disabled={stagesOrder.indexOf(app.stage) === stagesOrder.length - 1}
                                title="Move to next stage"
                              >
                                <ArrowRight size={14} />
                              </button>
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
              const app = applicationData.find(a => a.id === contextMenu.id);
              if (app && stagesOrder.indexOf(app.stage) > 0) {
                handleDecrementStage(contextMenu.id);
              }
              setContextMenu(null);
            }}
            role="menuitem"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                const app = applicationData.find(a => a.id === contextMenu.id);
                if (app && stagesOrder.indexOf(app.stage) > 0) {
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
              const app = applicationData.find(a => a.id === contextMenu.id);
              if (app && stagesOrder.indexOf(app.stage) < stagesOrder.length - 1) {
                handleIncrementStage(contextMenu.id);
              }
              setContextMenu(null);
            }}
            role="menuitem"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                const app = applicationData.find(a => a.id === contextMenu.id);
                if (app && stagesOrder.indexOf(app.stage) < stagesOrder.length - 1) {
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
        
        @media (min-width: 768px) {
          .control-btn.responsive-toggle {
            display: none;
          }
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
          background: var(--glass-bg);
          border: 1px solid var(--border-thin);
          border-radius: 8px;
          padding: 0;
          overflow: hidden;
        }

        .table-wrapper {
          position: relative;
          padding-top: 40px;
        }

        .table-header {
          display: grid;
          grid-template-columns: 2fr 2.5fr 1fr 1.2fr 1fr 1.5fr 1.2fr 1fr;
          padding: 10px 12px;
          border-bottom: 1px solid var(--border-divider);
          background: var(--glass-bg);
          position: sticky;
          top: 0;
          z-index: 9;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
          width: 100%;
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
          padding: 8px 10px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
          justify-content: flex-start;
          align-items: flex-start;
          text-align: left;
        }

        .header-cell:hover span {
          color: var(--accent-blue);
        }

        .header-cell.sorted span {
          color: var(--accent-blue);
        }

        .table-body {
          max-height: calc(100vh - 300px);
          overflow-y: auto;
          background: var(--background);
          padding: 0 12px 12px;
        }

        .table-row {
          display: grid;
          grid-template-columns: 2fr 2.5fr 1fr 1.2fr 1fr 1.5fr 1.2fr 1fr;
          width: 100%;
          align-items: center;
          padding: 16px 14px;
          border-bottom: 1px solid var(--border-divider);
          background: var(--glass-bg);
          transition: all 0.25s cubic-bezier(0.25, 0.1, 0.25, 1);
          position: relative;
          opacity: 0;
          transform: translateY(10px);
          cursor: pointer;
          border-radius: 10px;
          margin: 6px 0;
          box-shadow: 0 2px 6px rgba(0,0,0,0.08);
          overflow: hidden;
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
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
          background: transparent;
          transition: all 0.2s ease;
        }

        .table-row:last-child {
          border-bottom: none;
        }

        .table-row.animate-in {
          animation: rowEnter 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }

        .table-row:hover {
          background: var(--hover-bg);
          box-shadow: 0 8px 15px rgba(0,0,0,0.1);
          transform: translateY(-3px) scale(1.01);
        }
        
        .table-row:hover::before {
          background: var(--accent-blue);
        }

        .table-row.selected {
          background: rgba(var(--accent-blue-rgb), 0.08);
          box-shadow: 0 6px 15px rgba(var(--accent-blue-rgb), 0.15);
          border: 1px solid rgba(var(--accent-blue-rgb), 0.2);
        }
        
        .table-row.selected::before {
          background: var(--accent-blue);
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
          padding: 8px 10px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: var(--text-primary);
          position: relative;
          justify-content: flex-start;
          text-align: left;
          overflow: hidden;
        }

        .cell-icon {
          color: var(--text-tertiary);
          flex-shrink: 0;
        }

        .checkbox-wrapper {
          position: relative;
          width: 18px;
          height: 18px;
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
          width: 18px;
          height: 18px;
          background: var(--glass-bg);
          border: 1px solid var(--border-thin);
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .custom-checkbox:checked + .checkbox-label {
          background: var(--accent-blue);
          border-color: var(--accent-blue);
        }
        
        .custom-checkbox:checked + .checkbox-label::after {
          content: '';
          position: absolute;
          top: 4px;
          left: 6px;
          width: 5px;
          height: 8px;
          border: solid white;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }
        
        .company-cell {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .company-logo {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          object-fit: cover;
          border: 1px solid var(--border-thin);
        }
        
        .company-logo-placeholder {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 14px;
        }
        
        .company-name {
          font-weight: 600;
          letter-spacing: -0.2px;
        }
        
        .position-cell {
          display: flex;
          flex-direction: column;
          gap: 4px;
          width: 100%;
        }
        
        .position-title {
          font-weight: 600;
          color: var(--text-primary);
          max-width: 100%;
          white-space: nowrap;
          overflow: hidden;
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
          gap: 6px;
          width: 100%;
        }

        .stage-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 10px;
          border-radius: 6px;
          border: 1px solid transparent;
          background: var(--glass-bg);
          min-width: 120px;
          transition: all 0.2s ease;
        }
        
        .stage-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        
        .stage-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
        }
        
        .stage-offer .stage-label {
          color: var(--accent-green);
        }
        
        .stage-rejected .stage-label {
          color: var(--accent-red);
        }
        
        .table-row:hover .stage-badge {
          background: rgba(var(--accent-blue-rgb), 0.05);
          transform: translateY(-1px);
        }

        .stage-progress-container {
          width: 100%;
          margin-top: 2px;
        }

        .stage-progress-background {
          display: flex;
          width: 100%;
          height: 6px;
          border-radius: 3px;
          overflow: hidden;
          background: var(--glass-bg);
          gap: 4px;
        }

        .stage-step {
          flex: 1;
          height: 100%;
          transition: all 0.3s ease;
        }

        .stage-step.completed {
          box-shadow: 0 0 4px rgba(0,0,0,0.2);
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
        
        .stage-control-btn {
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
