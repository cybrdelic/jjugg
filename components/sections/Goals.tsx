'use client';

import React, { useState, useEffect, ChangeEvent, KeyboardEvent } from 'react';
import {
  Target, PlusCircle, ChevronDown, Calendar, TrendingUp,
  MoreHorizontal, CheckCircle, ChevronRight, XCircle, Plus, Minus, Trash2, PieChart, Search
} from 'lucide-react';
import CardHeader from '../CardHeader';
import OpenAI from 'openai';
import confetti from 'canvas-confetti';
import Modal from '../Modal';
import Portal from '../Portal';

interface MonthlyGoal {
  id: string;
  title: string;
  description: string;
  category: 'applications' | 'interviews' | 'networking' | 'skills';
  current: number;
  target: number;
  progress: number;
  deadline: Date;
  isCompleted: boolean;
  isApproved: boolean;
  isRejected?: boolean;
  isAIGenerated?: boolean;
  priority?: 'high' | 'medium' | 'low';
}

interface NewGoalForm {
  title: string;
  description: string;
  category: MonthlyGoal['category'];
  current: number;
  target: number;
  deadline: string;
  priority: 'high' | 'medium' | 'low';
}

interface StatusUpdate {
  id: string;
  message: string;
  goalId: string | null;
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
    default: return 'var(--text-secondary)';
  }
};

const getPriorityColor = (priority: MonthlyGoal['priority']): string => {
  switch (priority) {
    case 'high': return 'var(--accent-red)';
    case 'medium': return 'var(--accent-yellow)';
    case 'low': return 'var(--accent-green)';
    default: return 'var(--text-tertiary)';
  }
};

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
};

const isDeadlineNear = (deadline: Date): boolean => {
  const now = new Date();
  const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays <= 3 && diffDays >= 0;
};

const categoryOrder: MonthlyGoal['category'][] = ['applications', 'interviews', 'networking', 'skills'];

