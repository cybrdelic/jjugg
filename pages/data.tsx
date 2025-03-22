import type { Application, ApplicationStage, Company } from "@/types";
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
}

// **Mock Data**
export const userProfile = {
    id: '123456',
    name: 'John Anderson',
    email: 'john.anderson@example.com',
    avatar: '/avatar.jpg',
    jobTitle: 'Senior Frontend Developer',
    yearsExperience: 5,
    location: 'San Francisco, CA',
    skills: ['React', 'TypeScript', 'Next.js', 'UI/UX', 'GraphQL'],
    salary: {
        min: 120000,
        max: 150000,
        currency: 'USD',
    },
};

export const companies: Company[] = [
    { id: 'c1', name: 'Google', logo: '/companies/google.svg', industry: 'Technology' },
    { id: 'c2', name: 'Microsoft', logo: '/companies/microsoft.svg', industry: 'Technology' },
    { id: 'c3', name: 'Apple', logo: '/companies/apple.svg', industry: 'Technology' },
    { id: 'c4', name: 'Amazon', logo: '/companies/amazon.svg', industry: 'E-commerce' },
    { id: 'c5', name: 'Facebook', logo: '/companies/facebook.svg', industry: 'Social Media' },
    { id: 'c6', name: 'Netflix', logo: '/companies/netflix.svg', industry: 'Entertainment' },
    { id: 'c7', name: 'Stripe', logo: '/companies/stripe.svg', industry: 'Fintech' },
    { id: 'c8', name: 'Airbnb', logo: '/companies/airbnb.svg', industry: 'Travel' },
    { id: 'c9', name: 'Uber', logo: '/companies/uber.svg', industry: 'Transportation' },
    { id: 'c10', name: 'Slack', logo: '/companies/slack.svg', industry: 'Technology' },
    { id: 'c11', name: 'Spotify', logo: '/companies/spotify.svg', industry: 'Music' },
    { id: 'c12', name: 'Adobe', logo: '/companies/adobe.svg', industry: 'Software' },
    { id: 'c13', name: 'Salesforce', logo: '/companies/salesforce.svg', industry: 'CRM' },
];

