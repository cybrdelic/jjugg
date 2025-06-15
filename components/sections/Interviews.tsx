'use client';

import React, { useState } from 'react';
import { Calendar, Clock, PlusCircle, User, Building, MapPin, ArrowUpRight, MoreHorizontal, ChevronDown } from 'lucide-react';
import CardHeader from '../CardHeader';
import { useApplications, useCompanies, useEvents } from '../../hooks/useData';
import type { UpcomingEvent } from '../../types';

// Helper function to format dates
const formatEventDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
};

// Get interview type color based on event details or title
const getEventTypeColor = (event: UpcomingEvent): string => {
  const title = event.title.toLowerCase();
  const details = event.details?.toLowerCase() || '';

  if (title.includes('phone') || title.includes('screen') || details.includes('phone')) {
    return 'var(--accent-blue)';
  } else if (title.includes('technical') || details.includes('technical')) {
    return 'var(--accent-purple)';
  } else if (title.includes('behavioral') || details.includes('behavioral')) {
    return 'var(--accent-green)';
  } else if (title.includes('final') || details.includes('final')) {
    return 'var(--accent-red)';
  } else if (title.includes('onsite') || details.includes('onsite')) {
    return 'var(--accent-pink)';
  } else {
    return 'var(--accent-blue)'; // default
  }
};

// Get interview type from event
const getEventType = (event: UpcomingEvent): string => {
  const title = event.title.toLowerCase();
  const details = event.details?.toLowerCase() || '';

  if (title.includes('phone') || title.includes('screen') || details.includes('phone')) {
    return 'Phone Screen';
  } else if (title.includes('technical') || details.includes('technical')) {
    return 'Technical';
  } else if (title.includes('behavioral') || details.includes('behavioral')) {
    return 'Behavioral';
  } else if (title.includes('final') || details.includes('final')) {
    return 'Final Round';
  } else if (title.includes('onsite') || details.includes('onsite')) {
    return 'Onsite';
  } else {
    return 'Interview';
  }
};

// Get status from event date
const getEventStatus = (event: UpcomingEvent): 'upcoming' | 'completed' => {
  return event.date > new Date() ? 'upcoming' : 'completed';
};

// Get status color
const getEventStatusColor = (status: string): string => {
  switch (status) {
    case 'upcoming':
      return 'var(--accent-blue)';
    case 'completed':
      return 'var(--accent-green)';
    case 'canceled':
      return 'var(--accent-red)';
    default:
      return 'var(--text-tertiary)';
  }
};

