'use client';

import React, { useState } from 'react';
import { Bell, Calendar, Clock, PlusCircle, CheckCircle, Trash2, MoreHorizontal, AlertCircle, X } from 'lucide-react';
import CardHeader from '../CardHeader';

interface Company {
  id: string;
  name: string;
  logo: string;
}

interface Application {
  id: string;
  position: string;
  company: Company;
}

type ReminderPriority = 'high' | 'medium' | 'low';
type ReminderStatus = 'pending' | 'completed';

interface Reminder {
  id: string;
  title: string;
  description?: string;
  dueDate: Date;
  priority: ReminderPriority;
  status: ReminderStatus;
  relatedApplication?: Application;
  notifyBefore?: number; // minutes
}

// Mock data
const companies = [
  { id: 'c1', name: 'Google', logo: '/companies/google.svg' },
  { id: 'c2', name: 'Microsoft', logo: '/companies/microsoft.svg' },
  { id: 'c3', name: 'Apple', logo: '/companies/apple.svg' },
  { id: 'c4', name: 'Amazon', logo: '/companies/amazon.svg' },
];

const applications = [
  { id: 'app1', position: 'Senior Frontend Developer', company: companies[0] },
  { id: 'app2', position: 'Software Engineer', company: companies[1] },
  { id: 'app3', position: 'iOS Developer', company: companies[2] },
  { id: 'app4', position: 'Cloud Engineer', company: companies[3] },
];

const reminders: Reminder[] = [
  {
    id: 'rem1',
    title: 'Complete coding assignment',
    description: 'Finish the React project for Google interview',
    dueDate: new Date(2023, 11, 25, 23, 59),
    priority: 'high',
    status: 'pending',
    relatedApplication: applications[0],
    notifyBefore: 24 * 60 // 24 hours
  },
  {
    id: 'rem2',
    title: 'Send thank you email',
    description: 'Follow up after the Microsoft interview',
    dueDate: new Date(2023, 11, 20, 17, 0),
    priority: 'medium',
    status: 'pending',
    relatedApplication: applications[1]
  },
  {
    id: 'rem3',
    title: 'Update resume with Swift experience',
    description: 'Add recent Swift projects before applying to Apple',
    dueDate: new Date(2023, 11, 22, 12, 0),
    priority: 'low',
    status: 'pending',
    relatedApplication: applications[2]
  },
  {
    id: 'rem4',
    title: 'Research AWS interview questions',
    dueDate: new Date(2023, 11, 26, 20, 0),
    priority: 'medium',
    status: 'pending',
    relatedApplication: applications[3]
  },
  {
    id: 'rem5',
    title: 'Update portfolio website',
    description: 'Add recent projects and improve design',
    dueDate: new Date(2023, 11, 30, 23, 59),
    priority: 'low',
    status: 'pending'
  },
  {
    id: 'rem6',
    title: 'Complete Leetcode practice',
    description: 'Focus on dynamic programming questions',
    dueDate: new Date(2023, 11, 19, 22, 0),
    priority: 'high',
    status: 'completed'
  },
  {
    id: 'rem7',
    title: 'Prepare questions for hiring manager',
    dueDate: new Date(2023, 11, 18, 10, 0),
    priority: 'medium',
    status: 'completed',
    relatedApplication: applications[0]
  }
];

// Helper functions
const formatDate = (date: Date): string => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  // Check if it's today
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }
  
  // Check if it's tomorrow
  if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  }
  
  // Otherwise, format date
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  }).format(date);
};

const formatTime = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date);
};

const getPriorityColor = (priority: ReminderPriority): string => {
  switch (priority) {
    case 'high':
      return 'var(--accent-red)';
    case 'medium':
      return 'var(--accent-orange)';
    case 'low':
      return 'var(--accent-blue)';
    default:
      return 'var(--text-secondary)';
  }
};

