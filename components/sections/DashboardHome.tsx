'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, Bell, Calendar, Search, CheckCircle, Activity, TrendingUp, ArrowUpRight,
  BarChart2, MoreHorizontal, ChevronRight, ChevronDown, Clock, Target, Users, Plus,
  X, SlidersHorizontal
} from 'lucide-react';
import CardHeader from '../CardHeader';
import StatCard from '../dashboard/StatCard';
import ActivityItem from '../dashboard/ActivityItem';
import UpcomingEvent from '../dashboard/UpcomingEvent';
import GoalCard from '../dashboard/GoalCard';
import StageCard from '../dashboard/StageCard';
import ActionButton from '../dashboard/ActionButton';

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
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Initialize data
  const activities = generateActivities();
  const upcomingEvents = generateUpcomingEvents();
  const appStats = generateStats();
  const monthlyGoals = generateGoals();
  
  // Animation effect on mount
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const stageDescriptions = {
    applied: 'Initial applications submitted but no response yet',
    screening: 'Initial reviews, assessments, and phone interviews',
    interview: 'Technical and team interviews in progress',
    offer: 'Job offers received or being negotiated',
    rejected: 'Applications that were not successful'
  };
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  // Handle view all buttons
  const handleViewAll = (section: string) => {
    console.log(`View all clicked for ${section}`);
    // Navigate to full view of the section or open modal
  };
  
  return (
    <section className={`dashboard-home ${mounted ? 'mounted' : ''}`}>
      <CardHeader
        title="Dashboard Overview"
        subtitle="Track your job search progress and upcoming tasks"
        accentColor="var(--accent-blue)"
        variant="default"
      >
        <div className={`dashboard-search ${isSearchFocused ? 'focused' : ''}`}>
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search applications, companies..."
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className="search-input"
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm("")}>
              <X size={14} />
            </button>
          )}
        </div>
      </CardHeader>
      
      <div className="stats-summary">
        <StatCard
          value={appStats.totalApplications}
          label="Applications"
          icon={FileText}
          color="var(--accent-blue)"
          trend={{ value: 20, isPositive: true }}
          onClick={() => console.log('Applications stat clicked')}
        />
        
        <StatCard
          value={appStats.interviewsScheduled}
          label="Interviews"
          icon={Calendar}
          color="var(--accent-green)"
          onClick={() => console.log('Interviews stat clicked')}
        />
        
        <StatCard
          value={`${appStats.successRate}%`}
          label="Success Rate"
          icon={Activity}
          color="var(--accent-orange)"
          onClick={() => console.log('Success rate stat clicked')}
        />
        
        <StatCard
          value={appStats.tasksdue}
          label="Tasks Due"
          icon={Bell}
          color="var(--accent-purple)"
          onClick={() => console.log('Tasks due stat clicked')}
        />
      </div>
      
      <div className="dashboard-grid">
        <div className="dashboard-card activity-card">
          <div className="card-header">
            <h3 className="card-title">Recent Activity</h3>
            <ActionButton 
              label="View All"
              icon={ChevronRight}
              variant="ghost"
              size="small"
              onClick={() => handleViewAll('activities')}
            />
          </div>
          
          <div className="activity-timeline">
            {activities.slice(0, 4).map((activity, index) => (
              <ActivityItem
                key={activity.id}
                id={activity.id}
                type={activity.type}
                title={activity.title}
                companyName={activity.company.name}
                companyLogo={activity.company.logo}
                timestamp={activity.timestamp}
                details={activity.details}
                isLast={index === activities.slice(0, 4).length - 1}
                onClick={() => console.log(`Activity ${activity.id} clicked`)}
              />
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
            <ActionButton 
              label="Calendar"
              icon={Calendar}
              variant="ghost"
              size="small"
              onClick={() => handleViewAll('calendar')}
            />
          </div>
          
          <div className="upcoming-events">
            {upcomingEvents.map(event => (
              <UpcomingEvent
                key={event.id}
                id={event.id}
                title={event.title}
                companyName={event.company.name}
                companyLogo={event.company.logo}
                date={event.date}
                time={event.time}
                type={event.type}
                details={event.details}
                location={event.location}
                duration={event.duration}
                onClick={() => console.log(`Event ${event.id} clicked`)}
              />
            ))}
            
            <button className="add-event-btn">
              <Calendar size={16} />
              <span>Add Event</span>
              <div className="btn-bg"></div>
            </button>
          </div>
        </div>
        
        <div className="dashboard-card goals-card">
          <div className="card-header">
            <h3 className="card-title">Monthly Goals</h3>
            <ActionButton 
              label="View All"
              icon={ChevronRight}
              variant="ghost"
              size="small"
              onClick={() => handleViewAll('goals')}
            />
          </div>
          
          <div className="goals-list">
            {monthlyGoals.map(goal => (
              <GoalCard
                key={goal.id}
                id={goal.id}
                goal={goal.goal}
                current={goal.current}
                target={goal.target}
                onClick={() => console.log(`Goal ${goal.id} clicked`)}
              />
            ))}
            
            <button className="add-goal-btn">
              <Target size={16} />
              <span>Set New Goal</span>
              <div className="btn-bg"></div>
            </button>
          </div>
        </div>
      </div>
      
      <div className="application-stages">
        <div className="stages-header">
          <h3 className="stages-title">Application Stages</h3>
          <ActionButton 
            label="Manage Stages"
            icon={SlidersHorizontal}
            variant="secondary"
            size="small"
            onClick={() => console.log('Manage stages clicked')}
          />
        </div>
        
        <div className="stages-grid">
          <StageCard
            stageName="applied"
            count={appStats.stageCount.applied}
            description={stageDescriptions.applied}
            color="var(--accent-blue)"
            onClick={() => console.log('Applied stage clicked')}
          />
          
          <StageCard
            stageName="screening"
            count={appStats.stageCount.screening}
            description={stageDescriptions.screening}
            color="var(--accent-purple)"
            onClick={() => console.log('Screening stage clicked')}
          />
          
          <StageCard
            stageName="interview"
            count={appStats.stageCount.interview}
            description={stageDescriptions.interview}
            color="var(--accent-green)"
            onClick={() => console.log('Interview stage clicked')}
          />
          
          <StageCard
            stageName="offer"
            count={appStats.stageCount.offer}
            description={stageDescriptions.offer}
            color="var(--accent-success)"
            onClick={() => console.log('Offer stage clicked')}
          />
          
          <StageCard
            stageName="rejected"
            count={appStats.stageCount.rejected}
            description={stageDescriptions.rejected}
            color="var(--accent-red)"
            onClick={() => console.log('Rejected stage clicked')}
          />
        </div>
      </div>
      
      {/* Quick Actions Floating Button */}
      <button className="quick-actions-button">
        <Plus size={20} className="plus-icon" />
        <span className="button-tooltip">Quick Actions</span>
      </button>
      
      <style jsx>{`
        .dashboard-home {
          display: flex;
          flex-direction: column;
          gap: 28px;
          opacity: 0;
          transform: translateY(10px);
          transition: all 0.6s var(--easing-standard);
        }
        
        .dashboard-home.mounted {
          opacity: 1;
          transform: translateY(0);
        }
        
        .dashboard-search {
          position: relative;
          width: 250px;
          transition: all 0.3s var(--easing-standard);
        }
        
        .dashboard-search.focused {
          width: 280px;
        }
        
        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-tertiary);
          transition: color 0.3s var(--easing-standard);
        }
        
        .dashboard-search.focused .search-icon {
          color: var(--accent-blue);
        }
        
        .search-input {
          width: 100%;
          padding: 10px 10px 10px 36px;
          border-radius: var(--border-radius);
          border: 1px solid var(--border-thin);
          background: var(--glass-bg);
          color: var(--text-primary);
          outline: none;
          transition: all 0.3s var(--easing-standard);
        }
        
        .search-input:focus {
          border-color: var(--accent-blue);
          box-shadow: 0 0 0 3px rgba(var(--accent-blue-rgb), 0.1);
        }
        
        .clear-search {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: var(--hover-bg);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-tertiary);
          cursor: pointer;
          transition: all 0.2s var(--easing-standard);
        }
        
        .clear-search:hover {
          background: var(--active-bg);
          color: var(--text-primary);
        }
        
        /* Stats Summary */
        .stats-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
          animation: slideUp 0.5s var(--easing-standard) both;
          animation-delay: 0.1s;
        }
        
        /* Dashboard Grid */
        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
          animation: slideUp 0.5s var(--easing-standard) both;
          animation-delay: 0.2s;
        }
        
        .dashboard-card {
          background: var(--glass-card-bg);
          border-radius: var(--border-radius);
          border: 1px solid var(--border-thin);
          display: flex;
          flex-direction: column;
          gap: 20px;
          box-shadow: var(--shadow);
          height: 100%;
          overflow: hidden;
          transition: transform 0.3s var(--easing-standard), box-shadow 0.3s var(--easing-standard);
        }
        
        .dashboard-card:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-lg);
        }
        
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border-divider);
        }
        
        .card-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }
        
        /* Activity Timeline */
        .activity-timeline {
          display: flex;
          flex-direction: column;
          padding: 0 20px 20px;
        }
        
        .timeline-end {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 16px;
          cursor: pointer;
          transition: all 0.2s var(--easing-standard);
          padding: 10px;
          border-radius: var(--border-radius);
        }
        
        .timeline-end:hover {
          background: var(--hover-bg);
        }
        
        .timeline-end-icon {
          width: 28px;
          height: 28px;
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
          padding: 0 20px 20px;
        }
        
        .add-event-btn, .add-goal-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          background: transparent;
          border: 1px dashed var(--border-divider);
          border-radius: var(--border-radius);
          color: var(--text-secondary);
          font-size: 14px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: all 0.3s var(--easing-standard);
          margin-top: 10px;
        }
        
        .btn-bg {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: var(--hover-bg);
          opacity: 0;
          transition: opacity 0.3s var(--easing-standard);
          z-index: -1;
        }
        
        .add-event-btn:hover, .add-goal-btn:hover {
          color: var(--text-primary);
          border-color: var(--border-hover);
          transform: translateY(-2px);
        }
        
        .add-event-btn:hover .btn-bg, .add-goal-btn:hover .btn-bg {
          opacity: 1;
        }
        
        /* Goals List */
        .goals-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 0 20px 20px;
        }
        
        /* Application Stages */
        .application-stages {
          display: flex;
          flex-direction: column;
          gap: 20px;
          animation: slideUp 0.5s var(--easing-standard) both;
          animation-delay: 0.3s;
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
        
        /* Quick Actions Button */
        .quick-actions-button {
          position: fixed;
          bottom: 30px;
          right: 30px;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          border: none;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(var(--accent-primary-rgb), 0.4);
          cursor: pointer;
          transition: all 0.3s var(--easing-standard);
          z-index: 100;
        }
        
        .quick-actions-button:hover {
          transform: translateY(-3px) scale(1.05);
          box-shadow: 0 6px 20px rgba(var(--accent-primary-rgb), 0.5);
        }
        
        .quick-actions-button:active {
          transform: scale(0.95);
        }
        
        .plus-icon {
          transition: transform 0.3s var(--easing-standard);
        }
        
        .quick-actions-button:hover .plus-icon {
          transform: rotate(90deg);
        }
        
        .button-tooltip {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-bottom: 10px;
          padding: 5px 10px;
          background: var(--glass-card-bg);
          border-radius: 5px;
          font-size: 12px;
          color: var(--text-primary);
          white-space: nowrap;
          opacity: 0;
          visibility: hidden;
          transition: all 0.2s var(--easing-standard);
        }
        
        .button-tooltip::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border-width: 5px;
          border-style: solid;
          border-color: var(--glass-card-bg) transparent transparent transparent;
        }
        
        .quick-actions-button:hover .button-tooltip {
          opacity: 1;
          visibility: visible;
          transform: translateX(-50%) translateY(-5px);
        }
        
        /* Animations */
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
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
          
          .quick-actions-button {
            bottom: 20px;
            right: 20px;
          }
        }
      `}</style>
    </section>
  );
}