export default function Goals() {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState<string>(''); // New state for search
  const [showAddModal, setShowAddModal] = useState(false);
  const [showContextModal, setShowContextModal] = useState(false); // New state for context modal
  const [goalContext, setGoalContext] = useState<string>(''); // New state for goal context
  const [selectedGoal, setSelectedGoal] = useState<MonthlyGoal | null>(null);
  const [monthlyGoals, setMonthlyGoals] = useState<MonthlyGoal[]>([]);
  const [isFetchingNewGoals, setIsFetchingNewGoals] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newGoal, setNewGoal] = useState<NewGoalForm>({
    title: '',
    description: '',
    category: 'applications',
    current: 0,
    target: 1,
    deadline: '',
    priority: 'medium'
  });
  const [formError, setFormError] = useState<string>('');
  const [statusUpdates, setStatusUpdates] = useState<StatusUpdate[]>([]);
  const [hasShownOnboarding, setHasShownOnboarding] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    generateGoalsFromOpenAI();
    if (!hasShownOnboarding) {
      setTimeout(() => setHasShownOnboarding(true), 5000);
    }
  }, []);

  const addStatusUpdate = (message: string, goalId: string | null) => {
    const newId = `${goalId || 'global'}-${Date.now()}`;
    setStatusUpdates(prev => {
      const isDuplicate = prev.some(update => update.message === message && update.goalId === goalId);
      if (isDuplicate) return prev;
      return [...prev, { id: newId, message, goalId }];
    });
    setTimeout(() => setStatusUpdates(prev => prev.filter(update => update.id !== newId)), 2000);
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#00FF00', '#FF4500'],
      disableForReducedMotion: true
    });
  };

  const generateGoalsFromOpenAI = async (context: string = goalContext) => {
    setIsFetchingNewGoals(true);
    setError(null);
    if (hasShownOnboarding) addStatusUpdate("Fetching new suggestions...", null);
    setMonthlyGoals(prevGoals => prevGoals.filter(goal => goal.isApproved));

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
                category: { type: "string", enum: ["applications", "interviews", "networking", "skills"] }, // Explicitly list enum values
                current: { type: "number" },
                target: { type: "number" },
                deadline: { type: "string" },
                isCompleted: { type: "boolean" },
                priority: { type: "string", enum: ["high", "medium", "low"] }
              },
              required: ["id", "title", "description", "category", "current", "target", "deadline", "isCompleted", "priority"],
              additionalProperties: false
            }
          }
        },
        required: ["goals"],
        additionalProperties: false
      };

      const contextPrompt = context
        ? `The user has provided this critical context: "${context}". Your primary task is to generate goals that directly align with this context. Use the job application history as a secondary reference to ensure realism, but the goals must strongly reflect the user's stated context: "${context}". For example, if the context is "I want a job that pays more," prioritize goals like applying to higher-paying roles, networking with senior professionals, or learning high-demand skills over generic goals. `
        : 'No specific context provided; generate balanced goals based solely on the job application history. ';

      const response = await openai.chat.completions.create({
        model: "gpt-4o-2024-08-06",
        messages: [
          {
            role: "system",
            content: "You are an AI career coach assistant tasked with generating realistic job search goals. Your suggestions must be highly tailored to the user's input, especially any provided context."
          },
          {
            role: "user",
            content: `${contextPrompt}Generate 4 realistic monthly job search goals in JSON format for the categories: applications, interviews, networking, and skills. Set "current" to 0 for all goals (unstarted) and "isCompleted" to false. Include a "priority" field ("high", "medium", "low") based on urgency, aligning with the context if provided. Here’s my job application history: ${JSON.stringify(jobApplicationHistory)}. Avoid duplicating or closely resembling these existing approved goals: ${JSON.stringify(approvedGoals)}. Return only valid JSON matching the provided schema with a root "goals" property containing the array of goals.`
          }
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "job_search_goals",
            schema: goalSchema, // Remove unnecessary nesting
            strict: true
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
        isApproved: false,
        isRejected: false,
        isAIGenerated: true,
        priority: goal.priority ?? 'medium'
      }));

      setMonthlyGoals(prevGoals => {
        const approvedGoalsOnly = prevGoals.filter(goal => goal.isApproved);
        const updatedGoals = [...approvedGoalsOnly, ...formattedNewGoals];
        return updatedGoals.sort((a, b) => categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category));
      });
    } catch (err) {
      console.error("Error generating goals:", err);
      setError("Failed to fetch new goals. Existing goals remain unchanged.");
      if (monthlyGoals.length === 0) {
        const fallbackGoals: MonthlyGoal[] = [
          {
            id: 'fallback-1',
            title: 'Submit 10 Applications',
            description: 'Focus on tech companies',
            category: 'applications' as const,
            current: 0,
            target: 10,
            progress: calculateProgress(0, 10),
            deadline: new Date(2025, 3, 15),
            isCompleted: false,
            isApproved: false,
            isRejected: false,
            isAIGenerated: true,
            priority: 'medium'
          },
          {
            id: 'fallback-2',
            title: 'Schedule 3 Interviews',
            description: 'Prepare for technical rounds',
            category: 'interviews' as const,
            current: 0,
            target: 3,
            progress: calculateProgress(0, 3),
            deadline: new Date(2025, 3, 20),
            isCompleted: false,
            isApproved: false,
            isRejected: false,
            isAIGenerated: true,
            priority: 'high'
          },
          {
            id: 'fallback-3',
            title: 'Attend 2 Networking Events',
            description: 'Build professional connections',
            category: 'networking' as const,
            current: 0,
            target: 2,
            progress: calculateProgress(0, 2),
            deadline: new Date(2025, 3, 25),
            isCompleted: false,
            isApproved: false,
            isRejected: false,
            isAIGenerated: true,
            priority: 'low'
          },
          {
            id: 'fallback-4',
            title: 'Learn 1 New Skill',
            description: 'Master React hooks',
            category: 'skills' as const,
            current: 0,
            target: 1,
            progress: calculateProgress(0, 1),
            deadline: new Date(2025, 3, 30),
            isCompleted: false,
            isApproved: false,
            isRejected: false,
            isAIGenerated: true,
            priority: 'medium'
          }
        ];
        setMonthlyGoals(prevGoals => {
          const approvedGoalsOnly = prevGoals.filter(goal => goal.isApproved);
          const updatedGoals = [...approvedGoalsOnly, ...fallbackGoals];
          return updatedGoals.sort((a, b) => categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category));
        });
      }
    } finally {
      setIsFetchingNewGoals(false);
      setShowContextModal(false);
    }
  };

  const handleApproveGoal = (goalId: string) => {
    setMonthlyGoals(prevGoals =>
      prevGoals.map(goal =>
        goal.id === goalId ? { ...goal, isApproved: true, isRejected: false } : goal
      ).sort((a, b) => categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category))
    );
    addStatusUpdate("Approved!", goalId);
  };

  const handleRejectGoal = (goalId: string) => {
    setMonthlyGoals(prevGoals =>
      prevGoals.map(goal =>
        goal.id === goalId ? { ...goal, isRejected: true } : goal
      ).filter(goal => !goal.isRejected)
        .sort((a, b) => categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category))
    );
    addStatusUpdate("Rejected", goalId);
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
      isApproved: true,
      isRejected: false,
      isAIGenerated: false,
      priority: newGoal.priority
    };
    setMonthlyGoals(prevGoals => {
      const existingIds = new Set(prevGoals.map(g => g.id));
      if (existingIds.has(newGoalData.id)) return prevGoals;
      const updatedGoals = [...prevGoals, newGoalData];
      return updatedGoals.sort((a, b) => categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category));
    });
    setNewGoal({ title: '', description: '', category: 'applications', current: 0, target: 1, deadline: '', priority: 'medium' });
    setShowAddModal(false);
    addStatusUpdate("Goal Added!", newGoalData.id);
  };

  const handleIncrementProgress = (goalId: string) => {
    setMonthlyGoals(prevGoals => {
      return prevGoals.map(goal => {
        if (goal.id === goalId && !goal.isCompleted && goal.current < goal.target) {
          const newCurrent = goal.current + 1;
          const newProgress = calculateProgress(newCurrent, goal.target);
          const isCompleted = newCurrent >= goal.target;
          if (isCompleted) {
            addStatusUpdate(`Completed!`, goalId);
            triggerConfetti();
          } else {
            addStatusUpdate(`Progress +1`, goalId);
          }
          return { ...goal, current: newCurrent, progress: newProgress, isCompleted };
        }
        return goal;
      });
    });
  };

  const handleDecrementProgress = (goalId: string) => {
    setMonthlyGoals(prevGoals =>
      prevGoals.map(goal => {
        if (goal.id === goalId && !goal.isCompleted && goal.current > 0) {
          const newCurrent = goal.current - 1;
          const newProgress = calculateProgress(newCurrent, goal.target);
          addStatusUpdate(`Progress -1`, goalId);
          return { ...goal, current: newCurrent, progress: newProgress, isCompleted: false };
        }
        return goal;
      })
    );
  };

  const handleMarkComplete = (goalId: string) => {
    setMonthlyGoals(prevGoals =>
      prevGoals.map(goal => {
        if (goal.id === goalId && !goal.isCompleted) {
          addStatusUpdate(`Marked Complete!`, goalId);
          triggerConfetti();
          return { ...goal, isCompleted: true, current: goal.target, progress: 100 };
        }
        return goal;
      })
    );
  };

  const handleDeleteGoal = (goalId: string) => {
    setMonthlyGoals(prev => prev.filter(goal => goal.id !== goalId));
    addStatusUpdate("Deleted", goalId);
  };

  const toggleCategoryCollapse = (category: string) => {
    setCollapsedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) newSet.delete(category);
      else newSet.add(category);
      return newSet;
    });
  };

  const handleFormKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleAddGoal();
  };

  const handleContextKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') generateGoalsFromOpenAI();
  };

  const getFormPlaceholder = (field: keyof NewGoalForm): string => {
    switch (newGoal.category) {
      case 'applications': return field === 'title' ? 'Apply to 5 jobs' : 'Focus on tech roles';
      case 'interviews': return field === 'title' ? 'Schedule 3 interviews' : 'Prepare for technical questions';
      case 'networking': return field === 'title' ? 'Attend 2 events' : 'Meet industry professionals';
      case 'skills': return field === 'title' ? 'Learn 1 new skill' : 'Practice React hooks';
      default: return field === 'title' ? 'Set a goal' : 'Add details';
    }
  };

  // Filter goals based on search query
  const filteredGoals = monthlyGoals
    .filter(goal =>
      filter === 'all' ? true : filter === 'active' ? !goal.isCompleted : goal.isCompleted
    )
    .filter(goal => !goal.isRejected)
    .filter(goal =>
      searchQuery === '' ||
      goal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      goal.description.toLowerCase().includes(searchQuery.toLowerCase())
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
      default: return <Target size={16} aria-label="Default" />;
    }
  };

  const getProgressColor = (progress: number): string => {
    if (progress >= 100) return 'var(--accent-success)';
    if (progress >= 60) return 'var(--accent-blue)';
    if (progress >= 30) return 'var(--accent-orange)';
    return 'var(--accent-red)';
  };

  const hasGlobalUpdate = statusUpdates.some(update => !update.goalId);

  return (
    <section className="goals-section reveal-element" aria-label="Goals and Milestones">
      <CardHeader
        title={
          <div className="header-title-wrapper">
            <span className={hasGlobalUpdate ? 'pulsing' : ''}>Goals & Milestones</span>
            {statusUpdates.filter(update => !update.goalId).map(update => (
              <span key={update.id} className="global-status-text" role="status">
                {update.message}
                <div className="button-shine"></div>
              </span>
            ))}
          </div>
        }
        subtitle="Track your job search progress and achievements"
        accentColor="var(--accent-yellow)"
        variant="default"
      >
        <div className="header-actions">
          <button
            className="refresh-goals-btn"
            onClick={() => setShowContextModal(true)} // Open context modal instead of direct generation
            title="Refresh AI-generated goals with context"
            aria-label="Refresh goals with context"
            disabled={isFetchingNewGoals}
          >
            <TrendingUp size={18} />
            <span className="btn-text">Refresh Goals</span>
          </button>
          <button
            className="add-goal-btn"
            onClick={() => setShowAddModal(true)}
            aria-label="Add new goal"
          >
            <PlusCircle size={18} />
            <span className="btn-text">Add Goal</span>
          </button>
        </div>
      </CardHeader>

      <>
        {error && <div className="error-message" role="alert">{error}</div>}

        {/* Add Goal Modal */}
        <Modal
          isOpen={showAddModal}
          onClose={() => { setShowAddModal(false); setFormError(''); }}
          title="Add New Goal"
          footer={
            <div className="form-actions">
              <button className="form-save-btn" onClick={handleAddGoal} aria-label="Save new goal">Save Goal</button>
              <button className="form-cancel-btn" onClick={() => { setShowAddModal(false); setFormError(''); }} aria-label="Cancel">Cancel</button>
            </div>
          }
        >
          <div className="form-container">
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                id="title"
                type="text"
                placeholder={getFormPlaceholder('title')}
                value={newGoal.title}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setNewGoal({ ...newGoal, title: e.target.value })}
                onKeyDown={handleFormKeyDown}
                aria-required="true"
                className={newGoal.title ? '' : 'invalid'}
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <input
                id="description"
                type="text"
                placeholder={getFormPlaceholder('description')}
                value={newGoal.description}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setNewGoal({ ...newGoal, description: e.target.value })}
                onKeyDown={handleFormKeyDown}
              />
            </div>
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                value={newGoal.category}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setNewGoal({ ...newGoal, category: e.target.value as MonthlyGoal['category'] })}
                aria-label="Goal category"
              >
                {categoryOrder.map(cat => (
                  <option key={cat} value={cat}>{getCategoryLabel(cat)}</option>
                ))}
              </select>
            </div>
            <div className="form-group inline-group">
              <div>
                <label htmlFor="current">Current</label>
                <input
                  id="current"
                  type="number"
                  placeholder="e.g., 0"
                  value={newGoal.current}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setNewGoal({ ...newGoal, current: parseInt(e.target.value) || 0 })}
                  onKeyDown={handleFormKeyDown}
                  min="0"
                />
              </div>
              <div>
                <label htmlFor="target">Target</label>
                <input
                  id="target"
                  type="number"
                  placeholder="e.g., 5"
                  value={newGoal.target}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setNewGoal({ ...newGoal, target: parseInt(e.target.value) || 1 })}
                  onKeyDown={handleFormKeyDown}
                  min="1"
                  className={newGoal.target > 0 ? '' : 'invalid'}
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="deadline">Deadline</label>
              <input
                id="deadline"
                type="date"
                value={newGoal.deadline}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                onKeyDown={handleFormKeyDown}
                aria-required="true"
                className={newGoal.deadline ? '' : 'invalid'}
              />
            </div>
            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                value={newGoal.priority}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setNewGoal({ ...newGoal, priority: e.target.value as MonthlyGoal['priority'] ?? 'low' })}
                aria-label="Goal priority"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            {formError && <span className="form-error" role="alert">{formError}</span>}
          </div>
        </Modal>

        {/* Context Modal */}
        <Modal
          isOpen={showContextModal}
          onClose={() => setShowContextModal(false)}
          title="Provide Context for New Goals"
          footer={
            <div className="form-actions">
              <button
                className="form-save-btn"
                onClick={() => generateGoalsFromOpenAI()}
                aria-label="Generate goals with context"
                disabled={isFetchingNewGoals}
              >
                Generate Goals
              </button>
              <button
                className="form-cancel-btn"
                onClick={() => setShowContextModal(false)}
                aria-label="Cancel"
              >
                Cancel
              </button>
            </div>
          }
        >
          <div className="form-container">
            <div className="form-group">
              <label htmlFor="goal-context">What’s your goal context?</label>
              <input
                id="goal-context"
                type="text"
                placeholder="e.g., I want a job that pays more"
                value={goalContext}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setGoalContext(e.target.value)}
                onKeyDown={handleContextKeyDown}
                aria-label="Goal context input"
              />
              <p className="context-hint">Optional: Add context to tailor AI-generated goals.</p>
            </div>
          </div>
        </Modal>

        {/* Search Bar and Controls */}
        <div className="goals-controls reveal-element">
          <div className="search-bar">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search goals..."
              value={searchQuery}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              aria-label="Search goals"
            />
          </div>
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
            <button className="sort-btn" aria-label="Sort options (not implemented)" onClick={() => alert('Sort functionality coming soon')}>
              <span>Sort By</span>
              <ChevronDown size={14} />
            </button>
          </div>
        </div>

        <div className="goals-grid reveal-element" aria-live="polite">
          {categoryOrder.map(category => {
            const goals = goalsByCategory[category] || [];
            const isCollapsed = collapsedCategories.has(category);
            return (
              <div key={category} className="category-section">
                <div
                  className="category-header"
                  onClick={() => toggleCategoryCollapse(category)}
                  role="button"
                  aria-expanded={!isCollapsed}
                  aria-label={`Toggle ${getCategoryLabel(category)} category`}
                >
                  <div className="category-icon" style={{ backgroundColor: `${getCategoryColor(category)}20`, color: getCategoryColor(category) }}>
                    {getCategoryIcon(category)}
                  </div>
                  <h3 className="category-title">{getCategoryLabel(category)}</h3>
                  <div className="category-count">
                    {isFetchingNewGoals ? goals.length + 1 : goals.length}
                  </div>
                  <ChevronRight size={16} className={`collapse-icon ${isCollapsed ? '' : 'expanded'}`} />
                </div>
                {!isCollapsed && (
                  <div className="goals-list">
                    {goals.map(goal => (
                      <div
                        key={goal.id}
                        className={`goal-card ${goal.isCompleted ? 'completed' : ''} ${goal.isApproved ? 'approved' : 'pending'}`}
                        onClick={() => setSelectedGoal(goal)}
                        tabIndex={0}
                        role="button"
                        aria-label={`View details for ${goal.title}`}
                      >
                        <div className="status-updates">
                          {statusUpdates.filter(update => update.goalId === goal.id).map(update => (
                            <div key={update.id} className="status-bubble" role="status">
                              {update.message}
                            </div>
                          ))}
                        </div>
                        {!goal.isApproved && !goal.isRejected && goal.isAIGenerated && (
                          <div className="pending-banner" aria-label="AI suggested">
                            AI Suggested
                          </div>
                        )}
                        <div className="goal-header">
                          <h4 className="goal-title">
                            {goal.priority && (
                              <span className="priority-dot" style={{ backgroundColor: getPriorityColor(goal.priority) }} />
                            )}
                            {goal.title}
                          </h4>
                          <button className="action-button" aria-label="More options" onClick={() => alert('More options coming soon')}>
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
                          <div className={`goal-deadline ${isDeadlineNear(goal.deadline) ? 'near-deadline' : ''}`}>
                            <Calendar size={14} className="deadline-icon" aria-hidden="true" />
                            <span>Due {formatDate(goal.deadline)}</span>
                          </div>
                          <div className="goal-actions">
                            {!goal.isApproved && !goal.isRejected && (
                              <>
                                <button
                                  className="action-icon-btn approve"
                                  title="Approve this goal"
                                  onClick={(e) => { e.stopPropagation(); handleApproveGoal(goal.id); }}
                                  aria-label={`Approve ${goal.title}`}
                                >
                                  <CheckCircle size={14} />
                                </button>
                                <button
                                  className="action-icon-btn reject"
                                  title="Reject this goal"
                                  onClick={(e) => { e.stopPropagation(); handleRejectGoal(goal.id); }}
                                  aria-label={`Reject ${goal.title}`}
                                >
                                  <XCircle size={14} />
                                </button>
                              </>
                            )}
                            {goal.isApproved && !goal.isCompleted ? (
                              <>
                                <button
                                  className="action-icon-btn"
                                  title="Decrease progress"
                                  onClick={(e) => { e.stopPropagation(); handleDecrementProgress(goal.id); }}
                                  aria-label={`Decrease progress for ${goal.title}`}
                                  disabled={goal.current === 0}
                                >
                                  <Minus size={14} />
                                </button>
                                <button
                                  className="action-icon-btn"
                                  title="Increase progress"
                                  onClick={(e) => { e.stopPropagation(); handleIncrementProgress(goal.id); }}
                                  aria-label={`Increase progress for ${goal.title}`}
                                  disabled={goal.current >= goal.target}
                                >
                                  <Plus size={14} />
                                </button>
                                <button
                                  className="action-icon-btn"
                                  title="Mark as complete"
                                  onClick={(e) => { e.stopPropagation(); handleMarkComplete(goal.id); }}
                                  aria-label={`Mark ${goal.title} as complete`}
                                >
                                  <CheckCircle size={14} />
                                </button>
                              </>
                            ) : goal.isCompleted && (
                              <button
                                className="action-icon-btn delete"
                                title="Delete goal"
                                onClick={(e) => { e.stopPropagation(); handleDeleteGoal(goal.id); }}
                                aria-label={`Delete ${goal.title}`}
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {isFetchingNewGoals && categoryOrder.includes(category) && (
                      <div className="goal-card skeleton" aria-hidden="true">
                        <div className="skeleton-banner"></div>
                        <div className="goal-header">
                          <div className="skeleton-title"></div>
                          <div className="skeleton-action"></div>
                        </div>
                        <div className="skeleton-description"></div>
                        <div className="goal-progress">
                          <div className="progress-info">
                            <div className="skeleton-numbers"></div>
                            <div className="skeleton-percentage"></div>
                          </div>
                          <div className="skeleton-progress-bar"></div>
                        </div>
                        <div className="goal-footer">
                          <div className="skeleton-deadline"></div>
                          <div className="skeleton-actions"></div>
                        </div>
                      </div>
                    )}
                    <button
                      className="add-category-goal"
                      onClick={() => setShowAddModal(true)}
                      aria-label={`Add new ${getCategoryLabel(category)} goal`}
                    >
                      <PlusCircle size={16} />
                      <span>Add {getCategoryLabel(category)} Goal</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          {Object.keys(goalsByCategory).length === 0 && !isFetchingNewGoals && (
            <div className="empty-state" role="alert">
              <Target size={48} className="empty-icon" aria-hidden="true" />
              <h3>No goals found</h3>
              <p>No goals match your current filter or search criteria</p>
              <button className="reset-filter-btn" onClick={() => { setFilter('all'); setSearchQuery(''); }} aria-label="Reset filters and search">
                Reset Filters
              </button>
            </div>
          )}
        </div>
        <button
          className="fab-add-goal"
          onClick={() => setShowAddModal(true)}
          aria-label="Quick add new goal"
        >
          <PlusCircle size={24} />
        </button>
      </>

      <style jsx>{`
        .goals-section { display: flex; flex-direction: column; gap: 24px; position: relative; }
        .header-actions { display: flex; gap: 12px; }
        .refresh-goals-btn, .add-goal-btn { display: flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: var(--border-radius); font-size: 14px; font-weight: 500; cursor: pointer; transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .refresh-goals-btn { background: var(--glass-bg); color: var(--text-primary); border: 1px solid var(--border-thin); }
        .refresh-goals-btn:hover:not(:disabled) { transform: scale(1.05); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); border-color: var(--accent-yellow); }
        .refresh-goals-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .add-goal-btn { background: var(--accent-yellow); color: white; border: none; box-shadow: 0 2px 6px rgba(var(--accent-yellow-rgb), 0.25); }
        .add-goal-btn:hover { transform: scale(1.05); box-shadow: 0 4px 12px rgba(var(--accent-yellow-rgb), 0.3); }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes slideDown { from { transform: translateY(0); opacity: 1; } to { transform: translateY(20px); opacity: 0; } }
        @keyframes approvalFlash { 0% { border-color: var(--accent-success); } 100% { border-color: var(--accent-success); } }
        @keyframes progressPulse { 0% { transform: scale(1); box-shadow: 0 0 8px rgba(255, 255, 255, 0.5); } 50% { transform: scale(1.02); box-shadow: 0 0 12px rgba(255, 255, 255, 0.7); } 100% { transform: scale(1); box-shadow: 0 0 8px rgba(255, 255, 255, 0.5); } }
        @keyframes completionGlow { 0% { opacity: 0.9; } 100% { opacity: 0.7; } }
        @keyframes pendingNudge { 0% { transform: translateX(-50%) translateY(0); } 50% { transform: translateX(-50%) translateY(-2px); } 100% { transform: translateX(-50%) translateY(0); } }
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(150%); } }
        @keyframes bubbleFade { 0% { opacity: 0; transform: translateY(10px) scale(0.8); } 20% { opacity: 1; transform: translateY(0) scale(1); } 80% { opacity: 1; transform: translateY(0) scale(1); } 100% { opacity: 0; transform: translateY(-10px) scale(0.8); } }
        @keyframes pulseUnderline { 0% { box-shadow: 0 2px 0 var(--accent-yellow); } 50% { box-shadow: 0 4px 0 var(--accent-yellow); } 100% { box-shadow: 0 2px 0 var(--accent-yellow); } }
        @keyframes statusTextFade { 0% { opacity: 0; transform: translateX(10px); } 20% { opacity: 1; transform: translateX(0); } 80% { opacity: 1; transform: translateX(0); } 100% { opacity: 0; transform: translateX(-10px); } }
        .header-title-wrapper { display: flex; align-items: center; gap: 8px; position: relative; }
        .pulsing { position: relative; animation: pulseUnderline 1s ease-in-out infinite; }
        .global-status-text {
          font-size: 14px;
          color: var(--text-secondary);
          animation: statusTextFade 2s ease-in-out forwards;
          margin-left: 8px;
          position: relative;
          overflow: hidden;
          display: inline-block;
        }
        .global-status-text .button-shine {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transform: skewX(-20deg);
          animation: shimmer 1s ease-in-out forwards;
          z-index: 0;
          pointer-events: none;
        }
        .error-message { padding: 12px 16px; background: rgba(var(--accent-red-rgb), 0.1); color: var(--accent-red); border-radius: var(--border-radius); border: 1px solid var(--accent-red); margin-bottom: 16px; font-size: 14px; animation: fadeIn 0.3s ease-in; }
        .form-container { display: flex; flex-direction: column; gap: 16px; }
        .form-group { display: flex; flex-direction: column; gap: 6px; }
        .form-group label { font-size: 14px; font-weight: 500; color: var(--text-primary); }
        .form-group input, .form-group select {
          padding: 10px 12px;
          border-radius: var(--border-radius);
          border: 1px solid var(--border-thin);
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-primary);
          font-size: 14px;
          transition: all 0.2s ease;
          width: 100%;
          box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .form-group input:focus, .form-group select:focus {
          border-color: var(--accent-yellow);
          box-shadow: 0 0 6px rgba(var(--accent-yellow-rgb), 0.3);
          outline: none;
        }
        .form-group input.invalid { border-color: var(--accent-red); box-shadow: 0 0 6px rgba(var(--accent-red-rgb), 0.3); }
        .form-group.inline-group { flex-direction: row; gap: 16px; }
        .form-group.inline-group > div { flex: 1; display: flex; flex-direction: column; gap: 6px; }
        .form-error { color: var(--accent-red); font-size: 12px; font-weight: 500; margin-top: 4px; }
        .context-hint { font-size: 12px; color: var(--text-secondary); margin-top: 4px; }
        .form-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 12px; }
        .form-save-btn, .form-cancel-btn {
          padding: 10px 20px;
          border-radius: var(--border-radius);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .form-save-btn {
          background: var(--accent-yellow);
          color: white;
          border: none;
          box-shadow: 0 2px 6px rgba(var(--accent-yellow-rgb), 0.25);
        }
        .form-save-btn:hover:not(:disabled) {
          transform: scale(1.05);
          background: var(--accent-yellow-dark);
          box-shadow: 0 4px 12px rgba(var(--accent-yellow-rgb), 0.3);
        }
        .form-save-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .form-cancel-btn {
          background: var(--glass-bg);
          color: var(--text-primary);
          border: 1px solid var(--border-thin);
        }
        .form-cancel-btn:hover {
          transform: scale(1.05);
          background: var(--active-bg);
          border-color: var(--border-hover);
        }
        .goals-controls { display: flex; flex-direction: column; gap: 16px; margin-bottom: 8px; }
        .search-bar {
          position: relative;
          display: flex;
          align-items: center;
          background: var(--glass-bg);
          border: 1px solid var(--border-thin);
          border-radius: var(--border-radius);
          padding: 8px;
          width: 100%;
          max-width: 400px;
        }
        .search-bar input {
          border: none;
          background: transparent;
          color: var(--text-primary);
          font-size: 14px;
          width: 100%;
          padding-left: 8px;
          outline: none;
        }
        .search-bar input::placeholder { color: var(--text-tertiary); }
        .search-icon { color: var(--text-secondary); }
        .filter-tabs { display: flex; background: var(--glass-bg); border-radius: var(--border-radius); padding: 4px; border: 1px solid var(--border-thin); box-shadow: var(--shadow-sharp); }
        .filter-tab { padding: 8px 16px; border-radius: var(--border-radius-sm); border: none; background: transparent; color: var(--text-secondary); font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s ease; }
        .filter-tab:hover { color: var(--text-primary); background: var(--hover-bg); transform: scale(1.05); }
        .filter-tab.active { background: var(--active-bg); color: var(--accent-yellow); }
        .view-options { display: flex; align-items: center; gap: 12px; align-self: flex-end; }
        .sort-btn { display: flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: var(--border-radius); border: 1px solid var(--border-thin); background: var(--glass-bg); color: var(--text-primary); font-size: 14px; cursor: pointer; transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .sort-btn:hover { transform: scale(1.05); box-shadow: 0 2px 6px rgba(var(--accent-yellow-rgb), 0.15); border-color: var(--accent-yellow); }
        .goals-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; position: relative; }
        .category-section { display: flex; flex-direction: column; gap: 16px; }
        .category-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid var(--border-divider);
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .category-header:hover { background: rgba(255, 255, 255, 0.05); }
        .category-icon { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: var(--border-radius); transition: transform 0.2s ease; }
        .category-icon:hover { transform: scale(1.1); }
        .category-title { font-size: 16px; font-weight: 600; color: var(--text-primary); margin: 0; flex: 1; }
        .category-count { background: var(--glass-bg); color: var(--text-secondary); font-size: 13px; font-weight: 500; padding: 2px 8px; border-radius: 12px; border: 1px solid var(--border-thin); }
        .collapse-icon { transition: transform 0.3s ease; }
        .collapse-icon.expanded { transform: rotate(90deg); }
        .goals-list { display: flex; flex-direction: column; gap: 16px; animation: slideIn 0.3s ease-out; }
        .goal-card {
          position: relative;
          background: transparent;
          border: none;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: transform 0.2s ease, background 0.2s ease;
        }
        .goal-card:hover { transform: translateY(-2px); background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02)); }
        .goal-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(120deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0) 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
          z-index: 0;
        }
        .goal-card:hover::before { opacity: 1; }
        .goal-card:focus { outline: 2px solid var(--accent-yellow); outline-offset: 2px; }
        .goal-card.completed { opacity: 0.7; animation: completionGlow 0.8s ease-out; }
        .goal-card.approved { border-left: 4px solid var(--accent-success); animation: approvalFlash 0.4s ease-out; }
        .goal-card.pending { border-left: 4px solid var(--accent-cyan); }
        .goal-card.skeleton { background: transparent; border: none; position: relative; overflow: hidden; }
        .goal-card.skeleton::after { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0) 100%); transform: translateX(-100%); animation: shimmer 1.5s infinite ease-in-out; z-index: 2; }
        .pending-banner { position: absolute; top: -10px; left: 50%; transform: translateX(-50%); background: var(--accent-cyan); color: white; font-size: 12px; padding: 2px 8px; border-radius: 12px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); transition: transform 0.2s ease; z-index: 3; }
        .pending-banner:hover { animation: pendingNudge 0.4s ease; }
        .status-updates { position: absolute; top: 8px; right: 8px; display: flex; flex-direction: column; gap: 4px; z-index: 4; }
        .status-bubble { padding: 4px 8px; background: rgba(0, 0, 0, 0.7); color: white; font-size: 12px; border-radius: 12px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); animation: bubbleFade 2s ease-in-out forwards; }
        .skeleton-banner { width: 80px; height: 16px; background: var(--border-thin); border-radius: 12px; position: relative; z-index: 3; }
        .skeleton-title { width: 70%; height: 16px; background: var(--border-thin); border-radius: 4px; position: relative; z-index: 3; }
        .skeleton-action { width: 28px; height: 28px; background: var(--border-thin); border-radius: 50%; position: relative; z-index: 3; }
        .skeleton-description { width: 90%; height: 14px; background: var(--border-thin); border-radius: 4px; position: relative; z-index: 3; }
        .skeleton-numbers { width: 50px; height: 14px; background: var(--border-thin); border-radius: 4px; position: relative; z-index: 3; }
        .skeleton-percentage { width: 30px; height: 14px; background: var(--border-thin); border-radius: 4px; position: relative; z-index: 3; }
        .skeleton-progress-bar { width: 100%; height: 8px; background: var(--border-thin); border-radius: 4px; position: relative; z-index: 3; }
        .skeleton-deadline { width: 80px; height: 13px; background: var(--border-thin); border-radius: 4px; position: relative; z-index: 3; }
        .skeleton-actions { width: 80px; height: 26px; background: var(--border-thin); border-radius: 50px; position: relative; z-index: 3; }
        .goal-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; position: relative; z-index: 1; }
        .goal-title { margin: 0; font-size: 16px; font-weight: 600; color: var(--text-primary); line-height: 1.4; display: flex; align-items: center; gap: 6px; }
        .priority-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
        .action-button { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; background: transparent; border: none; color: var(--text-tertiary); cursor: pointer; border-radius: 50%; padding: 0; transition: transform 0.2s ease, background 0.2s ease; }
        .action-button:hover { transform: scale(1.1); background: var(--hover-bg); color: var(--text-primary); }
        .goal-description { margin: 0; font-size: 14px; color: var(--text-secondary); line-height: 1.4; position: relative; z-index: 1; }
        .goal-progress { display: flex; flex-direction: column; gap: 6px; position: relative; z-index: 1; }
        .progress-info { display: flex; justify-content: space-between; align-items: center; }
        .progress-numbers { display: flex; align-items: center; gap: 4px; font-size: 14px; }
        .progress-numbers .current { font-weight: 600; color: var(--text-primary); }
        .progress-numbers .separator, .progress-numbers .target { color: var(--text-secondary); }
        .progress-percentage { font-size: 14px; font-weight: 600; color: var(--text-primary); }
        .progress-bar-container { height: 8px; background: var(--hover-bg); border-radius: 4px; overflow: hidden; position: relative; }
        .progress-bar {
          height: 100%;
          border-radius: 4px;
          transition: width 0.6s ease-out;
          position: relative;
          box-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
        }
        .progress-bar.updated { animation: progressPulse 0.6s ease-out; }
        .progress-check { position: absolute; right: 2px; top: 50%; transform: translateY(-50%); color: white; }
        .goal-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-divider); padding-top: 12px; margin-top: 4px; position: relative; z-index: 1; }
        .goal-deadline { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--text-tertiary); }
        .goal-deadline.near-deadline { color: var(--accent-red); }
        .deadline-icon { color: var(--text-tertiary); }
        .goal-deadline.near-deadline .deadline-icon { color: var(--accent-red); }
        .goal-actions { display: flex; gap: 8px; }
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
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .action-icon-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .action-icon-btn:hover:not(:disabled) {
          transform: scale(1.1);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
        }
        .action-icon-btn.approve { background: rgba(var(--accent-success-rgb), 0.1); }
        .action-icon-btn.approve:hover:not(:disabled) { color: var(--accent-success); border-color: var(--accent-success); background: rgba(var(--accent-success-rgb), 0.2); }
        .action-icon-btn.reject { background: rgba(var(--accent-red-rgb), 0.1); }
        .action-icon-btn.reject:hover:not(:disabled) { color: var(--accent-red); border-color: var(--accent-red); background: rgba(var(--accent-red-rgb), 0.2); }
        .action-icon-btn.delete:hover:not(:disabled) { color: var(--accent-red); border-color: var(--accent-red); }
        .add-category-goal { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 10px; border-radius: var(--border-radius); border: 1px dashed var(--border-divider); background: var(--hover-bg); color: var(--text-secondary); font-size: 14px; cursor: pointer; transition: transform 0.2s ease, background 0.2s ease; }
        .add-category-goal:hover { transform: scale(1.05); background: var(--active-bg); color: var(--text-primary); border-color: var(--border-hover); }
        .empty-state { grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 64px; text-align: center; color: var(--text-tertiary); gap: 16px; background: var(--glass-card-bg); border-radius: var(--border-radius); border: 1px solid var(--border-thin); animation: fadeIn 0.5s ease-in; }
        .empty-icon { opacity: 0.5; }
        .empty-state h3 { margin: 0; font-size: 18px; color: var(--text-secondary); }
        .empty-state p { margin: 0; font-size: 14px; }
        .reset-filter-btn { margin-top: 16px; padding: 8px 16px; border-radius: var(--border-radius); background: var(--accent-yellow); color: white; border: none; font-size: 14px; font-weight: 500; cursor: pointer; transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .reset-filter-btn:hover { transform: scale(1.05); box-shadow: 0 4px 12px rgba(var(--accent-yellow-rgb), 0.3); }
        .fab-add-goal {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: var(--accent-yellow);
          color: white;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          z-index: 100;
        }
        .fab-add-goal:hover { transform: scale(1.1); box-shadow: 0 4px 12px rgba(var(--accent-yellow-rgb), 0.3); }
        @media (max-width: 768px) {
          .header-actions { flex-direction: column; width: 100%; }
          .refresh-goals-btn, .add-goal-btn { width: 100%; justify-content: center; }
          .goals-controls { flex-direction: column; align-items: stretch; }
          .search-bar { max-width: 100%; }
          .filter-tabs { overflow-x: auto; }
          .view-options { align-self: flex-end; }
          .goals-grid { grid-template-columns: 1fr; }
          .form-group.inline-group { flex-direction: column; gap: 16px; }
          .pending-banner, .status-bubble { font-size: 10px; padding: 2px 6px; }
          .header-title-wrapper { flex-direction: column; align-items: flex-start; gap: 4px; }
          .global-status-text { margin-left: 0; }
          .fab-add-goal { bottom: 10px; right: 10px; width: 48px; height: 48px; }
        }
      `}</style>
    </section>
  );
}
