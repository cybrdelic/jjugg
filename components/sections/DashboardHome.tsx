'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText, Bell, Calendar, Search, CheckCircle, Activity, TrendingUp, ArrowUpRight,
  BarChart2, MoreHorizontal, ChevronRight, ChevronDown, Clock, Target, Users, Plus,
  X, SlidersHorizontal, Briefcase, DollarSign, MapPin, Zap, Award, MessagesSquare,
  Network, Share2, BarChart, AlertCircle, Hourglass, MousePointer, LineChart, ExternalLink,
  BookOpen, CheckSquare, PieChart, ThumbsUp, List, Clipboard, User, UserPlus, Rocket, Mail,
  Timer,
  XIcon
} from 'lucide-react';
import CardHeader from '../CardHeader';
import StatCard from '../dashboard/StatCard';
import ActivityItem from '../dashboard/ActivityItem';
import UpcomingEvent from '../dashboard/UpcomingEvent';
import GoalCard from '../dashboard/GoalCard';
import StageCard from '../dashboard/StageCard';
import ActionButton from '../dashboard/ActionButton';
import ApplicationFunnel from '../ApplicationFunnel';
import WeeklyActivity from '../WeeklyActivity';

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
  jobDescription?: string;
  salary?: string;
  location?: string;
  remote?: boolean;
  notes?: string;
  contacts?: { name: string; role: string; email: string }[];
  responseTime?: number; // days until first response
  matchScore?: number; // 0-100 match score based on skills
}

interface Activity {
  id: string;
  type: 'application' | 'interview' | 'offer' | 'rejected' | 'assessment' | 'screening' | 'task' | 'email' | 'network';
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
  type: 'Interview' | 'Task' | 'Deadline' | 'Networking' | 'Follow-up';
  application: Application;
  details: string;
  deadline?: Date;
  location?: string;
  duration?: number;
  priority?: 'low' | 'medium' | 'high';
}

interface AppStats {
  totalApplications: number;
  stageCount: Record<'applied' | 'screening' | 'interview' | 'offer' | 'rejected', number>;
  interviewsScheduled: number;
  responseRate: number;
  successRate: number;
  averageResponseTime: number;
  tasksdue: number;
  activeApplications: number;
  networking: {
    connections: number;
    messages: number;
    meetings: number;
    referrals: number;
  };
  weeklyActivity: number[];
  jobMatchScores: number[];
}

interface MonthlyGoal {
  id: string;
  goal: string;
  current: number;
  target: number;
  progress: number;
  category: 'applications' | 'networking' | 'skills' | 'interviews';
  deadline?: Date;
}

interface RecommendedAction {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  type: 'application' | 'follow-up' | 'preparation' | 'networking' | 'skill';
  dueDate?: Date;
  relatedTo?: Application;
}

interface SkillGap {
  skill: string;
  demand: number; // 0-100
  proficiency: number; // 0-100
  gap: number; // demand - proficiency
  jobsRequiring: number;
}

// Mock data generator functions would be here

