'use client';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { SectionKey, NavItemType } from './types';
import NavItem from './NavItem';
import SidebarSection from './SidebarSection';
import ResizeHandle from './ResizeHandle';
import ThemeSwitcher from './ThemeSwitcher';
import { Menu, ChevronLeft, Calendar, Mail } from 'lucide-react';

interface GlassSidebarProps {
  items: NavItemType[];
  currentSection: SectionKey;
  setCurrentSection: (section: SectionKey) => void;
  isCollapsed: boolean;
  width: number;
  onResize: (width: number) => void;
  userName: string;
  userAvatar: string;
}

export default function GlassSidebar({
  items,
  currentSection,
  setCurrentSection,
  isCollapsed,
  width,
  onResize,
  userName,
  userAvatar
}: GlassSidebarProps) {
  const { currentTheme, toggleColorTheme } = useTheme();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [expandedWidth, setExpandedWidth] = useState(width);
  const [sections, setSections] = useState<Record<string, NavItemType[]>>({ main: items });
  const [hoveredHeaderButton, setHoveredHeaderButton] = useState(false);
  const [hoveredAvatar, setHoveredAvatar] = useState(false);

  // Handle sidebar collapse/expand
  const toggleSidebar = () => {
    if (isCollapsed) {
      onResize(expandedWidth);
    } else {
      onResize(70);
    }
  };

  // Update width when expandedWidth changes
  useEffect(() => {
    if (!isCollapsed) {
      onResize(expandedWidth);
    }
  }, [expandedWidth, isCollapsed, onResize]);

  // Group items into sections
  useEffect(() => {
    setSections({ main: items });
  }, [items]);

  // Navigate to calendar section
  const handleCalendarClick = () => {
    setCurrentSection('calendar-section');
  };

  return (
    <div
      ref={sidebarRef}
      className={`glass-sidebar ${isCollapsed ? 'collapsed' : ''}`}
      style={{ width: isCollapsed ? '70px' : `${width}px` }}
    >
      <div className="glass-overlay"></div>
      <div className="sidebar-bg-particles">
        <span className="particle p1"></span>
        <span className="particle p2"></span>
        <span className="particle p3"></span>
        <span className="particle p4"></span>
        <span className="particle p5"></span>
      </div>
      <div className="top-accent-line"></div>

      {!isCollapsed && (
        <ResizeHandle
          setExpandedWidth={setExpandedWidth}
          width={width}
          variant="accent"
          showActiveIndicator={true}
        />
      )}

      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-text">{isCollapsed ? 'J' : 'jjugg'}</span>
          <div className="logo-glow"></div>
        </div>
        <button
          onClick={toggleSidebar}
          className={`toggle-btn ${hoveredHeaderButton ? 'hovered' : ''}`}
          onMouseEnter={() => setHoveredHeaderButton(true)}
          onMouseLeave={() => setHoveredHeaderButton(false)}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronLeft size={20} className="toggle-icon open" />
          ) : (
            <Menu size={20} className="toggle-icon" />
          )}
          <div className="btn-background"></div>
        </button>
      </div>

      <div
        className={`user-profile ${hoveredAvatar ? 'hovered' : ''}`}
        onMouseEnter={() => setHoveredAvatar(true)}
        onMouseLeave={() => setHoveredAvatar(false)}
      >
        <div className="avatar">
          {userAvatar ? (
            <img src={userAvatar} alt={`${userName}'s avatar`} className="avatar-img" />
          ) : (
            <div className="avatar-placeholder">{userName.charAt(0)}</div>
          )}
          {hoveredAvatar && <div className="avatar-highlight"></div>}
        </div>
        {!isCollapsed && (
          <div className="user-info">
            <div className="user-name">
              {userName}
              <button
                onClick={handleCalendarClick}
                className="calendar-btn"
                aria-label="View calendar"
              >
                <Calendar size={16} />
              </button>
              <div className="name-underline"></div>
            </div>
            <div className="user-status">
              <span className="status-dot online">
                <span className="status-pulse"></span>
              </span>
              <span className="status-text">Online</span>
            </div>
          </div>
        )}
        {isCollapsed && hoveredAvatar && (
          <div className="avatar-tooltip">
            <div className="tooltip-content">
              <div className="tooltip-name">{userName}</div>
              <div className="tooltip-status">
                <span className="tooltip-dot"></span>
                <span>Online</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="nav-scroll scrollbar-thin">
        {Object.entries(sections).map(([sectionId, sectionItems]) => (
          <SidebarSection
            key={sectionId}
            section={{
              id: sectionId,
              title: sectionId === 'main' ? 'Navigation' : sectionId,
              items: sectionItems,
              isExpandable: true,
            }}
            isCollapsed={isCollapsed}
            currentSection={currentSection}
            setCurrentSection={setCurrentSection}
            onContextMenu={(e, item) => e.preventDefault()}
          />
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="footer-content">
          <ThemeSwitcher />
          <button className="signin-btn">
            <Mail size={16} />
            {!isCollapsed && <span>Sign in with Gmail</span>}
          </button>
        </div>
        <div className="footer-shadow"></div>
      </div>

      <style jsx>{`
        .glass-sidebar {
          height: 100vh;
          border-right: 1px solid var(--border-thin);
          display: flex;
          flex-direction: column;
          position: fixed;
          z-index: var(--z-sidebar);
          transition: all var(--transition-normal) var(--easing-decelerate);
          overflow: hidden;
          background: var(--glass-sidebar-bg);
        }

        .glass-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.03), transparent 40%, rgba(255, 255, 255, 0.02) 80%);
          pointer-events: none;
          z-index: -1;
        }

        .dark .glass-overlay {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.04), transparent 30%, rgba(255, 255, 255, 0.01) 70%);
        }

        .sidebar-bg-particles {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
          z-index: -1;
        }

        .particle {
          position: absolute;
          border-radius: 50%;
          background: var(--accent-primary);
          opacity: 0;
        }

        .p1 { width: 20px; height: 20px; top: 20%; left: 30%; filter: blur(10px); animation: float-around 25s ease-in-out infinite; }
        .p2 { width: 30px; height: 30px; bottom: 30%; right: 20%; filter: blur(15px); animation: float-around 30s ease-in-out infinite 5s; background: var(--accent-secondary); }
        .p3 { width: 10px; height: 10px; top: 70%; left: 15%; filter: blur(8px); animation: float-around 20s ease-in-out infinite 2s; }
        .p4 { width: 15px; height: 15px; top: 10%; right: 10%; filter: blur(10px); animation: float-around 28s ease-in-out infinite 8s; background: var(--accent-secondary); }
        .p5 { width: 25px; height: 25px; bottom: 10%; left: 40%; filter: blur(12px); animation: float-around 32s ease-in-out infinite 12s; }

        .top-accent-line {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(to right, var(--accent-primary), var(--accent-secondary), transparent);
          opacity: 0.6;
        }

        .sidebar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 18px;
          border-bottom: 1px solid var(--border-divider);
          position: relative;
          z-index: 2;
        }

        .logo {
          position: relative;
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          padding: ${isCollapsed ? '10px' : '8px 16px'};
          border-radius: var(--border-radius);
          font-weight: 700;
          font-size: ${isCollapsed ? '20px' : '24px'};
          color: white;
          overflow: hidden;
          transition: all var(--transition-normal);
        }

        .logo:hover {
          transform: translateY(-1px);
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
        }

        .logo-glow {
          position: absolute;
          top: 0;
          left: -50%;
          width: 150%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
          transform: skewX(-20deg);
          animation: logo-shine 6s infinite;
          opacity: 0;
        }

        .toggle-btn {
          position: relative;
          background: none;
          border: none;
          color: var(--text-primary);
          cursor: pointer;
          padding: 8px;
          border-radius: var(--border-radius-sm);
          transition: all var(--transition-fast);
        }

        .btn-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: var(--hover-bg);
          opacity: 0;
          transition: opacity var(--transition-fast);
          border-radius: var(--border-radius-sm);
          z-index: -1;
        }

        .toggle-btn.hovered .btn-background {
          opacity: 1;
        }

        .toggle-btn:hover {
          transform: scale(1.1);
          color: var(--accent-primary);
        }

        .toggle-icon {
          transition: transform var(--transition-normal);
        }

        .toggle-icon.open {
          transform: rotate(180deg);
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 18px;
          border-bottom: 1px solid var(--border-divider);
          transition: background-color var(--transition-normal);
          cursor: pointer;
        }

        .user-profile.hovered {
          background-color: var(--hover-bg);
        }

        .avatar {
          position: relative;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          overflow: hidden;
          background: linear-gradient(135deg, var(--accent-secondary), var(--accent-primary));
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 18px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
          border: 2px solid var(--glass-bg);
          transition: all var(--transition-normal);
        }

        .user-profile.hovered .avatar {
          transform: scale(1.05);
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
          border-color: var(--accent-primary);
        }

        .avatar-highlight {
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          border-radius: 50%;
          background: conic-gradient(from 0deg, var(--accent-primary), var(--accent-secondary), var(--accent-primary));
          z-index: -1;
          animation: rotate 3s linear infinite;
        }

        .avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .user-info {
          flex: 1;
          min-width: 0;
        }

        .user-name {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 4px;
          position: relative;
        }

        .calendar-btn {
          background: none;
          border: none;
          color: var(--text-tertiary);
          cursor: pointer;
          padding: 4px;
          transition: color var(--transition-fast);
        }

        .calendar-btn:hover {
          color: var(--accent-teal);
        }

        .name-underline {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 1px;
          background-color: var(--accent-primary);
          transition: width var(--transition-normal);
        }

        .user-profile.hovered .name-underline {
          width: 100%;
        }

        .user-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--text-tertiary);
        }

        .status-dot.online {
          position: relative;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: var(--accent-success);
        }

        .status-pulse {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background-color: var(--accent-success);
          opacity: 0.6;
          animation: status-pulse 2s infinite;
        }

        .avatar-tooltip {
          position: absolute;
          left: 60px;
          top: 50%;
          transform: translateY(-50%);
          background-color: var(--tooltip-bg);
          border-radius: var(--border-radius);
          padding: 10px 14px;
          box-shadow: var(--shadow);
          animation: fade-in 0.2s;
          border: 1px solid var(--border-thin);
          backdrop-filter: blur(var(--blur-amount));
        }

        .avatar-tooltip::before {
          content: '';
          position: absolute;
          top: 50%;
          left: -6px;
          transform: translateY(-50%) rotate(45deg);
          width: 12px;
          height: 12px;
          background-color: var(--tooltip-bg);
          border-left: 1px solid var(--border-thin);
          border-bottom: 1px solid var(--border-thin);
        }

        .tooltip-name {
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .tooltip-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--text-tertiary);
        }

        .tooltip-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: var(--accent-success);
        }

        .nav-scroll {
          flex-grow: 1;
          overflow-y: auto;
          padding: 16px;
          margin-right: -8px;
          padding-right: 8px;
        }

        .nav-scroll::-webkit-scrollbar-track {
          background: linear-gradient(to bottom, transparent, rgba(var(--accent-primary-rgb), 0.05), transparent);
          border-radius: 4px;
        }

        .dark .nav-scroll::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.4);
          box-shadow: 0 0 6px rgba(var(--accent-primary-rgb), 0.2);
        }

        .dark .nav-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.6);
          box-shadow: 0 0 8px rgba(var(--accent-primary-rgb), 0.4);
        }

        .sidebar-footer {
          padding: 16px 18px;
          border-top: 1px solid var(--border-divider);
          display: flex;
          justify-content: ${isCollapsed ? 'center' : 'space-between'};
          align-items: center;
          position: relative;
        }

        .footer-content {
          display: flex;
          gap: 12px;
          align-items: center;
          width: 100%;
          justify-content: ${isCollapsed ? 'center' : 'space-between'};
          z-index: 1;
        }

        .signin-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: var(--glass-bg);
          border: 1px solid var(--border-thin);
          border-radius: var(--border-radius-sm);
          padding: 6px 12px;
          color: var(--text-primary);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .signin-btn:hover {
          background: var(--hover-bg);
          border-color: var(--accent-primary);
        }

        .footer-shadow {
          position: absolute;
          bottom: calc(100% - 1px);
          left: 0;
          right: 0;
          height: 30px;
          background: linear-gradient(to top, var(--glass-sidebar-bg), transparent);
          pointer-events: none;
        }

        @keyframes float-around {
          0%, 100% { opacity: 0.5; transform: translate(0, 0); }
          25% { opacity: 0.7; transform: translate(10px, -20px); }
          50% { opacity: 0.5; transform: translate(20px, 0); }
          75% { opacity: 0.7; transform: translate(0, -10px); }
        }

        @keyframes logo-shine {
          0%, 100% { opacity: 0; left: -50%; }
          50% { opacity: 0.5; }
          60% { opacity: 0.5; left: 100%; }
        }

        @keyframes status-pulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.8); opacity: 0; }
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-50%) translateX(-10px); }
          to { opacity: 1; transform: translateY(-50%) translateX(0); }
        }

        @media (max-width: 1024px) {
          .glass-sidebar {
            transform: ${isCollapsed ? 'translateX(-100%)' : 'translateX(0)'};
            transition: transform var(--transition-normal), width var(--transition-normal);
          }
        }
      `}</style>
    </div>
  );
}
