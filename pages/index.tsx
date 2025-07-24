'use client';
import React, { JSX, useState, useEffect, Suspense } from 'react';
import ModernNavbar from '../components/ModernNavbar';
import { useTheme } from '@/contexts/ThemeContext';
import { useFeatureFlags } from '@/contexts/FeatureFlagContext';
import type { SectionKey, NavItemType } from '@/types';
import {
  House, FileText, Bell, Users, User, Target, Clock, Calendar as CalendarIcon
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
// Use dynamic import with React.lazy for Applications component
const ApplicationsLazy = React.lazy(() => import('../components/sections/Applications'));

const ApplicationsSection = (): JSX.Element => {
  return (
    <Suspense fallback={<div>Loading Applications...</div>}>
      <ApplicationsLazy />
    </Suspense>
  );
};
const RemindersSection = (): JSX.Element => <Reminders />;
const AnalyticsSection = (): JSX.Element => (
  <div className="glass-card">
    <h1 className="text-primary">Analytics</h1>
    <p className="text-secondary">Analytics data here...</p>
  </div>
);
const InterviewsSection = (): JSX.Element => <Interviews />;
const ProfileArtifactsSection = (): JSX.Element => <ProfileArtifacts />;
const GoalsSection = (): JSX.Element => <Goals />;
const TimelineSection = (): JSX.Element => <Timeline />;
const CalendarSection = (): JSX.Element => <Calendar />;

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const {
    ENABLE_CALENDAR_VIEW,
    ENABLE_TIMELINE_SECTION,
    ENABLE_GOALS_SECTION,
    ENABLE_PROFILE_ARTIFACTS
  } = useFeatureFlags();

  // Only include sidebar items for enabled features
  const sidebarItems: NavItemType[] = [
    { id: 'dashboard-home', key: 'dashboard-home', label: 'Dashboard', icon: <House className="w-5 h-5" />, color: 'var(--accent-blue)', badge: { count: 3 } },
    { id: 'applications-section', key: 'applications-section', label: 'Applications', icon: <FileText className="w-5 h-5" />, color: 'var(--accent-purple)', badge: { count: applications.length } },
    { id: 'reminders-section', key: 'reminders-section', label: 'Reminders', icon: <Bell className="w-5 h-5" />, color: 'var(--accent-pink)', badge: { count: upcomingEvents.length } },
    { id: 'interviews-section', key: 'interviews-section', label: 'Interviews', icon: <Users className="w-5 h-5" />, color: 'var(--accent-orange)', badge: { count: appStats.interviewsScheduled } },
    ...(ENABLE_PROFILE_ARTIFACTS ? [{ id: 'profile-artifacts-section' as SectionKey, key: 'profile-artifacts-section' as SectionKey, label: 'Profile', icon: <User className="w-5 h-5" />, color: 'var(--accent-green)' }] : []),
    ...(ENABLE_GOALS_SECTION ? [{ id: 'goals-section' as SectionKey, key: 'goals-section' as SectionKey, label: 'Goals', icon: <Target className="w-5 h-5" />, color: 'var(--accent-yellow)' }] : []),
    ...(ENABLE_TIMELINE_SECTION ? [{ id: 'timeline-section' as SectionKey, key: 'timeline-section' as SectionKey, label: 'Timeline', icon: <Clock className="w-5 h-5" />, color: 'var(--accent-red)', badge: { count: activities.length } }] : []),
    ...(ENABLE_CALENDAR_VIEW ? [{ id: 'calendar-section' as SectionKey, key: 'calendar-section' as SectionKey, label: 'Calendar', icon: <CalendarIcon className="w-5 h-5" />, color: 'var(--accent-blue-light)', badge: { count: upcomingEvents.length } }] : []),
  ];

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className={`app-container reveal-loaded ${isLoaded ? 'loaded' : ''}`}>
      {/* Modern Navbar */}
      <ModernNavbar
        items={sidebarItems}
        currentSection={currentSection}
        setCurrentSection={setCurrentSection}
        userName={userProfile.name}
        userAvatar={userProfile.avatar}
        onMobileMenuToggle={toggleMobileMenu}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      <main className="glass-main">
        <div className="main-content">
          <div className="reveal-element">
            {/* Render sections based on feature flags */}
            {currentSection === 'calendar-section' && !ENABLE_CALENDAR_VIEW && (
              <div className="feature-disabled">
                <h2>Calendar View</h2>
                <p>This feature is currently disabled.</p>
              </div>
            )}
            {currentSection === 'timeline-section' && !ENABLE_TIMELINE_SECTION && (
              <div className="feature-disabled">
                <h2>Timeline View</h2>
                <p>This feature is currently disabled.</p>
              </div>
            )}
            {currentSection === 'goals-section' && !ENABLE_GOALS_SECTION && (
              <div className="feature-disabled">
                <h2>Goals View</h2>
                <p>This feature is currently disabled.</p>
              </div>
            )}
            {currentSection === 'profile-artifacts-section' && !ENABLE_PROFILE_ARTIFACTS && (
              <div className="feature-disabled">
                <h2>Profile Artifacts View</h2>
                <p>This feature is currently disabled.</p>
              </div>
            )}
            {/* Render the section if it's enabled */}
            {((currentSection === 'calendar-section' && ENABLE_CALENDAR_VIEW) ||
              (currentSection === 'timeline-section' && ENABLE_TIMELINE_SECTION) ||
              (currentSection === 'goals-section' && ENABLE_GOALS_SECTION) ||
              (currentSection === 'profile-artifacts-section' && ENABLE_PROFILE_ARTIFACTS) ||
              !(
                currentSection === 'calendar-section' ||
                currentSection === 'timeline-section' ||
                currentSection === 'goals-section' ||
                currentSection === 'profile-artifacts-section'
              )) && sections[currentSection]()}
          </div>
        </div>
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
      <div className="bg-gradient-2"></div>      <style jsx>{`
        .app-container {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          background: var(--background);
          position: relative;
        }

        .glass-main {
          flex-grow: 1;
          min-height: 100vh;
          position: relative;
          padding-top: 70px;
          margin-left: 0 !important;
        }

        .main-content {
          padding: 20px;
          height: 100%;
        }

        .reveal-element {
          background: transparent;
        }

        .feature-disabled {
          background: transparent;
          border-radius: var(--border-radius);
          padding: 48px 64px;
          text-align: center;
          box-shadow: var(--shadow-soft);
          margin: 48px auto;
          max-width: 600px;
          border: 1px solid var(--border-thin);
        }

        .feature-disabled h2 {
          font-size: 24px;
          margin-bottom: 16px;
          color: var(--text-primary);
        }

        .feature-disabled p {
          color: var(--text-secondary);
          font-size: 16px;
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

        /* Responsive Design */
        @media (max-width: 768px) {
          .main-content {
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
}
