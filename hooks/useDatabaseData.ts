import { useCallback, useEffect, useState } from 'react';

// Simple in-memory cache to prevent redundant API calls
const cache = new Map();
const CACHE_DURATION = 30000; // 30 seconds

// Hook to fetch data from the database API
export function useDbData() {
    const [applications, setApplications] = useState([]);
    const [activities, setActivities] = useState([]);
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [appStats, setAppStats] = useState<any>(null);
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const userId = 1; // Default user ID - you can make this dynamic later

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const cacheKey = `user-${userId}`;
            const cachedData = cache.get(cacheKey);

            // Return cached data if it's fresh
            if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
                setApplications(cachedData.applications);
                setActivities(cachedData.activities);
                setUpcomingEvents(cachedData.upcomingEvents);
                setAppStats(cachedData.appStats);
                setInterviews(cachedData.interviews);
                setLoading(false);
                return;
            }

            // Fetch all data in parallel
            const [
                applicationsRes,
                activitiesRes,
                eventsRes,
                statsRes,
                interviewsRes
            ] = await Promise.all([
                fetch(`/api/applications?userId=${userId}`),
                fetch(`/api/activities?userId=${userId}`),
                fetch(`/api/events?userId=${userId}`),
                fetch(`/api/stats?userId=${userId}`),
                fetch(`/api/interviews?userId=${userId}`)
            ]);

            // Allow partial success: treat non-ok as empty set / default stats
            const safeJson = async (res: Response, fallback: any) => {
                if (!res.ok) return fallback;
                try { return await res.json(); } catch { return fallback; }
            };

            // Parse JSON responses
            const [
                applicationsData,
                activitiesData,
                eventsData,
                statsData,
                interviewsData
            ] = await Promise.all([
                safeJson(applicationsRes, []),
                safeJson(activitiesRes, []),
                safeJson(eventsRes, []),
                safeJson(statsRes, {}),
                safeJson(interviewsRes, [])
            ]);

            // Update state with fetched data
            setApplications(applicationsData);
            setActivities(activitiesData);
            setUpcomingEvents(eventsData);
            setAppStats(statsData);
            setInterviews(interviewsData);

            // Cache the data
            cache.set(cacheKey, {
                applications: applicationsData,
                activities: activitiesData,
                upcomingEvents: eventsData,
                appStats: statsData,
                interviews: interviewsData,
                timestamp: Date.now()
            });

            console.log('✅ Database data loaded successfully:', {
                applications: applicationsData.length,
                activities: activitiesData.length,
                events: eventsData.length,
                interviews: interviewsData.length,
                stats: statsData
            });

        } catch (err) {
            console.error('❌ Error fetching database data (non-fatal fallback applied):', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch some data');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    // API methods for CRUD operations
    const createApplication = async (data: any) => {
        try {
            const response = await fetch('/api/applications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...data, user_id: userId })
            });

            if (!response.ok) throw new Error('Failed to create application');

            await fetchData(); // Refresh data
            return await response.json();
        } catch (error) {
            console.error('Error creating application:', error);
            throw error;
        }
    };

    const updateApplication = async (id: string, data: any) => {
        try {
            const response = await fetch(`/api/applications/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error('Failed to update application');

            await fetchData(); // Refresh data
            return await response.json();
        } catch (error) {
            console.error('Error updating application:', error);
            throw error;
        }
    };

    const deleteApplication = async (id: string) => {
        try {
            const response = await fetch(`/api/applications/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Failed to delete application');

            await fetchData(); // Refresh data
        } catch (error) {
            console.error('Error deleting application:', error);
            throw error;
        }
    };

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Transform database data to match the existing interface
    const transformedData = {
        applications: applications.map((app: any) => ({
            id: app.id.toString(),
            position: app.position,
            company: app.company ? {
                id: app.company_id.toString(),
                name: app.company.name,
                logo: app.company.logo || '/company-logos/default.png',
                industry: app.company.industry || 'Technology',
                website: app.company.website || '',
                description: app.company.description || ''
            } : {
                id: app.company_id.toString(),
                name: 'Unknown Company',
                logo: '/company-logos/default.png',
                industry: 'Technology',
                website: '',
                description: ''
            },
            dateApplied: new Date(app.date_applied),
            stage: app.stage,
            jobDescription: app.job_description || '',
            salary: app.salary_range || '',
            location: app.location || 'Remote', // Use actual location from DB
            remote: app.remote !== undefined ? app.remote : true, // Use actual remote flag from DB
            notes: app.notes || '',
            contacts: [], // Empty for now
            benefits: app.benefits ? (typeof app.benefits === 'string' ? JSON.parse(app.benefits) : app.benefits) : [],
            tech_stack: app.tech_stack ? (typeof app.tech_stack === 'string' ? JSON.parse(app.tech_stack) : app.tech_stack) : [],
            interviews: [],
            tasks: [],
            documents: [],
            allNotes: []
        })),
        activities: activities.map((activity: any) => ({
            id: activity.id.toString(),
            type: activity.type,
            title: activity.title,
            application: applications.find((app: any) => app.id === activity.application_id) || null,
            company: activity.company_name ? {
                id: '1',
                name: activity.company_name,
                logo: '/company-logos/default.png',
                industry: 'Technology'
            } : null,
            timestamp: new Date(activity.created_at),
            details: activity.description || ''
        })),
        upcomingEvents: upcomingEvents.map((event: any) => {
            // Find the application for this event to get company info
            const relatedApp = applications.find((app: any) => app.id === event.application_id) as any;

            return {
                id: event.id.toString(),
                title: event.title,
                company: relatedApp?.company ? {
                    id: relatedApp.company_id.toString(),
                    name: relatedApp.company.name,
                    logo: relatedApp.company.logo || '/company-logos/default.png',
                    industry: relatedApp.company.industry || 'Technology'
                } : {
                    id: '1',
                    name: 'General',
                    logo: '/company-logos/default.png',
                    industry: 'Technology'
                },
                date: new Date(event.event_date),
                time: new Date(event.event_date).toLocaleTimeString(),
                type: event.event_type === 'interview' ? 'Interview' :
                    event.event_type === 'deadline' ? 'Deadline' : 'Task',
                application: relatedApp || null,
                details: event.description || '',
                deadline: event.event_type === 'deadline' ? new Date(event.event_date) : undefined
            };
        }),
        appStats: appStats ? {
            totalApplications: appStats.totalApplications || 0,
            stageCount: {
                applied: Math.floor((appStats.totalApplications || 0) * 0.4),
                screening: Math.floor((appStats.totalApplications || 0) * 0.2),
                interview: appStats.interviewsScheduled || 0,
                offer: appStats.offersReceived || 0,
                rejected: appStats.rejections || 0
            },
            interviewsScheduled: appStats.interviewsScheduled || 0,
            successRate: parseFloat(appStats.successRate?.replace('%', '') || '0'),
            tasksdue: upcomingEvents.length,
            activeApplications: appStats.activeApplications || 0
        } : {
            totalApplications: 0,
            stageCount: { applied: 0, screening: 0, interview: 0, offer: 0, rejected: 0 },
            interviewsScheduled: 0,
            successRate: 0,
            tasksdue: 0,
            activeApplications: 0
        },
        userProfile: {
            id: userId.toString(),
            name: 'Alex Foster',
            email: 'alex.foster@example.com',
            avatar: '/avatar.svg',
            jobTitle: 'Software Developer',
            yearsExperience: 5,
            location: 'Remote',
            skills: ['React', 'TypeScript', 'Node.js', 'Python'],
            salary: {
                min: 100000,
                max: 150000,
                currency: 'USD'
            }
        }
    };

    return {
        ...transformedData,
        loading,
        error,
        refresh: fetchData,
        // CRUD operations
        createApplication,
        updateApplication,
        deleteApplication
    };
}
