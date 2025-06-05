'use client';

import React, { useState } from 'react';
import { Bell, Calendar, Clock, PlusCircle, CheckCircle, Trash2, MoreHorizontal, AlertCircle, X } from 'lucide-react';
import CardHeader from '../CardHeader';
import EnhancedDropdown from '../EnhancedDropdown';

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
  const [localReminders, setLocalReminders] = useState<Reminder[]>(reminders);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state for new reminder with default values
  const [newReminder, setNewReminder] = useState({
    title: '',
    description: '',
    dueDate: new Date().toISOString().split('T')[0], // Default to today's date in YYYY-MM-DD format
    dueTime: new Date().toTimeString().slice(0, 5), // Default to current time in HH:MM format
    priority: 'medium' as ReminderPriority,
    relatedApplicationId: ''
  });
  
  // Reset form to initial state
  const resetForm = () => {
    setNewReminder({
      title: '',
      description: '',
      dueDate: new Date().toISOString().split('T')[0], // Default to today's date in YYYY-MM-DD format
      dueTime: new Date().toTimeString().slice(0, 5), // Default to current time in HH:MM format
      priority: 'medium' as ReminderPriority,
      relatedApplicationId: ''
    });
    setFormErrors({});
  };
  
  // Validate form fields
  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};
    
    if (!newReminder.title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!newReminder.dueDate) {
      errors.dueDate = 'Due date is required';
    }
    
    if (!newReminder.dueTime) {
      errors.dueTime = 'Due time is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submission
  const handleSubmitReminder = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    // Create combined date from date and time inputs
    const [year, month, day] = newReminder.dueDate.split('-').map(Number);
    const [hours, minutes] = newReminder.dueTime.split(':').map(Number);
    const dueDateTime = new Date(year, month - 1, day, hours, minutes);
    
    // Create a new reminder object
    const reminder: Reminder = {
      id: `rem${Date.now()}`, // Generate a unique ID
      title: newReminder.title,
      description: newReminder.description || undefined,
      dueDate: dueDateTime,
      priority: newReminder.priority,
      status: 'pending',
      relatedApplication: newReminder.relatedApplicationId 
        ? applications.find(app => app.id === newReminder.relatedApplicationId)
        : undefined
    };
    
    // In a real app, we would call an API here
    // For demo purposes, we'll just update the local state
    setTimeout(() => {
      setLocalReminders(prevReminders => [...prevReminders, reminder]);
      setIsSubmitting(false);
      resetForm();
      setShowAddForm(false);
      
      // Show success toast/notification (implementation would depend on your UI library)
      console.log('Reminder created successfully!', reminder);
    }, 500); // Simulate API delay
  };
  
  // Filter reminders based on status
  const filteredReminders = localReminders.filter(reminder => {
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
    setLocalReminders(prevReminders => 
      prevReminders.map(reminder => 
        reminder.id === id 
          ? { ...reminder, status: reminder.status === 'completed' ? 'pending' : 'completed' }
          : reminder
      )
    );
  };
  
  // Delete reminder
  const deleteReminder = (id: string) => {
    if (confirm('Are you sure you want to delete this reminder?')) {
      setLocalReminders(prevReminders => 
        prevReminders.filter(reminder => reminder.id !== id)
      );
    }
  };

  return (
    <section className="reminders-section reveal-element">
      <CardHeader
        title="Reminders"
        subtitle={`Track tasks and deadlines (${localReminders.filter(r => r.status === 'pending').length} pending)`}
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
                      <button 
                        className="action-btn delete"
                        onClick={() => deleteReminder(reminder.id)}
                        aria-label="Delete reminder"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button 
                        className="action-btn edit"
                        aria-label="More options"
                      >
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
              onClick={() => {
                setShowAddForm(false);
                resetForm();
              }}
              aria-label="Close form"
            >
              <X size={18} />
            </button>
          </div>
          
          <form onSubmit={handleSubmitReminder} className="form-content">
            <div className={`form-group ${formErrors.title ? 'has-error' : ''}`}>
              <label htmlFor="title">Title</label>
              <input 
                type="text" 
                id="title" 
                placeholder="Reminder title..." 
                value={newReminder.title}
                onChange={(e) => setNewReminder({...newReminder, title: e.target.value})}
              />
              {formErrors.title && (
                <div className="error-message">{formErrors.title}</div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description (optional)</label>
              <textarea 
                id="description" 
                placeholder="Add more details..." 
                rows={3} 
                value={newReminder.description}
                onChange={(e) => setNewReminder({...newReminder, description: e.target.value})}
              />
            </div>
            
            <div className="form-row">
              <div className={`form-group half ${formErrors.dueDate ? 'has-error' : ''}`}>
                <label htmlFor="dueDate">Due Date</label>
                <div className="date-input-wrapper">
                  <Calendar size={16} className="date-input-icon" />
                  <input 
                    type="date" 
                    id="dueDate" 
                    value={newReminder.dueDate}
                    onChange={(e) => setNewReminder({...newReminder, dueDate: e.target.value})}
                    min={new Date().toISOString().split('T')[0]} // Prevent selecting dates in the past
                  />
                </div>
                {formErrors.dueDate && (
                  <div className="error-message">{formErrors.dueDate}</div>
                )}
              </div>
              
              <div className={`form-group half ${formErrors.dueTime ? 'has-error' : ''}`}>
                <label htmlFor="dueTime">Time</label>
                <div className="date-input-wrapper">
                  <Clock size={16} className="date-input-icon" />
                  <input 
                    type="time" 
                    id="dueTime" 
                    value={newReminder.dueTime}
                    onChange={(e) => setNewReminder({...newReminder, dueTime: e.target.value})}
                  />
                </div>
                {formErrors.dueTime && (
                  <div className="error-message">{formErrors.dueTime}</div>
                )}
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <EnhancedDropdown
                options={[
                  { value: 'low', label: 'Low' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'high', label: 'High' }
                ]}
                value={newReminder.priority}
                onChange={(value) => setNewReminder({...newReminder, priority: value as ReminderPriority})}
                size="medium"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="application">Related Application (optional)</label>
              <EnhancedDropdown
                options={applications.map(app => ({
                  value: app.id,
                  label: `${app.company.name} - ${app.position}`
                }))}
                value={newReminder.relatedApplicationId}
                placeholder="None"
                onChange={(value) => setNewReminder({...newReminder, relatedApplicationId: value})}
                size="medium"
                searchable
              />
            </div>
            
            <div className="form-actions">
              <button 
                type="button"
                className="cancel-btn"
                onClick={() => {
                  setShowAddForm(false);
                  resetForm();
                }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className={`save-btn ${isSubmitting ? 'loading' : ''}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Reminder'}
              </button>
            </div>
          </form>
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
        
        .date-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        
        .date-input-icon {
          position: absolute;
          left: 10px;
          color: var(--text-tertiary);
          pointer-events: none;
        }
        
        input[type="date"],
        input[type="time"] {
          padding: 10px 12px 10px 36px;
          border-radius: var(--border-radius);
          border: 1px solid var(--border-thin);
          background: var(--glass-bg);
          color: var(--text-primary);
          font-size: 14px;
          transition: all 0.2s ease;
          outline: none;
          width: 100%;
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
        }
        
        /* Calendar icon styling for date inputs */
        input[type="date"]::-webkit-calendar-picker-indicator,
        input[type="time"]::-webkit-calendar-picker-indicator {
          background: transparent;
          color: var(--text-tertiary);
          position: absolute;
          right: 10px;
          width: 20px;
          height: 20px;
          cursor: pointer;
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
        
        /* Form error styles */
        .form-group.has-error input,
        .form-group.has-error textarea {
          border-color: var(--accent-red);
          box-shadow: 0 0 0 1px rgba(var(--accent-red-rgb), 0.2);
        }
        
        .error-message {
          color: var(--accent-red);
          font-size: 12px;
          margin-top: 4px;
          font-weight: 500;
        }
        
        /* Loading state */
        .save-btn.loading {
          position: relative;
          color: transparent;
        }
        
        .save-btn.loading::after {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          width: 16px;
          height: 16px;
          margin: -8px 0 0 -8px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spinner 0.6s linear infinite;
        }
        
        @keyframes spinner {
          to {
            transform: rotate(360deg);
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