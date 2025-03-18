'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Search, PlusCircle, Filter, SlidersHorizontal, Download, 
  Grid3x3, ListFilter, MoreHorizontal, ChevronDown, CheckCircle2, X,
  ArrowUp, ArrowDown, ChevronLeft, ChevronRight, Copy, Edit, Trash2,
  ExternalLink, MoreVertical, Check, AlertCircle
} from 'lucide-react';
import CardHeader from '../CardHeader';

interface Company {
  id: string;
  name: string;
  logo: string;
  industry: string;
}

type ApplicationStage = 'applied' | 'screening' | 'interview' | 'offer' | 'rejected';

interface Application {
  id: string;
  position: string;
  company: Company;
  dateApplied: Date;
  stage: ApplicationStage;
  jobDescription: string;
  salary: string;
  location: string;
  remote: boolean;
  notes: string;
  contacts: { name: string; role: string; email: string }[];
}

// Helper function to format dates
const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
};

// Mock applications data - this would normally come from props or context
const companies: Company[] = [
  { id: 'c1', name: 'Google', logo: '/companies/google.svg', industry: 'Technology' },
  { id: 'c2', name: 'Microsoft', logo: '/companies/microsoft.svg', industry: 'Technology' },
  { id: 'c3', name: 'Apple', logo: '/companies/apple.svg', industry: 'Technology' },
  { id: 'c4', name: 'Amazon', logo: '/companies/amazon.svg', industry: 'E-commerce' },
  { id: 'c5', name: 'Facebook', logo: '/companies/facebook.svg', industry: 'Social Media' },
  { id: 'c6', name: 'Netflix', logo: '/companies/netflix.svg', industry: 'Entertainment' },
  { id: 'c7', name: 'Stripe', logo: '/companies/stripe.svg', industry: 'Fintech' },
  { id: 'c8', name: 'Airbnb', logo: '/companies/airbnb.svg', industry: 'Travel' },
  { id: 'c9', name: 'Uber', logo: '/companies/uber.svg', industry: 'Transportation' },
  { id: 'c10', name: 'Slack', logo: '/companies/slack.svg', industry: 'Technology' },
  { id: 'c11', name: 'Spotify', logo: '/companies/spotify.svg', industry: 'Music' },
  { id: 'c12', name: 'Adobe', logo: '/companies/adobe.svg', industry: 'Software' },
  { id: 'c13', name: 'Salesforce', logo: '/companies/salesforce.svg', industry: 'CRM' },
];

const applications: Application[] = [
  {
    id: 'app1',
    position: 'Senior Frontend Developer',
    company: companies[0],
    dateApplied: new Date(2023, 11, 10),
    stage: 'interview',
    jobDescription: 'Building and maintaining Google Maps web applications...',
    salary: '$140,000 - $180,000',
    location: 'Mountain View, CA',
    remote: false,
    notes: 'Had a great initial call with the recruiter',
    contacts: [{ name: 'Sarah Johnson', role: 'Recruiter', email: 'sarah.j@google.com' }],
  },
  {
    id: 'app2',
    position: 'Software Engineer',
    company: companies[1],
    dateApplied: new Date(2023, 11, 12),
    stage: 'screening',
    jobDescription: 'Developing features for Microsoft Azure...',
    salary: '$130,000 - $160,000',
    location: 'Redmond, WA',
    remote: true,
    notes: 'Submitted coding assessment',
    contacts: [],
  },
  {
    id: 'app3',
    position: 'iOS Developer',
    company: companies[2],
    dateApplied: new Date(2023, 11, 15),
    stage: 'applied',
    jobDescription: 'Creating innovative iOS applications...',
    salary: '$135,000 - $170,000',
    location: 'Cupertino, CA',
    remote: false,
    notes: 'Tailored resume for this role',
    contacts: [],
  },
  {
    id: 'app4',
    position: 'Cloud Engineer',
    company: companies[3],
    dateApplied: new Date(2023, 11, 18),
    stage: 'offer',
    jobDescription: 'Optimizing AWS infrastructure...',
    salary: '$145,000 - $190,000',
    location: 'Seattle, WA',
    remote: true,
    notes: 'Received offer, negotiating terms',
    contacts: [{ name: 'Mike Brown', role: 'Hiring Manager', email: 'mike.b@amazon.com' }],
  },
  {
    id: 'app5',
    position: 'Product Manager',
    company: companies[4],
    dateApplied: new Date(2023, 11, 20),
    stage: 'interview',
    jobDescription: 'Leading product strategy for Instagram...',
    salary: '$150,000 - $200,000',
    location: 'Menlo Park, CA',
    remote: false,
    notes: 'Preparing for behavioral interview',
    contacts: [],
  },
  {
    id: 'app6',
    position: 'Backend Engineer',
    company: companies[5],
    dateApplied: new Date(2023, 11, 22),
    stage: 'rejected',
    jobDescription: 'Scaling Netflix streaming services...',
    salary: '$140,000 - $180,000',
    location: 'Los Gatos, CA',
    remote: true,
    notes: 'Rejected after initial screening',
    contacts: [],
  },
  {
    id: 'app7',
    position: 'DevOps Engineer',
    company: companies[6],
    dateApplied: new Date(2023, 11, 23),
    stage: 'screening',
    jobDescription: 'Managing CI/CD pipelines at Stripe...',
    salary: '$130,000 - $165,000',
    location: 'San Francisco, CA',
    remote: true,
    notes: 'Technical phone screen scheduled',
    contacts: [],
  },
  {
    id: 'app8',
    position: 'Frontend Developer',
    company: companies[7],
    dateApplied: new Date(2023, 11, 24),
    stage: 'applied',
    jobDescription: 'Building Airbnb\'s booking platform...',
    salary: '$125,000 - $155,000',
    location: 'San Francisco, CA',
    remote: true,
    notes: 'Applied through referral',
    contacts: [{ name: 'Lisa Chen', role: 'Engineer', email: 'lisa.c@airbnb.com' }],
  },
];

