'use client';

import React, { useState } from 'react';
import { 
  FileText, Bell, Calendar, Search, CheckCircle, Activity, TrendingUp, ArrowUpRight,
  BarChart2, MoreHorizontal, ChevronRight, ChevronDown, Clock, Target, Users
} from 'lucide-react';
import CardHeader from '../CardHeader';

// Types
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

interface Activity {
  id: string;
  type: 'application' | 'interview' | 'offer' | 'rejected' | 'assessment' | 'screening' | 'task' | 'email';
  title: string;
  application: Application;
  company: Company;
  timestamp: Date;
  details: string;
}

interface UpcomingEvent {
  id: string;
  title: string;
  company: Company;
  date: Date;
  time: string;
  type: 'Interview' | 'Task' | 'Deadline';
  application: Application;
  details: string;
  deadline?: Date;
  location?: string;
  duration?: number;
}

interface AppStats {
  totalApplications: number;
  stageCount: Record<'applied' | 'screening' | 'interview' | 'offer' | 'rejected', number>;
  interviewsScheduled: number;
  successRate: number;
  tasksdue: number;
  activeApplications: number;
}

interface MonthlyGoal {
  id: string;
  goal: string;
  current: number;
  target: number;
  progress: number;
}

// Mock Data (similar to what we have in index.tsx)
const companies: Company[] = [
  { id: 'c1', name: 'Google', logo: '/companies/google.svg', industry: 'Technology' },
  { id: 'c2', name: 'Microsoft', logo: '/companies/microsoft.svg', industry: 'Technology' },
  { id: 'c3', name: 'Apple', logo: '/companies/apple.svg', industry: 'Technology' },
  { id: 'c4', name: 'Amazon', logo: '/companies/amazon.svg', industry: 'E-commerce' },
  { id: 'c5', name: 'Facebook', logo: '/companies/facebook.svg', industry: 'Social Media' },
  { id: 'c8', name: 'Airbnb', logo: '/companies/airbnb.svg', industry: 'Travel' },
];

const applications: Application[] = [
  {
    id: 'app1',
    position: 'Senior Frontend Developer',
    company: companies[0],
    dateApplied: new Date(2023, 11, 10),
    stage: 'interview',
  },
  {
    id: 'app2',
    position: 'Software Engineer',
    company: companies[1],
    dateApplied: new Date(2023, 11, 12),
    stage: 'screening',
  },
  {
    id: 'app3',
    position: 'iOS Developer',
    company: companies[2],
    dateApplied: new Date(2023, 11, 15),
    stage: 'applied',
  },
  {
    id: 'app4',
    position: 'Cloud Engineer',
    company: companies[3],
    dateApplied: new Date(2023, 11, 18),
    stage: 'offer',
  },
  {
    id: 'app5',
    position: 'Product Manager',
    company: companies[4],
    dateApplied: new Date(2023, 11, 20),
    stage: 'interview',
  },
  {
    id: 'app8',
    position: 'Frontend Developer',
    company: companies[5],
    dateApplied: new Date(2023, 11, 24),
    stage: 'applied',
  },
];

