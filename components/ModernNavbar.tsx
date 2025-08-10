import React, { useState, useEffect, useRef } from 'react';
import { SectionKey, NavItemType } from '@/types';
import {
  Menu, X, Search, Bell, Plus, Command, User, LogOut, Settings, Server as ServerIcon, Mail
} from 'lucide-react';
import { ThemeSwitcher } from './ThemeSwitcher';
import ModernSearchBar from './ModernSearchBar';
import { useRouter } from 'next/router';

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
  const { push } = useRouter();

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
                  <button className="dropdown-item" onClick={() => { push('/profile'); setIsProfileMenuOpen(false); }}>
                    <User size={16} />
                    <span>Profile</span>
                  </button>
                  <button className="dropdown-item" onClick={() => { push('/profile'); setIsProfileMenuOpen(false); }}>
                    <Settings size={16} />
                    <span>Settings</span>
                  </button>
                  <button className="dropdown-item" onClick={() => { push('/email-setup'); setIsProfileMenuOpen(false); }}>
                    <Mail size={16} />
                    <span>Email Setup</span>
                  </button>
                  <button className="dropdown-item" onClick={() => { push('/daemon'); setIsProfileMenuOpen(false); }}>
                    <ServerIcon size={16} />
                    <span>Daemon</span>
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
          border-radius: var(--radius-md);
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
          font-weight: var(--font-semibold);
          font-size: var(--text-lg);
          color: var(--text-primary);
        }

        .logo-icon {
          width: var(--logo-size);
          height: var(--logo-size);
          background: var(--primary);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-inverse);
          font-size: var(--text-base);
          font-weight: var(--font-semibold);
          transition: all var(--duration-200) var(--ease-out);
          position: relative;
          overflow: hidden;
        }

        .logo-icon:after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(45deg, transparent, rgba(255,255,255,0.2), transparent);
          transform: translateX(-100%);
          transition: transform var(--duration-300) var(--ease-out);
        }

        .navbar-logo:hover .logo-icon {
          transform: scale(1.02);
        }

        .navbar-logo:hover .logo-icon:after {
          transform: translateX(100%);
        }

        .logo-text {
          font-size: var(--text-base);
          letter-spacing: var(--tracking-tight);
          transition: color var(--duration-150) var(--ease-out);
        }

        .navbar-logo:hover .logo-text {
          color: var(--primary);
        }

        /* Desktop Navigation */
        .desktop-nav {
          display: flex;
          align-items: center;
          gap: var(--space-1);
        }

        .nav-item {
          position: relative;
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-1-5) var(--space-2-5);
          background: none;
          border: none;
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          font-size: var(--text-sm);
          font-weight: var(--font-medium);
          cursor: pointer;
          transition: all var(--duration-150) var(--ease-out);
          white-space: nowrap;
          overflow: hidden;
        }

        .nav-item:hover {
          background: var(--hover-bg);
          color: var(--text-primary);
        }

        .nav-item.active {
          background: var(--primary);
          color: var(--text-inverse);
        }

        .nav-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: var(--icon-base);
          height: var(--icon-base);
        }

        .nav-label {
          font-size: var(--text-sm);
          font-weight: var(--font-medium);
        }

        .nav-badge {
          background: var(--error);
          color: var(--text-inverse);
          border-radius: var(--radius-full);
          padding: var(--space-0-5) var(--space-1-5);
          font-size: var(--text-2xs);
          font-weight: var(--font-semibold);
          min-width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
          background: var(--primary);
          color: white;
        }

        .nav-icon {
          display: flex;
          align-items: center;
          font-size: 16px;
        }

        .nav-label {
          white-space: nowrap;
          font-weight: 500;
        }

        .nav-badge {
          position: absolute;
          top: 2px;
          right: 2px;
          min-width: 18px;
          height: 18px;
          background: var(--error);
          color: white;
          border-radius: 50%;
          font-size: 11px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
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
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--duration-150) var(--ease-out);
          overflow: hidden;
        }

        .icon-btn:hover {
          background: var(--hover-bg);
          color: var(--text-primary);
          border-color: var(--border-strong);
        }

        .icon-btn.active {
          background: var(--primary);
          color: var(--text-inverse);
          border-color: var(--primary);
        }

        .badge {
          position: absolute;
          top: -6px;
          right: -6px;
          min-width: 20px;
          height: 20px;
          background: var(--error);
          color: var(--text-inverse);
          border-radius: var(--radius-full);
          font-size: var(--text-2xs);
          font-weight: var(--font-semibold);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 var(--space-1);
          border: 2px solid var(--surface);
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
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-md);
          overflow: hidden;
          z-index: 1001;
          animation: dropdownIn var(--duration-200) var(--ease-out);
        }

        @keyframes dropdownIn {
          0% {
            opacity: 0;
            transform: translateY(-8px) scale(0.98);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .dropdown-header {
          padding: var(--space-4);
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .dropdown-header h3 {
          margin: 0;
          font-size: var(--text-sm);
          font-weight: var(--font-semibold);
          color: var(--text-primary);
        }

        .text-btn {
          background: none;
          border: none;
          color: var(--primary);
          font-size: var(--text-xs);
          cursor: pointer;
          padding: var(--space-1);
          border-radius: var(--radius);
          transition: all var(--duration-150) var(--ease-out);
        }

        .text-btn:hover {
          background: var(--hover-bg);
        }
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
          padding: var(--space-4);
          display: flex;
          align-items: center;
          gap: var(--space-3);
          border-bottom: 1px solid var(--border);
        }

        .user-name {
          margin: 0 0 var(--space-0-5) 0;
          font-size: var(--text-sm);
          font-weight: var(--font-semibold);
          color: var(--text-primary);
        }

        .user-email {
          margin: 0;
          font-size: var(--text-xs);
          color: var(--text-tertiary);
        }

        .dropdown-divider {
          height: 1px;
          background: var(--border);
          margin: var(--space-2) 0;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          width: 100%;
          padding: var(--space-2-5) var(--space-4);
          background: none;
          border: none;
          color: var(--text-primary);
          font-size: var(--text-sm);
          cursor: pointer;
          transition: background var(--duration-150) var(--ease-out);
          text-align: left;
        }

        .dropdown-item:hover {
          background: var(--hover-bg);
        }

        .dropdown-item.danger {
          color: var(--error);
        }

        /* Mobile Navigation */
        .mobile-nav {
          position: fixed;
          top: var(--navbar-height);
          left: 0;
          right: 0;
          background: var(--surface);
          border-bottom: 1px solid var(--border);
          padding: var(--space-3) var(--space-4);
          display: none;
          z-index: 999;
          box-shadow: var(--shadow-md);
        }

        .mobile-nav-item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          width: 100%;
          padding: var(--space-3-5) var(--space-4);
          background: none;
          border: none;
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          font-size: var(--text-base);
          font-weight: var(--font-medium);
          cursor: pointer;
          transition: all var(--duration-150) var(--ease-out);
          text-align: left;
          margin-bottom: var(--space-1);
        }

        .mobile-nav-item:hover {
          background: var(--hover-bg);
          color: var(--text-primary);
        }

        .mobile-nav-item.active {
          background: var(--primary);
          color: var(--text-inverse);
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
