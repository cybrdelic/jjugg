import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

interface AppShellProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Applications', href: '/applications' },
  { name: 'Calendar', href: '/calendar' },
  { name: 'Goals', href: '/goals' },
  { name: 'Interviews', href: '/interviews' },
  { name: 'Timeline', href: '/timeline' },
  { name: 'Analytics', href: '/analytics' },
  { name: 'Profile', href: '/profile' }
];

export function AppShell({ children }: AppShellProps) {
  const router = useRouter();

  return (
    <div className="app-shell">
      <a href="#main" className="skip-link">
        Skip to main content
      </a>

      <header className="app-header">
        <div className="container bar">
          <div className="app-title">
            <span className="brand">JJUGG</span>
            <span className="sep">/</span>
            <span>Job Application Tracker</span>
          </div>

          <nav className="app-nav" aria-label="Primary navigation">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                aria-current={router.pathname === item.href ? 'page' : undefined}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main id="main" className="app-main">
        <div className="container" style={{ gridColumn: '1 / -1' }}>
          {children}
        </div>
      </main>
    </div>
  );
}

export default AppShell;
