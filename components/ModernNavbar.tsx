'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { SectionKey, NavItemType } from '@/types';
import {
  Menu, X, Search, Bell, Plus, Command, User, LogOut, Settings
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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.querySelector('input')?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

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
            <div
              ref={searchRef}
              className={`search-container ${isSearchFocused ? 'focused' : ''}`}
            >
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="search-input"
              />
              <div className="search-shortcut">
                <Command size={10} />
                <span>K</span>
              </div>
            </div>

            {/* Quick Add */}
            <button className="quick-add-btn">
              <Plus size={16} />
              <span>New</span>
            </button>

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
        /* Base Navbar Styles */
        .modern-navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 68px;
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
          z-index: 1000;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        :global(.dark) .modern-navbar {
          background: rgba(17, 24, 39, 0.98);
          border-bottom-color: rgba(255, 255, 255, 0.08);
        }

        .navbar-container {
          height: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 32px;
        }

        /* Left Section */
        .navbar-left {
          display: flex;
          align-items: center;
          gap: 40px;
          flex: 0 1 auto;
        }

        .mobile-menu-btn {
          display: none;
          padding: 8px;
          background: none;
          border: none;
          color: #666;
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        :global(.dark) .mobile-menu-btn {
          color: #999;
        }

        .mobile-menu-btn:hover {
          background: rgba(0, 0, 0, 0.05);
        }

        :global(.dark) .mobile-menu-btn:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        /* Logo */
        .navbar-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 700;
          font-size: 20px;
          color: #000;
        }

        :global(.dark) .navbar-logo {
          color: #fff;
        }

        .logo-icon {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 18px;
          font-weight: 700;
        }

        .logo-text {
          font-size: 18px;
          letter-spacing: -0.5px;
        }

        /* Desktop Navigation */
        .desktop-nav {
          display: flex;
          align-items: center;
          gap: 2px;
          background: #f1f5f9;
          border-radius: 12px;
          padding: 4px;
        }

        :global(.dark) .desktop-nav {
          background: #374151;
        }

        .nav-item {
          position: relative;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: none;
          border: none;
          border-radius: 8px;
          color: #64748b;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          white-space: nowrap;
        }

        :global(.dark) .nav-item {
          color: #9ca3af;
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.8);
          color: #1e293b;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        :global(.dark) .nav-item:hover {
          background: rgba(55, 65, 81, 0.8);
          color: #f3f4f6;
        }

        .nav-item.active {
          background: #ffffff;
          color: #667eea;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        :global(.dark) .nav-item.active {
          background: #4b5563;
          color: #818cf8;
          box-shadow: 0 2px 8px rgba(129, 140, 248, 0.2), 0 1px 3px rgba(0, 0, 0, 0.3);
        }

        .nav-icon {
          display: flex;
          align-items: center;
          font-size: 16px;
          transition: transform 0.2s ease;
        }

        .nav-item.active .nav-icon {
          transform: scale(1.1);
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
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          border-radius: 9px;
          font-size: 10px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 5px;
          box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
        }

        /* Right Section */
        .navbar-right {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 0 0 auto;
        }

        /* Search */
        .search-container {
          position: relative;
          width: 280px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .search-container.focused {
          width: 350px;
        }

        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          pointer-events: none;
          transition: color 0.2s ease;
        }

        .search-container.focused .search-icon {
          color: #667eea;
        }

        .search-input {
          width: 100%;
          height: 40px;
          padding: 0 60px 0 42px;
          border: none;
          border-radius: 20px;
          background: #f8fafc;
          color: #1f2937;
          font-size: 14px;
          font-weight: 400;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        :global(.dark) .search-input {
          background: #374151;
          color: #f9fafb;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        }

        .search-input::placeholder {
          color: #9ca3af;
          font-weight: 400;
        }

        :global(.dark) .search-input::placeholder {
          color: #6b7280;
        }

        .search-input:focus {
          outline: none;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1), 0 4px 12px rgba(0, 0, 0, 0.15);
          transform: translateY(-1px);
        }

        :global(.dark) .search-input:focus {
          background: #4b5563;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2), 0 4px 12px rgba(0, 0, 0, 0.4);
        }

        .search-shortcut {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          align-items: center;
          gap: 3px;
          padding: 3px 6px;
          background: #e5e7eb;
          border-radius: 6px;
          color: #6b7280;
          font-size: 10px;
          font-weight: 600;
          pointer-events: none;
          transition: all 0.2s ease;
          opacity: 0.8;
        }

        :global(.dark) .search-shortcut {
          background: #4b5563;
          color: #9ca3af;
        }

        .search-container.focused .search-shortcut {
          opacity: 1;
          background: #667eea;
          color: white;
        }

        /* Quick Add Button */
        .quick-add-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.25);
        }

        .quick-add-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.35);
          background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
        }

        .quick-add-btn:active {
          transform: translateY(0);
        }

        .quick-add-btn span {
          white-space: nowrap;
          font-weight: 600;
        }

        /* Icon Buttons */
        .icon-btn {
          position: relative;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        :global(.dark) .icon-btn {
          background: #374151;
          border-color: #4b5563;
          color: #9ca3af;
        }

        .icon-btn:hover {
          background: #ffffff;
          border-color: #cbd5e1;
          color: #1e293b;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        :global(.dark) .icon-btn:hover {
          background: #4b5563;
          border-color: #6b7280;
          color: #f3f4f6;
        }

        .badge {
          position: absolute;
          top: -6px;
          right: -6px;
          min-width: 20px;
          height: 20px;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 6px;
          box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
          border: 2px solid white;
        }

        :global(.dark) .badge {
          border-color: #111827;
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
          background: white;
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          z-index: 1001;
          animation: dropdownIn 0.2s ease;
        }

        :global(.dark) .dropdown {
          background: #1a1a1a;
          border-color: rgba(255, 255, 255, 0.1);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
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
          padding: 16px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        :global(.dark) .dropdown-header {
          border-bottom-color: rgba(255, 255, 255, 0.08);
        }

        .dropdown-header h3 {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: #000;
        }

        :global(.dark) .dropdown-header h3 {
          color: #fff;
        }

        .text-btn {
          background: none;
          border: none;
          color: #667eea;
          font-size: 12px;
          font-weight: 500;
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
          padding: 16px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
          cursor: pointer;
          transition: background 0.2s ease;
        }

        :global(.dark) .notification-item {
          border-bottom-color: rgba(255, 255, 255, 0.08);
        }

        .notification-item:hover {
          background: rgba(0, 0, 0, 0.02);
        }

        :global(.dark) .notification-item:hover {
          background: rgba(255, 255, 255, 0.02);
        }

        .notification-item.unread {
          background: rgba(102, 126, 234, 0.05);
        }

        :global(.dark) .notification-item.unread {
          background: rgba(102, 126, 234, 0.1);
        }

        .notification-content {
          padding-right: 20px;
        }

        .notification-title {
          margin: 0 0 4px 0;
          font-size: 14px;
          font-weight: 500;
          color: #000;
        }

        :global(.dark) .notification-title {
          color: #fff;
        }

        .notification-time {
          font-size: 12px;
          color: #666;
        }

        :global(.dark) .notification-time {
          color: #999;
        }

        .unread-dot {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          width: 8px;
          height: 8px;
          background: #667eea;
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
          background: #667eea;
          color: white;
          font-size: 14px;
          font-weight: 600;
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
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
        }

        :global(.dark) .profile-info {
          border-bottom-color: rgba(255, 255, 255, 0.08);
        }

        .user-name {
          margin: 0 0 2px 0;
          font-size: 14px;
          font-weight: 600;
          color: #000;
        }

        :global(.dark) .user-name {
          color: #fff;
        }

        .user-email {
          margin: 0;
          font-size: 12px;
          color: #666;
        }

        :global(.dark) .user-email {
          color: #999;
        }

        .dropdown-divider {
          height: 1px;
          background: rgba(0, 0, 0, 0.08);
          margin: 8px 0;
        }

        :global(.dark) .dropdown-divider {
          background: rgba(255, 255, 255, 0.08);
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 10px 16px;
          background: none;
          border: none;
          color: #333;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.2s ease;
          text-align: left;
        }

        :global(.dark) .dropdown-item {
          color: #ccc;
        }

        .dropdown-item:hover {
          background: rgba(0, 0, 0, 0.05);
        }

        :global(.dark) .dropdown-item:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .dropdown-item.danger {
          color: #ef4444;
        }

        /* Mobile Navigation */
        .mobile-nav {
          position: fixed;
          top: 68px;
          left: 0;
          right: 0;
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
          padding: 12px 16px;
          display: none;
          z-index: 999;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        :global(.dark) .mobile-nav {
          background: rgba(17, 24, 39, 0.98);
          border-bottom-color: rgba(255, 255, 255, 0.08);
        }

        .mobile-nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 14px 16px;
          background: none;
          border: none;
          border-radius: 12px;
          color: #64748b;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          text-align: left;
          margin-bottom: 4px;
        }

        :global(.dark) .mobile-nav-item {
          color: #9ca3af;
        }

        .mobile-nav-item:hover {
          background: #f1f5f9;
          color: #1e293b;
        }

        :global(.dark) .mobile-nav-item:hover {
          background: #374151;
          color: #f3f4f6;
        }

        .mobile-nav-item.active {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
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

          .search-container {
            width: 200px;
          }

          .search-container.focused {
            width: 280px;
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

          .search-container {
            display: none;
          }

          .quick-add-btn span {
            display: none;
          }

          .quick-add-btn {
            width: 36px;
            height: 36px;
            padding: 0;
            justify-content: center;
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
