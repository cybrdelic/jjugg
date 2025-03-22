'use client';
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  PlusCircle, Grid3x3, ListFilter, SlidersHorizontal, Download, X, Clock,
  ArrowUp, ArrowDown, Calendar, User, Briefcase, CheckSquare, Users,
  Edit2, Trash2, ChevronRight, Plus, Minus, Search, Loader2
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import CardHeader from '../CardHeader';
import ApplicationCard from '../applications/ApplicationCard';
import KanbanColumn from '../applications/KanbanColumn';
import ActionButton from '../dashboard/ActionButton';
import ApplicationDetailDrawer from '../applications/ApplicationDetailDrawer';
import { applications as mockApplications, companies as mockCompanies } from '../../pages/data';
import { Application, ApplicationStage, InterviewEvent, StatusUpdate } from '../types';

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
    'company', 'position', 'dateApplied', 'stage', 'nextInterview', 'tasks', 'contacts', 'location', 'actions'
  ]);
  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState<boolean>(false);
  const [statusUpdates, setStatusUpdates] = useState<StatusUpdate[]>([]);
  const [visibleApplications, setVisibleApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const tableRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    console.log('Applications component mounted');
    setMounted(true);
    loadInitialApplications();
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
      target.closest('.actions') ||
      (isInputElement(e.target) && e.target.type === 'checkbox')
    ) {
      return;
    }
    handleOpenDetailModal(appId);
  };
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
                  {['company', 'position', 'dateApplied', 'stage', 'nextInterview', 'tasks', 'contacts', 'location', 'actions'].map(col => (
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
            <div className="dashboard-grid kanban-grid">
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
                    {visibleColumns.includes('nextInterview') && (
                      <div className="header-cell"><span>Next Interview</span></div>
                    )}
                    {visibleColumns.includes('tasks') && (
                      <div className="header-cell"><span>Tasks</span></div>
                    )}
                    {visibleColumns.includes('contacts') && (
                      <div className="header-cell"><span>Contacts</span></div>
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
                    {visibleColumns.includes('actions') && (
                      <div className="header-cell"><span>Actions</span></div>
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
                          className={`table-row ${selectedRows.includes(app.id) ? 'selected' : ''} ${mounted ? 'animate-in' : ''}`}
                          style={{ animationDelay: `${index * 0.05}s` }}
                          onClick={(e) => handleRowClick(app.id, e)}
                        >
                          <div className="status-updates">
                            {statusUpdates.filter(update => update.appId === app.id).map(update => (
                              <div key={update.id} className="status-bubble" role="status">{update.message}</div>
                            ))}
                          </div>
                          {visibleColumns.includes('company') && (
                            <div className="cell">
                              <input
                                type="checkbox"
                                checked={selectedRows.includes(app.id)}
                                onChange={() => handleRowSelect(app.id)}
                                onClick={e => e.stopPropagation()}
                              />
                              <span className="cell-value">{app.company.name}</span>
                            </div>
                          )}
                          {visibleColumns.includes('position') && (
                            <div className="cell">
                              <span className="cell-value">{app.position}</span>
                              <span className="cell-tooltip">{app.jobDescription.substring(0, 50)}...</span>
                            </div>
                          )}
                          {visibleColumns.includes('dateApplied') && (
                            <div className="cell">
                              <Calendar size={14} className="cell-icon" />
                              <span className="cell-value">{formatDate(app.dateApplied)}</span>
                            </div>
                          )}
                          {visibleColumns.includes('stage') && (
                            <div className="cell">
                              <span
                                className="stage-badge"
                                style={{ backgroundColor: getStageColor(app.stage) }}
                              >
                                {getStageLabel(app.stage)}
                              </span>
                              <div
                                className="progress-bar"
                                style={{
                                  width: `${calculateStageProgress(app.stage)}%`,
                                  backgroundColor: getStageColor(app.stage)
                                }}
                              />
                            </div>
                          )}
                          {visibleColumns.includes('nextInterview') && (
                            <div className="cell">
                              {getNextInterview(app.interviews) ? (
                                <>
                                  <Clock size={14} className="cell-icon" />
                                  <span className="cell-value">
                                    {formatDate(getNextInterview(app.interviews)!.date)}
                                  </span>
                                  <span className="cell-subvalue">
                                    {getNextInterview(app.interviews)!.type}
                                  </span>
                                </>
                              ) : (
                                <span className="cell-value muted">None</span>
                              )}
                            </div>
                          )}
                          {visibleColumns.includes('tasks') && (
                            <div className="cell">
                              <CheckSquare size={14} className="cell-icon" />
                              <span className="cell-value">
                                {(app.tasks || []).length} ({(app.tasks || []).filter(t => !t.completed).length} pending)
                              </span>
                            </div>
                          )}
                          {visibleColumns.includes('contacts') && (
                            <div className="cell">
                              <Users size={14} className="cell-icon" />
                              <div className="contacts-container">
                                {(app.contacts || []).slice(0, 2).map((contact, idx) => (
                                  <span
                                    key={contact.id}
                                    className="contact-avatar"
                                    style={{ zIndex: 2 - idx }}
                                  >
                                    {contact.name.charAt(0)}
                                  </span>
                                ))}
                                {(app.contacts || []).length > 2 && (
                                  <span className="contact-more">+{(app.contacts || []).length - 2}</span>
                                )}
                              </div>
                            </div>
                          )}
                          {visibleColumns.includes('location') && (
                            <div className="cell">
                              <Briefcase size={14} className="cell-icon" />
                              <span className="cell-value">{app.location}</span>
                              {app.remote && <span className="remote-tag">Remote</span>}
                            </div>
                          )}
                          {visibleColumns.includes('actions') && (
                            <div className="cell actions">
                              <button
                                className="action-btn"
                                onClick={(e) => { e.stopPropagation(); handleDecrementStage(app.id); }}
                                disabled={stagesOrder.indexOf(app.stage) === 0}
                              >
                                <Minus size={14} />
                              </button>
                              <button
                                className="action-btn"
                                onClick={(e) => { e.stopPropagation(); handleIncrementStage(app.id); }}
                                disabled={stagesOrder.indexOf(app.stage) === stagesOrder.length - 1}
                              >
                                <Plus size={14} />
                              </button>
                              <button
                                className="action-btn view"
                                onClick={(e) => { e.stopPropagation(); handleOpenDetailModal(app.id); }}
                              >
                                <ChevronRight size={14} />
                              </button>
                              <button
                                className="action-btn edit"
                                onClick={(e) => { e.stopPropagation(); handleEditApplication(app.id); }}
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                className="action-btn delete"
                                onClick={(e) => { e.stopPropagation(); handleDeleteApplication(app.id); }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
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

      <style jsx>{`
        .applications-home {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 16px;
          background: var(--background);
          border-radius: 8px;
          transition: all 0.3s ease;
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
        }

        .search-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px;
          background: var(--glass-bg);
          border: 1px solid var(--border-thin);
          border-radius: 6px;
        }

        .search-icon {
          color: var(--text-secondary);
        }

        .search-input {
          border: none;
          background: transparent;
          color: var(--text-primary);
          font-size: 14px;
          width: 200px;
          outline: none;
        }

        .filter-input {
          width: 100px;
          padding: 4px;
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
          display: flex;
          align-items: flex-start;
          padding: 10px 12px;
          border-bottom: 1px solid var(--border-divider);
          background: var(--glass-bg);
          position: sticky;
          top: 0;
          z-index: 9;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .header-cell {
          flex: 1;
          padding: 0 10px;
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
          display: flex;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid var(--border-divider);
          background: var(--glass-bg);
          transition: all 0.2s ease;
          position: relative;
          opacity: 0;
          transform: translateY(10px);
          cursor: pointer;
        }

        .table-row:last-child {
          border-bottom: none;
        }

        .table-row.animate-in {
          animation: rowEnter 0.4s ease-out forwards;
        }

        .table-row:hover {
          background: var(--hover-bg);
        }

        .table-row.selected {
          background: rgba(var(--accent-blue-rgb), 0.1);
          border-left: 2px solid var(--accent-blue);
          padding-left: 10px;
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
          flex: 1;
          padding: 0 10px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: var(--text-primary);
          position: relative;
          justify-content: flex-start;
          text-align: left;
        }

        .cell-icon {
          color: var(--text-tertiary);
          flex-shrink: 0;
        }

        .cell-value {
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .cell-subvalue {
          font-size: 12px;
          color: var(--text-tertiary);
          margin-left: 4px;
        }

        .cell-value.muted {
          color: var(--text-tertiary);
          font-style: italic;
        }

        .stage-badge {
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          color: white;
        }

        .progress-bar {
          height: 4px;
          border-radius: 2px;
          transition: width 0.5s ease-in-out;
          position: absolute;
          bottom: 0;
          left: 0;
          opacity: 0.8;
        }

        .remote-tag {
          margin-left: 6px;
          padding: 2px 6px;
          background: var(--accent-green);
          color: white;
          border-radius: 10px;
          font-size: 10px;
          font-weight: 600;
        }

        .contacts-container {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .contact-avatar {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--accent-purple);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 600;
          position: relative;
          margin-left: -8px;
          border: 1px solid var(--glass-bg);
        }

        .contact-avatar:first-child {
          margin-left: 0;
        }

        .contact-more {
          font-size: 12px;
          color: var(--text-tertiary);
          padding: 0 4px;
        }

        .actions {
          justify-content: flex-end;
          gap: 6px;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .table-row:hover .actions {
          opacity: 1;
        }

        .action-btn {
          width: 34px;
          height: 34px;
          border-radius: 6px;
          background: var(--glass-bg);
          border: 1px solid var(--border-thin);
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .action-btn:hover {
          background: var(--hover-bg);
          color: var(--text-primary);
        }

        .action-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .action-btn.view {
          background: rgba(var(--accent-blue-rgb), 0.1);
          color: var(--accent-blue);
        }

        .action-btn.edit {
          background: rgba(var(--accent-blue-rgb), 0.1);
          color: var(--accent-blue);
        }

        .action-btn.delete {
          background: rgba(var(--accent-red-rgb), 0.1);
          color: var(--accent-red);
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
