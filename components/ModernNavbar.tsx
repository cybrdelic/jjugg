'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { SectionKey, NavItemType } from '@/types';
import {
  Menu, X, Search, Bell, Settings, User, ChevronDown,
  Zap, Sparkles, Home, FileText, Calendar, Target,
  Plus, Filter, MoreHorizontal
} from 'lucide-react';
import ThemeSwitcher from './ThemeSwitcher';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationMenuOpen, setIsNotificationMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
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

  const getActiveItem = () => {
    return items.find(item => item.key === currentSection);
  };

  const getTotalNotifications = () => {
    return items.reduce((total, item) => {
      if (item.badge && 'count' in item.badge) {
        return total + item.badge.count;
      }
      return total;
    }, 0);
  };

  const quickActions = [
    { icon: FileText, label: 'New Application', action: () => console.log('New Application') },
    { icon: Calendar, label: 'Schedule Interview', action: () => console.log('Schedule Interview') },
    { icon: Target, label: 'Set Goal', action: () => console.log('Set Goal') },
    { icon: Bell, label: 'Add Reminder', action: () => console.log('Add Reminder') },
  ];

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  return (
    <>
      <nav className="modern-navbar">
        {/* Left Section */}
        <div className="navbar-left">
          {/* Mobile Menu Toggle */}
          <button
            className="mobile-menu-btn"
            onClick={onMobileMenuToggle}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Logo/Brand */}
          <div className="navbar-brand">
            <div className="brand-icon">
              <Sparkles size={24} />
            </div>
            <span className="brand-text">jjugg</span>
          </div>

          {/* Current Section Indicator */}
          <div className="current-section">
            <div className="section-icon">
              {getActiveItem()?.icon}
            </div>
            <span className="section-label">{getActiveItem()?.label}</span>
          </div>
        </div>

        {/* Center Section - Search & Navigation */}
        <div className="navbar-center">
          {/* Enhanced Search */}
          <div
            ref={searchRef}
            className={`navbar-search ${isSearchFocused ? 'focused' : ''}`}
          >
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search applications, contacts, tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="search-input"
            />
            {searchQuery && (
              <button
                className="clear-search"
                onClick={() => setSearchQuery('')}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Quick Navigation Pills */}
          <div className="nav-pills">
            {items.slice(0, 4).map((item) => (
              <button
                key={item.key}
                className={`nav-pill ${currentSection === item.key ? 'active' : ''}`}
                onClick={() => setCurrentSection(item.key)}
                title={item.label}
              >
                <span className="pill-icon">{item.icon}</span>
                <span className="pill-label">{item.label}</span>
                {item.badge && 'count' in item.badge && item.badge.count > 0 && (
                  <span className="pill-badge">{item.badge.count}</span>
                )}
              </button>
            ))}

            {items.length > 4 && (
              <button className="nav-pill more-items">
                <MoreHorizontal size={16} />
                <span className="pill-label">More</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="navbar-right">
          {/* Quick Actions Dropdown */}
          <div className="quick-actions">
            <button className="action-btn primary">
              <Plus size={16} />
              <span>Quick Add</span>
            </button>
          </div>

          {/* Notifications */}
          <div ref={notificationRef} className="notification-wrapper">
            <button
              className="icon-btn notification-btn"
              onClick={() => setIsNotificationMenuOpen(!isNotificationMenuOpen)}
              aria-label="Notifications"
            >
              <Bell size={18} />
              {getTotalNotifications() > 0 && (
                <span className="notification-count">{getTotalNotifications()}</span>
              )}
            </button>

            {isNotificationMenuOpen && (
              <div className="notification-dropdown">
                <div className="dropdown-header">
                  <h3>Notifications</h3>
                  <button className="mark-all-read">Mark all read</button>
                </div>
                <div className="notification-list">
                  <div className="notification-item">
                    <div className="notification-icon">
                      <FileText size={16} />
                    </div>
                    <div className="notification-content">
                      <p className="notification-title">New application response</p>
                      <p className="notification-time">2 minutes ago</p>
                    </div>
                  </div>
                  <div className="notification-item">
                    <div className="notification-icon">
                      <Calendar size={16} />
                    </div>
                    <div className="notification-content">
                      <p className="notification-title">Interview scheduled</p>
                      <p className="notification-time">1 hour ago</p>
                    </div>
                  </div>
                </div>
                <div className="dropdown-footer">
                  <button className="view-all-btn">View all notifications</button>
                </div>
              </div>
            )}
          </div>

          {/* Settings */}
          <button className="icon-btn settings-btn" aria-label="Settings">
            <Settings size={18} />
          </button>

          {/* Theme Switcher */}
          <div className="theme-switcher-wrapper">
            <ThemeSwitcher />
          </div>

          {/* User Profile */}
          <div ref={profileRef} className="profile-wrapper">
            <button
              className="profile-btn"
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              aria-label="User menu"
            >
              <div className="profile-avatar">
                {userAvatar ? (
                  <img src={userAvatar} alt={userName} className="avatar-img" />
                ) : (
                  <span className="avatar-text">{userName.charAt(0)}</span>
                )}
              </div>
              <div className="profile-info">
                <span className="profile-name">{userName}</span>
                <div className="profile-status">
                  <span className="status-dot"></span>
                  <span className="status-text">Online</span>
                </div>
              </div>
              <ChevronDown size={16} className="profile-chevron" />
            </button>

            {isProfileMenuOpen && (
              <div className="profile-dropdown">
                <div className="dropdown-header">
                  <div className="profile-details">
                    <div className="profile-avatar-large">
                      {userAvatar ? (
                        <img src={userAvatar} alt={userName} />
                      ) : (
                        <span>{userName.charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <h3>{userName}</h3>
                      <p>Premium Member</p>
                    </div>
                  </div>
                </div>
                <div className="dropdown-menu">
                  <button className="menu-item">
                    <User size={16} />
                    <span>Profile Settings</span>
                  </button>
                  <button className="menu-item">
                    <Settings size={16} />
                    <span>Preferences</span>
                  </button>
                  <button className="menu-item">
                    <Zap size={16} />
                    <span>Upgrade Plan</span>
                  </button>
                  <div className="menu-divider"></div>
                  <button className="menu-item sign-out">
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-nav-overlay">
          <div className="mobile-nav-content">
            <div className="mobile-nav-header">
              <h2>Navigation</h2>
              <button onClick={onMobileMenuToggle}>
                <X size={24} />
              </button>
            </div>
            <div className="mobile-nav-items">
              {items.map((item) => (
                <button
                  key={item.key}
                  className={`mobile-nav-item ${currentSection === item.key ? 'active' : ''}`}
                  onClick={() => {
                    setCurrentSection(item.key);
                    onMobileMenuToggle?.();
                  }}
                >
                  <span className="mobile-nav-icon">{item.icon}</span>
                  <span className="mobile-nav-label">{item.label}</span>
                  {item.badge && 'count' in item.badge && item.badge.count > 0 && (
                    <span className="mobile-nav-badge">{item.badge.count}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .modern-navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 70px;
          background: rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(var(--blur-amount, 20px));
          -webkit-backdrop-filter: blur(var(--blur-amount, 20px));
          border-bottom: 1px solid var(--border-thin);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          z-index: var(--z-navbar, 100);
          transition: all 0.3s var(--easing-standard);
        }

        .navbar-left {
          display: flex;
          align-items: center;
          gap: 20px;
          flex-shrink: 0;
        }

        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 8px;
          border-radius: var(--border-radius-sm);
          transition: all 0.2s var(--easing-standard);
        }

        .mobile-menu-btn:hover {
          background: var(--hover-bg);
          color: var(--text-primary);
        }

        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 700;
          font-size: 20px;
          color: var(--text-primary);
        }

        .brand-icon {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          border-radius: var(--border-radius);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: var(--shadow-sm);
        }

        .brand-text {
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .current-section {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          background: var(--glass-bg);
          border: 1px solid var(--border-thin);
          border-radius: var(--border-radius);
          color: var(--text-secondary);
          font-size: 14px;
        }

        .section-icon {
          display: flex;
          align-items: center;
          color: var(--accent-primary);
        }

        .navbar-center {
          display: flex;
          align-items: center;
          gap: 20px;
          flex: 1;
          justify-content: center;
          max-width: 800px;
        }

        .navbar-search {
          position: relative;
          width: 400px;
          max-width: 100%;
          transition: all 0.3s var(--easing-standard);
        }

        .navbar-search.focused {
          width: 450px;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-tertiary);
          transition: color 0.3s var(--easing-standard);
        }

        .navbar-search.focused .search-icon {
          color: var(--accent-primary);
        }

        .search-input {
          width: 100%;
          height: 42px;
          padding: 0 40px 0 40px;
          border: 1px solid var(--border-thin);
          border-radius: var(--border-radius-lg);
          background: var(--glass-bg);
          color: var(--text-primary);
          font-size: 14px;
          transition: all 0.3s var(--easing-standard);
        }

        .search-input::placeholder {
          color: var(--text-tertiary);
        }

        .search-input:focus {
          outline: none;
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 3px rgba(var(--accent-primary-rgb), 0.1);
        }

        .clear-search {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--text-tertiary);
          cursor: pointer;
          padding: 2px;
          border-radius: 50%;
          transition: all 0.2s var(--easing-standard);
        }

        .clear-search:hover {
          background: var(--hover-bg);
          color: var(--text-secondary);
        }

        .nav-pills {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px;
          background: var(--glass-bg);
          border: 1px solid var(--border-thin);
          border-radius: var(--border-radius-lg);
        }

        .nav-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background: none;
          border: none;
          border-radius: var(--border-radius);
          color: var(--text-secondary);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s var(--easing-standard);
          position: relative;
        }

        .nav-pill:hover {
          background: var(--hover-bg);
          color: var(--text-primary);
        }

        .nav-pill.active {
          background: var(--accent-primary);
          color: white;
          box-shadow: var(--shadow-sm);
        }

        .pill-icon {
          display: flex;
          align-items: center;
        }

        .pill-badge {
          position: absolute;
          top: -2px;
          right: -2px;
          min-width: 16px;
          height: 16px;
          background: var(--accent-red);
          color: white;
          border-radius: 8px;
          font-size: 10px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
        }

        .navbar-right {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: var(--accent-primary);
          color: white;
          border: none;
          border-radius: var(--border-radius);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s var(--easing-standard);
          box-shadow: var(--shadow-sm);
        }

        .action-btn:hover {
          background: var(--accent-primary-hover);
          transform: translateY(-1px);
          box-shadow: var(--shadow-md);
        }

        .icon-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: var(--glass-bg);
          border: 1px solid var(--border-thin);
          border-radius: var(--border-radius);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s var(--easing-standard);
          position: relative;
        }

        .icon-btn:hover {
          background: var(--hover-bg);
          color: var(--text-primary);
          border-color: var(--border-hover);
        }

        .notification-wrapper,
        .profile-wrapper {
          position: relative;
        }

        .notification-count {
          position: absolute;
          top: -2px;
          right: -2px;
          min-width: 18px;
          height: 18px;
          background: var(--accent-red);
          color: white;
          border-radius: 9px;
          font-size: 11px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
        }

        .profile-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 6px 12px;
          background: var(--glass-bg);
          border: 1px solid var(--border-thin);
          border-radius: var(--border-radius-lg);
          cursor: pointer;
          transition: all 0.2s var(--easing-standard);
        }

        .profile-btn:hover {
          background: var(--hover-bg);
          border-color: var(--border-hover);
        }

        .profile-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--accent-primary);
          color: white;
          font-weight: 600;
          font-size: 14px;
        }

        .avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .profile-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 2px;
        }

        .profile-name {
          font-weight: 500;
          font-size: 14px;
          color: var(--text-primary);
        }

        .profile-status {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: var(--text-tertiary);
        }

        .status-dot {
          width: 6px;
          height: 6px;
          background: var(--accent-green);
          border-radius: 50%;
        }

        .profile-chevron {
          color: var(--text-tertiary);
          transition: transform 0.2s var(--easing-standard);
        }

        .profile-btn:hover .profile-chevron {
          transform: rotate(180deg);
        }

        .notification-dropdown,
        .profile-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          min-width: 300px;
          background: var(--glass-card-bg);
          border: 1px solid var(--border-thin);
          border-radius: var(--border-radius-lg);
          box-shadow: var(--shadow-lg);
          backdrop-filter: blur(var(--blur-amount));
          -webkit-backdrop-filter: blur(var(--blur-amount));
          z-index: 1000;
          animation: slideDown 0.2s var(--easing-standard);
        }

        .dropdown-header {
          padding: 16px;
          border-bottom: 1px solid var(--border-divider);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .dropdown-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .mark-all-read {
          background: none;
          border: none;
          color: var(--accent-primary);
          font-size: 13px;
          cursor: pointer;
        }

        .notification-list {
          max-height: 300px;
          overflow-y: auto;
        }

        .notification-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-divider);
          transition: background 0.2s var(--easing-standard);
        }

        .notification-item:hover {
          background: var(--hover-bg);
        }

        .notification-icon {
          width: 32px;
          height: 32px;
          background: var(--glass-bg);
          border-radius: var(--border-radius);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-primary);
          flex-shrink: 0;
        }

        .notification-content {
          flex: 1;
        }

        .notification-title {
          margin: 0 0 4px 0;
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .notification-time {
          margin: 0;
          font-size: 12px;
          color: var(--text-tertiary);
        }

        .dropdown-footer {
          padding: 12px 16px;
          border-top: 1px solid var(--border-divider);
        }

        .view-all-btn {
          width: 100%;
          padding: 8px;
          background: none;
          border: 1px solid var(--border-thin);
          border-radius: var(--border-radius);
          color: var(--text-secondary);
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s var(--easing-standard);
        }

        .view-all-btn:hover {
          background: var(--hover-bg);
          color: var(--text-primary);
        }

        .profile-details {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .profile-avatar-large {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--accent-primary);
          color: white;
          font-weight: 600;
          font-size: 18px;
        }

        .profile-avatar-large img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .dropdown-menu {
          padding: 8px;
        }

        .menu-item {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 10px 12px;
          background: none;
          border: none;
          border-radius: var(--border-radius);
          color: var(--text-secondary);
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s var(--easing-standard);
          text-align: left;
        }

        .menu-item:hover {
          background: var(--hover-bg);
          color: var(--text-primary);
        }

        .menu-item.sign-out {
          color: var(--accent-red);
        }

        .menu-divider {
          height: 1px;
          background: var(--border-divider);
          margin: 8px 0;
        }

        .mobile-nav-overlay {
          position: fixed;
          top: 70px;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(10px);
          z-index: 999;
          display: none;
        }

        .mobile-nav-content {
          background: var(--glass-card-bg);
          margin: 20px;
          border-radius: var(--border-radius-lg);
          border: 1px solid var(--border-thin);
          overflow: hidden;
        }

        .mobile-nav-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px;
          border-bottom: 1px solid var(--border-divider);
        }

        .mobile-nav-header h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .mobile-nav-header button {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
        }

        .mobile-nav-items {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .mobile-nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: none;
          border: none;
          border-radius: var(--border-radius);
          color: var(--text-secondary);
          font-size: 16px;
          cursor: pointer;
          transition: all 0.2s var(--easing-standard);
          text-align: left;
          position: relative;
        }

        .mobile-nav-item:hover {
          background: var(--hover-bg);
          color: var(--text-primary);
        }

        .mobile-nav-item.active {
          background: var(--accent-primary);
          color: white;
        }

        .mobile-nav-icon {
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }

        .mobile-nav-label {
          flex: 1;
        }

        .mobile-nav-badge {
          min-width: 20px;
          height: 20px;
          background: var(--accent-red);
          color: white;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 6px;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .navbar-center {
            gap: 16px;
          }

          .nav-pills {
            display: none;
          }

          .navbar-search {
            width: 300px;
          }

          .navbar-search.focused {
            width: 350px;
          }

          .profile-info {
            display: none;
          }
        }

        @media (max-width: 768px) {
          .modern-navbar {
            padding: 0 16px;
          }

          .mobile-menu-btn {
            display: flex;
          }

          .current-section {
            display: none;
          }

          .navbar-search {
            width: 250px;
          }

          .navbar-search.focused {
            width: 280px;
          }

          .action-btn span {
            display: none;
          }

          .mobile-nav-overlay {
            display: block;
          }
        }

        @media (max-width: 480px) {
          .navbar-search {
            width: 200px;
          }

          .theme-switcher-wrapper {
            display: none;
          }

          .settings-btn {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
