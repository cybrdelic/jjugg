'use client';

import React, { useState } from 'react';
import { Calendar, Clock, PlusCircle, User, Building, MapPin, ArrowUpRight, MoreHorizontal, ChevronDown } from 'lucide-react';
import CardHeader from '../CardHeader';

interface Company {
  id: string;
  name: string;
  logo: string;
  industry: string;
}

interface Application {
  id: string;
  position: string;
  company: Company;
}

type InterviewType = 'Phone Screen' | 'Technical' | 'Behavioral' | 'Take-home' | 'Onsite' | 'Final Round';

interface InterviewEvent {
  id: string;
  application: Application;
  date: Date;
  startTime: string;
  endTime: string;
  type: InterviewType;
  location: string;
  isRemote: boolean;
  interviewers: string[];
  notes: string;
  preparationLinks: string[];
  status: 'upcoming' | 'completed' | 'canceled';
}

// Mock data
const companies: Company[] = [
  { id: 'c1', name: 'Google', logo: '/companies/google.svg', industry: 'Technology' },
  { id: 'c2', name: 'Microsoft', logo: '/companies/microsoft.svg', industry: 'Technology' },
  { id: 'c4', name: 'Amazon', logo: '/companies/amazon.svg', industry: 'E-commerce' },
  { id: 'c5', name: 'Facebook', logo: '/companies/facebook.svg', industry: 'Social Media' },
  { id: 'c9', name: 'Uber', logo: '/companies/uber.svg', industry: 'Transportation' },
  { id: 'c13', name: 'Salesforce', logo: '/companies/salesforce.svg', industry: 'CRM' },
];

const applications = [
  { id: 'app1', position: 'Senior Frontend Developer', company: companies[0] },
  { id: 'app5', position: 'Product Manager', company: companies[3] },
  { id: 'app9', position: 'Mobile Engineer', company: companies[4] },
  { id: 'app13', position: 'Software Engineer', company: companies[5] },
];

const interviews: InterviewEvent[] = [
  {
    id: 'int1',
    application: applications[0],
    date: new Date(2023, 11, 30, 10, 0),
    startTime: '10:00 AM',
    endTime: '11:00 AM',
    type: 'Technical',
    location: 'Google Meet',
    isRemote: true,
    interviewers: ['Sarah Johnson', 'Mike Chang'],
    notes: 'Prepare for algorithm questions and system design.',
    preparationLinks: ['https://leetcode.com/company/google/', 'https://www.educative.io/courses/grokking-the-system-design-interview'],
    status: 'upcoming'
  },
  {
    id: 'int2',
    application: applications[1],
    date: new Date(2023, 12, 2, 14, 0),
    startTime: '2:00 PM',
    endTime: '3:30 PM',
    type: 'Behavioral',
    location: 'Facebook HQ, Building 20',
    isRemote: false,
    interviewers: ['Lisa Park', 'David Williams'],
    notes: 'Prepare STAR method responses for leadership and conflict resolution scenarios.',
    preparationLinks: ['https://www.themuse.com/advice/star-interview-method'],
    status: 'upcoming'
  },
  {
    id: 'int3',
    application: applications[2],
    date: new Date(2023, 12, 5, 11, 0),
    startTime: '11:00 AM',
    endTime: '12:30 PM',
    type: 'Technical',
    location: 'Zoom',
    isRemote: true,
    interviewers: ['John Smith', 'Alex Rodriguez'],
    notes: 'Mobile-specific questions about React Native and native Android/iOS.',
    preparationLinks: ['https://reactnative.dev/docs/getting-started'],
    status: 'upcoming'
  },
  {
    id: 'int4',
    application: applications[3],
    date: new Date(2023, 12, 8, 15, 0),
    startTime: '3:00 PM',
    endTime: '4:30 PM',
    type: 'Final Round',
    location: 'Salesforce Tower, Floor 34',
    isRemote: false,
    interviewers: ['Emma Watson', 'Robert Chen', 'Michael Clark'],
    notes: 'Panel interview with engineering director and team leads.',
    preparationLinks: ['https://trailhead.salesforce.com/en/content/learn/modules/platform-developer-i-certification-maintenance-winter-22'],
    status: 'upcoming'
  },
  {
    id: 'int5',
    application: applications[0],
    date: new Date(2023, 11, 15, 13, 0),
    startTime: '1:00 PM',
    endTime: '2:00 PM',
    type: 'Phone Screen',
    location: 'Phone Call',
    isRemote: true,
    interviewers: ['Recruiter: Sarah Johnson'],
    notes: 'Initial screening to discuss background and role expectations.',
    preparationLinks: [],
    status: 'completed'
  },
  {
    id: 'int6',
    application: applications[1],
    date: new Date(2023, 11, 18, 11, 0),
    startTime: '11:00 AM',
    endTime: '12:00 PM',
    type: 'Phone Screen',
    location: 'Google Meet',
    isRemote: true,
    interviewers: ['Recruiter: Mark Thompson'],
    notes: 'Initial discussion about the PM role and team structure.',
    preparationLinks: [],
    status: 'completed'
  }
];