export default function Interviews() {
  const eventsData = useEvents();
  const applicationsData = useApplications();
  const companiesData = useCompanies();

  // Filter events for interviews only
  const interviews = eventsData.data.filter(event =>
    event.type === 'Interview' ||
    event.title.toLowerCase().includes('interview') ||
    event.title.toLowerCase().includes('screen')
  );

  const [selectedFilter, setSelectedFilter] = useState<'all' | 'upcoming' | 'completed'>('all');
  const [selectedInterview, setSelectedInterview] = useState<UpcomingEvent | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Sort interviews by date
  const sortedInterviews = interviews.sort((a, b) => {
    const statusA = getEventStatus(a);
    const statusB = getEventStatus(b);

    if (statusA === 'upcoming' && statusB === 'upcoming') {
      return a.date.getTime() - b.date.getTime();
    } else if (statusA === 'completed' && statusB === 'completed') {
      return b.date.getTime() - a.date.getTime();
    } else {
      return statusA === 'upcoming' ? -1 : statusB === 'upcoming' ? 1 : 0;
    }
  });

  // Filter interviews based on selected filter
  const filteredInterviews = sortedInterviews.filter(interview => {
    if (selectedFilter === 'all') return true;
    return getEventStatus(interview) === selectedFilter;
  });

  // Group interviews by date
  const interviewsByDate: Record<string, UpcomingEvent[]> = {};
  filteredInterviews.forEach(interview => {
    const dateKey = formatEventDate(interview.date);
    if (!interviewsByDate[dateKey]) {
      interviewsByDate[dateKey] = [];
    }
    interviewsByDate[dateKey].push(interview);
  });

  const handleInterviewClick = (interview: UpcomingEvent) => {
    setSelectedInterview(interview);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedInterview(null);
    setShowModal(false);
  };

  const upcomingCount = interviews.filter(interview => getEventStatus(interview) === 'upcoming').length;

  return (
    <div className="interviews-section">
      <CardHeader
        title="Interviews"
        subtitle={`Schedule and prepare for your upcoming interviews (${upcomingCount} upcoming)`}
        accentColor="var(--accent-green)"
      >
        <button
          className="action-button primary"
          onClick={() => console.log('Add interview')}
        >
          <PlusCircle size={18} />
          <span>Schedule Interview</span>
        </button>
      </CardHeader>

      <div className="interviews-content">
        {/* Filter tabs */}
        <div className="filter-tabs">
          {(['all', 'upcoming', 'completed'] as const).map((filter) => (
            <button
              key={filter}
              className={`filter-tab ${selectedFilter === filter ? 'active' : ''}`}
              onClick={() => setSelectedFilter(filter)}
            >
              {filter === 'all' ? 'All Interviews' :
                filter === 'upcoming' ? 'Upcoming' : 'Completed'}
              <span className="count">
                {filter === 'all' ? interviews.length :
                  interviews.filter(interview => getEventStatus(interview) === filter).length}
              </span>
            </button>
          ))}
        </div>

        {/* Interviews list */}
        <div className="interviews-list">
          {Object.keys(interviewsByDate).length === 0 ? (
            <div className="empty-state">
              <Calendar size={48} />
              <h3>No interviews scheduled</h3>
              <p>Schedule your first interview to get started!</p>
              <button className="action-button primary">
                <PlusCircle size={18} />
                Schedule Interview
              </button>
            </div>
          ) : (
            Object.entries(interviewsByDate)
              .sort(([dateA], [dateB]) => {
                const a = new Date(dateA);
                const b = new Date(dateB);
                return selectedFilter === 'completed' ? b.getTime() - a.getTime() : a.getTime() - b.getTime();
              })
              .map(([date, dayInterviews]) => (
                <div key={date} className="interview-day">
                  <div className="day-header">
                    <h4>{date}</h4>
                    <span className="day-count">{dayInterviews.length} interview{dayInterviews.length !== 1 ? 's' : ''}</span>
                  </div>

                  <div className="day-interviews">
                    {dayInterviews.map((interview) => {
                      const status = getEventStatus(interview);
                      const interviewType = getEventType(interview);

                      return (
                        <div
                          key={interview.id}
                          className={`interview-card ${status}`}
                          onClick={() => handleInterviewClick(interview)}
                        >
                          <div className="interview-header">
                            <div className="interview-time">
                              <Clock size={16} />
                              <span>{interview.time}</span>
                              {interview.duration && (
                                <span className="duration">({interview.duration}min)</span>
                              )}
                            </div>
                            <div className="interview-status">
                              <div
                                className="status-indicator"
                                style={{ backgroundColor: getEventStatusColor(status) }}
                              />
                              <span>{status}</span>
                            </div>
                          </div>

                          <div className="interview-main">
                            <div className="interview-info">
                              <h5>{interview.title}</h5>
                              <div className="interview-details">
                                <div className="detail-item">
                                  <Building size={14} />
                                  <span>{interview.company.name}</span>
                                </div>
                                <div className="detail-item">
                                  <User size={14} />
                                  <span>{interview.application.position}</span>
                                </div>
                                {interview.location && (
                                  <div className="detail-item">
                                    <MapPin size={14} />
                                    <span>{interview.location}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="interview-type">
                              <div
                                className="type-pill"
                                style={{
                                  backgroundColor: getEventTypeColor(interview),
                                  color: 'white'
                                }}
                              >
                                {interviewType}
                              </div>
                            </div>
                          </div>

                          {interview.details && (
                            <div className="interview-notes">
                              <p>{interview.details}</p>
                            </div>
                          )}

                          <div className="interview-actions">
                            <button className="action-btn">
                              <ArrowUpRight size={16} />
                            </button>
                            <button className="action-btn">
                              <MoreHorizontal size={16} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
          )}
        </div>
      </div>

      {/* Interview detail modal */}
      {showModal && selectedInterview && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content interview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedInterview.title}</h3>
              <button className="close-button" onClick={closeModal}>×</button>
            </div>

            <div className="modal-body">
              <div className="interview-summary">
                <div className="summary-item">
                  <strong>Company:</strong>
                  <span>{selectedInterview.company.name}</span>
                </div>
                <div className="summary-item">
                  <strong>Position:</strong>
                  <span>{selectedInterview.application.position}</span>
                </div>
                <div className="summary-item">
                  <strong>Date & Time:</strong>
                  <span>{formatEventDate(selectedInterview.date)} at {selectedInterview.time}</span>
                </div>
                {selectedInterview.duration && (
                  <div className="summary-item">
                    <strong>Duration:</strong>
                    <span>{selectedInterview.duration} minutes</span>
                  </div>
                )}
                {selectedInterview.location && (
                  <div className="summary-item">
                    <strong>Location:</strong>
                    <span>{selectedInterview.location}</span>
                  </div>
                )}
                <div className="summary-item">
                  <strong>Type:</strong>
                  <span style={{ color: getEventTypeColor(selectedInterview) }}>
                    {getEventType(selectedInterview)}
                  </span>
                </div>
                <div className="summary-item">
                  <strong>Status:</strong>
                  <span style={{ color: getEventStatusColor(getEventStatus(selectedInterview)) }}>
                    {getEventStatus(selectedInterview)}
                  </span>
                </div>
              </div>

              {selectedInterview.details && (
                <div className="interview-details">
                  <h4>Details</h4>
                  <p>{selectedInterview.details}</p>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="action-button secondary" onClick={closeModal}>
                Close
              </button>
              <button className="action-button primary">
                Edit Interview
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .interviews-section {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          height: 100%;
        }

        .interviews-content {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          flex: 1;
          overflow: hidden;
        }

        .filter-tabs {
          display: flex;
          gap: 0.5rem;
          padding: 0 1rem;
        }

        .filter-tab {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .filter-tab:hover {
          background: var(--surface-secondary);
        }

        .filter-tab.active {
          background: var(--accent-green);
          color: white;
          border-color: var(--accent-green);
        }

        .filter-tab .count {
          background: var(--surface-tertiary);
          color: var(--text-primary);
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .filter-tab.active .count {
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }

        .interviews-list {
          flex: 1;
          overflow-y: auto;
          padding: 0 1rem;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 3rem 1rem;
          color: var(--text-secondary);
        }

        .empty-state svg {
          color: var(--text-tertiary);
          margin-bottom: 1rem;
        }

        .empty-state h3 {
          margin: 0 0 0.5rem 0;
          color: var(--text-primary);
        }

        .empty-state p {
          margin: 0 0 1.5rem 0;
        }

        .interview-day {
          margin-bottom: 2rem;
        }

        .day-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--border-color);
        }

        .day-header h4 {
          margin: 0;
          color: var(--text-primary);
          font-weight: 600;
        }

        .day-count {
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .day-interviews {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .interview-card {
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 1.25rem;
          background: var(--surface-primary);
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }

        .interview-card:hover {
          border-color: var(--accent-green);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .interview-card.completed {
          opacity: 0.8;
        }

        .interview-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
        }

        .interview-time {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .duration {
          color: var(--text-tertiary);
        }

        .interview-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        .status-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .interview-main {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
        }

        .interview-info {
          flex: 1;
        }

        .interview-info h5 {
          margin: 0 0 0.75rem 0;
          color: var(--text-primary);
          font-weight: 600;
        }

        .interview-details {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .interview-type {
          flex-shrink: 0;
        }

        .type-pill {
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .interview-notes {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-color);
        }

        .interview-notes p {
          margin: 0;
          color: var(--text-secondary);
          font-size: 0.875rem;
          line-height: 1.5;
        }

        .interview-actions {
          position: absolute;
          top: 1rem;
          right: 1rem;
          display: flex;
          gap: 0.5rem;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .interview-card:hover .interview-actions {
          opacity: 1;
        }

        .action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          background: var(--surface-primary);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .action-btn:hover {
          background: var(--surface-secondary);
          color: var(--text-primary);
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: var(--surface-primary);
          border-radius: 12px;
          max-width: 600px;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem;
          border-bottom: 1px solid var(--border-color);
        }

        .modal-header h3 {
          margin: 0;
          color: var(--text-primary);
        }

        .close-button {
          background: none;
          border: none;
          font-size: 1.5rem;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .close-button:hover {
          background: var(--surface-secondary);
          color: var(--text-primary);
        }

        .modal-body {
          padding: 1.5rem;
        }

        .interview-summary {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 0;
          border-bottom: 1px solid var(--border-color);
        }

        .summary-item:last-child {
          border-bottom: none;
        }

        .summary-item strong {
          color: var(--text-secondary);
          font-weight: 500;
        }

        .summary-item span {
          color: var(--text-primary);
          font-weight: 500;
        }

        .interview-details {
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border-color);
        }

        .interview-details h4 {
          margin: 0 0 1rem 0;
          color: var(--text-primary);
        }

        .interview-details p {
          margin: 0;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .modal-footer {
          display: flex;
          gap: 1rem;
          padding: 1.5rem;
          border-top: 1px solid var(--border-color);
          justify-content: flex-end;
        }

        .action-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }

        .action-button.primary {
          background: var(--accent-green);
          color: white;
        }

        .action-button.primary:hover {
          background: var(--accent-green-dark);
        }

        .action-button.secondary {
          background: var(--surface-secondary);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
        }

        .action-button.secondary:hover {
          background: var(--surface-tertiary);
        }
      `}</style>
    </div>
  );
}
