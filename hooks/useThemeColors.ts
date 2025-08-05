import { useTheme } from '../contexts/ThemeContext';
import { ApplicationStage } from '../types';

export const useThemeColors = () => {
    const { mode } = useTheme();

    // Helper function to get CSS custom property value
    const getCSSVariable = (property: string, fallback?: string) => {
        if (typeof window !== 'undefined') {
            return getComputedStyle(document.documentElement)
                .getPropertyValue(property)
                .trim() || fallback || '#000';
        }
        return fallback || '#000';
    };

    const getApplicationStageColor = (stage: ApplicationStage) => {
        const stageColorMap: Record<ApplicationStage, string> = {
            'applied': getCSSVariable('--color-blue', '#3b82f6'),
            'screening': getCSSVariable('--color-yellow', '#f59e0b'),
            'interview': getCSSVariable('--color-orange', '#f97316'),
            'offer': getCSSVariable('--color-green', '#10b981'),
            'rejected': getCSSVariable('--color-red', '#ef4444'),
        };
        return stageColorMap[stage] || stageColorMap['applied'];
    };

    const getApplicationStageBackgroundColor = (stage: ApplicationStage) => {
        const stageBackgroundMap: Record<ApplicationStage, string> = {
            'applied': getCSSVariable('--color-blue-light', '#dbeafe'),
            'screening': getCSSVariable('--color-yellow-light', '#fef3c7'),
            'interview': getCSSVariable('--color-orange-light', '#fed7aa'),
            'offer': getCSSVariable('--color-green-light', '#d1fae5'),
            'rejected': getCSSVariable('--color-red-light', '#fee2e2'),
        };
        return stageBackgroundMap[stage] || stageBackgroundMap['applied'];
    };

    const getChartColors = () => ({
        primary: getCSSVariable('--color-primary', '#0ea5e9'),
        secondary: getCSSVariable('--color-secondary', '#8b5cf6'),
        gradients: {
            primary: `linear-gradient(135deg, ${getCSSVariable('--color-primary', '#0ea5e9')} 0%, ${getCSSVariable('--color-primary-dark', '#0284c7')} 100%)`,
            secondary: `linear-gradient(135deg, ${getCSSVariable('--color-secondary', '#8b5cf6')} 0%, ${getCSSVariable('--color-secondary-dark', '#7c3aed')} 100%)`,
        },
        positive: getCSSVariable('--color-green', '#10b981'),
        negative: getCSSVariable('--color-red', '#ef4444'),
        neutral: getCSSVariable('--color-gray', '#6b7280'),
    });

    // Simplified theme colors using CSS variables
    const themeColors = {
        background: getCSSVariable('--color-background', mode === 'dark' ? '#0f172a' : '#ffffff'),
        surface: getCSSVariable('--color-surface', mode === 'dark' ? '#1e293b' : '#f8fafc'),
        primary: getCSSVariable('--color-primary', '#0ea5e9'),
        secondary: getCSSVariable('--color-secondary', '#8b5cf6'),
        text: {
            primary: getCSSVariable('--color-text-primary', mode === 'dark' ? '#f1f5f9' : '#0f172a'),
            secondary: getCSSVariable('--color-text-secondary', mode === 'dark' ? '#cbd5e1' : '#64748b'),
        },
        border: getCSSVariable('--color-border', mode === 'dark' ? '#334155' : '#e2e8f0'),
    };

    return {
        applicationStage: {
            getColor: getApplicationStageColor,
            getBackgroundColor: getApplicationStageBackgroundColor,
        },
        analytics: getChartColors(),
        theme: themeColors,
    };
};