// Get stage color
const getStageColor = (stage: ApplicationStage): string => {
  switch (stage) {
    case 'applied':
      return 'var(--accent-blue)';
    case 'screening':
      return 'var(--accent-purple)';
    case 'interview':
      return 'var(--accent-green)';
    case 'offer':
      return 'var(--accent-success)';
    case 'rejected':
      return 'var(--accent-red)';
    default:
      return 'var(--text-secondary)';
  }
};

// Get stage display name
const getStageLabel = (stage: ApplicationStage): string => {
  return stage.charAt(0).toUpperCase() + stage.slice(1);
};

export default function Applications() {
  const [searchTerm, setSearchTerm] = useState('');
  // Default to table view for better data presentation
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [filter, setFilter] = useState<ApplicationStage | 'all'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig] = useState<{column: keyof Application | 'company.name', direction: 'asc' | 'desc'}>({
    column: 'dateApplied',
    direction: 'desc'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [currentApplication, setCurrentApplication] = useState<Application | null>(null);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  
  const searchRef = useRef<HTMLInputElement>(null);

  // Filter applications based on search and stage filter
  const filteredApplications = applications.filter(app => {
    const matchesSearch = searchTerm === '' || 
      app.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === 'all' || app.stage === filter;
    
    return matchesSearch && matchesFilter;
  });

  // Sort applications
  const sortedApplications = useMemo(() => {
    const sortableApps = [...filteredApplications];
    
    return sortableApps.sort((a, b) => {
      if (sortConfig.column === 'company.name') {
        const valueA = a.company.name;
        const valueB = b.company.name;
        
        if (sortConfig.direction === 'asc') {
          return valueA.localeCompare(valueB);
        } else {
          return valueB.localeCompare(valueA);
        }
      } else {
        const valueA = a[sortConfig.column];
        const valueB = b[sortConfig.column];
        
        if (valueA instanceof Date && valueB instanceof Date) {
          if (sortConfig.direction === 'asc') {
            return valueA.getTime() - valueB.getTime();
          } else {
            return valueB.getTime() - valueA.getTime();
          }
        } else if (typeof valueA === 'string' && typeof valueB === 'string') {
          if (sortConfig.direction === 'asc') {
            return valueA.localeCompare(valueB);
          } else {
            return valueB.localeCompare(valueA);
          }
        }
        return 0;
      }
    });
  }, [filteredApplications, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(sortedApplications.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedApplications = sortedApplications.slice(startIndex, startIndex + rowsPerPage);

  // Group applications by stage for kanban view
  const applicationsByStage = {
    applied: filteredApplications.filter(app => app.stage === 'applied'),
    screening: filteredApplications.filter(app => app.stage === 'screening'),
    interview: filteredApplications.filter(app => app.stage === 'interview'),
    offer: filteredApplications.filter(app => app.stage === 'offer'),
    rejected: filteredApplications.filter(app => app.stage === 'rejected'),
  };

  // Handle sort
  const handleSort = (column: keyof Application | 'company.name') => {
    if (sortConfig.column === column) {
      setSortConfig({
        column, 
        direction: sortConfig.direction === 'asc' ? 'desc' : 'asc'
      });
    } else {
      setSortConfig({
        column,
        direction: 'asc'
      });
    }
  };

  // Handle row selection
  const toggleRowSelection = (id: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  // Handle bulk selection
  const toggleAllRows = () => {
    if (selectedRows.size === paginatedApplications.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(paginatedApplications.map(app => app.id)));
    }
  };

  // Handle detail view
  const openDetailView = (app: Application) => {
    setCurrentApplication(app);
    setIsDetailModalOpen(true);
  };

  // Toggle action menu
  const toggleActionMenu = (id: string) => {
    if (actionMenuOpen === id) {
      setActionMenuOpen(null);
    } else {
      setActionMenuOpen(id);
    }
  };

  // Focus search input when mounted
  useEffect(() => {
    if (searchRef.current) {
      searchRef.current.focus();
    }
  }, []);

  // Reset selection when filters or pagination change
  useEffect(() => {
    setSelectedRows(new Set());
  }, [searchTerm, filter, currentPage]);

  return (
    <section className="applications-section reveal-element">
      <CardHeader 
        title="Applications" 
        subtitle={`Track and manage your job applications (${applications.length})`}
        accentColor="var(--accent-purple)"
        variant="default"
      >
        <button 
          className="add-application-btn"
          onClick={() => setIsAddModalOpen(true)}
        >
          <PlusCircle size={18} />
          <span className="btn-text">Add New</span>
        </button>
      </CardHeader>

      <div className="applications-controls reveal-element">
        <div className="search-filter-container">
          <div className="search-container">
            <Search size={18} className="search-icon" />
            <input
              ref={searchRef}
              type="text"
              className="search-input"
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                className="clear-search" 
                onClick={() => setSearchTerm('')}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="filter-container">
            <button className="filter-btn">
              <Filter size={16} />
              <span>Filter</span>
              <ChevronDown size={14} />
            </button>
            
            <select 
              className="stage-filter" 
              value={filter}
              onChange={(e) => setFilter(e.target.value as ApplicationStage | 'all')}
            >
              <option value="all">All Stages</option>
              <option value="applied">Applied</option>
              <option value="screening">Screening</option>
              <option value="interview">Interview</option>
              <option value="offer">Offer</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="view-controls">
          <button 
            className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
            aria-label="Table view"
          >
            <ListFilter size={18} />
          </button>
          <button 
            className={`view-btn ${viewMode === 'kanban' ? 'active' : ''}`}
            onClick={() => setViewMode('kanban')}
            aria-label="Kanban view"
          >
            <Grid3x3 size={18} />
          </button>
        </div>
      </div>

      {viewMode === 'table' ? (
        <div className="applications-table-container reveal-element">
          <div className="table-actions">
            <div className="bulk-actions">
              {selectedRows.size > 0 && (
                <>
                  <span className="selected-count">{selectedRows.size} selected</span>
                  <div className="bulk-buttons">
                    <button className="bulk-btn" title="Update Stage">
                      <Edit size={16} />
                      <span>Update Stage</span>
                    </button>
                    <button className="bulk-btn" title="Export Selected">
                      <Download size={16} />
                      <span>Export</span>
                    </button>
                    <button className="bulk-btn danger" title="Delete Selected">
                      <Trash2 size={16} />
                      <span>Delete</span>
                    </button>
                  </div>
                </>
              )}
            </div>
            <div className="table-pagination">
              <div className="rows-per-page">
                <span>Rows per page:</span>
                <select 
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
              <div className="pagination-controls">
                <span className="pagination-info">
                  {startIndex + 1}-{Math.min(startIndex + rowsPerPage, sortedApplications.length)} of {sortedApplications.length}
                </span>
                <button 
                  className="pagination-btn" 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(1)}
                  title="First Page"
                >
                  <ChevronLeft size={14} />
                  <ChevronLeft size={14} style={{marginLeft: '-8px'}} />
                </button>
                <button 
                  className="pagination-btn" 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  title="Previous Page"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="page-number">Page {currentPage}</span>
                <button 
                  className="pagination-btn" 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  title="Next Page"
                >
                  <ChevronRight size={16} />
                </button>
                <button 
                  className="pagination-btn" 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                  title="Last Page"
                >
                  <ChevronRight size={14} />
                  <ChevronRight size={14} style={{marginLeft: '-8px'}} />
                </button>
              </div>
            </div>
          </div>
          <table className="applications-table">
            <thead>
              <tr>
                <th className="checkbox-cell">
                  <div className="checkbox-wrapper">
                    <input 
                      type="checkbox"
                      checked={selectedRows.size === paginatedApplications.length && paginatedApplications.length > 0}
                      onChange={toggleAllRows}
                      id="select-all"
                    />
                    <label htmlFor="select-all" className="checkbox-label">
                      <span className="checkbox-custom">
                        {selectedRows.size === paginatedApplications.length && paginatedApplications.length > 0 && (
                          <Check size={14} />
                        )}
                      </span>
                    </label>
                  </div>
                </th>
                <th 
                  className="sortable-header company-header"
                  onClick={() => handleSort('company.name')}
                >
                  <div className="header-content">
                    <span>Company</span>
                    <div className="sort-indicator">
                      {sortConfig.column === 'company.name' && (
                        sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                      )}
                    </div>
                  </div>
                </th>
                <th 
                  className="sortable-header"
                  onClick={() => handleSort('position')}
                >
                  <div className="header-content">
                    <span>Position</span>
                    <div className="sort-indicator">
                      {sortConfig.column === 'position' && (
                        sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                      )}
                    </div>
                  </div>
                </th>
                <th 
                  className="sortable-header"
                  onClick={() => handleSort('dateApplied')}
                >
                  <div className="header-content">
                    <span>Date Applied</span>
                    <div className="sort-indicator">
                      {sortConfig.column === 'dateApplied' && (
                        sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                      )}
                    </div>
                  </div>
                </th>
                <th 
                  className="sortable-header"
                  onClick={() => handleSort('location')}
                >
                  <div className="header-content">
                    <span>Location</span>
                    <div className="sort-indicator">
                      {sortConfig.column === 'location' && (
                        sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                      )}
                    </div>
                  </div>
                </th>
                <th 
                  className="sortable-header"
                  onClick={() => handleSort('stage')}
                >
                  <div className="header-content">
                    <span>Stage</span>
                    <div className="sort-indicator">
                      {sortConfig.column === 'stage' && (
                        sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                      )}
                    </div>
                  </div>
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedApplications.length > 0 ? (
                paginatedApplications.map(application => (
                  <tr 
                    key={application.id} 
                    className={`application-row ${selectedRows.has(application.id) ? 'selected-row' : ''}`}
                    onClick={() => openDetailView(application)}
                  >
                    <td className="checkbox-cell" onClick={(e) => {
                      e.stopPropagation();
                      toggleRowSelection(application.id);
                    }}>
                      <div className="checkbox-wrapper">
                        <input 
                          type="checkbox"
                          checked={selectedRows.has(application.id)}
                          onChange={() => toggleRowSelection(application.id)}
                          id={`select-${application.id}`}
                        />
                        <label htmlFor={`select-${application.id}`} className="checkbox-label">
                          <span className="checkbox-custom">
                            {selectedRows.has(application.id) && (
                              <Check size={14} />
                            )}
                          </span>
                        </label>
                      </div>
                    </td>
                    <td className="company-cell">
                      <div className="company-info">
                        <div className="company-logo-container">
                          <div className="company-logo-placeholder">{application.company.name.charAt(0)}</div>
                        </div>
                        <span className="company-name">{application.company.name}</span>
                      </div>
                    </td>
                    <td className="position-cell">
                      <div className="position-info">
                        <span className="position-title">{application.position}</span>
                        <span className="position-salary">{application.salary}</span>
                      </div>
                    </td>
                    <td className="date-cell">{formatDate(application.dateApplied)}</td>
                    <td className="location-cell">
                      <div className="location-display">
                        <span>{application.location}</span>
                        {application.remote && <span className="remote-badge">Remote</span>}
                      </div>
                    </td>
                    <td className="stage-cell">
                      <div 
                        className="stage-badge"
                        style={{ backgroundColor: `${getStageColor(application.stage)}10`, color: getStageColor(application.stage) }}
                      >
                        <span 
                          className="stage-indicator"
                          style={{ backgroundColor: getStageColor(application.stage) }}
                        ></span>
                        {getStageLabel(application.stage)}
                      </div>
                    </td>
                    <td className="actions-cell" onClick={(e) => e.stopPropagation()}>
                      <div className="actions-container">
                        <button 
                          className="action-btn"
                          onClick={() => toggleActionMenu(application.id)}
                        >
                          <MoreVertical size={16} />
                        </button>
                        
                        {actionMenuOpen === application.id && (
                          <div className="action-menu">
                            <button className="menu-item">
                              <Edit size={14} />
                              <span>Edit</span>
                            </button>
                            <button className="menu-item">
                              <ExternalLink size={14} />
                              <span>View Job</span>
                            </button>
                            <button className="menu-item">
                              <Copy size={14} />
                              <span>Duplicate</span>
                            </button>
                            <div className="menu-divider"></div>
                            <button className="menu-item danger">
                              <Trash2 size={14} />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="empty-state-row">
                  <td colSpan={7}>
                    <div className="empty-state">
                      <Search size={32} className="empty-icon" />
                      <p>No applications found matching your search</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="kanban-board reveal-element">
          <div className="kanban-container">
            {['applied', 'screening', 'interview', 'offer', 'rejected'].map((stage) => (
              <div key={stage} className="kanban-column">
                <div 
                  className="kanban-column-header"
                  style={{ borderColor: getStageColor(stage as ApplicationStage) }}
                >
                  <div className="column-title">
                    <span 
                      className="column-indicator"
                      style={{ backgroundColor: getStageColor(stage as ApplicationStage) }}
                    ></span>
                    <h3>{getStageLabel(stage as ApplicationStage)}</h3>
                  </div>
                  <div className="column-count">{applicationsByStage[stage as ApplicationStage].length}</div>
                </div>
                <div className="kanban-cards">
                  {applicationsByStage[stage as ApplicationStage].map(app => (
                    <div key={app.id} className="kanban-card">
                      <div className="card-header">
                        <div className="company-logo-placeholder">{app.company.name.charAt(0)}</div>
                        <div className="card-title-container">
                          <h4 className="card-title">{app.position}</h4>
                          <p className="card-subtitle">{app.company.name}</p>
                        </div>
                      </div>
                      <div className="card-details">
                        <div className="card-detail">
                          <span className="detail-label">Applied:</span>
                          <span className="detail-value">{formatDate(app.dateApplied)}</span>
                        </div>
                        <div className="card-detail">
                          <span className="detail-label">Location:</span>
                          <span className="detail-value">
                            {app.location}
                            {app.remote && <span className="remote-chip">Remote</span>}
                          </span>
                        </div>
                        {app.contacts.length > 0 && (
                          <div className="card-detail">
                            <span className="detail-label">Contact:</span>
                            <span className="detail-value">{app.contacts[0].name}</span>
                          </div>
                        )}
                      </div>
                      <div className="card-footer">
                        <div className="salary-info">{app.salary}</div>
                        <button className="card-more-btn">
                          <MoreHorizontal size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {applicationsByStage[stage as ApplicationStage].length === 0 && (
                    <div className="empty-column-card">
                      <p>No applications</p>
                    </div>
                  )}
                  
                  <button className="add-to-column-btn">
                    <PlusCircle size={16} />
                    <span>Add Application</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Application Detail Modal */}
      {isDetailModalOpen && currentApplication && (
        <div className="detail-modal-overlay" onClick={() => setIsDetailModalOpen(false)}>
          <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="detail-modal-header">
              <div className="detail-company-info">
                <div className="detail-company-logo">
                  <div className="company-logo-placeholder large">{currentApplication.company.name.charAt(0)}</div>
                </div>
                <div className="detail-title-container">
                  <h2 className="detail-title">{currentApplication.position}</h2>
                  <div className="detail-subtitle">
                    <span className="detail-company-name">{currentApplication.company.name}</span>
                    <span className="detail-separator">•</span>
                    <span className="detail-industry">{currentApplication.company.industry}</span>
                  </div>
                </div>
              </div>
              <div 
                className="detail-stage" 
                style={{ backgroundColor: `${getStageColor(currentApplication.stage)}15`, color: getStageColor(currentApplication.stage) }}
              >
                <span 
                  className="detail-stage-indicator"
                  style={{ backgroundColor: getStageColor(currentApplication.stage) }}
                ></span>
                {getStageLabel(currentApplication.stage)}
              </div>
              <button className="detail-close-btn" onClick={() => setIsDetailModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="detail-modal-content">
              <div className="detail-grid">
                <div className="detail-column">
                  <div className="detail-section">
                    <h3 className="detail-section-title">Application Details</h3>
                    <div className="detail-field">
                      <span className="detail-field-label">Date Applied</span>
                      <span className="detail-field-value">{formatDate(currentApplication.dateApplied)}</span>
                    </div>
                    <div className="detail-field">
                      <span className="detail-field-label">Location</span>
                      <div className="detail-field-value location-field">
                        <span>{currentApplication.location}</span>
                        {currentApplication.remote && <span className="detail-remote-badge">Remote</span>}
                      </div>
                    </div>
                    <div className="detail-field">
                      <span className="detail-field-label">Salary</span>
                      <span className="detail-field-value salary-value">{currentApplication.salary}</span>
                    </div>
                  </div>
                  
                  <div className="detail-section">
                    <h3 className="detail-section-title">Contacts</h3>
                    {currentApplication.contacts.length > 0 ? (
                      <div className="detail-contacts">
                        {currentApplication.contacts.map((contact, index) => (
                          <div key={index} className="detail-contact-card">
                            <div className="contact-avatar">{contact.name.charAt(0)}</div>
                            <div className="contact-info">
                              <div className="contact-name">{contact.name}</div>
                              <div className="contact-role">{contact.role}</div>
                              <a href={`mailto:${contact.email}`} className="contact-email">{contact.email}</a>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="detail-empty-section">
                        <p>No contacts added yet</p>
                        <button className="detail-add-btn">
                          <PlusCircle size={14} />
                          <span>Add Contact</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="detail-column">
                  <div className="detail-section">
                    <h3 className="detail-section-title">Job Description</h3>
                    <div className="detail-description">
                      <p>{currentApplication.jobDescription}</p>
                    </div>
                  </div>
                  
                  <div className="detail-section">
                    <h3 className="detail-section-title">Notes</h3>
                    <div className="detail-notes">
                      <p>{currentApplication.notes}</p>
                    </div>
                    <button className="detail-edit-btn">
                      <Edit size={14} />
                      <span>Edit Notes</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="detail-modal-footer">
              <div className="detail-footer-actions">
                <button className="detail-footer-btn primary">
                  <Check size={16} />
                  <span>Update Status</span>
                </button>
                <div className="detail-footer-secondary">
                  <button className="detail-footer-btn">
                    <Edit size={16} />
                    <span>Edit</span>
                  </button>
                  <button className="detail-footer-btn">
                    <Download size={16} />
                    <span>Export</span>
                  </button>
                  <button className="detail-footer-btn danger">
                    <Trash2 size={16} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .applications-section {
          display: flex;
          flex-direction: column;
          gap: 24px;
          position: relative;
          z-index: 1;
          padding: 0;
          min-height: 100%;
        }

        .applications-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .search-filter-container {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          flex: 1;
        }

        .search-container {
          position: relative;
          min-width: 300px;
          flex: 1;
        }

        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-tertiary);
        }

        .search-input {
          width: 100%;
          padding: 12px 12px 12px 40px;
          border-radius: var(--border-radius);
          border: 1px solid var(--border-thin);
          background: var(--glass-bg);
          color: var(--text-primary);
          font-size: 14px;
          transition: all 0.2s ease;
          box-shadow: var(--shadow-sharp);
        }

        .search-input:focus {
          border-color: var(--accent-purple);
          box-shadow: 0 0 0 2px rgba(var(--accent-purple-rgb), 0.1);
          outline: none;
        }

        .clear-search {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: var(--hover-bg);
          border: none;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-tertiary);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .clear-search:hover {
          background: var(--active-bg);
          color: var(--text-primary);
        }

        .filter-container {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .filter-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border-radius: var(--border-radius);
          border: 1px solid var(--border-thin);
          background: var(--glass-bg);
          color: var(--text-primary);
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: var(--shadow-sharp);
        }

        .filter-btn:hover {
          border-color: var(--accent-purple);
          box-shadow: 0 2px 6px rgba(var(--accent-purple-rgb), 0.15);
          transform: translateY(-1px);
        }

        .stage-filter {
          padding: 10px 16px;
          border-radius: var(--border-radius);
          border: 1px solid var(--border-thin);
          background: var(--glass-bg);
          color: var(--text-primary);
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: var(--shadow-sharp);
          -webkit-appearance: none;
          appearance: none;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24' stroke='currentColor' stroke-width='2' fill='none' stroke-linecap='round' stroke-linejoin='round' class='css-i6dzq1'%3e%3cpath d='M6 9l6 6 6-6'%3e%3c/path%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 10px center;
          background-size: 16px;
          padding-right: 30px;
        }

        .stage-filter:focus {
          border-color: var(--accent-purple);
          box-shadow: 0 0 0 2px rgba(var(--accent-purple-rgb), 0.1);
          outline: none;
        }

        .view-controls {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--glass-bg);
          border-radius: var(--border-radius);
          padding: 4px;
          border: 1px solid var(--border-thin);
          box-shadow: var(--shadow-sharp);
        }

        .view-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px;
          border-radius: var(--border-radius-sm);
          border: none;
          background: transparent;
          color: var(--text-tertiary);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .view-btn:hover {
          color: var(--text-primary);
          background: var(--hover-bg);
          transform: translateY(-1px);
        }

        .view-btn.active {
          background: var(--active-bg);
          color: var(--accent-purple);
        }

        /* Enhanced Table Styles */
        .applications-table-container {
          display: flex;
          flex-direction: column;
          border-radius: var(--border-radius);
          background: var(--glass-card-bg);
          box-shadow: var(--shadow);
          border: 1px solid var(--border-thin);
          overflow: hidden;
        }

        .table-actions {
          display: flex;
          justify-content: space-between;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-divider);
          background: var(--glass-header-bg);
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }

        .bulk-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .selected-count {
          font-weight: 500;
          font-size: 14px;
          color: var(--text-primary);
          background: var(--hover-bg);
          padding: 4px 12px;
          border-radius: 20px;
        }

        .bulk-buttons {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .bulk-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: var(--border-radius);
          background: var(--glass-bg);
          color: var(--text-primary);
          border: 1px solid var(--border-thin);
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .bulk-btn:hover {
          background: var(--hover-bg);
          border-color: var(--border-hover);
        }

        .bulk-btn.danger {
          color: var(--accent-red);
        }

        .bulk-btn.danger:hover {
          background: rgba(var(--accent-red-rgb), 0.1);
          border-color: rgba(var(--accent-red-rgb), 0.3);
        }

        .table-pagination {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .rows-per-page {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--text-secondary);
        }

        .rows-per-page select {
          padding: 5px 10px;
          border-radius: var(--border-radius);
          border: 1px solid var(--border-thin);
          background: var(--glass-bg);
          color: var(--text-primary);
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s ease;
          -webkit-appearance: none;
          appearance: none;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24' stroke='currentColor' stroke-width='2' fill='none' stroke-linecap='round' stroke-linejoin='round' class='css-i6dzq1'%3e%3cpath d='M6 9l6 6 6-6'%3e%3c/path%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 6px center;
          background-size: 12px;
          padding-right: 20px;
        }

        .pagination-controls {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .pagination-info {
          font-size: 13px;
          color: var(--text-secondary);
          margin-right: 8px;
        }

        .pagination-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: var(--border-radius-sm);
          border: 1px solid var(--border-thin);
          background: var(--glass-bg);
          color: var(--text-primary);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .pagination-btn:hover:not(:disabled) {
          background: var(--hover-bg);
          border-color: var(--border-hover);
        }

        .pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .page-number {
          font-size: 13px;
          color: var(--text-primary);
          font-weight: 500;
        }

        .applications-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }

        .applications-table th,
        .applications-table td {
          text-align: left;
          padding: 16px;
          border-bottom: 1px solid var(--border-divider);
        }

        .applications-table th {
          font-weight: 600;
          color: var(--text-secondary);
          background: var(--glass-header-bg);
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .checkbox-cell {
          width: 40px;
          padding-left: 16px;
          padding-right: 0;
        }

        .checkbox-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .checkbox-wrapper input[type="checkbox"] {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
        }

        .checkbox-label {
          display: flex;
          cursor: pointer;
        }

        .checkbox-custom {
          width: 18px;
          height: 18px;
          border-radius: 4px;
          border: 1px solid var(--border-thin);
          background: var(--glass-bg);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          color: white;
        }

        .checkbox-wrapper input[type="checkbox"]:checked + .checkbox-label .checkbox-custom {
          background-color: var(--accent-purple);
          border-color: var(--accent-purple);
        }

        .checkbox-wrapper input[type="checkbox"]:focus + .checkbox-label .checkbox-custom {
          box-shadow: 0 0 0 2px rgba(var(--accent-purple-rgb), 0.2);
        }

        .sortable-header {
          cursor: pointer;
          user-select: none;
          transition: background-color 0.2s ease;
        }

        .sortable-header:hover {
          background-color: var(--hover-bg);
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 8px;
          position: relative;
        }

        .sort-indicator {
          min-width: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-purple);
        }

        .application-row {
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .application-row:hover {
          background: var(--hover-bg);
        }

        .application-row.selected-row {
          background: rgba(var(--accent-purple-rgb), 0.05);
        }

        .application-row.selected-row:hover {
          background: rgba(var(--accent-purple-rgb), 0.08);
        }

        .application-row:last-child td {
          border-bottom: none;
        }

        .company-cell {
          min-width: 180px;
        }

        .position-cell {
          min-width: 200px;
        }

        .position-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .position-title {
          font-weight: 500;
        }

        .position-salary {
          font-size: 12px;
          color: var(--accent-green);
        }

        .company-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .company-logo-container {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          overflow: hidden;
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-purple));
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          color: white;
          font-size: 16px;
        }

        .company-name {
          font-weight: 500;
        }

        .date-cell {
          min-width: 120px;
          color: var(--text-secondary);
        }

        .location-cell {
          min-width: 200px;
        }

        .location-display {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .remote-badge {
          font-size: 12px;
          padding: 2px 6px;
          border-radius: 4px;
          background: rgba(var(--accent-blue-rgb), 0.1);
          color: var(--accent-blue);
        }

        .stage-cell {
          min-width: 120px;
        }

        .stage-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 500;
        }

        .stage-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .actions-cell {
          width: 60px;
        }

        .actions-container {
          position: relative;
        }

        .action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: none;
          background: transparent;
          color: var(--text-tertiary);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .action-btn:hover {
          background: var(--active-bg);
          color: var(--text-primary);
        }

        .action-menu {
          position: absolute;
          top: 100%;
          right: 0;
          min-width: 160px;
          background: var(--glass-card-bg);
          border-radius: var(--border-radius);
          box-shadow: var(--shadow);
          border: 1px solid var(--border-thin);
          z-index: 100;
          overflow: hidden;
        }

        .menu-item {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 10px 14px;
          border: none;
          background: transparent;
          text-align: left;
          font-size: 13px;
          color: var(--text-primary);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .menu-item:hover {
          background: var(--hover-bg);
        }

        .menu-item.danger {
          color: var(--accent-red);
        }

        .menu-item.danger:hover {
          background: rgba(var(--accent-red-rgb), 0.1);
        }

        .menu-divider {
          height: 1px;
          background: var(--border-divider);
          margin: 4px 0;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px;
          color: var(--text-tertiary);
          gap: 16px;
        }

        .empty-icon {
          opacity: 0.5;
        }

        /* Kanban Board Styles */
        .kanban-board {
          overflow-x: auto;
          padding-bottom: 16px;
        }

        .kanban-container {
          display: flex;
          gap: 20px;
          min-width: min-content;
        }

        .kanban-column {
          width: 300px;
          min-width: 300px;
          background: var(--glass-card-bg);
          border-radius: var(--border-radius);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border: 1px solid var(--border-thin);
          box-shadow: var(--shadow);
          max-height: calc(100vh - 260px);
        }

        .kanban-column-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: var(--glass-header-bg);
          border-bottom: 1px solid var(--border-divider);
          border-top: 3px solid;
        }

        .column-title {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .column-indicator {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .column-title h3 {
          font-weight: 600;
          font-size: 16px;
        }

        .column-count {
          background: var(--hover-bg);
          color: var(--text-secondary);
          font-size: 13px;
          font-weight: 500;
          padding: 2px 8px;
          border-radius: 20px;
          min-width: 24px;
          text-align: center;
        }

        .kanban-cards {
          padding: 16px;
          overflow-y: auto;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .kanban-card {
          background: var(--card-bg);
          border-radius: var(--border-radius);
          padding: 16px;
          border: 1px solid var(--border-thin);
          transition: all 0.2s ease;
          box-shadow: var(--shadow-sharp);
          cursor: pointer;
        }

        .kanban-card:hover {
          border-color: var(--border-hover);
          transform: translateY(-2px);
          box-shadow: var(--shadow);
        }

        .card-header {
          display: flex;
          gap: 12px;
          margin-bottom: 12px;
        }

        .card-title-container {
          overflow: hidden;
        }

        .card-title {
          margin: 0 0 4px 0;
          font-weight: 600;
          font-size: 15px;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .card-subtitle {
          margin: 0;
          color: var(--text-secondary);
          font-size: 13px;
        }

        .card-details {
          margin-bottom: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .card-detail {
          display: flex;
          font-size: 13px;
          line-height: 1.4;
        }

        .detail-label {
          min-width: 70px;
          color: var(--text-tertiary);
        }

        .detail-value {
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .remote-chip {
          font-size: 11px;
          padding: 1px 5px;
          border-radius: 3px;
          background: rgba(var(--accent-blue-rgb), 0.1);
          color: var(--accent-blue);
          height: 18px;
        }

        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid var(--border-divider);
          padding-top: 12px;
        }

        .salary-info {
          font-size: 13px;
          color: var(--accent-green);
          font-weight: 500;
        }

        .card-more-btn {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          color: var(--text-tertiary);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .card-more-btn:hover {
          background: var(--hover-bg);
          color: var(--text-primary);
        }

        .empty-column-card {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          border: 1px dashed var(--border-divider);
          border-radius: var(--border-radius);
          color: var(--text-tertiary);
          font-size: 14px;
        }

        .add-to-column-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px;
          border-radius: var(--border-radius);
          border: 1px dashed var(--border-divider);
          background: var(--hover-bg);
          color: var(--text-secondary);
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: 8px;
        }

        .add-to-column-btn:hover {
          background: var(--active-bg);
          color: var(--text-primary);
          border-color: var(--border-hover);
        }

        .add-application-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: var(--border-radius);
          background: var(--accent-purple);
          color: white;
          border: none;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 6px rgba(var(--accent-purple-rgb), 0.25);
        }

        .add-application-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(var(--accent-purple-rgb), 0.3);
        }

        /* Detail Modal Styles */
        .detail-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .detail-modal {
          width: 900px;
          max-width: 95%;
          max-height: 90vh;
          background: var(--glass-card-bg);
          border-radius: var(--border-radius);
          border: 1px solid var(--border-thin);
          box-shadow: var(--shadow);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .detail-modal-header {
          padding: 24px;
          border-bottom: 1px solid var(--border-divider);
          background: var(--glass-header-bg);
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          position: relative;
        }

        .detail-company-info {
          display: flex;
          gap: 16px;
          align-items: center;
          flex: 1;
        }

        .detail-company-logo {
          width: 64px;
          height: 64px;
        }

        .company-logo-placeholder.large {
          width: 64px;
          height: 64px;
          border-radius: 12px;
          font-size: 28px;
        }

        .detail-title-container {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .detail-title {
          margin: 0;
          font-size: 22px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .detail-subtitle {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-secondary);
          font-size: 15px;
        }

        .detail-company-name {
          font-weight: 500;
        }

        .detail-separator {
          opacity: 0.5;
        }

        .detail-stage {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 500;
          margin-left: 16px;
        }

        .detail-stage-indicator {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .detail-close-btn {
          position: absolute;
          top: 18px;
          right: 18px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--hover-bg);
          border: 1px solid var(--border-thin);
          color: var(--text-tertiary);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .detail-close-btn:hover {
          background: var(--active-bg);
          color: var(--text-primary);
        }

        .detail-modal-content {
          padding: 24px;
          overflow-y: auto;
          flex: 1;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .detail-column {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .detail-section {
          background: var(--card-bg);
          border-radius: var(--border-radius);
          border: 1px solid var(--border-thin);
          padding: 20px;
        }

        .detail-section-title {
          margin: 0 0 16px 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .detail-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 16px;
        }

        .detail-field:last-child {
          margin-bottom: 0;
        }

        .detail-field-label {
          font-size: 13px;
          color: var(--text-tertiary);
        }

        .detail-field-value {
          font-size: 15px;
          color: var(--text-primary);
        }

        .location-field {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .detail-remote-badge {
          font-size: 12px;
          padding: 3px 8px;
          border-radius: 4px;
          background: rgba(var(--accent-blue-rgb), 0.1);
          color: var(--accent-blue);
        }

        .salary-value {
          color: var(--accent-green);
          font-weight: 500;
        }

        .detail-contacts {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .detail-contact-card {
          display: flex;
          gap: 12px;
          padding: 12px;
          border-radius: var(--border-radius);
          background: var(--hover-bg);
          border: 1px solid var(--border-thin);
        }

        .contact-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-green));
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 16px;
        }

        .contact-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .contact-name {
          font-weight: 500;
          font-size: 14px;
        }

        .contact-role {
          font-size: 12px;
          color: var(--text-secondary);
        }

        .contact-email {
          font-size: 12px;
          color: var(--accent-blue);
          text-decoration: none;
          margin-top: 4px;
        }

        .contact-email:hover {
          text-decoration: underline;
        }

        .detail-empty-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 24px;
          color: var(--text-tertiary);
        }

        .detail-add-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: var(--border-radius);
          background: var(--hover-bg);
          border: 1px solid var(--border-thin);
          color: var(--text-secondary);
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .detail-add-btn:hover {
          background: var(--active-bg);
          color: var(--text-primary);
          border-color: var(--border-hover);
        }

        .detail-description, .detail-notes {
          color: var(--text-primary);
          font-size: 14px;
          line-height: 1.6;
        }

        .detail-description p, .detail-notes p {
          margin: 0 0 16px 0;
        }

        .detail-description p:last-child, .detail-notes p:last-child {
          margin-bottom: 0;
        }

        .detail-edit-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: var(--border-radius);
          background: var(--hover-bg);
          border: 1px solid var(--border-thin);
          color: var(--text-secondary);
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: 16px;
          align-self: flex-start;
        }

        .detail-edit-btn:hover {
          background: var(--active-bg);
          color: var(--text-primary);
          border-color: var(--border-hover);
        }

        .detail-modal-footer {
          padding: 16px 24px;
          border-top: 1px solid var(--border-divider);
          background: var(--glass-header-bg);
        }

        .detail-footer-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .detail-footer-secondary {
          display: flex;
          gap: 8px;
        }

        .detail-footer-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: var(--border-radius);
          background: var(--hover-bg);
          border: 1px solid var(--border-thin);
          color: var(--text-primary);
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .detail-footer-btn:hover {
          background: var(--active-bg);
          border-color: var(--border-hover);
        }

        .detail-footer-btn.primary {
          background: var(--accent-purple);
          color: white;
          border-color: var(--accent-purple);
        }

        .detail-footer-btn.primary:hover {
          background: var(--accent-purple-hover);
          box-shadow: 0 2px 6px rgba(var(--accent-purple-rgb), 0.3);
        }

        .detail-footer-btn.danger {
          color: var(--accent-red);
        }

        .detail-footer-btn.danger:hover {
          background: rgba(var(--accent-red-rgb), 0.1);
          border-color: rgba(var(--accent-red-rgb), 0.3);
        }

        @media (max-width: 768px) {
          .applications-controls {
            flex-direction: column;
            align-items: stretch;
          }

          .search-filter-container {
            flex-direction: column;
            width: 100%;
          }

          .search-container {
            width: 100%;
            min-width: auto;
          }

          .filter-container {
            width: 100%;
            justify-content: space-between;
          }

          .filter-btn, .stage-filter {
            flex: 1;
          }

          .view-controls {
            align-self: flex-end;
          }

          .detail-grid {
            grid-template-columns: 1fr;
          }

          .table-actions {
            flex-direction: column;
            align-items: flex-start;
          }

          .bulk-actions {
            flex-direction: column;
            align-items: flex-start;
            width: 100%;
          }

          .bulk-buttons {
            width: 100%;
          }

          .table-pagination {
            width: 100%;
            justify-content: space-between;
          }
        }
      `}</style>
    </section>
  );
}