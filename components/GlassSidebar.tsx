'use client';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { SectionKey, NavItemType } from './types';
import NavItem from './NavItem';
import SidebarSection from './SidebarSection.flat';
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
      className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}
      style={{ width: isCollapsed ? '70px' : `${width}px` }}
    >
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
        </div>
        <button
          onClick={toggleSidebar}
          className="toggle-btn"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronLeft size={18} className="toggle-icon" />
          ) : (
            <Menu size={18} className="toggle-icon" />
          )}
        </button>
      </div>

      <div className="user-profile">
        <div className="avatar">
          {userAvatar ? (
            <img src={userAvatar} alt={`${userName}'s avatar`} className="avatar-img" />
          ) : (
            <div className="avatar-placeholder">{userName.charAt(0)}</div>
          )}
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
                <Calendar size={14} />
              </button>
            </div>
            <div className="user-status">
              <span className="status-dot online"></span>
              <span className="status-text">Online</span>
            </div>
          </div>
        )}
        {isCollapsed && (
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
      </div>      <style jsx>{`
        .sidebar {
          height: 100vh;
          border-right: 1px solid var(--border-thin);
          display: flex;
          flex-direction: column;
          position: fixed;
          z-index: var(--z-fixed);
          transition: width var(--transition-normal) var(--easing-standard);
          overflow: hidden;
          background: var(--glass-sidebar-bg);
          backdrop-filter: blur(var(--blur-amount));
          -webkit-backdrop-filter: blur(var(--blur-amount));
        }

        .sidebar.collapsed {
          width: 70px !important;
        }

        .sidebar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          border-bottom: 1px solid var(--border-divider);
        }

        .logo {
          background: var(--accent-primary);
          padding: ${isCollapsed ? '8px' : '6px 12px'};
          border-radius: var(--border-radius);
          font-weight: 600;
          font-size: ${isCollapsed ? '16px' : '18px'};
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: ${isCollapsed ? '32px' : 'auto'};
          height: 32px;
        }

        .logo-text {
          line-height: 1;
        }        .toggle-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 6px;
          border-radius: var(--border-radius-sm);
          transition: all var(--transition-fast) var(--easing-standard);
        }

        .toggle-btn:hover {
          background: var(--hover-bg);
          color: var(--text-primary);
          transform: scale(1.05);
        }

        .toggle-icon {
          transform: ${isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)'};
          transition: transform var(--transition-normal) var(--easing-standard);
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          border-bottom: 1px solid var(--border-divider);
          transition: background-color var(--transition-fast) var(--easing-standard);
        }

        .user-profile:hover {
          background-color: var(--hover-bg);
        }        .avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          overflow: hidden;
          background: var(--accent-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 500;
          font-size: 14px;
          flex-shrink: 0;
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
          overflow: hidden;
        }        .user-name {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
          color: var(--text-primary);
          margin-bottom: 2px;
          font-size: 14px;
        }

        .calendar-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 2px;          border-radius: var(--border-radius-sm);
          transition: color var(--transition-fast) var(--easing-standard);
        }

        .calendar-btn:hover {
          color: var(--accent-primary);
        }

        .user-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--text-secondary);
        }

        .status-dot.online {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: var(--accent-success);
        }

        .status-text {
          font-size: 11px;
        }        .avatar-tooltip {
          position: absolute;
          left: 60px;
          top: 50%;
          transform: translateY(-50%);
          background: var(--tooltip-bg);
          color: var(--tooltip-text);
          border-radius: var(--border-radius);
          padding: 8px 12px;
          box-shadow: var(--shadow);
          font-size: 12px;
          white-space: nowrap;
          z-index: var(--z-tooltip);
          backdrop-filter: blur(var(--blur-amount));
          -webkit-backdrop-filter: blur(var(--blur-amount));
        }

        .avatar-tooltip::before {
          content: '';
          position: absolute;
          top: 50%;
          left: -4px;
          transform: translateY(-50%) rotate(45deg);
          width: 8px;
          height: 8px;
          background: var(--tooltip-bg);
        }

        .tooltip-name {
          font-weight: 500;
          margin-bottom: 2px;
        }        .tooltip-status {
          display: flex;
          align-items: center;
          gap: 4px;
          color: var(--text-tertiary);
        }

        .tooltip-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background-color: var(--accent-success);
        }

        .nav-scroll {
          flex-grow: 1;
          overflow-y: auto;
          padding: 12px;
        }

        .nav-scroll::-webkit-scrollbar {
          width: 4px;
        }

        .nav-scroll::-webkit-scrollbar-track {
          background: transparent;
        }        .nav-scroll::-webkit-scrollbar-thumb {
          background: var(--border-divider);
          border-radius: 2px;
        }

        .nav-scroll::-webkit-scrollbar-thumb:hover {
          background: var(--text-tertiary);
        }        .sidebar-footer {
          padding: 16px;
          border-top: 1px solid var(--border-divider);
          display: flex;
          justify-content: ${isCollapsed ? 'center' : 'space-between'};
          align-items: center;
        }

        .footer-content {
          display: flex;
          gap: 12px;
          align-items: center;
          width: 100%;
          justify-content: ${isCollapsed ? 'center' : 'space-between'};
        }        .signin-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: var(--glass-bg);
          border: 1px solid var(--border-thin);
          border-radius: var(--border-radius);
          padding: 6px 10px;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast) var(--easing-standard);
          font-size: 12px;
          backdrop-filter: blur(var(--blur-amount));
          -webkit-backdrop-filter: blur(var(--blur-amount));
        }

        .signin-btn:hover {
          background: var(--hover-bg);
          border-color: var(--border-hover);
          color: var(--text-primary);
          transform: translateY(-1px);
        }        @media (max-width: 1024px) {
          .sidebar {
            transform: ${isCollapsed ? 'translateX(-100%)' : 'translateX(0)'};
            transition: transform var(--transition-normal) var(--easing-standard), width var(--transition-normal) var(--easing-standard);
          }
        }
      `}</style>
    </div>
  );
}