export default function Reminders() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Filter reminders based on status
  const filteredReminders = reminders.filter(reminder => {
    return filter === 'all' || reminder.status === filter;
  });
  
  // Sort reminders by due date and then by priority
  const sortedReminders = [...filteredReminders].sort((a, b) => {
    // First sort by status (pending first)
    if (a.status !== b.status) {
      return a.status === 'pending' ? -1 : 1;
    }
    
    // Then sort by due date (earlier first)
    const dateComparison = a.dueDate.getTime() - b.dueDate.getTime();
    if (dateComparison !== 0) {
      return dateComparison;
    }
    
    // Then sort by priority (high first)
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
  
  // Group reminders by date
  const remindersByDate: Record<string, Reminder[]> = {};
  
  sortedReminders.forEach(reminder => {
    const dateKey = formatDate(reminder.dueDate);
    if (!remindersByDate[dateKey]) {
      remindersByDate[dateKey] = [];
    }
    remindersByDate[dateKey].push(reminder);
  });
  
  // Toggle reminder status
  const toggleReminderStatus = (id: string) => {
    // This would normally update the state in a real implementation
    console.log(`Toggle status for reminder: ${id}`);
  };

  return (
    <section className="reminders-section reveal-element">
      <CardHeader
        title="Reminders"
        subtitle={`Track tasks and deadlines (${reminders.filter(r => r.status === 'pending').length} pending)`}
        accentColor="var(--accent-orange)"
        variant="default"
      >
        <button 
          className="add-reminder-btn"
          onClick={() => setShowAddForm(true)}
        >
          <PlusCircle size={18} />
          <span className="btn-text">Add Reminder</span>
        </button>
      </CardHeader>

      <div className="reminders-controls reveal-element">
        <div className="filter-tabs">
          <button 
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending
          </button>
          <button 
            className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
        </div>
      </div>

      <div className="reminders-list reveal-element">
        {Object.keys(remindersByDate).length > 0 ? (
          Object.entries(remindersByDate).map(([dateKey, dayReminders]) => (
            <div key={dateKey} className="date-group">
              <div className="date-header">
                <span className="date-label">{dateKey}</span>
                <div className="date-line"></div>
              </div>
              
              <div className="reminder-items">
                {dayReminders.map(reminder => (
                  <div 
                    key={reminder.id} 
                    className={`reminder-item ${reminder.status}`}
                  >
                    <div className="reminder-status">
                      <button 
                        className={`status-checkbox ${reminder.status}`}
                        onClick={() => toggleReminderStatus(reminder.id)}
                        aria-label={reminder.status === 'completed' ? "Mark as pending" : "Mark as completed"}
                      >
                        {reminder.status === 'completed' && <CheckCircle size={20} />}
                      </button>
                    </div>
                    
                    <div className="reminder-content">
                      <div className="reminder-header">
                        <h3 className="reminder-title">{reminder.title}</h3>
                        <div 
                          className="priority-indicator"
                          style={{ backgroundColor: getPriorityColor(reminder.priority) }}
                          title={`${reminder.priority.charAt(0).toUpperCase() + reminder.priority.slice(1)} priority`}
                        ></div>
                      </div>
                      
                      {reminder.description && (
                        <p className="reminder-description">{reminder.description}</p>
                      )}
                      
                      <div className="reminder-meta">
                        <div className="reminder-time">
                          <Clock size={14} className="meta-icon" />
                          <span>{formatTime(reminder.dueDate)}</span>
                        </div>
                        
                        {reminder.relatedApplication && (
                          <div className="reminder-application">
                            <div className="company-logo-mini">
                              {reminder.relatedApplication.company.name.charAt(0)}
                            </div>
                            <span>{reminder.relatedApplication.company.name}</span>
                          </div>
                        )}
                        
                        {reminder.notifyBefore && (
                          <div className="reminder-notification">
                            <Bell size={14} className="meta-icon" />
                            <span>{reminder.notifyBefore / 60} hours before</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="reminder-actions">
                      <button className="action-btn edit">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <Bell size={48} className="empty-icon" />
            <h3>No reminders found</h3>
            <p>No reminders match your current filter selection</p>
            <button 
              className="reset-filter-btn"
              onClick={() => setFilter('all')}
            >
              Show All Reminders
            </button>
          </div>
        )}
      </div>

      {/* Quick Add Form (would be modal in full implementation) */}
      {showAddForm && (
        <div className="quick-add-form">
          <div className="form-header">
            <h3>Add Reminder</h3>
            <button 
              className="close-btn"
              onClick={() => setShowAddForm(false)}
              aria-label="Close form"
            >
              <X size={18} />
            </button>
          </div>
          
          <div className="form-content">
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input type="text" id="title" placeholder="Reminder title..." />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description (optional)</label>
              <textarea id="description" placeholder="Add more details..." rows={3} />
            </div>
            
            <div className="form-row">
              <div className="form-group half">
                <label htmlFor="dueDate">Due Date</label>
                <input type="date" id="dueDate" />
              </div>
              
              <div className="form-group half">
                <label htmlFor="dueTime">Time</label>
                <input type="time" id="dueTime" />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select id="priority">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="application">Related Application (optional)</label>
              <select id="application">
                <option value="">None</option>
                {applications.map(app => (
                  <option key={app.id} value={app.id}>
                    {app.company.name} - {app.position}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-actions">
              <button 
                className="cancel-btn"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </button>
              <button className="save-btn">
                Save Reminder
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .reminders-section {
          display: flex;
          flex-direction: column;
          gap: 24px;
          position: relative;
        }
        
        .reminders-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 8px;
        }
        
        .filter-tabs {
          display: flex;
          background: var(--glass-bg);
          border-radius: var(--border-radius);
          padding: 4px;
          border: 1px solid var(--border-thin);
          box-shadow: var(--shadow-sharp);
        }
        
        .filter-tab {
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
        
        .filter-tab:hover {
          color: var(--text-primary);
          background: var(--hover-bg);
        }
        
        .filter-tab.active {
          background: var(--active-bg);
          color: var(--accent-orange);
        }
        
        .reminders-list {
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
          gap: 12px;
          margin-bottom: 8px;
        }
        
        .date-label {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-secondary);
          white-space: nowrap;
        }
        
        .date-line {
          flex: 1;
          height: 1px;
          background-color: var(--border-divider);
        }
        
        .reminder-items {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .reminder-item {
          display: flex;
          gap: 12px;
          padding: 16px;
          background: var(--glass-card-bg);
          border-radius: var(--border-radius);
          border: 1px solid var(--border-thin);
          box-shadow: var(--shadow);
          transition: all 0.2s ease;
        }
        
        .reminder-item:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
          border-color: var(--border-hover);
        }
        
        .reminder-item.completed {
          opacity: 0.6;
        }
        
        .reminder-item.completed .reminder-title,
        .reminder-item.completed .reminder-description {
          text-decoration: line-through;
          color: var(--text-tertiary);
        }
        
        .reminder-status {
          display: flex;
          align-items: flex-start;
          padding-top: 2px;
        }
        
        .status-checkbox {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          border: 2px solid var(--border-divider);
          background: var(--glass-bg);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          color: white;
          padding: 0;
        }
        
        .status-checkbox:hover {
          border-color: var(--accent-orange);
          transform: scale(1.1);
        }
        
        .status-checkbox.completed {
          background: var(--accent-success);
          border-color: var(--accent-success);
        }
        
        .reminder-content {
          flex: 1;
          min-width: 0;
        }
        
        .reminder-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 6px;
        }
        
        .reminder-title {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
        }
        
        .priority-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        
        .reminder-description {
          margin: 0 0 12px 0;
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.4;
        }
        
        .reminder-meta {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
          font-size: 13px;
          color: var(--text-tertiary);
        }
        
        .reminder-time,
        .reminder-notification {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .meta-icon {
          color: var(--text-tertiary);
        }
        
        .reminder-application {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .company-logo-mini {
          width: 18px;
          height: 18px;
          border-radius: 4px;
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-orange));
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 600;
          color: white;
        }
        
        .reminder-actions {
          display: flex;
          gap: 8px;
        }
        
        .action-btn {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: none;
          background: transparent;
          color: var(--text-tertiary);
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
        }
        
        .action-btn:hover {
          background: var(--hover-bg);
          color: var(--text-primary);
          transform: translateY(-1px);
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
          background: var(--accent-orange);
          color: white;
          border: none;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .reset-filter-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(var(--accent-orange-rgb), 0.3);
        }
        
        .add-reminder-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: var(--border-radius);
          background: var(--accent-orange);
          color: white;
          border: none;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 6px rgba(var(--accent-orange-rgb), 0.25);
        }
        
        .add-reminder-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(var(--accent-orange-rgb), 0.3);
        }
        
        /* Quick Add Form Styles */
        .quick-add-form {
          position: absolute;
          top: 64px;
          right: 0;
          width: 400px;
          background: var(--glass-card-bg);
          border-radius: var(--border-radius);
          border: 1px solid var(--border-thin);
          box-shadow: var(--shadow-lg);
          backdrop-filter: blur(var(--blur-amount));
          -webkit-backdrop-filter: blur(var(--blur-amount));
          z-index: 100;
          animation: slide-in 0.3s var(--easing-standard);
        }
        
        .form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          border-bottom: 1px solid var(--border-divider);
        }
        
        .form-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary);
        }
        
        .close-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: none;
          background: var(--hover-bg);
          color: var(--text-tertiary);
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
        }
        
        .close-btn:hover {
          background: var(--active-bg);
          color: var(--text-primary);
          transform: scale(1.05);
        }
        
        .form-content {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        
        .form-row {
          display: flex;
          gap: 16px;
        }
        
        .form-group.half {
          flex: 1;
          min-width: 0;
        }
        
        label {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-secondary);
        }
        
        input[type="text"],
        input[type="date"],
        input[type="time"],
        textarea,
        select {
          padding: 10px 12px;
          border-radius: var(--border-radius);
          border: 1px solid var(--border-thin);
          background: var(--glass-bg);
          color: var(--text-primary);
          font-size: 14px;
          transition: all 0.2s ease;
          outline: none;
          width: 100%;
        }
        
        input:focus,
        textarea:focus,
        select:focus {
          border-color: var(--accent-orange);
          box-shadow: 0 0 0 2px rgba(var(--accent-orange-rgb), 0.1);
        }
        
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 8px;
        }
        
        .cancel-btn {
          padding: 8px 16px;
          border-radius: var(--border-radius);
          background: transparent;
          color: var(--text-secondary);
          border: 1px solid var(--border-thin);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .cancel-btn:hover {
          background: var(--hover-bg);
          color: var(--text-primary);
        }
        
        .save-btn {
          padding: 8px 16px;
          border-radius: var(--border-radius);
          background: var(--accent-orange);
          color: white;
          border: none;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 6px rgba(var(--accent-orange-rgb), 0.25);
        }
        
        .save-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(var(--accent-orange-rgb), 0.3);
        }
        
        @keyframes slide-in {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @media (max-width: 768px) {
          .filter-tabs {
            width: 100%;
            overflow-x: auto;
          }
          
          .quick-add-form {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: calc(100% - 32px);
            max-width: 400px;
            max-height: 90vh;
            overflow-y: auto;
            animation: pop-in 0.3s var(--easing-standard);
          }
          
          .form-row {
            flex-direction: column;
            gap: 16px;
          }
          
          @keyframes pop-in {
            from {
              transform: translate(-50%, -50%) scale(0.9);
              opacity: 0;
            }
            to {
              transform: translate(-50%, -50%) scale(1);
              opacity: 1;
            }
          }
        }
      `}</style>
    </section>
  );
}