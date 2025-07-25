/**
 * React hooks for SQLite database data management
 * Provides reactive access to database data
 */

import { useState, useEffect } from 'react';

// Database-backed types
interface Application {
    id: number;
    user_id: number;
    company_id: number;
    position: string;
    stage: 'applied' | 'screening' | 'interview' | 'offer' | 'rejected';
    date_applied: string;
    salary_range?: string;
    notes?: string;
    company?: {
        id: number;
        name: string;
        logo?: string;
        industry?: string;
    };
}

interface Activity {
    id: number;
    type: 'application' | 'interview' | 'network' | 'follow_up' | 'offer' | 'rejection';
    title: string;
    description?: string;
    priority: 'low' | 'medium' | 'high';
    status: 'pending' | 'completed' | 'cancelled';
    created_at: string;
}

interface Event {
    id: number;
    title: string;
    description?: string;
    event_date: string;
    event_type: 'interview' | 'follow_up' | 'deadline' | 'networking' | 'other';
    is_completed: boolean;
}

interface AppStats {
    totalApplications: number;
    interviewsScheduled: number;
    offersReceived: number;
    rejections: number;
    responseRate: string;
    successRate: string;
    activeApplications: number;
}

interface UserProfile {
    name: string;
    avatar: string;
}

export const useDbData = (userId: number = 1) => {
    const [applications, setApplications] = useState<Application[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
    const [appStats, setAppStats] = useState<AppStats>({
        totalApplications: 0,
        interviewsScheduled: 0,
        offersReceived: 0,
        rejections: 0,
        responseRate: '0%',
        successRate: '0%',
        activeApplications: 0
    });
    const [userProfile] = useState<UserProfile>({
        name: 'Alex Foster',
        avatar: '/avatar.jpg'
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch all data in parallel
                const [appsRes, activitiesRes, eventsRes, statsRes] = await Promise.all([
                    fetch(`/api/applications?userId=${userId}`),
                    fetch(`/api/activities?userId=${userId}`),
                    fetch(`/api/events?userId=${userId}`),
                    fetch(`/api/stats?userId=${userId}`)
                ]);

                if (!appsRes.ok || !activitiesRes.ok || !eventsRes.ok || !statsRes.ok) {
                    throw new Error('Failed to fetch data');
                }

                const [appsData, activitiesData, eventsData, statsData] = await Promise.all([
                    appsRes.json(),
                    activitiesRes.json(),
                    eventsRes.json(),
                    statsRes.json()
                ]);

                setApplications(appsData);
                setActivities(activitiesData);
                setUpcomingEvents(eventsData);
                setAppStats(statsData);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
                console.error('Error fetching app data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userId]);

    const refreshData = () => {
        // Re-fetch data
        setLoading(true);
        const fetchData = async () => {
            try {
                const [appsRes, activitiesRes, eventsRes, statsRes] = await Promise.all([
                    fetch(`/api/applications?userId=${userId}`),
                    fetch(`/api/activities?userId=${userId}`),
                    fetch(`/api/events?userId=${userId}`),
                    fetch(`/api/stats?userId=${userId}`)
                ]);

                if (!appsRes.ok || !activitiesRes.ok || !eventsRes.ok || !statsRes.ok) {
                    throw new Error('Failed to fetch data');
                }

                const [appsData, activitiesData, eventsData, statsData] = await Promise.all([
                    appsRes.json(),
                    activitiesRes.json(),
                    eventsRes.json(),
                    statsRes.json()
                ]);

                setApplications(appsData);
                setActivities(activitiesData);
                setUpcomingEvents(eventsData);
                setAppStats(statsData);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
                console.error('Error refreshing app data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    };

    return {
        applications,
        activities,
        upcomingEvents,
        appStats,
        userProfile,
        loading,
        error,
        refreshData
    };
};
