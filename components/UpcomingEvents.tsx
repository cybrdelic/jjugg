'use client';

import React from 'react';
import { Calendar, Plus, ChevronRight } from 'lucide-react';
import ActionButton from './dashboard/ActionButton';

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
  dateApplied: Date;
  stage: 'applied' | 'screening' | 'interview' | 'offer' | 'rejected';
}

interface UpcomingEvent {
  id: string;
  title: string;
  company: Company;
  date: Date;
  time: string;
  type: 'Interview' | 'Task' | 'Deadline' | 'Networking' | 'Follow-up';
  application: Application;
  details: string;
  priority?: 'low' | 'medium' | 'high';
}

interface UpcomingEventsProps {
  events: UpcomingEvent[];
  onAddEvent?: () => void;
  onViewCalendar?: () => void;
  onViewAll?: () => void;
}

export default function UpcomingEvents({
  events,
  onAddEvent,
  onViewCalendar,
  onViewAll,
}: UpcomingEventsProps) {
  return (
    <div className="dashboard-card upcoming-card">
      <div className="card-header">
        <h3 className="card-title">Upcoming</h3>
        <ActionButton
          label="Calendar"
          icon={Calendar}
          variant="ghost"
          size="small"
          onClick={onViewCalendar}
        />
      </div>

      <div className="upcoming-events">
        {events.map((event) => (
          <div className="upcoming-event" key={event.id}>
            <div className={`event-priority ${event.priority || 'medium'}`}></div>
            <div className="event-content">
              <div className="event-header">
                <h4 className="event-title">{event.title}</h4>
                <div className={`event-type ${event.type.toLowerCase()}`}>
                  {event.type}
                </div>
              </div>
              <div className="event-details">
                <div className="event-company">
                  <span className="company-logo">
                    {event.company.logo ? (
                      <img src={event.company.logo} alt={event.company.name} />
                    ) : (
                      event.company.name.charAt(0)
                    )}
                  </span>
                  <span className="company-name">{event.company.name}</span>
                </div>
                <div className="event-time">
                  <Calendar size={14} />
                  <span>
                    {new Date(event.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}{' '}
                    at {event.time}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card-actions">
        <ActionButton 
          label="Add Event" 
          icon={Plus} 
          variant="secondary" 
          size="small" 
          onClick={onAddEvent} 
        />
        <ActionButton 
          label="View All" 
          icon={ChevronRight} 
          variant="ghost" 
          size="small" 
          onClick={onViewAll}
          className="view-all" 
        />
      </div>

      <style jsx>{`
        .dashboard-card {
          display: flex;
          flex-direction: column;
          gap: 20px;
          height: 100%;
          overflow: hidden;
          transition: transform 0.3s var(--easing-standard), box-shadow 0.3s var(--easing-standard);
          padding: 20px;
        }

        .dashboard-card:hover {
          transform: translateY(-3px);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--border-divider);
        }

        .card-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .upcoming-events {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .upcoming-event {
          display: flex;
          gap: 10px;
          padding: 12px;
          border-radius: var(--border-radius);
          background: var(--hover-bg);
          transition: all 0.2s var(--easing-standard);
          position: relative;
          overflow: hidden;
        }

        .upcoming-event:hover {
          background: var(--active-bg);
          transform: translateY(-2px);
        }

        .event-priority {
          width: 4px;
          border-radius: 2px;
          background: var(--accent-blue);
        }

        .event-priority.high {
          background: var(--accent-red);
        }

        .event-priority.medium {
          background: var(--accent-orange);
        }

        .event-priority.low {
          background: var(--accent-green);
        }

        .event-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .event-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .event-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .event-type {
          font-size: 12px;
          font-weight: 500;
          padding: 2px 8px;
          border-radius: 12px;
          background: var(--glass-bg);
        }

        .event-type.interview {
          color: var(--accent-purple);
          background: rgba(var(--accent-purple-rgb), 0.1);
        }

        .event-type.task {
          color: var(--accent-blue);
          background: rgba(var(--accent-blue-rgb), 0.1);
        }

        .event-type.deadline {
          color: var(--accent-red);
          background: rgba(var(--accent-red-rgb), 0.1);
        }

        .event-type.networking {
          color: var(--accent-green);
          background: rgba(var(--accent-green-rgb), 0.1);
        }

        .event-type.follow-up {
          color: var(--accent-orange);
          background: rgba(var(--accent-orange-rgb), 0.1);
        }

        .event-details {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .event-company {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .company-logo {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--glass-bg);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .company-name {
          font-size: 13px;
          color: var(--text-secondary);
        }

        .event-time {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: var(--text-tertiary);
        }

        .card-actions {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          margin-top: auto;
          padding-top: 16px;
          border-top: 1px solid var(--border-divider);
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          border-radius: var(--border-radius);
          border: 1px solid var(--border-thin);
          background: var(--glass-bg);
          color: var(--text-secondary);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s var(--easing-standard);
        }

        .action-btn:hover {
          background: var(--active-bg);
          color: var(--accent-blue);
          border-color: var(--accent-blue);
        }

        .action-btn.view-all {
          margin-left: auto;
        }
      `}</style>
    </div>
  );
}