export const applications: Application[] = [
    {
        id: 'app1',
        position: 'Senior Frontend Developer',
        company: companies[0],
        dateApplied: new Date(2023, 11, 10),
        stage: 'interview',
        jobDescription: 'Building and maintaining Google Maps web applications...',
        salary: '$140,000 - $180,000',
        location: 'Mountain View, CA',
        remote: false,
        notes: 'Had a great initial call with the recruiter',
        contacts: [{ id: 'contact-app1-0', name: 'Sarah Johnson', role: 'Recruiter', email: 'sarah.j@google.com' }],
    },
    {
        id: 'app2',
        position: 'Software Engineer',
        company: companies[1],
        dateApplied: new Date(2023, 11, 12),
        stage: 'screening',
        jobDescription: 'Developing features for Microsoft Azure...',
        salary: '$130,000 - $160,000',
        location: 'Redmond, WA',
        remote: true,
        notes: 'Submitted coding assessment',
        contacts: [],
    },
    {
        id: 'app3',
        position: 'iOS Developer',
        company: companies[2],
        dateApplied: new Date(2023, 11, 15),
        stage: 'applied',
        jobDescription: 'Creating innovative iOS applications...',
        salary: '$135,000 - $170,000',
        location: 'Cupertino, CA',
        remote: false,
        notes: 'Tailored resume for this role',
        contacts: [],
    },
    {
        id: 'app4',
        position: 'Cloud Engineer',
        company: companies[3],
        dateApplied: new Date(2023, 11, 18),
        stage: 'offer',
        jobDescription: 'Optimizing AWS infrastructure...',
        salary: '$145,000 - $190,000',
        location: 'Seattle, WA',
        remote: true,
        notes: 'Received offer, negotiating terms',
        contacts: [{ id: 'contact-app4-0', name: 'Mike Brown', role: 'Hiring Manager', email: 'mike.b@amazon.com' }],
    },
    {
        id: 'app5',
        position: 'Product Manager',
        company: companies[4],
        dateApplied: new Date(2023, 11, 20),
        stage: 'interview',
        jobDescription: 'Leading product strategy for Instagram...',
        salary: '$150,000 - $200,000',
        location: 'Menlo Park, CA',
        remote: false,
        notes: 'Preparing for behavioral interview',
        contacts: [],
    },
    {
        id: 'app6',
        position: 'Backend Engineer',
        company: companies[5],
        dateApplied: new Date(2023, 11, 22),
        stage: 'rejected',
        jobDescription: 'Scaling Netflix streaming services...',
        salary: '$140,000 - $180,000',
        location: 'Los Gatos, CA',
        remote: true,
        notes: 'Rejected after initial screening',
        contacts: [],
    },
    {
        id: 'app7',
        position: 'DevOps Engineer',
        company: companies[6],
        dateApplied: new Date(2023, 11, 23),
        stage: 'screening',
        jobDescription: 'Managing CI/CD pipelines at Stripe...',
        salary: '$130,000 - $165,000',
        location: 'San Francisco, CA',
        remote: true,
        notes: 'Technical phone screen scheduled',
        contacts: [],
    },
    {
        id: 'app8',
        position: 'Frontend Developer',
        company: companies[7],
        dateApplied: new Date(2023, 11, 24),
        stage: 'applied',
        jobDescription: 'Building Airbnb’s booking platform...',
        salary: '$125,000 - $155,000',
        location: 'San Francisco, CA',
        remote: true,
        notes: 'Applied through referral',
        contacts: [{ id: 'contact-app8-0', name: 'Lisa Chen', role: 'Engineer', email: 'lisa.c@airbnb.com' }],
    },
    {
        id: 'app9',
        position: 'Mobile Engineer',
        company: companies[8],
        dateApplied: new Date(2023, 11, 25),
        stage: 'interview',
        jobDescription: 'Enhancing Uber’s driver app...',
        salary: '$135,000 - $175,000',
        location: 'San Francisco, CA',
        remote: false,
        notes: 'Coding challenge completed',
        contacts: [],
    },
    {
        id: 'app10',
        position: 'Full Stack Developer',
        company: companies[9],
        dateApplied: new Date(2023, 11, 26),
        stage: 'screening',
        jobDescription: 'Developing Slack’s collaboration tools...',
        salary: '$130,000 - $160,000',
        location: 'San Francisco, CA',
        remote: true,
        notes: 'Awaiting feedback',
        contacts: [],
    },
    {
        id: 'app11',
        position: 'Frontend Engineer',
        company: companies[10],
        dateApplied: new Date(2023, 11, 25),
        stage: 'applied',
        jobDescription: 'Developing user interfaces for Spotify’s web player...',
        salary: '$120,000 - $150,000',
        location: 'Stockholm, Sweden',
        remote: true,
        notes: 'Excited about the music industry',
        contacts: [],
    },
    {
        id: 'app12',
        position: 'UI Designer',
        company: companies[11],
        dateApplied: new Date(2023, 11, 26),
        stage: 'screening',
        jobDescription: 'Designing interfaces for Adobe Creative Cloud...',
        salary: '$110,000 - $140,000',
        location: 'San Jose, CA',
        remote: false,
        notes: 'Portfolio review scheduled',
        contacts: [{ id: 'contact-app12-0', name: 'Emily Davis', role: 'Design Manager', email: 'emily.d@adobe.com' }],
    },
    {
        id: 'app13',
        position: 'Software Engineer',
        company: companies[12],
        dateApplied: new Date(2023, 11, 27),
        stage: 'interview',
        jobDescription: 'Building scalable solutions for Salesforce platform...',
        salary: '$130,000 - $160,000',
        location: 'San Francisco, CA',
        remote: true,
        notes: 'Technical interview next week',
        contacts: [{ id: 'contact-app13-0', name: 'David Lee', role: 'Engineering Lead', email: 'david.l@salesforce.com' }],
    },
];

// **Data Generation Functions**
export const generateActivities = (): Activity[] => {
    const now = new Date();
    const activities: Activity[] = [
        {
            id: 'act1',
            type: 'application',
            title: 'Job Application Submitted',
            application: applications[0],
            company: applications[0].company,
            timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000),
            details: `Applied for ${applications[0].position} at ${applications[0].company.name}`,
        },
        {
            id: 'act2',
            type: 'interview',
            title: 'Interview Invitation',
            application: applications[1],
            company: applications[1].company,
            timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000),
            details: `Received interview invitation for ${applications[1].position} at ${applications[1].company.name}`,
        },
        {
            id: 'act3',
            type: 'offer',
            title: 'Offer Received',
            application: applications[3],
            company: applications[3].company,
            timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
            details: `Received job offer for ${applications[3].position} at ${applications[3].company.name}`,
        },
        {
            id: 'act4',
            type: 'rejected',
            title: 'Application Rejected',
            application: applications[5],
            company: applications[5].company,
            timestamp: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
            details: `Application for ${applications[5].position} at ${applications[5].company.name} was rejected`,
        },
        {
            id: 'act5',
            type: 'assessment',
            title: 'Coding Assessment Submitted',
            application: applications[8],
            company: applications[8].company,
            timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
            details: `Submitted coding assessment for ${applications[8].position} at ${applications[8].company.name}`,
        },
        {
            id: 'act6',
            type: 'screening',
            title: 'Moved to Screening',
            application: applications[9],
            company: applications[9].company,
            timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
            details: `Application for ${applications[9].position} at ${applications[9].company.name} moved to screening`,
        },
        {
            id: 'act7',
            type: 'application',
            title: 'Job Application Submitted',
            application: applications[10],
            company: applications[10].company,
            timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000),
            details: `Applied for ${applications[10].position} at ${applications[10].company.name}`,
        },
        {
            id: 'act8',
            type: 'screening',
            title: 'Application Moved to Screening',
            application: applications[11],
            company: applications[11].company,
            timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
            details: `Application for ${applications[11].position} at ${applications[11].company.name} moved to screening`,
        },
        {
            id: 'act9',
            type: 'interview',
            title: 'Interview Scheduled',
            application: applications[12],
            company: applications[12].company,
            timestamp: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
            details: `Scheduled interview for ${applications[12].position} at ${applications[12].company.name}`,
        },
    ];
    return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

