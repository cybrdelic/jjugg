/**
 * Local Storage Utility for Job Tracker App
 * Handles data persistence with localStorage
 */

import {
  DataMigrators,
  DataValidators,
  DateRevivable,
  StoredActivity,
  StoredApplication,
  StoredCompany,
  StoredEvent,
  StoredReminder,
} from "./storage.types";

// Storage keys
export const STORAGE_KEYS = {
  USER_PROFILE: "jjugg_user_profile",
  APPLICATIONS: "jjugg_applications",
  COMPANIES: "jjugg_companies",
  ACTIVITIES: "jjugg_activities",
  UPCOMING_EVENTS: "jjugg_upcoming_events",
  MONTHLY_GOALS: "jjugg_monthly_goals",
  REMINDERS: "jjugg_reminders",
  APP_STATS: "jjugg_app_stats",
  SETTINGS: "jjugg_settings",
  LAST_SYNC: "jjugg_last_sync",
} as const;

// Storage interface
export interface StorageService {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
  clear(): void;
  exists(key: string): boolean;
}

// Local storage implementation
class LocalStorageService implements StorageService {
  get<T>(key: string): T | null {
    try {
      if (typeof window === "undefined") return null;
      const item = localStorage.getItem(key);
      if (!item) return null;

      const parsed = JSON.parse(item);

      // Convert date strings back to Date objects
      return this.reviveDates(parsed) as T;
    } catch (error) {
      console.error(`Error getting item from localStorage:`, error);
      return null;
    }
  }

  set<T>(key: string, value: T): void {
    try {
      if (typeof window === "undefined") return;
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting item in localStorage:`, error);
    }
  }

  remove(key: string): void {
    try {
      if (typeof window === "undefined") return;
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item from localStorage:`, error);
    }
  }

  clear(): void {
    try {
      if (typeof window === "undefined") return;
      // Only clear our app's data
      Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error(`Error clearing localStorage:`, error);
    }
  }

  exists(key: string): boolean {
    try {
      if (typeof window === "undefined") return false;
      return localStorage.getItem(key) !== null;
    } catch (error) {
      console.error(`Error checking localStorage:`, error);
      return false;
    }
  }

  // Helper method to convert date strings back to Date objects
  private reviveDates(obj: DateRevivable): DateRevivable {
    if (obj === null || obj === undefined) return obj;

    if (typeof obj === "string") {
      // Check if string looks like a date
      const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
      if (dateRegex.test(obj)) {
        return new Date(obj);
      }
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.reviveDates(item));
    }

    if (typeof obj === "object") {
      const revived: { [key: string]: DateRevivable } = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          revived[key] = this.reviveDates(
            (obj as Record<string, DateRevivable>)[key]
          );
        }
      }
      return revived;
    }

    return obj;
  }
}

// Create storage instance
export const storage = new LocalStorageService();

// Data validation utilities
export const isValidData: DataValidators = {
  application: (data: unknown): data is StoredApplication => {
    const app = data as StoredApplication;
    return Boolean(
      app &&
        typeof app.id === "string" &&
        typeof app.position === "string" &&
        app.company &&
        app.dateApplied &&
        ["applied", "screening", "interview", "offer", "rejected"].includes(
          app.stage
        )
    );
  },

  company: (data: unknown): data is StoredCompany => {
    const company = data as StoredCompany;
    return Boolean(
      company &&
        typeof company.id === "string" &&
        typeof company.name === "string" &&
        typeof company.industry === "string"
    );
  },

  activity: (data: unknown): data is StoredActivity => {
    const activity = data as StoredActivity;
    return Boolean(
      activity &&
        typeof activity.id === "string" &&
        typeof activity.type === "string" &&
        typeof activity.title === "string" &&
        activity.timestamp
    );
  },

  event: (data: unknown): data is StoredEvent => {
    const event = data as StoredEvent;
    return Boolean(
      event &&
        typeof event.id === "string" &&
        typeof event.title === "string" &&
        event.date &&
        event.company
    );
  },

  reminder: (data: unknown): data is StoredReminder => {
    const reminder = data as StoredReminder;
    return Boolean(
      reminder &&
        typeof reminder.id === "string" &&
        typeof reminder.title === "string" &&
        reminder.dueDate &&
        ["high", "medium", "low"].includes(reminder.priority) &&
        ["pending", "completed"].includes(reminder.status)
    );
  },
};

// Migration utilities for schema changes
export const migrateData: DataMigrators = {
  applications: (data: unknown[]): StoredApplication[] => {
    return data.map((app) => {
      const appData = app as Partial<StoredApplication>;
      return {
        ...appData,
        // Ensure all required fields exist
        contacts: appData.contacts || [],
        interviews: appData.interviews || [],
        tasks: appData.tasks || [],
        documents: appData.documents || [],
        allNotes: appData.allNotes || [],
        // Migrate old date formats
        dateApplied:
          appData.dateApplied instanceof Date
            ? appData.dateApplied
            : new Date(appData.dateApplied || Date.now()),
      } as StoredApplication;
    });
  },
};

// Backup and restore utilities
/**
 * @deprecated Not invoked in current UI; consider removing or moving to an admin tools module.
 */
export const backupData = () => {
    try {
        const backup: Record<string, any> = {};
        Object.values(STORAGE_KEYS).forEach(key => {
            const data = storage.get(key);
            if (data) {
                backup[key] = data;
            }
        });

        // Add timestamp
        backup['backup_timestamp'] = new Date().toISOString();

        // Create downloadable file
        const dataStr = JSON.stringify(backup, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `jjugg-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        return true;
    } catch (error) {
        console.error('Backup failed:', error);
        return false;
    }
};

/**
 * @deprecated Not invoked in current UI; consider removing or moving to an admin tools module.
 */
export const restoreData = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
        try {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const backup = JSON.parse(event.target?.result as string);

                    // Validate backup structure
                    if (!backup || typeof backup !== 'object') {
                        console.error('Invalid backup format');
                        resolve(false);
                        return;
                    }

                    // Restore data
                    Object.entries(backup).forEach(([key, value]) => {
                        if (key !== 'backup_timestamp' && Object.values(STORAGE_KEYS).includes(key as any)) {
                            storage.set(key, value);
                        }
                    });

                    console.log('Data restored successfully');
                    resolve(true);
                } catch (error) {
                    console.error('Error parsing backup file:', error);
                    resolve(false);
                }
            };

            reader.onerror = () => {
                console.error('Error reading backup file');
                resolve(false);
            };

            reader.readAsText(file);
        } catch (error) {
            console.error('Restore failed:', error);
            resolve(false);
        }
    });
};
