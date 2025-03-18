'use client';

import React, { useState } from 'react';
import { 
  Target, PlusCircle, ChevronDown, Calendar, TrendingUp, 
  MoreHorizontal, CheckCircle, Edit2, Trash2, PieChart, Award
} from 'lucide-react';
import CardHeader from '../CardHeader';

interface MonthlyGoal {
  id: string;
  title: string;
  description?: string;
  category: 'applications' | 'interviews' | 'networking' | 'skills' | 'offers' | 'other';
  current: number;
  target: number;
  progress: number;
  deadline: Date;
  isCompleted: boolean;
}

// Helper function to calculate progress percentage
const calculateProgress = (current: number, target: number): number => {
  return Math.min(Math.round((current / target) * 100), 100);
};

// Helper function to get category color
const getCategoryColor = (category: string): string => {
  switch (category) {
    case 'applications':
      return 'var(--accent-blue)';
    case 'interviews':
      return 'var(--accent-green)';
    case 'networking':
      return 'var(--accent-purple)';
    case 'skills':
      return 'var(--accent-orange)';
    case 'offers':
      return 'var(--accent-success)';
    case 'other':
      return 'var(--accent-pink)';
    default:
      return 'var(--text-secondary)';
  }
};

// Format date helper
const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
};

// Mock data
const monthlyGoals: MonthlyGoal[] = [
  {
    id: 'goal1',
    title: 'Submit 20 Applications',
    description: 'Focus on quality applications to tech companies',
    category: 'applications',
    current: 13,
    target: 20,
    progress: calculateProgress(13, 20),
    deadline: new Date(2023, 11, 31),
    isCompleted: false
  },
  {
    id: 'goal2',
    title: 'Get 5 Interview Invitations',
    description: 'Aim for technical interviews at mid to senior level',
    category: 'interviews',
    current: 3,
    target: 5,
    progress: calculateProgress(3, 5),
    deadline: new Date(2023, 11, 31),
    isCompleted: false
  },
  {
    id: 'goal3',
    title: 'Connect with 15 Industry Professionals',
    description: 'Reach out on LinkedIn and attend 2 networking events',
    category: 'networking',
    current: 11,
    target: 15,
    progress: calculateProgress(11, 15),
    deadline: new Date(2023, 11, 31),
    isCompleted: false
  },
  {
    id: 'goal4',
    title: 'Complete 3 New Projects for Portfolio',
    category: 'skills',
    current: 1,
    target: 3,
    progress: calculateProgress(1, 3),
    deadline: new Date(2023, 11, 31),
    isCompleted: false
  },
  {
    id: 'goal5',
    title: 'Receive 1 Job Offer',
    description: 'Target companies with competitive compensation',
    category: 'offers',
    current: 0,
    target: 1,
    progress: calculateProgress(0, 1),
    deadline: new Date(2023, 11, 31),
    isCompleted: false
  },
  {
    id: 'goal6',
    title: 'Complete 10 LeetCode Challenges',
    description: 'Focus on algorithms and data structures',
    category: 'skills',
    current: 10,
    target: 10,
    progress: calculateProgress(10, 10),
    deadline: new Date(2023, 11, 15),
    isCompleted: true
  }
];

