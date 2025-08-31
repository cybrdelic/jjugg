/**
 * Data Service Layer for Job Tracker App
 * Manages all data operations with persistence
 */

import type {
  Activity,
  Application,
  ApplicationStage,
  AppStats,
  Company,
  MonthlyGoal,
  Reminder,
  ReminderPriority,
  ReminderStatus,
  UpcomingEvent,
} from "../types";
import { createLogger } from "./logger";
import { isValidData, migrateData, storage, STORAGE_KEYS } from "./storage";

const logger = createLogger("dataService");

// Default empty data for new users
const defaultApplications: Application[] = [];
const defaultCompanies: Company[] = [];
const defaultActivities: Activity[] = [];
const defaultUpcomingEvents: UpcomingEvent[] = [];
const defaultReminders: Reminder[] = [];

// Default user profile
const defaultUserProfile = {
  id: "user-1",
  name: "Job Seeker",
  email: "user@example.com",
  avatar: "/avatar.jpg",
  jobTitle: "Software Developer",
  yearsExperience: 0,
  location: "",
  skills: [],
  salary: {
    min: 0,
    max: 0,
    currency: "USD",
  },
};

// Default monthly goals
const defaultMonthlyGoals: MonthlyGoal[] = [
  {
    id: "goal1",
    goal: "Submit 10 Applications",
    current: 0,
    target: 10,
    progress: 0,
    category: "applications",
  },
  {
    id: "goal2",
    goal: "Network with 5 Contacts",
    current: 0,
    target: 5,
    progress: 0,
    category: "networking",
  },
  {
    id: "goal3",
    goal: "Complete 3 Assessments",
    current: 0,
    target: 3,
    progress: 0,
    category: "skills",
  },
];

// Default stats
const defaultAppStats: AppStats = {
  totalApplications: 0,
  stageCount: {
    applied: 0,
    screening: 0,
    interview: 0,
    offer: 0,
    rejected: 0,
  },
  interviewsScheduled: 0,
  successRate: 0,
  tasksdue: 0,
  activeApplications: 0,
};

// Base data service interface
interface DataService<T> {
  getAll(): T[];
  getById(id: string): T | null;
  create(item: Omit<T, "id">): T;
  update(id: string, updates: Partial<T>): T | null;
  delete(id: string): boolean;
}

// Generic CRUD operations
class BaseDataService<T extends { id: string }> implements DataService<T> {
  constructor(
    private storageKey: string,
    private defaultData: T[],
    private validator: (data: any) => boolean,
    private migrator?: (data: any[]) => any[]
  ) {}

  getAll(): T[] {
    try {
      let data = storage.get<T[]>(this.storageKey);

      // If no data exists, initialize with default data
      if (!data || !Array.isArray(data) || data.length === 0) {
        data = [...this.defaultData];
        this.saveAll(data);
      }

      // Apply migrations if needed
      if (this.migrator && data.length > 0) {
        data = this.migrator(data);
        this.saveAll(data);
      }

      // Validate data
      data = data.filter(this.validator);

      return data;
    } catch (error) {
      console.error(`Error loading ${this.storageKey}:`, error);
      return [...this.defaultData];
    }
  }

  getById(id: string): T | null {
    const items = this.getAll();
    return items.find((item) => item.id === id) || null;
  }

  create(item: Omit<T, "id">): T {
    const newItem = {
      ...item,
      id: this.generateId(),
    } as T;

    const items = this.getAll();
    items.push(newItem);
    this.saveAll(items);

    return newItem;
  }

  update(id: string, updates: Partial<T>): T | null {
    const items = this.getAll();
    const index = items.findIndex((item) => item.id === id);

    if (index === -1) return null;

    const updatedItem = { ...items[index], ...updates };
    items[index] = updatedItem;
    this.saveAll(items);

    return updatedItem;
  }

  delete(id: string): boolean {
    const items = this.getAll();
    const initialLength = items.length;
    const filteredItems = items.filter((item) => item.id !== id);

    if (filteredItems.length < initialLength) {
      this.saveAll(filteredItems);
      return true;
    }

    return false;
  }

