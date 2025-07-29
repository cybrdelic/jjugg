'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { SectionKey, NavItemType } from '@/types';
import {
  Menu, X, Search, Bell, Plus, Command, User, LogOut, Settings
} from 'lucide-react';
import ThemeSwitcher from './ThemeSwitcher';
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
  const { currentTheme } = useTheme();
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

      <style jsx>{`
        /* Base Navbar Styles - Clean & Consistent */
        .modern-navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: var(--navbar-height, 68px);
          background: var(--actual-background, var(--background));
          border-bottom: var(--navbar-border, var(--border-thin));
          z-index: 1000;
          transition: all var(--transition-normal, 0.3s) ease;
        }

        .navbar-container {
          height: 100%;
          max-width: var(--max-content-width, 1400px);
          margin: 0 auto;
          padding: 0 var(--container-padding-x, 32px);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--navbar-gap, 32px);
        }

        /* Left Section */
        .navbar-left {
          display: flex;
          align-items: center;
          gap: var(--navbar-left-gap, 40px);
          flex: 0 1 auto;
        }

        .mobile-menu-btn {
          display: none;
          padding: var(--button-padding-sm, 8px);
          background: var(--card);
          border: var(--border-thin);
          border-radius: var(--button-border-radius);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast, 0.2s) ease;
        }

        .mobile-menu-btn:hover {
          background: var(--hover-bg);
          color: var(--text-primary);
        }

        /* Logo */
        .navbar-logo {
          display: flex;
          align-items: center;
          gap: var(--logo-gap, 10px);
          font-weight: var(--font-weight-headers, 700);
          font-size: var(--font-size-lg, 20px);
          color: var(--text-primary);
        }

        .logo-icon {
          width: var(--logo-size, 32px);
          height: var(--logo-size, 32px);
          background: var(--primary);
          border-radius: var(--button-border-radius);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: var(--font-size-md, 18px);
          font-weight: var(--font-weight-headers, 700);
        }

        .logo-text {
          font-size: var(--font-size-md, 18px);
          letter-spacing: var(--letter-spacing, -0.5px);
        }

        /* Desktop Navigation */
        .desktop-nav {
          display: flex;
          align-items: center;
          gap: var(--nav-gap, 4px);
          background: var(--glass-card-container-bg);
          border: var(--border-thin);
          border-radius: var(--container-border-radius);
          padding: var(--nav-padding, 6px);
        }

        .nav-item {
          position: relative;
          display: flex;
          align-items: center;
          gap: var(--nav-item-gap, 8px);
          padding: var(--button-padding);
          background: none;
          border: none;
          border-radius: var(--button-border-radius);
          color: var(--text-secondary);
          font-size: var(--font-size-sm, 14px);
          font-weight: var(--font-weight-secondary);
          cursor: pointer;
          transition: all var(--transition-fast, 0.2s) ease;
          white-space: nowrap;
          text-transform: var(--text-transform);
          letter-spacing: var(--letter-spacing);
        }

        .nav-item:hover {
          background: var(--glass-hover-bg);
          color: var(--text-primary);
        }

        .nav-item.active {
          background: var(--primary);
          color: white;
          box-shadow: var(--button-shadow);
        }

        .nav-icon {
          display: flex;
          align-items: center;
          font-size: var(--icon-size, 16px);
        }

        .nav-label {
          white-space: nowrap;
          font-weight: var(--font-weight-secondary, 500);
        }

        .nav-badge {
          position: absolute;
          top: var(--badge-offset-y, 2px);
          right: var(--badge-offset-x, 2px);
          min-width: var(--badge-size, 18px);
          height: var(--badge-size, 18px);
          background: var(--accent-red);
          color: white;
          border-radius: calc(var(--badge-size, 18px) / 2);
          font-size: var(--font-size-xs, 10px);
          font-weight: var(--font-weight-headers, 700);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 var(--badge-padding, 5px);
          box-shadow: var(--shadow-md);
        }

        /* Right Section */
        .navbar-right {
          display: flex;
          align-items: center;
          gap: var(--navbar-right-gap, 12px);
          flex: 0 0 auto;
        }

        /* Search */
        .navbar-search {
          width: var(--search-width, 280px);
          max-width: var(--search-width, 280px);
          transition: all var(--transition-normal, 0.3s) ease;
        }

        .navbar-search:focus-within {
          width: var(--search-width-expanded, 350px);
          max-width: var(--search-width-expanded, 350px);
        }


        /* Icon Buttons */
        .icon-btn {
          position: relative;
          width: var(--icon-btn-size, 40px);
          height: var(--icon-btn-size, 40px);
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--glass-button-bg);
          border: var(--border-thin);
          border-radius: var(--button-border-radius);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast, 0.2s) ease;
        }

        .icon-btn:hover {
          background: var(--glass-hover-bg);
          color: var(--text-primary);
          transform: translateY(var(--hover-lift, -1px));
        }

        .badge {
          position: absolute;
          top: var(--badge-offset-top, -6px);
          right: var(--badge-offset-right, -6px);
          min-width: var(--badge-size-lg, 20px);
          height: var(--badge-size-lg, 20px);
          background: var(--accent-red);
          color: white;
          border-radius: calc(var(--badge-size-lg, 20px) / 2);
          font-size: var(--font-size-xs, 11px);
          font-weight: var(--font-weight-headers, 700);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 var(--badge-padding, 6px);
          box-shadow: var(--shadow-md);
          border: var(--badge-border-width, 2px) solid var(--background);
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
          background: var(--card);
          border: var(--border-thin);
          border-radius: var(--card-border-radius, 12px);
          box-shadow: var(--shadow-lg);
          overflow: hidden;
          z-index: 1001;
          animation: dropdownIn 0.2s ease;
        }

        @keyframes dropdownIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
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