export default function DashboardHome() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [activeInsight, setActiveInsight] = useState('response-rate');
  const [timeRange, setTimeRange] = useState('30d');

  // Simulate loading data
  useEffect(() => {
    setMounted(true);
  }, []);

  // MOCK DATA - In a real app, this would come from API calls
  // Application stage counts
  const stageCounts = {
    applied: 5,
    screening: 3,
    interview: 3,
    offer: 1,
    rejected: 1
  };

  // Total applications
  const totalApplications = Object.values(stageCounts).reduce((sum, count) => sum + count, 0);

  // Active applications
  const activeApplications = stageCounts.applied + stageCounts.screening + stageCounts.interview;

  // Response rate
  const responseRate = ((totalApplications - stageCounts.applied) / totalApplications) * 100;

  // Success rate from completed applications
  const successRate = (stageCounts.offer / (stageCounts.offer + stageCounts.rejected)) * 100;

  // Skills with gaps
  const skillGaps: SkillGap[] = [
    { skill: 'React', demand: 85, proficiency: 75, gap: 10, jobsRequiring: 15 },
    { skill: 'TypeScript', demand: 80, proficiency: 65, gap: 15, jobsRequiring: 12 },
    { skill: 'GraphQL', demand: 60, proficiency: 30, gap: 30, jobsRequiring: 8 },
    { skill: 'AWS', demand: 70, proficiency: 35, gap: 35, jobsRequiring: 10 },
    { skill: 'Docker', demand: 65, proficiency: 40, gap: 25, jobsRequiring: 7 }
  ].sort((a, b) => b.gap - a.gap);

  // Mock weekly application activity
  const weeklyActivity = [3, 5, 2, 4, 7, 6, 4];

  // Mock average response times by company tier
  const responseTimesByTier = [
    { tier: 'Enterprise', days: 12 },
    { tier: 'Mid-size', days: 7 },
    { tier: 'Startup', days: 3 }
  ];

  // Mock networking stats
  const networkingStats = {
    connections: 45,
    messages: 22,
    meetings: 5,
    referrals: 3
  };

  // Top industries by application count
  const topIndustries = [
    { name: 'Technology', count: 6, success: 25 },
    { name: 'Finance', count: 3, success: 33 },
    { name: 'Healthcare', count: 2, success: 50 },
    { name: 'E-commerce', count: 2, success: 0 }
  ];

  // Mock upcoming events
  const upcomingEvents: UpcomingEvent[] = [
    {
      id: 'evt1',
      title: 'Technical Interview',
      company: { id: 'c1', name: 'Google', logo: '/companies/google.svg', industry: 'Technology' },
      date: new Date(new Date().getTime() + 86400000), // tomorrow
      time: '10:00 AM',
      type: 'Interview',
      application: {} as Application, // simplified
      details: 'System design and coding interview',
      duration: 60,
      priority: 'high'
    },
    {
      id: 'evt2',
      title: 'Follow up on application',
      company: { id: 'c2', name: 'Microsoft', logo: '/companies/microsoft.svg', industry: 'Technology' },
      date: new Date(new Date().getTime() + 172800000), // in 2 days
      time: '12:00 PM',
      type: 'Follow-up',
      application: {} as Application, // simplified
      details: 'Send follow-up email about application status',
      priority: 'medium'
    },
    {
      id: 'evt3',
      title: 'Virtual Networking Event',
      company: { id: 'c3', name: 'Tech Meetup', logo: '/companies/meetup.svg', industry: 'Technology' },
      date: new Date(new Date().getTime() + 259200000), // in 3 days
      time: '5:30 PM',
      type: 'Networking',
      application: {} as Application, // simplified
      details: 'Online networking event for frontend developers',
      duration: 120
    },
    {
      id: 'evt4',
      title: 'Complete Assessment',
      company: { id: 'c4', name: 'Amazon', logo: '/companies/amazon.svg', industry: 'E-commerce' },
      date: new Date(new Date().getTime() + 345600000), // in 4 days
      time: '11:59 PM',
      type: 'Deadline',
      application: {} as Application, // simplified
      details: 'Finish coding assessment for Software Engineer position',
      deadline: new Date(new Date().getTime() + 345600000),
      priority: 'high'
    }
  ];

  // Mock goals with categories
  const goals: MonthlyGoal[] = [
    {
      id: 'goal1',
      goal: 'Submit 20 Applications',
      current: 13,
      target: 20,
      progress: Math.round((13 / 20) * 100),
      category: 'applications'
    },
    {
      id: 'goal2',
      goal: 'Connect with 15 Professionals',
      current: 8,
      target: 15,
      progress: Math.round((8 / 15) * 100),
      category: 'networking'
    },
    {
      id: 'goal3',
      goal: 'Complete 5 Skill Assessments',
      current: 2,
      target: 5,
      progress: Math.round((2 / 5) * 100),
      category: 'skills'
    },
    {
      id: 'goal4',
      goal: 'Attend 3 Mock Interviews',
      current: 1,
      target: 3,
      progress: Math.round((1 / 3) * 100),
      category: 'interviews'
    }
  ];

  // Recommended actions based on current state
  const recommendedActions: RecommendedAction[] = [
    {
      id: 'action1',
      title: 'Follow up on Google application',
      description: 'It\'s been 7 days since your application with no response.',
      priority: 'high',
      type: 'follow-up',
      dueDate: new Date(new Date().getTime() + 86400000)
    },
    {
      id: 'action2',
      title: 'Complete AWS certification',
      description: 'This skill appears in 65% of your target job listings.',
      priority: 'medium',
      type: 'skill'
    },
    {
      id: 'action3',
      title: 'Connect with Microsoft recruiter',
      description: 'Your network has 2 connections that could introduce you.',
      priority: 'medium',
      type: 'networking'
    },
    {
      id: 'action4',
      title: 'Prepare for technical interview',
      description: 'Your interview with Google is in 1 day.',
      priority: 'high',
      type: 'preparation',
      dueDate: new Date(new Date().getTime())
    },
    {
      id: 'action5',
      title: 'Apply to recommended jobs',
      description: '5 new jobs match your profile with 85%+ compatibility.',
      priority: 'medium',
      type: 'application'
    }
  ];

  // Mock activity for feed
  const activities = [
    {
      id: 'act1',
      type: 'application' as const,
      title: 'Applied to Software Engineer position',
      company: { id: 'c5', name: 'Facebook', logo: '/companies/facebook.svg', industry: 'Technology' },
      timestamp: new Date(new Date().getTime() - 86400000),
      details: 'Applied through company website with referral',
      application: {} as Application
    },
    {
      id: 'act2',
      type: 'interview' as const,
      title: 'Completed technical interview',
      company: { id: 'c2', name: 'Microsoft', logo: '/companies/microsoft.svg', industry: 'Technology' },
      timestamp: new Date(new Date().getTime() - 172800000),
      details: 'Interview feedback was positive, waiting for next steps',
      application: {} as Application
    },
    {
      id: 'act3',
      type: 'network' as const,
      title: 'Connected with Senior Engineer',
      company: { id: 'c1', name: 'Google', logo: '/companies/google.svg', industry: 'Technology' },
      timestamp: new Date(new Date().getTime() - 259200000),
      details: 'Made connection through LinkedIn after attending tech meetup',
      application: {} as Application
    }
  ];

  // Job match scores distribution
  const jobMatchScores = [65, 72, 78];

  // Stage descriptions
  const stageDescriptions = {
    applied: 'Initial applications submitted waiting for response',
    screening: 'Initial reviews, assessments, and phone screens',
    interview: 'Technical and team interviews in progress',
    offer: 'Job offers received or being negotiated',
    rejected: 'Applications that were not successful'
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <section className={`dashboard-home ${mounted ? 'mounted' : ''}`}>

      <div className="time-range-selector">
        <button className={timeRange === '7d' ? 'active' : ''} onClick={() => setTimeRange('7d')}>7d</button>
        <button className={timeRange === '30d' ? 'active' : ''} onClick={() => setTimeRange('30d')}>30d</button>
        <button className={timeRange === '90d' ? 'active' : ''} onClick={() => setTimeRange('90d')}>90d</button>
        <button className={timeRange === 'all' ? 'active' : ''} onClick={() => setTimeRange('all')}>All</button>
      </div>
      <div className="stats-summary">
        <StatCard
          value={totalApplications}
          label="Total Applications"
          icon={FileText}
          color="var(--accent-blue)"
          trend={{ value: 15, isPositive: true }}
          onClick={() => console.log('Applications stat clicked')}
        />

        <StatCard
          value={`${responseRate.toFixed(0)}%`}
          label="Response Rate"
          icon={Activity}
          color="var(--accent-purple)"
          trend={{ value: 5, isPositive: true }}
          onClick={() => setActiveInsight('response-rate')}
        />

        <StatCard
          value={`${successRate.toFixed(0)}%`}
          label="Success Rate"
          icon={Award}
          color="var(--accent-green)"
          trend={{ value: 10, isPositive: true }}
          onClick={() => setActiveInsight('success-rate')}
        />

        <StatCard
          value={networkingStats.connections}
          label="Network Connections"
          icon={Users}
          color="var(--accent-orange)"
          trend={{ value: 8, isPositive: true }}
          onClick={() => setActiveInsight('networking')}
        />
        <StatCard
          value={7.3}
          label="Avg. Reponse Time (Days)"
          icon={Timer}
          color="var(--accent-orange)"
          trend={{ value: 5, isPositive: true }}
          onClick={() => console.log("clicked")}
        />
        <StatCard
          value={'38%'}
          label="No Response Rate"
          icon={XIcon}
          color="var(--accent-orange)"
          trend={{ value: 5, isPositive: true }}
          onClick={() => console.log("clicked")}
        />
      </div>

      {/* Insight panel that changes based on selected insight */}
      <div className="insight-panel">
        {activeInsight === 'response-rate' && (
          <div className="insight-content">
            <div className="insight-header">
              <h3>Application Response Rate Analysis</h3>
              <span className="insight-desc">How quickly companies are responding to your applications</span>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'row',
              width: '100%',
              minWidth: '100%',
            }}>
              <div className="insight-data">
                <div className="insight-chart">
                  <div className="response-time-chart">
                    {responseTimesByTier.map((tier, index) => (
                      <div className="response-tier" key={tier.tier}>
                        <div className="tier-name">{tier.tier}</div>
                        <div className="tier-bar-container">
                          <div
                            className="tier-bar"
                            style={{
                              width: `${Math.min(100, tier.days * 5)}%`,
                              backgroundColor: index === 0 ? 'var(--accent-green)' :
                                index === 1 ? 'var(--accent-blue)' :
                                  'var(--accent-purple)'
                            }}
                          >
                            <span className="tier-value">{tier.days} days</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="chart-legend">
                    <span>Faster Response</span>
                    <span>Slower Response</span>
                  </div>
                </div>



              </div>
              {/* Job Match Scores */}
              <div className="dashboard-card match-score-card">
                <div className="card-header">
                  <h3 className="card-title">Job Match Quality</h3>
                  <ActionButton
                    label="Improve Matches"
                    icon={Award}
                    variant="ghost"
                    size="small"
                    onClick={() => console.log('Improve job matches')}
                  />
                </div>

                <div className="match-score-distribution">
                  {jobMatchScores.map((score, index) => (
                    <div className="match-score-bar" key={index}>
                      <div className="score-bar-container">
                        <div
                          className="score-bar"
                          style={{
                            width: `${score}%`,
                            backgroundColor: score >= 90 ? 'var(--accent-green)' :
                              score >= 80 ? 'var(--accent-blue)' :
                                score >= 70 ? 'var(--accent-purple)' :
                                  'var(--accent-orange)'
                          }}
                        ></div>
                      </div>
                      <div className="score-label">
                        <span className="company-name">Company {index + 1}</span>
                        <span className="score-value">{score}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>


            <div className="insight-recommendations">
              <h4>Recommendations</h4>
              <ul>
                <li>Follow up on applications that are past the average response time</li>
                <li>Use referrals to improve response rates by up to 30%</li>
                <li>Your startup applications get faster responses (avg. 3 days)</li>
              </ul>
            </div>
          </div>
        )}

        {activeInsight === 'success-rate' && (
          <div className="insight-content">
            <div className="insight-header">
              <h3>Success Rate by Industry & Job Title</h3>
              <span className="insight-desc">Where your applications are performing best</span>
            </div>

            <div className="insight-data">
              <div className="insight-chart">
                <div className="success-rate-chart">
                  {topIndustries.map(industry => (
                    <div className="industry-row" key={industry.name}>
                      <div className="industry-name">{industry.name}</div>
                      <div className="industry-stats">
                        <div className="industry-bar-container">
                          <div
                            className="industry-bar"
                            style={{
                              width: `${industry.success}%`,
                              backgroundColor: industry.success > 40 ? 'var(--accent-green)' :
                                industry.success > 20 ? 'var(--accent-blue)' :
                                  'var(--accent-red)'
                            }}
                          ></div>
                        </div>
                        <div className="industry-values">
                          <span className="applications-count">{industry.count} apps</span>
                          <span className="success-percent">{industry.success}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="insight-metrics vertical">
                <div className="insight-metric">
                  <span className="metric-value">Technology</span>
                  <span className="metric-label">Top Industry Applied</span>
                </div>
                <div className="insight-metric">
                  <span className="metric-value">Healthcare</span>
                  <span className="metric-label">Highest Success Rate</span>
                </div>
                <div className="insight-metric">
                  <span className="metric-value">Frontend Developer</span>
                  <span className="metric-label">Most Successful Role</span>
                </div>
              </div>
            </div>

            <div className="insight-recommendations">
              <h4>Recommendations</h4>
              <ul>
                <li>Consider more healthcare industry applications (50% success rate)</li>
                <li>Focus on frontend development roles where your profile performs best</li>
                <li>Customize resume more for technology companies to improve conversion</li>
              </ul>
            </div>
          </div>
        )}

        {activeInsight === 'networking' && (
          <div className="insight-content">
            <div className="insight-header">
              <h3>Networking Effectiveness Analysis</h3>
              <span className="insight-desc">How your networking activities impact job search outcomes</span>
            </div>

            <div className="insight-data">
              <div className="insight-chart">
                <div className="networking-impact-chart">
                  <div className="network-metric">
                    <div className="network-label">Response Rate</div>
                    <div className="comparison-bars">
                      <div className="bar-container">
                        <div className="bar-label">With Referral</div>
                        <div className="bar-bg">
                          <div className="bar-value" style={{ width: '85%' }}></div>
                        </div>
                        <div className="bar-percent">85%</div>
                      </div>
                      <div className="bar-container">
                        <div className="bar-label">Without Referral</div>
                        <div className="bar-bg">
                          <div className="bar-value" style={{ width: '42%' }}></div>
                        </div>
                        <div className="bar-percent">42%</div>
                      </div>
                    </div>
                  </div>

                  <div className="network-metric">
                    <div className="network-label">Interview Rate</div>
                    <div className="comparison-bars">
                      <div className="bar-container">
                        <div className="bar-label">With Referral</div>
                        <div className="bar-bg">
                          <div className="bar-value" style={{ width: '65%' }}></div>
                        </div>
                        <div className="bar-percent">65%</div>
                      </div>
                      <div className="bar-container">
                        <div className="bar-label">Without Referral</div>
                        <div className="bar-bg">
                          <div className="bar-value" style={{ width: '28%' }}></div>
                        </div>
                        <div className="bar-percent">28%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="insight-metrics">
                <div className="insight-metric">
                  <span className="metric-value">{networkingStats.referrals}</span>
                  <span className="metric-label">Referrals Used</span>
                </div>
                <div className="insight-metric">
                  <span className="metric-value">{networkingStats.meetings}</span>
                  <span className="metric-label">Informational Interviews</span>
                </div>
                <div className="insight-metric">
                  <span className="metric-value">+43%</span>
                  <span className="metric-label">Referral Advantage</span>
                </div>
              </div>
            </div>

            <div className="insight-recommendations">
              <h4>Recommendations</h4>
              <ul>
                <li>Reach out to 5 connections at your target companies for referrals</li>
                <li>Schedule 2 informational interviews this week to expand your network</li>
                <li>Join the upcoming tech meetup to connect with professionals in your field</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Dashboard tab navigation */}
      <div className="dashboard-tabs">
        <button
          className={`dashboard-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <BarChart2 size={16} />
          <span>Overview</span>
        </button>
        <button
          className={`dashboard-tab ${activeTab === 'actions' ? 'active' : ''}`}
          onClick={() => setActiveTab('actions')}
        >
          <Zap size={16} />
          <span>Action Items</span>
        </button>
        <button
          className={`dashboard-tab ${activeTab === 'skills' ? 'active' : ''}`}
          onClick={() => setActiveTab('skills')}
        >
          <Award size={16} />
          <span>Skills Analysis</span>
        </button>
        <button
          className={`dashboard-tab ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          <Activity size={16} />
          <span>Activity</span>
        </button>
      </div>

      {/* Overview Tab Content */}
      {
        activeTab === 'overview' && (
          <div className="dashboard-grid overview-grid">
            <ApplicationFunnel
              stageCounts={stageCounts}
              onViewAll={() => console.log('View all applications')}
            />

            <WeeklyActivity
              weeklyActivity={weeklyActivity}
              onViewDetails={() => console.log('View activity details')}
            />

            {/* Upcoming Events */}
            <div className="dashboard-card upcoming-card">
              <div className="card-header">
                <h3 className="card-title">Upcoming</h3>
                <ActionButton
                  label="Calendar"
                  icon={Calendar}
                  variant="ghost"
                  size="small"
                  onClick={() => console.log('View calendar')}
                />
              </div>

              <div className="upcoming-events">
                {upcomingEvents.map(event => (
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
                              day: 'numeric'
                            })} at {event.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="card-actions">
                <button className="action-btn">
                  <Plus size={14} />
                  <span>Add Event</span>
                </button>
                <button className="action-btn view-all">
                  <span>View All</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Action Items Tab Content */}
      {
        activeTab === 'actions' && (
          <div className="dashboard-grid actions-grid">
            <div className="dashboard-card action-items-card">
              <div className="card-header">
                <h3 className="card-title">Priority Action Items</h3>
                <div className="filters">
                  <select className="filter-select">
                    <option value="all">All Types</option>
                    <option value="follow-up">Follow-up</option>
                    <option value="application">Applications</option>
                    <option value="preparation">Preparation</option>
                    <option value="networking">Networking</option>
                    <option value="skill">Skills</option>
                  </select>
                </div>
              </div>

              <div className="action-items-list">
                {recommendedActions.map(action => (
                  <div className={`action-item ${action.priority}`} key={action.id}>
                    <div className="action-header">
                      <h4 className="action-title">{action.title}</h4>
                      <div className={`action-type ${action.type}`}>
                        {action.type === 'follow-up' && <Mail size={16} />}
                        {action.type === 'application' && <FileText size={16} />}
                        {action.type === 'preparation' && <BookOpen size={16} />}
                        {action.type === 'networking' && <Users size={16} />}
                        {action.type === 'skill' && <Award size={16} />}
                        <span>{action.type.replace('-', ' ')}</span>
                      </div>
                    </div>
                    <p className="action-description">{action.description}</p>

                    {action.dueDate && (
                      <div className="action-due-date">
                        <Clock size={14} />
                        <span>
                          Due {new Date(action.dueDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    )}

                    <div className="action-buttons">
                      <button className="action-btn primary">
                        <CheckSquare size={14} />
                        <span>Complete</span>
                      </button>
                      <button className="action-btn secondary">
                        <Clock size={14} />
                        <span>Snooze</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="dashboard-card recommended-jobs-card">
              <div className="card-header">
                <h3 className="card-title">Recommended Jobs</h3>
                <ActionButton
                  label="View All"
                  icon={ChevronRight}
                  variant="ghost"
                  size="small"
                  onClick={() => console.log('View all recommended jobs')}
                />
              </div>

              <div className="recommended-jobs-list">
                <div className="recommended-job">
                  <div className="job-match-badge">95%</div>
                  <div className="job-content">
                    <div className="job-header">
                      <h4 className="job-title">Senior Frontend Developer</h4>
                      <div className="company-logo">
                        <span>A</span>
                      </div>
                    </div>
                    <div className="job-company">Airbnb</div>
                    <div className="job-details">
                      <div className="job-location">
                        <MapPin size={14} />
                        <span>San Francisco (Remote)</span>
                      </div>
                      <div className="job-salary">
                        <DollarSign size={14} />
                        <span>$120K - $150K</span>
                      </div>
                    </div>
                    <div className="matched-skills">
                      <span className="skill-tag">React</span>
                      <span className="skill-tag">TypeScript</span>
                      <span className="skill-tag">GraphQL</span>
                      <span className="skill-tag">+3</span>
                    </div>
                    <div className="job-actions">
                      <button className="job-action-btn primary">
                        <Rocket size={14} />
                        <span>Quick Apply</span>
                      </button>
                      <button className="job-action-btn secondary">
                        <ExternalLink size={14} />
                        <span>View</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="recommended-job">
                  <div className="job-match-badge">92%</div>
                  <div className="job-content">
                    <div className="job-header">
                      <h4 className="job-title">Full Stack Engineer</h4>
                      <div className="company-logo">
                        <span>S</span>
                      </div>
                    </div>
                    <div className="job-company">Stripe</div>
                    <div className="job-details">
                      <div className="job-location">
                        <MapPin size={14} />
                        <span>Remote (US)</span>
                      </div>
                      <div className="job-salary">
                        <DollarSign size={14} />
                        <span>$130K - $160K</span>
                      </div>
                    </div>
                    <div className="matched-skills">
                      <span className="skill-tag">Node.js</span>
                      <span className="skill-tag">React</span>
                      <span className="skill-tag">API Design</span>
                      <span className="skill-tag">+4</span>
                    </div>
                    <div className="job-actions">
                      <button className="job-action-btn primary">
                        <Rocket size={14} />
                        <span>Quick Apply</span>
                      </button>
                      <button className="job-action-btn secondary">
                        <ExternalLink size={14} />
                        <span>View</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="recommended-job">
                  <div className="job-match-badge">88%</div>
                  <div className="job-content">
                    <div className="job-header">
                      <h4 className="job-title">UI/UX Developer</h4>
                      <div className="company-logo">
                        <span>F</span>
                      </div>
                    </div>
                    <div className="job-company">Figma</div>
                    <div className="job-details">
                      <div className="job-location">
                        <MapPin size={14} />
                        <span>New York, NY</span>
                      </div>
                      <div className="job-salary">
                        <DollarSign size={14} />
                        <span>$110K - $140K</span>
                      </div>
                    </div>
                    <div className="matched-skills">
                      <span className="skill-tag">UI Design</span>
                      <span className="skill-tag">React</span>
                      <span className="skill-tag">CSS</span>
                      <span className="skill-tag">+2</span>
                    </div>
                    <div className="job-actions">
                      <button className="job-action-btn primary">
                        <Rocket size={14} />
                        <span>Quick Apply</span>
                      </button>
                      <button className="job-action-btn secondary">
                        <ExternalLink size={14} />
                        <span>View</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card-actions centered">
                <button className="action-btn view-all-jobs">
                  <span>Browse More Jobs</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            <div className="dashboard-card networking-card">
              <div className="card-header">
                <h3 className="card-title">Networking Opportunities</h3>
                <ActionButton
                  label="Manage"
                  icon={Users}
                  variant="ghost"
                  size="small"
                  onClick={() => console.log('Manage networking')}
                />
              </div>

              <div className="networking-opportunities">
                <div className="opportunity">
                  <div className="opportunity-content">
                    <div className="avatar-group">
                      <div className="avatar">
                        <span>J</span>
                      </div>
                      <div className="company-logo small">
                        <span>G</span>
                      </div>
                    </div>
                    <div className="opportunity-details">
                      <h4 className="contact-name">Jessica Thompson</h4>
                      <div className="contact-role">Engineering Manager at Google</div>
                      <div className="connection-info">
                        <span>2nd degree connection</span>
                        <span>• Connected via Alex Kim</span>
                      </div>
                    </div>
                  </div>
                  <div className="opportunity-actions">
                    <button className="network-action-btn primary">
                      <UserPlus size={14} />
                      <span>Connect</span>
                    </button>
                    <button className="network-action-btn secondary">
                      <Mail size={14} />
                      <span>Message</span>
                    </button>
                  </div>
                </div>

                <div className="opportunity">
                  <div className="opportunity-content">
                    <div className="avatar-group">
                      <div className="avatar">
                        <span>M</span>
                      </div>
                      <div className="company-logo small">
                        <span>A</span>
                      </div>
                    </div>
                    <div className="opportunity-details">
                      <h4 className="contact-name">Michael Chen</h4>
                      <div className="contact-role">Senior Developer at Amazon</div>
                      <div className="connection-info">
                        <span>Mutual connection</span>
                        <span>• Viewed your profile</span>
                      </div>
                    </div>
                  </div>
                  <div className="opportunity-actions">
                    <button className="network-action-btn primary">
                      <UserPlus size={14} />
                      <span>Connect</span>
                    </button>
                    <button className="network-action-btn secondary">
                      <Mail size={14} />
                      <span>Message</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="upcoming-events networking-events">
                <h4 className="section-subtitle">Upcoming Events</h4>
                <div className="event">
                  <Calendar size={18} className="event-icon" />
                  <div className="event-details">
                    <div className="event-name">Frontend Developer Meetup</div>
                    <div className="event-info">
                      <span>May 15, 2023</span>
                      <span>• Virtual</span>
                      <span>• 45 Attendees</span>
                    </div>
                  </div>
                  <button className="event-action-btn">
                    <span>RSVP</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Skills Analysis Tab */}
      {
        activeTab === 'skills' && (
          <div className="dashboard-grid skills-grid">
            <div className="dashboard-card skills-gap-card">
              <div className="card-header">
                <h3 className="card-title">Skills Gap Analysis</h3>
                <div className="filters">
                  <select className="filter-select">
                    <option value="gap">Biggest Gaps</option>
                    <option value="demand">Highest Demand</option>
                    <option value="proficiency">Highest Proficiency</option>
                  </select>
                </div>
              </div>

              <div className="skills-gap-list">
                {skillGaps.map(skill => (
                  <div className="skill-gap-item" key={skill.skill}>
                    <div className="skill-header">
                      <h4 className="skill-name">{skill.skill}</h4>
                      <div className="skill-jobs">
                        <Briefcase size={14} />
                        <span>{skill.jobsRequiring} jobs</span>
                      </div>
                    </div>

                    <div className="skill-bars">
                      <div className="skill-bar-container">
                        <div className="bar-label">Demand</div>
                        <div className="bar-bg">
                          <div
                            className="bar-value demand"
                            style={{ width: `${skill.demand}%` }}
                          ></div>
                        </div>
                        <div className="bar-value-label">{skill.demand}%</div>
                      </div>

                      <div className="skill-bar-container">
                        <div className="bar-label">Your Proficiency</div>
                        <div className="bar-bg">
                          <div
                            className="bar-value proficiency"
                            style={{ width: `${skill.proficiency}%` }}
                          ></div>
                        </div>
                        <div className="bar-value-label">{skill.proficiency}%</div>
                      </div>
                    </div>

                    <div className="skill-gap-indicator">
                      <div className="gap-percentage">
                        <span className="gap-value">{skill.gap}%</span>
                        <span className="gap-label">Gap</span>
                      </div>
                      <div className="gap-actions">
                        <button className="gap-action-btn">
                          <Award size={14} />
                          <span>Improve</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="skills-insights">
                <h4 className="section-subtitle">Skill Insights</h4>
                <ul className="insight-list">
                  <li className="insight-item">
                    <TrendingUp size={16} className="insight-icon" />
                    <span>GraphQL skills would improve your match rate by 15%</span>
                  </li>
                  <li className="insight-item">
                    <Award size={16} className="insight-icon" />
                    <span>AWS certification could qualify you for 30% more jobs</span>
                  </li>
                  <li className="insight-item">
                    <ThumbsUp size={16} className="insight-icon" />
                    <span>Your React skills are in the top 20% of candidates</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="dashboard-card skill-resources-card">
              <div className="card-header">
                <h3 className="card-title">Recommended Resources</h3>
                <ActionButton
                  label="View All"
                  icon={ChevronRight}
                  variant="ghost"
                  size="small"
                  onClick={() => console.log('View all resources')}
                />
              </div>

              <div className="skill-resources">
                <div className="resource-item">
                  <div className="resource-icon">
                    <BookOpen size={24} />
                  </div>
                  <div className="resource-content">
                    <h4 className="resource-title">GraphQL Masterclass</h4>
                    <div className="resource-details">
                      <div className="resource-provider">Udemy</div>
                      <div className="resource-meta">
                        <span>12 hours</span>
                        <span>• 4.8 ★</span>
                        <span>• $14.99</span>
                      </div>
                    </div>
                    <div className="resource-description">
                      Learn GraphQL from scratch with practical projects
                    </div>
                    <div className="resource-relevance">
                      <div className="relevance-badge">Target Skill</div>
                      <div className="relevance-indicator">
                        <Award size={14} />
                        <span>+25 Job Matches</span>
                      </div>
                    </div>
                  </div>
                  <button className="resource-action-btn">
                    <ExternalLink size={14} />
                    <span>View</span>
                  </button>
                </div>

                <div className="resource-item">
                  <div className="resource-icon">
                    <BookOpen size={24} />
                  </div>
                  <div className="resource-content">
                    <h4 className="resource-title">AWS Certified Developer</h4>
                    <div className="resource-details">
                      <div className="resource-provider">A Cloud Guru</div>
                      <div className="resource-meta">
                        <span>25 hours</span>
                        <span>• 4.9 ★</span>
                        <span>• $29.99</span>
                      </div>
                    </div>
                    <div className="resource-description">
                      Complete AWS certification course with practice exams
                    </div>
                    <div className="resource-relevance">
                      <div className="relevance-badge high">High Impact</div>
                      <div className="relevance-indicator">
                        <Award size={14} />
                        <span>+35 Job Matches</span>
                      </div>
                    </div>
                  </div>
                  <button className="resource-action-btn">
                    <ExternalLink size={14} />
                    <span>View</span>
                  </button>
                </div>

                <div className="resource-item">
                  <div className="resource-icon">
                    <BookOpen size={24} />
                  </div>
                  <div className="resource-content">
                    <h4 className="resource-title">Docker & Kubernetes Workshop</h4>
                    <div className="resource-details">
                      <div className="resource-provider">Pluralsight</div>
                      <div className="resource-meta">
                        <span>18 hours</span>
                        <span>• 4.7 ★</span>
                        <span>• $19.99</span>
                      </div>
                    </div>
                    <div className="resource-description">
                      Hands-on course for containerization and orchestration
                    </div>
                    <div className="resource-relevance">
                      <div className="relevance-badge">Target Skill</div>
                      <div className="relevance-indicator">
                        <Award size={14} />
                        <span>+20 Job Matches</span>
                      </div>
                    </div>
                  </div>
                  <button className="resource-action-btn">
                    <ExternalLink size={14} />
                    <span>View</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="dashboard-card goals-card">
              <div className="card-header">
                <h3 className="card-title">Skill Development Goals</h3>
                <ActionButton
                  label="Add Goal"
                  icon={Plus}
                  variant="ghost"
                  size="small"
                  onClick={() => console.log('Add skill goal')}
                />
              </div>

              <div className="goals-list">
                {goals.filter(goal => goal.category === 'skills').map(goal => (
                  <GoalCard
                    key={goal.id}
                    id={goal.id}
                    goal={goal.goal}
                    current={goal.current}
                    target={goal.target}
                    onClick={() => console.log(`Goal ${goal.id} clicked`)}
                  />
                ))}

                <div className="add-goal">
                  <button className="add-goal-btn">
                    <Plus size={16} />
                    <span>Add Skill Goal</span>
                  </button>
                </div>
              </div>

              <div className="skill-roadmap">
                <h4 className="section-subtitle">Your Learning Path</h4>
                <div className="roadmap-steps">
                  <div className="roadmap-step completed">
                    <div className="step-indicator">
                      <div className="step-number">1</div>
                      <div className="step-connector"></div>
                    </div>
                    <div className="step-content">
                      <div className="step-title">React Advanced Patterns</div>
                      <div className="step-progress">Completed May 5</div>
                    </div>
                  </div>
                  <div className="roadmap-step active">
                    <div className="step-indicator">
                      <div className="step-number">2</div>
                      <div className="step-connector"></div>
                    </div>
                    <div className="step-content">
                      <div className="step-title">GraphQL Fundamentals</div>
                      <div className="step-progress">In Progress - 65% Complete</div>
                    </div>
                  </div>
                  <div className="roadmap-step">
                    <div className="step-indicator">
                      <div className="step-number">3</div>
                      <div className="step-connector"></div>
                    </div>
                    <div className="step-content">
                      <div className="step-title">AWS Certification</div>
                      <div className="step-progress">Starts Jun 1</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Activity Tab */}
      {
        activeTab === 'activity' && (
          <div className="dashboard-grid activity-grid">
            <div className="dashboard-card activity-feed-card">
              <div className="card-header">
                <h3 className="card-title">Activity Feed</h3>
                <div className="filters">
                  <select className="filter-select">
                    <option value="all">All Activities</option>
                    <option value="applications">Applications</option>
                    <option value="interviews">Interviews</option>
                    <option value="networking">Networking</option>
                  </select>
                </div>
              </div>

              <div className="activity-timeline">
                {activities.map((activity, index) => (
                  <ActivityItem
                    key={activity.id}
                    id={activity.id}
                    type={'interview'}
                    title={activity.title}
                    companyName={activity.company.name}
                    companyLogo={activity.company.logo}
                    timestamp={activity.timestamp}
                    details={activity.details}
                    isLast={index === activities.length - 1}
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

            <div className="dashboard-card application-stats-card">
              <div className="card-header">
                <h3 className="card-title">Application Analytics</h3>
                <div className="time-toggle">
                  <button className={timeRange === '30d' ? 'active' : ''}>30d</button>
                  <button className={timeRange === '90d' ? 'active' : ''}>90d</button>
                  <button className={timeRange === 'all' ? 'active' : ''}>All</button>
                </div>
              </div>

              <div className="stats-grid">
                <div className="stat-box">
                  <span className="stat-value">{totalApplications}</span>
                  <span className="stat-label">Total Applications</span>
                  <span className="stat-change positive">+15%</span>
                </div>

                <div className="stat-box">
                  <span className="stat-value">{activeApplications}</span>
                  <span className="stat-label">Active Applications</span>
                  <span className="stat-change positive">+8%</span>
                </div>

                <div className="stat-box">
                  <span className="stat-value">7.3</span>
                  <span className="stat-label">Avg. Response Days</span>
                  <span className="stat-change negative">+1.2</span>
                </div>

                <div className="stat-box">
                  <span className="stat-value">{stageCounts.interview}</span>
                  <span className="stat-label">Interviews</span>
                  <span className="stat-change positive">+3</span>
                </div>

                <div className="stat-box">
                  <span className="stat-value">{responseRate.toFixed(0)}%</span>
                  <span className="stat-label">Response Rate</span>
                  <span className="stat-change positive">+5%</span>
                </div>

                <div className="stat-box">
                  <span className="stat-value">22%</span>
                  <span className="stat-label">Interview Rate</span>
                  <span className="stat-change positive">+3%</span>
                </div>
              </div>

              <div className="advanced-analytics">
                <h4 className="section-subtitle">Advanced Insights</h4>
                <div className="analytics-insights">
                  <div className="analytics-insight">
                    <LineChart size={18} className="insight-icon" />
                    <div className="insight-content">
                      <div className="insight-title">Response rate trending up 5% this month</div>
                      <div className="insight-description">Your improved resume is showing results</div>
                    </div>
                  </div>

                  <div className="analytics-insight">
                    <PieChart size={18} className="insight-icon" />
                    <div className="insight-content">
                      <div className="insight-title">Interview success rate: 68%</div>
                      <div className="insight-description">Above average for your industry</div>
                    </div>
                  </div>

                  <div className="analytics-insight">
                    <Award size={18} className="insight-icon" />
                    <div className="insight-content">
                      <div className="insight-title">Top performing resume version: #3</div>
                      <div className="insight-description">35% higher response rate</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="dashboard-card efficiency-card">
              <div className="card-header">
                <h3 className="card-title">Job Search Efficiency</h3>
              </div>

              <div className="efficiency-metrics">
                <div className="efficiency-metric">
                  {/* <CircularProgressBar
                  percentage={78}
                  color="var(--accent-green)"
                  size={100}
                  strokeWidth={10}
                /> */}
                  <div className="metric-details">
                    <span className="metric-value">78</span>
                    <span className="metric-label">Efficiency Score</span>
                    <span className="metric-change">+12 pts</span>
                  </div>
                </div>

                <div className="vertical-divider"></div>

                <div className="efficiency-breakdown">
                  <div className="breakdown-item">
                    <div className="breakdown-label">Application Quality</div>
                    <div className="breakdown-bar-container">
                      <div className="breakdown-bar" style={{ width: '85%' }}></div>
                    </div>
                    <div className="breakdown-value">85%</div>
                  </div>

                  <div className="breakdown-item">
                    <div className="breakdown-label">Networking Leverage</div>
                    <div className="breakdown-bar-container">
                      <div className="breakdown-bar" style={{ width: '65%' }}></div>
                    </div>
                    <div className="breakdown-value">65%</div>
                  </div>

                  <div className="breakdown-item">
                    <div className="breakdown-label">Follow-up Rate</div>
                    <div className="breakdown-bar-container">
                      <div className="breakdown-bar" style={{ width: '70%' }}></div>
                    </div>
                    <div className="breakdown-value">70%</div>
                  </div>

                  <div className="breakdown-item">
                    <div className="breakdown-label">Interview Preparation</div>
                    <div className="breakdown-bar-container">
                      <div className="breakdown-bar" style={{ width: '90%' }}></div>
                    </div>
                    <div className="breakdown-value">90%</div>
                  </div>
                </div>
              </div>

              <div className="efficiency-recommendations">
                <h4 className="section-subtitle">Improvement Opportunities</h4>
                <ul className="recommendations-list">
                  <li className="recommendation-item">
                    <div className="recommendation-content">
                      <div className="recommendation-title">Utilize more referrals</div>
                      <div className="recommendation-desc">Could increase response rate by 43%</div>
                    </div>
                    <button className="recommendation-action">
                      <span>Improve</span>
                      <ChevronRight size={14} />
                    </button>
                  </li>

                  <li className="recommendation-item">
                    <div className="recommendation-content">
                      <div className="recommendation-title">Customize resume for each job</div>
                      <div className="recommendation-desc">Matching keywords could boost match scores by 15%</div>
                    </div>
                    <button className="recommendation-action">
                      <span>Improve</span>
                      <ChevronRight size={14} />
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )
      }


      {/* Quick Actions Floating Button */}
      <button className="quick-actions-button">
        <Zap size={20} className="zap-icon" />
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
          width: 350px;
          transition: all 0.3s var(--easing-standard);
        }

        .dashboard-search.focused {
          width: 400px;
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
          height: 42px;
          padding: 0 12px 0 40px;
          border-radius: var(--border-radius);
          border: 1px solid var(--border-thin);
          background: var(--glass-bg);
          color: var(--text-primary);
          font-size: 14px;
          transition: all 0.3s var(--easing-standard);
        }

        .search-input:focus {
          border-color: var(--accent-blue);
          box-shadow: 0 0 0 3px rgba(var(--accent-blue-rgb), 0.1);
        }

        .search-input:focus + .search-icon {
          color: var(--accent-blue);
        }

        .clear-search {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          width: 20px;
          height: 20px;
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

        /* Key Metrics Section */
        .key-metrics-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .key-metrics-header h3 {
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .time-range-selector {
          display: flex;
          align-items: center;
          background: var(--glass-bg);
          border: 1px solid var(--border-thin);
          border-radius: var(--border-radius);
          padding: 4px;
        }

        .time-range-selector button {
          background: transparent;
          border: none;
          padding: 6px 12px;
          border-radius: var(--border-radius-sm);
          color: var(--text-secondary);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s var(--easing-standard);
        }

        .time-range-selector button.active {
          background: var(--active-bg);
          color: var(--accent-blue);
        }

        .time-range-selector button:hover:not(.active) {
          background: var(--hover-bg);
          color: var(--text-primary);
        }

        /* Stats Summary */
        .stats-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
          animation: slideUp 0.5s var(--easing-standard) both;
          animation-delay: 0.1s;
        }

        /* Insight Panel */
        .insight-panel {
          border-radius: var(--border-radius);
          padding: 20px;
          transition: all 0.3s var(--easing-standard);
          animation: slideUp 0.5s var(--easing-standard) both;
          animation-delay: 0.2s;
        }

        .insight-panel:hover {
          transform: translateY(-3px);
        }

        .insight-header {
          margin-bottom: 20px;
        }

        .insight-header h3 {
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 4px 0;
        }

        .insight-desc {
          color: var(--text-tertiary);
          font-size: 14px;
        }

        .insight-data {
          display: flex;
          gap: 30px;
          margin-bottom: 20px;
          min-width: 80%;
        }

        .insight-chart {
          flex: 1.5;
          border-right: solid 0.05rem var(--text-primary);
          border-bottom: solid 0.05rem var(--text-primary);
          padding: 1rem;
          opacity: 50%;
          min-width: 30%;
        }

        .insight-metrics {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 15px;
        }

        .insight-metrics.vertical {
          justify-content: space-around;
        }

        .insight-metric {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .metric-value {
          font-size: 20px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .metric-label {
          font-size: 13px;
          color: var(--text-tertiary);
          margin-top: 4px;
        }

        .insight-recommendations {
          background: var(--hover-bg);
          border-radius: var(--border-radius);
          padding: 16px;
        }

        .insight-recommendations h4 {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 12px 0;
        }

        .insight-recommendations ul {
          margin: 0;
          padding: 0 0 0 20px;
          color: var(--text-secondary);
          font-size: 14px;
        }

        .insight-recommendations li {
          margin-bottom: 8px;
        }

        .insight-recommendations li:last-child {
          margin-bottom: 0;
        }

        /* Response Time Chart */
        .response-time-chart {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 10px;
        }

        .response-tier {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .tier-name {
          width: 100px;
          text-align: right;
          font-size: 14px;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .tier-bar-container {
          flex: 1;
          height: 24px;
          border-radius: var(--border-radius);
          position: relative;
        }

        .tier-bar {
          height: 100%;
          border-radius: var(--border-radius);
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding-right: 10px;
          position: relative;
          animation: growWidth 1s var(--easing-standard) forwards;
        }

        .tier-value {
          color: white;
          font-size: 13px;
          font-weight: 500;
        }

        .chart-legend {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: var(--text-tertiary);
          margin-top: 5px;
        }

        /* Success Rate Chart */
        .success-rate-chart {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .industry-row {
          display: flex;
          gap: 15px;
          align-items: center;
        }

        .industry-name {
          width: 100px;
          text-align: right;
          font-size: 14px;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .industry-stats {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .industry-bar-container {
          height: 24px;
          background: var(--hover-bg);
          border-radius: var(--border-radius);
          position: relative;
        }

        .industry-bar {
          height: 100%;
          border-radius: var(--border-radius);
          animation: growWidth 1s var(--easing-standard) forwards;
        }

        .industry-values {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: var(--text-tertiary);
        }

        .applications-count, .success-percent {
          font-weight: 500;
        }

        /* Networking Impact Chart */
        .networking-impact-chart {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        .network-metric {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .network-label {
          font-size: 15px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .comparison-bars {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .bar-container {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .bar-label {
          width: 120px;
          font-size: 13px;
          color: var(--text-secondary);
        }

        .bar-bg {
          flex: 1;
          height: 18px;
          background: var(--hover-bg);
          border-radius: var(--border-radius);
          position: relative;
        }

        .bar-value {
          height: 100%;
          background: var(--accent-blue);
          border-radius: var(--border-radius);
          animation: growWidth 1s var(--easing-standard) forwards;
        }

        .bar-percent {
          width: 40px;
          text-align: right;
          font-size: 13px;
          font-weight: 500;
          color: var(--text-primary);
        }

        /* Dashboard Tabs */
        .dashboard-tabs {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          border-bottom: 1px solid var(--border-divider);
          padding-bottom: 10px;
        }

        .dashboard-tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: transparent;
          border: none;
          border-radius: var(--border-radius);
          color: var(--text-secondary);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s var(--easing-standard);
          position: relative;
        }

        .dashboard-tab:hover {
          background: var(--hover-bg);
          color: var(--text-primary);
        }

        .dashboard-tab.active {
          background: var(--active-bg);
          color: var(--accent-blue);
        }

        .dashboard-tab.active::after {
          content: '';
          position: absolute;
          bottom: -11px;
          left: 50%;
          transform: translateX(-50%);
          width: 30px;
          height: 3px;
          background: var(--accent-blue);
          border-radius: 3px 3px 0 0;
        }

        /* Dashboard Grid */
        .dashboard-grid {
          display: grid;
          gap: 24px;
          animation: slideUp 0.5s var(--easing-standard) both;
          animation-delay: 0.3s;
        }

        .overview-grid {
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        }

        .actions-grid {
          grid-template-columns: minmax(300px, 2fr) repeat(2, minmax(300px, 1fr));
        }

        .skills-grid {
          grid-template-columns: 1.5fr 1fr;
        }

        .activity-grid {
          grid-template-columns: 1fr 1fr 1fr;
        }

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

        .skills-gap-card {
          grid-row: span 2;
        }

        .action-items-card {
          grid-row: span 2;
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

        /* Filter dropdown */
        .filters {
          display: flex;
          align-items: center;
        }

        .filter-select {
          padding: 6px 10px;
          border-radius: var(--border-radius);
          border: 1px solid var(--border-thin);
          background: var(--glass-bg);
          color: var(--text-secondary);
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s var(--easing-standard);
        }

        .filter-select:hover {
          border-color: var(--accent-blue);
        }

        /* Application Funnel */
        .funnel-visualization {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .funnel-stage {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .stage-label {
          width: 110px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .stage-name {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .stage-count {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          background: var(--hover-bg);
          border-radius: 12px;
          padding: 2px 8px;
          min-width: 28px;
          text-align: center;
        }

        .funnel-bar {
          flex: 1;
          height: 28px;
          background: var(--hover-bg);
          border-radius: var(--border-radius);
          position: relative;
          overflow: hidden;
        }

        .stage-progress {
          height: 100%;
          border-radius: var(--border-radius);
          transition: width 1s var(--easing-standard);
        }

        .funnel-stage.applied .stage-progress {
          background: var(--accent-blue);
          width: 0;
          animation: growWidth 1s var(--easing-standard) forwards;
        }

        .funnel-stage.screening .stage-progress {
          background: var(--accent-purple);
          width: 0;
          animation: growWidth 1s var(--easing-standard) forwards;
          animation-delay: 0.2s;
        }

        .funnel-stage.interview .stage-progress {
          background: var(--accent-green);
          width: 0;
          animation: growWidth 1s var(--easing-standard) forwards;
          animation-delay: 0.4s;
        }

        .funnel-stage.offer .stage-progress {
          background: var(--accent-success);
          width: 0;
          animation: growWidth 1s var(--easing-standard) forwards;
          animation-delay: 0.6s;
        }

        .stage-percent {
          width: 50px;
          text-align: right;
          font-size: 13px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .funnel-insights {
          display: flex;
          justify-content: space-around;
          margin-top: 10px;
          padding-top: 20px;
          border-top: 1px solid var(--border-divider);
        }

        .funnel-insight {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .insight-value {
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .insight-label {
          font-size: 12px;
          color: var(--text-tertiary);
          margin-top: 4px;
        }

        /* Activity Chart */
        .activity-chart {
          display: flex;
          flex-direction: column;
          height: 200px;
        }

        .chart-bars {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          height: 100%;
          margin-bottom: 10px;
        }

        .chart-bar-group {
          display: flex;
          gap: 4px;
          align-items: flex-end;
          height: 100%;
        }

        .chart-bar {
          width: 18px;
          border-radius: var(--border-radius) var(--border-radius) 0 0;
          position: relative;
          min-height: 10px;
          transition: height 1s var(--easing-standard);
        }

        .chart-bar.applications {
          background: var(--accent-blue);
        }

        .chart-bar.interviews {
          background: var(--accent-purple);
        }

        .bar-value {
          position: absolute;
          top: -20px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 12px;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .chart-labels {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: var(--text-tertiary);
        }

        .activity-summary {
          display: flex;
          justify-content: space-around;
          margin-top: 10px;
          padding-top: 20px;
          border-top: 1px solid var(--border-divider);
        }

        .summary-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .summary-value {
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .summary-label {
          font-size: 12px;
          color: var(--text-tertiary);
          margin-top: 4px;
        }

        /* Match Score Distribution */
        .match-score-distribution {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .match-score-bar {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .score-bar-container {
          height: 12px;
          background: var(--hover-bg);
          border-radius: var(--border-radius);
          overflow: hidden;
        }

        .score-bar {
          height: 100%;
          border-radius: var(--border-radius);
          transition: width 1s var(--easing-standard);
          width: 0;
          animation: growWidth 1s var(--easing-standard) forwards;
        }

        .score-label {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
        }

        .company-name {
          color: var(--text-secondary);
        }

        .score-value {
          font-weight: 500;
          color: var(--text-primary);
        }

        .match-insights {
          display: flex;
          justify-content: space-around;
          margin-top: 10px;
          padding-top: 20px;
          border-top: 1px solid var(--border-divider);
        }

        .match-insight {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        /* Circular Progress Bar */
        .circular-progress {
          position: relative;
          transform: rotate(-90deg);
        }

        .circular-progress-background {
          fill: none;
          stroke: var(--hover-bg);
        }

        .circular-progress-value {
          fill: none;
          stroke-linecap: round;
          transition: stroke-dashoffset 1s var(--easing-standard);
        }

        .circular-progress-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(90deg);
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
        }

        /* Upcoming Events */
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

        .card-actions.centered {
          justify-content: center;
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

        .action-btn.view-all-jobs {
          padding: 10px 20px;
          font-weight: 600;
        }

        /* Action Items */
        .action-items-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          overflow-y: auto;
          max-height: 500px;
        }

        .action-item {
          padding: 16px;
          border-radius: var(--border-radius);
          background: var(--hover-bg);
          border-left: 4px solid var(--accent-blue);
          transition: all 0.2s var(--easing-standard);
        }

        .action-item:hover {
          background: var(--active-bg);
          transform: translateX(3px);
        }

        .action-item.high {
          border-left-color: var(--accent-red);
        }

        .action-item.medium {
          border-left-color: var(--accent-orange);
        }

        .action-item.low {
          border-left-color: var(--accent-green);
        }

        .action-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 10px;
        }

        .action-title {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .action-type {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 500;
          padding: 4px 10px;
          border-radius: 12px;
          background: var(--glass-bg);
          color: var(--text-secondary);
        }

        .action-description {
          font-size: 14px;
          color: var(--text-secondary);
          margin: 0 0 12px 0;
        }

        .action-due-date {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--text-tertiary);
          margin-bottom: 12px;
        }

        .action-buttons {
          display: flex;
          gap: 10px;
        }

        .action-btn.primary {
          background: var(--accent-blue);
          color: white;
          border-color: var(--accent-blue);
        }

        .action-btn.primary:hover {
          background: var(--accent-blue-dark);
          border-color: var(--accent-blue-dark);
          color: white;
        }

        .action-btn.secondary {
          background: transparent;
          color: var(--text-secondary);
          border-color: var(--border-thin);
        }

        .action-btn.secondary:hover {
          background: var(--active-bg);
          color: var(--text-primary);
          border-color: var(--border-thin);
        }

        /* Recommended Jobs */
        .recommended-jobs-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          overflow-y: auto;
          max-height: 500px;
        }

        .recommended-job {
          display: flex;
          gap: 16px;
          padding: 16px;
          border-radius: var(--border-radius);
          background: var(--hover-bg);
          transition: all 0.2s var(--easing-standard);
        }

        .recommended-job:hover {
          background: var(--active-bg);
          transform: translateY(-3px);
        }

        .job-match-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--accent-green);
          color: white;
          font-size: 14px;
          font-weight: 600;
        }

        .job-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .job-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .job-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .job-company {
          font-size: 14px;
          color: var(--text-secondary);
        }

        .job-details {
          display: flex;
          gap: 20px;
          font-size: 13px;
          color: var(--text-tertiary);
        }

        .job-location, .job-salary {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .matched-skills {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 5px;
        }

        .skill-tag {
          padding: 4px 10px;
          border-radius: 12px;
          background: var(--glass-bg);
          font-size: 12px;
          color: var(--accent-blue);
          font-weight: 500;
        }

        .job-actions {
          display: flex;
          gap: 10px;
          margin-top: 8px;
        }

        .job-action-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: var(--border-radius);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s var(--easing-standard);
        }

        .job-action-btn.primary {
          background: var(--accent-blue);
          color: white;
          border: none;
        }

        .job-action-btn.primary:hover {
          background: var(--accent-blue-dark);
        }

        .job-action-btn.secondary {
          background: transparent;
          color: var(--text-secondary);
          border: 1px solid var(--border-thin);
        }

        .job-action-btn.secondary:hover {
          background: var(--active-bg);
          color: var(--text-primary);
        }

        /* Networking Opportunities */
        .networking-opportunities {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .opportunity {
          padding: 16px;
          border-radius: var(--border-radius);
          background: var(--hover-bg);
          transition: all 0.2s var(--easing-standard);
        }

        .opportunity:hover {
          background: var(--active-bg);
          transform: translateY(-2px);
        }

        .opportunity-content {
          display: flex;
          gap: 12px;
          margin-bottom: 14px;
        }

        .avatar-group {
          position: relative;
        }

        .avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--accent-blue);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
        }

        .company-logo.small {
          position: absolute;
          bottom: -2px;
          right: -2px;
          width: 18px;
          height: 18px;
          font-size: 10px;
          border: 2px solid var(--hover-bg);
        }

        .opportunity-details {
          flex: 1;
        }

        .contact-name {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 4px 0;
        }

        .contact-role {
          font-size: 13px;
          color: var(--text-secondary);
          margin-bottom: 4px;
        }

        .connection-info {
          font-size: 12px;
          color: var(--text-tertiary);
        }

        .opportunity-actions {
          display: flex;
          gap: 10px;
        }

        .network-action-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: var(--border-radius);
          font-size: 13px;
          font-weight: 500;
          flex: 1;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s var(--easing-standard);
        }

        .network-action-btn.primary {
          background: var(--accent-blue);
          color: white;
          border: none;
        }

        .network-action-btn.primary:hover {
          background: var(--accent-blue-dark);
        }

        .network-action-btn.secondary {
          background: transparent;
          color: var(--text-secondary);
          border: 1px solid var(--border-thin);
        }

        .network-action-btn.secondary:hover {
          background: var(--active-bg);
          color: var(--text-primary);
        }

        .networking-events {
          margin-top: 10px;
          padding-top: 20px;
          border-top: 1px solid var(--border-divider);
        }

        .section-subtitle {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 14px 0;
        }

        .event {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: var(--border-radius);
          background: var(--hover-bg);
          transition: all 0.2s var(--easing-standard);
        }

        .event:hover {
          background: var(--active-bg);
        }

        .event-icon {
          color: var(--accent-blue);
        }

        .event-details {
          flex: 1;
        }

        .event-name {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .event-info {
          font-size: 12px;
          color: var(--text-tertiary);
        }

        .event-action-btn {
          padding: 4px 12px;
          border-radius: var(--border-radius);
          background: var(--accent-blue);
          color: white;
          font-size: 12px;
          font-weight: 500;
          border: none;
          cursor: pointer;
          transition: all 0.2s var(--easing-standard);
        }

        .event-action-btn:hover {
          background: var(--accent-blue-dark);
        }

        /* Skills Gap Analysis */
        .skills-gap-list {
          display: flex;
          flex-direction: column;
          gap: 24px;
          overflow-y: auto;
          max-height: 500px;
        }

        .skill-gap-item {
          padding: 16px;
          border-radius: var(--border-radius);
          background: var(--hover-bg);
          transition: all 0.2s var(--easing-standard);
        }

        .skill-gap-item:hover {
          background: var(--active-bg);
          transform: translateY(-2px);
        }

        .skill-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .skill-name {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .skill-jobs {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: var(--text-tertiary);
        }

        .skill-bars {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-bottom: 16px;
        }

        .skill-bar-container {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .bar-label {
          width: 120px;
          font-size: 13px;
          color: var(--text-secondary);
        }

        .bar-bg {
          flex: 1;
          height: 12px;
          background: var(--glass-bg);
          border-radius: var(--border-radius);
          overflow: hidden;
        }

        .bar-value.demand {
          background: var(--accent-blue);
        }

        .bar-value.proficiency {
          background: var(--accent-green);
        }

        .bar-value-label {
          width: 40px;
          text-align: right;
          font-size: 13px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .skill-gap-indicator {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 10px;
          padding-top: 16px;
          border-top: 1px solid var(--border-divider);
        }

        .gap-percentage {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .gap-value {
          font-size: 18px;
          font-weight: 600;
          color: var(--accent-red);
        }

        .gap-label {
          font-size: 12px;
          color: var(--text-tertiary);
        }

        .gap-action-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: var(--border-radius);
          background: var(--glass-bg);
          color: var(--accent-blue);
          font-size: 13px;
          font-weight: 500;
          border: 1px solid var(--border-thin);
          cursor: pointer;
          transition: all 0.2s var(--easing-standard);
        }

        .gap-action-btn:hover {
          background: var(--active-bg);
          color: var(--accent-blue-dark);
          border-color: var(--accent-blue);
        }

        .skills-insights {
          margin-top: 10px;
          padding-top: 20px;
          border-top: 1px solid var(--border-divider);
        }

        .insight-list {
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .insight-item {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
          font-size: 14px;
          color: var(--text-secondary);
        }

        .insight-icon {
          color: var(--accent-blue);
        }

        /* Skill Resources */
        .skill-resources {
          display: flex;
          flex-direction: column;
          gap: 16px;
          overflow-y: auto;
          max-height: 500px;
        }

        .resource-item {
          display: flex;
          gap: 16px;
          padding: 16px;
          border-radius: var(--border-radius);
          background: var(--hover-bg);
          transition: all 0.2s var(--easing-standard);
        }

        .resource-item:hover {
          background: var(--active-bg);
          transform: translateY(-2px);
        }

        .resource-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--accent-blue);
          color: white;
        }

        .resource-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .resource-title {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .resource-details {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .resource-provider {
          font-size: 13px;
          color: var(--text-secondary);
        }

        .resource-meta {
          font-size: 12px;
          color: var(--text-tertiary);
        }

        .resource-description {
          font-size: 13px;
          color: var(--text-secondary);
          margin: 4px 0;
        }

        .resource-relevance {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 6px;
        }

        .relevance-badge {
          font-size: 12px;
          font-weight: 500;
          padding: 2px 8px;
          border-radius: 12px;
          background: rgba(var(--accent-blue-rgb), 0.1);
          color: var(--accent-blue);
        }

        .relevance-badge.high {
          background: rgba(var(--accent-green-rgb), 0.1);
          color: var(--accent-green);
        }

        .relevance-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--text-tertiary);
        }

        .resource-action-btn {
          align-self: flex-start;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: var(--border-radius);
          background: var(--glass-bg);
          color: var(--accent-blue);
          font-size: 13px;
          font-weight: 500;
          border: 1px solid var(--border-thin);
          cursor: pointer;
          transition: all 0.2s var(--easing-standard);
        }

        .resource-action-btn:hover {
          background: var(--active-bg);
          color: var(--accent-blue-dark);
          border-color: var(--accent-blue);
        }

        /* Goals Card */
        .goals-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .add-goal {
          display: flex;
          justify-content: center;
          padding: 16px;
        }

        .add-goal-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: var(--border-radius);
          background: var(--glass-bg);
          color: var(--accent-blue);
          font-size: 14px;
          font-weight: 500;
          border: 1px dashed var(--accent-blue);
          cursor: pointer;
          transition: all 0.2s var(--easing-standard);
        }

        .add-goal-btn:hover {
          background: rgba(var(--accent-blue-rgb), 0.05);
        }

        .skill-roadmap {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid var(--border-divider);
        }

        .roadmap-steps {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .roadmap-step {
          display: flex;
          gap: 16px;
        }

        .step-indicator {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .step-number {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--accent-blue);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 600;
        }

        .roadmap-step.completed .step-number {
          background: var(--accent-green);
        }

        .roadmap-step.active .step-number {
          background: var(--accent-blue);
        }

        .step-connector {
          width: 2px;
          height: 30px;
          background: var(--border-divider);
          margin-top: 4px;
        }

        .roadmap-step:last-child .step-connector {
          display: none;
        }

        .step-content {
          flex: 1;
        }

        .step-title {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 4px 0;
        }

        .step-progress {
          font-size: 13px;
          color: var(--text-tertiary);
        }

        .roadmap-step.completed .step-progress {
          color: var(--accent-green);
        }

        /* Activity Feed */
        .activity-timeline {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        .timeline-end {
          display: flex;
          flex-direction: column;
          align-items: center;
          color: var(--text-tertiary);
          font-size: 14px;
          margin-top: 10px;
        }

        .timeline-end-icon {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--hover-bg);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 8px;
        }

        .timeline-end-text {
          cursor: pointer;
          transition: color 0.2s var(--easing-standard);
        }

        .timeline-end-text:hover {
          color: var(--accent-blue);
        }

        /* Application Stats */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
        }

        .stat-box {
          border-radius: var(--border-radius);
          padding: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          transition: all 0.2s var(--easing-standard);
        }

        .stat-box:hover {
          background: var(--active-bg);
          transform: translateY(-2px);
        }

        .stat-value {
          font-size: 20px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .stat-label {
          font-size: 13px;
          color: var(--text-tertiary);
          margin: 4px 0;
        }

        .stat-change {
          font-size: 12px;
          font-weight: 500;
        }

        .stat-change.positive {
          color: var(--accent-green);
        }

        .stat-change.negative {
          color: var(--accent-red);
        }

        .advanced-analytics {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid var(--border-divider);
        }

        .analytics-insights {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .analytics-insight {
          display: flex;
          gap: 12px;
          padding: 12px;
          border-radius: var(--border-radius);
          background: var(--hover-bg);
          transition: all 0.2s var(--easing-standard);
        }

        .analytics-insight:hover {
          background: var(--active-bg);
        }

        .insight-content {
          flex: 1;
        }

        .insight-title {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .insight-description {
          font-size: 13px;
          color: var(--text-tertiary);
        }

        /* Efficiency Card */
        .efficiency-metrics {
          display: flex;
          align-items: center;
          gap: 30px;
          padding: 20px 0;
        }

        .efficiency-metric {
          display: flex;
          align-items: center;
          gap: 20px;
          padding-right: 30px;
        }

        .metric-details {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .metric-change {
          font-size: 12px;
          font-weight: 500;
          color: var(--accent-green);
        }

        .vertical-divider {
          width: 1px;
          height: 100px;
          background: var(--border-divider);
        }

        .efficiency-breakdown {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .breakdown-item {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .breakdown-label {
          width: 130px;
          font-size: 14px;
          color: var(--text-secondary);
        }

        .breakdown-bar-container {
          flex: 1;
          height: 8px;
          background: var(--hover-bg);
          border-radius: 4px;
          overflow: hidden;
        }

        .breakdown-bar {
          height: 100%;
          background: var(--accent-blue);
          border-radius: 4px;
          width: 0;
          animation: growWidth 1s var(--easing-standard) forwards;
          animation-delay: 0.2s;
        }

        .breakdown-value {
          width: 40px;
          text-align: right;
          font-size: 13px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .efficiency-recommendations {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid var(--border-divider);
        }

        .recommendations-list {
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .recommendation-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          margin-bottom: 10px;
          border-radius: var(--border-radius);
          background: var(--hover-bg);
          transition: all 0.2s var(--easing-standard);
        }

        .recommendation-item:hover {
          background: var(--active-bg);
        }

        .recommendation-content {
          flex: 1;
        }

        .recommendation-title {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
          margin-bottom: 3px;
        }

        .recommendation-desc {
          font-size: 13px;
          color: var(--text-tertiary);
        }

        .recommendation-action {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: var(--border-radius);
          background: var(--glass-bg);
          color: var(--accent-blue);
          font-size: 13px;
          font-weight: 500;
          border: 1px solid var(--border-thin);
          cursor: pointer;
          transition: all 0.2s var(--easing-standard);
        }

        .recommendation-action:hover {
          background: var(--active-bg);
          color: var(--accent-blue-dark);
          border-color: var(--accent-blue);
        }

        /* Monthly Goals Section */
        .monthly-goals {
          margin-top: 40px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .goals-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          animation: slideUp 0.5s var(--easing-standard) both;
          animation-delay: 0.4s;
        }

        .goal-card {
          background: var(--glass-card-bg);
          border-radius: var(--border-radius);
          border: 1px solid var(--border-thin);
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          box-shadow: var(--shadow);
          transition: transform 0.3s var(--easing-standard), box-shadow 0.3s var(--easing-standard);
        }

        .goal-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-lg);
        }

        .goal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .goal-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .goal-category {
          font-size: 12px;
          font-weight: 500;
          padding: 3px 8px;
          border-radius: 12px;
          background: rgba(var(--accent-blue-rgb), 0.1);
          color: var(--accent-blue);
        }

        .goal-progress {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .progress-bar-container {
          height: 8px;
          background: var(--hover-bg);
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-bar {
          height: 100%;
          background: var(--accent-blue);
          border-radius: 4px;
          width: 0;
          animation: growWidth 1s var(--easing-standard) forwards;
        }

        .progress-bar.completed {
          background: var(--accent-green);
        }

        .progress-text {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          color: var(--text-secondary);
        }

        .progress-value {
          font-weight: 500;
          color: var(--text-primary);
        }

        .goal-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
          padding-top: 16px;
          border-top: 1px solid var(--border-divider);
        }

        .goal-metric {
          display: flex;
          flex-direction: column;
        }

        .metric-name {
          font-size: 12px;
          color: var(--text-tertiary);
        }

        .metric-figure {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .goal-action {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: var(--border-radius);
          background: var(--glass-bg);
          color: var(--accent-blue);
          font-size: 13px;
          font-weight: 500;
          border: 1px solid var(--border-thin);
          cursor: pointer;
          transition: all 0.2s var(--easing-standard);
        }

        .goal-action:hover {
          background: var(--active-bg);
          color: var(--accent-blue-dark);
          border-color: var(--accent-blue);
        }

        .add-goal-card {
          background: var(--glass-card-bg);
          border-radius: var(--border-radius);
          border: 1px dashed var(--border-thin);
          padding: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 160px;
          transition: all 0.3s var(--easing-standard);
        }

        .add-goal-card:hover {
          border-color: var(--accent-blue);
          background: rgba(var(--accent-blue-rgb), 0.05);
        }

        /* Application Stages */
        .application-stages {
          margin-top: 40px;
        }

        .stages-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
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
          animation: slideUp 0.5s var(--easing-standard) both;
          animation-delay: 0.5s;
        }

        .stage-card {
          background: var(--glass-card-bg);
          border-radius: var(--border-radius);
          border: 1px solid var(--border-thin);
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          box-shadow: var(--shadow);
          transition: transform 0.3s var(--easing-standard), box-shadow 0.3s var(--easing-standard);
          position: relative;
          overflow: hidden;
        }

        .stage-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-lg);
        }

        .stage-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
        }

        .stage-card.applied::before {
          background: var(--accent-blue);
        }

        .stage-card.screening::before {
          background: var(--accent-purple);
        }

        .stage-card.interview::before {
          background: var(--accent-green);
        }

        .stage-card.offer::before {
          background: var(--accent-success);
        }

        .stage-card.rejected::before {
          background: var(--accent-red);
        }

        .stage-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .stage-name {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
          text-transform: capitalize;
        }

        .stage-count {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
          min-width: 28px;
          text-align: center;
        }

        .stage-description {
          font-size: 14px;
          color: var(--text-secondary);
          margin: 0;
        }

        .stage-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: auto;
          padding-top: 16px;
          border-top: 1px solid var(--border-divider);
        }

        .stage-metric {
          display: flex;
          flex-direction: column;
        }

        .metric-label {
          font-size: 12px;
          color: var(--text-tertiary);
        }

        .metric-value {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .stage-action {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: var(--border-radius);
          background: var(--glass-bg);
          color: var(--accent-blue);
          font-size: 13px;
          font-weight: 500;
          border: 1px solid var(--border-thin);
          cursor: pointer;
          transition: all 0.2s var(--easing-standard);
        }

        .stage-action:hover {
          background: var(--active-bg);
          color: var(--accent-blue-dark);
          border-color: var(--accent-blue);
        }

        /* Quick Actions Button */
        .quick-actions-button {
          position: fixed;
          bottom: 30px;
          right: 30px;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: var(--accent-blue);
          color: white;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(var(--accent-blue-rgb), 0.3);
          cursor: pointer;
          transition: all 0.3s var(--easing-standard);
          z-index: 100;
        }

        .quick-actions-button:hover {
          background: var(--accent-blue-dark);
          transform: translateY(-3px);
          box-shadow: 0 6px 16px rgba(var(--accent-blue-rgb), 0.4);
        }

        .zap-icon {
          filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.5));
        }

        .button-tooltip {
          position: absolute;
          top: -40px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--tooltip-bg);
          color: var(--tooltip-text);
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 13px;
          white-space: nowrap;
          opacity: 0;
          transition: opacity 0.2s var(--easing-standard);
          pointer-events: none;
        }

        .button-tooltip::after {
          content: '';
          position: absolute;
          bottom: -6px;
          left: 50%;
          transform: translateX(-50%);
          border-width: 6px 6px 0;
          border-style: solid;
          border-color: var(--tooltip-bg) transparent transparent;
        }

        .quick-actions-button:hover .button-tooltip {
          opacity: 1;
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

        @keyframes growWidth {
          from {
            width: 0;
          }
        }

        /* Media Queries */
        @media (max-width: 1200px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }

          .actions-grid {
            grid-template-columns: 1fr;
          }

          .skills-grid {
            grid-template-columns: 1fr;
          }

          .activity-grid {
            grid-template-columns: 1fr;
          }

          .insight-data {
            flex-direction: column;
          }

          .efficiency-metrics {
            flex-direction: column;
            align-items: flex-start;
          }

          .vertical-divider {
            width: 100%;
            height: 1px;
            margin: 20px 0;
          }
        }

        @media (max-width: 768px) {
          .stat-box {
            padding: 10px;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .stages-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .goals-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .dashboard-search {
            width: 250px;
          }

          .dashboard-search.focused {
            width: 300px;
          }
        }

        @media (max-width: 576px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .stages-grid {
            grid-template-columns: 1fr;
          }

          .goals-grid {
            grid-template-columns: 1fr;
          }

          .dashboard-search {
            width: 100%;
          }

          .dashboard-search.focused {
            width: 100%;
          }

          .time-range-selector button {
            padding: 6px 8px;
          }
        }
      `}</style>
    </section >)
}
