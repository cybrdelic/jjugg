/**
 * Type definitions for storage validation and migration
 */

// Base interfaces for stored data
export interface StoredApplication {
  id: string;
  position: string;
  company: {
    id: string;
    name: string;
    industry: string;
  };
  dateApplied: Date | string;
  stage: "applied" | "screening" | "interview" | "offer" | "rejected";
  contacts?: unknown[];
  interviews?: unknown[];
  tasks?: unknown[];
  documents?: unknown[];
  allNotes?: unknown[];
}

export interface StoredCompany {
  id: string;
  name: string;
  industry: string;
}

export interface StoredActivity {
  id: string;
  type: string;
  title: string;
  timestamp: Date | string;
}

export interface StoredEvent {
  id: string;
  title: string;
  date: Date | string;
  company: StoredCompany | string;
}

export interface StoredReminder {
  id: string;
  title: string;
  dueDate: Date | string;
  priority: "high" | "medium" | "low";
  status: "pending" | "completed";
}

// Type for the reviveDates function
export type DateRevivable =
  | string
  | Date
  | null
  | undefined
  | DateRevivable[]
  | { [key: string]: DateRevivable };

// Validator function types
export interface DataValidators {
  application: (data: unknown) => data is StoredApplication;
  company: (data: unknown) => data is StoredCompany;
  activity: (data: unknown) => data is StoredActivity;
  event: (data: unknown) => data is StoredEvent;
  reminder: (data: unknown) => data is StoredReminder;
}

// Migration function types
export interface DataMigrators {
  applications: (data: unknown[]) => StoredApplication[];
}
