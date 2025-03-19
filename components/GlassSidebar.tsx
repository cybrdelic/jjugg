'use client';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { SectionKey, NavItemType } from './types';
import NavItem from './NavItem';
import SidebarSection from './SidebarSection';
import ResizeHandle from './ResizeHandle';
import ThemeSwitcher from './ThemeSwitcher';
import { Menu, ChevronLeft, Github, MailIcon } from 'lucide-react';

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
  const [sections, setSections] = useState<Record<string, NavItemType[]>>({
    main: items
  });

  // Handle sidebar collapse/expand
  const toggleSidebar = () => {
    if (isCollapsed) {
      onResize(expandedWidth); // Expand to previous width
    } else {
      onResize(70); // Collapse to 70px
    }
  };

  // Update the width when expandedWidth changes and sidebar is not collapsed
  useEffect(() => {
    if (!isCollapsed) {
      onResize(expandedWidth);
    }
  }, [expandedWidth, isCollapsed, onResize]);

  // Group items into sections for the sidebar
  useEffect(() => {
    const categorizedItems: Record<string, NavItemType[]> = {
      main: []
    };

    items.forEach(item => {
      // Logic to categorize items could be extended here
      categorizedItems.main.push(item);
    });

    setSections(categorizedItems);
  }, [items]);

  // Contextual menu for nav items
  const handleContextMenu = (e: React.MouseEvent, item: NavItemType) => {
    e.preventDefault();
    // Implement context menu functionality
  };

  const [hoveredHeaderButton, setHoveredHeaderButton] = useState(false);
  const [hoveredAvatar, setHoveredAvatar] = useState(false);

  // Animated background particles for visual polish
  const renderBackgroundParticles = () => {
    return (
      <div className="sidebar-bg-particles">
        <div className="particle p1"></div>
        <div className="particle p2"></div>
        <div className="particle p3"></div>
        <div className="particle p4"></div>
        <div className="particle p5"></div>
      </div>
    );
  };

  return (
    <div
      ref={sidebarRef}
      className={`glass-sidebar ${isCollapsed ? 'collapsed' : ''}`}
      style={{ width: isCollapsed ? '70px' : `${width}px` }}
    >
      {/* Animated background effects */}
      {currentTheme.animation !== 'minimal' && renderBackgroundParticles()}

      {/* Glass effect overlay */}
      <div className="glass-overlay"></div>

      {/* Top accent line */}
      <div className="top-accent-line"></div>

      {/* ResizeHandle component for adjusting sidebar width */}
      {!isCollapsed && (
        <ResizeHandle
          setExpandedWidth={setExpandedWidth}
          width={width}
          variant="accent"
          showActiveIndicator={true}
        />
      )}

      {/* Header with enhanced animations */}
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

      {/* User Profile with enhanced interactions */}
      <div
        className={`user-profile ${hoveredAvatar ? 'hovered' : ''}`}
        onMouseEnter={() => setHoveredAvatar(true)}
        onMouseLeave={() => setHoveredAvatar(false)}
      >
        <div className="avatar">
          {userAvatar ? (
            <img
              src={userAvatar}
              alt={`${userName}'s avatar`}
              className="avatar-img"
            />
          ) : (
            <div className="avatar-placeholder">
              {userName.charAt(0)}
            </div>
          )}
          {hoveredAvatar && <div className="avatar-highlight"></div>}
        </div>
        {!isCollapsed && (
          <div className="user-info">
            <div className="user-name">
              {userName}
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

      {/* Navigation with enhanced scrollbar */}
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
            onContextMenu={handleContextMenu}
          />
        ))}
      </div>

      {/* Footer with shadow effect */}
      <div className="sidebar-footer">
        <div className="footer-content">
          <ThemeSwitcher />
          <a href="/">
            <MailIcon />
            <div>Sign in With Gmail</div>
          </a>
        </div>
        <div className="footer-shadow"></div>
      </div>

      <style jsx>{`
        .glass-sidebar {
          height: 100vh;
          background: var(--glass-sidebar-bg);
          backdrop-filter: blur(var(--blur-amount));
          -webkit-backdrop-filter: blur(var(--blur-amount));
          border-right: 1px solid var(--border-thin);
          box-shadow: var(--shadow);
          display: flex;
          flex-direction: column;
          position: fixed;
          z-index: var(--z-sidebar);
          transition: all var(--transition-normal) var(--easing-decelerate);
          overflow: hidden;
        }

        /* Glass overlay for enhanced depth */
        .glass-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.03),
            transparent 40%,
            rgba(255, 255, 255, 0.02) 80%
          );
          pointer-events: none;
          z-index: -1;
        }

        .dark .glass-overlay {
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.04),
            transparent 30%,
            rgba(255, 255, 255, 0.01) 70%
          );
        }

        /* Accent line at the top of sidebar */
        .top-accent-line {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(
            to right,
            var(--accent-primary),
            var(--accent-secondary),
            transparent
          );
          opacity: 0.6;
          z-index: 1;
        }

        /* Animated background particles */
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
          z-index: -1;
        }

        .p1 {
          width: 20px;
          height: 20px;
          top: 20%;
          left: 30%;
          filter: blur(10px);
          animation: float-around 25s ease-in-out infinite;
          animation-delay: 0s;
          background: var(--accent-primary);
        }

        .p2 {
          width: 30px;
          height: 30px;
          bottom: 30%;
          right: 20%;
          filter: blur(15px);
          animation: float-around 30s ease-in-out infinite;
          animation-delay: 5s;
          background: var(--accent-secondary);
        }

        .p3 {
          width: 10px;
          height: 10px;
          top: 70%;
          left: 15%;
          filter: blur(8px);
          animation: float-around 20s ease-in-out infinite;
          animation-delay: 2s;
          background: var(--accent-primary);
        }

        .p4 {
          width: 15px;
          height: 15px;
          top: 10%;
          right: 10%;
          filter: blur(10px);
          animation: float-around 28s ease-in-out infinite;
          animation-delay: 8s;
          background: var(--accent-secondary);
        }

        .p5 {
          width: 25px;
          height: 25px;
          bottom: 10%;
          left: 40%;
          filter: blur(12px);
          animation: float-around 32s ease-in-out infinite;
          animation-delay: 12s;
          background: var(--accent-primary);
        }

        /* Sidebar header with enhanced styling */
        .sidebar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 18px;
          border-bottom: 1px solid var(--border-divider);
          position: relative;
          z-index: 2;
        }

        /* Logo with glow effect */
        .logo {
          position: relative;
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          padding: ${isCollapsed ? '10px' : '8px 16px'};
          border-radius: var(--border-radius);
          font-weight: 700;
          font-size: ${isCollapsed ? '20px' : '24px'};
          color: white;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
          transition: all var(--transition-normal) var(--easing-standard);
          overflow: hidden;
        }

        .logo:hover {
          transform: translateY(-1px);
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
        }

        .logo-text {
          position: relative;
          z-index: 1;
        }

        .logo-glow {
          position: absolute;
          top: 0;
          left: -50%;
          width: 150%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.4),
            transparent
          );
          transform: skewX(-20deg);
          animation: logo-shine 6s infinite;
          opacity: 0;
        }

        /* Toggle button with hover effects */
        .toggle-btn {
          position: relative;
          background: none;
          border: none;
          color: var(--text-primary);
          cursor: pointer;
          padding: 8px;
          border-radius: var(--border-radius-sm);
          transition: all var(--transition-fast) var(--easing-standard);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          z-index: 1;
        }

        .btn-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: var(--hover-bg);
          opacity: 0;
          transition: opacity var(--transition-fast) var(--easing-standard);
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

        .dark .toggle-btn:hover {
          text-shadow: 0 0 8px rgba(var(--accent-primary-rgb), 0.5);
        }

        .toggle-icon {
          transition: transform var(--transition-normal) var(--easing-standard);
        }

        .toggle-icon.open {
          transform: rotate(180deg);
        }

        /* Enhanced user profile section */
        .user-profile {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 18px;
          border-bottom: 1px solid var(--border-divider);
          position: relative;
          transition: background-color var(--transition-normal) var(--easing-standard);
          cursor: pointer;
        }

        .user-profile.hovered {
          background-color: var(--hover-bg);
        }

        /* Avatar with glow/highlight effects */
        .avatar {
          position: relative;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;
          background: linear-gradient(135deg, var(--accent-secondary), var(--accent-primary));
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 18px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
          border: 2px solid var(--glass-bg);
          transition: all var(--transition-normal) var(--easing-standard);
          z-index: 1;
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
          background: conic-gradient(
            from 0deg,
            var(--accent-primary),
            var(--accent-secondary),
            var(--accent-primary)
          );
          z-index: -1;
          animation: rotate 3s linear infinite;
        }

        .avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          text-transform: uppercase;
        }

        /* User info with animations */
        .user-info {
          overflow: hidden;
          flex: 1;
          min-width: 0;
        }

        .user-name {
          position: relative;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          padding-bottom: 2px;
        }

        .name-underline {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 1px;
          background-color: var(--accent-primary);
          transition: width var(--transition-normal) var(--easing-standard);
        }

        .user-profile.hovered .name-underline {
          width: 100%;
        }

        /* Status indicator with pulse animation */
        .user-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--text-tertiary);
        }

        .status-dot {
          position: relative;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .status-dot.online {
          background-color: var(--accent-success);
        }

        .status-pulse {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background-color: var(--accent-success);
          opacity: 0.6;
          animation: status-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        /* User tooltip in collapsed mode */
        .avatar-tooltip {
          position: absolute;
          left: 60px;
          top: 50%;
          transform: translateY(-50%);
          background-color: var(--tooltip-bg);
          border-radius: var(--border-radius);
          box-shadow: var(--shadow);
          padding: 10px 14px;
          z-index: 100;
          pointer-events: none;
          animation: fade-in 0.2s var(--easing-standard);
          backdrop-filter: blur(var(--blur-amount));
          -webkit-backdrop-filter: blur(var(--blur-amount));
          border: 1px solid var(--border-thin);
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
          white-space: nowrap;
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

        /* Navigation scrollable area */
        .nav-scroll {
          flex-grow: 1;
          overflow-y: auto;
          padding: 16px;
          margin-right: -8px;
          padding-right: 8px;
          position: relative;
          z-index: 1;
        }

        /* Shimmering scrollbar track effect */
        .nav-scroll::-webkit-scrollbar-track {
          background: linear-gradient(
            to bottom,
            transparent,
            rgba(var(--accent-primary-rgb), 0.05),
            transparent
          );
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

        /* Footer with enhanced styling */
        .sidebar-footer {
          position: relative;
          padding: 16px 18px;
          border-top: 1px solid var(--border-divider);
          display: flex;
          align-items: center;
          justify-content: ${isCollapsed ? 'center' : 'space-between'};
          z-index: 2;
        }

        .footer-content {
          position: relative;
          z-index: 1;
          width: 100%;
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

        /* Animation keyframes */
        @keyframes float-around {
          0%, 100% {
            opacity: 0.5;
            transform: translate(0, 0);
          }
          25% {
            opacity: 0.7;
            transform: translate(10px, -20px);
          }
          50% {
            opacity: 0.5;
            transform: translate(20px, 0);
          }
          75% {
            opacity: 0.7;
            transform: translate(0, -10px);
          }
        }

        @keyframes logo-shine {
          0%, 100% {
            opacity: 0;
            left: -50%;
          }
          50% {
            opacity: 0.5;
          }
          60% {
            opacity: 0.5;
            left: 100%;
          }
          61% {
            opacity: 0;
          }
        }

        @keyframes status-pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.8);
            opacity: 0;
          }
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-50%) translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(-50%) translateX(0);
          }
        }

        /* Media queries for responsive design */
        @media (max-width: 1024px) {
          .glass-sidebar {
            transform: ${isCollapsed ? 'translateX(-100%)' : 'translateX(0)'};
            transition: transform var(--transition-normal) var(--easing-standard), width var(--transition-normal) var(--easing-decelerate);
          }
        }

        @media (max-width: 768px) {
          .sidebar-header {
            padding: 14px;
          }

          .user-profile {
            padding: 14px;
          }

          .nav-scroll {
            padding: 14px 12px;
          }

          .sidebar-footer {
            padding: 14px;
          }
        }
      `}</style>
    </div>
  );
}
