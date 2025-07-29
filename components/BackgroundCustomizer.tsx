// components/BackgroundCustomizer.tsx
import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

/**
 * Simplified Background Customizer Component
 *
 * Temporarily simplified for the new 4-theme system.
 * Complex background customization will be re-added in future updates.
 */
export default function BackgroundCustomizer() {
  const { currentTheme } = useTheme();

  return (
    <div className="space-y-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Background
      </h3>
      <div className="text-sm text-gray-600 dark:text-gray-400">
        <p>Background customization is being updated for the new simplified theme system.</p>
        <p className="mt-2">Current theme: <span className="font-medium text-gray-900 dark:text-gray-100">{currentTheme.label}</span></p>
        <p>Mode: <span className="font-medium text-gray-900 dark:text-gray-100">{currentTheme.mode}</span></p>
      </div>
    </div>
  );
}
