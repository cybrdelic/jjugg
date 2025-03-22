'use client';
import { JSX, useState, useEffect } from 'react';
import GlassSidebar from '../components/GlassSidebar';
import { useTheme } from '@/contexts/ThemeContext';
import { SectionKey, NavItemType } from '@/components/types';
import {
  House, FileText, Bell, Users, User, Target, Clock, Menu, ChevronLeft
} from 'lucide-react';
import ProfileArtifacts from '@/components/sections/ProfileArtifacts';
import Interviews from '@/components/sections/Interviews';
import Timeline from '@/components/sections/Timeline';
import Goals from '@/components/sections/Goals';
import Reminders from '@/components/sections/Reminders';
import DashboardHome from '@/components/sections/DashboardHome';
import { activities, applications, appStats, upcomingEvents, userProfile } from './data';
import Calendar from '@/components/sections/Calendar';

// Section Components
const DashboardHomeSection = (): JSX.Element => <DashboardHome />;
const ApplicationsSection = (): JSX.Element => require('../components/sections/Applications').default();
const RemindersSection = (): JSX.Element => <Reminders />;
const AnalyticsSection = (): JSX.Element => (
  <section className="glass-card">
    <h1 className="text-primary">Analytics</h1>
    <p className="text-secondary">Analytics data here...</p>
  </section>
);
const InterviewsSection = (): JSX.Element => <Interviews />;
const ProfileArtifactsSection = (): JSX.Element => <ProfileArtifacts />;
const GoalsSection = (): JSX.Element => <Goals />;
const TimelineSection = (): JSX.Element => <Timeline />;
const CalendarSection = (): JSX.Element => (
  <Calendar />
);

const sections: Record<SectionKey, () => JSX.Element> = {
  'dashboard-home': DashboardHomeSection,
  'applications-section': ApplicationsSection,
  'reminders-section': RemindersSection,
  'analytics-section': AnalyticsSection,
  'interviews-section': InterviewsSection,
  'profile-artifacts-section': ProfileArtifactsSection,
  'goals-section': GoalsSection,
  'timeline-section': TimelineSection,
  'calendar-section': CalendarSection,
};

