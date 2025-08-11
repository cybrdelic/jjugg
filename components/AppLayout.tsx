'use client';

import React, { useState, useEffect, useCallback, ReactNode } from 'react';
import ModernNavbar from '../components/ModernNavbar';
import { useAppData } from '@/contexts/AppDataContext';
import { useNavigation } from '@/hooks/useNavigation';
import type { SectionKey } from '@/types';

interface AppLayoutProps {
  children: ReactNode;
  currentSection: SectionKey;
}

export default function AppLayout({ children, currentSection }: AppLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const {
    userProfile,
    loading: dbLoading,
    error: dbError,
  } = useAppData();

  const { navigationItems, handleNavigation } = useNavigation();

  // Use rAF to schedule the "loaded" class after first paint (avoids timeout + reduces hydration flicker)
  useEffect(() => {
    const raf = requestAnimationFrame(() => setIsLoaded(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((v) => !v);
  }, []);

  // Null-safe user props (prevents crashes while user data is loading)
  const userName = userProfile?.name ?? 'Guest';
  const userAvatar = userProfile?.avatar ?? undefined;

  return (
    <div className={`app-container reveal-loaded ${isLoaded ? 'loaded' : ''}`}>
      <ModernNavbar
        items={navigationItems}
        currentSection={currentSection}
        setCurrentSection={handleNavigation}
        userName={userName}
        userAvatar={userAvatar}
        onMobileMenuToggle={toggleMobileMenu}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      <main
        className="glass-main"
        role="main"
        aria-busy={dbLoading ? 'true' : 'false'}
      >
        <div className="main-content typography-root">
          <div className="reveal-element">
            {dbLoading && (
              <div className="loading-state" aria-live="polite">
                <div className="loading-spinner" aria-hidden="true" />
                <p>Loading data from database…</p>
              </div>
            )}

            {dbError && (
              <div className="error-state" role="alert">
                <h2>Database Error</h2>
                <p>{dbError}</p>
                <p>
                  Ensure the DB is seeded:&nbsp;
                  <code>npm run db:reset</code>
                </p>
              </div>
            )}

            {!dbLoading && !dbError && children}
          </div>
        </div>
      </main>

      <style jsx>{`
        :root {
          /* spacing + rhythm (tokens) */
          --space-0: 0px;
          --space-1: 4px;
          --space-2: 8px;
          --space-3: 12px;
          --space-4: 16px;
          --space-5: 20px;
          --space-6: 24px;
          --space-8: 32px;

          /* navbar fallback */
          --navbar-height: 68px;
        }

        .app-container {
          position: relative;
          min-height: 100dvh; /* dynamic viewport to dodge iOS 100vh bug */
          background: var(--actual-background, var(--background));
          color: var(--text-primary);
          padding-top: max(var(--navbar-height, 68px), env(safe-area-inset-top));
          overflow-x: hidden;
          box-sizing: border-box;
          transition: background 0.3s ease;
          /* subtle enter state; gated by .loaded below */
        }

        .glass-main {
          position: relative;
          min-height: calc(100dvh - var(--navbar-height, 68px));
          z-index: var(--z-content, 0);
          /* main is the scroller; keeps header/UI layers crisp */
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
          scroll-behavior: smooth;
          padding-bottom: env(safe-area-inset-bottom);
        }

        .main-content {
          padding: var(--space-6) var(--space-6) 0;
          max-width: 2000px;
          margin: 0 auto;
          min-height: 100%;
          box-sizing: border-box;
          container-type: inline-size; /* enables container queries if you want later */
          content-visibility: auto; /* skip rendering offscreen content */
          contain-intrinsic-size: 1px 1200px; /* reserve space without jank */
        }

        /* reveal */
        .reveal-loaded .reveal-element {
          opacity: 0;
          transform: translateY(6px);
        }
        .reveal-loaded.loaded .reveal-element {
          opacity: 1;
          transform: none;
          transition: opacity 220ms ease, transform 360ms cubic-bezier(.2,.8,.2,1);
        }
        @media (prefers-reduced-motion: reduce) {
          .reveal-loaded .reveal-element,
          .reveal-loaded.loaded .reveal-element {
            opacity: 1;
            transform: none;
            transition: none;
          }
        }

        .loading-state,
        .error-state {
          text-align: center;
          padding: var(--space-8);
          margin-top: var(--space-8);
          color: var(--text-secondary, #9aa0a6);
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--border-thin, rgba(255, 255, 255, 0.15));
          border-top-color: var(--primary, #7c3aed);
          border-radius: 50%;
          animation: spin 0.9s linear infinite;
          margin: 0 auto var(--space-4);
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .loading-spinner { animation: none; }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .main-content {
            padding: var(--space-4) var(--space-4) 0;
          }
        }
      `}</style>
    </div>
  );
}
