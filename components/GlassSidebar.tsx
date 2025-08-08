'use client';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { SectionKey, NavItemType } from './types';
import NavItem from './NavItem';
import SidebarSection from './SidebarSection.flat';
import ResizeHandle from './ResizeHandle';
import { ThemeSwitcher } from './ThemeSwitcher';
import {
  Menu,
  ChevronLeft,
  Calendar,
  Mail,
  Settings,
  Bell,
  Search,
  Sparkles,
  User,
  ChevronDown,
  Circle
} from 'lucide-react';

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
  const { mode, toggleMode } = useTheme();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [expandedWidth, setExpandedWidth] = useState(width);
  const [sections, setSections] = useState<Record<string, NavItemType[]>>({ main: items });
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  // Filter items based on search
  const filteredItems = items.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <div
      ref={sidebarRef}
      className={`sidebar ${isCollapsed ? 'collapsed' : ''} sidebar-modern`}
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

      {/* Header with logo and collapse button */}
      <div className="sidebar-header">
        <div className="header-content">
          <div className="logo-container">
            <div className="logo">
              <Sparkles size={isCollapsed ? 16 : 20} className="logo-icon" />
              {!isCollapsed && <span className="logo-text">jjugg</span>}
            </div>
            {!isCollapsed && <div className="logo-badge">Pro</div>}
          </div>

          <div className="header-actions">
            {!isCollapsed && (
              <button className="notification-btn">
                <Bell size={16} />
                <span className="notification-dot"></span>
              </button>
            )}
            <button
              onClick={toggleSidebar}
              className="toggle-btn"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <Menu size={16} className="toggle-icon" />
            </button>
          </div>
        </div>
      </div>

      {/* Search bar (only when expanded) */}
      {!isCollapsed && (
        <div className="search-container">
          <div className="search-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search navigation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      )}

      {/* User profile section */}
      <div className="user-profile" onClick={() => !isCollapsed && setShowUserDropdown(!showUserDropdown)}>
        <div className="user-main">
          <div className="avatar-container">
            <div className="avatar">
              {userAvatar ? (
                <img src={userAvatar} alt={`${userName}'s avatar`} className="avatar-img" />
              ) : (
                <User size={isCollapsed ? 18 : 20} className="avatar-icon" />
              )}
            </div>
            <div className="status-indicator">
              <Circle size={8} className="status-dot" />
            </div>
          </div>

          {!isCollapsed && (
            <div className="user-info">
              <div className="user-details">
                <div className="user-name">{userName}</div>
                <div className="user-role">Job Seeker</div>
              </div>
              <ChevronDown size={16} className={`dropdown-icon ${showUserDropdown ? 'rotated' : ''}`} />
            </div>
          )}
        </div>

        {/* User dropdown menu */}
        {!isCollapsed && showUserDropdown && (
          <div className="user-dropdown">
            <div className="dropdown-item">
              <User size={14} />
              <span>Profile</span>
            </div>
            <div className="dropdown-item">
              <Settings size={14} />
              <span>Settings</span>
            </div>
            <div className="dropdown-divider"></div>
            <div className="dropdown-item" onClick={handleCalendarClick}>
              <Calendar size={14} />
              <span>Calendar</span>
            </div>
          </div>
        )}

        {/* Tooltip for collapsed state */}
        {isCollapsed && (
          <div className="user-tooltip">
            <div className="tooltip-content">
              <div className="tooltip-name">{userName}</div>
              <div className="tooltip-status">
                <Circle size={6} className="tooltip-dot" />
                <span>Online</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation sections */}
      <div className="nav-scroll">        {searchQuery ? (
        <div className="search-results">
          <div className="section-title">Search Results</div>
          {filteredItems.map((item) => (
            <NavItem
              key={item.key}
              item={item}
              currentSection={currentSection}
              onNavigate={setCurrentSection}
              isCollapsed={isCollapsed}
            />
          ))}
        </div>
      ) : (
        Object.entries(sections).map(([sectionId, sectionItems]) => (
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
        ))
      )}
      </div>

      {/* Footer with theme switcher and sign-in */}
      <div className="sidebar-footer">
        <div className="footer-content">
          <ThemeSwitcher />
          {!isCollapsed && (
            <button className="signin-btn">
              <Mail size={14} />
              <span>Connect Gmail</span>
            </button>
          )}
        </div>
      </div>      <style jsx>{`
        /* Modern Sidebar Container */
        .sidebar-modern {
          height: 100vh;
          border-right: 1px solid var(--border-subtle);
          display: flex;
          flex-direction: column;
          position: fixed;
          z-index: var(--z-fixed);
          transition: all var(--transition-smooth) var(--easing-smooth);
          overflow: hidden;
          background: var(--glass-sidebar-bg);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow: var(--shadow-elevation-medium);
        }

        .sidebar-modern.collapsed {
          width: 70px !important;
        }

        /* Header Section */
        .sidebar-header {
          padding: 20px 16px;
          border-bottom: 1px solid var(--border-subtle);
          background: linear-gradient(135deg, var(--glass-header-bg) 0%, var(--glass-header-bg-secondary) 100%);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo-container {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo {
          background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
          padding: ${isCollapsed ? '10px' : '8px 12px'};
          border-radius: 12px;
          font-weight: 700;
          font-size: ${isCollapsed ? '14px' : '16px'};
          color: white;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: var(--shadow-elevation-low);
          transition: all var(--transition-smooth) var(--easing-smooth);
        }

        .logo:hover {
          transform: translateY(-1px);
          box-shadow: var(--shadow-elevation-medium);
        }

        .logo-text {
          font-weight: 700;
          letter-spacing: -0.5px;
        }

        .logo-icon {
          color: white;
          filter: drop-shadow(0 1px 2px rgba(0,0,0,0.1));
        }

        .logo-badge {
          background: var(--accent-warning);
          color: var(--text-on-accent);
          padding: 2px 6px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .notification-btn {
          position: relative;
          background: var(--glass-button-bg);
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          padding: 8px;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-smooth) var(--easing-smooth);
          backdrop-filter: blur(10px);
        }

        .notification-btn:hover {
          background: var(--glass-button-hover-bg);
          color: var(--text-primary);
          transform: translateY(-1px);
        }

        .notification-dot {
          position: absolute;
          top: 4px;
          right: 4px;
          width: 6px;
          height: 6px;
          background: var(--accent-danger);
          border-radius: 50%;
          border: 2px solid var(--glass-sidebar-bg);
        }

        .toggle-btn {
          background: var(--glass-button-bg);
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          padding: 8px;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-smooth) var(--easing-smooth);
          backdrop-filter: blur(10px);
        }

        .toggle-btn:hover {
          background: var(--glass-button-hover-bg);
          color: var(--text-primary);
          transform: translateY(-1px) scale(1.05);
        }

        .toggle-icon {
          transition: transform var(--transition-smooth) var(--easing-smooth);
        }

        /* Search Section */
        .search-container {
          padding: 16px;
          border-bottom: 1px solid var(--border-subtle);
        }

        .search-box {
          position: relative;
          display: flex;
          align-items: center;
          background: var(--glass-input-bg);
          border: 1px solid var(--border-subtle);
          border-radius: 10px;
          padding: 8px 12px;
          transition: all var(--transition-smooth) var(--easing-smooth);
          backdrop-filter: blur(10px);
        }

        .search-box:focus-within {
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 3px var(--accent-primary-alpha);
        }

        .search-icon {
          color: var(--text-tertiary);
          margin-right: 8px;
          flex-shrink: 0;
        }

        .search-input {
          background: transparent;
          border: none;
          outline: none;
          color: var(--text-primary);
          font-size: 14px;
          width: 100%;
        }

        .search-input::placeholder {
          color: var(--text-tertiary);
        }

        /* User Profile Section */
        .user-profile {
          position: relative;
          padding: 16px;
          border-bottom: 1px solid var(--border-subtle);
          cursor: ${isCollapsed ? 'default' : 'pointer'};
          transition: all var(--transition-smooth) var(--easing-smooth);
        }

        .user-profile:hover {
          background: var(--glass-hover-bg);
        }

        .user-main {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .avatar-container {
          position: relative;
          flex-shrink: 0;
        }

        .avatar {
          width: ${isCollapsed ? '36px' : '40px'};
          height: ${isCollapsed ? '36px' : '40px'};
          border-radius: 12px;
          overflow: hidden;
          background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 16px;
          box-shadow: var(--shadow-elevation-low);
          transition: all var(--transition-smooth) var(--easing-smooth);
        }

        .avatar:hover {
          transform: scale(1.05);
          box-shadow: var(--shadow-elevation-medium);
        }

        .avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-icon {
          color: white;
          filter: drop-shadow(0 1px 2px rgba(0,0,0,0.1));
        }

        .status-indicator {
          position: absolute;
          bottom: -2px;
          right: -2px;
          background: var(--glass-sidebar-bg);
          border-radius: 50%;
          padding: 2px;
        }

        .status-dot {
          color: var(--accent-success);
          fill: var(--accent-success);
        }

        .user-info {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-width: 0;
        }

        .user-details {
          flex: 1;
          min-width: 0;
        }

        .user-name {
          font-weight: 600;
          color: var(--text-primary);
          font-size: 14px;
          margin-bottom: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-role {
          font-size: 12px;
          color: var(--text-secondary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .dropdown-icon {
          color: var(--text-tertiary);
          transition: transform var(--transition-smooth) var(--easing-smooth);
        }

        .dropdown-icon.rotated {
          transform: rotate(180deg);
        }

        /* User Dropdown */
        .user-dropdown {
          position: absolute;
          top: 100%;
          left: 16px;
          right: 16px;
          background: var(--glass-dropdown-bg);
          border: 1px solid var(--border-subtle);
          border-radius: 12px;
          padding: 8px;
          box-shadow: var(--shadow-elevation-high);
          backdrop-filter: blur(20px);
          z-index: var(--z-dropdown);
          animation: slideDown 0.2s var(--easing-smooth);
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 8px;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast) var(--easing-smooth);
          font-size: 13px;
        }

        .dropdown-item:hover {
          background: var(--glass-hover-bg);
          color: var(--text-primary);
        }

        .dropdown-divider {
          height: 1px;
          background: var(--border-subtle);
          margin: 4px 0;
        }

        /* Tooltip for collapsed state */
        .user-tooltip {
          position: absolute;
          left: 75px;
          top: 50%;
          transform: translateY(-50%);
          background: var(--glass-tooltip-bg);
          color: var(--text-primary);
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          padding: 12px;
          box-shadow: var(--shadow-elevation-medium);
          font-size: 12px;
          white-space: nowrap;
          z-index: var(--z-tooltip);
          backdrop-filter: blur(20px);
          opacity: 0;
          pointer-events: none;
          transition: opacity var(--transition-smooth) var(--easing-smooth);
        }

        .user-profile:hover .user-tooltip {
          opacity: 1;
        }

        .user-tooltip::before {
          content: '';
          position: absolute;
          top: 50%;
          left: -5px;
          transform: translateY(-50%) rotate(45deg);
          width: 10px;
          height: 10px;
          background: var(--glass-tooltip-bg);
          border-left: 1px solid var(--border-subtle);
          border-bottom: 1px solid var(--border-subtle);
        }

        .tooltip-name {
          font-weight: 600;
          margin-bottom: 4px;
          color: var(--text-primary);
        }

        .tooltip-status {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--text-secondary);
        }

        .tooltip-dot {
          color: var(--accent-success);
          fill: var(--accent-success);
        }

        /* Navigation Section */
        .nav-scroll {
          flex-grow: 1;
          overflow-y: auto;
          padding: 16px 12px;
          scrollbar-width: thin;
          scrollbar-color: var(--border-subtle) transparent;
        }

        .nav-scroll::-webkit-scrollbar {
          width: 6px;
        }

        .nav-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .nav-scroll::-webkit-scrollbar-thumb {
          background: var(--border-subtle);
          border-radius: 3px;
        }

        .nav-scroll::-webkit-scrollbar-thumb:hover {
          background: var(--text-tertiary);
        }

        .search-results {
          margin-bottom: 16px;
        }

        .section-title {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
          padding: 0 4px;
        }

        /* Footer Section */
        .sidebar-footer {
          padding: 16px;
          border-top: 1px solid var(--border-subtle);
          background: var(--glass-footer-bg);
        }

        .footer-content {
          display: flex;
          align-items: center;
          gap: 12px;
          justify-content: ${isCollapsed ? 'center' : 'space-between'};
        }

        .signin-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--glass-button-bg);
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          padding: 8px 12px;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-smooth) var(--easing-smooth);
          font-size: 12px;
          font-weight: 500;
          backdrop-filter: blur(10px);
        }

        .signin-btn:hover {
          background: var(--glass-button-hover-bg);
          border-color: var(--accent-primary);
          color: var(--text-primary);
          transform: translateY(-1px);
          box-shadow: var(--shadow-elevation-low);
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .sidebar-modern {
            transform: ${isCollapsed ? 'translateX(-100%)' : 'translateX(0)'};
          }
        }

        /* Dark theme enhancements */
        @media (prefers-color-scheme: dark) {
          .sidebar-modern {
            border-right-color: var(--border-subtle-dark);
          }

          .logo {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          }

          .avatar {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          }
        }
      `}</style>
    </div>
  );
}
