'use client';

import React from 'react';

interface WeeklyActivityProps {
    weeklyActivity: number[];
    onViewDetails?: () => void;
}

export default function WeeklyActivity({ weeklyActivity, onViewDetails }: WeeklyActivityProps) {
    const totalApplications = weeklyActivity.reduce((sum, count) => sum + count, 0);
    const totalInterviews = weeklyActivity.reduce((sum, count) => sum + Math.floor(count * 0.4), 0);

    return (
        <div className="dashboard-card activity-chart-card">
            <div className="card-header">
                <h3 className="card-title">Weekly Activity</h3>
                <div className="chart-legend">
                    <div className="legend-item">
                        <span className="legend-color applications"></span>
                        <span>Applications</span>
                    </div>
                    <div className="legend-item">
                        <span className="legend-color interviews"></span>
                        <span>Interviews</span>
                    </div>
                </div>
            </div>

            <div className="activity-chart">
                <div className="chart-bars">
                    {weeklyActivity.map((count, index) => (
                        <div className="chart-bar-group" key={index}>
                            <div className="chart-bar applications" style={{ height: `${count * 10}%` }}>
                                <span className="bar-value">{count}</span>
                            </div>
                            <div className="chart-bar interviews" style={{ height: `${Math.floor(count * 0.4) * 10}%` }}>
                                <span className="bar-value">{Math.floor(count * 0.4)}</span>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="chart-labels">
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                    <span>Sun</span>
                </div>
            </div>

            <div className="activity-summary">
                <div className="summary-item">
                    <span className="summary-value">{totalApplications}</span>
                    <span className="summary-label">Applications</span>
                </div>
                <div className="summary-item">
                    <span className="summary-value">{totalInterviews}</span>
                    <span className="summary-label">Interviews</span>
                </div>
                <div className="summary-item">
                    <span className="summary-value">15%</span>
                    <span className="summary-label">Week-over-Week</span>
                </div>
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

        .chart-legend {
          display: flex;
          gap: 16px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: var(--text-secondary);
        }

        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: 2px;
        }

        .legend-color.applications {
          background: var(--accent-blue);
        }

        .legend-color.interviews {
          background: var(--accent-purple);
        }

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
      `}</style>
        </div>
    );
}
