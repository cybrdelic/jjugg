import React, { useState, useEffect, useRef } from 'react';
import { SectionKey, NavItemType } from '@/types';
import {
  Menu, X, Bell, Plus, User, LogOut, Settings, Server as ServerIcon, Mail
} from 'lucide-react';
import { useRouter } from 'next/router';
import { ThemeSwitcher } from './ThemeSwitcher';

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

  // Theme switching is now handled globally by ThemeSwitcher

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
      <nav className="pure-nav">
        <div className="nav-container">
          {/* Logo */}
          <a href="#" className="logo" onClick={(e) => e.preventDefault()}>
            jjugg
          </a>

          {/* Center Navigation */}
          <div className="nav-center">
            {items.map((item) => {
              const isActive = currentSection === item.key;
              return (
                <button
                  key={item.key}
                  className={`nav-link ${isActive ? 'active' : ''}`}
                  onClick={() => setCurrentSection(item.key)}
                  data-text={item.label}
                >
                  {item.label}
                  {item.badge && 'count' in item.badge && item.badge.count > 0 && (
                    <span className="nav-badge">{item.badge.count}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Actions */}
          <div className="nav-right">
            {/* Notifications */}
            <div ref={notificationRef} style={{ position: 'relative' }}>
              <button
                className="nav-icon-btn notification-btn"
                onClick={() => setIsNotificationMenuOpen(!isNotificationMenuOpen)}
                aria-label="Notifications"
              >
                <Bell size={18} strokeWidth={1.5} />
                {getTotalNotifications() > 0 && (
                  <span className="notification-dot"></span>
                )}
              </button>

              {isNotificationMenuOpen && (
                <div className="dropdown show">
                  <div className="dropdown-label">Notifications</div>
                  {notifications.map((notif) => (
                    <button
                      key={notif.id}
                      className="dropdown-item"
                      onClick={() => setIsNotificationMenuOpen(false)}
                    >
                      {notif.title}
                    </button>
                  ))}
                  <div className="dropdown-separator"></div>
                  <button className="dropdown-item" onClick={() => setIsNotificationMenuOpen(false)}>
                    Clear all
                  </button>
                </div>
              )}
            </div>

            {/* Add Button */}
            <button className="nav-icon-btn">
              <Plus size={18} strokeWidth={1.5} />
            </button>

            {/* Theme Toggle (global) */}
            <ThemeSwitcher />

            {/* Profile */}
            <div ref={profileRef} style={{ position: 'relative' }}>
              <button
                className="user-btn"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                aria-label="Profile menu"
              >
                {userAvatar ? (
                  <img src={userAvatar} alt={userName} />
                ) : (
                  <span>{userName.charAt(0).toUpperCase()}</span>
                )}
              </button>

              {isProfileMenuOpen && (
                <div className="dropdown show">
                  <div className="dropdown-label">Account</div>
                  <button className="dropdown-item" onClick={() => { push('/profile'); setIsProfileMenuOpen(false); }}>
                    Profile
                  </button>
                  <button className="dropdown-item" onClick={() => { push('/profile'); setIsProfileMenuOpen(false); }}>
                    Settings
                  </button>
                  <button className="dropdown-item" onClick={() => { push('/email-setup'); setIsProfileMenuOpen(false); }}>
                    Email Setup
                  </button>
                  <button className="dropdown-item" onClick={() => { push('/daemon'); setIsProfileMenuOpen(false); }}>
                    Daemon
                  </button>
                  <div className="dropdown-separator"></div>
                  <button className="dropdown-item" onClick={() => console.log('Sign out')}>
                    Sign out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className={`mobile-toggle ${isMobileMenuOpen ? 'active' : ''}`}
              onClick={onMobileMenuToggle}
            >
              <span className="line"></span>
              <span className="line"></span>
              <span className="line"></span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'show' : ''}`}>
        <div className="mobile-menu-items">
          {items.map((item) => {
            const isActive = currentSection === item.key;
            return (
              <button
                key={item.key}
                className={`mobile-menu-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  setCurrentSection(item.key);
                  onMobileMenuToggle?.();
                }}
              >
                {item.label}
                {item.badge && 'count' in item.badge && item.badge.count > 0 && (
                  <span style={{ marginLeft: '8px', color: 'var(--red)' }}>
                    ({item.badge.count})
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <style jsx global>{`
        :root {
          --white: #ffffff;
          --black: #000000;
          --gray: #71717a;
          --light-gray: #f4f4f5;
          --border: #e4e4e7;
          --red: #ef4444;
          --accent: #0066ff;

          --nav-height: 56px;
          --max-width: 1200px;

          --transition: 150ms ease;
          --elastic: cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        .dark {
          --white: #000000;
          --black: #ffffff;
          --gray: #a1a1aa;
          --light-gray: #18181b;
          --border: #27272a;
          --accent: #3b82f6;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Inter', system-ui, sans-serif;
          font-size: 14px;
          color: var(--black);
          background: var(--white);
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
        }

        .pure-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: var(--nav-height);
          background: rgba(255, 255, 255, 0.7);
          -webkit-backdrop-filter: blur(8px);
          backdrop-filter: blur(8px);
          border-bottom: 0.5px solid var(--border);
          z-index: 1000;
        }

        .dark .pure-nav {
          background: rgba(0, 0, 0, 0.7);
        }

        .nav-container {
          max-width: var(--max-width);
          height: 100%;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        /* Logo */
        .logo {
          font-size: 16px;
          font-weight: 600;
          letter-spacing: -0.5px;
          text-decoration: none;
          color: var(--black);
          position: relative;
          display: inline-block;
          transition: all var(--transition);
        }

        .logo::before {
          content: 'jjugg';
          position: absolute;
          top: 0;
          left: 0;
          width: 0;
          color: var(--accent);
          overflow: hidden;
          transition: width 300ms ease;
        }

        .logo:hover::before {
          width: 100%;
        }

        /* Center Navigation */
        .nav-center {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 32px;
        }

        .nav-link {
          position: relative;
          font-size: 14px;
          font-weight: 450;
          color: var(--gray);
          text-decoration: none;
          transition: all var(--transition);
          padding: 4px 0;
          cursor: pointer;
          background: none;
          border: none;
          font-family: inherit;
        }

        .nav-link::before {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          padding: 4px 0;
          width: 0;
          overflow: hidden;
          color: var(--black);
          font-weight: 500;
          transition: width 200ms ease;
          white-space: nowrap;
        }

        .nav-link:hover::before {
          width: 100%;
        }

        .nav-link.active {
          color: var(--black);
          font-weight: 500;
        }

        .nav-link.active::after {
          content: '';
          position: absolute;
          bottom: -18px;
          left: 50%;
          transform: translateX(-50%);
          width: 24px;
          height: 2px;
          background: var(--black);
          border-radius: 2px;
          animation: liquidLine 2s ease-in-out infinite;
        }

        @keyframes liquidLine {
          0%, 100% {
            width: 24px;
            opacity: 1;
          }
          50% {
            width: 40px;
            opacity: 0.8;
          }
        }

        .nav-badge {
          display: inline-block;
          min-width: 16px;
          height: 16px;
          padding: 0 4px;
          margin-left: 6px;
          background: var(--red);
          color: #ffffff;
          border-radius: 8px;
          font-size: 10px;
          font-weight: 600;
          line-height: 16px;
          text-align: center;
          animation: badgeFloat 3s ease-in-out infinite;
        }

        @keyframes badgeFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }

        /* Right Actions */
        .nav-right {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        /* Icon Buttons */
        .nav-icon-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          border-radius: 6px;
          color: var(--gray);
          cursor: pointer;
          transition: all var(--transition);
          position: relative;
          overflow: hidden;
        }

        .nav-icon-btn::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: var(--light-gray);
          transform: translate(-50%, -50%);
          transition: width 400ms ease, height 400ms ease;
        }

        .nav-icon-btn:hover::before {
          width: 100%;
          height: 100%;
          border-radius: 6px;
        }

        .nav-icon-btn:hover {
          color: var(--black);
        }

        .nav-icon-btn svg {
          position: relative;
          z-index: 1;
          transition: transform 200ms var(--elastic);
        }

        .nav-icon-btn:hover svg {
          transform: scale(1.1);
        }

        /* Notification Dot */
        .notification-dot {
          position: absolute;
          top: 6px;
          right: 6px;
          width: 5px;
          height: 5px;
          background: var(--red);
          border-radius: 50%;
        }

        .notification-dot::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 5px;
          height: 5px;
          background: var(--red);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          animation: ping 1.5s ease-in-out infinite;
        }

        @keyframes ping {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(2.5);
          }
        }

        /* Theme Toggle */
        .theme-toggle {
          width: 52px;
          height: 26px;
          background: var(--light-gray);
          border: 0.5px solid var(--border);
          border-radius: 13px;
          position: relative;
          cursor: pointer;
          transition: all var(--transition);
          overflow: hidden;
        }

        .theme-toggle:hover {
          background: var(--border);
        }

        .theme-toggle-slider {
          position: absolute;
          top: 3px;
          left: 3px;
          width: 20px;
          height: 20px;
          background: var(--white);
          border-radius: 50%;
          transition: transform 300ms var(--elastic);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--gray);
        }

        .theme-toggle.dark .theme-toggle-slider {
          transform: translateX(26px);
          background: var(--black);
          color: var(--light-gray);
        }

        /* User Avatar */
        .user-btn {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--black);
          color: var(--white);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition);
          position: relative;
          overflow: visible;
        }

        .user-btn::before {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 1px solid var(--black);
          opacity: 0;
          transform: scale(1);
          transition: all 300ms ease;
        }

        .user-btn:hover::before {
          opacity: 0.3;
          transform: scale(1.5);
        }

        .user-btn:hover {
          transform: scale(0.95);
        }

        .user-btn img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
        }

        /* Dropdown */
        .dropdown {
          position: absolute;
          top: calc(100% + 12px);
          right: 0;
          width: 200px;
          background: var(--white);
          border: 0.5px solid var(--border);
          border-radius: 8px;
          box-shadow:
            0 2px 8px rgba(0, 0, 0, 0.04),
            0 0 0 0.5px rgba(0, 0, 0, 0.02);
          padding: 4px;
          opacity: 0;
          visibility: hidden;
          transform: translateY(-4px) scale(0.98);
          transform-origin: top right;
          transition: all var(--transition);
          z-index: 1001;
        }

        .dark .dropdown {
          background: #0a0a0a;
          box-shadow:
            0 2px 8px rgba(0, 0, 0, 0.2),
            0 0 0 0.5px rgba(255, 255, 255, 0.05);
        }

        .dropdown.show {
          opacity: 1;
          visibility: visible;
          transform: translateY(0) scale(1);
        }

        .dropdown-item {
          display: block;
          width: 100%;
          padding: 8px 12px;
          background: none;
          border: none;
          border-radius: 4px;
          font-size: 13px;
          color: var(--black);
          text-align: left;
          cursor: pointer;
          transition: all var(--transition);
          position: relative;
          overflow: hidden;
          font-family: inherit;
        }

        .dropdown-item::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          width: 2px;
          background: var(--accent);
          transform: translateX(-2px);
          transition: transform 200ms ease;
        }

        .dropdown-item:hover {
          background: var(--light-gray);
          padding-left: 16px;
        }

        .dropdown-item:hover::before {
          transform: translateX(0);
        }

        .dropdown-separator {
          height: 0.5px;
          background: var(--border);
          margin: 4px 8px;
        }

        .dropdown-label {
          padding: 8px 12px 4px;
          font-size: 11px;
          font-weight: 600;
          color: var(--gray);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* Mobile Toggle */
        .mobile-toggle {
          display: none;
          width: 32px;
          height: 32px;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          color: var(--black);
          position: relative;
        }

        .mobile-toggle .line {
          position: absolute;
          width: 18px;
          height: 1.5px;
          background: currentColor;
          transition: all 200ms ease;
        }

        .mobile-toggle .line:nth-child(1) {
          transform: translateY(-5px);
        }

        .mobile-toggle .line:nth-child(3) {
          transform: translateY(5px);
        }

        .mobile-toggle.active .line:nth-child(1) {
          transform: rotate(45deg);
        }

        .mobile-toggle.active .line:nth-child(2) {
          opacity: 0;
        }

        .mobile-toggle.active .line:nth-child(3) {
          transform: rotate(-45deg);
        }

        /* Mobile Menu */
        .mobile-menu {
          display: none;
          position: fixed;
          top: var(--nav-height);
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.95);
          -webkit-backdrop-filter: blur(10px);
          backdrop-filter: blur(10px);
          padding: 24px;
          opacity: 0;
          visibility: hidden;
          transition: all 200ms ease;
          z-index: 999;
        }

        .dark .mobile-menu {
          background: rgba(0, 0, 0, 0.95);
        }

        .mobile-menu.show {
          opacity: 1;
          visibility: visible;
        }

        .mobile-menu-items {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .mobile-menu-item {
          display: block;
          padding: 12px 0;
          font-size: 16px;
          font-weight: 450;
          color: var(--black);
          text-decoration: none;
          border-bottom: 0.5px solid var(--border);
          position: relative;
          transition: all var(--transition);
          background: none;
          border-top: none;
          border-left: none;
          border-right: none;
          width: 100%;
          text-align: left;
          cursor: pointer;
          font-family: inherit;
        }

        .mobile-menu-item:hover {
          padding-left: 8px;
        }

        .mobile-menu-item.active {
          color: var(--accent);
          font-weight: 500;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .nav-center {
            display: none;
          }

          .mobile-toggle {
            display: flex;
          }

          .mobile-menu {
            display: block;
          }

          .nav-icon-btn:not(.notification-btn) {
            display: none;
          }

          .theme-toggle {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