export default function Home(): JSX.Element {
  const { currentTheme } = useTheme();
  const [currentSection, setCurrentSection] = useState<SectionKey>('dashboard-home');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [width, setWidth] = useState(280);
  const [isLoaded, setIsLoaded] = useState(false);

  const sidebarItems: NavItemType[] = [
    { id: 'dashboard-home', key: 'dashboard-home', label: 'Dashboard', icon: <House className="w-5 h-5" />, color: 'var(--accent-blue)', badge: { count: 3 } },
    { id: 'applications-section', key: 'applications-section', label: 'Applications', icon: <FileText className="w-5 h-5" />, color: 'var(--accent-purple)', badge: { count: applications.length } },
    { id: 'reminders-section', key: 'reminders-section', label: 'Reminders', icon: <Bell className="w-5 h-5" />, color: 'var(--accent-pink)', badge: { count: upcomingEvents.length } },
    { id: 'interviews-section', key: 'interviews-section', label: 'Interviews', icon: <Users className="w-5 h-5" />, color: 'var(--accent-orange)', badge: { count: appStats.interviewsScheduled } },
    { id: 'profile-artifacts-section', key: 'profile-artifacts-section', label: 'Profile', icon: <User className="w-5 h-5" />, color: 'var(--accent-green)' },
    { id: 'goals-section', key: 'goals-section', label: 'Goals', icon: <Target className="w-5 h-5" />, color: 'var(--accent-yellow)' },
    { id: 'timeline-section', key: 'timeline-section', label: 'Timeline', icon: <Clock className="w-5 h-5" />, color: 'var(--accent-red)', badge: { count: activities.length } },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleResize = (newWidth: number) => {
    setWidth(newWidth);
    if (newWidth < 100) setIsCollapsed(true);
    else setIsCollapsed(false);
  };

  return (
    <div className={`app-container reveal-loaded ${isLoaded ? 'loaded' : ''}`}>
      <GlassSidebar
        items={sidebarItems}
        currentSection={currentSection}
        setCurrentSection={setCurrentSection}
        width={width}
        isCollapsed={isCollapsed}
        onResize={handleResize}
        userName={userProfile.name}
        userAvatar={userProfile.avatar}
      />
      <main className={`glass-main ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="reveal-element">
          {sections[currentSection]()}
        </div>

        <button
          className="mobile-menu-toggle"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? "Open sidebar" : "Close sidebar"}
        >
          {isCollapsed ? (
            <Menu size={20} className="mobile-menu-icon" />
          ) : (
            <ChevronLeft size={20} className="mobile-menu-icon" />
          )}
        </button>
      </main>

      <div className="floating-particles">
        <span className="particle"></span>
        <span className="particle"></span>
        <span className="particle"></span>
        <span className="particle"></span>
        <span className="particle"></span>
        <span className="particle"></span>
        <span className="particle"></span>
        <span className="particle"></span>
      </div>

      <div className="bg-gradient-1"></div>
      <div className="bg-gradient-2"></div>

      <style jsx>{`
        .app-container {
          display: flex;
          min-height: 100vh;
          background: var(--background);
          position: relative;
        }

        .glass-main {
          margin-left: ${isCollapsed ? '70px' : `${width}px`};
          flex-grow: 1;
          padding: 20px;
          transition: margin-left var(--transition-normal);
        }

        .mobile-menu-toggle {
          display: none;
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: var(--glass-bg);
          border: 1px solid var(--border-thin);
          box-shadow: var(--shadow);
          color: var(--text-primary);
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: var(--z-fixed);
          transition: all var(--transition-normal);
        }

        .mobile-menu-toggle:hover {
          transform: scale(1.05);
          box-shadow: var(--shadow-lg);
          border-color: var(--accent-primary);
        }

        .floating-particles {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: var(--z-negative);
        }

        .particle {
          position: absolute;
          border-radius: 50%;
          background: rgba(var(--accent-blue-rgb), 0.2);
          animation: float 15s infinite ease-in-out;
        }

        .particle:nth-child(1) { width: 10px; height: 10px; top: 10%; left: 20%; animation-delay: 0s; }
        .particle:nth-child(2) { width: 15px; height: 15px; top: 30%; left: 70%; animation-delay: 2s; }
        .particle:nth-child(3) { width: 8px; height: 8px; top: 50%; left: 40%; animation-delay: 4s; }
        .particle:nth-child(4) { width: 12px; height: 12px; top: 70%; left: 10%; animation-delay: 6s; }
        .particle:nth-child(5) { width: 20px; height: 20px; top: 20%; left: 90%; animation-delay: 8s; }
        .particle:nth-child(6) { width: 14px; height: 14px; top: 80%; left: 60%; animation-delay: 10s; }
        .particle:nth-child(7) { width: 9px; height: 9px; top: 40%; left: 30%; animation-delay: 12s; }
        .particle:nth-child(8) { width: 16px; height: 16px; top: 60%; left: 80%; animation-delay: 14s; }

        .bg-gradient-1, .bg-gradient-2 {
          position: fixed;
          border-radius: 50%;
          filter: blur(40px);
          z-index: var(--z-negative);
          opacity: 0.5;
          pointer-events: none;
        }

        .bg-gradient-1 {
          width: 50vw;
          height: 50vw;
          background: radial-gradient(circle, rgba(var(--accent-blue-rgb), 0.15), transparent 70%);
          top: -10vw;
          right: -10vw;
          animation: float 20s infinite alternate ease-in-out;
        }

        .bg-gradient-2 {
          width: 60vw;
          height: 60vw;
          background: radial-gradient(circle, rgba(var(--accent-purple-rgb), 0.1), transparent 70%);
          bottom: -20vw;
          left: -10vw;
          animation: float-reverse 25s infinite alternate-reverse ease-in-out;
        }

        @keyframes float {
          0% { transform: translate(0, 0); }
          50% { transform: translate(20px, -30px); }
          100% { transform: translate(0, 0); }
        }

        @keyframes float-reverse {
          0% { transform: translate(0, 0); }
          50% { transform: translate(-20px, 30px); }
          100% { transform: translate(0, 0); }
        }

        @media (max-width: 1024px) {
          .mobile-menu-toggle {
            display: flex;
          }
        }
      `}</style>
    </div>
  );
}
