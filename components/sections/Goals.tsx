'use client';

import React, { useState, useEffect } from 'react';
import {
  Target, PlusCircle, ChevronDown, Calendar, TrendingUp,
  MoreHorizontal, CheckCircle, Edit2, Trash2, PieChart, Award,
  Loader
} from 'lucide-react';
import CardHeader from '../CardHeader';
import OpenAI from 'openai';

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

const calculateProgress = (current: number, target: number): number => {
  return Math.min(Math.round((current / target) * 100), 100);
};

const getCategoryColor = (category: string): string => {
  switch (category) {
    case 'applications': return 'var(--accent-blue)';
    case 'interviews': return 'var(--accent-green)';
    case 'networking': return 'var(--accent-purple)';
    case 'skills': return 'var(--accent-orange)';
    case 'offers': return 'var(--accent-success)';
    case 'other': return 'var(--accent-pink)';
    default: return 'var(--text-secondary)';
  }
};

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
};

export default function Goals() {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<MonthlyGoal | null>(null);
  const [monthlyGoals, setMonthlyGoals] = useState<MonthlyGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    generateGoalsFromOpenAI();
  }, []);

  const generateGoalsFromOpenAI = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const jobApplicationHistory = {
        applications: [
          { company: "TechCorp", position: "Senior Developer", date: "2025-02-15", status: "Applied" },
          { company: "InnovateSoft", position: "Full Stack Engineer", date: "2025-02-20", status: "Applied" },
          { company: "DataViz Inc", position: "Frontend Developer", date: "2025-02-25", status: "Applied" },
          { company: "CloudSystems", position: "React Developer", date: "2025-03-01", status: "Applied" },
          { company: "AlgoTech", position: "JavaScript Developer", date: "2025-03-05", status: "Applied" }
        ],
        interviews: [
          { company: "TechCorp", stage: "Technical", date: "2025-03-01", status: "Completed" },
          { company: "InnovateSoft", stage: "Initial Screening", date: "2025-03-03", status: "Scheduled" }
        ],
        networkingEvents: [
          { name: "Tech Meetup 2025", date: "2025-02-28", connections: 3 },
          { name: "Developer Conference", date: "2025-03-15", connections: 0, status: "Upcoming" }
        ]
      };

      const openai = new OpenAI({
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true // Only for development; use backend in production
      });

      const goalSchema = {
        type: "object",
        properties: {
          goals: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                title: { type: "string" },
                description: { type: "string" }, // Made required for now
                category: {
                  type: "string",
                  enum: ["applications", "interviews", "networking", "skills", "offers", "other"]
                },
                current: { type: "number" },
                target: { type: "number" },
                deadline: { type: "string" },
                isCompleted: { type: "boolean" }
              },
              required: ["id", "title", "description", "category", "current", "target", "deadline", "isCompleted"], // Added 'description' to required
              additionalProperties: false
            }
          }
        },
        required: ["goals"],
        additionalProperties: false
      };

      const response = await openai.chat.completions.create({
        model: "gpt-4o-2024-08-06",
        messages: [
          {
            role: "system",
            content: "You are an AI career coach assistant that helps set realistic job search goals based on a user's application history."
          },
          {
            role: "user",
            content: `Based on my job application history, generate 6 realistic monthly job search goals in JSON format. Include goals for applications, interviews, networking, skills development, and job offers. Ensure at least one goal is completed (isCompleted: true). Here's my current job search history: ${JSON.stringify(jobApplicationHistory)}. Return only valid JSON matching the provided schema with a root "goals" property containing the array of goals.`
          }
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "job_search_goals",
            strict: true,
            schema: goalSchema
          }
        }
      });

      const content = response.choices[0].message.content;
      if (!content) throw new Error("No content returned from API");

      const { goals: goalsData } = JSON.parse(content);
      const formattedGoals = goalsData.map((goal: any, index: number) => ({
        ...goal,
        id: goal.id || `goal${index + 1}`,
        progress: calculateProgress(goal.current, goal.target),
        deadline: new Date(goal.deadline)
      }));

      setMonthlyGoals(formattedGoals);
    } catch (err) {
      console.error("Error generating goals:", err);
      setError("Failed to generate goals. Using fallback data instead.");
      setMonthlyGoals([
        {
          id: 'goal1',
          title: 'Submit 15 Applications',
          description: 'Focus on tech companies using React and TypeScript',
          category: 'applications',
          current: 5,
          target: 15,
          progress: calculateProgress(5, 15),
          deadline: new Date(2025, 3, 15),
          isCompleted: false
        },
        {
          id: 'goal2',
          title: 'Get 3 Interview Invitations',
          description: 'Aim for technical interviews at mid-level',
          category: 'interviews',
          current: 2,
          target: 3,
          progress: calculateProgress(2, 3),
          deadline: new Date(2025, 3, 20),
          isCompleted: false
        },
        {
          id: 'goal3',
          title: 'Complete 2 Algorithm Challenges',
          description: 'Practice coding skills',
          category: 'skills',
          current: 2,
          target: 2,
          progress: calculateProgress(2, 2),
          deadline: new Date(2025, 3, 10),
          isCompleted: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredGoals = monthlyGoals.filter(goal =>
    filter === 'all' ? true : filter === 'active' ? !goal.isCompleted : goal.isCompleted
  );

  const goalsByCategory: Record<string, MonthlyGoal[]> = {};
  filteredGoals.forEach(goal => {
    goalsByCategory[goal.category] = goalsByCategory[goal.category] || [];
    goalsByCategory[goal.category].push(goal);
  });

  const getCategoryLabel = (category: string): string =>
    category.charAt(0).toUpperCase() + category.slice(1);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'applications': return <Target size={16} />;
      case 'interviews': return <Calendar size={16} />;
      case 'networking': return <TrendingUp size={16} />;
      case 'skills': return <PieChart size={16} />;
      case 'offers': return <Award size={16} />;
      default: return <Target size={16} />;
    }
  };

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
        <div className="header-actions">
          {!isLoading && (
            <button className="refresh-goals-btn" onClick={generateGoalsFromOpenAI} title="Refresh goals using AI">
              <TrendingUp size={18} />
              <span className="btn-text">Refresh Goals</span>
            </button>
          )}
          <button className="add-goal-btn" onClick={() => setShowAddForm(true)}>
            <PlusCircle size={18} />
            <span className="btn-text">Add Goal</span>
          </button>
        </div>
      </CardHeader>

      {isLoading ? (
        <div className="loading-state">
          <Loader size={36} className="loading-icon" />
          <p>Generating personalized goals with AI...</p>
        </div>
      ) : (
        <>
          {error && <div className="error-message">{error}</div>}
          <div className="goals-controls reveal-element">
            <div className="filter-tabs">
              <button className={`filter-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
                All Goals
              </button>
              <button className={`filter-tab ${filter === 'active' ? 'active' : ''}`} onClick={() => setFilter('active')}>
                Active
              </button>
              <button className={`filter-tab ${filter === 'completed' ? 'active' : ''}`} onClick={() => setFilter('completed')}>
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
                    <div className="category-icon" style={{ backgroundColor: `${getCategoryColor(category)}20`, color: getCategoryColor(category) }}>
                      {getCategoryIcon(category)}
                    </div>
                    <h3 className="category-title">{getCategoryLabel(category)}</h3>
                    <div className="category-count">{goals.length}</div>
                  </div>
                  <div className="goals-list">
                    {goals.map(goal => (
                      <div key={goal.id} className={`goal-card ${goal.isCompleted ? 'completed' : ''}`} onClick={() => setSelectedGoal(goal)}>
                        <div className="goal-header">
                          <h4 className="goal-title">{goal.title}</h4>
                          <button className="action-button">
                            <MoreHorizontal size={16} />
                          </button>
                        </div>
                        {goal.description && <p className="goal-description">{goal.description}</p>}
                        <div className="goal-progress">
                          <div className="progress-info">
                            <div className="progress-numbers">
                              <span className="current">{goal.current}</span>
                              <span className="separator">/</span>
                              <span className="target">{goal.target}</span>
                            </div>
                            <div className="progress-percentage">{goal.progress}%</div>
                          </div>
                          <div className="progress-bar-container">
                            <div className="progress-bar" style={{ width: `${goal.progress}%`, backgroundColor: getProgressColor(goal.progress) }}>
                              {goal.isCompleted && <span className="progress-check"><CheckCircle size={12} /></span>}
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
                                <button className="action-icon-btn" title="Edit goal"><Edit2 size={14} /></button>
                                <button className="action-icon-btn" title="Mark as complete"><CheckCircle size={14} /></button>
                              </>
                            ) : (
                              <button className="action-icon-btn delete" title="Delete goal"><Trash2 size={14} /></button>
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
                <button className="reset-filter-btn" onClick={() => setFilter('all')}>
                  View All Goals
                </button>
              </div>
            )}
          </div>
        </>
      )}

      <style jsx>{`
        .goals-section { display: flex; flex-direction: column; gap: 24px; position: relative; }
        .header-actions { display: flex; gap: 12px; }
        .refresh-goals-btn { display: flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: var(--border-radius); background: var(--glass-bg); color: var(--text-primary); border: 1px solid var(--border-thin); font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s ease; }
        .refresh-goals-btn:hover { background: var(--hover-bg); transform: translateY(-2px); border-color: var(--border-hover); }
        .loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px; gap: 16px; text-align: center; background: var(--glass-card-bg); border-radius: var(--border-radius); border: 1px solid var(--border-thin); }
        .loading-icon { animation: spin 1.5s linear infinite; color: var(--accent-yellow); }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .error-message { padding: 12px 16px; background: rgba(var(--accent-red-rgb), 0.1); color: var(--accent-red); border-radius: var(--border-radius); border: 1px solid var(--accent-red); margin-bottom: 16px; font-size: 14px; }
        .goals-controls { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; margin-bottom: 8px; }
        .filter-tabs { display: flex; background: var(--glass-bg); border-radius: var(--border-radius); padding: 4px; border: 1px solid var(--border-thin); box-shadow: var(--shadow-sharp); }
        .filter-tab { padding: 8px 16px; border-radius: var(--border-radius-sm); border: none; background: transparent; color: var(--text-secondary); font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s ease; }
        .filter-tab:hover { color: var(--text-primary); background: var(--hover-bg); }
        .filter-tab.active { background: var(--active-bg); color: var(--accent-yellow); }
        .view-options { display: flex; align-items: center; gap: 12px; }
        .sort-btn { display: flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: var(--border-radius); border: 1px solid var(--border-thin); background: var(--glass-bg); color: var(--text-primary); font-size: 14px; cursor: pointer; transition: all 0.2s ease; box-shadow: var(--shadow-sharp); }
        .sort-btn:hover { border-color: var(--accent-yellow); box-shadow: 0 2px 6px rgba(var(--accent-yellow-rgb), 0.15); transform: translateY(-1px); }
        .goals-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; }
        .category-section { display: flex; flex-direction: column; gap: 16px; }
        .category-header { display: flex; align-items: center; gap: 12px; padding-bottom: 8px; border-bottom: 1px solid var(--border-divider); }
        .category-icon { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: var(--border-radius); }
        .category-title { font-size: 16px; font-weight: 600; color: var(--text-primary); margin: 0; flex: 1; }
        .category-count { background: var(--glass-bg); color: var(--text-secondary); font-size: 13px; font-weight: 500; padding: 2px 8px; border-radius: 12px; border: 1px solid var(--border-thin); }
        .goals-list { display: flex; flex-direction: column; gap: 16px; }
        .goal-card { background: var(--glass-card-bg); border-radius: var(--border-radius); border: 1px solid var(--border-thin); padding: 16px; display: flex; flex-direction: column; gap: 12px; box-shadow: var(--shadow); transition: all 0.2s ease; cursor: pointer; }
        .goal-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); border-color: var(--border-hover); }
        .goal-card.completed { opacity: 0.7; }
        .goal-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; }
        .goal-title { margin: 0; font-size: 16px; font-weight: 600; color: var(--text-primary); line-height: 1.4; }
        .action-button { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; background: transparent; border: none; color: var(--text-tertiary); cursor: pointer; border-radius: 50%; padding: 0; transition: all 0.2s ease; flex-shrink: 0; }
        .action-button:hover { background: var(--hover-bg); color: var(--text-primary); }
        .goal-description { margin: 0; font-size: 14px; color: var(--text-secondary); line-height: 1.4; }
        .goal-progress { display: flex; flex-direction: column; gap: 6px; }
        .progress-info { display: flex; justify-content: space-between; align-items: center; }
        .progress-numbers { display: flex; align-items: center; gap: 4px; font-size: 14px; }
        .progress-numbers .current { font-weight: 600; color: var(--text-primary); }
        .progress-numbers .separator, .progress-numbers .target { color: var(--text-secondary); }
        .progress-percentage { font-size: 14px; font-weight: 600; color: var(--text-primary); }
        .progress-bar-container { height: 8px; background: var(--hover-bg); border-radius: 4px; overflow: hidden; position: relative; }
        .progress-bar { height: 100%; border-radius: 4px; transition: width 0.6s var(--easing-decelerate); position: relative; }
        .progress-check { position: absolute; right: 2px; top: 50%; transform: translateY(-50%); color: white; }
        .goal-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-divider); padding-top: 12px; margin-top: 4px; }
        .goal-deadline { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--text-tertiary); }
        .deadline-icon { color: var(--text-tertiary); }
        .goal-actions { display: flex; gap: 8px; }
        .action-icon-btn { width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; border-radius: 50%; background: var(--glass-bg); border: 1px solid var(--border-thin); color: var(--text-tertiary); cursor: pointer; transition: all 0.2s ease; padding: 0; }
        .action-icon-btn:hover { transform: translateY(-2px); color: var(--text-primary); border-color: var(--border-hover); }
        .action-icon-btn.delete:hover { color: var(--accent-red); border-color: var(--accent-red); }
        .add-category-goal { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 10px; border-radius: var(--border-radius); border: 1px dashed var(--border-divider); background: var(--hover-bg); color: var(--text-secondary); font-size: 14px; cursor: pointer; transition: all 0.2s ease; }
        .add-category-goal:hover { background: var(--active-bg); color: var(--text-primary); border-color: var(--border-hover); }
        .empty-state { grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 64px; text-align: center; color: var(--text-tertiary); gap: 16px; background: var(--glass-card-bg); border-radius: var(--border-radius); border: 1px solid var(--border-thin); }
        .empty-icon { opacity: 0.5; }
        .empty-state h3 { margin: 0; font-size: 18px; color: var(--text-secondary); }
        .empty-state p { margin: 0; font-size: 14px; }
        .reset-filter-btn { margin-top: 16px; padding: 8px 16px; border-radius: var(--border-radius); background: var(--accent-yellow); color: white; border: none; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s ease; }
        .reset-filter-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(var(--accent-yellow-rgb), 0.3); }
        .add-goal-btn { display: flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: var(--border-radius); background: var(--accent-yellow); color: white; border: none; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 2px 6px rgba(var(--accent-yellow-rgb), 0.25); }
        .add-goal-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(var(--accent-yellow-rgb), 0.3); }
        @media (max-width: 768px) {
          .header-actions { flex-direction: column; width: 100%; }
          .refresh-goals-btn, .add-goal-btn { width: 100%; justify-content: center; }
          .goals-controls { flex-direction: column; align-items: stretch; }
          .filter-tabs { overflow-x: auto; }
          .view-options { align-self: flex-end; }
          .goals-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </section>
  );
}
