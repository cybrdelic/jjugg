'use client';

import React from 'react';
import { TrendingUp, Briefcase, Award, Plus } from 'lucide-react';
import ActionButton from './dashboard/ActionButton';
import GoalCard from './dashboard/GoalCard';
import EnhancedDropdown from './EnhancedDropdown';

// Types
interface MonthlyGoal {
    id: string;
    goal: string;
    current: number;
    target: number;
    progress: number;
    category: 'applications' | 'networking' | 'skills' | 'interviews';
}

interface SkillGap {
    skill: string;
    demand: number;
    proficiency: number;
    gap: number;
    jobsRequiring: number;
}

interface SkillsTabProps {
    skillGaps: SkillGap[];
    goals: MonthlyGoal[];
}

export default function SkillsTab({ skillGaps, goals }: SkillsTabProps) {
    return (
        <div className="dashboard-grid skills-grid">
            <div className="dashboard-card skills-gap-card">
                <div className="card-header">
                    <h3 className="card-title">Skills Gap Analysis</h3>
                    <div className="filters">
                        <EnhancedDropdown
                            options={[
                                { value: 'gap', label: 'Biggest Gaps' },
                                { value: 'demand', label: 'Highest Demand' },
                                { value: 'proficiency', label: 'Highest Proficiency' }
                            ]}
                            value="gap"
                            onChange={(value) => console.log('Filter changed:', value)}
                            placeholder="Sort by"
                            width={180}
                        />
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
                                        <div className="bar-value demand" style={{ width: `${skill.demand}%` }}></div>
                                    </div>
                                    <div className="bar-value-label">{skill.demand}%</div>
                                </div>
                                <div className="skill-bar-container">
                                    <div className="bar-label">Your Proficiency</div>
                                    <div className="bar-bg">
                                        <div className="bar-value proficiency" style={{ width: `${skill.proficiency}%` }}></div>
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
                    </ul>
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
                    {goals.map(goal => (
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
            </div>

            <style jsx>{`
        .dashboard-grid {
          display: grid;
          gap: 24px;
        }

        .skills-grid {
          grid-template-columns: 1.5fr 1fr;
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
        }

        .skills-insights {
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
        }

        @media (max-width: 1200px) {
          .skills-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
        </div>
    );
}