// Generate mock data
const generateActivities = (): Activity[] => {
  const now = new Date();
  return [
    {
      id: 'act1',
      type: 'application' as const,
      title: 'Job Application Submitted',
      application: applications[0],
      company: applications[0].company,
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      details: `Applied for ${applications[0].position} at ${applications[0].company.name}`,
    },
    {
      id: 'act2',
      type: 'interview' as const,
      title: 'Interview Invitation',
      application: applications[1],
      company: applications[1].company,
      timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      details: `Received interview invitation for ${applications[1].position} at ${applications[1].company.name}`,
    },
    {
      id: 'act3',
      type: 'offer' as const,
      title: 'Offer Received',
      application: applications[3],
      company: applications[3].company,
      timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      details: `Received job offer for ${applications[3].position} at ${applications[3].company.name}`,
    },
    {
      id: 'act5',
      type: 'assessment' as const,
      title: 'Coding Assessment Completed',
      application: applications[2],
      company: applications[2].company,
      timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      details: `Completed coding assessment for ${applications[2].position} at ${applications[2].company.name}`,
    },
    {
      id: 'act6',
      type: 'task' as const,
      title: 'Follow-up Email Sent',
      application: applications[4],
      company: applications[4].company,
      timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      details: `Sent follow-up email for ${applications[4].position} at ${applications[4].company.name}`,
    },
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

const generateUpcomingEvents = (): UpcomingEvent[] => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  const inTwoWeeks = new Date();
  inTwoWeeks.setDate(inTwoWeeks.getDate() + 14);
  
  return [
    {
      id: 'evt1',
      title: 'Technical Interview',
      company: applications[0].company,
      date: tomorrow,
      time: '10:00 AM',
      type: 'Interview' as const,
      application: applications[0],
      details: 'Technical interview with the engineering team',
      location: 'Video call (Zoom)',
      duration: 60,
    },
    {
      id: 'evt2',
      title: 'Submit Take-home Project',
      company: applications[1].company,
      date: nextWeek,
      time: '11:59 PM',
      type: 'Deadline' as const,
      application: applications[1],
      details: 'Build a demonstration project using their technology stack',
      deadline: nextWeek,
    },
    {
      id: 'evt3',
      title: 'Final Interview',
      company: applications[3].company,
      date: inTwoWeeks,
      time: '1:00 PM',
      type: 'Interview' as const,
      application: applications[3],
      details: 'Final interview with the team',
      location: 'Office',
      duration: 120,
    },
  ];
};

const generateStats = (): AppStats => {
  const totalApplications = applications.length;
  const stageCount = {
    applied: applications.filter(app => app.stage === 'applied').length,
    screening: applications.filter(app => app.stage === 'screening').length,
    interview: applications.filter(app => app.stage === 'interview').length,
    offer: applications.filter(app => app.stage === 'offer').length,
    rejected: applications.filter(app => app.stage === 'rejected').length,
  };
  
  const interviewsScheduled = generateUpcomingEvents().filter(event => event.type === 'Interview').length;
  const completedApplications = stageCount.offer + stageCount.rejected;
  const successRate = completedApplications > 0
    ? Math.round((stageCount.offer / completedApplications) * 100)
    : 0;
    
  return {
    totalApplications,
    stageCount,
    interviewsScheduled,
    successRate,
    tasksdue: generateUpcomingEvents().filter(event => event.type === 'Task' || event.type === 'Deadline').length,
    activeApplications: totalApplications - stageCount.rejected - stageCount.offer,
  };
};

const generateGoals = (): MonthlyGoal[] => {
  return [
    {
      id: 'goal1',
      goal: 'Submit 20 Applications',
      current: applications.length,
      target: 20,
      progress: Math.min(Math.round((applications.length / 20) * 100), 100),
    },
    {
      id: 'goal2',
      goal: 'Network with 15 Contacts',
      current: 11,
      target: 15,
      progress: Math.round((11 / 15) * 100),
    },
    {
      id: 'goal3',
      goal: 'Complete 5 Assessments',
      current: 4,
      target: 5,
      progress: Math.round((4 / 5) * 100),
    },
  ];
};

export default function DashboardHome() {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Initialize data
  const activities = generateActivities();
  const upcomingEvents = generateUpcomingEvents();
  const appStats = generateStats();
  const monthlyGoals = generateGoals();
  
  // Format date
  const formatDate = (date: Date) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dateToCheck = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (dateToCheck.getTime() === today.getTime()) {
      return 'Today';
    }
    
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    if (dateToCheck.getTime() === tomorrow.getTime()) {
      return 'Tomorrow';
    }
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  // Get activity icon based on type
  const getActivityIcon = (type: 'application' | 'interview' | 'offer' | 'rejected' | 'assessment' | 'screening' | 'task' | 'email') => {
    switch (type) {
      case 'application':
        return <FileText size={18} className="activity-icon application" />;
      case 'interview':
        return <Users size={18} className="activity-icon interview" />;
      case 'offer':
        return <CheckCircle size={18} className="activity-icon offer" />;
      case 'assessment':
        return <Target size={18} className="activity-icon assessment" />;
      case 'rejected':
        return <TrendingUp size={18} className="activity-icon rejected" />;
      case 'task':
        return <CheckCircle size={18} className="activity-icon task" />;
      case 'email':
        return <Bell size={18} className="activity-icon email" />;
      case 'screening':
        return <Activity size={18} className="activity-icon screening" />;
      default:
        return <Activity size={18} className="activity-icon" />;
    }
  };
  
  // Get event icon based on type
  const getEventIcon = (type: 'Interview' | 'Task' | 'Deadline') => {
    switch (type) {
      case 'Interview':
        return <Users size={18} className="event-icon interview" />;
      case 'Task':
        return <CheckCircle size={18} className="event-icon task" />;
      case 'Deadline':
        return <Clock size={18} className="event-icon deadline" />;
      default:
        return <Calendar size={18} className="event-icon" />;
    }
  };
  
  // Get goal progress color
  const getGoalProgressColor = (progress: number) => {
    if (progress >= 100) return 'var(--accent-success)';
    if (progress >= 60) return 'var(--accent-blue)';
    if (progress >= 30) return 'var(--accent-yellow)';
    return 'var(--accent-red)';
  };
  
  return (
    <section className="dashboard-home reveal-element">
      <CardHeader
        title="Dashboard Overview"
        subtitle="Track your job search progress and upcoming tasks"
        accentColor="var(--accent-blue)"
        variant="default"
      >
        <div className="dashboard-search">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search applications, companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </CardHeader>
      
      <div className="stats-summary reveal-element">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(var(--accent-blue-rgb), 0.1)' }}>
            <FileText size={24} color="var(--accent-blue)" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{appStats.totalApplications}</div>
            <div className="stat-label">Applications</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(var(--accent-green-rgb), 0.1)' }}>
            <Calendar size={24} color="var(--accent-green)" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{appStats.interviewsScheduled}</div>
            <div className="stat-label">Interviews</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(var(--accent-orange-rgb), 0.1)' }}>
            <Activity size={24} color="var(--accent-orange)" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{appStats.successRate}%</div>
            <div className="stat-label">Success Rate</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(var(--accent-purple-rgb), 0.1)' }}>
            <Bell size={24} color="var(--accent-purple)" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{appStats.tasksdue}</div>
            <div className="stat-label">Tasks Due</div>
          </div>
        </div>
      </div>
      
      <div className="dashboard-grid reveal-element">
        <div className="dashboard-card activity-card">
          <div className="card-header">
            <h3 className="card-title">Recent Activity</h3>
            <button className="view-all-btn">
              <span>View All</span>
              <ChevronRight size={16} />
            </button>
          </div>
          
          <div className="activity-timeline">
            {activities.slice(0, 4).map(activity => (
              <div key={activity.id} className="timeline-item">
                <div className="timeline-icon">
                  {getActivityIcon(activity.type)}
                </div>
                
                <div className="timeline-content">
                  <div className="timeline-header">
                    <h4 className="timeline-title">{activity.title}</h4>
                    <span className="timeline-time">
                      {formatDate(activity.timestamp)}
                    </span>
                  </div>
                  
                  <div className="timeline-details">
                    <div className="company-info">
                      <span className="company-logo">{activity.company.name.charAt(0)}</span>
                      <span className="company-name">{activity.company.name}</span>
                    </div>
                    <p className="timeline-description">{activity.details}</p>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="timeline-end">
              <div className="timeline-end-icon">
                <MoreHorizontal size={16} />
              </div>
              <span className="timeline-end-text">See more activities</span>
            </div>
          </div>
        </div>
        
        <div className="dashboard-card upcoming-card">
          <div className="card-header">
            <h3 className="card-title">Upcoming</h3>
            <button className="view-all-btn">
              <span>Calendar</span>
              <ChevronRight size={16} />
            </button>
          </div>
          
          <div className="upcoming-events">
            {upcomingEvents.map(event => (
              <div key={event.id} className="event-item">
                <div className="event-date">
                  <div className="date-label">{formatDate(event.date)}</div>
                  <div className="time-label">{event.time}</div>
                </div>
                
                <div className="event-details">
                  <div className="event-header">
                    <h4 className="event-title">{event.title}</h4>
                    <span className={`event-type ${event.type.toLowerCase()}`}>
                      {getEventIcon(event.type)}
                      <span>{event.type}</span>
                    </span>
                  </div>
                  
                  <div className="event-company">
                    <span className="company-logo">{event.company.name.charAt(0)}</span>
                    <span className="company-name">{event.company.name}</span>
                  </div>
                  
                  {event.location && (
                    <div className="event-location">
                      <span className="location-label">Location:</span>
                      <span className="location-value">{event.location}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            <button className="add-event-btn">
              <Calendar size={16} />
              <span>Add Event</span>
            </button>
          </div>
        </div>
        
        <div className="dashboard-card goals-card">
          <div className="card-header">
            <h3 className="card-title">Monthly Goals</h3>
            <button className="view-all-btn">
              <span>View All</span>
              <ChevronRight size={16} />
            </button>
          </div>
          
          <div className="goals-list">
            {monthlyGoals.map(goal => (
              <div key={goal.id} className="goal-item">
                <div className="goal-header">
                  <h4 className="goal-title">{goal.goal}</h4>
                  <div className="goal-progress-text">
                    <span className="current-value">{goal.current}</span>
                    <span className="separator">/</span>
                    <span className="target-value">{goal.target}</span>
                  </div>
                </div>
                
                <div className="goal-progress-bar-container">
                  <div 
                    className="goal-progress-bar"
                    style={{ 
                      width: `${goal.progress}%`,
                      backgroundColor: getGoalProgressColor(goal.progress)
                    }}
                  >
                    {goal.progress >= 100 && (
                      <CheckCircle size={14} className="complete-icon" />
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            <button className="add-goal-btn">
              <Target size={16} />
              <span>Set New Goal</span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="application-stages reveal-element">
        <div className="stages-header">
          <h3 className="stages-title">Application Stages</h3>
        </div>
        
        <div className="stages-grid">
          <div className="stage-card">
            <div className="stage-header" style={{ backgroundColor: 'rgba(var(--accent-blue-rgb), 0.1)' }}>
              <span className="stage-indicator" style={{ backgroundColor: 'var(--accent-blue)' }}></span>
              <span className="stage-name">Applied</span>
              <span className="stage-count">{appStats.stageCount.applied}</span>
            </div>
            <div className="stage-description">
              Initial applications submitted but no response yet
            </div>
          </div>
          
          <div className="stage-card">
            <div className="stage-header" style={{ backgroundColor: 'rgba(var(--accent-purple-rgb), 0.1)' }}>
              <span className="stage-indicator" style={{ backgroundColor: 'var(--accent-purple)' }}></span>
              <span className="stage-name">Screening</span>
              <span className="stage-count">{appStats.stageCount.screening}</span>
            </div>
            <div className="stage-description">
              Initial reviews, assessments, and phone interviews
            </div>
          </div>
          
          <div className="stage-card">
            <div className="stage-header" style={{ backgroundColor: 'rgba(var(--accent-green-rgb), 0.1)' }}>
              <span className="stage-indicator" style={{ backgroundColor: 'var(--accent-green)' }}></span>
              <span className="stage-name">Interview</span>
              <span className="stage-count">{appStats.stageCount.interview}</span>
            </div>
            <div className="stage-description">
              Technical and team interviews in progress
            </div>
          </div>
          
          <div className="stage-card">
            <div className="stage-header" style={{ backgroundColor: 'rgba(var(--accent-success-rgb), 0.1)' }}>
              <span className="stage-indicator" style={{ backgroundColor: 'var(--accent-success)' }}></span>
              <span className="stage-name">Offer</span>
              <span className="stage-count">{appStats.stageCount.offer}</span>
            </div>
            <div className="stage-description">
              Job offers received or being negotiated
            </div>
          </div>
          
          <div className="stage-card">
            <div className="stage-header" style={{ backgroundColor: 'rgba(var(--accent-red-rgb), 0.1)' }}>
              <span className="stage-indicator" style={{ backgroundColor: 'var(--accent-red)' }}></span>
              <span className="stage-name">Rejected</span>
              <span className="stage-count">{appStats.stageCount.rejected}</span>
            </div>
            <div className="stage-description">
              Applications that were not successful
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .dashboard-home {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }
        
        .dashboard-search {
          position: relative;
          width: 250px;
        }
        
        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-tertiary);
        }
        
        .search-input {
          width: 100%;
          padding: 10px 10px 10px 36px;
          border-radius: var(--border-radius);
          border: 1px solid var(--border-thin);
          background: var(--glass-bg);
          color: var(--text-primary);
          outline: none;
          transition: all 0.2s ease;
        }
        
        .search-input:focus {
          border-color: var(--accent-blue);
          box-shadow: 0 0 0 2px rgba(var(--accent-blue-rgb), 0.1);
        }
        
        /* Stats Summary */
        .stats-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
        }
        
        .stat-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: var(--glass-card-bg);
          border-radius: var(--border-radius);
          border: 1px solid var(--border-thin);
          box-shadow: var(--shadow);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .stat-card:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-lg);
        }
        
        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: var(--border-radius);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .stat-content {
          display: flex;
          flex-direction: column;
        }
        
        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: var(--text-primary);
        }
        
        .stat-label {
          font-size: 14px;
          color: var(--text-tertiary);
        }
        
        /* Dashboard Grid */
        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
        }
        
        .dashboard-card {
          background: var(--glass-card-bg);
          border-radius: var(--border-radius);
          border: 1px solid var(--border-thin);
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          box-shadow: var(--shadow);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          height: 100%;
        }
        
        .dashboard-card:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-lg);
        }
        
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--border-divider);
        }
        
        .card-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }
        
        .view-all-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: transparent;
          border: none;
          color: var(--accent-primary);
          font-size: 14px;
          cursor: pointer;
          padding: 6px 10px;
          border-radius: var(--border-radius);
          transition: background 0.2s ease;
        }
        
        .view-all-btn:hover {
          background: var(--hover-bg);
        }
        
        /* Activity Timeline */
        .activity-timeline {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .timeline-item {
          display: flex;
          gap: 12px;
        }
        
        .timeline-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          position: relative;
        }
        
        .timeline-icon::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          height: calc(100% + 8px);
          width: 1px;
          background-color: var(--border-divider);
        }
        
        .timeline-item:last-child .timeline-icon::after {
          display: none;
        }
        
        .activity-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          padding: 7px;
          background: var(--hover-bg);
          z-index: 1;
        }
        
        .activity-icon.application {
          color: var(--accent-blue);
          background: rgba(var(--accent-blue-rgb), 0.1);
        }
        
        .activity-icon.interview {
          color: var(--accent-green);
          background: rgba(var(--accent-green-rgb), 0.1);
        }
        
        .activity-icon.offer {
          color: var(--accent-success);
          background: rgba(var(--accent-success-rgb), 0.1);
        }
        
        .activity-icon.assessment {
          color: var(--accent-orange);
          background: rgba(var(--accent-orange-rgb), 0.1);
        }
        
        .activity-icon.rejected {
          color: var(--accent-red);
          background: rgba(var(--accent-red-rgb), 0.1);
        }
        
        .activity-icon.task {
          color: var(--accent-purple);
          background: rgba(var(--accent-purple-rgb), 0.1);
        }
        
        .activity-icon.email {
          color: var(--accent-yellow);
          background: rgba(var(--accent-yellow-rgb), 0.1);
        }
        
        .timeline-content {
          flex: 1;
          min-width: 0;
        }
        
        .timeline-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 8px;
          margin-bottom: 8px;
        }
        
        .timeline-title {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
        }
        
        .timeline-time {
          font-size: 12px;
          color: var(--text-tertiary);
          white-space: nowrap;
        }
        
        .timeline-details {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .company-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .company-logo {
          width: 24px;
          height: 24px;
          border-radius: 6px;
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-purple));
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 12px;
          font-weight: 600;
        }
        
        .company-name {
          font-size: 14px;
          color: var(--text-secondary);
          font-weight: 500;
        }
        
        .timeline-description {
          margin: 0;
          font-size: 14px;
          color: var(--text-tertiary);
          line-height: 1.4;
        }
        
        .timeline-end {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .timeline-end-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--hover-bg);
          color: var(--text-tertiary);
        }
        
        .timeline-end-text {
          font-size: 14px;
          color: var(--text-secondary);
        }
        
        /* Upcoming Events */
        .upcoming-events {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .event-item {
          display: flex;
          gap: 16px;
          padding: 16px;
          background: var(--glass-bg);
          border-radius: var(--border-radius);
          border: 1px solid var(--border-thin);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .event-item:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow);
        }
        
        .event-date {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 60px;
          padding: 10px;
          background: var(--hover-bg);
          border-radius: var(--border-radius);
        }
        
        .date-label {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
        }
        
        .time-label {
          font-size: 12px;
          color: var(--text-tertiary);
          margin-top: 4px;
        }
        
        .event-details {
          flex: 1;
          min-width: 0;
        }
        
        .event-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 8px;
          margin-bottom: 8px;
        }
        
        .event-title {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
        }
        
        .event-type {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 8px;
          border-radius: 20px;
          font-size: 12px;
          white-space: nowrap;
        }
        
        .event-type.interview {
          background: rgba(var(--accent-green-rgb), 0.1);
          color: var(--accent-green);
        }
        
        .event-type.task {
          background: rgba(var(--accent-purple-rgb), 0.1);
          color: var(--accent-purple);
        }
        
        .event-type.deadline {
          background: rgba(var(--accent-red-rgb), 0.1);
          color: var(--accent-red);
        }
        
        .event-icon {
          width: 16px;
          height: 16px;
        }
        
        .event-company {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }
        
        .event-location {
          font-size: 14px;
          color: var(--text-tertiary);
        }
        
        .location-label {
          margin-right: 4px;
          font-weight: 500;
        }
        
        .add-event-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          background: var(--hover-bg);
          border: 1px dashed var(--border-divider);
          border-radius: var(--border-radius);
          color: var(--text-secondary);
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .add-event-btn:hover {
          background: var(--active-bg);
          color: var(--text-primary);
          border-color: var(--border-hover);
        }
        
        /* Goals List */
        .goals-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .goal-item {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .goal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .goal-title {
          margin: 0;
          font-size: 16px;
          font-weight: 500;
          color: var(--text-primary);
        }
        
        .goal-progress-text {
          font-size: 14px;
          font-weight: 600;
        }
        
        .current-value {
          color: var(--accent-primary);
        }
        
        .separator {
          margin: 0 2px;
          color: var(--text-tertiary);
        }
        
        .target-value {
          color: var(--text-secondary);
        }
        
        .goal-progress-bar-container {
          height: 8px;
          background: var(--hover-bg);
          border-radius: 4px;
          overflow: hidden;
          position: relative;
        }
        
        .goal-progress-bar {
          height: 100%;
          border-radius: 4px;
          position: relative;
          transition: width 0.6s ease-out;
        }
        
        .complete-icon {
          position: absolute;
          right: 4px;
          top: 50%;
          transform: translateY(-50%);
          color: white;
        }
        
        .add-goal-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          background: var(--hover-bg);
          border: 1px dashed var(--border-divider);
          border-radius: var(--border-radius);
          color: var(--text-secondary);
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: 8px;
        }
        
        .add-goal-btn:hover {
          background: var(--active-bg);
          color: var(--text-primary);
          border-color: var(--border-hover);
        }
        
        /* Application Stages */
        .application-stages {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .stages-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .stages-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }
        
        .stages-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }
        
        .stage-card {
          background: var(--glass-card-bg);
          border-radius: var(--border-radius);
          border: 1px solid var(--border-thin);
          overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          box-shadow: var(--shadow);
        }
        
        .stage-card:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-lg);
        }
        
        .stage-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 16px;
        }
        
        .stage-indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }
        
        .stage-name {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
          flex: 1;
        }
        
        .stage-count {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
          background: var(--glass-bg);
          border-radius: var(--border-radius);
          padding: 2px 10px;
          min-width: 36px;
          text-align: center;
        }
        
        .stage-description {
          padding: 0 16px 16px;
          font-size: 14px;
          color: var(--text-tertiary);
          line-height: 1.4;
        }
        
        /* Responsive */
        @media (min-width: 1200px) {
          .dashboard-grid {
            grid-template-columns: minmax(340px, 1.5fr) minmax(300px, 1fr) minmax(300px, 1fr);
          }
          
          .activity-card {
            grid-row: span 1;
            grid-column: 1;
          }
          
          .upcoming-card {
            grid-row: span 1;
            grid-column: 2;
          }
          
          .goals-card {
            grid-row: span 1;
            grid-column: 3;
          }
        }
        
        @media (max-width: 768px) {
          .dashboard-search {
            width: 100%;
            margin-top: 16px;
          }
          
          .stats-summary {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .stages-grid {
            grid-template-columns: 1fr;
          }
          
          .event-item {
            flex-direction: column;
          }
          
          .event-date {
            align-self: flex-start;
          }
          
          .event-header {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </section>
  );
}
