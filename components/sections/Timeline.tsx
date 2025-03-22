'use client';

import React, { useState, useEffect } from 'react';
import {
  Briefcase, Calendar, Mail, Phone, MessageSquare, User, CheckCircle, PlusCircle,
  Search, Clock, Trash2, ChevronDown, AlertCircle
} from 'lucide-react';
import CardHeader from '../CardHeader';
import confetti from 'canvas-confetti';
import Modal from '../Modal';

interface TimelineActivity {
  id: string;
  type: 'application' | 'interview' | 'email' | 'call' | 'note' | 'status';
  title: string;
  company: string;
  timestamp: Date;
  details: string;
  status: 'pending' | 'completed' | 'overdue';
  priority: 'high' | 'medium' | 'low';
  tags?: string[];
  attachments?: { name: string; url: string }[];
  nextSteps?: string;
}

interface StatusUpdate {
  id: string;
  message: string;
  activityId: string | null;
}

const getActivityIcon = (type: TimelineActivity['type']) => {
  switch (type) {
    case 'application': return <Briefcase size={16} aria-label="Application" />;
    case 'interview': return <Calendar size={16} aria-label="Interview" />;
    case 'email': return <Mail size={16} aria-label="Email" />;
    case 'call': return <Phone size={16} aria-label="Call" />;
    case 'note': return <MessageSquare size={16} aria-label="Note" />;
    case 'status': return <User size={16} aria-label="Status" />;
    default: return <Briefcase size={16} aria-label="Default" />;
  }
};

const getActivityColor = (type: TimelineActivity['type']): string => {
  switch (type) {
    case 'application': return 'var(--accent-blue)';
    case 'interview': return 'var(--accent-green)';
    case 'email': return 'var(--accent-purple)';
    case 'call': return 'var(--accent-orange)';
    case 'note': return 'var(--accent-yellow)';
    case 'status': return 'var(--accent-pink)';
    default: return 'var(--text-secondary)';
  }
};

const getPriorityColor = (priority: TimelineActivity['priority']): string => {
  switch (priority) {
    case 'high': return 'var(--accent-red)';
    case 'medium': return 'var(--accent-yellow)';
    case 'low': return 'var(--accent-green)';
    default: return 'var(--text-tertiary)';
  }
};

const getStatusColor = (status: TimelineActivity['status']): string => {
  switch (status) {
    case 'pending': return 'var(--accent-orange)';
    case 'completed': return 'var(--accent-success)';
    case 'overdue': return 'var(--accent-red)';
    default: return 'var(--text-tertiary)';
  }
};

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(date);
};

const formatTime = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(date);
};

