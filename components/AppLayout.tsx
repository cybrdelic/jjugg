import { useState, useEffect, ReactNode } from 'react';
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

  // Use shared app data from context
  const {
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

      <style jsx>{`
        .app-container {
          position: relative;
          height: 100vh; /* use height so padding doesn't extend page */
          background: var(--actual-background, var(--background));
          color: var(--text-primary);
          padding-top: var(--navbar-height, 68px);
          overflow-x: hidden;
          box-sizing: border-box; /* include padding within viewport height */
          transition: background 0.3s ease;
        }

        .glass-main {
          position: relative;
          height: calc(100vh - var(--navbar-height, 68px));
          z-index: var(--z-content);
          overflow: hidden; /* prevent outer scroll; inner regions manage their own */
        }

        .main-content {
          padding: 24px 24px 0; /* remove bottom padding to avoid extra page scroll */
          max-width: 2000px;
          margin: 0 auto;
          height: 100%; /* fill .glass-main */
          box-sizing: border-box; /* include padding in height to avoid overflow */
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

        /* Responsive Design */
        @media (max-width: 768px) {
          .main-content {
            padding: 16px 16px 0; /* remove bottom padding on mobile as well */
          }
        }
      `}</style>
    </div>
  );
}
