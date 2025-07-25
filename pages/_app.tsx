// pages/_app.tsx
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ThemeProvider } from '@/contexts/ThemeContext';
import { FeatureFlagProvider } from '@/contexts/FeatureFlagContext';
import { AppDataProvider } from '@/contexts/AppDataContext';
import getFeatureFlags from '@/config/featureFlags';
import { useEffect } from 'react';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Add the reveal-loaded class to the document body to enable animations
    document.body.classList.add('reveal-loaded');

    return () => {
      document.body.classList.remove('reveal-loaded');
    };
  }, []);

  // Get feature flags based on environment
  const featureFlags = getFeatureFlags();

  return (
    <ThemeProvider>
      <FeatureFlagProvider flags={featureFlags}>
        <AppDataProvider>
          <Component {...pageProps} />
        </AppDataProvider>
      </FeatureFlagProvider>
    </ThemeProvider>
  );
}
