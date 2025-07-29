'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText, Bell, Calendar, Search, CheckCircle, Activity,
  BarChart2, MoreHorizontal, ChevronRight, ChevronDown, Clock, Target, Plus,
  X, Zap, Award, MessagesSquare, Share2, BookOpen, CheckSquare, User, Timer, X as XIcon
} from 'lucide-react';
import StatCard from '../dashboard/StatCard';
import ActivityItem from '../dashboard/ActivityItem';
import UpcomingEvent from '../dashboard/UpcomingEvent';
import ActionButton from '../dashboard/ActionButton';
import TabButton, { TabGroup } from '../TabButton';
import ApplicationFunnel from '../ApplicationFunnel';
import WeeklyActivity from '../WeeklyActivity';
import ActionsTab from '../ActionsTab';
import { useFeatureFlags } from '@/contexts/FeatureFlagContext';
import SkillsTab from '../SkillsTab'; // Import the new SkillsTab component
import EnhancedDropdown from '../EnhancedDropdown';
import { useAppData } from '../../contexts/AppDataContext';

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
  type: 'application' | 'interview' | 'network';
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
  type: 'Interview' | 'Deadline' | 'Networking' | 'Follow-up';
  application: Application;
  details: string;
  duration?: number;
  priority?: 'low' | 'medium' | 'high';
}

interface MonthlyGoal {
  id: string;
  goal: string;
  current: number;
  target: number;
  progress: number;
  category: 'applications' | 'networking' | 'skills' | 'interviews';
}

interface RecommendedAction {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  type: 'application' | 'follow-up' | 'preparation' | 'networking' | 'skill';
  dueDate?: Date;
}

interface SkillGap {
  skill: string;
  demand: number;
  proficiency: number;
  gap: number;
  jobsRequiring: number;
}

