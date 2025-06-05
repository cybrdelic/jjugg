'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText, Bell, Calendar, Search, CheckCircle, Activity,
  BarChart2, MoreHorizontal, ChevronRight, ChevronDown, Clock, Target, Users, Plus,
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
import SkillsTab from '../SkillsTab'; // Import the new SkillsTab component
import EnhancedDropdown from '../EnhancedDropdown';

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
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [activeInsight, setActiveInsight] = useState('response-rate');
  const [timeRange, setTimeRange] = useState('30d');
  const [activityFilter, setActivityFilter] = useState('all');

  useEffect(() => {
    setMounted(true);
  }, []);

  // MOCK DATA
  const stageCounts = {
    applied: 5,
    screening: 3,
    interview: 3,
    offer: 1,
    rejected: 1
  };

  const totalApplications = Object.values(stageCounts).reduce((sum, count) => sum + count, 0);
  const activeApplications = stageCounts.applied + stageCounts.screening + stageCounts.interview;
  const responseRate = ((totalApplications - stageCounts.applied) / totalApplications) * 100;
  const successRate = (stageCounts.offer / (stageCounts.offer + stageCounts.rejected)) * 100;

  const skillGaps: SkillGap[] = [
    { skill: 'React', demand: 85, proficiency: 75, gap: 10, jobsRequiring: 15 },
    { skill: 'TypeScript', demand: 80, proficiency: 65, gap: 15, jobsRequiring: 12 },
    { skill: 'GraphQL', demand: 60, proficiency: 30, gap: 30, jobsRequiring: 8 },
    { skill: 'AWS', demand: 70, proficiency: 35, gap: 35, jobsRequiring: 10 },
    { skill: 'Docker', demand: 65, proficiency: 40, gap: 25, jobsRequiring: 7 }
  ].sort((a, b) => b.gap - a.gap);

  const weeklyActivity = [3, 5, 2, 4, 7, 6, 4];
  const responseTimesByTier = [
    { tier: 'Enterprise', days: 12 },
    { tier: 'Mid-size', days: 7 },
    { tier: 'Startup', days: 3 }
  ];
  const networkingStats = { connections: 45, messages: 22, meetings: 5, referrals: 3 };
  const topIndustries = [
    { name: 'Technology', count: 6, success: 25 },
    { name: 'Finance', count: 3, success: 33 },
    { name: 'Healthcare', count: 2, success: 50 },
    { name: 'E-commerce', count: 2, success: 0 }
  ];

  const upcomingEvents: UpcomingEvent[] = [
    {
      id: 'evt1', title: 'Technical Interview', company: { id: 'c1', name: 'Google', logo: '/companies/google.svg', industry: 'Technology' },
      date: new Date(new Date().getTime() + 86400000), time: '10:00 AM', type: 'Interview', application: {} as Application,
      details: 'System design and coding interview', duration: 60, priority: 'high'
    },
    {
      id: 'evt2', title: 'Follow up on application', company: { id: 'c2', name: 'Microsoft', logo: '/companies/microsoft.svg', industry: 'Technology' },
      date: new Date(new Date().getTime() + 172800000), time: '12:00 PM', type: 'Follow-up', application: {} as Application,
      details: 'Send follow-up email about application status', priority: 'medium'
    },
    {
      id: 'evt3', title: 'Virtual Networking Event', company: { id: 'c3', name: 'Tech Meetup', logo: '/companies/meetup.svg', industry: 'Technology' },
      date: new Date(new Date().getTime() + 259200000), time: '5:30 PM', type: 'Networking', application: {} as Application,
      details: 'Online networking event for frontend developers', duration: 120
    },
    {
      id: 'evt4', title: 'Complete Assessment', company: { id: 'c4', name: 'Amazon', logo: '/companies/amazon.svg', industry: 'E-commerce' },
      date: new Date(new Date().getTime() + 345600000), time: '11:59 PM', type: 'Deadline', application: {} as Application,
      details: 'Finish coding assessment for Software Engineer position', priority: 'high'
    }
  ];

  const goals: MonthlyGoal[] = [
    { id: 'goal1', goal: 'Submit 20 Applications', current: 13, target: 20, progress: Math.round((13 / 20) * 100), category: 'applications' },
    { id: 'goal2', goal: 'Connect with 15 Professionals', current: 8, target: 15, progress: Math.round((8 / 15) * 100), category: 'networking' },
    { id: 'goal3', goal: 'Complete 5 Skill Assessments', current: 2, target: 5, progress: Math.round((2 / 5) * 100), category: 'skills' },
    { id: 'goal4', goal: 'Attend 3 Mock Interviews', current: 1, target: 3, progress: Math.round((1 / 3) * 100), category: 'interviews' }
  ];

  const recommendedActions: RecommendedAction[] = [
    { id: 'action1', title: 'Follow up on Google application', description: 'It\'s been 7 days since your application with no response.', priority: 'high', type: 'follow-up', dueDate: new Date(new Date().getTime() + 86400000) },
    { id: 'action2', title: 'Complete AWS certification', description: 'This skill appears in 65% of your target job listings.', priority: 'medium', type: 'skill' },
    { id: 'action3', title: 'Connect with Microsoft recruiter', description: 'Your network has 2 connections that could introduce you.', priority: 'medium', type: 'networking' },
    { id: 'action4', title: 'Prepare for technical interview', description: 'Your interview with Google is in 1 day.', priority: 'high', type: 'preparation', dueDate: new Date(new Date().getTime()) },
    { id: 'action5', title: 'Apply to recommended jobs', description: '5 new jobs match your profile with 85%+ compatibility.', priority: 'medium', type: 'application' }
  ];

  const activities = [
    { id: 'act1', type: 'application' as const, title: 'Applied to Software Engineer position', company: { id: 'c5', name: 'Facebook', logo: '/companies/facebook.svg', industry: 'Technology' }, timestamp: new Date(new Date().getTime() - 86400000), details: 'Applied through company website with referral', application: {} as Application },
    { id: 'act2', type: 'interview' as const, title: 'Completed technical interview', company: { id: 'c2', name: 'Microsoft', logo: '/companies/microsoft.svg', industry: 'Technology' }, timestamp: new Date(new Date().getTime() - 172800000), details: 'Interview feedback was positive, waiting for next steps', application: {} as Application },
    { id: 'act3', type: 'network' as const, title: 'Connected with Senior Engineer', company: { id: 'c1', name: 'Google', logo: '/companies/google.svg', industry: 'Technology' }, timestamp: new Date(new Date().getTime() - 259200000), details: 'Made connection through LinkedIn after attending tech meetup', application: {} as Application }
  ];

  const jobMatchScores = [65, 72, 78];

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
        <StatCard value={totalApplications} label="Total Applications" icon={FileText} color="var(--accent-blue)" trend={{ value: 15, isPositive: true }} />
        <StatCard value={`${responseRate.toFixed(0)}%`} label="Response Rate" icon={Activity} color="var(--accent-purple)" trend={{ value: 5, isPositive: true }} onClick={() => setActiveInsight('response-rate')} />
        <StatCard value={`${successRate.toFixed(0)}%`} label="Success Rate" icon={Award} color="var(--accent-green)" trend={{ value: 10, isPositive: true }} onClick={() => setActiveInsight('success-rate')} />
        <StatCard value={networkingStats.connections} label="Network Connections" icon={Users} color="var(--accent-orange)" trend={{ value: 8, isPositive: true }} onClick={() => setActiveInsight('networking')} />
        <StatCard value={7.3} label="Avg. Response Time (Days)" icon={Timer} color="var(--accent-orange)" trend={{ value: 5, isPositive: true }} />
        <StatCard value={'38%'} label="No Response Rate" icon={XIcon} color="var(--accent-orange)" trend={{ value: 5, isPositive: true }} />
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
                    {responseTimesByTier.map((tier, index) => (
                      <div className="response-tier" key={tier.tier}>
                        <div className="tier-name">{tier.tier}</div>
                        <div className="tier-bar-container">
                          <div className="tier-bar" style={{ width: `${Math.min(100, tier.days * 5)}%`, backgroundColor: index === 0 ? 'var(--accent-green)' : index === 1 ? 'var(--accent-blue)' : 'var(--accent-purple)' }}>
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
              <div className="dashboard-card match-score-card">
                <div className="card-header">
                  <h3 className="card-title">Job Match Quality</h3>
                  <ActionButton label="Improve Matches" icon={Award} variant="ghost" size="small" />
                </div>
                <div className="match-score-distribution">
                  {jobMatchScores.map((score, index) => (
                    <div className="match-score-bar" key={index}>
                      <div className="score-bar-container">
                        <div className="score-bar" style={{ width: `${score}%`, backgroundColor: score >= 90 ? 'var(--accent-green)' : score >= 80 ? 'var(--accent-blue)' : score >= 70 ? 'var(--accent-purple)' : 'var(--accent-orange)' }}></div>
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
                          <div className="industry-bar" style={{ width: `${industry.success}%`, backgroundColor: industry.success > 40 ? 'var(--accent-green)' : industry.success > 20 ? 'var(--accent-blue)' : 'var(--accent-red)' }}></div>
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
                        <div className="bar-bg"><div className="bar-value" style={{ width: '85%' }}></div></div>
                        <div className="bar-percent">85%</div>
                      </div>
                      <div className="bar-container">
                        <div className="bar-label">Without Referral</div>
                        <div className="bar-bg"><div className="bar-value" style={{ width: '42%' }}></div></div>
                        <div className="bar-percent">42%</div>
                      </div>
                    </div>
                  </div>
                  <div className="network-metric">
                    <div className="network-label">Interview Rate</div>
                    <div className="comparison-bars">
                      <div className="bar-container">
                        <div className="bar-label">With Referral</div>
                        <div className="bar-bg"><div className="bar-value" style={{ width: '65%' }}></div></div>
                        <div className="bar-percent">65%</div>
                      </div>
                      <div className="bar-container">
                        <div className="bar-label">Without Referral</div>
                        <div className="bar-bg"><div className="bar-value" style={{ width: '28%' }}></div></div>
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
          <ApplicationFunnel stageCounts={stageCounts} onViewAll={() => console.log('View all applications')} />
          <WeeklyActivity weeklyActivity={weeklyActivity} onViewDetails={() => console.log('View activity details')} />
          <div className="dashboard-card upcoming-card">
            <div className="card-header">
              <h3 className="card-title">Upcoming</h3>
              <ActionButton label="Calendar" icon={Calendar} variant="ghost" size="small" onClick={() => console.log('View calendar')} />
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
                />
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

      {activeTab === 'actions' && (
        <ActionsTab recommendedActions={recommendedActions} />
      )}

      {activeTab === 'skills' && (
        <SkillsTab skillGaps={skillGaps} goals={goals} />
      )}

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
                    { value: 'interviews', label: 'Interviews' },
                    { value: 'networking', label: 'Networking' }
                  ]}
                  value={activityFilter}
                  onChange={(value) => setActivityFilter(value)}
                  size="small"
                  width={150}
                />
              </div>
            </div>
            <div className="activity-timeline">
              {activities.map((activity, index) => (
                <ActivityItem
                  key={activity.id}
                  id={activity.id}
                  type={activity.type}
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
          background: var(--glass-bg);
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
      `}</style>
    </section>
  );
}
