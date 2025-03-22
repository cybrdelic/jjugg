'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, Briefcase, Info, Plus, Search, Filter, X, ArrowLeft, ArrowRight, Check, Circle } from 'lucide-react';
import Modal from '../Modal';
import CardHeader from '../CardHeader';
import { upcomingEvents, applications } from '@/pages/data';
import type { Application, Company } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';

// Define the CalendarEvent interface
interface CalendarEvent {
    id: string;
    type: 'Interview' | 'Task' | 'Deadline' | 'Reminder' | 'Assessment' | 'Application';
    title: string;
    date: Date;
    time?: string;
    details?: string;
    application?: Application;
    company?: Company;
    location?: string;
    duration?: number;
    completed?: boolean;
    priority?: 'low' | 'medium' | 'high';
}

// Define calendar views
type CalendarView = 'month' | 'week' | 'agenda';

export default function Calendar() {
    const { currentTheme } = useTheme();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
    const [view, setView] = useState<CalendarView>('month');
    const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<string | null>(null);
    const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
        title: '',
        type: 'Task',
        date: new Date(),
        time: '09:00',
        details: '',
        priority: 'medium'
    });
    
    // References for animation
    const calendarRef = useRef<HTMLDivElement>(null);

    // Convert upcomingEvents to CalendarEvents
    useEffect(() => {
        // Convert upcomingEvents to our internal format
        const events: CalendarEvent[] = upcomingEvents.map(event => ({
            id: event.id,
            type: event.type,
            title: event.title,
            date: event.date,
            time: event.time,
            details: event.details,
            application: event.application,
            company: event.company,
            location: event.location,
            duration: event.duration,
            completed: false, // Default to not completed
            priority: 'medium' // Default priority
        }));

        // Add application dates as events
        applications.forEach(app => {
            events.push({
                id: `app-${app.id}`,
                type: 'Application',
                title: `Applied to ${app.company.name}`,
                date: app.dateApplied,
                details: `Applied for ${app.position} at ${app.company.name}`,
                application: app,
                company: app.company,
                completed: true, // Applications are completed events
                priority: 'medium'
            });
        });

        // Add interview events based on application stage
        applications.filter(app => app.stage === 'interview').forEach(app => {
            // Add a future interview date (7 days from now) if not already in upcomingEvents
            const hasExistingInterview = events.some(e => 
                e.type === 'Interview' && e.application?.id === app.id
            );

            if (!hasExistingInterview) {
                const interviewDate = new Date();
                interviewDate.setDate(interviewDate.getDate() + 7);
                
                events.push({
                    id: `interview-${app.id}`,
                    type: 'Interview',
                    title: `${app.company.name} Interview`,
                    date: interviewDate,
                    time: '10:00 AM',
                    details: `Interview for ${app.position} position at ${app.company.name}`,
                    application: app,
                    company: app.company,
                    location: 'Zoom Call',
                    duration: 60,
                    completed: false,
                    priority: 'high'
                });
            }
        });

        // Add assessment deadlines based on application stage
        applications.filter(app => app.stage === 'screening').forEach(app => {
            const assessmentDate = new Date();
            assessmentDate.setDate(assessmentDate.getDate() + 3);
            
            events.push({
                id: `assessment-${app.id}`,
                type: 'Assessment',
                title: `${app.company.name} Assessment Due`,
                date: assessmentDate,
                details: `Complete coding assessment for ${app.position} at ${app.company.name}`,
                application: app,
                company: app.company,
                completed: false,
                priority: 'high'
            });
        });

        setCalendarEvents(events);
    }, []);

    // Add a new event
    const handleAddEvent = () => {
        if (!newEvent.title) return;

        const event: CalendarEvent = {
            id: `custom-${Date.now()}`,
            type: newEvent.type as any,
            title: newEvent.title as string,
            date: newEvent.date || new Date(),
            time: newEvent.time,
            details: newEvent.details,
            location: newEvent.location,
            duration: newEvent.duration ? Number(newEvent.duration) : undefined,
            completed: false,
            priority: newEvent.priority as any
        };

        setCalendarEvents(prev => [...prev, event]);
        setIsAddEventModalOpen(false);
        setNewEvent({
            title: '',
            type: 'Task',
            date: new Date(),
            time: '09:00',
            details: '',
            priority: 'medium'
        });
    };

    // Toggle event completion
    const toggleEventCompletion = (eventId: string) => {
        setCalendarEvents(prev => 
            prev.map(event => 
                event.id === eventId 
                    ? { ...event, completed: !event.completed } 
                    : event
            )
        );
    };

    // Render agenda events
    const renderAgendaEvents = () => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        
        // Sort events - put today and future events first, then past events
        const sortedEvents = [...filteredEvents].sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            
            // First by future/past status (future first)
            const aIsFuture = dateA >= now;
            const bIsFuture = dateB >= now;
            
            if (aIsFuture && !bIsFuture) return -1;
            if (!aIsFuture && bIsFuture) return 1;
            
            // Then by date (chronological for future, reverse for past)
            if (aIsFuture) {
                // Both are future, sort by date (closest first)
                return dateA.getTime() - dateB.getTime();
            } else {
                // Both are past, sort by date (most recent first)
                return dateB.getTime() - dateA.getTime();
            }
        });
        
        // Group events by date using a standard object
        const groupedEvents: Record<string, CalendarEvent[]> = {};
        
        sortedEvents.forEach(event => {
            const dateKey = new Date(event.date).toLocaleDateString();
            if (!groupedEvents[dateKey]) {
                groupedEvents[dateKey] = [];
            }
            groupedEvents[dateKey].push(event);
        });
        
        // Sort each day's events by time
        Object.keys(groupedEvents).forEach(dateKey => {
            groupedEvents[dateKey].sort((a, b) => {
                if (!a.time && !b.time) return 0;
                if (!a.time) return 1;
                if (!b.time) return -1;
                return a.time.localeCompare(b.time);
            });
        });
        
        // Get date keys in chronological order for future dates and reverse for past dates
        const dateKeys = Object.keys(groupedEvents).sort((a, b) => {
            const dateA = new Date(a);
            const dateB = new Date(b);
            
            // First by future/past status
            const aIsFuture = dateA >= now;
            const bIsFuture = dateB >= now;
            
            if (aIsFuture && !bIsFuture) return -1;
            if (!aIsFuture && bIsFuture) return 1;
            
            // Then sort by date
            if (aIsFuture) {
                return dateA.getTime() - dateB.getTime();
            } else {
                return dateB.getTime() - dateA.getTime();
            }
        });
        
        // Render grouped events
        return dateKeys.map((dateKey, sectionIndex) => {
            const dateObj = new Date(dateKey);
            const isToday = dateObj.toDateString() === now.toDateString();
            const isFuture = dateObj >= now;
            
            return (
                <div 
                    key={dateKey} 
                    className={`agenda-day stagger-item ${isToday ? 'today' : ''} ${isFuture ? 'future' : 'past'}`}
                    style={{ 
                        opacity: 0,
                        transform: 'translateY(10px)',
                        transitionDelay: `${sectionIndex * 50}ms`
                    }}
                >
                    <div className="agenda-date">
                        <div className="date-header">
                            {isToday ? 'Today' : formatEventDate(dateObj)}
                            {isToday && <span className="today-marker"></span>}
                        </div>
                        <div className="date-line"></div>
                    </div>
                    <div className="agenda-day-events">
                        {groupedEvents[dateKey].map((event, eventIndex) => (
                            <div 
                                key={event.id} 
                                className={`agenda-event stagger-item ${event.completed ? 'completed' : ''} ${event.priority === 'high' ? 'high-priority' : ''}`}
                                style={{ 
                                    opacity: 0,
                                    transform: 'translateY(10px)',
                                    transitionDelay: `${(sectionIndex * 50) + (eventIndex * 20)}ms`
                                }}
                            >
                                <div 
                                    className="event-checkbox" 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleEventCompletion(event.id);
                                    }}
                                >
                                    {event.completed ? (
                                        <div className="checkbox-checked">
                                            <Check size={16} />
                                        </div>
                                    ) : (
                                        <div className="checkbox-unchecked">
                                            <Circle size={16} />
                                        </div>
                                    )}
                                </div>
                                <div 
                                    className="agenda-event-content"
                                    onClick={() => setSelectedEvent(event)}
                                >
                                    <div 
                                        className="event-indicator"
                                        style={{ backgroundColor: getEventTypeColor(event.type) }}
                                    ></div>
                                    <div className="event-details">
                                        <div className="event-title-row">
                                            <span className="event-title">{event.title}</span>
                                            <span className="event-time">
                                                {event.time ? (
                                                    <>
                                                        <Clock size={12} className="time-icon" />
                                                        {event.time}
                                                    </>
                                                ) : 'All day'}
                                            </span>
                                        </div>
                                        <div className="event-meta">
                                            <span className={`event-type ${event.type.toLowerCase()}`}>
                                                {event.type}
                                            </span>
                                            {event.company && (
                                                <span className="event-company">
                                                    <Briefcase size={12} />
                                                    {event.company.name}
                                                </span>
                                            )}
                                            {event.location && (
                                                <span className="event-location">
                                                    <MapPin size={12} />
                                                    {event.location}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        });
    };

    // Filter events based on search and type filter
    const filteredEvents = calendarEvents.filter(event => {
        const matchesSearch = !searchQuery || 
            event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (event.details && event.details.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (event.company && event.company.name.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesFilter = !filterType || event.type === filterType;
        
        return matchesSearch && matchesFilter;
    });

    // Generate days for the current month
    const generateCalendarDays = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const days: (Date | null)[] = [];
        for (let i = 0; i < firstDay; i++) {
            days.push(null); // Empty cells before the first day
        }
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }
        return days;
    };

    // Generate days for the current week
    const generateWeekDays = () => {
        const weekStart = new Date(currentDate);
        const day = currentDate.getDay();
        weekStart.setDate(weekStart.getDate() - day); // Start from Sunday
        
        const days: Date[] = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(weekStart.getDate() + i);
            days.push(date);
        }
        return days;
    };

    const days = view === 'month' ? generateCalendarDays() : generateWeekDays();

    // Get events for a specific day
    const getEventsForDay = (day: Date) => {
        return filteredEvents.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate.getDate() === day.getDate() && 
                   eventDate.getMonth() === day.getMonth() && 
                   eventDate.getFullYear() === day.getFullYear();
        });
    };

    // Get all events for the current week
    const getWeekEvents = () => {
        const weekDays = generateWeekDays();
        const firstDay = weekDays[0];
        const lastDay = weekDays[6];
        
        return filteredEvents.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= firstDay && eventDate <= lastDay;
        }).sort((a, b) => {
            // Sort by date first
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            const dateDiff = dateA.getTime() - dateB.getTime();
            if (dateDiff !== 0) return dateDiff;
            
            // Then by time if available
            if (a.time && b.time) {
                return a.time.localeCompare(b.time);
            }
            
            return 0;
        });
    };

    // Navigate to previous period
    const goToPrevious = () => {
        if (view === 'month') {
            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
        } else if (view === 'week') {
            const newDate = new Date(currentDate);
            newDate.setDate(newDate.getDate() - 7);
            setCurrentDate(newDate);
        } else {
            // For agenda view, just show 10 more events in the past
            // (Agenda view implementation would handle this)
        }
    };

    // Navigate to next period
    const goToNext = () => {
        if (view === 'month') {
            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
        } else if (view === 'week') {
            const newDate = new Date(currentDate);
            newDate.setDate(newDate.getDate() + 7);
            setCurrentDate(newDate);
        } else {
            // For agenda view, just show 10 more future events
        }
    };

    // Go to today
    const goToToday = () => {
        setCurrentDate(new Date());
    };

    // Highlight today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Format date for display
    const formatEventDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', { 
            weekday: 'long',
            year: 'numeric', 
            month: 'long', 
            day: 'numeric'
        }).format(date);
    };

    // Format date for week view header
    const formatWeekDayHeader = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', { 
            weekday: 'short',
            day: 'numeric',
        }).format(date);
    };

    // Set up event type colors
    const getEventTypeColor = (type: string, isBackground = false) => {
        const alpha = isBackground ? '33' : ''; // 20% opacity for background
        switch(type.toLowerCase()) {
            case 'interview': return `var(--accent-green${alpha})`;
            case 'task': return `var(--accent-blue${alpha})`;
            case 'deadline': return `var(--accent-red${alpha})`;
            case 'application': return `var(--accent-purple${alpha})`;
            case 'assessment': return `var(--accent-yellow${alpha})`;
            case 'reminder': return `var(--accent-red${alpha})`;
            default: return `var(--accent-blue${alpha})`;
        }
    };

    // Animation effect for view transition
    useEffect(() => {
        if (calendarRef.current) {
            calendarRef.current.classList.add('view-transition');
            setTimeout(() => {
                if (calendarRef.current) {
                    calendarRef.current.classList.remove('view-transition');
                    calendarRef.current.classList.add('view-visible');
                    
                    // Add staggered animation for elements within the view
                    const staggerElements = calendarRef.current.querySelectorAll('.stagger-item');
                    staggerElements.forEach((el, index) => {
                        setTimeout(() => {
                            (el as HTMLElement).style.opacity = '1';
                            (el as HTMLElement).style.transform = 'translateY(0)';
                        }, 50 * index);
                    });
                }
            }, 300);
        }
        
        return () => {
            if (calendarRef.current) {
                calendarRef.current.classList.remove('view-visible');
                const staggerElements = calendarRef.current.querySelectorAll('.stagger-item');
                staggerElements.forEach((el) => {
                    (el as HTMLElement).style.opacity = '0';
                    (el as HTMLElement).style.transform = 'translateY(10px)';
                });
            }
        };
    }, [view]);

    return (
        <div className="calendar-section">
            <CardHeader
                title="Calendar"
                subtitle="View your interviews, goals, tasks, and reminders"
                accentColor="var(--accent-blue)"
                variant="default"
            />
            
            <div className="calendar-controls">
                <div className="view-controls">
                    <button 
                        className={`view-btn ${view === 'month' ? 'active' : ''}`}
                        onClick={() => setView('month')}
                    >
                        Month
                    </button>
                    <button 
                        className={`view-btn ${view === 'week' ? 'active' : ''}`}
                        onClick={() => setView('week')}
                    >
                        Week
                    </button>
                    <button 
                        className={`view-btn ${view === 'agenda' ? 'active' : ''}`}
                        onClick={() => setView('agenda')}
                    >
                        Agenda
                    </button>
                </div>
                
                <div className="calendar-header">
                    <button className="today-btn" onClick={goToToday}>Today</button>
                    <button
                        onClick={goToPrevious}
                        aria-label="Previous"
                        className="nav-btn"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <h2>
                        {view === 'month' 
                            ? currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })
                            : view === 'week'
                                ? `Week of ${formatEventDate(generateWeekDays()[0])}`
                                : 'All Events'
                        }
                    </h2>
                    <button
                        onClick={goToNext}
                        aria-label="Next"
                        className="nav-btn"
                    >
                        <ChevronRight size={18} />
                    </button>
                    <button 
                        className="add-event-btn"
                        onClick={() => setIsAddEventModalOpen(true)}
                        aria-label="Add new event"
                    >
                        <Plus size={18} />
                        <span>Add</span>
                    </button>
                </div>
                
                <div className="filter-controls">
                    <div className="search-box">
                        <Search size={16} className="search-icon" />
                        <input 
                            type="text" 
                            placeholder="Search events..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button 
                                className="clear-search" 
                                onClick={() => setSearchQuery('')}
                                aria-label="Clear search"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                    
                    <div className="filter-buttons">
                        <button 
                            className={`filter-btn ${filterType === null ? 'active' : ''}`} 
                            onClick={() => setFilterType(null)}
                        >
                            All
                        </button>
                        <button 
                            className={`filter-btn interview ${filterType === 'Interview' ? 'active' : ''}`} 
                            onClick={() => setFilterType(filterType === 'Interview' ? null : 'Interview')}
                        >
                            Interviews
                        </button>
                        <button 
                            className={`filter-btn task ${filterType === 'Task' ? 'active' : ''}`} 
                            onClick={() => setFilterType(filterType === 'Task' ? null : 'Task')}
                        >
                            Tasks
                        </button>
                        <button 
                            className={`filter-btn assessment ${filterType === 'Assessment' ? 'active' : ''}`} 
                            onClick={() => setFilterType(filterType === 'Assessment' ? null : 'Assessment')}
                        >
                            Assessments
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="calendar-wrapper" ref={calendarRef}>
                {view === 'month' && (
                    <div className="month-view">
                        <div className="calendar-grid">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} className="calendar-day-header">{day}</div>
                            ))}
                            {days.map((day, index) => (
                                <div
                                    key={index}
                                    className={`calendar-day ${day && day.toDateString() === today.toDateString() ? 'today' : ''} ${day && selectedDate && day.toDateString() === selectedDate.toDateString() ? 'selected' : ''}`}
                                    onClick={() => day && setSelectedDate(day)}
                                >
                                    {day && (
                                        <>
                                            <span className="day-number">{day.getDate()}</span>
                                            <button 
                                                className="add-day-event-btn" 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setNewEvent({
                                                        ...newEvent,
                                                        date: day
                                                    });
                                                    setIsAddEventModalOpen(true);
                                                }}
                                                aria-label="Add event to this day"
                                            >
                                                <Plus size={14} />
                                            </button>
                                            <div className="events">
                                                {getEventsForDay(day).slice(0, 3).map((event, idx) => (
                                                    <div
                                                        key={event.id}
                                                        className={`event ${event.type.toLowerCase()} ${event.completed ? 'completed' : ''} stagger-item`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedEvent(event);
                                                        }}
                                                        style={{ 
                                                            backgroundColor: getEventTypeColor(event.type),
                                                            opacity: 0,
                                                            transform: 'translateY(10px)',
                                                            transitionDelay: `${idx * 50}ms`
                                                        }}
                                                        role="button"
                                                        aria-label={`View details for ${event.title}`}
                                                    >
                                                        <span className="event-title">{event.title}</span>
                                                        {event.time && (
                                                            <span className="event-time">
                                                                <Clock size={10} className="time-icon" />
                                                                {event.time}
                                                            </span>
                                                        )}
                                                        {event.priority === 'high' && (
                                                            <span className="priority-indicator" title="High priority"></span>
                                                        )}
                                                    </div>
                                                ))}
                                                {getEventsForDay(day).length > 3 && (
                                                    <div className="more-events stagger-item" 
                                                        style={{ 
                                                            opacity: 0,
                                                            transform: 'translateY(10px)',
                                                            transitionDelay: '150ms'
                                                        }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedDate(day);
                                                        }}
                                                    >
                                                        +{getEventsForDay(day).length - 3} more
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {view === 'week' && (
                    <div className="week-view">
                        <div className="week-header">
                            <div className="week-time-column">
                                <div className="week-time-header"></div>
                            </div>
                            {generateWeekDays().map((day, index) => (
                                <div 
                                    key={index} 
                                    className={`week-day-header ${day.toDateString() === today.toDateString() ? 'today' : ''}`}
                                >
                                    {formatWeekDayHeader(day)}
                                </div>
                            ))}
                        </div>
                        
                        <div className="week-grid">
                            <div className="week-timeline">
                                {Array.from({ length: 12 }).map((_, hour) => (
                                    <div key={hour} className="week-hour">
                                        <span className="hour-label">{hour + 8}:00</span>
                                        <div className="hour-line"></div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="week-days">
                                {generateWeekDays().map((day, dayIndex) => (
                                    <div key={dayIndex} className="week-day-column">
                                        {getEventsForDay(day)
                                            .filter(event => event.time) // Only show events with time in the week view grid
                                            .map((event, eventIndex) => {
                                                // Calculate position based on time
                                                const timeString = event.time || '9:00';
                                                const [hours, minutes] = timeString.split(':');
                                                const hour = parseInt(hours, 10) % 12 + (timeString.toLowerCase().includes('pm') ? 12 : 0);
                                                const minute = parseInt(minutes, 10);
                                                const topPosition = ((hour - 8) * 60 + minute) * 1.5; // 1.5px per minute
                                                const height = event.duration ? event.duration * 1.5 : 60; // Default 60px height (1 hour)
                                                
                                                return (
                                                    <div
                                                        key={`${event.id}-${eventIndex}`}
                                                        className={`week-event ${event.type.toLowerCase()} ${event.completed ? 'completed' : ''}`}
                                                        style={{
                                                            top: `${topPosition}px`,
                                                            height: `${height}px`,
                                                            backgroundColor: getEventTypeColor(event.type)
                                                        }}
                                                        onClick={() => setSelectedEvent(event)}
                                                    >
                                                        <div className="week-event-content">
                                                            <div className="week-event-title">{event.title}</div>
                                                            <div className="week-event-time">{event.time}</div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className="week-events-list">
                            <h3>All-day and untimed events</h3>
                            <div className="week-events-grid">
                                {generateWeekDays().map((day, dayIndex) => (
                                    <div key={dayIndex} className="week-day-events">
                                        {getEventsForDay(day)
                                            .filter(event => !event.time) // Only show events without time here
                                            .map((event, eventIndex) => (
                                                <div
                                                    key={`${event.id}-${eventIndex}`}
                                                    className={`week-list-event ${event.type.toLowerCase()} ${event.completed ? 'completed' : ''}`}
                                                    style={{ backgroundColor: getEventTypeColor(event.type, true) }}
                                                    onClick={() => setSelectedEvent(event)}
                                                >
                                                    <span className="event-dot" style={{ backgroundColor: getEventTypeColor(event.type) }}></span>
                                                    <span className="event-title">{event.title}</span>
                                                </div>
                                            ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                
                {view === 'agenda' && (
                    <div className="agenda-view">
                        <div className="agenda-header">
                            <h3>Upcoming Events</h3>
                        </div>
                        
                        {filteredEvents.length === 0 ? (
                            <div className="no-events">
                                <div className="no-events-icon">
                                    <CalendarIcon size={48} />
                                </div>
                                <p>No events match your search or filter criteria</p>
                                <button 
                                    className="reset-filters"
                                    onClick={() => {
                                        setSearchQuery('');
                                        setFilterType(null);
                                    }}
                                >
                                    Reset filters
                                </button>
                            </div>
                        ) : (
                            <div className="agenda-events">
                                {renderAgendaEvents()}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Selected Date Events Modal */}
            {selectedDate && (
                <Modal
                    isOpen={!!selectedDate}
                    onClose={() => setSelectedDate(null)}
                    title={formatEventDate(selectedDate)}
                >
                    <div className="selected-date-events">
                        {getEventsForDay(selectedDate).length === 0 ? (
                            <div className="no-events-for-day">
                                <p>No events for this day</p>
                                <button 
                                    className="add-event-for-day"
                                    onClick={() => {
                                        setNewEvent({
                                            ...newEvent,
                                            date: selectedDate
                                        });
                                        setSelectedDate(null);
                                        setIsAddEventModalOpen(true);
                                    }}
                                >
                                    <Plus size={16} />
                                    Add event
                                </button>
                            </div>
                        ) : (
                            <div className="day-events-list">
                                {getEventsForDay(selectedDate)
                                    .sort((a, b) => {
                                        if (!a.time && !b.time) return 0;
                                        if (!a.time) return 1;
                                        if (!b.time) return -1;
                                        return a.time.localeCompare(b.time);
                                    })
                                    .map(event => (
                                        <div 
                                            key={event.id} 
                                            className={`day-event ${event.type.toLowerCase()} ${event.completed ? 'completed' : ''}`}
                                            onClick={() => {
                                                setSelectedDate(null);
                                                setSelectedEvent(event);
                                            }}
                                        >
                                            <div className="day-event-time">
                                                {event.time || 'All day'}
                                            </div>
                                            <div className="day-event-content">
                                                <div 
                                                    className="event-color"
                                                    style={{ backgroundColor: getEventTypeColor(event.type) }}
                                                ></div>
                                                <div className="day-event-details">
                                                    <div className="day-event-title">
                                                        {event.title}
                                                    </div>
                                                    <div className="day-event-meta">
                                                        {event.location && (
                                                            <span className="event-location">
                                                                <MapPin size={14} />
                                                                {event.location}
                                                            </span>
                                                        )}
                                                        {event.company && (
                                                            <span className="event-company">
                                                                <Briefcase size={14} />
                                                                {event.company.name}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div 
                                                className="event-checkbox" 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleEventCompletion(event.id);
                                                }}
                                            >
                                                {event.completed ? <Check size={16} /> : <Circle size={16} />}
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        )}
                    </div>
                </Modal>
            )}

            {/* Event Detail Modal */}
            {selectedEvent && (
                <Modal
                    isOpen={!!selectedEvent}
                    onClose={() => setSelectedEvent(null)}
                    title={selectedEvent.title}
                >
                    <div className="event-details">
                        <div className="event-info">
                            <div 
                                className="event-type-badge"
                                style={{ backgroundColor: getEventTypeColor(selectedEvent.type) }}
                            >
                                {selectedEvent.type}
                            </div>
                            
                            <div className="event-info-item">
                                <CalendarIcon size={16} />
                                <span>{formatEventDate(new Date(selectedEvent.date))}</span>
                            </div>
                            {selectedEvent.time && (
                                <div className="event-info-item">
                                    <Clock size={16} />
                                    <span>{selectedEvent.time}</span>
                                    {selectedEvent.duration && (
                                        <span className="duration">({selectedEvent.duration} min)</span>
                                    )}
                                </div>
                            )}
                            {selectedEvent.location && (
                                <div className="event-info-item">
                                    <MapPin size={16} />
                                    <span>{selectedEvent.location}</span>
                                </div>
                            )}
                            {selectedEvent.company && (
                                <div className="event-info-item">
                                    <Briefcase size={16} />
                                    <span>{selectedEvent.company.name}</span>
                                </div>
                            )}
                            
                            <div className="event-completion">
                                <button 
                                    className={`completion-toggle ${selectedEvent.completed ? 'completed' : ''}`}
                                    onClick={() => toggleEventCompletion(selectedEvent.id)}
                                >
                                    {selectedEvent.completed ? (
                                        <>
                                            <Check size={16} />
                                            <span>Completed</span>
                                        </>
                                    ) : (
                                        <>
                                            <Circle size={16} />
                                            <span>Mark as complete</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                        
                        <div className="event-details-content">
                            <div className="event-info-item">
                                <Info size={16} />
                                <span><strong>Details:</strong></span>
                            </div>
                            <p className="event-description">{selectedEvent.details || 'No additional details available.'}</p>
                            
                            {selectedEvent.application && (
                                <div className="application-info">
                                    <h4>Application Details</h4>
                                    <p><strong>Position:</strong> {selectedEvent.application.position}</p>
                                    {selectedEvent.application.stage && (
                                        <p><strong>Current Stage:</strong> {selectedEvent.application.stage}</p>
                                    )}
                                    {selectedEvent.application.salary && (
                                        <p><strong>Salary:</strong> {selectedEvent.application.salary}</p>
                                    )}
                                    {selectedEvent.application.location && (
                                        <p><strong>Location:</strong> {selectedEvent.application.location}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </Modal>
            )}

            {/* Add Event Modal */}
            <Modal
                isOpen={isAddEventModalOpen}
                onClose={() => setIsAddEventModalOpen(false)}
                title="Add New Event"
            >
                <div className="add-event-form">
                    <div className="form-group">
                        <label htmlFor="title">Title</label>
                        <input
                            type="text"
                            id="title"
                            value={newEvent.title}
                            onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                            placeholder="Enter event title"
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="type">Type</label>
                        <select
                            id="type"
                            value={newEvent.type}
                            onChange={(e) => setNewEvent({...newEvent, type: e.target.value as any})}
                        >
                            <option value="Task">Task</option>
                            <option value="Interview">Interview</option>
                            <option value="Deadline">Deadline</option>
                            <option value="Reminder">Reminder</option>
                            <option value="Assessment">Assessment</option>
                        </select>
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="date">Date</label>
                            <input
                                type="date"
                                id="date"
                                value={newEvent.date ? new Date(newEvent.date).toISOString().split('T')[0] : ''}
                                onChange={(e) => setNewEvent({
                                    ...newEvent, 
                                    date: e.target.value ? new Date(e.target.value) : new Date()
                                })}
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="time">Time (optional)</label>
                            <input
                                type="time"
                                id="time"
                                value={newEvent.time || ''}
                                onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                            />
                        </div>
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="location">Location (optional)</label>
                            <input
                                type="text"
                                id="location"
                                value={newEvent.location || ''}
                                onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                                placeholder="Enter location"
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="duration">Duration (min)</label>
                            <input
                                type="number"
                                id="duration"
                                value={newEvent.duration || ''}
                                onChange={(e) => setNewEvent({...newEvent, duration: e.target.value})}
                                placeholder="Duration in minutes"
                                min="0"
                            />
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="priority">Priority</label>
                        <select
                            id="priority"
                            value={newEvent.priority}
                            onChange={(e) => setNewEvent({...newEvent, priority: e.target.value as any})}
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="details">Details (optional)</label>
                        <textarea
                            id="details"
                            value={newEvent.details || ''}
                            onChange={(e) => setNewEvent({...newEvent, details: e.target.value})}
                            placeholder="Enter event details"
                            rows={4}
                        />
                    </div>
                    
                    <div className="form-actions">
                        <button 
                            className="cancel-btn"
                            onClick={() => setIsAddEventModalOpen(false)}
                        >
                            Cancel
                        </button>
                        <button 
                            className="add-btn"
                            onClick={handleAddEvent}
                            disabled={!newEvent.title}
                        >
                            Add Event
                        </button>
                    </div>
                </div>
            </Modal>

            <style jsx>{`
        /* Base Calendar Section Styles */
        .calendar-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 16px;
          background: var(--background);
          border-radius: 8px;
        }
        
        /* Calendar Controls */
        .calendar-controls {
          display: flex;
          flex-direction: column;
          gap: 12px;
          background: var(--glass-bg);
          border: 1px solid var(--border-thin);
          border-radius: 8px;
          padding: 16px;
          box-shadow: var(--shadow-sharp);
        }
        
        /* View Controls */
        .view-controls {
          display: flex;
          justify-content: center;
          gap: 8px;
          border-bottom: 1px solid var(--border-thin);
          padding-bottom: 12px;
        }
        
        .view-btn {
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          background: transparent;
          color: var(--text-secondary);
          border: 1px solid transparent;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .view-btn:hover {
          background: var(--hover-bg);
          color: var(--text-primary);
        }
        
        .view-btn.active {
          background: var(--accent-blue);
          color: white;
          border-color: var(--accent-blue);
        }
        
        /* Calendar Header */
        .calendar-header {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 12px;
          margin: 4px 0 12px;
        }
        
        .calendar-header h2 {
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
          min-width: 180px;
          text-align: center;
        }
        
        .nav-btn, .today-btn, .add-event-btn {
          background: var(--glass-bg);
          border: 1px solid var(--border-thin);
          border-radius: 6px;
          padding: 6px 8px;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .today-btn, .add-event-btn {
          font-size: 14px;
          font-weight: 500;
          padding: 6px 12px;
        }
        
        .add-event-btn {
          margin-left: auto;
          background: var(--accent-green);
          color: white;
          border-color: var(--accent-green);
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .nav-btn:hover, .today-btn:hover {
          background: var(--hover-bg);
          color: var(--text-primary);
        }
        
        .add-event-btn:hover {
          filter: brightness(1.1);
          transform: translateY(-1px);
        }
        
        /* Filter Controls */
        .filter-controls {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-top: 8px;
          padding-top: 12px;
          border-top: 1px solid var(--border-thin);
        }
        
        .search-box {
          display: flex;
          align-items: center;
          background: var(--input-bg);
          border: 1px solid var(--border-thin);
          border-radius: 6px;
          padding: 6px 10px;
          flex: 1;
          min-width: 200px;
          max-width: 300px;
          position: relative;
        }
        
        .search-box input {
          border: none;
          background: transparent;
          color: var(--text-primary);
          font-size: 14px;
          padding: 0 6px;
          width: 100%;
          outline: none;
        }
        
        .search-icon {
          color: var(--text-secondary);
        }
        
        .clear-search {
          border: none;
          background: transparent;
          color: var(--text-secondary);
          padding: 0;
          cursor: pointer;
          display: flex;
          align-items: center;
        }
        
        .filter-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        
        .filter-btn {
          padding: 4px 10px;
          border-radius: 16px;
          font-size: 13px;
          background: var(--glass-bg);
          border: 1px solid var(--border-thin);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .filter-btn:hover {
          background: var(--hover-bg);
          color: var(--text-primary);
        }
        
        .filter-btn.active {
          background: var(--accent-blue);
          color: white;
          border-color: var(--accent-blue);
        }
        
        .filter-btn.interview.active {
          background: var(--accent-green);
          border-color: var(--accent-green);
        }
        
        .filter-btn.task.active {
          background: var(--accent-blue);
          border-color: var(--accent-blue);
        }
        
        .filter-btn.assessment.active {
          background: var(--accent-yellow);
          border-color: var(--accent-yellow);
        }
        
        /* Calendar Wrapper (for transitions) */
        .calendar-wrapper {
          position: relative;
          transition: all 0.3s ease;
        }
        
        .view-transition {
          opacity: 0;
          transform: translateY(10px);
        }
        
        /* Month View */
        .month-view {
          margin-top: 8px;
          border: 1px solid var(--border-thin);
          border-radius: 8px;
          padding: 12px;
          background: var(--glass-bg);
          box-shadow: var(--shadow-sharp);
        }
        
        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 8px;
          position: relative;
          background-image: 
            linear-gradient(to right, var(--border-thin) 1px, transparent 1px),
            linear-gradient(to bottom, var(--border-thin) 1px, transparent 1px);
          background-size: calc(100% / 7) 100%, 100% calc(100% / 6);
          background-position: -0.5px -0.5px;
        }
        
        .calendar-day-header {
          text-align: center;
          font-weight: 600;
          font-size: 14px;
          color: var(--text-secondary);
          padding: 8px 0;
        }
        
        .calendar-day {
          min-height: 100px;
          background: var(--glass-bg);
          border: 1px solid var(--border-thin);
          border-radius: 8px;
          padding: 4px;
          position: relative;
          transition: all 0.2s ease;
          cursor: pointer;
          box-shadow: inset 0 0 0 1px rgba(0,0,0,0.05);
        }
        
        .calendar-day.today {
          border: 2px solid var(--accent-blue);
          box-shadow: 0 0 6px rgba(var(--accent-blue-rgb), 0.3);
        }
        
        .calendar-day.selected {
          background: var(--hover-bg);
          border-color: var(--accent-blue);
          box-shadow: var(--shadow-sharp);
        }
        
        .calendar-day:hover:not(.selected) {
          background: var(--hover-bg);
          transform: translateY(-2px);
          box-shadow: var(--shadow);
        }
        
        .day-number {
          position: absolute;
          top: 6px;
          right: 8px;
          font-size: 14px;
          font-weight: 500;
          color: var(--text-secondary);
          height: 24px;
          width: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
        }
        
        .today .day-number {
          background: var(--accent-blue);
          color: white;
        }
        
        .add-day-event-btn {
          position: absolute;
          top: 6px;
          left: 6px;
          width: 22px;
          height: 22px;
          background: var(--glass-bg);
          border: 1px solid var(--border-thin);
          border-radius: 50%;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          opacity: 0;
          transition: all 0.2s ease;
          padding: 0;
        }
        
        .calendar-day:hover .add-day-event-btn {
          opacity: 1;
        }
        
        .add-day-event-btn:hover {
          background: var(--accent-green);
          color: white;
          transform: scale(1.1);
        }
        
        .events {
          margin-top: 28px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .event {
          font-size: 12px;
          padding: 4px 6px;
          border-radius: 4px;
          color: white;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          overflow: hidden;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
        
        .event:hover {
          transform: scale(1.02) translateY(-1px);
          filter: brightness(1.1);
          box-shadow: 0 3px 6px rgba(0,0,0,0.15);
        }
        
        .event:active {
          transform: scale(0.98);
          filter: brightness(0.95);
        }
        
        .event.completed {
          opacity: 0.7;
          text-decoration: line-through;
        }
        
        .event-title {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          flex: 1;
          font-weight: 500;
        }
        
        .event-time {
          font-size: 10px;
          opacity: 0.9;
          margin-left: 4px;
          display: flex;
          align-items: center;
          gap: 2px;
        }
        
        .time-icon {
          opacity: 0.8;
        }
        
        .priority-indicator {
          position: absolute;
          top: 4px;
          right: 4px;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: #fff;
          box-shadow: 0 0 0 1px rgba(255,255,255,0.5);
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7);
          }
          70% {
            box-shadow: 0 0 0 5px rgba(255, 255, 255, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
          }
        }
        
        .more-events {
          font-size: 12px;
          padding: 2px 4px;
          text-align: center;
          color: var(--text-secondary);
          background: var(--glass-bg);
          border: 1px dashed var(--border-thin);
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .more-events:hover {
          background: var(--hover-bg);
          color: var(--text-primary);
        }
        
        /* Week View */
        .week-view {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 8px;
        }
        
        .week-header {
          display: grid;
          grid-template-columns: 60px repeat(7, 1fr);
          gap: 4px;
        }
        
        .week-time-header {
          height: 40px;
        }
        
        .week-day-header {
          height: 40px;
          background: var(--glass-bg);
          border: 1px solid var(--border-thin);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 500;
          font-size: 14px;
        }
        
        .week-day-header.today {
          background: var(--accent-blue);
          color: white;
          border-color: var(--accent-blue);
        }
        
        .week-grid {
          position: relative;
          display: flex;
          height: 720px; /* 12 hours * 60px */
          overflow-y: auto;
          border: 1px solid var(--border-thin);
          border-radius: 8px;
          background: var(--glass-bg);
        }
        
        .week-timeline {
          width: 60px;
          position: relative;
          border-right: 1px solid var(--border-thin);
        }
        
        .week-hour {
          height: 60px;
          position: relative;
          padding-right: 8px;
        }
        
        .hour-label {
          position: absolute;
          top: -9px;
          right: 8px;
          font-size: 12px;
          color: var(--text-secondary);
        }
        
        .hour-line {
          position: absolute;
          top: 0;
          right: 0;
          width: 8px;
          height: 1px;
          background: var(--border-thin);
        }
        
        .week-days {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          flex: 1;
          position: relative;
        }
        
        .week-day-column {
          position: relative;
          border-right: 1px solid var(--border-thin);
          background-image: linear-gradient(0deg, 
            var(--border-thin) 1px, 
            transparent 1px
          );
          background-size: 100% 60px;
        }
        
        .week-day-column:last-child {
          border-right: none;
        }
        
        .week-event {
          position: absolute;
          left: 2px;
          right: 2px;
          border-radius: 4px;
          font-size: 12px;
          color: white;
          padding: 4px;
          overflow: hidden;
          cursor: pointer;
          z-index: 10;
          box-shadow: var(--shadow-sharp);
          transition: all 0.2s ease;
        }
        
        .week-event:hover {
          transform: scale(1.02);
          z-index: 20;
          box-shadow: var(--shadow);
        }
        
        .week-event.completed {
          opacity: 0.7;
        }
        
        .week-event-content {
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
        }
        
        .week-event-title {
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .week-event-time {
          font-size: 11px;
          opacity: 0.9;
        }
        
        .week-events-list {
          padding: 12px;
          background: var(--glass-bg);
          border: 1px solid var(--border-thin);
          border-radius: 8px;
        }
        
        .week-events-list h3 {
          font-size: 16px;
          font-weight: 500;
          margin: 0 0 12px 0;
          color: var(--text-primary);
        }
        
        .week-events-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
        }
        
        .week-list-event {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-bottom: 4px;
        }
        
        .week-list-event:hover {
          filter: brightness(0.95);
        }
        
        .week-list-event.completed {
          opacity: 0.7;
          text-decoration: line-through;
        }
        
        .event-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        
        /* Agenda View */
        .agenda-view {
          margin-top: 8px;
          background: var(--glass-bg);
          border: 1px solid var(--border-thin);
          border-radius: 8px;
          overflow: hidden;
        }
        
        .agenda-header {
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-thin);
        }
        
        .agenda-header h3 {
          font-size: 16px;
          font-weight: 500;
          margin: 0;
          color: var(--text-primary);
        }
        
        .no-events {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          text-align: center;
          color: var(--text-secondary);
        }
        
        .no-events-icon {
          margin-bottom: 16px;
          opacity: 0.5;
        }
        
        .reset-filters {
          margin-top: 16px;
          padding: 6px 12px;
          background: var(--accent-blue);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .reset-filters:hover {
          filter: brightness(1.1);
        }
        
        .agenda-events {
          max-height: 600px;
          overflow-y: auto;
        }
        
        .agenda-day {
          margin-bottom: 16px;
        }
        
        .agenda-date {
          padding: 8px 16px;
          position: relative;
        }
        
        .date-header {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
          margin-bottom: 8px;
        }
        
        .date-line {
          height: 1px;
          background: var(--border-thin);
          width: 100%;
        }
        
        .agenda-day-events {
          padding: 0 16px;
        }
        
        .agenda-event {
          display: flex;
          align-items: center;
          padding: 12px 8px;
          border-bottom: 1px solid var(--border-thin);
          transition: all 0.2s ease;
        }
        
        .agenda-event:last-child {
          border-bottom: none;
        }
        
        .agenda-event:hover {
          background: var(--hover-bg);
        }
        
        .agenda-event.completed .event-title {
          text-decoration: line-through;
          opacity: 0.7;
        }
        
        .event-checkbox {
          margin-right: 12px;
          cursor: pointer;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .event-checkbox:hover {
          color: var(--accent-green);
        }
        
        .agenda-event-content {
          display: flex;
          flex: 1;
          cursor: pointer;
        }
        
        .event-indicator {
          width: 4px;
          border-radius: 2px;
          margin-right: 12px;
          background: var(--accent-blue);
        }
        
        .event-details {
          flex: 1;
        }
        
        .event-title-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
        }
        
        .event-title {
          font-weight: 500;
          color: var(--text-primary);
        }
        
        .event-time {
          color: var(--text-secondary);
          font-size: 13px;
        }
        
        .event-meta {
          display: flex;
          gap: 12px;
          font-size: 12px;
          color: var(--text-secondary);
        }
        
        .event-type {
          text-transform: capitalize;
        }
        
        /* Selected Date Events Modal */
        .selected-date-events {
          max-height: 70vh;
          overflow-y: auto;
        }
        
        .no-events-for-day {
          padding: 20px;
          text-align: center;
          color: var(--text-secondary);
        }
        
        .add-event-for-day {
          margin-top: 12px;
          padding: 6px 12px;
          background: var(--accent-blue);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-left: auto;
          margin-right: auto;
          transition: all 0.2s ease;
        }
        
        .add-event-for-day:hover {
          filter: brightness(1.1);
        }
        
        .day-events-list {
          padding: 8px;
        }
        
        .day-event {
          display: flex;
          margin-bottom: 8px;
          padding: 10px;
          border-radius: 6px;
          background: var(--glass-bg);
          border: 1px solid var(--border-thin);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .day-event:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow);
        }
        
        .day-event.completed .day-event-title {
          text-decoration: line-through;
          opacity: 0.7;
        }
        
        .day-event-time {
          width: 80px;
          font-size: 14px;
          color: var(--text-secondary);
          font-weight: 500;
        }
        
        .day-event-content {
          display: flex;
          flex: 1;
        }
        
        .event-color {
          width: 4px;
          border-radius: 2px;
          margin-right: 10px;
        }
        
        .day-event-details {
          flex: 1;
        }
        
        .day-event-title {
          font-weight: 500;
          margin-bottom: 6px;
          color: var(--text-primary);
        }
        
        .day-event-meta {
          display: flex;
          gap: 12px;
          font-size: 12px;
          color: var(--text-secondary);
        }
        
        .event-location, .event-company {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        /* Event Detail Modal */
        .event-details {
          padding: 16px;
          max-height: 70vh;
          overflow-y: auto;
        }
        
        .event-type-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          color: white;
          margin-bottom: 16px;
        }
        
        .event-info {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--border-thin);
        }
        
        .event-info-item {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-primary);
        }
        
        .duration {
          color: var(--text-secondary);
          font-size: 13px;
          margin-left: 4px;
        }
        
        .event-completion {
          margin-top: 8px;
        }
        
        .completion-toggle {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border: 1px solid var(--border-thin);
          border-radius: 4px;
          background: var(--glass-bg);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .completion-toggle:hover {
          background: var(--hover-bg);
          color: var(--text-primary);
        }
        
        .completion-toggle.completed {
          background: var(--accent-green);
          color: white;
          border-color: var(--accent-green);
        }
        
        .event-details-content {
          margin-top: 16px;
        }
        
        .event-description {
          margin-top: 8px;
          line-height: 1.5;
          color: var(--text-primary);
        }
        
        .application-info {
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid var(--border-thin);
        }
        
        .application-info h4 {
          margin-top: 0;
          margin-bottom: 12px;
          font-size: 16px;
          font-weight: 500;
          color: var(--text-primary);
        }
        
        /* Add Event Form */
        .add-event-form {
          padding: 16px;
        }
        
        .form-group {
          margin-bottom: 16px;
        }
        
        .form-row {
          display: flex;
          gap: 16px;
          margin-bottom: 16px;
        }
        
        .form-row .form-group {
          flex: 1;
          margin-bottom: 0;
        }
        
        label {
          display: block;
          margin-bottom: 6px;
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
        }
        
        input[type="text"],
        input[type="date"],
        input[type="time"],
        input[type="number"],
        select,
        textarea {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid var(--border-thin);
          border-radius: 4px;
          background: var(--input-bg);
          color: var(--text-primary);
          font-size: 14px;
        }
        
        textarea {
          resize: vertical;
        }
        
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 24px;
        }
        
        .cancel-btn {
          padding: 8px 16px;
          border: 1px solid var(--border-thin);
          border-radius: 4px;
          background: var(--glass-bg);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .cancel-btn:hover {
          background: var(--hover-bg);
          color: var(--text-primary);
        }
        
        .add-btn {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          background: var(--accent-blue);
          color: white;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .add-btn:hover:not(:disabled) {
          filter: brightness(1.1);
        }
        
        .add-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Responsive Styles */
        @media (max-width: 768px) {
          .calendar-controls {
            padding: 12px;
          }
          
          .view-controls, .calendar-header, .filter-controls {
            flex-wrap: wrap;
          }
          
          .calendar-header h2 {
            min-width: 0;
            font-size: 16px;
          }
          
          .filter-controls {
            flex-direction: column;
            align-items: stretch;
          }
          
          .search-box {
            max-width: none;
          }
          
          .calendar-grid {
            gap: 4px;
          }
          
          .calendar-day {
            min-height: 80px;
          }
          
          .day-number {
            font-size: 12px;
            height: 20px;
            width: 20px;
          }
          
          .events {
            margin-top: 24px;
          }
          
          .event {
            font-size: 10px;
            padding: 2px 4px;
          }
          
          .week-header {
            grid-template-columns: 40px repeat(7, 1fr);
          }
          
          .week-timeline {
            width: 40px;
          }
          
          .hour-label {
            font-size: 10px;
          }
          
          .week-day-header {
            font-size: 12px;
            padding: 4px;
          }
          
          .form-row {
            flex-direction: column;
            gap: 16px;
          }
        }
      `}</style>
        </div>
    );
}