export default function DashboardHome() {
  const { ENABLE_DEVELOPMENT_FEATURES } = useFeatureFlags();
  const { applications, activities, upcomingEvents, appStats, userProfile, loading, error } = useAppData();

  // Extract individual data sets for easier access
  const applicationsData = applications;
  const activitiesData = activities;
  const eventsData = upcomingEvents;
  const goalsData: any[] = []; // Goals not implemented in DB yet, will use defaults
  const remindersData: any[] = []; // Reminders not implemented in DB yet

  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [activeInsight, setActiveInsight] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('30d');
  const [activityFilter, setActivityFilter] = useState('all');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate stats from actual database data
  const stageCounts = applicationsData.reduce((counts, app) => {
    counts[app.stage] = (counts[app.stage] || 0) + 1;
    return counts;
  }, {
    applied: 0,
    screening: 0,
    interview: 0,
    offer: 0,
    rejected: 0
  });

  // Use database stats if available, fallback to calculated stats
  const totalApplications = appStats.totalApplications || Object.values(stageCounts).reduce((sum: number, count) => sum + (count as number), 0);
  const activeApplications = appStats.activeApplications || (stageCounts.applied + stageCounts.screening + stageCounts.interview);
  const responseRate = parseFloat(appStats.responseRate) || (totalApplications > 0 ? ((totalApplications - stageCounts.applied) / totalApplications) * 100 : 0);
  const successRate = parseFloat(appStats.successRate) || ((stageCounts.offer + stageCounts.rejected) > 0 ? (stageCounts.offer / (stageCounts.offer + stageCounts.rejected)) * 100 : 0);

  const skillGaps: SkillGap[] = []; // TODO: Implement skill gap analysis

  // Calculate weekly activity from applications data
  const weeklyActivity = (() => {
    const today = new Date();
    const activity = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat

    applicationsData.forEach(app => {
      const appDate = new Date(app.date_applied);
      const daysDiff = Math.floor((today.getTime() - appDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff < 7) {
        const dayOfWeek = appDate.getDay();
        activity[dayOfWeek]++;
      }
    });

    return activity;
  })();

  // Calculate response times by company tier (mock data based on company characteristics)
  const responseTimesByTier: { tier: string; days: number }[] = (() => {
    const tiers: { [key: string]: number[] } = { 'Startup': [], 'Mid-size': [], 'Enterprise': [] };

    applicationsData.forEach(app => {
      const responseTime = Math.floor(Math.random() * 14) + 1; // 1-14 days
      // Simple heuristic: classify by company name patterns
      if (app.company.name.toLowerCase().includes('google') ||
        app.company.name.toLowerCase().includes('microsoft') ||
        app.company.name.toLowerCase().includes('amazon')) {
        tiers['Enterprise'].push(responseTime);
      } else if (app.company.name.length > 15) {
        tiers['Mid-size'].push(responseTime);
      } else {
        tiers['Startup'].push(responseTime);
      }
    });

    return Object.entries(tiers).map(([tier, times]) => ({
      tier,
      days: times.length > 0 ? Math.round(times.reduce((a: number, b: number) => a + b, 0) / times.length) : 0
    })).filter(item => item.days > 0);
  })();

  // Calculate top industries from applications
  const topIndustries: { name: string; count: number; success: number }[] = (() => {
    const industries: { [key: string]: { count: number; offers: number } } = {};

    applicationsData.forEach(app => {
      const industry = app.company.industry || 'Technology'; // Default fallback
      if (!industries[industry]) {
        industries[industry] = { count: 0, offers: 0 };
      }
      industries[industry].count++;
      if (app.stage === 'offer') {
        industries[industry].offers++;
      }
    });

    return Object.entries(industries)
      .map(([name, data]: [string, any]) => ({
        name,
        count: data.count,
        success: data.count > 0 ? Math.round((data.offers / data.count) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  })();

  // Use database data directly (arrays, not wrapped objects)
  const upcomingEventsToShow = eventsData.slice(0, 4);
  const upcomingReminders: any[] = []; // remindersData.slice(0, 3); // Not implemented in DB yet
  const recentActivities = activitiesData.slice(0, 5);
  const monthlyGoals = goalsData; // Empty for now, will use defaults later

  const recommendedActions: RecommendedAction[] = [
    { id: 'action1', title: 'Follow up on Google application', description: 'It\'s been 7 days since your application with no response.', priority: 'high', type: 'follow-up', dueDate: new Date(new Date().getTime() + 86400000) },
    { id: 'action2', title: 'Complete AWS certification', description: 'This skill appears in 65% of your target job listings.', priority: 'medium', type: 'skill' },
    { id: 'action3', title: 'Connect with Microsoft recruiter', description: 'Your network has 2 connections that could introduce you.', priority: 'medium', type: 'networking' },
    { id: 'action4', title: 'Prepare for technical interview', description: 'Your interview with Google is in 1 day.', priority: 'high', type: 'preparation', dueDate: new Date(new Date().getTime()) },
    { id: 'action5', title: 'Apply to recommended jobs', description: '5 new jobs match your profile with 85%+ compatibility.', priority: 'medium', type: 'application' }
  ];

  // Calculate job match scores based on application data
  const jobMatchScores: number[] = (() => {
    if (applicationsData.length === 0) return [];

    return applicationsData.map(app => {
      // Generate match scores based on various factors
      let score = 70; // Base score

      // Boost score based on application stage progression
      if (app.stage === 'screening') score += 10;
      if (app.stage === 'interview') score += 20;
      if (app.stage === 'offer') score += 30;

      // Boost for shortlisted applications
      if (app.is_shortlisted) score += 5;

      // Boost for remote opportunities
      if (app.remote) score += 8;

      // Add some randomness for realistic variation
      score += Math.floor(Math.random() * 20) - 10;

      // Ensure score is within 0-100 range
      return Math.max(0, Math.min(100, score));
    });
  })();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <section className={`dashboard-home ${mounted ? 'mounted' : ''}`}>
      <div className="dashboard-search">
        <Search className="search-icon" size={18} />
        <input
          type="text"
          placeholder="Search applications, companies, or contacts..."
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          className="search-input"
        />
        {searchTerm && (
          <button className="clear-search" onClick={() => setSearchTerm('')}>
            <X size={12} />
          </button>
        )}
      </div>

      <div className="time-range-selector">
        <ActionButton
          label="7d"
          icon={Clock}
          variant={timeRange === '7d' ? 'secondary' : 'ghost'}
          size="small"
          onClick={() => setTimeRange('7d')}
        />
        <ActionButton
          label="30d"
          icon={Clock}
          variant={timeRange === '30d' ? 'secondary' : 'ghost'}
          size="small"
          onClick={() => setTimeRange('30d')}
        />
        <ActionButton
          label="90d"
          icon={Clock}
          variant={timeRange === '90d' ? 'secondary' : 'ghost'}
          size="small"
          onClick={() => setTimeRange('90d')}
        />
        <ActionButton
          label="All"
          icon={Clock}
          variant={timeRange === 'all' ? 'secondary' : 'ghost'}
          size="small"
          onClick={() => setTimeRange('all')}
        />
      </div>

      <div className="stats-summary">
        <StatCard value={totalApplications} label="Total Applications" icon={FileText} color="var(--accent-blue)" onClick={() => setActiveInsight('total-applications')} />
        <StatCard value={totalApplications > 0 ? `${responseRate.toFixed(0)}%` : "0%"} label="Response Rate" icon={Activity} color="var(--accent-purple)" onClick={() => setActiveInsight('response-rate')} />
        <StatCard value={totalApplications > 0 ? `${successRate.toFixed(0)}%` : "0%"} label="Success Rate" icon={Award} color="var(--accent-green)" onClick={() => setActiveInsight('success-rate')} />
        <StatCard value={activeApplications} label="Active Applications" icon={Clock} color="var(--accent-orange)" onClick={() => setActiveInsight('active-applications')} />
      </div>

      <div className="insight-panel">
        {activeInsight === 'response-rate' && (
          <div className="insight-content">
            <div className="insight-header">
              <h3>Application Response Rate Analysis</h3>
              <span className="insight-desc">How quickly companies are responding to your applications</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', width: '100%', minWidth: '100%' }}>
              <div className="insight-data">
                <div className="insight-chart">
                  <div className="response-time-chart">
                    {responseTimesByTier.length > 0 ? (
                      responseTimesByTier.map((tier, index) => (
                        <div className="response-tier" key={tier.tier}>
                          <div className="tier-name">{tier.tier}</div>
                          <div className="tier-bar-container">
                            <div className="tier-bar" style={{ width: `${Math.min(100, tier.days * 5)}%`, backgroundColor: index === 0 ? 'var(--accent-green)' : index === 1 ? 'var(--accent-blue)' : 'var(--accent-purple)' }}>
                              <span className="tier-value">{tier.days} days</span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="empty-state">
                        <p>No response time data available yet.</p>
                        <p>Start applying to jobs to see response time insights.</p>
                      </div>
                    )}
                  </div>
                  {responseTimesByTier.length > 0 && (
                    <div className="chart-legend">
                      <span>Faster Response</span>
                      <span>Slower Response</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="dashboard-card match-score-card">
                <div className="card-header">
                  <h3 className="card-title">Job Match Quality</h3>
                  <ActionButton label="Improve Matches" icon={Award} variant="ghost" size="small" />
                </div>
                <div className="match-score-distribution">
                  {jobMatchScores.length > 0 ? (
                    jobMatchScores.map((score, index) => (
                      <div className="match-score-bar" key={index}>
                        <div className="score-bar-container">
                          <div className="score-bar" style={{ width: `${score}%`, backgroundColor: score >= 90 ? 'var(--accent-green)' : score >= 80 ? 'var(--accent-blue)' : score >= 70 ? 'var(--accent-purple)' : 'var(--accent-orange)' }}></div>
                        </div>
                        <div className="score-label">
                          <span className="company-name">Company {index + 1}</span>
                          <span className="score-value">{score}%</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">
                      <p>No job match data available yet.</p>
                      <p>Apply to jobs to see match quality insights.</p>
                    </div>
                  )}
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
                  {topIndustries.length > 0 ? (
                    topIndustries.map(industry => (
                      <div className="industry-row" key={industry.name}>
                        <div className="industry-name">{industry.name}</div>
                        <div className="industry-stats">
                          <div className="industry-bar-container">
                            <div className="industry-bar" style={{ width: `${industry.success}%`, backgroundColor: industry.success > 40 ? 'var(--accent-green)' : industry.success > 20 ? 'var(--accent-blue)' : 'var(--accent-red)' }}></div>
                          </div>
                          <div className="industry-values">
                            <span className="applications-count">{industry.count} apps</span>
                            <span className="success-percent">{industry.success}%</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">
                      <p>No industry success rate data available yet.</p>
                      <p>Apply to jobs across different industries to see success rate insights.</p>
                    </div>
                  )}
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
        {activeInsight === 'total-applications' && (
          <div className="insight-content">
            <div className="insight-header">
              <h3>Total Applications Overview</h3>
              <span className="insight-desc">Your job application activity and progress</span>
            </div>
            <div className="insight-data">
              <div className="insight-chart">
                {totalApplications > 0 ? (
                  <div className="applications-breakdown">
                    <div className="breakdown-item">
                      <span className="breakdown-label">Applied</span>
                      <span className="breakdown-value">{stageCounts.applied}</span>
                    </div>
                    <div className="breakdown-item">
                      <span className="breakdown-label">Screening</span>
                      <span className="breakdown-value">{stageCounts.screening}</span>
                    </div>
                    <div className="breakdown-item">
                      <span className="breakdown-label">Interview</span>
                      <span className="breakdown-value">{stageCounts.interview}</span>
                    </div>
                    <div className="breakdown-item">
                      <span className="breakdown-label">Offer</span>
                      <span className="breakdown-value">{stageCounts.offer}</span>
                    </div>
                    <div className="breakdown-item">
                      <span className="breakdown-label">Rejected</span>
                      <span className="breakdown-value">{stageCounts.rejected}</span>
                    </div>
                  </div>
                ) : (
                  <div className="empty-state">
                    <p>No applications yet.</p>
                    <p>Start applying to jobs to track your progress here.</p>
                  </div>
                )}
              </div>
            </div>
            <div className="insight-recommendations">
              <h4>Tips</h4>
              <ul>
                <li>Aim for 2-3 applications per day for consistent progress</li>
                <li>Track which job boards and methods give you the best results</li>
                <li>Quality applications perform better than quantity</li>
              </ul>
            </div>
          </div>
        )}
        {activeInsight === 'active-applications' && (
          <div className="insight-content">
            <div className="insight-header">
              <h3>Active Applications Status</h3>
              <span className="insight-desc">Applications currently in progress</span>
            </div>
            <div className="insight-data">
              <div className="insight-chart">
                {activeApplications > 0 ? (
                  <div className="active-breakdown">
                    <div className="active-item">
                      <span className="active-label">Awaiting Response</span>
                      <span className="active-value">{stageCounts.applied}</span>
                      <span className="active-desc">Applications submitted, waiting for initial response</span>
                    </div>
                    <div className="active-item">
                      <span className="active-label">In Screening</span>
                      <span className="active-value">{stageCounts.screening}</span>
                      <span className="active-desc">Under review by HR or recruiters</span>
                    </div>
                    <div className="active-item">
                      <span className="active-label">Interview Stage</span>
                      <span className="active-value">{stageCounts.interview}</span>
                      <span className="active-desc">Actively interviewing</span>
                    </div>
                  </div>
                ) : (
                  <div className="empty-state">
                    <p>No active applications.</p>
                    <p>Submit applications to companies you're interested in.</p>
                  </div>
                )}
              </div>
            </div>
            <div className="insight-recommendations">
              <h4>Next Steps</h4>
              <ul>
                <li>Follow up on applications older than 2 weeks</li>
                <li>Prepare for upcoming interviews</li>
                <li>Continue applying to maintain momentum</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="dashboard-tabs">
        <TabGroup
          activeTab={activeTab}
          onTabChange={setActiveTab}
          className="dashboard-tab-group"
        >
          <TabButton
            data-id="overview"
            label="Overview"
            icon={BarChart2}
            size="medium"
            accentColor="var(--accent-blue)"
          />
          {/* Temporarily disabled tabs */}
          {/*
          <TabButton
            data-id="actions"
            label="Action Items"
            icon={Zap}
            size="medium"
            accentColor="var(--accent-blue)"
          />
          <TabButton
            data-id="skills"
            label="Skills Analysis"
            icon={Award}
            size="medium"
            accentColor="var(--accent-blue)"
          />
          */}
          <TabButton
            data-id="activity"
            label="Activity"
            icon={Activity}
            size="medium"
            accentColor="var(--accent-blue)"
          />
        </TabGroup>
      </div>

      {activeTab === 'overview' && (
        <div className="dashboard-grid overview-grid">
          <ApplicationFunnel stageCounts={stageCounts} onViewAll={() => ENABLE_DEVELOPMENT_FEATURES ? console.log('View all applications') : alert('This feature is not available in the current version')} />
          <WeeklyActivity weeklyActivity={weeklyActivity} onViewDetails={() => ENABLE_DEVELOPMENT_FEATURES ? console.log('View activity details') : alert('This feature is not available in the current version')} />
          <div className="dashboard-card upcoming-card">
            <div className="card-header">
              <h3 className="card-title">Upcoming</h3>
              <ActionButton label="Calendar" icon={Calendar} variant="ghost" size="small" onClick={() => ENABLE_DEVELOPMENT_FEATURES ? console.log('View calendar') : alert('This feature is not available in the current version')} />
            </div>
            <div className="upcoming-events">
              {upcomingEventsToShow.map(event => (
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
                />
              ))}
              {upcomingReminders.map(reminder => (
                <div key={reminder.id} className="upcoming-reminder">
                  <div className="reminder-icon">
                    <Bell size={16} />
                  </div>
                  <div className="reminder-content">
                    <div className="reminder-title">{reminder.title}</div>
                    <div className="reminder-meta">
                      <span className="reminder-time">
                        {new Intl.DateTimeFormat('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        }).format(reminder.dueDate)}
                      </span>
                      {reminder.relatedApplication && (
                        <span className="reminder-company">
                          {reminder.relatedApplication.company.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={`priority-indicator priority-${reminder.priority}`}></div>
                </div>
              ))}
            </div>
            <div className="card-actions">
              <ActionButton
                label="Add Event"
                icon={Plus}
                variant="secondary"
                size="small"
                onClick={() => console.log('Add event')}
              />
              <ActionButton
                label="View All"
                icon={ChevronRight}
                variant="ghost"
                size="small"
                onClick={() => console.log('View all events')}
                className="view-all"
              />
            </div>
          </div>
        </div>
      )}

      {/* Temporarily disabled tab content */}
      {/*
      {activeTab === 'actions' && (
        <ActionsTab recommendedActions={recommendedActions} />
      )}

      {activeTab === 'skills' && (
        <SkillsTab skillGaps={skillGaps} goals={monthlyGoals} />
      )}
      */}

      {activeTab === 'activity' && (
        <div className="dashboard-grid activity-grid">
          <div className="dashboard-card activity-feed-card">
            <div className="card-header">
              <h3 className="card-title">Activity Feed</h3>
              <div className="filters">
                <EnhancedDropdown
                  options={[
                    { value: 'all', label: 'All Activities' },
                    { value: 'applications', label: 'Applications' },
                    { value: 'interviews', label: 'Interviews' }
                  ]}
                  value={activityFilter}
                  onChange={(value) => setActivityFilter(Array.isArray(value) ? value[0] : value)}
                  size="small"
                  width={150}
                />
              </div>
            </div>
            <div className="activity-timeline">
              {recentActivities.map((activity, index) => (
                <ActivityItem
                  key={activity.id}
                  id={activity.id}
                  type={activity.type}
                  title={activity.title}
                  companyName={activity.company.name}
                  companyLogo={activity.company.logo}
                  timestamp={activity.timestamp}
                  details={activity.details}
                  isLast={index === recentActivities.length - 1}
                  onClick={() => console.log(`Activity ${activity.id} clicked`)}
                />
              ))}
              <div className="timeline-end">
                <div className="timeline-end-icon"><MoreHorizontal size={16} /></div>
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
          </div>
        </div>
      )}

      <ActionButton
        label=""
        icon={Zap}
        variant="primary"
        size="large"
        onClick={() => console.log('Quick actions')}
        className="quick-actions-button"
      />

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
          background: var(--glass-input-bg, var(--card));
          color: var(--text-primary);
          font-size: 14px;
          transition: all 0.3s var(--easing-standard);
        }

        .search-input:focus {
          border-color: var(--accent-blue);
          box-shadow: 0 0 0 3px rgba(var(--accent-blue-rgb), 0.1);
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

        .time-range-selector {
          display: flex;
          align-items: center;
          background: var(--glass-period-selector-bg, var(--surface));
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

        .stats-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
        }

        .insight-panel {
          border-radius: var(--border-radius);
          padding: 20px;
          transition: all 0.3s var(--easing-standard);
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

        .dashboard-tabs {
          margin-bottom: 20px;
          border-bottom: 1px solid var(--border-divider);
          padding-bottom: 10px;
        }

        .dashboard-tab-group {
          border: none;
          box-shadow: none;
          background: transparent;
          margin-bottom: 8px;
        }

        .dashboard-grid {
          display: grid;
          gap: 24px;
        }

        .overview-grid {
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        }

        .activity-grid {
          grid-template-columns: 1fr 1fr;
        }

        .dashboard-card {
          display: flex;
          flex-direction: column;
          gap: 20px;
          height: 100%;
          padding: 20px;
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
        }

        .upcoming-events {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .upcoming-reminder {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: var(--glass-bg);
          border-radius: var(--border-radius);
          border: 1px solid var(--border-thin);
          transition: all 0.2s ease;
        }

        .upcoming-reminder:hover {
          background: var(--hover-bg);
          border-color: var(--border-hover);
        }

        .reminder-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--accent-orange);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }

        .reminder-content {
          flex: 1;
          min-width: 0;
        }

        .reminder-title {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .reminder-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: var(--text-tertiary);
        }

        .reminder-time {
          font-weight: 500;
        }

        .reminder-company {
          color: var(--text-secondary);
        }

        .priority-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .priority-high {
          background: var(--accent-red);
        }

        .priority-medium {
          background: var(--accent-orange);
        }

        .priority-low {
          background: var(--accent-blue);
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
        }

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
          pointer-events: none;
        }

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

        @keyframes growWidth {
          from {
            width: 0;
          }
        }

        @media (max-width: 1200px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }

          .activity-grid {
            grid-template-columns: 1fr;
          }

          .insight-data {
            flex-direction: column;
          }
        }

        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: var(--text-tertiary);
        }

        .empty-state p {
          margin: 8px 0;
          font-size: 14px;
        }

        .empty-state p:first-child {
          font-weight: 500;
          color: var(--text-secondary);
        }
        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: var(--text-tertiary);
        }

        .empty-state p:first-child {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: 8px;
        }

        .empty-state p:last-child {
          font-size: 14px;
          margin: 0;
        }

        .applications-breakdown {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 16px;
          padding: 20px 0;
        }

        .breakdown-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 16px;
          background: var(--hover-bg);
          border-radius: var(--border-radius);
          border: 1px solid var(--border-thin);
        }

        .breakdown-label {
          font-size: 12px;
          color: var(--text-tertiary);
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }

        .breakdown-value {
          font-size: 24px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .active-breakdown {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 20px 0;
        }

        .active-item {
          display: flex;
          flex-direction: column;
          padding: 20px;
          background: var(--hover-bg);
          border-radius: var(--border-radius);
          border: 1px solid var(--border-thin);
        }

        .active-label {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .active-value {
          font-size: 20px;
          font-weight: 700;
          color: var(--accent-blue);
          margin-bottom: 8px;
        }

        .active-desc {
          font-size: 13px;
          color: var(--text-tertiary);
          line-height: 1.4;
        }

        .insight-recommendations h4 {
          margin: 0 0 12px 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .insight-recommendations ul {
          margin: 0;
          padding-left: 20px;
          list-style-type: disc;
        }

        .insight-recommendations li {
          margin-bottom: 8px;
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .stat-card {
          cursor: pointer;
          transition: all 0.2s var(--easing-standard);
        }

        .stat-card:hover {
          transform: translateY(-2px);
        }
      `}</style>
    </section>
  );
}