export default function Timeline() {
  const [activities, setActivities] = useState<TimelineActivity[]>([]);
  const [filter, setFilter] = useState<'all' | TimelineActivity['type']>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newActivity, setNewActivity] = useState({
    title: '',
    company: '',
    type: 'application' as TimelineActivity['type'],
    details: '',
    timestamp: '',
    priority: 'medium' as TimelineActivity['priority'],
    nextSteps: '',
    tags: '',
  });
  const [formError, setFormError] = useState<string>('');
  const [statusUpdates, setStatusUpdates] = useState<StatusUpdate[]>([]);

  useEffect(() => {
    const sampleActivities: TimelineActivity[] = [
      {
        id: '1',
        type: 'application',
        title: 'Applied to Senior Developer',
        company: 'TechCorp',
        timestamp: new Date('2025-03-15T09:30:00'),
        details: 'Submitted via portal with resume and cover letter.',
        status: 'pending',
        priority: 'high',
        tags: ['tech', 'senior'],
        attachments: [{ name: 'Resume.pdf', url: '#' }],
        nextSteps: 'Follow up in 3 days',
      },
      {
        id: '2',
        type: 'interview',
        title: 'Technical Interview',
        company: 'InnovateSoft',
        timestamp: new Date('2025-03-22T14:00:00'),
        details: '30-min screening with engineering team.',
        status: 'pending',
        priority: 'high',
        tags: ['technical'],
        nextSteps: 'Prepare React questions',
      },
      {
        id: '3',
        type: 'email',
        title: 'Follow-up Email',
        company: 'DataViz Inc',
        timestamp: new Date('2025-03-19T10:15:00'),
        details: 'Sent thank-you note with portfolio link.',
        status: 'completed',
        priority: 'medium',
        tags: ['follow-up'],
      },
      {
        id: '4',
        type: 'call',
        title: 'Recruiter Call',
        company: 'CloudSystems',
        timestamp: new Date('2025-03-20T11:00:00'),
        details: 'Discussed job requirements and salary.',
        status: 'completed',
        priority: 'low',
        tags: ['recruiter'],
      },
      {
        id: '5',
        type: 'note',
        title: 'Research Notes',
        company: 'AlgoTech',
        timestamp: new Date('2025-02-10T15:00:00'),
        details: 'Focus on algorithms, competitive pay.',
        status: 'completed',
        priority: 'medium',
        tags: ['research'],
      },
    ];

    setActivities(sampleActivities.sort((a, b) =>
      sortOrder === 'desc'
        ? b.timestamp.getTime() - a.timestamp.getTime()
        : a.timestamp.getTime() - b.timestamp.getTime()
    ));
  }, [sortOrder]);

  const addStatusUpdate = (message: string, activityId: string | null) => {
    const newId = `${activityId || 'global'}-${Date.now()}`;
    setStatusUpdates(prev => [...prev, { id: newId, message, activityId }]);
    setTimeout(() => setStatusUpdates(prev => prev.filter(update => update.id !== newId)), 2000);
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#00FF00', '#FF4500'],
      disableForReducedMotion: true,
    });
  };

  const toggleExpandActivity = (id: string) => {
    setExpandedActivity(prev => (prev === id ? null : id));
  };

  const handleMarkComplete = (id: string) => {
    setActivities(prev =>
      prev.map(activity => {
        if (activity.id === id && activity.status !== 'completed') {
          addStatusUpdate('Completed!', id);
          triggerConfetti();
          return { ...activity, status: 'completed' as const };
        }
        return activity;
      })
    );
  };

  const handleDeleteActivity = (id: string) => {
    setActivities(prev => prev.filter(activity => activity.id !== id));
    addStatusUpdate('Deleted', id);
  };

  const handleAddActivity = () => {
    if (!newActivity.title || !newActivity.company || !newActivity.timestamp) {
      setFormError('Title, company, and timestamp are required.');
      return;
    }
    setFormError('');
    const newActivityData: TimelineActivity = {
      id: `user-${Date.now()}`,
      title: newActivity.title,
      company: newActivity.company,
      type: newActivity.type,
      details: newActivity.details,
      timestamp: new Date(newActivity.timestamp),
      status: new Date(newActivity.timestamp) < new Date() ? 'overdue' : 'pending',
      priority: newActivity.priority,
      tags: newActivity.tags ? newActivity.tags.split(',').map(tag => tag.trim()) : [],
      nextSteps: newActivity.nextSteps,
    };
    setActivities(prev => [...prev, newActivityData].sort((a, b) =>
      sortOrder === 'desc'
        ? b.timestamp.getTime() - a.timestamp.getTime()
        : a.timestamp.getTime() - b.timestamp.getTime()
    ));
    setNewActivity({ title: '', company: '', type: 'application', details: '', timestamp: '', priority: 'medium', nextSteps: '', tags: '' });
    setShowAddModal(false);
    addStatusUpdate('Added!', newActivityData.id);
  };

  const filteredActivities = activities
    .filter(activity => filter === 'all' || activity.type === filter)
    .filter(activity =>
      searchQuery === '' ||
      activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.details.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const groupedActivities = filteredActivities.reduce((acc, activity) => {
    const dateKey = formatDate(activity.timestamp);
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(activity);
    return acc;
  }, {} as Record<string, TimelineActivity[]>);

  const hasGlobalUpdate = statusUpdates.some(update => !update.activityId);

  return (
    <section className="timeline-section reveal-element" aria-label="Activity Timeline">
      <CardHeader
        title={
          <div className="header-title-wrapper">
            <span className={hasGlobalUpdate ? 'pulsing' : ''}>Timeline</span>
            {statusUpdates.filter(update => !update.activityId).map(update => (
              <span key={update.id} className="global-status-text" role="status">{update.message}</span>
            ))}
          </div>
        }
        subtitle="Your job search journey"
        accentColor="var(--accent-purple)"
        variant="default"
      >
        <div className="header-actions">
          <div className="search-bar">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search activities..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              aria-label="Search activities"
            />
          </div>
          <button
            className="add-btn"
            onClick={() => setShowAddModal(true)}
            aria-label="Add new activity"
          >
            <PlusCircle size={18} />
            <span>Add</span>
          </button>
        </div>
      </CardHeader>

      <div className="timeline-controls">
        <div className="filter-tabs" role="tablist">
          {['all', 'application', 'interview', 'email', 'call', 'note', 'status'].map(type => (
            <button
              key={type}
              role="tab"
              className={`filter-tab ${filter === type ? 'active' : ''}`}
              onClick={() => setFilter(type as any)}
              aria-selected={filter === type}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
        <button
          className="sort-btn"
          onClick={() => setSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'))}
          aria-label={`Sort ${sortOrder === 'desc' ? 'ascending' : 'descending'}`}
        >
          <Clock size={16} />
          <span>{sortOrder === 'desc' ? 'Newest' : 'Oldest'}</span>
        </button>
      </div>

      <div className="timeline-container" aria-live="polite">
        {Object.keys(groupedActivities).length > 0 ? (
          <div className="timeline">
            {Object.entries(groupedActivities).map(([date, dateActivities]) => (
              <div key={date} className="timeline-group">
                <div className="date-separator">
                  <span className="date">{date}</span>
                  <div className="line" />
                </div>
                {dateActivities.map((activity, index) => (
                  <div key={activity.id} className="timeline-item">
                    <div className="timeline-marker">
                      <div
                        className="timeline-dot"
                        style={{ backgroundColor: getActivityColor(activity.type) }}
                      />
                      {index < dateActivities.length - 1 || Object.keys(groupedActivities).length > 1 ? (
                        <div className="timeline-line" />
                      ) : null}
                    </div>
                    <div
                      className={`timeline-card ${expandedActivity === activity.id ? 'expanded' : ''} ${activity.status}`}
                      onClick={() => toggleExpandActivity(activity.id)}
                      tabIndex={0}
                      role="button"
                      aria-expanded={expandedActivity === activity.id}
                      aria-label={`View details for ${activity.title}`}
                    >
                      <div className="card-header">
                        <div className="icon-wrapper" style={{ backgroundColor: `${getActivityColor(activity.type)}20` }}>
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="header-content">
                          <h4 className="title">
                            <span className="priority-dot" style={{ backgroundColor: getPriorityColor(activity.priority) }} />
                            {activity.title}
                          </h4>
                          <div className="meta">
                            <span className="company">{activity.company}</span>
                            <span className="time">{formatTime(activity.timestamp)}</span>
                          </div>
                        </div>
                        <div className="status-indicator" style={{ backgroundColor: getStatusColor(activity.status) }} />
                      </div>
                      {expandedActivity === activity.id && (
                        <div className="card-details">
                          <p className="details">{activity.details}</p>
                          {activity.nextSteps && (
                            <div className="next-steps">
                              <AlertCircle size={14} />
                              <span>Next: {activity.nextSteps}</span>
                            </div>
                          )}
                          {activity.tags && activity.tags.length > 0 && (
                            <div className="tags">
                              {activity.tags.map(tag => (
                                <span key={tag} className="tag">{tag}</span>
                              ))}
                            </div>
                          )}
                          {activity.attachments && activity.attachments.length > 0 && (
                            <div className="attachments">
                              <span>Attachments:</span>
                              {activity.attachments.map(attachment => (
                                <a key={attachment.name} href={attachment.url} target="_blank" rel="noopener noreferrer">{attachment.name}</a>
                              ))}
                            </div>
                          )}
                          <div className="actions">
                            {activity.status !== 'completed' && (
                              <button
                                className="action-btn complete"
                                onClick={e => { e.stopPropagation(); handleMarkComplete(activity.id); }}
                                aria-label={`Mark ${activity.title} as complete`}
                              >
                                <CheckCircle size={14} /> Complete
                              </button>
                            )}
                            <button
                              className="action-btn delete"
                              onClick={e => { e.stopPropagation(); handleDeleteActivity(activity.id); }}
                              aria-label={`Delete ${activity.title}`}
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        </div>
                      )}
                      {statusUpdates.filter(update => update.activityId === activity.id).map(update => (
                        <div key={update.id} className="status-bubble" role="status">{update.message}</div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Clock size={36} className="empty-icon" aria-hidden="true" />
            <h3>No Activities</h3>
            <p>Add an activity to get started or adjust your filters.</p>
            <button className="reset-btn" onClick={() => { setFilter('all'); setSearchQuery(''); }}>
              Reset Filters
            </button>
          </div>
        )}
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); setFormError(''); }}
        title="Add Activity"
        footer={
          <div className="modal-actions">
            <button className="save-btn" onClick={handleAddActivity}>Save</button>
            <button className="cancel-btn" onClick={() => { setShowAddModal(false); setFormError(''); }}>Cancel</button>
          </div>
        }
      >
        <div className="form-container">
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              placeholder="e.g., Applied to Software Engineer"
              value={newActivity.title}
              onChange={e => setNewActivity({ ...newActivity, title: e.target.value })}
              className={newActivity.title ? '' : 'invalid'}
            />
          </div>
          <div className="form-group">
            <label>Company</label>
            <input
              type="text"
              placeholder="e.g., TechCorp"
              value={newActivity.company}
              onChange={e => setNewActivity({ ...newActivity, company: e.target.value })}
              className={newActivity.company ? '' : 'invalid'}
            />
          </div>
          <div className="form-group">
            <label>Type</label>
            <select
              value={newActivity.type}
              onChange={e => setNewActivity({ ...newActivity, type: e.target.value as TimelineActivity['type'] })}
            >
              {['application', 'interview', 'email', 'call', 'note', 'status'].map(type => (
                <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Details</label>
            <input
              type="text"
              placeholder="e.g., Submitted resume"
              value={newActivity.details}
              onChange={e => setNewActivity({ ...newActivity, details: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Timestamp</label>
            <input
              type="datetime-local"
              value={newActivity.timestamp}
              onChange={e => setNewActivity({ ...newActivity, timestamp: e.target.value })}
              className={newActivity.timestamp ? '' : 'invalid'}
            />
          </div>
          <div className="form-group">
            <label>Priority</label>
            <select
              value={newActivity.priority}
              onChange={e => setNewActivity({ ...newActivity, priority: e.target.value as TimelineActivity['priority'] })}
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div className="form-group">
            <label>Next Steps</label>
            <input
              type="text"
              placeholder="e.g., Follow up in 3 days"
              value={newActivity.nextSteps}
              onChange={e => setNewActivity({ ...newActivity, nextSteps: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Tags (comma-separated)</label>
            <input
              type="text"
              placeholder="e.g., tech, urgent"
              value={newActivity.tags}
              onChange={e => setNewActivity({ ...newActivity, tags: e.target.value })}
            />
          </div>
          {formError && <span className="form-error">{formError}</span>}
        </div>
      </Modal>

      <style jsx>{`
        .timeline-section {
          padding: 24px;
          background: var(--glass-bg);
          border-radius: var(--border-radius);
          box-shadow: var(--shadow);
        }
        .header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .search-bar {
          display: flex;
          align-items: center;
          background: var(--glass-card-bg);
          border: 1px solid var(--border-thin);
          border-radius: var(--border-radius);
          padding: 6px 12px;
          width: 250px;
        }
        .search-bar input {
          border: none;
          outline: none;
          width: 100%;
          font-size: 14px;
          color: var(--text-primary);
          background: transparent;
        }
        .search-bar input::placeholder {
          color: var(--text-tertiary);
        }
        .search-icon {
          color: var(--text-secondary);
          margin-right: 8px;
        }
        .add-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: var(--accent-purple);
          color: var(--text-primary);
          border: none;
          border-radius: var(--border-radius);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: transform var(--transition-normal) var(--easing-standard), box-shadow var(--transition-normal) var(--easing-standard);
        }
        .add-btn:hover {
          transform: scale(1.05);
          box-shadow: var(--shadow-lg);
        }
        .header-title-wrapper {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .pulsing {
          animation: pulse 1.5s infinite ease-in-out;
        }
        .global-status-text {
          font-size: 13px;
          color: var(--accent-success);
          font-weight: 500;
          animation: fadeInOut 2s ease-in-out forwards;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        @keyframes fadeInOut {
          0% { opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes completionGlow {
          0% { opacity: 1; }
          100% { opacity: 0.85; }
        }
        .timeline-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 16px 0;
        }
        .filter-tabs {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .filter-tab {
          padding: 6px 12px;
          background: var(--hover-bg);
          color: var(--text-secondary);
          border: 1px solid var(--border-thin);
          border-radius: var(--border-radius);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-normal) var(--easing-standard);
        }
        .filter-tab:hover {
          background: var(--active-bg);
          color: var(--text-primary);
        }
        .filter-tab.active {
          background: var(--accent-purple);
          color: var(--text-primary);
          border-color: var(--accent-purple);
        }
        .sort-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: var(--glass-card-bg);
          border: 1px solid var(--border-thin);
          border-radius: var(--border-radius);
          font-size: 13px;
          color: var(--text-primary);
          cursor: pointer;
          transition: all var(--transition-normal) var(--easing-standard);
        }
        .sort-btn:hover {
          border-color: var(--accent-purple);
          box-shadow: var(--shadow);
        }
        .timeline-container {
          position: relative;
          padding: 0 40px;
        }
        .timeline {
          display: flex;
          flex-direction: column;
          gap: 32px;
          position: relative;
        }
        .timeline-group {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .date-separator {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          position: relative;
        }
        .date {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
          background: var(--glass-card-bg);
          padding: 4px 12px;
          border-radius: var(--border-radius);
          box-shadow: var(--shadow);
          z-index: 2;
        }
        .line {
          flex: 1;
          height: 1px;
          background: var(--border-thin);
        }
        .timeline-item {
          display: flex;
          gap: 16px;
          position: relative;
        }
        .timeline-marker {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 16px;
          position: relative;
        }
        .timeline-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          box-shadow: var(--shadow);
          z-index: 2;
        }
        .timeline-line {
          width: 2px;
          background: var(--border-thin);
          flex-grow: 1;
          position: absolute;
          top: 12px;
          bottom: -16px;
          z-index: 1;
        }
        .timeline-card {
          flex: 1;
          background: var(--glass-card-bg);
          border: 1px solid var(--border-thin);
          border-radius: var(--border-radius);
          padding: 12px;
          cursor: pointer;
          transition: transform var(--transition-normal) var(--easing-standard), box-shadow var(--transition-normal) var(--easing-standard);
          position: relative;
          max-width: 400px;
        }
        .timeline-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }
        .timeline-card.expanded {
          border-left: 4px solid var(--accent-purple);
        }
        .timeline-card.completed {
          opacity: 0.85;
          animation: completionGlow 0.8s ease-out;
        }
        .timeline-card.overdue {
          border-top: 2px solid var(--accent-red);
        }
        .card-header {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          position: relative;
        }
        .icon-wrapper {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--border-radius);
        }
        .header-content {
          flex: 1;
        }
        .title {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .priority-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }
        .meta {
          display: flex;
          justify-content: space-between;
          gap: 8px;
          margin-top: 4px;
          font-size: 13px;
          color: var(--text-secondary);
        }
        .company {
          font-weight: 500;
        }
        .time {
          white-space: nowrap;
        }
        .status-indicator {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          position: absolute;
          top: 12px;
          right: 12px;
        }
        .card-details {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid var(--border-thin);
          animation: slideIn 0.3s ease-out;
        }
        .details {
          font-size: 13px;
          color: var(--text-secondary);
          margin: 0 0 8px;
        }
        .next-steps {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: var(--accent-orange);
        }
        .tags {
          display: flex;
          gap: 4px;
          flex-wrap: wrap;
          margin: 8px 0;
        }
        .tag {
          background: var(--hover-bg);
          color: var(--text-secondary);
          font-size: 12px;
          padding: 2px 6px;
          border-radius: var(--border-radius);
        }
        .attachments {
          font-size: 13px;
          color: var(--text-secondary);
        }
        .attachments span {
          font-weight: 500;
        }
        .attachments a {
          display: block;
          color: var(--accent-purple);
          text-decoration: none;
          margin-top: 4px;
        }
        .attachments a:hover {
          text-decoration: underline;
        }
        .actions {
          display: flex;
          gap: 8px;
          margin-top: 12px;
        }
        .action-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border: 1px solid var(--border-thin);
          border-radius: var(--border-radius);
          background: var(--glass-card-bg);
          font-size: 13px;
          color: var(--text-primary);
          cursor: pointer;
          transition: all var(--transition-normal) var(--easing-standard);
        }
        .action-btn:hover {
          background: var(--hover-bg);
          transform: scale(1.05);
        }
        .action-btn.complete:hover {
          border-color: var(--accent-success);
          color: var(--accent-success);
        }
        .action-btn.delete:hover {
          border-color: var(--accent-red);
          color: var(--accent-red);
        }
        .status-bubble {
          position: absolute;
          top: -8px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--accent-success);
          color: var(--text-primary);
          font-size: 12px;
          padding: 4px 8px;
          border-radius: 12px;
          box-shadow: var(--shadow);
          animation: fadeInOut 2s ease-in-out forwards;
          z-index: 3;
        }
        .empty-state {
          text-align: center;
          padding: 40px;
          color: var(--text-secondary);
          background: var(--glass-card-bg);
          border-radius: var(--border-radius);
          box-shadow: var(--shadow);
        }
        .empty-icon {
          margin-bottom: 12px;
          opacity: 0.6;
        }
        .empty-state h3 {
          font-size: 16px;
          margin: 0 0 8px;
        }
        .empty-state p {
          font-size: 14px;
          margin: 0 0 16px;
        }
        .reset-btn {
          padding: 8px 16px;
          background: var(--accent-purple);
          color: var(--text-primary);
          border: none;
          border-radius: var(--border-radius);
          font-size: 14px;
          cursor: pointer;
          transition: background var(--transition-normal) var(--easing-standard), transform var(--transition-normal) var(--easing-standard);
        }
        .reset-btn:hover {
          transform: scale(1.05);
          box-shadow: var(--shadow-lg);
        }
        .form-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .form-group label {
          font-size: 13px;
          font-weight: 500;
          color: var(--text-primary);
        }
        .form-group input, .form-group select {
          padding: 8px 12px;
          border: 1px solid var(--border-thin);
          border-radius: var(--border-radius);
          font-size: 14px;
          color: var(--text-primary);
          background: var(--glass-card-bg);
          transition: border-color var(--transition-normal) var(--easing-standard);
        }
        .form-group input:focus, .form-group select:focus {
          border-color: var(--accent-purple);
          outline: none;
        }
        .form-group input.invalid {
          border-color: var(--accent-red);
        }
        .form-error {
          font-size: 12px;
          color: var(--accent-red);
          margin-top: 4px;
        }
        .modal-actions {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
        }
        .save-btn, .cancel-btn {
          padding: 8px 16px;
          border-radius: var(--border-radius);
          font-size: 14px;
          cursor: pointer;
          transition: background var(--transition-normal) var(--easing-standard), transform var(--transition-normal) var(--easing-standard);
        }
        .save-btn {
          background: var(--accent-purple);
          color: var(--text-primary);
          border: none;
        }
        .save-btn:hover {
          transform: scale(1.05);
          box-shadow: var(--shadow);
        }
        .cancel-btn {
          background: var(--hover-bg);
          color: var(--text-primary);
          border: 1px solid var(--border-thin);
        }
        .cancel-btn:hover {
          background: var(--active-bg);
          transform: scale(1.05);
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 768px) {
          .timeline-container { padding: 0 20px; }
          .timeline-card { max-width: 100%; }
          .header-actions { flex-direction: column; align-items: stretch; }
          .search-bar { width: 100%; }
          .filter-tabs { justify-content: center; }
          .meta { flex-direction: column; gap: 4px; }
        }
      `}</style>
    </section>
  );
}
