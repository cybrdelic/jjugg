import React, { useState } from 'react';
import {
    FileText,
    Activity,
    Award,
    Users,
    Timer,
    X,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { useThemeColors } from '../hooks/useThemeColors';

interface NetworkingStats {
    connections: number;
    referrals: number;
    meetings: number;
}

interface ResponseTime {
    tier: string;
    days: number;
}

interface Industry {
    name: string;
    count: number;
    success: number;
}

interface JobSearchData {
    totalApplications?: number;
    responseRate?: number;
    successRate?: number;
    networkingStats?: NetworkingStats;
    responseTimesByTier?: ResponseTime[];
    jobMatchScores?: number[];
    topIndustries?: Industry[];
}

interface JobSearchKPIDashboardProps {
    initialData?: JobSearchData;
}

const JobSearchKPIDashboard: React.FC<JobSearchKPIDashboardProps> = ({ initialData }) => {
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
    const [activeInsight, setActiveInsight] = useState<'response-rate' | 'success-rate' | 'networking' | null>(null);

    const { analytics } = useThemeColors();

    const {
        totalApplications = 42,
        responseRate = 62,
        successRate = 28,
        networkingStats = {
            connections: 152,
            referrals: 12,
            meetings: 8
        },
        responseTimesByTier = [
            { tier: 'Enterprise', days: 9 },
            { tier: 'Mid-size', days: 5 },
            { tier: 'Startup', days: 3 }
        ],
        jobMatchScores = [95, 88, 82, 76, 70],
        topIndustries = [
            { name: 'Technology', count: 18, success: 35 },
            { name: 'Healthcare', count: 8, success: 50 },
            { name: 'Finance', count: 12, success: 25 },
            { name: 'Retail', count: 4, success: 20 }
        ]
    } = initialData || {};

    return (
        <div className="job-search-kpi-dashboard reveal-element">
            {/* Header */}
            <div className="card-header">
                <div className="header-content">
                    <h2 className="dashboard-title">Key Performance Indicators</h2>
                    <p className="dashboard-subtitle">Analytics, insights and action items to optimize your job hunt</p>
                </div>

                <div className="time-range-selector">
                    <button
                        className={timeRange === '7d' ? 'active' : ''}
                        onClick={() => setTimeRange('7d')}
                    >
                        7d
                    </button>
                    <button
                        className={timeRange === '30d' ? 'active' : ''}
                        onClick={() => setTimeRange('30d')}
                    >
                        30d
                    </button>
                    <button
                        className={timeRange === '90d' ? 'active' : ''}
                        onClick={() => setTimeRange('90d')}
                    >
                        90d
                    </button>
                    <button
                        className={timeRange === 'all' ? 'active' : ''}
                        onClick={() => setTimeRange('all')}
                    >
                        All
                    </button>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="stats-summary">
                <div className="stat-card" onClick={() => console.log('Applications stat clicked')}>
                    <div className="stat-icon" style={{ background: analytics.primary[0] }}>
                        <FileText size={18} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{totalApplications}</div>
                        <div className="stat-label">Total Applications</div>
                        <div className="stat-trend positive">
                            <span className="trend-arrow">↑</span>
                            <span className="trend-value">15%</span>
                        </div>
                    </div>
                </div>

                <div className="stat-card" onClick={() => setActiveInsight('response-rate')}>
                    <div className="stat-icon" style={{ background: analytics.primary[1] }}>
                        <Activity size={18} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{responseRate.toFixed(0)}%</div>
                        <div className="stat-label">Response Rate</div>
                        <div className="stat-trend positive">
                            <span className="trend-arrow">↑</span>
                            <span className="trend-value">5%</span>
                        </div>
                    </div>
                </div>

                <div className="stat-card" onClick={() => setActiveInsight('success-rate')}>
                    <div className="stat-icon" style={{ background: analytics.primary[2] }}>
                        <Award size={18} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{successRate.toFixed(0)}%</div>
                        <div className="stat-label">Success Rate</div>
                        <div className="stat-trend positive">
                            <span className="trend-arrow">↑</span>
                            <span className="trend-value">10%</span>
                        </div>
                    </div>
                </div>

                <div className="stat-card" onClick={() => console.log("clicked")}>
                    <div className="stat-icon" style={{ background: analytics.primary[3] }}>
                        <Timer size={18} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">7.3</div>
                        <div className="stat-label">Avg. Response Time (Days)</div>
                        <div className="stat-trend positive">
                            <span className="trend-arrow">↑</span>
                            <span className="trend-value">5%</span>
                        </div>
                    </div>
                </div>

                <div className="stat-card" onClick={() => console.log("clicked")}>
                    <div className="stat-icon" style={{ background: analytics.primary[4] }}>
                        <X size={18} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">38%</div>
                        <div className="stat-label">No Response Rate</div>
                        <div className="stat-trend negative">
                            <span className="trend-arrow">↓</span>
                            <span className="trend-value">5%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Insight Panels */}
            {activeInsight && (
                <div className="insight-panel">
                    {activeInsight === 'response-rate' && (
                        <div className="insight-content">
                            <div className="insight-header">
                                <h3>Application Response Rate Analysis</h3>
                                <span className="insight-desc">How quickly companies are responding to your applications</span>
                            </div>

                            <div className="insight-data-container">
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
                                                                backgroundColor: analytics.primary[index % analytics.primary.length]
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

                                <div className="match-score-card">
                                    <div className="card-header">
                                        <h3 className="card-title">Job Match Quality</h3>
                                        <button className="action-button">
                                            Improve Matches
                                        </button>
                                    </div>

                                    <div className="match-score-distribution">
                                        {jobMatchScores.map((score, index) => (
                                            <div className="match-score-bar" key={index}>
                                                <div className="score-bar-container">
                                                    <div
                                                        className="score-bar"
                                                        style={{
                                                            width: `${score}%`,
                                                            backgroundColor: score >= 90 ? analytics.positive :
                                                                score >= 80 ? analytics.primary[0] :
                                                                    score >= 70 ? analytics.primary[1] :
                                                                        analytics.negative
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
                                        {topIndustries.map((industry) => (
                                            <div className="industry-row" key={industry.name}>
                                                <div className="industry-name">{industry.name}</div>
                                                <div className="industry-stats">
                                                    <div className="industry-bar-container">
                                                        <div
                                                            className="industry-bar"
                                                            style={{
                                                                width: `${industry.success}%`,
                                                                backgroundColor: industry.success > 40 ? analytics.positive :
                                                                    industry.success > 20 ? analytics.primary[0] :
                                                                        analytics.negative
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
                                                        <div className="bar-value" style={{ width: '85%', backgroundColor: analytics.primary[0] }}></div>
                                                    </div>
                                                    <div className="bar-percent">85%</div>
                                                </div>
                                                <div className="bar-container">
                                                    <div className="bar-label">Without Referral</div>
                                                    <div className="bar-bg">
                                                        <div className="bar-value" style={{ width: '42%', backgroundColor: analytics.primary[1] }}></div>
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
                                                        <div className="bar-value" style={{ width: '65%', backgroundColor: analytics.positive }}></div>
                                                    </div>
                                                    <div className="bar-percent">65%</div>
                                                </div>
                                                <div className="bar-container">
                                                    <div className="bar-label">Without Referral</div>
                                                    <div className="bar-bg">
                                                        <div className="bar-value" style={{ width: '28%', backgroundColor: analytics.positive }}></div>
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
            )}

            <style jsx>{`
                .job-search-kpi-dashboard {
                    display: flex;
                    flex-direction: column;
                    gap: 28px;
                    padding: 24px;
                    border-radius: var(--border-radius);
                    background: var(--glass-card-bg);
                    border: 1px solid var(--border-thin);
                    box-shadow: var(--shadow);
                    transition: all 0.3s ease;
                }

                .card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-bottom: 16px;
                    border-bottom: 1px solid var(--border-divider);
                }

                .dashboard-title {
                    font-size: 1.5rem;
                    font-weight: 600;
                    margin: 0;
                    color: var(--text-primary);
                }

                .dashboard-subtitle {
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                    margin: 4px 0 0 0;
                }

                .time-range-selector {
                    display: flex;
                    align-items: center;
                    background: var(--glass-bg);
                    border: 1px solid var(--border-thin);
                    border-radius: var(--border-radius-sm);
                    padding: 4px;
                }

                .time-range-selector button {
                    background: transparent;
                    border: none;
                    padding: 6px 12px;
                    border-radius: var(--border-radius-sm);
                    color: var(--text-secondary);
                    font-size: 0.813rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .time-range-selector button.active {
                    background: var(--active-bg);
                    color: var(--accent-blue);
                }

                .time-range-selector button:hover:not(.active) {
                    background: var(--hover-bg);
                    color: var(--text-primary);
                }

                .stats-summary {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                    gap: 20px;
                }

                .stat-card {
                    display: flex;
                    gap: 16px;
                    padding: 20px;
                    border-radius: var(--border-radius);
                    background: var(--glass-bg);
                    border: 1px solid var(--border-thin);
                    box-shadow: var(--shadow-sharp);
                    transition: all 0.2s ease;
                    cursor: pointer;
                }

                .stat-card:hover {
                    background: var(--hover-bg);
                    transform: translateY(-3px);
                    box-shadow: var(--shadow-lg);
                    border-color: var(--border-hover);
                }

                .stat-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 42px;
                    height: 42px;
                    border-radius: 50%;
                    color: white;
                }

                .stat-content {
                    display: flex;
                    flex-direction: column;
                }

                .stat-value {
                    font-size: 1.5rem;
                    font-weight: 600;
                    color: var(--text-primary);
                }

                .stat-label {
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                    margin-bottom: 4px;
                }

                .stat-trend {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 0.75rem;
                    font-weight: 500;
                }

                .stat-trend.positive {
                    color: var(--accent-green);
                }

                .stat-trend.negative {
                    color: var(--accent-red);
                }

                .insight-panel {
                    border-radius: var(--border-radius);
                    padding: 24px;
                    background: var(--glass-bg);
                    border: 1px solid var(--border-thin);
                    box-shadow: var(--shadow);
                    transition: all 0.3s ease;
                }

                .insight-header {
                    margin-bottom: 20px;
                }

                .insight-header h3 {
                    font-size: 1.125rem;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin: 0 0 4px 0;
                }

                .insight-desc {
                    color: var(--text-tertiary);
                    font-size: 0.875rem;
                }

                .insight-data-container {
                    display: flex;
                    flex-direction: row;
                    width: 100%;
                    gap: 24px;
                    flex-wrap: wrap;
                }

                .insight-data {
                    display: flex;
                    gap: 30px;
                    margin-bottom: 20px;
                    min-width: 45%;
                    flex-wrap: wrap;
                }

                .insight-chart {
                    flex: 1.5;
                    padding: 1rem;
                    border-right: solid 0.05rem var(--border-divider);
                    border-bottom: solid 0.05rem var(--border-divider);
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
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: var(--text-primary);
                }

                .metric-label {
                    font-size: 0.813rem;
                    color: var(--text-tertiary);
                    margin-top: 4px;
                }

                .insight-recommendations {
                    background: var(--hover-bg);
                    border-radius: var(--border-radius);
                    padding: 16px;
                    margin-top: 16px;
                    border: 1px solid var(--border-thin);
                }

                .insight-recommendations h4 {
                    font-size: 0.938rem;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin: 0 0 12px 0;
                }

                .insight-recommendations ul {
                    margin: 0;
                    padding: 0 0 0 20px;
                    color: var(--text-secondary);
                    font-size: 0.875rem;
                }

                .insight-recommendations li {
                    margin-bottom: 8px;
                }

                .insight-recommendations li:last-child {
                    margin-bottom: 0;
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
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: var(--text-secondary);
                }

                .tier-bar-container {
                    flex: 1;
                    height: 24px;
                    border-radius: var(--border-radius-sm);
                    background: var(--hover-bg);
                    position: relative;
                }

                .tier-bar {
                    height: 100%;
                    border-radius: var(--border-radius-sm);
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    padding-right: 10px;
                    position: relative;
                    animation: growWidth 1s ease forwards;
                }

                .tier-value {
                    color: white;
                    font-size: 0.813rem;
                    font-weight: 500;
                }

                .chart-legend {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.75rem;
                    color: var(--text-tertiary);
                    margin-top: 5px;
                }

                .match-score-card {
                    flex: 1;
                    padding: 16px;
                    border-radius: var(--border-radius);
                    background: var(--glass-bg);
                    border: 1px solid var(--border-thin);
                }

                .match-score-card .card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                    border-bottom: none;
                    padding-bottom: 0;
                }

                .card-title {
                    font-size: 1rem;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin: 0;
                }

                .action-button {
                    padding: 6px 12px;
                    border-radius: var(--border-radius-sm);
                    background: transparent;
                    color: var(--accent-blue);
                    font-size: 0.813rem;
                    font-weight: 500;
                    border: 1px solid var(--border-thin);
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .action-button:hover {
                    background: rgba(var(--accent-blue-rgb), 0.1);
                    border-color: var(--accent-blue);
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
                    border-radius: var(--border-radius-sm);
                    overflow: hidden;
                }

                .score-bar {
                    height: 100%;
                    border-radius: var(--border-radius-sm);
                    transition: width 1s ease;
                }

                .score-label {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.813rem;
                }

                .company-name {
                    color: var(--text-secondary);
                }

                .score-value {
                    font-weight: 500;
                    color: var(--text-primary);
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
                    font-size: 0.875rem;
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
                    border-radius: var(--border-radius-sm);
                    position: relative;
                }

                .industry-bar {
                    height: 100%;
                    border-radius: var(--border-radius-sm);
                    position: relative;
                    animation: growWidth 1s ease forwards;
                }

                .industry-values {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.813rem;
                    color: var(--text-secondary);
                }

                .networking-impact-chart {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .network-metric {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .network-label {
                    font-size: 0.938rem;
                    font-weight: 500;
                    color: var(--text-primary);
                }

                .comparison-bars {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .bar-container {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .bar-label {
                    width: 100px;
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                }

                .bar-bg {
                    flex: 1;
                    height: 20px;
                    background: var(--hover-bg);
                    border-radius: var(--border-radius-sm);
                    position: relative;
                }

                .bar-value {
                    height: 100%;
                    border-radius: var(--border-radius-sm);
                    animation: growWidth 1s ease forwards;
                }

                .bar-percent {
                    width: 50px;
                    text-align: right;
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: var(--text-primary);
                }

                @keyframes growWidth {
                    from { width: 0; }
                    to { width: inherit; }
                }

                /* Responsive styles */
                @media (max-width: 768px) {
                    .card-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 16px;
                    }

                    .time-range-selector {
                        width: 100%;
                        justify-content: space-between;
                    }

                    .stats-summary {
                        grid-template-columns: repeat(auto-fit, minmax(100%, 1fr));
                    }

                    .insight-data-container {
                        flex-direction: column;
                    }

                    .insight-chart {
                        border-right: none;
                        padding-right: 0;
                    }

                    .insight-metrics {
                        flex-direction: row;
                        flex-wrap: wrap;
                        justify-content: space-around;
                        padding-top: 20px;
                    }

                    .tier-name,
                    .industry-name,
                    .bar-label {
                        width: 80px;
                    }

                    .match-score-card {
                        padding: 12px;
                    }
                }

                @media (max-width: 480px) {
                    .job-search-kpi-dashboard {
                        padding: 16px;
                    }

                    .dashboard-title {
                        font-size: 1.25rem;
                    }

                    .stat-card {
                        padding: 16px;
                    }

                    .stat-value {
                        font-size: 1.25rem;
                    }

                    .insight-panel {
                        padding: 16px;
                    }
                }
            `}</style>
        </div>
    ); // Close the return statement
}; // Close the component function

export default JobSearchKPIDashboard; // Export the component
