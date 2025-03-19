import { JSX, useState, useEffect } from 'react';
import GlassSidebar from '../components/GlassSidebar';
import { useTheme } from '@/contexts/ThemeContext';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import { SectionKey, NavItemType } from '@/components/types';
import {
  HomeIcon, ChartBarIcon, CalendarIcon, UserIcon,
  InboxIcon, DocumentTextIcon, PencilIcon, CogIcon
} from '@heroicons/react/24/outline';
import {
  House, FileText, Bell, PieChart, Users, User, Target,
  Clock, Search, Calendar, TrendingUp, ArrowUpRight, Briefcase,
  CheckCircle, CreditCard, Activity, BarChart2, Award, Sun, Moon,
  Settings, Palette,
  Menu,
  ChevronLeft
} from 'lucide-react';
import ProfileArtifacts from '@/components/sections/ProfileArtifacts';
import Interviews from '@/components/sections/Interviews';
import Timeline from '@/components/sections/Timeline';
import Goals from '@/components/sections/Goals';
import Reminders from '@/components/sections/Reminders';
import DashboardHome from '@/components/sections/DashboardHome';
import { activities, applications, appStats, upcomingEvents, userProfile } from './data';



// **Section Components**
const DashboardHomeSection = (): JSX.Element => {
  const { currentTheme } = useTheme();

  return (
    <DashboardHome />
  );
};

const ApplicationsSection = (): JSX.Element => {
  // Import the Applications component directly
  const Applications = require('../components/sections/Applications').default;
  return <Applications />;
};

const RemindersSection = (): JSX.Element => {
  return (
    <Reminders />
  );
};

// **Placeholder Components**
const AnalyticsSection = (): JSX.Element => (
  < section className="glass-card" >
    <h1 className="text-primary">Analytics</h1>
    <p className="text-secondary">Analytics data here...</p>
  </section >
);

const InterviewsSection = (): JSX.Element => (
  <Interviews />
);

const ProfileArtifactsSection = (): JSX.Element => (
  <ProfileArtifacts />
);

const GoalsSection = (): JSX.Element => (
  <Goals />
);

const TimelineSection = (): JSX.Element => (
  <Timeline />
);

// **Sections Mapping**
const sections: Record<SectionKey, () => JSX.Element> = {
  'dashboard-home': DashboardHomeSection,
  'applications-section': ApplicationsSection,
  'reminders-section': RemindersSection,
  'analytics-section': AnalyticsSection,
  'interviews-section': InterviewsSection,
  'profile-artifacts-section': ProfileArtifactsSection,
  'goals-section': GoalsSection,
  'timeline-section': TimelineSection,
};

// **Main Component**
export default function Home(): JSX.Element {
  const { currentTheme } = useTheme();
  const [currentSection, setCurrentSection] = useState<SectionKey>('dashboard-home');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [width, setWidth] = useState(280);
  const [isLoaded, setIsLoaded] = useState(false);

  const sidebarItems: NavItemType[] = [
    {
      id: 'dashboard-home',
      key: 'dashboard-home',
      label: 'Dashboard',
      icon: <House className="w-5 h-5" />,
      color: 'var(--accent-blue)',
      badge: { count: 3 }
    },
    {
      id: 'applications-section',
      key: 'applications-section',
      label: 'Applications',
      icon: <FileText className="w-5 h-5" />,
      color: 'var(--accent-purple)',
      badge: { count: applications.length }
    },
    {
      id: 'reminders-section',
      key: 'reminders-section',
      label: 'Reminders',
      icon: <Bell className="w-5 h-5" />,
      color: 'var(--accent-pink)',
      badge: { count: upcomingEvents.length }
    },
    {
      id: 'interviews-section',
      key: 'interviews-section',
      label: 'Interviews',
      icon: <Users className="w-5 h-5" />,
      color: 'var(--accent-orange)',
      badge: { count: appStats.interviewsScheduled }
    },
    {
      id: 'profile-artifacts-section',
      key: 'profile-artifacts-section',
      label: 'Profile',
      icon: <User className="w-5 h-5" />,
      color: 'var(--accent-green)'
    },
    {
      id: 'goals-section',
      key: 'goals-section',
      label: 'Goals',
      icon: <Target className="w-5 h-5" />,
      color: 'var(--accent-yellow)'
    },
    {
      id: 'timeline-section',
      key: 'timeline-section',
      label: 'Timeline',
      icon: <Clock className="w-5 h-5" />,
      color: 'var(--accent-red)',
      badge: { count: activities.length }
    },
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

      {/* Floating particles for visual effect */}
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

      {/* Dynamic background gradient elements */}
      <div className="bg-gradient-1"></div>
      <div className="bg-gradient-2"></div>

      <style jsx>{`
        .mobile-menu-toggle {
          display: none;
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: var(--glass-bg);
          backdrop-filter: blur(var(--blur-amount));
          -webkit-backdrop-filter: blur(var(--blur-amount));
          border: 1px solid var(--border-thin);
          box-shadow: var(--shadow);
          color: var(--text-primary);
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: var(--z-fixed);
          transition: all var(--transition-normal) var(--easing-standard);
        }

        .mobile-menu-toggle:hover {
          transform: scale(1.05);
          box-shadow: var(--shadow-lg);
          border-color: var(--accent-primary);
        }

        .mobile-menu-toggle:active {
          transform: scale(0.95);
        }

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
          background: radial-gradient(circle,
            rgba(var(--accent-blue-rgb), 0.15),
            transparent 70%
          );
          top: -10vw;
          right: -10vw;
          animation: float 20s infinite alternate ease-in-out;
        }

        .bg-gradient-2 {
          width: 60vw;
          height: 60vw;
          background: radial-gradient(circle,
            rgba(var(--accent-purple-rgb), 0.1),
            transparent 70%
          );
          bottom: -20vw;
          left: -10vw;
          animation: float-reverse 25s infinite alternate-reverse ease-in-out;
        }

        @media (max-width: 1024px) {
          .mobile-menu-toggle {
            display: flex;
          }

          .bg-gradient-1, .bg-gradient-2 {
            opacity: 0.3;
          }
        }

        @media (max-width: 480px) {
          .mobile-menu-toggle {
            bottom: 16px;
            right: 16px;
            width: 42px;
            height: 42px;
          }
        }
      `}</style>
    </div>
  );
}
