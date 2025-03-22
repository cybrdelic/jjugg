'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import Modal from '../Modal'; // Assuming a reusable Modal component exists
import CardHeader from '../CardHeader';

// Define the CalendarEvent interface
interface CalendarEvent {
    id: string;
    type: 'interview' | 'goal' | 'milestone' | 'reminder';
    title: string;
    date: Date;
    details?: string;
    application?: Application; // For interviews
    company?: Company; // For interviews
}

// Mock data for demonstration
const mockEvents: CalendarEvent[] = [
    {
        id: 'int1',
        type: 'interview',
        title: 'Google - Technical Interview',
        date: new Date(2023, 11, 30, 10, 0),
        details: 'Prepare for algorithm questions and system design.',
        application: { id: 'app1', position: 'Senior Frontend Developer', company: { id: 'c1', name: 'Google', logo: '/companies/google.svg', industry: 'Technology' } },
        company: { id: 'c1', name: 'Google', logo: '/companies/google.svg', industry: 'Technology' },
    },
    {
        id: 'goal1',
        type: 'goal',
        title: 'Apply to 5 jobs',
        date: new Date(2023, 12, 5),
        details: 'Focus on tech companies',
    },
    {
        id: 'milestone1',
        type: 'milestone',
        title: 'First interview completed',
        date: new Date(2023, 11, 15),
    },
    {
        id: 'reminder1',
        type: 'reminder',
        title: 'Follow up with recruiter',
        date: new Date(2023, 12, 2),
    },
];

export default function Calendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState<CalendarEvent[]>(mockEvents);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

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

    const days = generateCalendarDays();

    // Get events for a specific day
    const getEventsForDay = (day: Date) => {
        return events.filter(event => event.date.toDateString() === day.toDateString());
    };

    // Highlight today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
        <section className="calendar-section">
            <CardHeader
                title="Calendar"
                subtitle="View your interviews, goals, milestones, and reminders"
                accentColor="var(--accent-blue)"
                variant="default"
            />
            <div className="calendar">
                <div className="calendar-header">
                    <button
                        onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                        aria-label="Previous month"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <h2>{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
                    <button
                        onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                        aria-label="Next month"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
                <div className="calendar-legend">
                    <div className="legend-item">
                        <span className="legend-color interview"></span>
                        <span>Interview</span>
                    </div>
                    <div className="legend-item">
                        <span className="legend-color goal"></span>
                        <span>Goal</span>
                    </div>
                    <div className="legend-item">
                        <span className="legend-color milestone"></span>
                        <span>Milestone</span>
                    </div>
                    <div className="legend-item">
                        <span className="legend-color reminder"></span>
                        <span>Reminder</span>
                    </div>
                </div>
                <div className="calendar-grid">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="calendar-day-header">{day}</div>
                    ))}
                    {days.map((day, index) => (
                        <div
                            key={index}
                            className={`calendar-day ${day && day.toDateString() === today.toDateString() ? 'today' : ''}`}
                        >
                            {day && (
                                <>
                                    <span className="day-number">{day.getDate()}</span>
                                    <div className="events">
                                        {getEventsForDay(day).map(event => (
                                            <div
                                                key={event.id}
                                                className={`event ${event.type}`}
                                                onClick={() => setSelectedEvent(event)}
                                                role="button"
                                                aria-label={`View details for ${event.title}`}
                                            >
                                                {event.title}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {selectedEvent && (
                <Modal
                    isOpen={!!selectedEvent}
                    onClose={() => setSelectedEvent(null)}
                    title={selectedEvent.title}
                >
                    <p>{selectedEvent.details || 'No additional details available.'}</p>
                    {selectedEvent.type === 'interview' && selectedEvent.application && (
                        <div>
                            <p><strong>Company:</strong> {selectedEvent.application.company.name}</p>
                            <p><strong>Position:</strong> {selectedEvent.application.position}</p>
                        </div>
                    )}
                </Modal>
            )}

            <style jsx>{`
        .calendar-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 16px;
          background: var(--background);
          border-radius: 8px;
        }

        .calendar {
          background: var(--glass-bg);
          border: 1px solid var(--border-thin);
          border-radius: 8px;
          padding: 16px;
          box-shadow: var(--shadow-sharp);
        }

        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .calendar-header h2 {
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .calendar-header button {
          background: var(--glass-bg);
          border: 1px solid var(--border-thin);
          border-radius: 6px;
          padding: 6px;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .calendar-header button:hover {
          background: var(--hover-bg);
          color: var(--text-primary);
        }

        .calendar-legend {
          display: flex;
          justify-content: center;
          gap: 16px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: var(--text-secondary);
        }

        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: 2px;
        }

        .legend-color.interview {
          background: var(--accent-green);
        }

        .legend-color.goal {
          background: var(--accent-blue);
        }

        .legend-color.milestone {
          background: var(--accent-yellow);
        }

        .legend-color.reminder {
          background: var(--accent-red);
        }

        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 8px;
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
          border-radius: 4px;
          padding: 4px;
          position: relative;
          transition: all 0.2s ease;
        }

        .calendar-day.today {
          border: 2px solid var(--accent-blue);
          box-shadow: 0 0 6px rgba(var(--accent-blue-rgb), 0.3);
        }

        .calendar-day:hover {
          background: var(--hover-bg);
        }

        .day-number {
          position: absolute;
          top: 4px;
          right: 4px;
          font-size: 12px;
          color: var(--text-secondary);
        }

        .events {
          margin-top: 16px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .event {
          font-size: 12px;
          padding: 2px 4px;
          border-radius: 4px;
          color: white;
          cursor: pointer;
          transition: transform 0.2s ease;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .event:hover {
          transform: scale(1.05);
        }

        .event.interview {
          background: var(--accent-green);
        }

        .event.goal {
          background: var(--accent-blue);
        }

        .event.milestone {
          background: var(--accent-yellow);
        }

        .event.reminder {
          background: var(--accent-red);
        }

        @media (max-width: 768px) {
          .calendar-grid {
            gap: 4px;
          }

          .calendar-day {
            min-height: 80px;
          }

          .event {
            font-size: 10px;
          }

          .calendar-legend {
            gap: 12px;
          }
        }
      `}</style>
        </section>
    );
}

// Placeholder interfaces (to be replaced with actual imports)
interface Company {
    id: string;
    name: string;
    logo: string;
    industry: string;
}

interface Application {
    id: string;
    position: string;
    company: Company;
}
