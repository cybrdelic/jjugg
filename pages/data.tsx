import type { Application, ApplicationStage, Company, Reminder, ReminderPriority, ReminderStatus } from "@/types";
import React from "react";

type ActivityType = 'application' | 'interview' | 'email' | 'viewed' | 'assessment' | 'offer' | 'screening' | 'rejected';
type EventType = 'Interview' | 'Task' | 'Deadline';

interface Activity {
    id: string;
    type: ActivityType;
    title: string;
    application: Application;
    company: Company;
    timestamp: Date;
    details: string;
}

interface UpcomingEvent {
    id: string;
    title: string;
    company: Company;
    date: Date;
    time: string;
    type: EventType;
    application: Application;
    details: string;
    deadline?: Date;
    location?: string;
    duration?: number;
}

interface AppStats {
    totalApplications: number;
    stageCount: Record<ApplicationStage, number>;
    interviewsScheduled: number;
    successRate: number;
    tasksdue: number;
    activeApplications: number;
}

interface MonthlyGoal {
    id: string;
    goal: string;
    current: number;
    target: number;
    progress: number;
    category: 'applications' | 'networking' | 'skills' | 'interviews';
}

// **Clean Data - No Fake Data**
export const userProfile = {
    id: '',
    name: '',
    email: '',
    avatar: '/avatar.jpg',
    jobTitle: '',
    yearsExperience: 0,
    location: '',
    skills: [],
    salary: {
        min: 0,
        max: 0,
        currency: 'USD',
    },
};

export const companies: Company[] = [];

export const applications: Application[] = [];

export const reminders: Reminder[] = [];

// **Clean Data Generation Functions**
export const generateActivities = (): Activity[] => {
    // Return empty array since we have no applications
    return [];
};

const generateUpcomingEvents = (): UpcomingEvent[] => {
    // Return empty array since we have no applications
    return [];
};

const generateApplicationStats = (): AppStats => {
    return {
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
};

const generateGoals = (): MonthlyGoal[] => {
    return [
        {
            id: 'goal1',
            goal: 'Submit 20 Applications',
            current: 0,
            target: 20,
            progress: 0,
            category: 'applications',
        },
        {
            id: 'goal2',
            goal: 'Network with 15 Contacts',
            current: 0,
            target: 15,
            progress: 0,
            category: 'networking',
        },
        {
            id: 'goal3',
            goal: 'Complete 5 Assessments',
            current: 0,
            target: 5,
            progress: 0,
            category: 'skills',
        },
    ];
};

// **Initialize Clean Data**
export const activities = generateActivities();
export const upcomingEvents = generateUpcomingEvents();
export const appStats = generateApplicationStats();
export const monthlyGoals = generateGoals();

// Data access functions for backward compatibility
export const getData = {
    applications: () => applications,
    companies: () => companies,
    activities: () => generateActivities(),
    upcomingEvents: () => generateUpcomingEvents(),
    appStats: () => generateApplicationStats(),
    monthlyGoals: () => generateGoals(),
    userProfile: () => userProfile
};

export default function DataPage() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Data Management</h1>
            <p className="text-gray-600">
                This page provides access to clean data for the application.
                All fake/mock data has been removed. The application now starts with empty data structures.
            </p>
            <div className="mt-6 space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-semibold text-green-900">Clean Data Status:</h3>
                    <ul className="mt-2 text-green-800 space-y-1">
                        <li>• Applications: {applications.length} entries</li>
                        <li>• Companies: {companies.length} entries</li>
                        <li>• Activities: {generateActivities().length} entries</li>
                        <li>• Events: {generateUpcomingEvents().length} entries</li>
                        <li>• Reminders: {reminders.length} entries</li>
                        <li>• Goals: {generateGoals().length} entries</li>
                    </ul>
                    <p className="mt-3 text-sm text-green-700">
                        ✅ All fake data has been removed. Ready for real user data.
                    </p>
                </div>
            </div>
        </div>
    );
}
