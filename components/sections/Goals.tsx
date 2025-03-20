'use client';

import React, { useState, useEffect, ChangeEvent, KeyboardEvent } from 'react';
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
  description: string;
  category: 'applications' | 'interviews' | 'networking' | 'skills' | 'offers' | 'other';
  current: number;
  target: number;
  progress: number;
  deadline: Date;
  isCompleted: boolean;
  isApproved: boolean;
}

interface NewGoalForm {
  title: string;
  description: string;
  category: MonthlyGoal['category'];
  current: number;
  target: number;
  deadline: string;
}

const calculateProgress = (current: number, target: number): number => {
  return Math.min(Math.round((current / target) * 100), 100);
};

const getCategoryColor = (category: MonthlyGoal['category']): string => {
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

const categoryOrder: MonthlyGoal['category'][] = ['applications', 'interviews', 'networking', 'skills', 'offers', 'other'];

export default function Goals() {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<MonthlyGoal | null>(null);
  const [monthlyGoals, setMonthlyGoals] = useState<MonthlyGoal[]>([]);
  const [isFetchingNewGoals, setIsFetchingNewGoals] = useState(false); // Changed from isLoading
  const [error, setError] = useState<string | null>(null);
  const [newGoal, setNewGoal] = useState<NewGoalForm>({
    title: '',
    description: '',
    category: 'applications',
    current: 0,
    target: 1,
    deadline: ''
  });
  const [formError, setFormError] = useState<string>('');

  useEffect(() => {
    generateGoalsFromOpenAI();
  }, []);

  const generateGoalsFromOpenAI = async () => {
    setIsFetchingNewGoals(true);
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

      const approvedGoals = monthlyGoals.filter(goal => goal.isApproved);

      const openai = new OpenAI({
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY ?? '',
        dangerouslyAllowBrowser: true
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
                description: { type: "string" },
                category: { type: "string", enum: categoryOrder },
                current: { type: "number" },
                target: { type: "number" },
                deadline: { type: "string" },
                isCompleted: { type: "boolean" }
              },
              required: ["id", "title", "description", "category", "current", "target", "deadline", "isCompleted"],
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
            content: `Based on my job application history, generate 6 realistic monthly job search goals in JSON format. Include goals for applications, interviews, networking, skills development, and job offers. Set "current" to 0 for all goals (representing unstarted goals) and "isCompleted" to false. Here’s my current job search history: ${JSON.stringify(jobApplicationHistory)}. Avoid duplicating or closely resembling these existing approved goals: ${JSON.stringify(approvedGoals)}. Return only valid JSON matching the provided schema with a root "goals" property containing the array of goals.`
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

      const { goals: newGoalsData } = JSON.parse(content) as { goals: Partial<MonthlyGoal>[] };
      const formattedNewGoals: MonthlyGoal[] = newGoalsData.map((goal, index) => ({
        id: `ai-${Date.now()}-${index}`,
        title: goal.title ?? '',
        description: goal.description ?? '',
        category: goal.category as MonthlyGoal['category'],
        current: goal.current ?? 0,
        target: goal.target ?? 1,
        progress: calculateProgress(goal.current ?? 0, goal.target ?? 1),
        deadline: new Date(goal.deadline ?? Date.now()),
        isCompleted: goal.isCompleted ?? false,
        isApproved: false
      }));

      setMonthlyGoals(prevGoals => {
        const existingApprovedGoals = prevGoals.filter(goal => goal.isApproved);
        const uniqueNewGoals = formattedNewGoals.filter(goal => !prevGoals.some(prev => prev.id === goal.id));
        return [...existingApprovedGoals, ...uniqueNewGoals].sort((a, b) => categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category));
      });
    } catch (err) {
      console.error("Error generating goals:", err);
      setError("Failed to fetch new goals. Existing goals remain unchanged.");
      if (monthlyGoals.length === 0) {
        setMonthlyGoals((prevGoals: any) => {
          const existingApprovedGoals = prevGoals.filter((goal: any) => goal.isApproved);
          return [...existingApprovedGoals, ...[
            {
              id: 'fallback-1',
              title: 'Submit 10 Applications',
              description: 'Focus on tech companies',
              category: 'applications',
              current: 0,
              target: 10,
              progress: calculateProgress(0, 10),
              deadline: new Date(2025, 3, 15),
              isCompleted: false,
              isApproved: false
            },
            {
              id: 'fallback-2',
              title: 'Schedule 3 Interviews',
              description: 'Prepare for technical rounds',
              category: 'interviews',
              current: 0,
              target: 3,
              progress: calculateProgress(0, 3),
              deadline: new Date(2025, 3, 20),
              isCompleted: false,
              isApproved: false
            },
            {
              id: 'fallback-3',
              title: 'Attend 2 Networking Events',
              description: 'Build professional connections',
              category: 'networking',
              current: 0,
              target: 2,
              progress: calculateProgress(0, 2),
              deadline: new Date(2025, 3, 25),
              isCompleted: false,
              isApproved: false
            }
          ].filter(fallback => !prevGoals.some((prev: any) => prev.id === fallback.id))].sort((a, b) => categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category));
        });
      }
    } finally {
      setIsFetchingNewGoals(false);
    }
  };

  const handleApproveGoal = (goalId: string) => {
    setMonthlyGoals(prevGoals =>
      prevGoals.map(goal =>
        goal.id === goalId ? { ...goal, isApproved: true } : goal
      ).sort((a, b) => categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category))
    );
  };

  const handleAddGoal = () => {
    if (!newGoal.title || !newGoal.deadline || newGoal.target <= 0) {
      setFormError('Title, deadline, and a positive target are required.');
      return;
    }
    setFormError('');
    const newGoalData: MonthlyGoal = {
      id: `user-${Date.now()}`,
      title: newGoal.title,
      description: newGoal.description,
      category: newGoal.category,
      current: newGoal.current,
      target: newGoal.target,
      progress: calculateProgress(newGoal.current, newGoal.target),
      deadline: new Date(newGoal.deadline),
      isCompleted: false,
      isApproved: true
    };
    setMonthlyGoals(prevGoals => [...prevGoals, newGoalData].sort((a, b) => categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category)));
    setNewGoal({ title: '', description: '', category: 'applications', current: 0, target: 1, deadline: '' });
    setShowAddForm(false);
  };

  const handleFormKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleAddGoal();
  };

  const filteredGoals = monthlyGoals.filter(goal =>
    filter === 'all' ? true : filter === 'active' ? !goal.isCompleted : goal.isCompleted
  );

  const goalsByCategory: Record<MonthlyGoal['category'], MonthlyGoal[]> = {} as Record<MonthlyGoal['category'], MonthlyGoal[]>;
  filteredGoals.forEach(goal => {
    goalsByCategory[goal.category] = goalsByCategory[goal.category] || [];
    goalsByCategory[goal.category].push(goal);
  });

  const getCategoryLabel = (category: string): string => category.charAt(0).toUpperCase() + category.slice(1);

  const getCategoryIcon = (category: MonthlyGoal['category']) => {
    switch (category) {
      case 'applications': return <Target size={16} aria-label="Applications" />;
      case 'interviews': return <Calendar size={16} aria-label="Interviews" />;
      case 'networking': return <TrendingUp size={16} aria-label="Networking" />;
      case 'skills': return <PieChart size={16} aria-label="Skills" />;
      case 'offers': return <Award size={16} aria-label="Offers" />;
      default: return <Target size={16} aria-label="Other" />;
    }
  };

  const getProgressColor = (progress: number): string => {
    if (progress >= 100) return 'var(--accent-success)';
    if (progress >= 60) return 'var(--accent-blue)';
    if (progress >= 30) return 'var(--accent-orange)';
    return 'var(--accent-red)';
  };

  return (
    <section className="goals-section reveal-element" aria-label="Goals and Milestones">
      <CardHeader
        title="Goals & Milestones"
        subtitle="Track your job search progress and achievements"
        accentColor="var(--accent-yellow)"
        variant="default"
      >
        <div className="header-actions">
          <button
            className="refresh-goals-btn"
            onClick={generateGoalsFromOpenAI}
            title="Refresh AI-generated goals"
            aria-label="Refresh goals"
            disabled={isFetchingNewGoals}
          >
            <TrendingUp size={18} />
            <span className="btn-text">Refresh Goals</span>
            {isFetchingNewGoals && <Loader size={16} className="fetching-icon" />}
          </button>
          <button
            className="add-goal-btn"
            onClick={() => setShowAddForm(true)}
            aria-label="Add new goal"
          >
            <PlusCircle size={18} />
            <span className="btn-text">Add Goal</span>
          </button>
        </div>
      </CardHeader>

      <>
        {error && <div className="error-message" role="alert">{error}</div>}
        {showAddForm && (
          <div className="add-goal-form" role="dialog" aria-label="Add new goal form">
            <input
              type="text"
              placeholder="Title (e.g., Apply to 5 jobs)"
              value={newGoal.title}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setNewGoal({ ...newGoal, title: e.target.value })}
              onKeyDown={handleFormKeyDown}
              aria-required="true"
              className={newGoal.title ? '' : 'invalid'}
            />
            <input
              type="text"
              placeholder="Description (e.g., Focus on tech roles)"
              value={newGoal.description}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setNewGoal({ ...newGoal, description: e.target.value })}
              onKeyDown={handleFormKeyDown}
            />
            <select
              value={newGoal.category}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setNewGoal({ ...newGoal, category: e.target.value as MonthlyGoal['category'] })}
              aria-label="Goal category"
            >
              {categoryOrder.map(cat => (
                <option key={cat} value={cat}>{getCategoryLabel(cat)}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Current (e.g., 0)"
              value={newGoal.current}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setNewGoal({ ...newGoal, current: parseInt(e.target.value) || 0 })}
              onKeyDown={handleFormKeyDown}
              min="0"
            />
            <input
              type="number"
              placeholder="Target (e.g., 5)"
              value={newGoal.target}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setNewGoal({ ...newGoal, target: parseInt(e.target.value) || 1 })}
              onKeyDown={handleFormKeyDown}
              min="1"
              className={newGoal.target > 0 ? '' : 'invalid'}
            />
            <input
              type="date"
              value={newGoal.deadline}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setNewGoal({ ...newGoal, deadline: e.target.value })}
              onKeyDown={handleFormKeyDown}
              aria-required="true"
              className={newGoal.deadline ? '' : 'invalid'}
            />
            {formError && <span className="form-error" role="alert">{formError}</span>}
            <div className="form-actions">
              <button onClick={handleAddGoal} aria-label="Save new goal">Save Goal</button>
              <button onClick={() => { setShowAddForm(false); setFormError(''); }} aria-label="Cancel">Cancel</button>
            </div>
          </div>
        )}
        <div className="goals-controls reveal-element">
          <div className="filter-tabs" role="tablist">
            <button
              role="tab"
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
              aria-selected={filter === 'all'}
            >
              All Goals
            </button>
            <button
              role="tab"
              className={`filter-tab ${filter === 'active' ? 'active' : ''}`}
              onClick={() => setFilter('active')}
              aria-selected={filter === 'active'}
            >
              Active
            </button>
            <button
              role="tab"
              className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
              onClick={() => setFilter('completed')}
              aria-selected={filter === 'completed'}
            >
              Completed
            </button>
          </div>
          <div className="view-options">
            <button className="sort-btn" aria-label="Sort options (not implemented)">
              <span>Sort By</span>
              <ChevronDown size={14} />
            </button>
          </div>
        </div>

        <div className="goals-grid reveal-element" aria-live="polite">
          {categoryOrder.map(category => {
            const goals = goalsByCategory[category] || [];
            const hasUnapprovedGoals = goals.some(goal => !goal.isApproved);
            return (
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
                    <div
                      key={goal.id}
                      className={`goal-card ${goal.isCompleted ? 'completed' : ''} ${goal.isApproved ? 'approved' : ''}`}
                      onClick={() => setSelectedGoal(goal)}
                      tabIndex={0}
                      role="button"
                      aria-label={`View details for ${goal.title}`}
                    >
                      <div className="goal-header">
                        <h4 className="goal-title">{goal.title}</h4>
                        <button className="action-button" aria-label="More options">
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
                          <Calendar size={14} className="deadline-icon" aria-hidden="true" />
                          <span>Due {formatDate(goal.deadline)}</span>
                        </div>
                        <div className="goal-actions">
                          {!goal.isApproved && (
                            <button
                              className="action-icon-btn"
                              title="Approve goal"
                              onClick={(e) => { e.stopPropagation(); handleApproveGoal(goal.id); }}
                              aria-label={`Approve ${goal.title}`}
                            >
                              <CheckCircle size={14} />
                            </button>
                          )}
                          {!goal.isCompleted ? (
                            <>
                              <button className="action-icon-btn" title="Edit goal" aria-label={`Edit ${goal.title}`}><Edit2 size={14} /></button>
                              <button className="action-icon-btn" title="Mark as complete" aria-label={`Mark ${goal.title} as complete`}><CheckCircle size={14} /></button>
                            </>
                          ) : (
                            <button className="action-icon-btn delete" title="Delete goal" aria-label={`Delete ${goal.title}`}><Trash2 size={14} /></button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isFetchingNewGoals && hasUnapprovedGoals && (
                    <div className="loading-section" aria-live="polite">
                      <Loader size={24} className="loading-icon" aria-hidden="true" />
                      <span>Fetching new {getCategoryLabel(category)} goals...</span>
                    </div>
                  )}
                  <button
                    className="add-category-goal"
                    onClick={() => setShowAddForm(true)}
                    aria-label={`Add new ${getCategoryLabel(category)} goal`}
                  >
                    <PlusCircle size={16} />
                    <span>Add {getCategoryLabel(category)} Goal</span>
                  </button>
                </div>
              </div>
            );
          })}
          {Object.keys(goalsByCategory).length === 0 && (
            <div className="empty-state" role="alert">
              <Target size={48} className="empty-icon" aria-hidden="true" />
              <h3>No goals found</h3>
              <p>No goals match your current filter selection</p>
              <button className="reset-filter-btn" onClick={() => setFilter('all')} aria-label="Reset to view all goals">
                View All Goals
              </button>
            </div>
          )}
        </div>
      </>

      <style jsx>{`
        .goals-section { display: flex; flex-direction: column; gap: 24px; position: relative; }
        .header-actions { display: flex; gap: 12px; }
        .refresh-goals-btn, .add-goal-btn { display: flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: var(--border-radius); font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.3s ease; position: relative; }
        .refresh-goals-btn { background: var(--glass-bg); color: var(--text-primary); border: 1px solid var(--border-thin); }
        .refresh-goals-btn:hover:not(:disabled) { background: var(--hover-bg); transform: translateY(-2px); border-color: var(--accent-yellow); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); }
        .refresh-goals-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .fetching-icon { margin-left: 8px; animation: spin 1.5s linear infinite; }
        .add-goal-btn { background: var(--accent-yellow); color: white; border: none; box-shadow: 0 2px 6px rgba(var(--accent-yellow-rgb), 0.25); }
        .add-goal-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(var(--accent-yellow-rgb), 0.3); }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .error-message { padding: 12px 16px; background: rgba(var(--accent-red-rgb), 0.1); color: var(--accent-red); border-radius: var(--border-radius); border: 1px solid var(--accent-red); margin-bottom: 16px; font-size: 14px; animation: fadeIn 0.3s ease-in; }
        .add-goal-form { display: flex; flex-direction: column; gap: 12px; padding: 20px; background: var(--glass-card-bg); border-radius: var(--border-radius); border: 1px solid var(--border-thin); margin-bottom: 20px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); animation: slideIn 0.3s ease-out; }
        @keyframes slideIn { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .add-goal-form input, .add-goal-form select { padding: 10px; border-radius: var(--border-radius); border: 1px solid var(--border-thin); font-size: 14px; transition: border-color 0.2s ease; }
        .add-goal-form input:focus, .add-goal-form select:focus { border-color: var(--accent-yellow); outline: none; }
        .add-goal-form input.invalid { border-color: var(--accent-red); }
        .form-error { color: var(--accent-red); font-size: 12px; }
        .form-actions { display: flex; gap: 10px; }
        .add-goal-form button { padding: 10px; border-radius: var(--border-radius); font-size: 14px; cursor: pointer; transition: all 0.2s ease; }
        .add-goal-form button:first-child { background: var(--accent-yellow); color: white; border: none; }
        .add-goal-form button:first-child:hover { background: var(--accent-yellow-dark); transform: translateY(-1px); }
        .add-goal-form button:last-child { background: var(--hover-bg); color: var(--text-primary); border: 1px solid var(--border-thin); }
        .add-goal-form button:last-child:hover { background: var(--active-bg); }
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
        .category-icon { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: var(--border-radius); transition: transform 0.2s ease; }
        .category-icon:hover { transform: scale(1.1); }
        .category-title { font-size: 16px; font-weight: 600; color: var(--text-primary); margin: 0; flex: 1; }
        .category-count { background: var(--glass-bg); color: var(--text-secondary); font-size: 13px; font-weight: 500; padding: 2px 8px; border-radius: 12px; border: 1px solid var(--border-thin); }
        .goals-list { display: flex; flex-direction: column; gap: 16px; }
        .goal-card { background: var(--glass-card-bg); border-radius: var(--border-radius); border: 1px solid var(--border-thin); padding: 16px; display: flex; flex-direction: column; gap: 12px; box-shadow: var(--shadow); transition: all 0.3s ease; cursor: pointer; animation: fadeIn 0.3s ease-in; }
        .goal-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); border-color: var(--border-hover); }
        .goal-card:focus { outline: 2px solid var(--accent-yellow); outline-offset: 2px; }
        .goal-card.completed { opacity: 0.7; }
        .goal-card.approved { border-left: 4px solid var(--accent-success); }
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
        .progress-bar { height: 100%; border-radius: 4px; transition: width 0.6s ease-out; position: relative; }
        .progress-check { position: absolute; right: 2px; top: 50%; transform: translateY(-50%); color: white; }
        .goal-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-divider); padding-top: 12px; margin-top: 4px; }
        .goal-deadline { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--text-tertiary); }
        .deadline-icon { color: var(--text-tertiary); }
        .goal-actions { display: flex; gap: 8px; }
        .action-icon-btn { width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; border-radius: 50%; background: var(--glass-bg); border: 1px solid var(--border-thin); color: var(--text-tertiary); cursor: pointer; transition: all 0.2s ease; padding: 0; }
        .action-icon-btn:hover { transform: translateY(-2px); color: var(--text-primary); border-color: var(--border-hover); box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1); }
        .action-icon-btn.delete:hover { color: var(--accent-red); border-color: var(--accent-red); }
        .loading-section { display: flex; align-items: center; gap: 8px; padding: 12px; background: var(--glass-card-bg); border-radius: var(--border-radius); border: 1px solid var(--border-thin); color: var(--text-secondary); font-size: 14px; animation: fadeIn 0.3s ease-in; }
        .loading-icon { animation: spin 1.5s linear infinite; color: var(--accent-yellow); }
        .add-category-goal { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 10px; border-radius: var(--border-radius); border: 1px dashed var(--border-divider); background: var(--hover-bg); color: var(--text-secondary); font-size: 14px; cursor: pointer; transition: all 0.2s ease; }
        .add-category-goal:hover { background: var(--active-bg); color: var(--text-primary); border-color: var(--border-hover); transform: translateY(-1px); }
        .empty-state { grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 64px; text-align: center; color: var(--text-tertiary); gap: 16px; background: var(--glass-card-bg); border-radius: var(--border-radius); border: 1px solid var(--border-thin); animation: fadeIn 0.5s ease-in; }
        .empty-icon { opacity: 0.5; }
        .empty-state h3 { margin: 0; font-size: 18px; color: var(--text-secondary); }
        .empty-state p { margin: 0; font-size: 14px; }
        .reset-filter-btn { margin-top: 16px; padding: 8px 16px; border-radius: var(--border-radius); background: var(--accent-yellow); color: white; border: none; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s ease; }
        .reset-filter-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(var(--accent-yellow-rgb), 0.3); }
        @media (max-width: 768px) {
          .header-actions { flex-direction: column; width: 100%; }
          .refresh-goals-btn, .add-goal-btn { width: 100%; justify-content: center; }
          .goals-controls { flex-direction: column; align-items: stretch; }
          .filter-tabs { overflow-x: auto; }
          .view-options { align-self: flex-end; }
          .goals-grid { grid-template-columns: 1fr; }
          .add-goal-form { padding: 16px; }
        }
      `}</style>
    </section>
  );
}
