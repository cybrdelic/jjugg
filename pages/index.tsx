import { JSX, useState, useEffect } from 'react';
import GlassSidebar from '../components/GlassSidebar';
import { useTheme } from '@/contexts/ThemeContext';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import { SectionKey, NavItemType } from '@/components/types';
import {
  HomeIcon, ChartBarIcon, CalendarIcon, UserIcon,
  InboxIcon, DocumentTextIcon, PencilIcon, CogIcon
} from '@heroicons/react/24/outline';
import {
  House, FileText, Bell, PieChart, Users, User, Target,
  Clock, Search, Calendar, TrendingUp, ArrowUpRight, Briefcase,
  CheckCircle, CreditCard, Activity, BarChart2, Award, Sun, Moon,
  Settings, Palette,
  Menu,
  ChevronLeft
} from 'lucide-react';

type ApplicationStage = 'applied' | 'screening' | 'interview' | 'offer' | 'rejected';
type ActivityType = 'application' | 'interview' | 'email' | 'viewed' | 'assessment' | 'offer' | 'screening' | 'rejected';
type EventType = 'Interview' | 'Task' | 'Deadline';

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
  stage: ApplicationStage;
  jobDescription: string;
  salary: string;
  location: string;
  remote: boolean;
  notes: string;
  contacts: { name: string; role: string; email: string }[];
}

interface Activity {
  id: string;
  type: ActivityType;
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
  type: EventType;
  application: Application;
  details: string;
  deadline?: Date;
  location?: string;
  duration?: number;
}

