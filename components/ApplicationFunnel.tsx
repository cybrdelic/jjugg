'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';
import ActionButton from '../components/dashboard/ActionButton';


interface StageCounts {
    applied: number;
    screening: number;
    interview: number;
    offer: number;
    rejected: number;
}

interface ApplicationFunnelProps {
    stageCounts: StageCounts;
    onViewAll?: () => void;
}

export default function ApplicationFunnel({ stageCounts, onViewAll }: ApplicationFunnelProps) {
    const totalApplied = stageCounts.applied;
    const screeningRate = ((stageCounts.screening / totalApplied) * 100).toFixed(0);
    const interviewRate = ((stageCounts.interview / totalApplied) * 100).toFixed(0);
    const offerRate = ((stageCounts.offer / totalApplied) * 100).toFixed(0);
    const moveToScreening = ((stageCounts.screening / totalApplied) * 100).toFixed(0);

    return (
        <div className="dashboard-card funnel-card">
            <div className="card-header">
                <h3 className="card-title">Application Funnel</h3>
                <ActionButton
                    label="View All"
                    icon={ChevronRight}
                    variant="ghost"
                    size="small"
                    onClick={onViewAll}
                />
            </div>

            <div className="funnel-visualization">
                <div className="funnel-stage applied">
                    <div className="stage-label">
                        <span className="stage-name">Applied</span>
                        <span className="stage-count">{stageCounts.applied}</span>
                    </div>
                    <div className="funnel-bar">
                        <div className="stage-progress" style={{ width: `100%` }}></div>
                    </div>
                    <div className="stage-percent">100%</div>
                </div>

                <div className="funnel-stage screening">
                    <div className="stage-label">
                        <span className="stage-name">Screening</span>
                        <span className="stage-count">{stageCounts.screening}</span>
                    </div>
                    <div className="funnel-bar">
                        <div className="stage-progress" style={{ width: `${(stageCounts.screening / totalApplied) * 100}%` }}></div>
                    </div>
                    <div className="stage-percent">{screeningRate}%</div>
                </div>

                <div className="funnel-stage interview">
                    <div className="stage-label">
                        <span className="stage-name">Interview</span>
                        <span className="stage-count">{stageCounts.interview}</span>
                    </div>
                    <div className="funnel-bar">
                        <div className="stage-progress" style={{ width: `${(stageCounts.interview / totalApplied) * 100}%` }}></div>
                    </div>
                    <div className="stage-percent">{interviewRate}%</div>
                </div>

                <div className="funnel-stage offer">
                    <div className="stage-label">
                        <span className="stage-name">Offer</span>
                        <span className="stage-count">{stageCounts.offer}</span>
                    </div>
                    <div className="funnel-bar">
                        <div className="stage-progress" style={{ width: `${(stageCounts.offer / totalApplied) * 100}%` }}></div>
                    </div>
                    <div className="stage-percent">{offerRate}%</div>
                </div>
            </div>

            <div className="funnel-insights">
                <div className="funnel-insight">
                    <span className="insight-value">{moveToScreening}%</span>
                    <span className="insight-label">Move to Screening</span>
                </div>
                <div className="funnel-insight">
                    <span className="insight-value">{interviewRate}%</span>
                    <span className="insight-label">Interview Rate</span>
                </div>
                <div className="funnel-insight">
                    <span className="insight-value">{offerRate}%</span>
                    <span className="insight-label">Offer Rate</span>
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

        @keyframes growWidth {
          from {
            width: 0;
          }
          to {
            width: inherit;
          }
        }
      `}</style>
        </div>
    );
}