export default function Goals() {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<MonthlyGoal | null>(null);
  
  // Filter goals based on completion status
  const filteredGoals = monthlyGoals.filter(goal => {
    if (filter === 'all') return true;
    return filter === 'active' ? !goal.isCompleted : goal.isCompleted;
  });
  
  // Group goals by category for the view
  const goalsByCategory: Record<string, MonthlyGoal[]> = {};
  
  filteredGoals.forEach(goal => {
    if (!goalsByCategory[goal.category]) {
      goalsByCategory[goal.category] = [];
    }
    goalsByCategory[goal.category].push(goal);
  });
  
  // Get category label
  const getCategoryLabel = (category: string): string => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };
  
  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'applications':
        return <Target size={16} />;
      case 'interviews':
        return <Calendar size={16} />;
      case 'networking':
        return <TrendingUp size={16} />;
      case 'skills':
        return <PieChart size={16} />;
      case 'offers':
        return <Award size={16} />;
      default:
        return <Target size={16} />;
    }
  };
  
  // Get progress color based on percentage
  const getProgressColor = (progress: number): string => {
    if (progress >= 100) return 'var(--accent-success)';
    if (progress >= 60) return 'var(--accent-blue)';
    if (progress >= 30) return 'var(--accent-orange)';
    return 'var(--accent-red)';
  };
  
  return (
    <section className="goals-section reveal-element">
      <CardHeader
        title="Goals & Milestones"
        subtitle="Track your job search progress and achievements"
        accentColor="var(--accent-yellow)"
        variant="default"
      >
        <button 
          className="add-goal-btn"
          onClick={() => setShowAddForm(true)}
        >
          <PlusCircle size={18} />
          <span className="btn-text">Add Goal</span>
        </button>
      </CardHeader>
      
      <div className="goals-controls reveal-element">
        <div className="filter-tabs">
          <button 
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Goals
          </button>
          <button 
            className={`filter-tab ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            Active
          </button>
          <button 
            className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
        </div>
        
        <div className="view-options">
          <button className="sort-btn">
            <span>Sort By</span>
            <ChevronDown size={14} />
          </button>
        </div>
      </div>
      
      <div className="goals-grid reveal-element">
        {Object.keys(goalsByCategory).length > 0 ? (
          Object.entries(goalsByCategory).map(([category, goals]) => (
            <div key={category} className="category-section">
              <div className="category-header">
                <div 
                  className="category-icon" 
                  style={{ backgroundColor: `${getCategoryColor(category)}20`, color: getCategoryColor(category) }}
                >
                  {getCategoryIcon(category)}
                </div>
                <h3 className="category-title">{getCategoryLabel(category)}</h3>
                <div className="category-count">{goals.length}</div>
              </div>
              
              <div className="goals-list">
                {goals.map(goal => (
                  <div 
                    key={goal.id} 
                    className={`goal-card ${goal.isCompleted ? 'completed' : ''}`}
                    onClick={() => setSelectedGoal(goal)}
                  >
                    <div className="goal-header">
                      <h4 className="goal-title">{goal.title}</h4>
                      <button className="action-button">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                    
                    {goal.description && (
                      <p className="goal-description">{goal.description}</p>
                    )}
                    
                    <div className="goal-progress">
                      <div className="progress-info">
                        <div className="progress-numbers">
                          <span className="current">{goal.current}</span>
                          <span className="separator">/</span>
                          <span className="target">{goal.target}</span>
                        </div>
                        <div className="progress-percentage">
                          {goal.progress}%
                        </div>
                      </div>
                      
                      <div className="progress-bar-container">
                        <div 
                          className="progress-bar" 
                          style={{ 
                            width: `${goal.progress}%`,
                            backgroundColor: getProgressColor(goal.progress) 
                          }}
                        >
                          {goal.isCompleted && (
                            <span className="progress-check">
                              <CheckCircle size={12} />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="goal-footer">
                      <div className="goal-deadline">
                        <Calendar size={14} className="deadline-icon" />
                        <span>Due {formatDate(goal.deadline)}</span>
                      </div>
                      
                      <div className="goal-actions">
                        {!goal.isCompleted ? (
                          <>
                            <button className="action-icon-btn" title="Edit goal">
                              <Edit2 size={14} />
                            </button>
                            <button className="action-icon-btn" title="Mark as complete">
                              <CheckCircle size={14} />
                            </button>
                          </>
                        ) : (
                          <button className="action-icon-btn delete" title="Delete goal">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                <button className="add-category-goal">
                  <PlusCircle size={16} />
                  <span>Add {getCategoryLabel(category)} Goal</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <Target size={48} className="empty-icon" />
            <h3>No goals found</h3>
            <p>No goals match your current filter selection</p>
            <button 
              className="reset-filter-btn"
              onClick={() => setFilter('all')}
            >
              View All Goals
            </button>
          </div>
        )}
      </div>
      
      {/* Goal details modal would go here in a full implementation */}
      
      <style jsx>{`
        .goals-section {
          display: flex;
          flex-direction: column;
          gap: 24px;
          position: relative;
        }
        
        .goals-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 8px;
        }
        
        .filter-tabs {
          display: flex;
          background: var(--glass-bg);
          border-radius: var(--border-radius);
          padding: 4px;
          border: 1px solid var(--border-thin);
          box-shadow: var(--shadow-sharp);
        }
        
        .filter-tab {
          padding: 8px 16px;
          border-radius: var(--border-radius-sm);
          border: none;
          background: transparent;
          color: var(--text-secondary);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .filter-tab:hover {
          color: var(--text-primary);
          background: var(--hover-bg);
        }
        
        .filter-tab.active {
          background: var(--active-bg);
          color: var(--accent-yellow);
        }
        
        .view-options {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .sort-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: var(--border-radius);
          border: 1px solid var(--border-thin);
          background: var(--glass-bg);
          color: var(--text-primary);
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: var(--shadow-sharp);
        }
        
        .sort-btn:hover {
          border-color: var(--accent-yellow);
          box-shadow: 0 2px 6px rgba(var(--accent-yellow-rgb), 0.15);
          transform: translateY(-1px);
        }
        
        .goals-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
        }
        
        .category-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .category-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid var(--border-divider);
        }
        
        .category-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--border-radius);
        }
        
        .category-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
          flex: 1;
        }
        
        .category-count {
          background: var(--glass-bg);
          color: var(--text-secondary);
          font-size: 13px;
          font-weight: 500;
          padding: 2px 8px;
          border-radius: 12px;
          border: 1px solid var(--border-thin);
        }
        
        .goals-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .goal-card {
          background: var(--glass-card-bg);
          border-radius: var(--border-radius);
          border: 1px solid var(--border-thin);
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          box-shadow: var(--shadow);
          transition: all 0.2s ease;
          cursor: pointer;
        }
        
        .goal-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
          border-color: var(--border-hover);
        }
        
        .goal-card.completed {
          opacity: 0.7;
        }
        
        .goal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 8px;
        }
        
        .goal-title {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1.4;
        }
        
        .action-button {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          color: var(--text-tertiary);
          cursor: pointer;
          border-radius: 50%;
          padding: 0;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        
        .action-button:hover {
          background: var(--hover-bg);
          color: var(--text-primary);
        }
        
        .goal-description {
          margin: 0;
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.4;
        }
        
        .goal-progress {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        
        .progress-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .progress-numbers {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 14px;
        }
        
        .progress-numbers .current {
          font-weight: 600;
          color: var(--text-primary);
        }
        
        .progress-numbers .separator, 
        .progress-numbers .target {
          color: var(--text-secondary);
        }
        
        .progress-percentage {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
        }
        
        .progress-bar-container {
          height: 8px;
          background: var(--hover-bg);
          border-radius: 4px;
          overflow: hidden;
          position: relative;
        }
        
        .progress-bar {
          height: 100%;
          border-radius: 4px;
          transition: width 0.6s var(--easing-decelerate);
          position: relative;
        }
        
        .progress-check {
          position: absolute;
          right: 2px;
          top: 50%;
          transform: translateY(-50%);
          color: white;
        }
        
        .goal-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid var(--border-divider);
          padding-top: 12px;
          margin-top: 4px;
        }
        
        .goal-deadline {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: var(--text-tertiary);
        }
        
        .deadline-icon {
          color: var(--text-tertiary);
        }
        
        .goal-actions {
          display: flex;
          gap: 8px;
        }
        
        .action-icon-btn {
          width: 26px;
          height: 26px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: var(--glass-bg);
          border: 1px solid var(--border-thin);
          color: var(--text-tertiary);
          cursor: pointer;
          transition: all 0.2s ease;
          padding: 0;
        }
        
        .action-icon-btn:hover {
          transform: translateY(-2px);
          color: var(--text-primary);
          border-color: var(--border-hover);
        }
        
        .action-icon-btn.delete:hover {
          color: var(--accent-red);
          border-color: var(--accent-red);
        }
        
        .add-category-goal {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px;
          border-radius: var(--border-radius);
          border: 1px dashed var(--border-divider);
          background: var(--hover-bg);
          color: var(--text-secondary);
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .add-category-goal:hover {
          background: var(--active-bg);
          color: var(--text-primary);
          border-color: var(--border-hover);
        }
        
        .empty-state {
          grid-column: 1 / -1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 64px;
          text-align: center;
          color: var(--text-tertiary);
          gap: 16px;
          background: var(--glass-card-bg);
          border-radius: var(--border-radius);
          border: 1px solid var(--border-thin);
        }
        
        .empty-icon {
          opacity: 0.5;
        }
        
        .empty-state h3 {
          margin: 0;
          font-size: 18px;
          color: var(--text-secondary);
        }
        
        .empty-state p {
          margin: 0;
          font-size: 14px;
        }
        
        .reset-filter-btn {
          margin-top: 16px;
          padding: 8px 16px;
          border-radius: var(--border-radius);
          background: var(--accent-yellow);
          color: white;
          border: none;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .reset-filter-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(var(--accent-yellow-rgb), 0.3);
        }
        
        .add-goal-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: var(--border-radius);
          background: var(--accent-yellow);
          color: white;
          border: none;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 6px rgba(var(--accent-yellow-rgb), 0.25);
        }
        
        .add-goal-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(var(--accent-yellow-rgb), 0.3);
        }
        
        @media (max-width: 768px) {
          .goals-controls {
            flex-direction: column;
            align-items: stretch;
          }
          
          .filter-tabs {
            overflow-x: auto;
          }
          
          .view-options {
            align-self: flex-end;
          }
          
          .goals-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}