  private saveAll(items: T[]): void {
    storage.set(this.storageKey, items);
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Application-specific services
class ApplicationService extends BaseDataService<Application> {
  constructor() {
    super(
      STORAGE_KEYS.APPLICATIONS,
      defaultApplications,
      isValidData.application,
      migrateData.applications
    );
  }

  getByStage(stage: ApplicationStage): Application[] {
    return this.getAll().filter((app) => app.stage === stage);
  }

  getByCompany(companyId: string): Application[] {
    return this.getAll().filter((app) => app.company.id === companyId);
  }

  updateStage(id: string, stage: ApplicationStage): Application | null {
    const app = this.update(id, { stage });
    if (app) {
      // Add activity when stage changes
      activityService.addStageChangeActivity(app, stage);
    }
    return app;
  }

  getUpcomingInterviews(): Application[] {
    return this.getAll().filter(
      (app) =>
        app.interviews &&
        app.interviews.some(
          (interview) => !interview.completed && interview.date > new Date()
        )
    );
  }
}

class CompanyService extends BaseDataService<Company> {
  constructor() {
    super(STORAGE_KEYS.COMPANIES, defaultCompanies, isValidData.company);
  }

  getByIndustry(industry: string): Company[] {
    return this.getAll().filter(
      (company) => company.industry.toLowerCase() === industry.toLowerCase()
    );
  }

  search(query: string): Company[] {
    const lowerQuery = query.toLowerCase();
    return this.getAll().filter(
      (company) =>
        company.name.toLowerCase().includes(lowerQuery) ||
        company.industry.toLowerCase().includes(lowerQuery)
    );
  }
}

class ActivityService extends BaseDataService<Activity> {
  constructor() {
    super(STORAGE_KEYS.ACTIVITIES, defaultActivities, isValidData.activity);
  }

  getRecent(limit: number = 10): Activity[] {
    return this.getAll()
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  getByType(type: string): Activity[] {
    return this.getAll().filter((activity) => activity.type === type);
  }

  addApplicationActivity(application: Application): Activity {
    return this.create({
      type: "application",
      title: "Job Application Submitted",
      application,
      company: application.company,
      timestamp: new Date(),
      details: `Applied for ${application.position} at ${application.company.name}`,
    });
  }

  addStageChangeActivity(
    application: Application,
    newStage: ApplicationStage
  ): Activity {
    const stageLabels = {
      applied: "Applied",
      screening: "Screening",
      interview: "Interview",
      offer: "Offer Received",
      rejected: "Rejected",
    };

    return this.create({
      type:
        newStage === "offer"
          ? "offer"
          : newStage === "rejected"
          ? "rejected"
          : "interview",
      title: `Application ${stageLabels[newStage]}`,
      application,
      company: application.company,
      timestamp: new Date(),
      details: `Application for ${application.position} at ${application.company.name} moved to ${stageLabels[newStage]}`,
    });
  }
}

class EventService extends BaseDataService<UpcomingEvent> {
  constructor() {
    super(
      STORAGE_KEYS.UPCOMING_EVENTS,
      defaultUpcomingEvents,
      isValidData.event
    );
  }

  getUpcoming(limit?: number): UpcomingEvent[] {
    const upcoming = this.getAll()
      .filter((event) => event.date > new Date())
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    return limit ? upcoming.slice(0, limit) : upcoming;
  }

  getToday(): UpcomingEvent[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.getAll().filter(
      (event) => event.date >= today && event.date < tomorrow
    );
  }

  getByType(type: string): UpcomingEvent[] {
    return this.getAll().filter((event) => event.type === type);
  }
}

class GoalService {
  getAll(): MonthlyGoal[] {
    try {
      let goals = storage.get<MonthlyGoal[]>(STORAGE_KEYS.MONTHLY_GOALS);

      if (!goals || !Array.isArray(goals)) {
        goals = [...defaultMonthlyGoals];
        this.saveAll(goals);
      }

      return goals;
    } catch (error) {
      console.error("Error loading goals:", error);
      return [...defaultMonthlyGoals];
    }
  }

  update(id: string, updates: Partial<MonthlyGoal>): MonthlyGoal | null {
    const goals = this.getAll();
    const index = goals.findIndex((goal) => goal.id === id);

    if (index === -1) return null;

    const updatedGoal = { ...goals[index], ...updates };
    goals[index] = updatedGoal;
    this.saveAll(goals);

    return updatedGoal;
  }

  updateProgress(id: string, current: number): MonthlyGoal | null {
    const goal = this.getAll().find((g) => g.id === id);
    if (!goal) return null;

    const progress = Math.min(Math.round((current / goal.target) * 100), 100);
    return this.update(id, { current, progress });
  }

  private saveAll(goals: MonthlyGoal[]): void {
    storage.set(STORAGE_KEYS.MONTHLY_GOALS, goals);
  }
}

class StatsService {
  calculateStats(): AppStats {
    const applications = applicationService.getAll();

    const totalApplications = applications.length;
    const stageCount = {
      applied: applications.filter((app) => app.stage === "applied").length,
      screening: applications.filter((app) => app.stage === "screening").length,
      interview: applications.filter((app) => app.stage === "interview").length,
      offer: applications.filter((app) => app.stage === "offer").length,
      rejected: applications.filter((app) => app.stage === "rejected").length,
    };

    const interviewsScheduled = eventService.getByType("Interview").length;
    const completedApplications = stageCount.offer + stageCount.rejected;
    const successRate =
      completedApplications > 0
        ? Math.round((stageCount.offer / completedApplications) * 100)
        : 0;

    const stats: AppStats = {
      totalApplications,
      stageCount,
      interviewsScheduled,
      successRate,
      tasksdue: eventService.getByType("Task").length,
      activeApplications:
        totalApplications - stageCount.rejected - stageCount.offer,
    };

    // Cache the stats
    storage.set(STORAGE_KEYS.APP_STATS, stats);

    return stats;
  }

  getStats(): AppStats {
    try {
      // Always calculate fresh stats based on current data
      return this.calculateStats();
    } catch (error) {
      console.error("Error calculating stats:", error);
      return defaultAppStats;
    }
  }
}

class UserService {
  getProfile() {
    try {
      let profile = storage.get(STORAGE_KEYS.USER_PROFILE);

      if (!profile) {
        profile = { ...defaultUserProfile };
        this.saveProfile(profile);
      }

      return profile;
    } catch (error) {
      console.error("Error loading user profile:", error);
      return { ...defaultUserProfile };
    }
  }

  updateProfile(updates: any) {
    const profile = this.getProfile();
    const safeProfile = profile && typeof profile === "object" ? profile : {};
    const safeUpdates = updates && typeof updates === "object" ? updates : {};
    const updatedProfile = { ...safeProfile, ...safeUpdates };
    this.saveProfile(updatedProfile);
    return updatedProfile;
  }

  private saveProfile(profile: any): void {
    storage.set(STORAGE_KEYS.USER_PROFILE, profile);
  }
}

class ReminderService extends BaseDataService<Reminder> {
  constructor() {
    super(STORAGE_KEYS.REMINDERS, defaultReminders, isValidData.reminder);
  }

  getByStatus(status: ReminderStatus): Reminder[] {
    return this.getAll().filter((reminder) => reminder.status === status);
  }

  getPending(): Reminder[] {
    return this.getByStatus("pending");
  }

  getCompleted(): Reminder[] {
    return this.getByStatus("completed");
  }

  getByPriority(priority: ReminderPriority): Reminder[] {
    return this.getAll().filter((reminder) => reminder.priority === priority);
  }

  getUpcoming(limit?: number): Reminder[] {
    const upcoming = this.getAll()
      .filter(
        (reminder) =>
          reminder.dueDate > new Date() && reminder.status === "pending"
      )
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

    return limit ? upcoming.slice(0, limit) : upcoming;
  }

  getOverdue(): Reminder[] {
    return this.getAll().filter(
      (reminder) =>
        reminder.dueDate < new Date() && reminder.status === "pending"
    );
  }

  getDueToday(): Reminder[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.getAll().filter(
      (reminder) =>
        reminder.dueDate >= today &&
        reminder.dueDate < tomorrow &&
        reminder.status === "pending"
    );
  }

  getByApplication(applicationId: string): Reminder[] {
    return this.getAll().filter(
      (reminder) => reminder.relatedApplication?.id === applicationId
    );
  }

  markCompleted(id: string): Reminder | null {
    return this.update(id, { status: "completed" });
  }

  markPending(id: string): Reminder | null {
    return this.update(id, { status: "pending" });
  }

  updatePriority(id: string, priority: ReminderPriority): Reminder | null {
    return this.update(id, { priority });
  }
}

// Create service instances
export const applicationService = new ApplicationService();
export const companyService = new CompanyService();
export const activityService = new ActivityService();
export const eventService = new EventService();
export const reminderService = new ReminderService();
export const goalService = new GoalService();
export const statsService = new StatsService();
export const userService = new UserService();

// Data sync utilities
export const syncData = {
  lastSync(): Date | null {
    const timestamp = storage.get<string>(STORAGE_KEYS.LAST_SYNC);
    return timestamp ? new Date(timestamp) : null;
  },

  markSynced(): void {
    storage.set(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
  },

  // Initialize all data if needed
  initialize(): void {
    try {
      // Load all services to ensure data is initialized
      applicationService.getAll();
      companyService.getAll();
      activityService.getAll();
      eventService.getAll();
      reminderService.getAll();
      goalService.getAll();
      statsService.getStats();
      userService.getProfile();

      this.markSynced();
      logger.info("Data initialized successfully");
    } catch (error) {
      console.error("Error initializing data:", error);
    }
  },

  // Clear all data and reinitialize
  reset(): void {
    try {
      storage.clear();
      this.initialize();
      logger.info("Data reset successfully");
    } catch (error) {
      console.error("Error resetting data:", error);
    }
  },
};

// Auto-initialize data on module load
if (typeof window !== 'undefined') {
    syncData.initialize();
}
