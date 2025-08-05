import { useRouter } from 'next/router';
import { useState, useEffect, ReactNode } from 'react';
import ModernNavbar from '../components/ModernNavbar';
import { useFeatureFlags } from '@/contexts/FeatureFlagContext';
import { useAppData } from '@/contexts/AppDataContext';
import { useNavigation } from '@/hooks/useNavigation';
import type { SectionKey, NavItemType } from '@/types';

interface AppLayoutProps {
  children: ReactNode;
  currentSection: SectionKey;
}

export default function AppLayout({ children, currentSection }: AppLayoutProps) {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Use shared app data from context
  const {
    applications,
    activities,
    upcomingEvents,
    appStats,
    userProfile,
    loading: dbLoading,
    error: dbError
  } = useAppData();

  // Use the new navigation hook that handles all the complexity
  const { navigationItems, handleNavigation } = useNavigation();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className={`app-container reveal-loaded ${isLoaded ? 'loaded' : ''}`}>
      {/* Modern Navbar */}
      <ModernNavbar
        items={navigationItems}
        currentSection={currentSection}
        setCurrentSection={handleNavigation}
        userName={userProfile.name}
        userAvatar={userProfile.avatar}
        onMobileMenuToggle={toggleMobileMenu}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      <main className="glass-main">
        <div className="main-content">
          <div className="reveal-element">
            {/* Show loading state */}
            {dbLoading && (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading data from database...</p>
              </div>
            )}

            {/* Show error state */}
            {dbError && (
              <div className="error-state">
                <h2>Database Error</h2>
                <p>{dbError}</p>
                <p>Please make sure the database is seeded by running: <code>npm run db:reset</code></p>
              </div>
            )}

            {/* Show content when data is loaded */}
            {!dbLoading && !dbError && children}
          </div>
        </div>
      </main>

      {/* Background elements and particles */}
      <div className="particles">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>
      <div className="bg-gradient-1"></div>
      <div className="bg-gradient-2"></div>

      <style jsx>{`
        .app-container {
          position: relative;
          min-height: 100vh;
          background: var(--actual-background, var(--background));
          color: var(--text-primary);
          padding-top: var(--navbar-height, 68px);
          overflow-x: hidden;
          transition: background 0.3s ease;
        }

        .glass-main {
          position: relative;
          min-height: calc(100vh - 68px);
          z-index: var(--z-content);
        }

        .main-content {
          padding: 24px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .loading-state, .error-state {
          text-align: center;
          padding: 2rem;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid var(--border-thin);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Particles and background gradients */
        .particles {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          pointer-events: none;
          z-index: var(--z-background);
        }

        .particle {
          position: absolute;
          border-radius: 50%;
          background: var(--glass-hover-bg);
          animation: float 15s infinite ease-in-out;
        }

        .particle:nth-child(1) { width: 10px; height: 10px; top: 10%; left: 20%; animation-delay: 0s; }
        .particle:nth-child(2) { width: 15px; height: 15px; top: 30%; left: 70%; animation-delay: 2s; }
        .particle:nth-child(3) { width: 8px; height: 8px; top: 50%; left: 40%; animation-delay: 4s; }
        .particle:nth-child(4) { width: 12px; height: 12px; top: 70%; left: 10%; animation-delay: 6s; }
        .particle:nth-child(5) { width: 20px; height: 20px; top: 20%; left: 90%; animation-delay: 8s; }
        .particle:nth-child(6) { width: 14px; height: 14px; top: 80%; left: 60%; animation-delay: 10s; }
        .particle:nth-child(7) { width: 9px; height: 9px; top: 40%; left: 30%; animation-delay: 12s; }
        .particle:nth-child(8) { width: 16px; height: 16px; top: 60%; left: 80%; animation-delay: 14s; }

        .bg-gradient-1, .bg-gradient-2 {
          position: fixed;
          border-radius: 50%;
          filter: blur(40px);
          z-index: var(--z-negative);
          opacity: 0.5;
          pointer-events: none;
        }

        .bg-gradient-1 {
          width: 50vw;
          height: 50vw;
          background: radial-gradient(circle, var(--glass-hover-bg), transparent 70%);
          top: -10vw;
          right: -10vw;
          animation: float 20s infinite alternate ease-in-out;
        }

        .bg-gradient-2 {
          width: 60vw;
          height: 60vw;
          background: radial-gradient(circle, var(--glass-card-bg), transparent 70%);
          bottom: -20vw;
          left: -10vw;
          animation: float-reverse 25s infinite alternate-reverse ease-in-out;
        }

        @keyframes float {
          0% { transform: translate(0, 0); }
          50% { transform: translate(20px, -30px); }
          100% { transform: translate(0, 0); }
        }

        @keyframes float-reverse {
          0% { transform: translate(0, 0); }
          50% { transform: translate(-20px, 30px); }
          100% { transform: translate(0, 0); }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .main-content {
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
}
