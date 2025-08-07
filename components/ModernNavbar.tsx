import React, { useState, useEffect, useRef } from 'react';
import { SectionKey, NavItemType } from '@/types';
import {
  Menu, X, Search, Bell, Plus, Command, User, LogOut, Settings
} from 'lucide-react';
import { ThemeSwitcher } from './ThemeSwitcher';
import ModernSearchBar from './ModernSearchBar';

interface ModernNavbarProps {
  items: NavItemType[];
  currentSection: SectionKey;
  setCurrentSection: (section: SectionKey) => void;
  userName: string;
  userAvatar?: string;
  onMobileMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

export default function ModernNavbar({
  items,
  currentSection,
  setCurrentSection,
  userName,
  userAvatar,
  onMobileMenuToggle,
  isMobileMenuOpen = false
}: ModernNavbarProps) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationMenuOpen, setIsNotificationMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Note: Keyboard shortcuts are now handled by ModernSearchBar component

  const getTotalNotifications = () => {
    return items.reduce((total, item) => {
      if (item.badge && 'count' in item.badge) {
        return total + item.badge.count;
      }
      return total;
    }, 0);
  };

  const notifications = [
    { id: 1, title: 'New application response', time: '2 minutes ago', unread: true },
    { id: 2, title: 'Interview scheduled', time: '1 hour ago', unread: true },
    { id: 3, title: 'Follow-up reminder', time: '3 hours ago', unread: false },
  ];

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  return (
    <>
      <nav className="modern-navbar">
        <div className="navbar-container">
          {/* Left: Logo and Navigation */}
          <div className="navbar-left">
            {/* Mobile Menu */}
            <button
              className="mobile-menu-btn"
              onClick={onMobileMenuToggle}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Logo */}
            <div className="navbar-logo">
              <div className="logo-icon">J</div>
              <span className="logo-text">jjugg</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="desktop-nav">
              {items.map((item) => {
                const isActive = currentSection === item.key;
                return (
                  <button
                    key={item.key}
                    className={`nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => setCurrentSection(item.key)}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-label">{item.label}</span>
                    {item.badge && 'count' in item.badge && item.badge.count > 0 && (
                      <span className="nav-badge">{item.badge.count}</span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right: Search and Actions */}
          <div className="navbar-right">
            {/* Search */}
            <ModernSearchBar
              applications={[]}
              onSearch={(query) => {
                // Handle global search
                console.log('Global search:', query);
              }}
              placeholder="Search..."
              className="navbar-search"
            />



            {/* Notifications */}
            <div ref={notificationRef} className="dropdown-container">
              <button
                className="icon-btn"
                onClick={() => setIsNotificationMenuOpen(!isNotificationMenuOpen)}
                aria-label="Notifications"
              >
                <Bell size={18} />
                {getTotalNotifications() > 0 && (
                  <span className="badge">{getTotalNotifications()}</span>
                )}
              </button>

              {isNotificationMenuOpen && (
                <div className="dropdown notifications-dropdown">
                  <div className="dropdown-header">
                    <h3>Notifications</h3>
                    <button className="text-btn">Clear all</button>
                  </div>
                  <div className="notifications-list">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`notification-item ${notif.unread ? 'unread' : ''}`}
                      >
                        <div className="notification-content">
                          <p className="notification-title">{notif.title}</p>
                          <span className="notification-time">{notif.time}</span>
                        </div>
                        {notif.unread && <div className="unread-dot" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <ThemeSwitcher />

            {/* Profile */}
            <div ref={profileRef} className="dropdown-container">
              <button
                className="profile-btn"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                aria-label="Profile menu"
              >
                <div className="avatar">
                  {userAvatar ? (
                    <img src={userAvatar} alt={userName} />
                  ) : (
                    <span>{userName.charAt(0).toUpperCase()}</span>
                  )}
                </div>
              </button>

              {isProfileMenuOpen && (
                <div className="dropdown profile-dropdown">
                  <div className="profile-info">
                    <div className="avatar large">
                      {userAvatar ? (
                        <img src={userAvatar} alt={userName} />
                      ) : (
                        <span>{userName.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <p className="user-name">{userName}</p>
                      <p className="user-email">user@example.com</p>
                    </div>
                  </div>
                  <div className="dropdown-divider" />
                  <button className="dropdown-item">
                    <User size={16} />
                    <span>Profile</span>
                  </button>
                  <button className="dropdown-item">
                    <Settings size={16} />
                    <span>Settings</span>
                  </button>
                  <div className="dropdown-divider" />
                  <button className="dropdown-item danger">
                    <LogOut size={16} />
                    <span>Sign out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="mobile-nav">
          {items.map((item) => {
            const isActive = currentSection === item.key;
            return (
              <button
                key={item.key}
                className={`mobile-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  setCurrentSection(item.key);
                  onMobileMenuToggle?.();
                }}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
                {item.badge && 'count' in item.badge && item.badge.count > 0 && (
                  <span className="nav-badge">{item.badge.count}</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* CSS now comes from global theme.css - no more complex injection! */}
      <style jsx>{`
        .modern-navbar {
          /* All CSS variables are now defined in styles/theme.css */
          /* This eliminates the need for complex JavaScript theme injection */
        }
      `}</style>

      <style jsx>{`
        /* Base Navbar Styles - Using CSS custom properties from theme.css */
        .modern-navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: var(--navbar-height);
          background: var(--glass-bg);
          border-bottom: 1px solid var(--border);
          z-index: 1000;
          transition: all var(--transition);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .navbar-container {
          height: 100%;
          max-width: var(--max-content-width);
          margin: 0 auto;
          padding: 0 var(--container-padding);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--navbar-gap);
        }

        /* Left Section */
        .navbar-left {
          display: flex;
          align-items: center;
          gap: var(--space-10);
          flex: 0 1 auto;
        }

        .mobile-menu-btn {
          display: none;
          padding: var(--space-2);
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--border-radius);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .mobile-menu-btn:hover {
          background: var(--hover-bg);
          color: var(--text-primary);
        }

        /* Logo */
        .navbar-logo {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          font-weight: var(--font-weight-bold);
          font-size: var(--font-size-lg);
          color: var(--text-primary);
        }

        .logo-icon {
          width: var(--logo-size);
          height: var(--logo-size);
          background: var(--primary);
          border-radius: var(--border-radius);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-inverse);
          font-size: var(--font-size-md);
          font-weight: var(--font-weight-bold);
          transition: all var(--duration-300) var(--ease-magnetic);
          box-shadow: 0 0 0 1px var(--primary-alpha-20);
          position: relative;
          overflow: hidden;
        }

        .logo-icon:after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(45deg, transparent, rgba(255,255,255,0.2), transparent);
          transform: translateX(-100%);
          transition: transform 0.6s ease;
        }

        .navbar-logo:hover .logo-icon {
          transform: scale(1.05);
          box-shadow:
            0 0 0 1px var(--primary-alpha-20),
            0 4px 12px var(--primary-alpha-20);
        }

        .navbar-logo:hover .logo-icon:after {
          transform: translateX(100%);
        }

        .logo-text {
          font-size: var(--font-size-md);
          letter-spacing: var(--letter-spacing);
          transition: color var(--duration-150) var(--ease-out);
        }

        .navbar-logo:hover .logo-text {
          color: var(--primary);
        }

        /* Desktop Navigation */
        .desktop-nav {
          display: flex;
          align-items: center;
          gap: var(--nav-gap);
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--border-radius-lg);
          padding: var(--space-2);
        }

        .nav-item {
          position: relative;
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-3) var(--space-4);
          background: none;
          border: none;
          border-radius: var(--border-radius);
          color: var(--text-secondary);
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-medium);
          cursor: pointer;
          transition: all var(--duration-200) var(--ease-magnetic);
          white-space: nowrap;
          overflow: hidden;
        }

        .nav-item::before {
          content: '';
          position: absolute;
          inset: 0;
          background: var(--highlight-gradient);
          opacity: 0;
          transition: opacity var(--duration-200) var(--ease-magnetic);
          z-index: 0;
        }

        .nav-item:hover {
          background: var(--glass-hover-bg);
          color: var(--text-primary);
          transform: translateY(-1px);
        }

        .nav-item:hover::before {
          opacity: 0.1;
        }

        .nav-item.active {
          background: var(--primary);
          color: var(--text-inverse);
          box-shadow:
            0 4px 12px var(--primary-alpha-20),
            0 0 0 1px var(--primary-alpha-20);
          transform: translateY(-1px);
        }

        .nav-item.active::before {
          opacity: 0.15;
        }

        .nav-icon {
          display: flex;
          align-items: center;
          font-size: var(--icon-size);
        }

        .nav-label {
          white-space: nowrap;
          font-weight: var(--font-weight-medium);
        }

        .nav-badge {
          position: absolute;
          top: 2px;
          right: 2px;
          min-width: var(--badge-size);
          height: var(--badge-size);
          background: var(--error);
          color: var(--text-inverse);
          border-radius: var(--border-radius-full);
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-bold);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 var(--space-1);
          box-shadow: var(--shadow);
        }

        /* Right Section */
        .navbar-right {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          flex: 0 0 auto;
        }

        /* Search */
        .navbar-search {
          width: 280px;
          max-width: 280px;
          transition: all var(--transition);
        }

        .navbar-search:focus-within {
          width: 350px;
          max-width: 350px;
        }

        /* Icon Buttons */
        .icon-btn {
          position: relative;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--glass-bg);
          border: 1px solid var(--border);
          border-radius: var(--border-radius);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--duration-200) var(--ease-magnetic);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          overflow: hidden;
        }

        .icon-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: var(--highlight-gradient);
          opacity: 0;
          transition: opacity var(--duration-200) var(--ease-magnetic);
        }

        .icon-btn:hover {
          background: var(--glass-hover-bg);
          color: var(--text-primary);
          border-color: var(--border-focus);
          transform: translateY(-2px) scale(1.05);
          box-shadow:
            0 4px 12px var(--shadow-color),
            0 0 0 1px var(--border-focus);
        }

        .icon-btn:hover::before {
          opacity: 0.1;
        }

        .badge {
          position: absolute;
          top: -6px;
          right: -6px;
          min-width: 20px;
          height: 20px;
          background: var(--error);
          color: var(--text-inverse);
          border-radius: var(--border-radius-full);
          font-size: 11px;
          font-weight: var(--font-weight-bold);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 var(--space-1);
          box-shadow: var(--shadow);
          border: 2px solid var(--background);
        }

        /* Dropdowns */
        .dropdown-container {
          position: relative;
        }

        .dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          min-width: 240px;
          background: var(--glass-bg);
          border: 1px solid var(--border-focus);
          border-radius: var(--border-radius-lg);
          box-shadow:
            0 8px 24px var(--shadow-color),
            0 2px 8px var(--highlight-primary-alpha);
          overflow: hidden;
          z-index: 1001;
          animation: dropdownIn 0.3s var(--ease-magnetic);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        @keyframes dropdownIn {
          0% {
            opacity: 0;
            transform: translateY(-12px) scale(0.98);
            filter: blur(8px);
          }
          50% {
            opacity: 0.5;
            transform: translateY(-6px) scale(0.99);
            filter: blur(4px);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }

        .dropdown-header {
          padding: var(--card-padding, 16px);
          border-bottom: var(--border-divider);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .dropdown-header h3 {
          margin: 0;
          font-size: 14px;
          font-weight: var(--font-weight-secondary, 600);
          color: var(--text-primary);
        }

        .text-btn {
          background: none;
          border: none;
          color: var(--primary);
          font-size: 12px;
          font-weight: var(--font-weight-secondary, 500);
          cursor: pointer;
        }

        .text-btn:hover {
          text-decoration: underline;
        }

        /* Notifications */
        .notifications-dropdown {
          width: 360px;
        }

        .notifications-list {
          max-height: 400px;
          overflow-y: auto;
        }

        .notification-item {
          position: relative;
          padding: var(--card-padding, 16px);
          border-bottom: var(--border-divider);
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .notification-item:hover {
          background: var(--hover-bg);
        }

        .notification-item.unread {
          background: var(--hover-bg);
        }

        .notification-content {
          padding-right: 20px;
        }

        .notification-title {
          margin: 0 0 4px 0;
          font-size: 14px;
          font-weight: var(--font-weight-secondary, 500);
          color: var(--text-primary);
        }

        .notification-time {
          font-size: 12px;
          color: var(--text-tertiary);
        }

        .unread-dot {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          width: 8px;
          height: 8px;
          background: var(--primary);
          border-radius: 50%;
        }

        /* Profile */
        .profile-btn {
          padding: 4px;
          background: none;
          border: none;
          cursor: pointer;
        }

        .avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--primary);
          color: white;
          font-size: 14px;
          font-weight: var(--font-weight-secondary, 600);
          transition: transform 0.2s ease;
        }

        .profile-btn:hover .avatar {
          transform: scale(1.05);
        }

        .avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar.large {
          width: 48px;
          height: 48px;
          font-size: 18px;
        }

        .profile-dropdown {
          width: 280px;
        }

        .profile-info {
          padding: var(--card-padding, 16px);
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: var(--border-divider);
        }

        .user-name {
          margin: 0 0 2px 0;
          font-size: 14px;
          font-weight: var(--font-weight-secondary, 600);
          color: var(--text-primary);
        }

        .user-email {
          margin: 0;
          font-size: 12px;
          color: var(--text-tertiary);
        }

        .dropdown-divider {
          height: 1px;
          background: var(--border-divider);
          margin: 8px 0;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 10px var(--card-padding, 16px);
          background: none;
          border: none;
          color: var(--text-primary);
          font-size: 14px;
          cursor: pointer;
          transition: background 0.2s ease;
          text-align: left;
        }

        .dropdown-item:hover {
          background: var(--hover-bg);
        }

        .dropdown-item.danger {
          color: var(--accent-red);
        }

        /* Mobile Navigation */
        .mobile-nav {
          position: fixed;
          top: var(--navbar-height, 68px);
          left: 0;
          right: 0;
          background: var(--surface) !important;
          border-bottom: var(--navbar-border, var(--border-thin));
          padding: 12px 16px;
          display: none;
          z-index: 999;
          box-shadow: var(--navbar-shadow, var(--shadow-md));
        }

        .mobile-nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 14px var(--card-padding, 16px);
          background: none;
          border: none;
          border-radius: var(--button-border-radius, 12px);
          color: var(--text-secondary);
          font-size: 15px;
          font-weight: var(--font-weight-secondary, 500);
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
          margin-bottom: 4px;
          text-transform: var(--text-transform, none);
          letter-spacing: var(--letter-spacing, normal);
        }

        .mobile-nav-item:hover {
          background: var(--hover-bg);
          color: var(--text-primary);
        }

        .mobile-nav-item.active {
          background: var(--primary);
          color: white;
          box-shadow: var(--button-shadow);
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .navbar-container {
            gap: 16px;
          }

          .desktop-nav {
            gap: 2px;
          }

          .nav-label {
            display: none;
          }

          .nav-item {
            padding: 8px 12px;
          }
        }

        @media (max-width: 768px) {
          .navbar-container {
            padding: 0 16px;
          }

          .mobile-menu-btn {
            display: flex;
          }

          .desktop-nav {
            display: none;
          }

          .navbar-search {
            display: none;
          }


          .mobile-nav {
            display: block;
          }
        }

        @media (max-width: 480px) {
          .navbar-container {
            padding: 0 12px;
          }

          .logo-text {
            display: none;
          }

          .navbar-right {
            gap: 8px;
          }
        }
      `}</style>
    </>
  );
}