interface AppStats {
  totalApplications: number;
  stageCount: Record<ApplicationStage, number>;
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

// **Mock Data**
const userProfile = {
  id: '123456',
  name: 'John Anderson',
  email: 'john.anderson@example.com',
  avatar: '/avatar.jpg',
  jobTitle: 'Senior Frontend Developer',
  yearsExperience: 5,
  location: 'San Francisco, CA',
  skills: ['React', 'TypeScript', 'Next.js', 'UI/UX', 'GraphQL'],
  salary: {
    min: 120000,
    max: 150000,
    currency: 'USD',
  },
};

const companies: Company[] = [
  { id: 'c1', name: 'Google', logo: '/companies/google.svg', industry: 'Technology' },
  { id: 'c2', name: 'Microsoft', logo: '/companies/microsoft.svg', industry: 'Technology' },
  { id: 'c3', name: 'Apple', logo: '/companies/apple.svg', industry: 'Technology' },
  { id: 'c4', name: 'Amazon', logo: '/companies/amazon.svg', industry: 'E-commerce' },
  { id: 'c5', name: 'Facebook', logo: '/companies/facebook.svg', industry: 'Social Media' },
  { id: 'c6', name: 'Netflix', logo: '/companies/netflix.svg', industry: 'Entertainment' },
  { id: 'c7', name: 'Stripe', logo: '/companies/stripe.svg', industry: 'Fintech' },
  { id: 'c8', name: 'Airbnb', logo: '/companies/airbnb.svg', industry: 'Travel' },
  { id: 'c9', name: 'Uber', logo: '/companies/uber.svg', industry: 'Transportation' },
  { id: 'c10', name: 'Slack', logo: '/companies/slack.svg', industry: 'Technology' },
  { id: 'c11', name: 'Spotify', logo: '/companies/spotify.svg', industry: 'Music' },
  { id: 'c12', name: 'Adobe', logo: '/companies/adobe.svg', industry: 'Software' },
  { id: 'c13', name: 'Salesforce', logo: '/companies/salesforce.svg', industry: 'CRM' },
];

const applications: Application[] = [
  {
    id: 'app1',
    position: 'Senior Frontend Developer',
    company: companies[0],
    dateApplied: new Date(2023, 11, 10),
    stage: 'interview',
    jobDescription: 'Building and maintaining Google Maps web applications...',
    salary: '$140,000 - $180,000',
    location: 'Mountain View, CA',
    remote: false,
    notes: 'Had a great initial call with the recruiter',
    contacts: [{ name: 'Sarah Johnson', role: 'Recruiter', email: 'sarah.j@google.com' }],
  },
  {
    id: 'app2',
    position: 'Software Engineer',
    company: companies[1],
    dateApplied: new Date(2023, 11, 12),
    stage: 'screening',
    jobDescription: 'Developing features for Microsoft Azure...',
    salary: '$130,000 - $160,000',
    location: 'Redmond, WA',
    remote: true,
    notes: 'Submitted coding assessment',
    contacts: [],
  },
  {
    id: 'app3',
    position: 'iOS Developer',
    company: companies[2],
    dateApplied: new Date(2023, 11, 15),
    stage: 'applied',
    jobDescription: 'Creating innovative iOS applications...',
    salary: '$135,000 - $170,000',
    location: 'Cupertino, CA',
    remote: false,
    notes: 'Tailored resume for this role',
    contacts: [],
  },
  {
    id: 'app4',
    position: 'Cloud Engineer',
    company: companies[3],
    dateApplied: new Date(2023, 11, 18),
    stage: 'offer',
    jobDescription: 'Optimizing AWS infrastructure...',
    salary: '$145,000 - $190,000',
    location: 'Seattle, WA',
    remote: true,
    notes: 'Received offer, negotiating terms',
    contacts: [{ name: 'Mike Brown', role: 'Hiring Manager', email: 'mike.b@amazon.com' }],
  },
  {
    id: 'app5',
    position: 'Product Manager',
    company: companies[4],
    dateApplied: new Date(2023, 11, 20),
    stage: 'interview',
    jobDescription: 'Leading product strategy for Instagram...',
    salary: '$150,000 - $200,000',
    location: 'Menlo Park, CA',
    remote: false,
    notes: 'Preparing for behavioral interview',
    contacts: [],
  },
  {
    id: 'app6',
    position: 'Backend Engineer',
    company: companies[5],
    dateApplied: new Date(2023, 11, 22),
    stage: 'rejected',
    jobDescription: 'Scaling Netflix streaming services...',
    salary: '$140,000 - $180,000',
    location: 'Los Gatos, CA',
    remote: true,
    notes: 'Rejected after initial screening',
    contacts: [],
  },
  {
    id: 'app7',
    position: 'DevOps Engineer',
    company: companies[6],
    dateApplied: new Date(2023, 11, 23),
    stage: 'screening',
    jobDescription: 'Managing CI/CD pipelines at Stripe...',
    salary: '$130,000 - $165,000',
    location: 'San Francisco, CA',
    remote: true,
    notes: 'Technical phone screen scheduled',
    contacts: [],
  },
  {
    id: 'app8',
    position: 'Frontend Developer',
    company: companies[7],
    dateApplied: new Date(2023, 11, 24),
    stage: 'applied',
    jobDescription: 'Building Airbnb’s booking platform...',
    salary: '$125,000 - $155,000',
    location: 'San Francisco, CA',
    remote: true,
    notes: 'Applied through referral',
    contacts: [{ name: 'Lisa Chen', role: 'Engineer', email: 'lisa.c@airbnb.com' }],
  },
  {
    id: 'app9',
    position: 'Mobile Engineer',
    company: companies[8],
    dateApplied: new Date(2023, 11, 25),
    stage: 'interview',
    jobDescription: 'Enhancing Uber’s driver app...',
    salary: '$135,000 - $175,000',
    location: 'San Francisco, CA',
    remote: false,
    notes: 'Coding challenge completed',
    contacts: [],
  },
  {
    id: 'app10',
    position: 'Full Stack Developer',
    company: companies[9],
    dateApplied: new Date(2023, 11, 26),
    stage: 'screening',
    jobDescription: 'Developing Slack’s collaboration tools...',
    salary: '$130,000 - $160,000',
    location: 'San Francisco, CA',
    remote: true,
    notes: 'Awaiting feedback',
    contacts: [],
  },
  {
    id: 'app11',
    position: 'Frontend Engineer',
    company: companies[10],
    dateApplied: new Date(2023, 11, 25),
    stage: 'applied',
    jobDescription: 'Developing user interfaces for Spotify’s web player...',
    salary: '$120,000 - $150,000',
    location: 'Stockholm, Sweden',
    remote: true,
    notes: 'Excited about the music industry',
    contacts: [],
  },
  {
    id: 'app12',
    position: 'UI Designer',
    company: companies[11],
    dateApplied: new Date(2023, 11, 26),
    stage: 'screening',
    jobDescription: 'Designing interfaces for Adobe Creative Cloud...',
    salary: '$110,000 - $140,000',
    location: 'San Jose, CA',
    remote: false,
    notes: 'Portfolio review scheduled',
    contacts: [{ name: 'Emily Davis', role: 'Design Manager', email: 'emily.d@adobe.com' }],
  },
  {
    id: 'app13',
    position: 'Software Engineer',
    company: companies[12],
    dateApplied: new Date(2023, 11, 27),
    stage: 'interview',
    jobDescription: 'Building scalable solutions for Salesforce platform...',
    salary: '$130,000 - $160,000',
    location: 'San Francisco, CA',
    remote: true,
    notes: 'Technical interview next week',
    contacts: [{ name: 'David Lee', role: 'Engineering Lead', email: 'david.l@salesforce.com' }],
  },
];

// **Data Generation Functions**
const generateActivities = (): Activity[] => {
  const now = new Date();
  const activities: Activity[] = [
    {
      id: 'act1',
      type: 'application',
      title: 'Job Application Submitted',
      application: applications[0],
      company: applications[0].company,
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      details: `Applied for ${applications[0].position} at ${applications[0].company.name}`,
    },
    {
      id: 'act2',
      type: 'interview',
      title: 'Interview Invitation',
      application: applications[1],
      company: applications[1].company,
      timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      details: `Received interview invitation for ${applications[1].position} at ${applications[1].company.name}`,
    },
    {
      id: 'act3',
      type: 'offer',
      title: 'Offer Received',
      application: applications[3],
      company: applications[3].company,
      timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      details: `Received job offer for ${applications[3].position} at ${applications[3].company.name}`,
    },
    {
      id: 'act4',
      type: 'rejected',
      title: 'Application Rejected',
      application: applications[5],
      company: applications[5].company,
      timestamp: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      details: `Application for ${applications[5].position} at ${applications[5].company.name} was rejected`,
    },
    {
      id: 'act5',
      type: 'assessment',
      title: 'Coding Assessment Submitted',
      application: applications[8],
      company: applications[8].company,
      timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      details: `Submitted coding assessment for ${applications[8].position} at ${applications[8].company.name}`,
    },
    {
      id: 'act6',
      type: 'screening',
      title: 'Moved to Screening',
      application: applications[9],
      company: applications[9].company,
      timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      details: `Application for ${applications[9].position} at ${applications[9].company.name} moved to screening`,
    },
    {
      id: 'act7',
      type: 'application',
      title: 'Job Application Submitted',
      application: applications[10],
      company: applications[10].company,
      timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000),
      details: `Applied for ${applications[10].position} at ${applications[10].company.name}`,
    },
    {
      id: 'act8',
      type: 'screening',
      title: 'Application Moved to Screening',
      application: applications[11],
      company: applications[11].company,
      timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      details: `Application for ${applications[11].position} at ${applications[11].company.name} moved to screening`,
    },
    {
      id: 'act9',
      type: 'interview',
      title: 'Interview Scheduled',
      application: applications[12],
      company: applications[12].company,
      timestamp: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
      details: `Scheduled interview for ${applications[12].position} at ${applications[12].company.name}`,
    },
  ];
  return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

const generateUpcomingEvents = (): UpcomingEvent[] => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);
  const inTwoWeeks = new Date(now);
  inTwoWeeks.setDate(inTwoWeeks.getDate() + 14);

  return [
    {
      id: 'evt1',
      title: 'Product Manager Interview',
      company: applications[4].company,
      date: tomorrow,
      time: '10:00 AM',
      type: 'Interview',
      application: applications[4],
      details: 'Technical interview with the engineering team',
      location: 'Video call (Zoom)',
      duration: 60,
    },
    {
      id: 'evt2',
      title: 'Follow-up Task',
      company: applications[0].company,
      date: nextWeek,
      time: '2:00 PM',
      type: 'Task',
      application: applications[0],
      details: 'Complete take-home coding assignment',
      deadline: new Date(nextWeek.getTime() + 24 * 60 * 60 * 1000),
    },
    {
      id: 'evt3',
      title: 'Mobile Engineer Interview',
      company: applications[8].company,
      date: inTwoWeeks,
      time: '1:00 PM',
      type: 'Interview',
      application: applications[8],
      details: 'Final round interview with Uber team',
      location: 'San Francisco office',
      duration: 120,
    },
    {
      id: 'evt4',
      title: 'Portfolio Review',
      company: applications[11].company,
      date: nextWeek,
      time: '3:00 PM',
      type: 'Task',
      application: applications[11],
      details: 'Prepare portfolio for review session',
      deadline: new Date(nextWeek.getTime() + 2 * 60 * 60 * 1000),
    },
    {
      id: 'evt5',
      title: 'Technical Interview',
      company: applications[12].company,
      date: inTwoWeeks,
      time: '11:00 AM',
      type: 'Interview',
      application: applications[12],
      details: 'System design and coding interview',
      location: 'Video call (Zoom)',
      duration: 90,
    },
  ];
};