// Helper function to format dates
const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
};

// Get interview type color
const getInterviewTypeColor = (type: InterviewType): string => {
  switch (type) {
    case 'Phone Screen':
      return 'var(--accent-blue)';
    case 'Technical':
      return 'var(--accent-purple)';
    case 'Behavioral':
      return 'var(--accent-green)';
    case 'Take-home':
      return 'var(--accent-orange)';
    case 'Onsite':
      return 'var(--accent-pink)';
    case 'Final Round':
      return 'var(--accent-red)';
    default:
      return 'var(--text-secondary)';
  }
};

// Get status color
const getStatusColor = (status: string): string => {
  switch (status) {
    case 'upcoming':
      return 'var(--accent-blue)';
    case 'completed':
      return 'var(--accent-success)';
    case 'canceled':
      return 'var(--accent-red)';
    default:
      return 'var(--text-secondary)';
  }
};

export default function Interviews() {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'canceled'>('all');

  // Filter interviews based on status filter
  const filteredInterviews = interviews.filter(interview => {
    return filter === 'all' || interview.status === filter;
  });

  // Sort interviews by date (most recent first for upcoming, oldest first for completed)
  const sortedInterviews = [...filteredInterviews].sort((a, b) => {
    if (a.status === 'upcoming' && b.status === 'upcoming') {
      return a.date.getTime() - b.date.getTime(); // Upcoming: chronological order
    } else if (a.status === 'completed' && b.status === 'completed') {
      return b.date.getTime() - a.date.getTime(); // Completed: reverse chronological
    } else {
      // Put upcoming first, then completed, then canceled
      return a.status === 'upcoming' ? -1 : b.status === 'upcoming' ? 1 : 0;
    }
  });

  // Group interviews by date for better organization
  const interviewsByDate: Record<string, InterviewEvent[]> = {};
  
  sortedInterviews.forEach(interview => {
    const dateKey = formatDate(interview.date);
    if (!interviewsByDate[dateKey]) {
      interviewsByDate[dateKey] = [];
    }
    interviewsByDate[dateKey].push(interview);
  });

  return (
    <section className="interviews-section reveal-element">
      <CardHeader
        title="Interviews"
        subtitle={`Schedule and prepare for your upcoming interviews (${interviews.filter(i => i.status === 'upcoming').length} upcoming)`}
        accentColor="var(--accent-green)"
        variant="default"
      >
        <button className="add-interview-btn">
          <PlusCircle size={18} />
          <span className="btn-text">Add Interview</span>
        </button>
      </CardHeader>

      <div className="interviews-controls reveal-element">
        <div className="filter-container">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`filter-btn ${filter === 'upcoming' ? 'active' : ''}`}
            onClick={() => setFilter('upcoming')}
          >
            Upcoming
          </button>
          <button 
            className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
          <button 
            className={`filter-btn ${filter === 'canceled' ? 'active' : ''}`}
            onClick={() => setFilter('canceled')}
          >
            Canceled
          </button>
        </div>

        <div className="view-options">
          <button className="view-option">
            <span>Sort By</span>
            <ChevronDown size={14} />
          </button>
        </div>
      </div>

      <div className="interviews-timeline reveal-element">
        {Object.keys(interviewsByDate).length > 0 ? (
          Object.entries(interviewsByDate).map(([dateKey, dayInterviews]) => (
            <div key={dateKey} className="date-group">
              <div className="date-header">
                <div className="date-line"></div>
                <h3 className="date-label">{dateKey}</h3>
                <div className="date-line"></div>
              </div>

              <div className="interviews-list">
                {dayInterviews.map(interview => (
                  <div key={interview.id} className={`interview-card ${interview.status}`}>
                    {/* Company section with logo */}
                    <div className="card-company-info">
                      <div className="company-logo-container">
                        <div className="company-logo-placeholder">
                          {interview.application.company.name.charAt(0)}
                        </div>
                      </div>
                      <div className="company-details">
                        <h3 className="company-name">{interview.application.company.name}</h3>
                        <p className="position-title">{interview.application.position}</p>
                      </div>
                    </div>

                    {/* Interview details section */}
                    <div className="interview-details">
                      {/* Type badge */}
                      <div 
                        className="interview-type-badge"
                        style={{ 
                          backgroundColor: `${getInterviewTypeColor(interview.type)}10`,
                          color: getInterviewTypeColor(interview.type)
                        }}
                      >
                        <span 
                          className="type-indicator"
                          style={{ backgroundColor: getInterviewTypeColor(interview.type) }}
                        ></span>
                        {interview.type}
                      </div>

                      {/* Time and location */}
                      <div className="detail-items">
                        <div className="detail-item">
                          <Clock size={16} className="detail-icon" />
                          <span>{interview.startTime} - {interview.endTime}</span>
                        </div>
                        
                        <div className="detail-item">
                          <MapPin size={16} className="detail-icon" />
                          <span>{interview.location}</span>
                          {interview.isRemote && <span className="remote-badge">Remote</span>}
                        </div>
                        
                        <div className="detail-item">
                          <User size={16} className="detail-icon" />
                          <span>{interview.interviewers.length > 1 
                            ? `${interview.interviewers.length} interviewers` 
                            : interview.interviewers[0]}</span>
                        </div>
                      </div>

                      {/* Notes preview */}
                      {interview.notes && (
                        <div className="interview-notes">
                          <p>{interview.notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="interview-actions">
                      {interview.status === 'upcoming' && (
                        <>
                          <button className="prepare-btn">
                            Prepare
                            <ArrowUpRight size={14} />
                          </button>
                          <button className="action-btn">
                            <MoreHorizontal size={18} />
                          </button>
                        </>
                      )}
                      
                      {interview.status === 'completed' && (
                        <button className="review-btn">
                          Review Notes
                        </button>
                      )}
                    </div>

                    {/* Status indicator */}
                    <div 
                      className="status-badge"
                      style={{ 
                        backgroundColor: `${getStatusColor(interview.status)}10`,
                        color: getStatusColor(interview.status)
                      }}
                    >
                      {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <Calendar size={48} className="empty-icon" />
            <h3>No interviews found</h3>
            <p>No interviews match your current filter selection</p>
            <button 
              className="reset-filter-btn"
              onClick={() => setFilter('all')}
            >
              Show All Interviews
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .interviews-section {
          display: flex;
          flex-direction: column;
          gap: 24px;
          padding: 0;
          min-height: 100%;
        }

        .interviews-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 8px;
        }

        .filter-container {
          display: flex;
          align-items: center;
          gap: 12px;
          background: var(--glass-bg);
          border-radius: var(--border-radius);
          padding: 4px;
          border: 1px solid var(--border-thin);
          box-shadow: var(--shadow-sharp);
        }

        .filter-btn {
          padding: 8px 16px;
          border-radius: var(--border-radius-sm);
          border: none;
          background: transparent;
          color: var(--text-secondary);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .filter-btn:hover {
          color: var(--text-primary);
          background: var(--hover-bg);
        }

        .filter-btn.active {
          background: var(--active-bg);
          color: var(--accent-green);
        }

        .view-options {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .view-option {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: var(--border-radius);
          border: 1px solid var(--border-thin);
          background: var(--glass-bg);
          color: var(--text-primary);
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: var(--shadow-sharp);
        }

        .view-option:hover {
          border-color: var(--accent-green);
          box-shadow: 0 2px 6px rgba(var(--accent-green-rgb), 0.15);
          transform: translateY(-1px);
        }

        .interviews-timeline {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .date-group {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .date-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin: 8px 0;
        }

        .date-line {
          flex: 1;
          height: 1px;
          background-color: var(--border-divider);
        }

        .date-label {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-secondary);
          flex-shrink: 0;
          margin: 0;
          padding: 0 8px;
        }

        .interviews-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .interview-card {
          display: flex;
          flex-direction: column;
          gap: 16px;
          background: var(--glass-card-bg);
          border-radius: var(--border-radius);
          padding: 20px;
          border: 1px solid var(--border-thin);
          box-shadow: var(--shadow);
          position: relative;
          transition: all 0.2s ease;
        }

        .interview-card:hover {
          box-shadow: var(--shadow-lg);
          transform: translateY(-2px);
          border-color: var(--border-hover);
        }

        .interview-card.completed {
          opacity: 0.8;
        }

        .interview-card.canceled {
          opacity: 0.6;
        }

        .card-company-info {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .company-logo-container {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          overflow: hidden;
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-green));
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          color: white;
          font-size: 20px;
          box-shadow: var(--shadow-sharp);
        }

        .company-details {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .company-name {
          font-size: 18px;
          font-weight: 600;
          margin: 0;
          color: var(--text-primary);
        }

        .position-title {
          font-size: 14px;
          color: var(--text-secondary);
          margin: 0;
        }

        .interview-details {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-left: 64px;
        }

        .interview-type-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 500;
          align-self: flex-start;
        }

        .type-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .detail-items {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--text-secondary);
          font-size: 14px;
        }

        .detail-icon {
          color: var(--text-tertiary);
          flex-shrink: 0;
        }

        .remote-badge {
          font-size: 12px;
          padding: 2px 6px;
          border-radius: 4px;
          background: rgba(var(--accent-blue-rgb), 0.1);
          color: var(--accent-blue);
          margin-left: 8px;
        }

        .interview-notes {
          background: var(--hover-bg);
          border-radius: var(--border-radius);
          padding: 12px;
          font-size: 14px;
          color: var(--text-secondary);
          border-left: 3px solid var(--accent-green);
        }

        .interview-notes p {
          margin: 0;
          line-height: 1.5;
        }

        .interview-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-left: 64px;
          margin-top: 8px;
        }

        .prepare-btn, .review-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: var(--border-radius);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .prepare-btn {
          background: var(--accent-green);
          color: white;
          border: none;
          box-shadow: 0 2px 6px rgba(var(--accent-green-rgb), 0.25);
        }

        .prepare-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(var(--accent-green-rgb), 0.3);
        }

        .review-btn {
          background: transparent;
          color: var(--accent-blue);
          border: 1px solid var(--accent-blue);
        }

        .review-btn:hover {
          background: rgba(var(--accent-blue-rgb), 0.1);
          transform: translateY(-1px);
        }

        .action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid var(--border-thin);
          background: var(--glass-bg);
          color: var(--text-tertiary);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .action-btn:hover {
          background: var(--hover-bg);
          color: var(--text-primary);
          transform: translateY(-1px);
        }

        .status-badge {
          position: absolute;
          top: 20px;
          right: 20px;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 64px;
          text-align: center;
          color: var(--text-tertiary);
          gap: 16px;
          background: var(--glass-card-bg);
          border-radius: var(--border-radius);
          border: 1px solid var(--border-thin);
        }

        .empty-icon {
          opacity: 0.5;
        }

        .empty-state h3 {
          margin: 0;
          font-size: 18px;
          color: var(--text-secondary);
        }

        .empty-state p {
          margin: 0;
          font-size: 14px;
        }

        .reset-filter-btn {
          margin-top: 16px;
          padding: 8px 16px;
          border-radius: var(--border-radius);
          background: var(--accent-green);
          color: white;
          border: none;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .reset-filter-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(var(--accent-green-rgb), 0.3);
        }

        .add-interview-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: var(--border-radius);
          background: var(--accent-green);
          color: white;
          border: none;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 6px rgba(var(--accent-green-rgb), 0.25);
        }

        .add-interview-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(var(--accent-green-rgb), 0.3);
        }

        @media (max-width: 768px) {
          .interviews-controls {
            flex-direction: column;
            align-items: stretch;
          }

          .filter-container {
            overflow-x: auto;
            padding: 8px;
          }

          .filter-btn {
            white-space: nowrap;
          }

          .view-options {
            align-self: flex-end;
          }

          .interview-card {
            padding: 16px;
          }

          .card-company-info {
            gap: 12px;
          }

          .company-logo-container {
            width: 40px;
            height: 40px;
          }

          .interview-details {
            margin-left: 52px;
          }

          .interview-actions {
            margin-left: 52px;
          }

          .status-badge {
            position: relative;
            top: 0;
            right: 0;
            align-self: flex-end;
            margin-bottom: 8px;
          }
        }
      `}</style>
    </section>
  );
}