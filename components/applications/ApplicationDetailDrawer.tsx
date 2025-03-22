'use client';

import React, { useState } from 'react';
import {
  X, Clock, Building, MapPin, DollarSign, Briefcase,
  CalendarDays, Phone, Mail, Link, ChevronLeft, ChevronRight,
  Calendar, CheckCircle, XCircle, MessageSquare, Globe, Edit,
  FileText, Paperclip, Share2, Star, MoreHorizontal, User,
  ExternalLink, Download
} from 'lucide-react';
import ActionButton from '../dashboard/ActionButton';
import SideDrawer from '../SideDrawer';
import { ApplicationStage, Company, Contact, InterviewEvent, Note, Task, Document } from '../types';


interface ApplicationDetailDrawerProps {
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
  contacts: Contact[];
  interviews?: InterviewEvent[];
  tasks?: Task[];
  documents?: Document[];
  allNotes?: Note[];
  isVisible: boolean;
  onClose: () => void;
  onEdit: () => void;
  onStageChange: (stage: ApplicationStage) => void;
}

const ApplicationDetailDrawer: React.FC<ApplicationDetailDrawerProps> = ({
  id,
  position,
  company,
  dateApplied,
  stage,
  jobDescription,
  salary,
  location,
  remote,
  notes,
  contacts,
  interviews = [],
  tasks = [],
  documents = [],
  allNotes = [],
  isVisible,
  onClose,
  onEdit,
  onStageChange
}) => {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'timeline' | 'contacts' | 'documents' | 'notes'>('overview');

  // Format date
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  // Format time
  const formatTime = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  // Format duration
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins > 0 ? ` ${mins}m` : ''}`;
  };

  // Get stage color
  const getStageColor = (stage: ApplicationStage): string => {
    switch (stage) {
      case 'applied': return 'var(--accent-blue)';
      case 'screening': return 'var(--accent-purple)';
      case 'interview': return 'var(--accent-green)';
      case 'offer': return 'var(--accent-success)';
      case 'rejected': return 'var(--accent-red)';
      default: return 'var(--text-secondary)';
    }
  };

  // Get stage display name
  const getStageLabel = (stage: ApplicationStage): string => {
    return stage.charAt(0).toUpperCase() + stage.slice(1);
  };

  // Calculate days since application
  const daysSinceApplied = Math.floor((new Date().getTime() - dateApplied.getTime()) / (1000 * 3600 * 24));

  // Sort interviews by date
  const sortedInterviews = [...interviews].sort((a, b) => a.date.getTime() - b.date.getTime());

  // Filter upcoming and past interviews
  const upcomingInterviews = sortedInterviews.filter(interview =>
    interview.date.getTime() > new Date().getTime()
  );

  const pastInterviews = sortedInterviews.filter(interview =>
    interview.date.getTime() <= new Date().getTime()
  );

  // Sort tasks by due date and priority
  const sortedTasks = [...tasks].sort((a, b) => {
    // First by completion status
    if (a.completed && !b.completed) return 1;
    if (!a.completed && b.completed) return -1;

    // Then by due date (if available)
    if (a.dueDate && b.dueDate) {
      return a.dueDate.getTime() - b.dueDate.getTime();
    }

    // Then by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  // Sort notes by date
  const sortedNotes = [...allNotes].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <SideDrawer
      isVisible={isVisible}
      onClose={onClose}
      position="right"
      width="1200px"
    >
      <div className="application-detail">
        <header className="drawer-header">
          <div
            className="stage-indicator"
            style={{ backgroundColor: getStageColor(stage) }}
          />

          <div className="header-content">
            <div className="company-logo">
              {company.logo ? (
                <img src={company.logo} alt={company.name} />
              ) : (
                company.name.charAt(0)
              )}
            </div>

            <div className="header-titles">
              <h2 className="position-title">{position}</h2>
              <div className="company-name">
                <Building size={16} />
                <span>{company.name}</span>
              </div>
            </div>

            <div className="stage-badge" style={{ color: getStageColor(stage) }}>
              <div
                className="badge-dot"
                style={{ backgroundColor: getStageColor(stage) }}
              />
              <span>{getStageLabel(stage)}</span>
            </div>
          </div>
        </header>

        <nav className="drawer-nav">
          <button
            className={`nav-item ${selectedTab === 'overview' ? 'active' : ''}`}
            onClick={() => setSelectedTab('overview')}
          >
            <span>Overview</span>
          </button>
          <button
            className={`nav-item ${selectedTab === 'timeline' ? 'active' : ''}`}
            onClick={() => setSelectedTab('timeline')}
          >
            <span>Timeline</span>
            {interviews.length > 0 && <span className="nav-badge">{interviews.length}</span>}
          </button>
          <button
            className={`nav-item ${selectedTab === 'contacts' ? 'active' : ''}`}
            onClick={() => setSelectedTab('contacts')}
          >
            <span>Contacts</span>
            {contacts.length > 0 && <span className="nav-badge">{contacts.length}</span>}
          </button>
          <button
            className={`nav-item ${selectedTab === 'documents' ? 'active' : ''}`}
            onClick={() => setSelectedTab('documents')}
          >
            <span>Documents</span>
            {documents.length > 0 && <span className="nav-badge">{documents.length}</span>}
          </button>
          <button
            className={`nav-item ${selectedTab === 'notes' ? 'active' : ''}`}
            onClick={() => setSelectedTab('notes')}
          >
            <span>Notes</span>
            {allNotes.length > 0 && <span className="nav-badge">{allNotes.length}</span>}
          </button>
        </nav>

        <div className="drawer-content">
          {/* Overview Tab */}
          {selectedTab === 'overview' && (
            <div className="overview-tab">
              <div className="content-grid">
                <div className="main-column">
                  <section className="content-section">
                    <h3 className="section-title">Job Details</h3>

                    <div className="detail-list">
                      <div className="detail-item">
                        <div className="detail-icon">
                          <CalendarDays size={18} />
                        </div>
                        <div className="detail-content">
                          <div className="detail-label">Date Applied</div>
                          <div className="detail-value">
                            {formatDate(dateApplied)}
                            <span className="detail-meta">{daysSinceApplied} days ago</span>
                          </div>
                        </div>
                      </div>

                      <div className="detail-item">
                        <div className="detail-icon">
                          <MapPin size={18} />
                        </div>
                        <div className="detail-content">
                          <div className="detail-label">Location</div>
                          <div className="detail-value">
                            {location}
                            {remote && <span className="remote-badge">Remote</span>}
                          </div>
                        </div>
                      </div>

                      <div className="detail-item">
                        <div className="detail-icon">
                          <DollarSign size={18} />
                        </div>
                        <div className="detail-content">
                          <div className="detail-label">Salary</div>
                          <div className="detail-value">{salary}</div>
                        </div>
                      </div>

                      <div className="detail-item">
                        <div className="detail-icon">
                          <Globe size={18} />
                        </div>
                        <div className="detail-content">
                          <div className="detail-label">Company Website</div>
                          <div className="detail-value company-link">
                            <a href={company.website || '#'} target="_blank" rel="noreferrer">
                              {company.website || '(not available)'}
                              {company.website && <ExternalLink size={14} />}
                            </a>
                          </div>
                        </div>
                      </div>

                      {company.industry && (
                        <div className="detail-item">
                          <div className="detail-icon">
                            <Briefcase size={18} />
                          </div>
                          <div className="detail-content">
                            <div className="detail-label">Industry</div>
                            <div className="detail-value">{company.industry}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </section>

                  <section className="content-section job-description">
                    <h3 className="section-title">Job Description</h3>
                    <div className="description-content">
                      <p>{jobDescription}</p>
                    </div>
                  </section>

                  {notes && (
                    <section className="content-section">
                      <h3 className="section-title">Notes</h3>
                      <div className="notes-content">
                        <p>{notes}</p>
                      </div>
                    </section>
                  )}
                </div>

                <div className="side-column">
                  <section className="content-section">
                    <h3 className="section-title">Status</h3>

                    <div className="stage-selector">
                      {(['applied', 'screening', 'interview', 'offer', 'rejected'] as ApplicationStage[]).map(s => (
                        <button
                          key={s}
                          className={`stage-option ${s === stage ? 'active' : ''}`}
                          onClick={() => onStageChange(s)}
                          style={{
                            '--option-color': getStageColor(s)
                          } as React.CSSProperties}
                        >
                          <div className="option-indicator"></div>
                          <span>{getStageLabel(s)}</span>
                        </button>
                      ))}
                    </div>
                  </section>

                  {upcomingInterviews.length > 0 && (
                    <section className="content-section">
                      <h3 className="section-title">Next Interview</h3>
                      <div className="next-interview">
                        <div className="interview-date">
                          <CalendarDays size={16} />
                          <span>{formatDate(upcomingInterviews[0].date)}</span>
                        </div>
                        <div className="interview-time">
                          <Clock size={16} />
                          <span>{formatTime(upcomingInterviews[0].date)} ({formatDuration(upcomingInterviews[0].duration)})</span>
                        </div>
                        <div className="interview-type">
                          <span className="type-badge">{upcomingInterviews[0].type}</span>
                        </div>
                        {upcomingInterviews[0].with && (
                          <div className="interview-with">
                            <User size={16} />
                            <span>{upcomingInterviews[0].with}</span>
                          </div>
                        )}
                      </div>
                    </section>
                  )}

                  {tasks.length > 0 && (
                    <section className="content-section">
                      <h3 className="section-title">Tasks</h3>
                      <div className="tasks-list">
                        {sortedTasks.map(task => (
                          <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                            <div className="task-checkbox">
                              {task.completed ? (
                                <CheckCircle size={16} />
                              ) : (
                                <div className="checkbox-empty" />
                              )}
                            </div>
                            <div className="task-content">
                              <div className="task-title">{task.title}</div>
                              {task.dueDate && (
                                <div className="task-due">
                                  <Calendar size={12} />
                                  <span>{formatDate(task.dueDate)}</span>
                                </div>
                              )}
                            </div>
                            <div className={`priority-indicator ${task.priority}`} />
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {contacts.length > 0 && (
                    <section className="content-section">
                      <h3 className="section-title">Key Contact</h3>
                      <div className="key-contact">
                        <div className="contact-name">{contacts[0].name}</div>
                        <div className="contact-role">{contacts[0].role}</div>
                        <div className="contact-email">
                          <Mail size={14} />
                          <a href={`mailto:${contacts[0].email}`}>{contacts[0].email}</a>
                        </div>
                        {contacts[0].phone && (
                          <div className="contact-phone">
                            <Phone size={14} />
                            <a href={`tel:${contacts[0].phone}`}>{contacts[0].phone}</a>
                          </div>
                        )}
                      </div>
                    </section>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Timeline Tab */}
          {selectedTab === 'timeline' && (
            <div className="timeline-tab">
              <div className="timeline-header">
                <h3>Application Timeline</h3>
                <div className="timeline-actions">
                  <ActionButton
                    label="Add Event"
                    icon={Calendar}
                    variant="secondary"
                    onClick={() => console.log('Add new timeline event')}
                  />
                </div>
              </div>

              <div className="timeline">
                {/* Application Start */}
                <div className="timeline-event application-event">
                  <div className="event-icon">
                    <FileText size={18} />
                  </div>
                  <div className="event-content">
                    <div className="event-title">Applied for {position}</div>
                    <div className="event-meta">
                      <span className="event-date">{formatDate(dateApplied)}</span>
                      <span className="event-time">{formatTime(dateApplied)}</span>
                    </div>
                    <div className="event-description">
                      <p>Application submitted for {position} at {company.name}</p>
                    </div>
                  </div>
                </div>

                {/* Interviews */}
                {sortedInterviews.map(interview => (
                  <div
                    key={interview.id}
                    className={`timeline-event interview-event ${interview.completed ? 'completed' : 'upcoming'}`}
                  >
                    <div className="event-icon">
                      {interview.completed ? (
                        interview.type === 'phone' ? (
                          <Phone size={18} />
                        ) : (
                          <MessageSquare size={18} />
                        )
                      ) : (
                        <Calendar size={18} />
                      )}
                    </div>
                    <div className="event-content">
                      <div className="event-title">
                        {interview.type.charAt(0).toUpperCase() + interview.type.slice(1)} Interview
                        {interview.with && ` with ${interview.with}`}
                      </div>
                      <div className="event-meta">
                        <span className="event-date">{formatDate(interview.date)}</span>
                        <span className="event-time">{formatTime(interview.date)}</span>
                        <span className="event-duration">{formatDuration(interview.duration)}</span>
                      </div>
                      {interview.notes && (
                        <div className="event-description">
                          <p>{interview.notes}</p>
                        </div>
                      )}
                      {interview.feedback && (
                        <div className="interview-feedback">
                          <div className="feedback-label">Feedback</div>
                          <p>{interview.feedback}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Stage change events (placeholder) */}
                <div className="timeline-event stage-event">
                  <div className="event-icon">
                    <CheckCircle size={18} />
                  </div>
                  <div className="event-content">
                    <div className="event-title">Moved to {getStageLabel(stage)}</div>
                    <div className="event-meta">
                      <span className="event-date">{formatDate(new Date(dateApplied.getTime() + 86400000 * 5))}</span>
                    </div>
                    <div className="event-description">
                      <p>Application advanced to {getStageLabel(stage)} stage</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Contacts Tab */}
          {selectedTab === 'contacts' && (
            <div className="contacts-tab">
              <div className="contacts-header">
                <h3>Company Contacts</h3>
                <div className="contacts-actions">
                  <ActionButton
                    label="Add Contact"
                    icon={User}
                    variant="secondary"
                    onClick={() => console.log('Add new contact')}
                  />
                </div>
              </div>

              <div className="contacts-list">
                {contacts.map(contact => (
                  <div key={contact.id} className="contact-card">
                    <div className="contact-avatar">
                      {contact.name.charAt(0)}
                    </div>
                    <div className="contact-details">
                      <div className="contact-name">{contact.name}</div>
                      <div className="contact-role">{contact.role}</div>
                      <div className="contact-actions">
                        <button className="action-icon" title="Send Email">
                          <Mail size={16} />
                        </button>
                        {contact.phone && (
                          <button className="action-icon" title="Call">
                            <Phone size={16} />
                          </button>
                        )}
                        {contact.linkedin && (
                          <button className="action-icon" title="View LinkedIn">
                            <Link size={16} />
                          </button>
                        )}
                        <button className="action-icon" title="More Options">
                          <MoreHorizontal size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {contacts.length === 0 && (
                  <div className="empty-state">
                    <div className="empty-icon">
                      <User size={40} />
                    </div>
                    <p>No contacts added yet</p>
                    <button className="add-new-btn">
                      Add a Contact
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Documents Tab */}
          {selectedTab === 'documents' && (
            <div className="documents-tab">
              <div className="documents-header">
                <h3>Application Documents</h3>
                <div className="documents-actions">
                  <ActionButton
                    label="Upload Document"
                    icon={Paperclip}
                    variant="secondary"
                    onClick={() => console.log('Upload new document')}
                  />
                </div>
              </div>

              <div className="documents-list">
                {documents.map(doc => (
                  <div key={doc.id} className="document-card">
                    <div className="document-icon">
                      <FileText size={24} />
                    </div>
                    <div className="document-details">
                      <div className="document-name">{doc.name}</div>
                      <div className="document-meta">
                        <span className="document-type">{doc.type}</span>
                        <span className="document-date">{formatDate(doc.createdAt)}</span>
                      </div>
                      <div className="document-actions">
                        <button className="action-icon" title="Download">
                          <Download size={16} />
                        </button>
                        <button className="action-icon" title="Share">
                          <Share2 size={16} />
                        </button>
                        <button className="action-icon" title="More Options">
                          <MoreHorizontal size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {documents.length === 0 && (
                  <div className="empty-state">
                    <div className="empty-icon">
                      <FileText size={40} />
                    </div>
                    <p>No documents uploaded yet</p>
                    <button className="add-new-btn">
                      Upload a Document
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes Tab */}
          {selectedTab === 'notes' && (
            <div className="notes-tab">
              <div className="notes-header">
                <h3>Application Notes</h3>
                <div className="notes-actions">
                  <ActionButton
                    label="Add Note"
                    icon={MessageSquare}
                    variant="secondary"
                    onClick={() => console.log('Add new note')}
                  />
                </div>
              </div>

              <div className="notes-list">
                {sortedNotes.map(note => (
                  <div key={note.id} className="note-card">
                    <div className="note-meta">
                      <div className="note-date">{formatDate(note.createdAt)}</div>
                      {note.type && (
                        <div className="note-type">{note.type}</div>
                      )}
                    </div>
                    <div className="note-content">
                      <p>{note.content}</p>
                    </div>
                    <div className="note-actions">
                      <button className="action-icon" title="Edit">
                        <Edit size={16} />
                      </button>
                      <button className="action-icon" title="More Options">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </div>
                ))}

                {allNotes.length === 0 && (
                  <div className="empty-state">
                    <div className="empty-icon">
                      <MessageSquare size={40} />
                    </div>
                    <p>No notes added yet</p>
                    <button className="add-new-btn">
                      Add a Note
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <footer className="drawer-footer">
          <div className="footer-info">
            <div className="application-id">
              <span>Application ID: {id}</span>
            </div>
          </div>
          <div className="footer-actions">
            <button
              className="action-btn edit-btn"
              onClick={onEdit}
            >
              <Edit size={16} />
              <span>Edit Application</span>
            </button>
          </div>
        </footer>
      </div>

      <style jsx>{`
        .application-detail {
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
        }

        /* Header Styles */
        .drawer-header {
          display: flex;
          position: relative;
          padding: 16px 24px;
          border-bottom: 1px solid var(--border-divider);
        }

        .stage-indicator {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 16px;
          flex: 1;
          padding-top: 8px;
        }

        .company-logo {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 24px;
          overflow: hidden;
        }

        .company-logo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .header-titles {
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .position-title {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .company-name {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--text-secondary);
          font-size: 15px;
          margin-top: 4px;
        }

        .stage-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background-color: rgba(var(--accent-primary-rgb), 0.08);
          border-radius: 20px;
          font-size: 14px;
          font-weight: 500;
        }

        .badge-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        /* Nav Styles */
        .drawer-nav {
          display: flex;
          gap: 4px;
          padding: 0 24px;
          border-bottom: 1px solid var(--border-divider);
        }

        .nav-item {
          padding: 12px 16px;
          background: transparent;
          border: none;
          font-size: 14px;
          color: var(--text-secondary);
          cursor: pointer;
          position: relative;
          font-weight: 500;
          transition: all 0.2s var(--easing-standard);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .nav-item:hover {
          color: var(--text-primary);
        }

        .nav-item.active {
          color: var(--accent-primary);
        }

        .nav-item.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 100%;
          height: 2px;
          background-color: var(--accent-primary);
          border-radius: 2px 2px 0 0;
        }

        .nav-badge {
          padding: 2px 6px;
          background-color: rgba(var(--accent-secondary-rgb), 0.1);
          color: var(--accent-secondary);
          border-radius: 10px;
          font-size: 11px;
          font-weight: 500;
        }

        /* Content Styles */
        .drawer-content {
          flex: 1;
          overflow-y: auto;
          padding: 20px 24px;
        }

        /* Overview Tab */
        .content-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }

        .content-section {
          background: var(--glass-card-bg);
          border-radius: var(--border-radius);
          border: 1px solid var(--border-thin);
          padding: 20px;
          margin-bottom: 20px;
        }

        .section-title {
          margin: 0 0 16px 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
        }

        /* Detail Lists */
        .detail-list {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .detail-item {
          display: flex;
          gap: 12px;
        }

        .detail-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: var(--hover-bg);
          color: var(--text-secondary);
        }

        .detail-content {
          flex: 1;
        }

        .detail-label {
          font-size: 13px;
          color: var(--text-tertiary);
          margin-bottom: 4px;
        }

        .detail-value {
          font-size: 15px;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .detail-meta {
          font-size: 12px;
          color: var(--text-tertiary);
          background: var(--hover-bg);
          padding: 2px 6px;
          border-radius: 4px;
        }

        .remote-badge {
          padding: 2px 6px;
          background: rgba(var(--accent-green-rgb), 0.1);
          color: var(--accent-green);
          border-radius: 10px;
          font-size: 11px;
          font-weight: 500;
        }

        .company-link a {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--accent-blue);
          text-decoration: none;
          transition: all 0.2s var(--easing-standard);
        }

        .company-link a:hover {
          text-decoration: underline;
        }

        /* Job Description */
        .description-content, .notes-content {
          color: var(--text-secondary);
          font-size: 14px;
          line-height: 1.6;
        }

        /* Stage Selector */
        .stage-selector {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .stage-option {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          background: transparent;
          border: 1px solid var(--border-thin);
          border-radius: var(--border-radius);
          cursor: pointer;
          transition: all 0.2s var(--easing-standard);
          position: relative;
          text-align: left;
        }

        .stage-option:hover {
          background: var(--hover-bg);
          border-color: rgba(var(--option-color-rgb), 0.3);
        }

        .stage-option.active {
          background: rgba(var(--option-color-rgb), 0.1);
          border-color: var(--option-color);
        }

        .option-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: var(--option-color);
        }

        .stage-option span {
          font-size: 14px;
          color: var(--text-primary);
          font-weight: 500;
        }

        .stage-option.active span {
          color: var(--option-color);
        }

        /* Next Interview */
        .next-interview {
          display: flex;
          flex-direction: column;
          gap: 10px;
          background: rgba(var(--accent-green-rgb), 0.05);
          padding: 12px;
          border-radius: var(--border-radius);
          border: 1px solid rgba(var(--accent-green-rgb), 0.2);
        }

        .interview-date, .interview-time, .interview-with {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-primary);
          font-size: 14px;
        }

        .interview-type {
          margin-top: 4px;
        }

        .type-badge {
          display: inline-block;
          padding: 4px 10px;
          background: rgba(var(--accent-blue-rgb), 0.1);
          color: var(--accent-blue);
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          text-transform: capitalize;
        }

        /* Tasks */
        .tasks-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .task-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 10px;
          background: var(--hover-bg);
          border-radius: var(--border-radius);
          transition: all 0.2s var(--easing-standard);
          border-left: 3px solid transparent;
        }

        .task-item.completed {
          opacity: 0.7;
          text-decoration: line-through;
        }

        .task-checkbox {
          color: var(--accent-primary);
          flex-shrink: 0;
        }

        .checkbox-empty {
          width: 16px;
          height: 16px;
          border: 2px solid var(--border-thin);
          border-radius: 50%;
        }

        .task-content {
          flex: 1;
        }

        .task-title {
          font-size: 14px;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .task-due {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: var(--text-tertiary);
        }

        .priority-indicator {
          width: 3px;
          height: 100%;
          border-radius: 3px;
        }

        .priority-indicator.high {
          background-color: var(--accent-red);
        }

        .priority-indicator.medium {
          background-color: var(--accent-orange);
        }

        .priority-indicator.low {
          background-color: var(--accent-green);
        }

        /* Key Contact */
        .key-contact {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .contact-name {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .contact-role {
          font-size: 14px;
          color: var(--text-secondary);
          margin-bottom: 8px;
        }

        .contact-email, .contact-phone {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: var(--text-secondary);
        }

        .contact-email a, .contact-phone a {
          color: var(--accent-blue);
          text-decoration: none;
        }

        .contact-email a:hover, .contact-phone a:hover {
          text-decoration: underline;
        }

        /* Timeline Tab */
        .timeline-header, .contacts-header, .documents-header, .notes-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .timeline-header h3, .contacts-header h3, .documents-header h3, .notes-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .timeline {
          display: flex;
          flex-direction: column;
          gap: 0;
          position: relative;
          padding-left: 36px;
        }

        .timeline::before {
          content: '';
          position: absolute;
          top: 0;
          left: 18px;
          width: 2px;
          height: 100%;
          background-color: var(--border-divider);
          transform: translateX(-50%);
        }

        .timeline-event {
          position: relative;
          padding: 20px 0;
        }

        .timeline-event:not(:last-child) {
          border-bottom: 1px solid var(--border-divider);
        }

        .event-icon {
          position: absolute;
          left: -36px;
          top: 24px;
          width: 36px;
          height: 36px;
          background: var(--glass-card-bg);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid var(--border-thin);
          color: var(--text-secondary);
          z-index: 1;
        }

        .timeline-event.application-event .event-icon {
          background: rgba(var(--accent-blue-rgb), 0.1);
          color: var(--accent-blue);
          border-color: var(--accent-blue);
        }

        .timeline-event.interview-event .event-icon {
          background: rgba(var(--accent-purple-rgb), 0.1);
          color: var(--accent-purple);
          border-color: var(--accent-purple);
        }

        .timeline-event.interview-event.completed .event-icon {
          background: rgba(var(--accent-green-rgb), 0.1);
          color: var(--accent-green);
          border-color: var(--accent-green);
        }

        .timeline-event.stage-event .event-icon {
          background: rgba(var(--accent-primary-rgb), 0.1);
          color: var(--accent-primary);
          border-color: var(--accent-primary);
        }

        .event-content {
          padding-right: 20px;
        }

        .event-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 8px;
        }

        .event-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .event-date, .event-time, .event-duration {
          font-size: 13px;
          color: var(--text-tertiary);
        }

        .event-description {
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .interview-feedback {
          margin-top: 12px;
          padding: 12px;
          background: rgba(var(--accent-green-rgb), 0.05);
          border-radius: var(--border-radius);
          border-left: 3px solid var(--accent-green);
        }

        .feedback-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--accent-green);
          margin-bottom: 4px;
        }

        /* Contacts Tab */
        .contacts-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 16px;
        }

        .contact-card {
          background: var(--glass-card-bg);
          border-radius: var(--border-radius);
          border: 1px solid var(--border-thin);
          padding: 16px;
          display: flex;
          gap: 16px;
          transition: all 0.2s var(--easing-standard);
        }

        .contact-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow);
          border-color: var(--border-active);
        }

        .contact-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 18px;
          flex-shrink: 0;
        }

        .contact-details {
          flex: 1;
        }

        .contact-actions {
          display: flex;
          gap: 8px;
          margin-top: 12px;
        }

        .action-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--hover-bg);
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s var(--easing-standard);
        }

        .action-icon:hover {
          background: rgba(var(--accent-primary-rgb), 0.1);
          color: var(--accent-primary);
        }

        /* Documents Tab */
        .document-card {
          background: var(--glass-card-bg);
          border-radius: var(--border-radius);
          border: 1px solid var(--border-thin);
          padding: 16px;
          display: flex;
          gap: 16px;
          margin-bottom: 16px;
          transition: all 0.2s var(--easing-standard);
        }

        .document-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow);
          border-color: var(--border-active);
        }

        .document-icon {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          background: rgba(var(--accent-blue-rgb), 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-blue);
          flex-shrink: 0;
        }

        .document-details {
          flex: 1;
        }

        .document-name {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .document-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .document-type {
          padding: 2px 8px;
          background: var(--hover-bg);
          border-radius: 10px;
          font-size: 12px;
          color: var(--text-secondary);
          text-transform: capitalize;
        }

        .document-date {
          font-size: 13px;
          color: var(--text-tertiary);
        }

        /* Notes Tab */
        .note-card {
          background: var(--glass-card-bg);
          border-radius: var(--border-radius);
          border: 1px solid var(--border-thin);
          padding: 16px;
          margin-bottom: 16px;
          transition: all 0.2s var(--easing-standard);
        }

        .note-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow);
          border-color: var(--border-active);
        }

        .note-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .note-date {
          font-size: 13px;
          color: var(--text-tertiary);
        }

        .note-type {
          padding: 2px 8px;
          background: rgba(var(--accent-blue-rgb), 0.1);
          border-radius: 10px;
          font-size: 12px;
          color: var(--accent-blue);
          text-transform: capitalize;
        }

        .note-content {
          font-size: 14px;
          color: var(--text-primary);
          line-height: 1.6;
          margin-bottom: 16px;
        }

        .note-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }

        /* Empty States */
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          text-align: center;
        }

        .empty-icon {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: var(--hover-bg);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-tertiary);
          margin-bottom: 16px;
        }

        .empty-state p {
          color: var(--text-secondary);
          margin-bottom: 16px;
        }

        .add-new-btn {
          padding: 8px 16px;
          background: rgba(var(--accent-primary-rgb), 0.1);
          color: var(--accent-primary);
          border: 1px solid rgba(var(--accent-primary-rgb), 0.3);
          border-radius: var(--border-radius);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s var(--easing-standard);
        }

        .add-new-btn:hover {
          background: rgba(var(--accent-primary-rgb), 0.2);
          transform: translateY(-2px);
        }

        /* Footer */
        .drawer-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          border-top: 1px solid var(--border-divider);
        }

        .application-id {
          font-size: 13px;
          color: var(--text-tertiary);
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: var(--border-radius);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s var(--easing-standard);
        }

        .edit-btn {
          background: rgba(var(--accent-blue-rgb), 0.1);
          color: var(--accent-blue);
          border: 1px solid rgba(var(--accent-blue-rgb), 0.3);
        }

        .edit-btn:hover {
          background: rgba(var(--accent-blue-rgb), 0.2);
          transform: translateY(-1px);
        }

        /* Media queries */
        @media (min-width: 768px) {
          .content-grid {
            grid-template-columns: 3fr 2fr;
          }
        }
      `}</style>
    </SideDrawer>
  );
};

export default ApplicationDetailDrawer;