const generateApplicationStats = (): AppStats => {
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
    tasksdue: generateUpcomingEvents().filter(event => event.type === 'Task').length,
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

// **Initialize Data**
const activities = generateActivities();
const upcomingEvents = generateUpcomingEvents();
const appStats = generateApplicationStats();
const monthlyGoals = generateGoals();

// **Section Components**
const DashboardHome = (): JSX.Element => {
  const { currentTheme } = useTheme();

  return (
    <section className="dashboard-home reveal-group">
      <header className="section-header reveal-element">
        <div className="header-content">
          <h1 className="text-primary gradient-text">Dashboard</h1>
          <p className="text-tertiary">Welcome back, {userProfile.name}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="search-bar flex items-center gap-2">
            <Search size={20} className="text-secondary" />
            <input type="text" placeholder="Search applications, companies..." className="input" />
          </div>
          <div className="hidden md:block">
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      <div className="stats-summary reveal-element">
        <div className="stat-card" style={{ borderColor: 'var(--accent-blue)', borderTopWidth: '3px' }}>
          <div className="stat-icon" style={{ backgroundColor: 'rgba(var(--accent-blue-rgb), 0.1)' }}>
            <FileText size={24} color="var(--accent-blue)" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{appStats.totalApplications}</div>
            <div className="stat-label">Applications</div>
          </div>
        </div>

        <div className="stat-card" style={{ borderColor: 'var(--accent-green)', borderTopWidth: '3px' }}>
          <div className="stat-icon" style={{ backgroundColor: 'rgba(var(--accent-green-rgb), 0.1)' }}>
            <Calendar size={24} color="var(--accent-green)" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{appStats.interviewsScheduled}</div>
            <div className="stat-label">Interviews</div>
          </div>
        </div>

        <div className="stat-card" style={{ borderColor: 'var(--accent-orange)', borderTopWidth: '3px' }}>
          <div className="stat-icon" style={{ backgroundColor: 'rgba(var(--accent-orange-rgb), 0.1)' }}>
            <Activity size={24} color="var(--accent-orange)" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{appStats.successRate}%</div>
            <div className="stat-label">Success Rate</div>
          </div>
        </div>

        <div className="stat-card" style={{ borderColor: 'var(--accent-purple)', borderTopWidth: '3px' }}>
          <div className="stat-icon" style={{ backgroundColor: 'rgba(var(--accent-purple-rgb), 0.1)' }}>
            <CheckCircle size={24} color="var(--accent-purple)" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{appStats.tasksdue}</div>
            <div className="stat-label">Tasks Due</div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid reveal-element" style={{ position: 'relative', zIndex: 1 }}>
        <div className="glass-card hover-lift">
          <div className="card-header">
            <h3 className="text-primary">Recent Activity</h3>
            <a href="#" className="text-accent text-sm hover:underline">View All</a>
          </div>
          <ul className="card-content activity-list">
            {activities.slice(0, 5).map(activity => (
              <li key={activity.id} className="activity-item">
                <div className={`activity-type-indicator ${activity.type}`}></div>
                <div className="activity-details">
                  <div className="activity-title">{activity.title}</div>
                  <div className="activity-subtitle">{activity.company.name}</div>
                  <div className="activity-time">{new Date(activity.timestamp).toLocaleDateString()}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="glass-card hover-lift">
          <div className="card-header">
            <h3 className="text-primary">Upcoming Events</h3>
            <a href="#" className="text-accent text-sm hover:underline">View Calendar</a>
          </div>
          <ul className="card-content events-list">
            {upcomingEvents.slice(0, 3).map(event => (
              <li key={event.id} className="event-item">
                <div className={`event-type-indicator ${event.type.toLowerCase()}`}></div>
                <div className="event-details">
                  <div className="event-title">{event.title}</div>
                  <div className="event-subtitle">{event.company.name}</div>
                  <div className="event-time">
                    <Calendar size={14} className="inline mr-1" />
                    {event.date.toLocaleDateString()} at {event.time}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="glass-card hover-lift">
          <div className="card-header">
            <h3 className="text-primary">Monthly Goals</h3>
            <a href="#" className="text-accent text-sm hover:underline">Set Goals</a>
          </div>
          <div className="card-content">
            {monthlyGoals.map(goal => (
              <div key={goal.id} className="goal-item">
                <div className="goal-header">
                  <div className="goal-title">{goal.goal}</div>
                  <div className="goal-stats">{goal.current}/{goal.target}</div>
                </div>
                <div className="goal-progress-container">
                  <div
                    className="goal-progress-bar"
                    style={{
                      width: `${goal.progress}%`,
                      backgroundColor: `var(--accent-${goal.progress >= 100 ? 'green' :
                          goal.progress >= 60 ? 'blue' :
                            goal.progress >= 30 ? 'orange' : 'red'
                        })`
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
          position: relative;
        }

        .header-content h1 {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 4px;
          position: relative;
          display: inline-block;
        }

        .dark .header-content h1.gradient-text {
          text-shadow: 0 0 12px rgba(var(--accent-primary-rgb), 0.3);
        }

        .search-bar {
          background: var(--glass-card-bg);
          border: 1px solid var(--border-thin);
          border-radius: var(--border-radius);
          padding: 10px 16px;
          min-width: 250px;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: all var(--transition-normal) var(--easing-standard);
          box-shadow: var(--shadow-sharp);
        }

        .search-bar:focus-within {
          box-shadow: var(--shadow), 0 0 0 2px var(--ring-color);
          border-color: var(--accent-primary);
          transform: translateY(-1px);
        }

        .search-bar input {
          background: transparent;
          border: none;
          color: var(--text-primary);
          outline: none;
          width: 100%;
          font-size: 0.95rem;
        }

        .stats-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
          margin-bottom: 28px;
        }

        .stat-card {
          background: var(--glass-card-bg);
          border-radius: var(--border-radius);
          padding: 18px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: var(--shadow-sharp);
          transition: all var(--transition-normal) var(--easing-standard);
          position: relative;
          overflow: hidden;
        }

        .stat-card::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 3px;
          background: transparent;
          transition: background-color var(--transition-normal) var(--easing-standard);
        }

        .stat-card:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: var(--shadow);
        }

        .stat-card:nth-child(1)::after {
          background-color: var(--accent-blue);
        }

        .stat-card:nth-child(2)::after {
          background-color: var(--accent-green);
        }

        .stat-card:nth-child(3)::after {
          background-color: var(--accent-orange);
        }

        .stat-card:nth-child(4)::after {
          background-color: var(--accent-purple);
        }

        .dark .stat-card:hover::after {
          box-shadow: 0 0 12px currentColor;
        }

        .stat-icon {
          padding: 14px;
          border-radius: var(--border-radius);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition-normal) var(--easing-standard);
        }

        .stat-card:hover .stat-icon {
          transform: scale(1.1);
        }

        .stat-content {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 1.9rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.2;
        }

        .stat-label {
          font-size: 0.95rem;
          color: var(--text-tertiary);
          margin-top: 2px;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 28px;
          position: relative;
          z-index: 2; /* Ensure cards are above background elements */
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 16px;
          margin-bottom: 18px;
          border-bottom: 1px solid var(--border-divider);
          position: relative;
        }

        .card-header::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 40%;
          height: 2px;
          background: linear-gradient(to right, var(--accent-primary), transparent);
          border-radius: 1px;
        }

        .card-header h3 {
          font-size: 1.15rem;
          font-weight: 600;
          position: relative;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .card-header a {
          color: var(--text-accent);
          transition: all var(--transition-normal) var(--easing-standard);
          position: relative;
          padding: 4px 8px;
          border-radius: var(--border-radius);
        }

        .card-header a:hover {
          text-decoration: none !important;
          background: var(--active-bg);
          transform: translateY(-1px);
        }

        .card-content {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .activity-list, .events-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .activity-item, .event-item {
          display: flex;
          gap: 14px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--border-divider);
          transition: all var(--transition-normal) var(--easing-standard);
        }

        .activity-item:hover, .event-item:hover {
          transform: translateX(3px);
          padding-left: 3px;
        }

        .activity-item:last-child, .event-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .activity-type-indicator, .event-type-indicator {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          margin-top: 6px;
          transition: transform var(--transition-normal) var(--easing-standard);
          box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
        }

        .activity-item:hover .activity-type-indicator,
        .event-item:hover .event-type-indicator {
          transform: scale(1.2);
        }

        .dark .activity-type-indicator,
        .dark .event-type-indicator {
          box-shadow: 0 0 6px currentColor;
        }

        .activity-type-indicator.application { background-color: var(--accent-blue); }
        .activity-type-indicator.interview { background-color: var(--accent-green); }
        .activity-type-indicator.offer { background-color: var(--accent-purple); }
        .activity-type-indicator.rejected { background-color: var(--accent-red); }
        .activity-type-indicator.assessment { background-color: var(--accent-yellow); }
        .activity-type-indicator.screening { background-color: var(--accent-orange); }

        .event-type-indicator.interview { background-color: var(--accent-green); }
        .event-type-indicator.task { background-color: var(--accent-orange); }
        .event-type-indicator.deadline { background-color: var(--accent-red); }

        .activity-details, .event-details {
          flex: 1;
        }

        .activity-title, .event-title {
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 4px;
          font-size: 1rem;
        }

        .activity-subtitle, .event-subtitle {
          font-size: 0.95rem;
          color: var(--text-secondary);
          margin-bottom: 6px;
        }

        .activity-time, .event-time {
          font-size: 0.85rem;
          color: var(--text-tertiary);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .goal-item {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 5px 0;
          transition: all var(--transition-normal) var(--easing-standard);
        }

        .goal-item:hover {
          transform: translateX(3px);
          padding-left: 3px;
        }

        .goal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .goal-title {
          font-weight: 600;
          color: var(--text-primary);
          font-size: 1rem;
        }

        .goal-stats {
          font-size: 0.95rem;
          color: var(--text-accent);
          font-weight: 500;
        }

        .goal-progress-container {
          height: 8px;
          background-color: var(--hover-bg);
          border-radius: 4px;
          overflow: hidden;
          box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .goal-progress-bar {
          height: 100%;
          border-radius: 4px;
          transition: width 1.5s var(--easing-decelerate);
          position: relative;
          overflow: hidden;
        }

        .dark .goal-progress-bar::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.2), transparent);
          animation: shine 2s ease-in-out infinite;
        }

        /* Larger screens */
        @media (min-width: 1200px) {
          .dashboard-grid {
            grid-template-columns: repeat(3, 1fr);
          }

          .dashboard-grid > div:first-child {
            grid-column: span 2;
          }
        }

        /* Medium screens */
        @media (max-width: 1024px) {
          .dashboard-grid {
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          }
        }

        /* Small screens */
        @media (max-width: 768px) {
          .section-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .search-bar {
            width: 100%;
          }

          .stat-card {
            padding: 14px;
          }

          .dashboard-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
};

const ApplicationsSection = (): JSX.Element => {
  // Import the Applications component directly 
  const Applications = require('../components/sections/Applications').default;
  return <Applications />;
};

const RemindersSection = (): JSX.Element => {
  return (
    <section className="reminders-section">
      <header className="section-header">
        <h1 className="text-primary">Reminders</h1>
      </header>
      <div className="reminders-list space-y-4">
        {upcomingEvents.map(event => (
          <div key={event.id} className="glass-card flex items-center gap-4">
            <Bell size={20} className="text-accent" />
            <div>
              <h3 className="text-primary">{event.title}</h3>
              <p className="text-secondary">{event.company.name} - {event.type}</p>
              <small className="text-tertiary">{event.date.toLocaleDateString()} at {event.time}</small>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

// **Placeholder Components**
const AnalyticsSection = (): JSX.Element => (
  <section className="glass-card">
    <h1 className="text-primary">Analytics</h1>
    <p className="text-secondary">Analytics data here...</p>
  </section>
);

const InterviewsSection = (): JSX.Element => (
  <section className="glass-card">
    <h1 className="text-primary">Interviews</h1>
    <p className="text-secondary">Interview details here...</p>
  </section>
);

const ProfileArtifactsSection = (): JSX.Element => (
  <section className="glass-card">
    <h1 className="text-primary">Profile & Artifacts</h1>
    <p className="text-secondary">Profile data here...</p>
  </section>
);

const GoalsSection = (): JSX.Element => (
  <section className="glass-card">
    <h1 className="text-primary">Goals</h1>
    <p className="text-secondary">Goals data here...</p>
  </section>
);

const TimelineSection = (): JSX.Element => (
  <section className="glass-card">
    <h1 className="text-primary">Timeline</h1>
    <p className="text-secondary">Timeline data here...</p>
  </section>
);

// **Sections Mapping**
const sections: Record<SectionKey, () => JSX.Element> = {
  'dashboard-home': DashboardHome,
  'applications-section': ApplicationsSection,
  'reminders-section': RemindersSection,
  'analytics-section': AnalyticsSection,
  'interviews-section': InterviewsSection,
  'profile-artifacts-section': ProfileArtifactsSection,
  'goals-section': GoalsSection,
  'timeline-section': TimelineSection,
};

// **Main Component**
export default function Home(): JSX.Element {
  const { currentTheme } = useTheme();
  const [currentSection, setCurrentSection] = useState<SectionKey>('dashboard-home');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [width, setWidth] = useState(280);
  const [isLoaded, setIsLoaded] = useState(false);

  const sidebarItems: NavItemType[] = [
    {
      id: 'dashboard-home',
      key: 'dashboard-home',
      label: 'Dashboard',
      icon: <House className="w-5 h-5" />,
      color: 'var(--accent-blue)',
      badge: { count: 3 }
    },
    {
      id: 'applications-section',
      key: 'applications-section',
      label: 'Applications',
      icon: <FileText className="w-5 h-5" />,
      color: 'var(--accent-purple)',
      badge: { count: applications.length }
    },
    {
      id: 'reminders-section',
      key: 'reminders-section',
      label: 'Reminders',
      icon: <Bell className="w-5 h-5" />,
      color: 'var(--accent-pink)',
      badge: { count: upcomingEvents.length }
    },
    {
      id: 'interviews-section',
      key: 'interviews-section',
      label: 'Interviews',
      icon: <Users className="w-5 h-5" />,
      color: 'var(--accent-orange)',
      badge: { count: appStats.interviewsScheduled }
    },
    {
      id: 'profile-artifacts-section',
      key: 'profile-artifacts-section',
      label: 'Profile',
      icon: <User className="w-5 h-5" />,
      color: 'var(--accent-green)'
    },
    {
      id: 'goals-section',
      key: 'goals-section',
      label: 'Goals',
      icon: <Target className="w-5 h-5" />,
      color: 'var(--accent-yellow)'
    },
    {
      id: 'timeline-section',
      key: 'timeline-section',
      label: 'Timeline',
      icon: <Clock className="w-5 h-5" />,
      color: 'var(--accent-red)',
      badge: { count: activities.length }
    },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleResize = (newWidth: number) => {
    setWidth(newWidth);
    if (newWidth < 100) setIsCollapsed(true);
    else setIsCollapsed(false);
  };

  return (
    <div className={`app-container reveal-loaded ${isLoaded ? 'loaded' : ''}`}>
      <GlassSidebar
        items={sidebarItems}
        currentSection={currentSection}
        setCurrentSection={setCurrentSection}
        width={width}
        isCollapsed={isCollapsed}
        onResize={handleResize}
        userName={userProfile.name}
        userAvatar={userProfile.avatar}
      />
      <main className={`glass-main ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="reveal-element">
          {sections[currentSection]()}
        </div>

        <button
          className="mobile-menu-toggle"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? "Open sidebar" : "Close sidebar"}
        >
          {isCollapsed ? (
            <Menu size={20} className="mobile-menu-icon" />
          ) : (
            <ChevronLeft size={20} className="mobile-menu-icon" />
          )}
        </button>
      </main>

      {/* Floating particles for visual effect */}
      <div className="floating-particles">
        <span className="particle"></span>
        <span className="particle"></span>
        <span className="particle"></span>
        <span className="particle"></span>
        <span className="particle"></span>
        <span className="particle"></span>
        <span className="particle"></span>
        <span className="particle"></span>
      </div>

      {/* Dynamic background gradient elements */}
      <div className="bg-gradient-1"></div>
      <div className="bg-gradient-2"></div>

      <style jsx>{`
        .mobile-menu-toggle {
          display: none;
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: var(--glass-bg);
          backdrop-filter: blur(var(--blur-amount));
          -webkit-backdrop-filter: blur(var(--blur-amount));
          border: 1px solid var(--border-thin);
          box-shadow: var(--shadow);
          color: var(--text-primary);
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: var(--z-fixed);
          transition: all var(--transition-normal) var(--easing-standard);
        }

        .mobile-menu-toggle:hover {
          transform: scale(1.05);
          box-shadow: var(--shadow-lg);
          border-color: var(--accent-primary);
        }

        .mobile-menu-toggle:active {
          transform: scale(0.95);
        }

        .bg-gradient-1, .bg-gradient-2 {
          position: fixed;
          border-radius: 50%;
          filter: blur(40px);
          z-index: var(--z-negative);
          opacity: 0.5;
          pointer-events: none;
        }

        .bg-gradient-1 {
          width: 50vw;
          height: 50vw;
          background: radial-gradient(circle,
            rgba(var(--accent-blue-rgb), 0.15),
            transparent 70%
          );
          top: -10vw;
          right: -10vw;
          animation: float 20s infinite alternate ease-in-out;
        }

        .bg-gradient-2 {
          width: 60vw;
          height: 60vw;
          background: radial-gradient(circle,
            rgba(var(--accent-purple-rgb), 0.1),
            transparent 70%
          );
          bottom: -20vw;
          left: -10vw;
          animation: float-reverse 25s infinite alternate-reverse ease-in-out;
        }

        @media (max-width: 1024px) {
          .mobile-menu-toggle {
            display: flex;
          }

          .bg-gradient-1, .bg-gradient-2 {
            opacity: 0.3;
          }
        }

        @media (max-width: 480px) {
          .mobile-menu-toggle {
            bottom: 16px;
            right: 16px;
            width: 42px;
            height: 42px;
          }
        }
      `}</style>
    </div>
  );
}
