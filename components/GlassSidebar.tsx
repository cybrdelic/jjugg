'use client';
import { useState, useRef, useEffect, Dispatch, SetStateAction, JSX } from 'react';
import Link from 'next/link';
import {
  HomeIcon,
  DocumentIcon,
  BellIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ClockIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/solid';

// Define SectionKey type (same as in Home.tsx)
type SectionKey =
  | 'dashboard-home'
  | 'applications-section'
  | 'reminders-section'
  | 'interviews-section'
  | 'profile-artifacts-section'
  | 'goals-section'
  | 'timeline-section';

// Define props interface for GlassSidebar
interface GlassSidebarProps {
  currentSection: SectionKey;
  setCurrentSection: Dispatch<SetStateAction<SectionKey>>;
}

export default function GlassSidebar({ currentSection, setCurrentSection }: GlassSidebarProps) {
  // State
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    itemId: '',
    itemLabel: '',
    itemIcon: null as JSX.Element | null,
    itemColor: '',
  });
  const [collapsedSections, setCollapsedSections] = useState({
    main: false,
    settings: false,
  });

  // Refs
  const sidebarRef = useRef<HTMLDivElement>(null);
  const initialX = useRef(0);
  const initialWidth = useRef(280);
  const contentAreaRef = useRef<HTMLElement | null>(null);

  // Effect to adjust content area margin
  useEffect(() => {
    contentAreaRef.current = document.getElementById('content-area') as HTMLElement;
    if (contentAreaRef.current) {
      contentAreaRef.current.style.marginLeft = isCollapsed
        ? '80px'
        : `${sidebarRef.current?.offsetWidth || 280}px`;
    }
  }, [isCollapsed]);

  // Toggle sidebar collapse
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Toggle theme
  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  // Toggle section collapse
  const toggleSection = (sectionId: 'main' | 'settings') => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  // Handle navigation item clicks
  const handleNavItemClick = (e: React.MouseEvent<HTMLDivElement>, itemColor: string, itemRgb: string) => {
    const element = e.currentTarget;
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    element.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);

    if (itemColor && itemRgb) {
      document.documentElement.style.setProperty('--primary-color', itemColor);
      document.documentElement.style.setProperty('--primary-rgb', itemRgb);
    }
  };

  // Handle resize start
  const handleResizeStart = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    initialX.current = e.clientX;
    initialWidth.current = sidebarRef.current?.offsetWidth || 280;
  };

  // Handle resize movement and end
  useEffect(() => {
    const handleResizeMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const delta = e.clientX - initialX.current;
      const newWidth = Math.max(180, Math.min(400, initialWidth.current + delta));
      if (sidebarRef.current) {
        sidebarRef.current.style.width = `${newWidth}px`;
      }
      if (contentAreaRef.current) {
        contentAreaRef.current.style.marginLeft = `${newWidth}px`;
      }
    };

    const handleResizeEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
    };
  }, [isDragging]);

  // Handle context menu
  const handleContextMenu = (
    e: React.MouseEvent<HTMLDivElement>,
    itemId: string,
    itemLabel: string,
    itemIcon: JSX.Element,
    itemColor: string
  ) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.pageX,
      y: e.pageY,
      itemId,
      itemLabel,
      itemIcon,
      itemColor,
    });
  };

  // Close context menu on click outside
  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu((prev) => ({ ...prev, visible: false }));
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Define NavItem type
  interface NavItem {
    id: string; // Will be SectionKey for sections, string for links
    label: string;
    icon: JSX.Element;
    color: string;
    rgb: string;
    type: 'section' | 'link';
    path?: string;
  }

  // Navigation items
  const navItems: NavItem[] = [
    {
      id: 'dashboard-home',
      label: 'Home',
      icon: <HomeIcon className="w-5 h-5" />,
      color: 'blue',
      rgb: '59,130,246',
      type: 'section',
    },
    {
      id: 'applications-section',
      label: 'Applications',
      icon: <DocumentIcon className="w-5 h-5" />,
      color: 'purple',
      rgb: '139,92,246',
      type: 'section',
    },
    {
      id: 'reminders-section',
      label: 'Reminders',
      icon: <BellIcon className="w-5 h-5" />,
      color: 'pink',
      rgb: '236,72,153',
      type: 'section',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <ChartBarIcon className="w-5 h-5" />,
      color: 'green',
      rgb: '16,185,129',
      type: 'link',
      path: '/analytics',
    },
    {
      id: 'interviews-section',
      label: 'Interviews',
      icon: <ChatBubbleLeftRightIcon className="w-5 h-5" />,
      color: 'orange',
      rgb: '249,115,22',
      type: 'section',
    },
    {
      id: 'profile-artifacts-section',
      label: 'Profile Artifacts',
      icon: <DocumentTextIcon className="w-5 h-5" />,
      color: 'teal',
      rgb: '45,212,191',
      type: 'section',
    },
    {
      id: 'goals-section',
      label: 'Goals',
      icon: <ClockIcon className="w-5 h-5" />,
      color: 'yellow',
      rgb: '234,179,8',
      type: 'section',
    },
    {
      id: 'timeline-section',
      label: 'Timeline',
      icon: <ArrowDownTrayIcon className="w-5 h-5" />,
      color: 'red',
      rgb: '239,68,68',
      type: 'section',
    },
  ];

  // Render context menu
  const renderContextMenu = () => {
    if (!contextMenu.visible) return null;
    return (
      <div className="context-menu" style={{ top: contextMenu.y, left: contextMenu.x }
      }>
        <div className="context-item" > Pin {contextMenu.itemLabel} </div>
        < div className="context-item" > Edit {contextMenu.itemLabel} </div>
        < div className="context-item" > Remove {contextMenu.itemLabel} </div>
      </div>
    );
  };

  // CSS classes
  const sidebarClasses = `glass-sidebar ${isCollapsed ? 'collapsed' : ''} ${isDarkTheme ? 'dark-theme' : 'light-theme'
    }`;

  return (
    <>
      <div ref={sidebarRef} className={sidebarClasses} >
        {/* Header */}
        < div className="sidebar-header" >
          <div className="logo-container" >
            <div className="logo" > J </div>
            {!isCollapsed && <div className="logo-text" > jjugg </div>}
          </div>
          < button className="toggle-btn" onClick={toggleSidebar} >
            <svg viewBox="0 0 24 24" width="24" height="24" >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <div className="nav-container" >
          {/* Main Navigation Section */}
          < div className={`section ${collapsedSections.main ? 'section-collapsed' : ''}`}>
            <div className="section-header" onClick={() => toggleSection('main')}>
              <span>Main Navigation </span>
              < div className="section-toggle" >
                <svg viewBox="0 0 24 24" width="16" height="16" >
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            < div className="section-items" >
              {
                navItems.map((item) =>
                  item.type === 'section' ? (
                    <div
                      key={item.id}
                      className={`nav-item ${currentSection === item.id ? 'active' : ''}`}
                      onClick={(e) => {
                        setCurrentSection(item.id as SectionKey); // Safe cast since section IDs match SectionKey
                        handleNavItemClick(e, item.color, item.rgb);
                      }}
                      onContextMenu={(e) => handleContextMenu(e, item.id, item.label, item.icon, item.color)}
                    >
                      <div className="hover-indicator" />
                      <div className="nav-icon" > {item.icon} </div>
                      {!isCollapsed && <div className="nav-label" > {item.label} </div>}
                      {isCollapsed && <div className="tooltip" > {item.label} </div>}
                    </div>
                  ) : (
                    <Link href={item.path!} key={item.id} >
                      <div
                        className={`nav-item ${currentSection === item.id ? 'active' : ''}`}
                        onClick={(e) => handleNavItemClick(e, item.color, item.rgb)}
                        onContextMenu={(e) => handleContextMenu(e, item.id, item.label, item.icon, item.color)}
                      >
                        <div className="hover-indicator" />
                        <div className="nav-icon" > {item.icon} </div>
                        {!isCollapsed && <div className="nav-label" > {item.label} </div>}
                        {isCollapsed && <div className="tooltip" > {item.label} </div>}
                      </div>
                    </Link>
                  )
                )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sidebar-footer" >
          <div className="nav-item" onClick={toggleTheme} >
            <div className="hover-indicator" />
            <div className="nav-icon" >
              {
                isDarkTheme ? (
                  <svg viewBox="0 0 24 24" width="20" height="20" >
                    <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="20" height="20" >
                    <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
            </div>
            {!isCollapsed && <div className="nav-label" > {isDarkTheme ? 'Light Theme' : 'Dark Theme'} </div>}
            {isCollapsed && <div className="tooltip" > {isDarkTheme ? 'Light Theme' : 'Dark Theme'} </div>}
          </div>
        </div>

        {/* Resize Handle */}
        <div className="resize-handle" onMouseDown={handleResizeStart} />
      </div>
      {renderContextMenu()}
      {/* CSS Styles */}
      <style jsx global > {`
        .glass-sidebar {
          width: 280px;
          height: 100vh;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-right: 1px solid rgba(255, 255, 255, 0.2);
          display: flex;
          flex-direction: column;
          transition: width 0.3s ease;
          position: fixed;
          top: 0;
          left: 0;
          z-index: 1000;
        }
        .glass-sidebar.collapsed {
          width: 80px;
        }
        .sidebar-header {
          padding: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }
        .logo-container {
          display: flex;
          align-items: center;
        }
        .logo {
          width: 40px;
          height: 40px;
          background: var(--primary-color, #3b82f6);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: bold;
          color: white;
        }
        .logo-text {
          margin-left: 12px;
          font-size: 18px;
          font-weight: 600;
          color: #fff;
        }
        .toggle-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
        }
        .toggle-btn svg {
          stroke: #fff;
          stroke-width: 2;
        }
        .nav-container {
          flex: 1;
          overflow-y: auto;
          padding: 16px 0;
        }
        .section-header {
          padding: 8px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          color: #fff;
          font-size: 14px;
          text-transform: uppercase;
        }
        .section-toggle svg {
          stroke: #fff;
          stroke-width: 2;
          transition: transform 0.3s ease;
        }
        .section-collapsed .section-toggle svg {
          transform: rotate(180deg);
        }
        .section-items {
          display: flex;
          flex-direction: column;
        }
        .section-collapsed .section-items {
          display: none;
        }
        .nav-item {
          padding: 10px 16px;
          display: flex;
          align-items: center;
          position: relative;
          cursor: pointer;
          color: #fff;
          overflow: hidden;
        }
        .nav-item:hover .hover-indicator,
        .nav-item.active .hover-indicator {
          opacity: 1;
          transform: translateX(0);
        }
        .hover-indicator {
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          width: 4px;
          background: var(--primary-color, #3b82f6);
          opacity: 0;
          transform: translateX(-100%);
          transition: opacity 0.2s ease, transform 0.2s ease;
        }
        .nav-icon {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
        }
        .nav-label {
          margin-left: 12px;
          font-size: 14px;
        }
        .nav-item.active {
          background: rgba(255, 255, 255, 0.1);
        }
        .tooltip {
          position: absolute;
          left: 100%;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(0, 0, 0, 0.8);
          color: #fff;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          white-space: nowrap;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.2s ease;
          margin-left: 8px;
        }
        .nav-item:hover .tooltip {
          opacity: 1;
        }
        .sidebar-footer {
          padding: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.2);
        }
        .resize-handle {
          position: absolute;
          right: 0;
          top: 0;
          width: 4px;
          height: 100%;
          background: rgba(255, 255, 255, 0.2);
          cursor: ew-resize;
        }
        .context-menu {
          position: absolute;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          z-index: 1001;
          min-width: 150px;
        }
        .context-item {
          padding: 8px 16px;
          color: #333;
          font-size: 14px;
          cursor: pointer;
        }
        .context-item:hover {
          background: rgba(0, 0, 0, 0.05);
        }
        .ripple {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          transform: scale(0);
          animation: ripple 0.6s linear;
          pointer-events: none;
        }
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
        .dark-theme {
          background: rgba(31, 41, 55, 0.9);
          border-right: 1px solid rgba(255, 255, 255, 0.1);
        }
        .dark-theme .sidebar-header,
        .dark-theme .sidebar-footer {
          border-color: rgba(255, 255, 255, 0.1);
        }
        .dark-theme .context-menu {
          background: rgba(55, 65, 81, 0.9);
          color: #fff;
        }
        .dark-theme .context-item {
          color: #fff;
        }
        .dark-theme .context-item:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        .glass-sidebar.collapsed .logo-text,
        .glass-sidebar.collapsed .nav-label {
          display: none;
        }
      `}</style>
    </>
  );
}
