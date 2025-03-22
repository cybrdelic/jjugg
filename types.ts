// Navigation and UI Types
import { JSX } from "react";
import { LucideIcon } from 'lucide-react';

export type SectionKey =
  | 'dashboard-home'
  | 'applications-section'
  | 'reminders-section'
  | 'analytics-section'
  | 'interviews-section'
  | 'profile-artifacts-section'
  | 'goals-section'
  | 'timeline-section'
  | 'calendar-section';

export interface NavItem {
  key: SectionKey;
  label: string;
  icon: LucideIcon;
  description?: string;
  badge?: number;
  badgeColor?: string;
}

export interface NavItemType {
  id: SectionKey;
  key: SectionKey;
  label: string;
  icon: JSX.Element;
  color: string;
  description?: string; // Added description field for subtitles/descriptions
  badge?: { count: number } | { text: string };
  aiGeneratedContent?: boolean; // Flag for AI-generated content
  metadata?: {
    priority?: 'low' | 'medium' | 'high'; // Optional priority marker
    status?: 'pending' | 'in-progress' | 'completed'; // Optional status marker
    timestamp?: string; // Optional timestamp
    tags?: string[]; // Optional tags
  };
}

export interface SidebarSectionType {
  id: string;
  title: string;
  items: NavItemType[];
  isExpandable?: boolean; // Whether this section can be expanded/collapsed
  isAiGenerated?: boolean; // Whether this section is AI-generated
  icon?: JSX.Element; // Optional section icon
}

// Application Types
export type ApplicationStage = 'applied' | 'screening' | 'interview' | 'offer' | 'rejected';

export interface Company {
  id: string;
  name: string;
  logo: string;
  industry: string;
  website?: string; // Optional website URL
  description?: string; // Optional company description
  headquarters?: string; // Optional headquarters location
  size?: string; // Optional company size (e.g., "100-500 employees")
  founded?: string; // Optional founding year
}

export interface Contact {
  id: string;
  name: string;
  role: string; // e.g., "Recruiter", "Hiring Manager"
  email: string;
  phone?: string; // Optional phone number
  linkedin?: string; // Optional LinkedIn profile URL
  notes?: string; // Optional additional notes
}

export interface InterviewEvent {
  id: string;
  type: 'phone' | 'video' | 'onsite' | 'technical' | 'other'; // Type of interview
  date: Date; // Date of the interview
  duration: number; // Duration in minutes
  with?: string; // Optional: Person conducting the interview
  location?: string; // Optional: Location or link for the interview
  notes?: string; // Optional: Notes about the interview
  completed: boolean; // Whether the interview has been completed
  feedback?: string; // Optional: Feedback received after the interview
}

export interface Task {
  id: string;
  title: string; // Task title (e.g., "Follow up with recruiter")
  completed: boolean; // Whether the task is completed
  dueDate?: Date; // Optional due date for the task
  priority: 'low' | 'medium' | 'high'; // Task priority
}

export interface Note {
  id: string;
  content: string; // Content of the note
  createdAt: Date; // Date the note was created
  type?: 'general' | 'interview' | 'research' | 'followup'; // Optional note type
}

export interface Document {
  id: string;
  name: string; // Name of the document
  type: 'resume' | 'cover-letter' | 'portfolio' | 'other'; // Type of document
  url: string; // URL or path to the document
  createdAt: Date; // Date the document was uploaded or created
}

export interface Application {
  id: string;
  position: string; // Job position (e.g., "Software Engineer")
  company: Company; // Company offering the job
  dateApplied: Date; // Date the application was submitted
  stage: ApplicationStage; // Current stage of the application
  jobDescription: string; // Description of the job
  salary: string; // Salary range or amount
  location: string; // Job location
  remote: boolean; // Whether the job is remote
  notes: string; // General notes about the application
  contacts: Contact[]; // Array of contacts related to this application
  interviews?: InterviewEvent[]; // Optional array of interviews
  tasks?: Task[]; // Optional array of tasks
  documents?: Document[]; // Optional array of documents
  allNotes?: Note[]; // Optional array of notes
}

export interface StatusUpdate {
  id: string;
  message: string; // Update message (e.g., "Moved to interview stage")
  appId: string | null; // ID of the application this update relates to, or null for general updates
}