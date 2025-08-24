/**
 * Local Storage Utility for Job Tracker App
 * Handles data persistence with localStorage
 */

// Storage keys
export const STORAGE_KEYS = {
    USER_PROFILE: 'jjugg_user_profile',
    APPLICATIONS: 'jjugg_applications',
    COMPANIES: 'jjugg_companies',
    ACTIVITIES: 'jjugg_activities',
    UPCOMING_EVENTS: 'jjugg_upcoming_events',
    MONTHLY_GOALS: 'jjugg_monthly_goals',
    REMINDERS: 'jjugg_reminders',
    APP_STATS: 'jjugg_app_stats',
    SETTINGS: 'jjugg_settings',
    LAST_SYNC: 'jjugg_last_sync',
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
            if (typeof window === 'undefined') return null;
            const item = localStorage.getItem(key);
            if (!item) return null;

            const parsed = JSON.parse(item);

            // Convert date strings back to Date objects
            return this.reviveDates(parsed);
        } catch (error) {
            console.error(`Error getting item from localStorage:`, error);
            return null;
        }
    }

    set<T>(key: string, value: T): void {
        try {
            if (typeof window === 'undefined') return;
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(`Error setting item in localStorage:`, error);
        }
    }

    remove(key: string): void {
        try {
            if (typeof window === 'undefined') return;
            localStorage.removeItem(key);
        } catch (error) {
            console.error(`Error removing item from localStorage:`, error);
        }
    }

    clear(): void {
        try {
            if (typeof window === 'undefined') return;
            // Only clear our app's data
            Object.values(STORAGE_KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
        } catch (error) {
            console.error(`Error clearing localStorage:`, error);
        }
    }

    exists(key: string): boolean {
        try {
            if (typeof window === 'undefined') return false;
            return localStorage.getItem(key) !== null;
        } catch (error) {
            console.error(`Error checking localStorage:`, error);
            return false;
        }
    }

    // Helper method to convert date strings back to Date objects
    private reviveDates(obj: any): any {
        if (obj === null || obj === undefined) return obj;

        if (typeof obj === 'string') {
            // Check if string looks like a date
            const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
            if (dateRegex.test(obj)) {
                return new Date(obj);
            }
            return obj;
        }

        if (Array.isArray(obj)) {
            return obj.map(item => this.reviveDates(item));
        }

        if (typeof obj === 'object') {
            const revived: any = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    revived[key] = this.reviveDates(obj[key]);
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
export const isValidData = {
    application: (data: any): boolean => {
        return data &&
            typeof data.id === 'string' &&
            typeof data.position === 'string' &&
            data.company &&
            data.dateApplied &&
            ['applied', 'screening', 'interview', 'offer', 'rejected'].includes(data.stage);
    },

    company: (data: any): boolean => {
        return data &&
            typeof data.id === 'string' &&
            typeof data.name === 'string' &&
            typeof data.industry === 'string';
    },

    activity: (data: any): boolean => {
        return data &&
            typeof data.id === 'string' &&
            typeof data.type === 'string' &&
            typeof data.title === 'string' &&
            data.timestamp;
    },

    event: (data: any): boolean => {
        return data &&
            typeof data.id === 'string' &&
            typeof data.title === 'string' &&
            data.date &&
            data.company;
    },

    reminder: (data: any): boolean => {
        return data &&
            typeof data.id === 'string' &&
            typeof data.title === 'string' &&
            data.dueDate &&
            ['high', 'medium', 'low'].includes(data.priority) &&
            ['pending', 'completed'].includes(data.status);
    }
};

// Migration utilities for schema changes
export const migrateData = {
    applications: (data: any[]): any[] => {
        return data.map(app => ({
            ...app,
            // Ensure all required fields exist
            contacts: app.contacts || [],
            interviews: app.interviews || [],
            tasks: app.tasks || [],
            documents: app.documents || [],
            allNotes: app.allNotes || [],
            // Migrate old date formats
            dateApplied: app.dateApplied instanceof Date ? app.dateApplied : new Date(app.dateApplied)
        }));
    }
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
