'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X, Clock, Building, MapPin, DollarSign, Briefcase,
  CalendarDays, Phone, Mail, Link, ChevronLeft, ChevronRight,
  Calendar, CheckCircle, XCircle, MessageSquare, Globe, Edit,
  FileText, Paperclip, Share2, Star, MoreHorizontal, User,
  ExternalLink, Download
} from 'lucide-react';
import ActionButton from '../dashboard/ActionButton';
import SideDrawer from '../SideDrawer';
import { ApplicationStage, Company, Contact, InterviewEvent, Note, Task, Document } from '@/types';
import { useFeatureFlags } from '@/contexts/FeatureFlagContext';

const STAGE_COLORS: Record<ApplicationStage, string> = {
  applied: '#3b82f6',
  screening: '#f59e0b',
  interview: '#8b5cf6',
  offer: '#10b981',
  rejected: '#ef4444'
};

export const getStageColor = (stage: ApplicationStage): string => {
  return STAGE_COLORS[stage] ?? '#6b7280';
};


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
  techStackJson?: string | string[]; // new
  benefitsJson?: string | string[]; // new
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
  techStackJson,
  benefitsJson,
  isVisible,
  onClose,
  onEdit,
  onStageChange
}) => {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'timeline' | 'contacts' | 'documents' | 'notes'>('overview');
  const [showStageDropdown, setShowStageDropdown] = useState(false);
  const { ENABLE_ADVANCED_APPLICATION_FEATURES } = useFeatureFlags();
  const stageDropdownRef = useRef<HTMLDivElement>(null);
  // Collapsible Job Description
  const [expandJD, setExpandJD] = useState(false);
  const isLongJD = (jobDescription?.length || 0) > 900;

  // Infer a tech stack from the job description (baseline regex)
  const techStack = useMemo(() => {
    if (!jobDescription) return [] as string[];
    const techPatterns: Array<{ re: RegExp; label: string }> = [
      { re: /typescript\b/i, label: 'TypeScript' },
      { re: /javascript\b|node\.js\b|nodejs\b/i, label: 'JavaScript/Node.js' },
      { re: /react\b|react\.js\b|next\.js\b/i, label: 'React/Next.js' },
      { re: /vue\b|vue\.js\b/i, label: 'Vue.js' },
      { re: /angular\b/i, label: 'Angular' },
      { re: /python\b|django\b|fastapi\b|flask\b/i, label: 'Python' },
      { re: /java\b|spring\b/i, label: 'Java/Spring' },
      { re: /c\#\b|\.net\b|dotnet\b/i, label: '.NET/C#' },
      { re: /go\b|golang\b/i, label: 'Go' },
      { re: /rust\b/i, label: 'Rust' },
      { re: /graphql\b/i, label: 'GraphQL' },
      { re: /rest\b|restful\b/i, label: 'REST' },
      { re: /postgres\b|postgresql\b|mysql\b|sqlite\b/i, label: 'SQL' },
      { re: /mongodb\b|document db\b|dynamo\b/i, label: 'NoSQL' },
      { re: /aws\b|azure\b|gcp\b|google cloud\b/i, label: 'Cloud' },
      { re: /docker\b|kubernetes\b|k8s\b/i, label: 'Containers' },
      { re: /tailwind\b/i, label: 'Tailwind CSS' },
      { re: /redux\b|zustand\b|mobx\b/i, label: 'State Mgmt' },
      { re: /storybook\b|vitest\b|jest\b|cypress\b/i, label: 'Testing' },
    ];
    const found = new Set<string>();
    techPatterns.forEach(({ re, label }) => {
      if (re.test(jobDescription)) found.add(label);
    });
    return Array.from(found);
  }, [jobDescription]);

  // AI-enhanced tech stack via API (gpt-4o-mini). Fallbacks to baseline when unavailable.
  const [aiTechStack, setAiTechStack] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiUsed, setAiUsed] = useState<boolean | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    const run = async () => {
      if (!jobDescription || jobDescription.trim().length < 40) {
        setAiTechStack([]);
        setAiUsed(null);
        setAiError(null);
        return;
      }
      try {
        setAiLoading(true);
        setAiError(null);
        const res = await fetch('/api/infer-tech-stack', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobDescription }),
          signal: controller.signal,
        });
        if (!active) return;
        const data = await res.json();
        if (!res.ok || data?.aiUsed !== true) {
          setAiUsed(false);
          setAiTechStack([]);
          setAiError(data?.error || 'AI unavailable');
          return;
        }
        const arr: string[] = Array.isArray(data?.stack) ? data.stack : [];
        setAiUsed(true);
        setAiTechStack(arr);
      } catch (e) {
        if (!active) return;
        setAiUsed(false);
        setAiTechStack([]);
        setAiError('AI inference failed');
      } finally {
        if (active) setAiLoading(false);
      }
    };

    // Debounce slightly to avoid bursts
    const t = setTimeout(run, 250);
    return () => {
      active = false;
      controller.abort();
      clearTimeout(t);
    };
  }, [jobDescription]);

  // Parse incoming seeded fields (JSON or array)
  const seededStack = useMemo<string[]>(() => {
    if (!techStackJson) return [];
    if (Array.isArray(techStackJson)) return techStackJson as string[];
    try { const a = JSON.parse(techStackJson); return Array.isArray(a) ? a : []; } catch { return []; }
  }, [techStackJson]);
  const seededBenefits = useMemo<string[]>(() => {
    if (!benefitsJson) return [];
    if (Array.isArray(benefitsJson)) return benefitsJson as string[];
    try { const a = JSON.parse(benefitsJson); return Array.isArray(a) ? a : []; } catch { return []; }
  }, [benefitsJson]);

  // Final display stack respects AI-only rule; if AI used, show AI stack; else if seeded, show seeded; else none
  const displayTechStack = useMemo(() => {
    if (aiUsed === true) return aiTechStack;
    // If AI failed but we have seeded data, show seeded data
    if (seededStack.length) return seededStack;
    return [];
  }, [aiUsed, aiTechStack, seededStack]);

  const allStages: ApplicationStage[] = ['applied', 'screening', 'interview', 'offer', 'rejected'];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (stageDropdownRef.current && !stageDropdownRef.current.contains(event.target as Node)) {
        setShowStageDropdown(false);
      }
    };

    if (showStageDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showStageDropdown]);

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
      width="1400px"
    >
      <div className="application-detail">
        {/* Header remains sticky */}
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

            <div className="stage-badge-container" ref={stageDropdownRef}>
              <div
                className="stage-badge clickable"
                style={{ color: getStageColor(stage) }}
                onClick={() => setShowStageDropdown(!showStageDropdown)}
              >
                <div
                  className="badge-dot"
                  style={{ backgroundColor: getStageColor(stage) }}
                />
                <span>{getStageLabel(stage)}</span>
              </div>

              {showStageDropdown && (
                <div className="stage-dropdown">
                  {allStages.map((stageOption) => (
                    <div
                      key={stageOption}
                      className={`stage-option ${stageOption === stage ? 'active' : ''}`}
                      style={{
                        color: getStageColor(stageOption),
                        backgroundColor: stageOption === stage ? 'var(--glass-background)' : 'transparent'
                      }}
                      onClick={() => {
                        onStageChange(stageOption);
                        setShowStageDropdown(false);
                      }}
                    >
                      <div
                        className="badge-dot"
                        style={{ backgroundColor: getStageColor(stageOption) }}
                      />
                      <span>{getStageLabel(stageOption)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Enhanced sticky tabs with active indicator */}
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

        {/* Only the Job Description scrolls in Overview; other tabs scroll normally */}
        <div className={`drawer-content ${selectedTab === 'overview' ? 'overview-mode' : ''}`}>
          {/* Overview Tab */}
          {selectedTab === 'overview' && (
            <div className="overview-tab">
              <div className="content-grid">
                <div className="main-column">
                  {/* Job Description is the only scrollable area */}
                  <section className="content-section job-description">
                    <div className="section-header sticky">
                      <h3 className="section-title">Job Description</h3>
                      <div className="section-actions">
                        {isLongJD && (
                          <button className="section-btn" onClick={() => setExpandJD(!expandJD)}>
                            {expandJD ? 'Show less' : 'Show more'}
                          </button>
                        )}
                        <button
                          className="section-btn"
                          onClick={() => navigator.clipboard?.writeText(jobDescription || '')}
                          title="Copy description"
                        >
                          Copy
                        </button>
                      </div>
                    </div>

                    <div className={`description-scroll ${expandJD ? 'expanded' : (isLongJD ? 'collapsed' : '')}`}>
                      <pre className="description-content">{jobDescription}</pre>
                      {isLongJD && !expandJD && <div className="fade-out" />}
                    </div>
                  </section>
                </div>

                <div className="side-column">
                  {/* Tech Stack Section (AI or Seeded) */}
                  {(displayTechStack.length > 0 || aiLoading) && (
                    <section className="content-section">
                      <div className="section-header" style={{ marginBottom: 0 }}>
                        <h3 className="section-title">Tech Stack</h3>
                        <div className="section-actions">
                          {aiUsed && (
                            <span className="ai-badge" title="AI-generated">AI</span>
                          )}
                        </div>
                      </div>
                      <div className="stack-grid">
                        {displayTechStack.map((t) => (
                          <div key={t} className="stack-item">
                            <div className={`stack-avatar ${t.toLowerCase().includes('react') ? 'react' : t.toLowerCase().includes('next') ? 'next' : t.toLowerCase().includes('node') ? 'node' : ''}`}>{t.charAt(0)}</div>
                            <div className="stack-name" title={t}>{t}</div>
                          </div>
                        ))}
                        {aiLoading && displayTechStack.length === 0 && (
                          <div className="stack-item skeleton"><div className="stack-avatar" /> <div className="stack-name">Detecting…</div></div>
                        )}
                      </div>
                      {aiError && aiUsed === false && displayTechStack.length === 0 && (
                        <div className="ai-inline-error" role="status">{aiError}</div>
                      )}
                    </section>
                  )}

                  {/* Benefits */}
                  {seededBenefits.length > 0 && (
                    <section className="content-section">
                      <h3 className="section-title">Benefits</h3>
                      <ul className="benefits-list">
                        {seededBenefits.map((b, i) => (
                          <li key={i} className="benefit-item">{b}</li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {/* Job Details on the right */}
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

                  {/* Remove right-side Status Stage selector to free space */}

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

                  {/* Notes moved to the right column to keep only JD scrollable */}
                  {notes && (
                    <section className="content-section">
                      <h3 className="section-title">Notes</h3>
                      <div className="notes-content">
                        <p>{notes}</p>
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
                    onClick={() => ENABLE_ADVANCED_APPLICATION_FEATURES ? console.log('Add new timeline event') : alert('This feature is not available in the current version')}
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

        {/* Sticky footer */}
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

        /* Sticky header */
        .drawer-header {
          display: flex;
          position: sticky;
          top: 0;
          z-index: 5;
          padding: 16px 24px;
          border-bottom: 1px solid var(--border-divider);
          backdrop-filter: saturate(180%) blur(8px);
          background: color-mix(in srgb, var(--surface, #fff) 84%, transparent);
          box-shadow: 0 1px 0 var(--border-divider), 0 8px 24px rgba(0,0,0,0.02);
        }

        .stage-indicator {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
        }

        /* Sticky tabs with active underline */
        .drawer-nav {
          display: flex;
          gap: 4px;
          padding: 0 24px;
          border-bottom: 1px solid var(--border-divider);
          position: sticky;
          top: 64px; /* below header */
          z-index: 4;
          background: var(--surface, #fff);
        }
        .drawer-nav .nav-item {
          position: relative;
          padding: 12px 10px;
          border-radius: 8px;
        }
        .drawer-nav .nav-item.active::after {
          content: '';
          position: absolute;
          left: 8px;
          right: 8px;
          bottom: -1px;
          height: 2px;
          background: var(--accent-primary);
          border-radius: 2px;
        }

        /* Drawer content: only Overview locks scrolling */
        .drawer-content {
          flex: 1;
          overflow-y: auto;
          padding: 20px 24px;
        }
        .drawer-content.overview-mode {
          overflow: hidden; /* disable page scroll in overview, only JD scrolls */
        }

        /* Overview layout uses full height */
        .overview-tab { height: 100%; }
        .content-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
          height: 100%;
          align-items: start;
        }

        .main-column {
          display: flex;
          flex-direction: column;
          min-height: 0; /* allow children to flex */
          height: 100%;
        }

        .job-description {
          display: flex;
          flex-direction: column;
          min-height: 0;
          flex: 1;
          overflow: hidden; /* internal scroller handles overflow */
        }
        .section-header.sticky {
          position: sticky;
          top: 0;
          z-index: 2;
          padding-bottom: 8px;
          margin-bottom: 8px;
          background: linear-gradient(180deg, var(--glass-card-bg), color-mix(in srgb, var(--glass-card-bg) 90%, transparent));
          backdrop-filter: blur(4px);
        }
        .description-scroll {
          flex: 1;
          min-height: 0;
          overflow: auto;
          position: relative;
          padding-right: 4px; /* space for overlay scrollbar */
        }
        .description-scroll.collapsed { max-height: 320px; }

        .content-section {
          background: var(--glass-card-bg);
          border-radius: var(--border-radius);
          border: 1px solid var(--border-thin);
          padding: 20px;
          margin-bottom: 20px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }

        .section-actions { display: flex; gap: 8px; }
        .section-btn {
          padding: 6px 10px;
          font-size: 12px;
          border-radius: 8px;
          background: var(--hover-bg);
          border: 1px solid var(--border-thin);
          color: var(--text-secondary);
          cursor: pointer;
        }
        .section-btn:hover { color: var(--text-primary); background: rgba(0,0,0,0.03); }

        .section-title {
          margin: 0 0 16px 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
        }

        /* Job Description content */
        .description-content {
          margin: 0;
          color: var(--text-secondary);
          font-size: 14px;
          line-height: 1.6;
          white-space: pre-wrap;
        }
        .description-scroll .fade-out {
          position: absolute; left: 0; right: 0; bottom: 0; height: 56px;
          background: linear-gradient(to bottom, rgba(255,255,255,0), var(--glass-card-bg));
          pointer-events: none;
        }

        /* Sticky right column */
        .side-column {
          position: sticky;
          top: 8px; /* within content area */
          align-self: start;
        }

        /* Tech chips */
        .tech-chips { display: flex; flex-wrap: wrap; gap: 8px; }
        .tech-chip {
          padding: 6px 10px;
          border-radius: 999px;
          font-size: 12px;
          color: var(--text-primary);
          background: var(--hover-bg);
          border: 1px solid var(--border-thin);
          white-space: nowrap;
        }
        .chip-loading { color: var(--text-tertiary); font-style: italic; }

        /* Detail Lists */
        .detail-list { display: flex; flex-direction: column; gap: 18px; }
        .detail-item { display: flex; gap: 12px; }
        .detail-icon {
          display: flex; align-items: center; justify-content: center;
          width: 36px; height: 36px; border-radius: 8px; background: var(--hover-bg); color: var(--text-secondary);
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

        /* Sticky footer */
        .drawer-footer {
          position: sticky;
          bottom: 0;
          background: color-mix(in srgb, var(--surface, #fff) 92%, transparent);
          backdrop-filter: saturate(180%) blur(8px);
          border-top: 1px solid var(--border-divider);
        }

        /* Media queries */
        @media (max-width: 767px) {
          .content-grid { grid-template-columns: 1fr; height: auto; }
          .side-column { position: static; }
          .drawer-content.overview-mode { overflow-y: auto; } /* allow scroll on mobile */
        }

        .ai-badge { padding: 2px 8px; font-size: 11px; border-radius: 999px; background: rgba(var(--accent-purple-rgb),0.12); color: var(--accent-purple); border: 1px solid rgba(var(--accent-purple-rgb),0.3); }
        .ai-inline-error { margin-top: 8px; color: var(--accent-red); font-size: 12px; }

        .stack-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 10px; }
        .stack-item { display: flex; align-items: center; gap: 10px; padding: 10px; border: 1px solid var(--border-thin); border-radius: 10px; background: var(--hover-bg); }
        .stack-item.skeleton { opacity: 0.7; font-style: italic; }
        .stack-avatar { width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 700; color: white; background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary)); }
        .stack-avatar.react { background: #20232a; }
        .stack-avatar.next { background: #111; }
        .stack-avatar.node { background: #215732; }
        .stack-name { font-size: 13px; color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

        .benefits-list { list-style: none; padding-left: 0; display: grid; grid-template-columns: 1fr; gap: 8px; }
        .benefit-item { position: relative; padding-left: 22px; }
        .benefit-item::before { content: '✓'; position: absolute; left: 0; top: 0; color: var(--accent-green); }
      `}</style>
    </SideDrawer>
  );
};

export default ApplicationDetailDrawer;
