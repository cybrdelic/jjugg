// pages/_app.tsx
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ThemeProvider } from '@/contexts/ThemeContext';
import { useEffect } from 'react';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Add the reveal-loaded class to the document body to enable animations
    document.body.classList.add('reveal-loaded');
    
    return () => {
      document.body.classList.remove('reveal-loaded');
    };
  }, []);

  return (
    <ThemeProvider>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