const generateUpcomingEvents = (): UpcomingEvent[] => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const inTwoWeeks = new Date(now);
    inTwoWeeks.setDate(inTwoWeeks.getDate() + 14);

    return [
        {
            id: 'evt1',
            title: 'Product Manager Interview',
            company: applications[4].company,
            date: tomorrow,
            time: '10:00 AM',
            type: 'Interview',
            application: applications[4],
            details: 'Technical interview with the engineering team',
            location: 'Video call (Zoom)',
            duration: 60,
        },
        {
            id: 'evt2',
            title: 'Follow-up Task',
            company: applications[0].company,
            date: nextWeek,
            time: '2:00 PM',
            type: 'Task',
            application: applications[0],
            details: 'Complete take-home coding assignment',
            deadline: new Date(nextWeek.getTime() + 24 * 60 * 60 * 1000),
        },
        {
            id: 'evt3',
            title: 'Mobile Engineer Interview',
            company: applications[8].company,
            date: inTwoWeeks,
            time: '1:00 PM',
            type: 'Interview',
            application: applications[8],
            details: 'Final round interview with Uber team',
            location: 'San Francisco office',
            duration: 120,
        },
        {
            id: 'evt4',
            title: 'Portfolio Review',
            company: applications[11].company,
            date: nextWeek,
            time: '3:00 PM',
            type: 'Task',
            application: applications[11],
            details: 'Prepare portfolio for review session',
            deadline: new Date(nextWeek.getTime() + 2 * 60 * 60 * 1000),
        },
        {
            id: 'evt5',
            title: 'Technical Interview',
            company: applications[12].company,
            date: inTwoWeeks,
            time: '11:00 AM',
            type: 'Interview',
            application: applications[12],
            details: 'System design and coding interview',
            location: 'Video call (Zoom)',
            duration: 90,
        },
    ];
};

const generateApplicationStats = (): AppStats => {
    const totalApplications = applications.length;
    const stageCount = {
        applied: applications.filter(app => app.stage === 'applied').length,
        screening: applications.filter(app => app.stage === 'screening').length,
        interview: applications.filter(app => app.stage === 'interview').length,
        offer: applications.filter(app => app.stage === 'offer').length,
        rejected: applications.filter(app => app.stage === 'rejected').length,
    };
    const interviewsScheduled = generateUpcomingEvents().filter(event => event.type === 'Interview').length;
    const completedApplications = stageCount.offer + stageCount.rejected;
    const successRate = completedApplications > 0
        ? Math.round((stageCount.offer / completedApplications) * 100)
        : 0;

    return {
        totalApplications,
        stageCount,
        interviewsScheduled,
        successRate,
        tasksdue: generateUpcomingEvents().filter(event => event.type === 'Task').length,
        activeApplications: totalApplications - stageCount.rejected - stageCount.offer,
    };
};

const generateGoals = (): MonthlyGoal[] => {
    return [
        {
            id: 'goal1',
            goal: 'Submit 20 Applications',
            current: applications.length,
            target: 20,
            progress: Math.min(Math.round((applications.length / 20) * 100), 100),
        },
        {
            id: 'goal2',
            goal: 'Network with 15 Contacts',
            current: 11,
            target: 15,
            progress: Math.round((11 / 15) * 100),
        },
        {
            id: 'goal3',
            goal: 'Complete 5 Assessments',
            current: 4,
            target: 5,
            progress: Math.round((4 / 5) * 100),
        },
    ];
};

// **Initialize Data**
export const activities = generateActivities();
export const upcomingEvents = generateUpcomingEvents();
export const appStats = generateApplicationStats();
export const monthlyGoals = generateGoals();

export default function getData() {
    return (
        <div>
        </div>
    );
}
