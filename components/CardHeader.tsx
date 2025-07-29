import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, MoreHorizontal } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import ActionButton from './dashboard/ActionButton';

interface CardHeaderProps {
    title: string | React.ReactNode; // Updated to accept ReactNode
    subtitle?: string | React.ReactNode;
    children?: React.ReactNode;
    isAiGenerated?: boolean;
    accentColor?: string;
    variant?: 'default' | 'elevated' | 'minimal' | 'gradient' | 'interactive';
    onAiRefresh?: () => void;
    onAction?: () => void;
    actionLabel?: string;
    showDivider?: boolean;
}

const CardHeader: React.FC<CardHeaderProps> = ({
    title,
    subtitle,
    children,
    isAiGenerated = false,
    accentColor,
    variant = 'default',
    onAiRefresh,
    onAction,
    actionLabel,
    showDivider = true
}) => {
    const { currentTheme } = useTheme();
    const [isHovered, setIsHovered] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);
    const headerRef = useRef<HTMLDivElement>(null);
    const animationLevel = currentTheme.animation;

    useEffect(() => {
        if (hasInteracted) {
            const timer = setTimeout(() => setHasInteracted(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [hasInteracted]);

    const handleAiRefresh = () => {
        if (onAiRefresh) {
            setIsAnimating(true);
            setHasInteracted(true);
            setTimeout(() => setIsAnimating(false), 1000);
            onAiRefresh();
        }
    };

    const handleAction = () => {
        if (onAction) {
            setHasInteracted(true);
            onAction();
        }
    };

    const gradientColors = {
        start: accentColor || 'var(--accent-primary)',
        end: 'var(--accent-secondary)'
    };

    const hasGlossEffect = animationLevel !== 'minimal';
    const hasParticles = animationLevel === 'playful' || animationLevel === 'moderate';

    return (
        <div
            ref={headerRef}
            className={`header-container ${variant} animation-${animationLevel} ${isHovered ? 'hovered' : ''} ${isAnimating ? 'animating' : ''} ${hasInteracted ? 'interacted' : ''}`}
            role="banner"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                '--accent-color': accentColor || 'var(--accent-primary)',
                '--gradient-start': gradientColors.start,
                '--gradient-end': gradientColors.end,
            } as React.CSSProperties}
        >
            <div className="glass-overlay"></div>
            {hasGlossEffect && <div className="header-gloss"></div>}
            {variant === 'gradient' && <div className="gradient-bg"></div>}
            {hasParticles && (
                <div className="particle-container">
                    <div className="particle p1"></div>
                    <div className="particle p2"></div>
                    <div className="particle p3"></div>
                    {animationLevel === 'playful' && (
                        <>
                            <div className="particle p4"></div>
                            <div className="particle p5"></div>
                        </>
                    )}
                </div>
            )}

            <div className="header-content">
                <div className="header-left">
                    <h2 className="header-title">
                        <span className="title-indicator"></span>
                        {/* Render title as string or ReactNode */}
                        {typeof title === 'string' ? (
                            <span className="title-text">{title}</span>
                        ) : (
                            <span className="title-text">{title}</span>
                        )}
                        {isAiGenerated && (
                            <ActionButton
                                label="AI"
                                icon={Sparkles}
                                variant="secondary"
                                size="small"
                                onClick={handleAiRefresh}
                                className="ai-badge-button"
                                aria-label="AI generated content - Click to refresh"
                            />
                        )}
                    </h2>
                    {subtitle && (
                        <div className="header-subtitle-container">
                            {typeof subtitle === 'string' ? (
                                <span className="header-subtitle">{subtitle}</span>
                            ) : (
                                subtitle
                            )}
                        </div>
                    )}
                </div>
                <div className="header-right">
                    {children}
                    {onAction && (
                        <ActionButton
                            label=""
                            icon={MoreHorizontal}
                            variant="ghost"
                            size="small"
                            onClick={handleAction}
                            aria-label={actionLabel || 'More actions'}
                            className="card-header-action-button"
                        />
                    )}
                </div>
            </div>
            {showDivider && <div className="bottom-highlight"></div>}

            <style jsx>{`
                .header-container {
                    display: flex;
                    flex-direction: column;
                    padding: var(--container-padding, 1.25rem 1.5rem);
                    transition: all var(--transition-normal) var(--easing-standard);
                    border-top-left-radius: var(--container-border-radius, var(--border-radius));
                    border-top-right-radius: var(--container-border-radius, var(--border-radius));
                    position: relative;
                    overflow: hidden;
                    z-index: 1;
                }

                .glass-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    z-index: -1;
                    opacity: 0.5;
                    transition: opacity var(--transition-normal) var(--easing-standard);
                }

                .dark .glass-overlay {
                    background: linear-gradient(
                        to bottom,
                        rgba(255, 255, 255, 0.02),
                        transparent 80%
                    );
                }

                .header-container.hovered .glass-overlay {
                    opacity: 0.8;
                }

                .header-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    width: 100%;
                    position: relative;
                    z-index: 2;
                }

                .header-container.elevated {
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                    padding: 1.5rem 1.75rem;
                }

                .header-container.minimal {
                    background: transparent;
                    backdrop-filter: none;
                    -webkit-backdrop-filter: none;
                    padding: 1rem 1.25rem;
                }

                .header-container.gradient {
                    color: white;
                    padding-top: 1.5rem;
                }

                .header-container.interactive {
                    cursor: pointer;
                    transition: all var(--transition-fast) var(--easing-standard);
                }

                .header-container.interactive:hover {
                    background: var(--hover-bg);
                    transform: translateY(-1px);
                }

                .header-container.interactive:active {
                    transform: translateY(0);
                }

                .gradient-bg {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(135deg, var(--gradient-start), var(--gradient-end));
                    opacity: 0.9;
                    z-index: -1;
                }

                .header-gloss {
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(
                        90deg,
                        transparent,
                        rgba(255, 255, 255, 0.08),
                        transparent
                    );
                    transform: skewX(-15deg);
                    transition: all 1.2s var(--easing-standard);
                    opacity: 0;
                    z-index: 0;
                    pointer-events: none;
                }

                .header-container.hovered .header-gloss {
                    left: 100%;
                    opacity: 1;
                }

                .bottom-highlight {
                    position: absolute;
                    left: 0;
                    bottom: 0;
                    width: 100%;
                    height: 1px;
                    background: var(--border-divider);
                    transition: all var(--transition-normal) var(--easing-standard);
                }

                .header-container.hovered .bottom-highlight,
                .header-container.interacted .bottom-highlight {
                    background: linear-gradient(
                        to right,
                        transparent 5%,
                        var(--accent-color) 50%,
                        transparent 95%
                    );
                    height: 2px;
                    opacity: 0.8;
                }

                .header-container.gradient .bottom-highlight {
                    background: linear-gradient(
                        to right,
                        transparent 5%,
                        rgba(255, 255, 255, 0.7) 50%,
                        transparent 95%
                    );
                    height: 2px;
                }

                .header-left {
                    display: flex;
                    flex-direction: column;
                    position: relative;
                    z-index: 2;
                    flex: 1;
                    min-width: 0;
                }

                .header-title {
                    position: relative;
                    margin: 0;
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: var(--text-primary);
                    transition: all var(--transition-normal) var(--easing-standard);
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    line-height: 1.3;
                    flex-wrap: wrap; /* Allow wrapping for dynamic content */
                }

                .header-container.gradient .header-title {
                    color: white;
                    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
                }

                .title-indicator {
                    display: inline-block;
                    width: 10px;
                    height: 10px;
                    background: var(--accent-color);
                    border-radius: var(--border-radius-full);
                    opacity: 0.8;
                    transition: all var(--transition-normal) var(--easing-standard);
                    flex-shrink: 0;
                }

                .dark .title-indicator {
                    box-shadow: 0 0 8px var(--accent-color);
                }

                .header-container.hovered .title-indicator,
                .header-container.interacted .title-indicator {
                    transform: scale(1.2);
                    opacity: 1;
                }

                .header-container.animating .title-indicator {
                    animation: pulse-scale 1s var(--easing-standard);
                }

                .title-text {
                    position: relative;
                    z-index: 1;
                    transition: transform var(--transition-normal) var(--easing-standard);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    display: inline-flex; /* Ensure it works with nested spans */
                    align-items: center;
                    gap: 8px; /* Space for pulsing/status text */
                }

                .header-container.hovered .title-text,
                .header-container.interacted .title-text {
                    transform: translateX(3px);
                }

                /* Add pulsing and status text styles */
                .title-text .pulsing {
                    position: relative;
                    animation: pulseUnderline 1s ease-in-out infinite;
                }

                .title-text .global-status-text {
                    font-size: 0.9rem; /* Slightly smaller than title */
                    color: var(--text-secondary);
                    animation: statusTextFade 2s ease-in-out forwards;
                    margin-left: 8px;
                }

                @keyframes pulseUnderline {
                    0% { box-shadow: 0 2px 0 var(--accent-color); }
                    50% { box-shadow: 0 4px 0 var(--accent-color); }
                    100% { box-shadow: 0 2px 0 var(--accent-color); }
                }

                @keyframes statusTextFade {
                    0% { opacity: 0; transform: translateX(10px); }
                    20% { opacity: 1; transform: translateX(0); }
                    80% { opacity: 1; transform: translateX(0); }
                    100% { opacity: 0; transform: translateX(-10px); }
                }

                /* Old ai-badge styles replaced by the ActionButton ai-variant */
                .ai-badge-button {
                    margin-left: 8px;
                    max-height: 24px;
                }

                .sparkle-icon {
                    color: ${variant === 'gradient' ? 'white' : 'var(--accent-purple)'};
                    animation: sparkle-pulse 2s infinite;
                }

                .header-container.animating .sparkle-icon {
                    animation: sparkle-spin 1s var(--easing-decelerate);
                }

                .ai-label {
                    font-weight: 600;
                    color: ${variant === 'gradient' ? 'white' : 'var(--text-primary)'};
                    position: relative;
                    z-index: 1;
                }

                .ai-pulse {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: radial-gradient(
                        circle at center,
                        rgba(139, 92, 246, 0.2),
                        transparent 70%
                    );
                    opacity: 0;
                    z-index: 0;
                }

                .ai-badge:hover .ai-pulse {
                    animation: pulse-fade 1.5s infinite;
                }

                .header-subtitle-container {
                    margin-top: 0.4rem;
                    transition: all var(--transition-normal) var(--easing-standard);
                    position: relative;
                    padding-left: ${variant === 'minimal' ? '0' : '20px'};
                }

                .header-container.hovered .header-subtitle-container,
                .header-container.interacted .header-subtitle-container {
                    transform: translateX(3px);
                }

                .header-subtitle {
                    font-size: 0.9rem;
                    color: ${variant === 'gradient' ? 'rgba(255, 255, 255, 0.8)' : 'var(--text-secondary)'};
                    line-height: 1.3;
                    position: relative;
                    transition: all var(--transition-normal) var(--easing-standard);
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .header-right {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    position: relative;
                    z-index: 2;
                    flex-shrink: 0;
                    margin-left: 1rem;
                }

                .action-button {
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 32px;
                    height: 32px;
                    border-radius: var(--border-radius-full);
                    border: none;
                    background: transparent;
                    color: var(--text-secondary);
                    cursor: pointer;
                    transition: all var(--transition-normal) var(--easing-standard);
                    overflow: hidden;
                }

                .action-button:hover {
                    color: var(--text-primary);
                    transform: scale(1.1);
                }

                .action-button:active {
                    transform: scale(0.95);
                }

                .button-bg {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: var(--hover-bg);
                    opacity: 0;
                    transition: opacity var(--transition-normal) var(--easing-standard);
                    z-index: -1;
                    border-radius: var(--border-radius-full);
                }

                .action-button:hover .button-bg {
                    opacity: 1;
                }

                :global(.header-right button:not(.action-button)) {
                    background: ${variant === 'gradient' ? 'rgba(255, 255, 255, 0.15)' : 'var(--glass-bg)'};
                    border: 1px solid ${variant === 'gradient' ? 'rgba(255, 255, 255, 0.2)' : 'var(--border-thin)'};
                    border-radius: var(--border-radius);
                    padding: 0.5rem 0.75rem;
                    color: ${variant === 'gradient' ? 'white' : 'var(--text-primary)'};
                    cursor: pointer;
                    position: relative;
                    overflow: hidden;
                    transition: all var(--transition-normal) var(--easing-standard);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    font-size: 0.875rem;
                    font-weight: 500;
                }

                :global(.header-right button:not(.action-button):hover) {
                    transform: translateY(-2px);
                    box-shadow: ${variant === 'gradient'
                    ? '0 4px 12px rgba(0, 0, 0, 0.15)'
                    : 'var(--shadow)'};
                    background: ${variant === 'gradient' ? 'rgba(255, 255, 255, 0.2)' : 'var(--hover-bg)'};
                }

                :global(.header-right button:not(.action-button):active) {
                    transform: translateY(0);
                }

                .particle-container {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    overflow: hidden;
                    pointer-events: none;
                    z-index: 0;
                }

                .particle {
                    position: absolute;
                    border-radius: 50%;
                    opacity: 0;
                    background: var(--accent-color);
                    filter: blur(5px);
                }

                .p1 { width: 12px; height: 12px; left: 10%; top: 30%; }
                .p2 { width: 8px; height: 8px; right: 20%; bottom: 30%; }
                .p3 { width: 10px; height: 10px; left: 40%; bottom: 10%; }
                .p4 { width: 15px; height: 15px; right: 35%; top: 20%; }
                .p5 { width: 6px; height: 6px; left: 25%; top: 60%; }

                .header-container.interacted .particle,
                .header-container.animation-playful .particle {
                    opacity: 0.3;
                }

                .header-container.hovered .p1,
                .header-container.interacted .p1 { animation: float-particle 6s ease-in-out infinite; animation-delay: 0.2s; }
                .header-container.hovered .p2,
                .header-container.interacted .p2 { animation: float-particle 8s ease-in-out infinite; animation-delay: 2s; }
                .header-container.hovered .p3,
                .header-container.interacted .p3 { animation: float-particle 7s ease-in-out infinite; animation-delay: 1s; }
                .header-container.hovered .p4,
                .header-container.interacted .p4 { animation: float-particle 9s ease-in-out infinite; animation-delay: 0s; }
                .header-container.hovered .p5,
                .header-container.interacted .p5 { animation: float-particle 5s ease-in-out infinite; animation-delay: 0.5s; }

                @keyframes pulse-scale {
                    0%, 100% { transform: scale(1); opacity: 0.8; }
                    50% { transform: scale(1.5); opacity: 1; }
                }

                @keyframes sparkle-pulse {
                    0%, 100% { opacity: 0.8; }
                    50% { opacity: 1; filter: brightness(1.2); }
                }

                @keyframes sparkle-spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                @keyframes float-particle {
                    0% { opacity: 0.3; transform: translate(0, 0); }
                    25% { opacity: 0.6; transform: translate(10px, -15px); }
                    50% { opacity: 0.4; transform: translate(15px, 10px); }
                    75% { opacity: 0.6; transform: translate(-5px, -5px); }
                    100% { opacity: 0.3; transform: translate(0, 0); }
                }

                @keyframes pulse-fade {
                    0%, 100% { opacity: 0; }
                    50% { opacity: 0.5; }
                }

                @media (max-width: 768px) {
                    .header-container { padding: 1rem 1.25rem; }
                    .header-content { flex-direction: column; align-items: flex-start; }
                    .header-right { margin-top: 1rem; margin-left: 0; width: 100%; justify-content: flex-end; }
                    .header-title { font-size: 1.1rem; flex-wrap: wrap; gap: 4px; }
                    .header-subtitle { font-size: 0.8rem; }
                    .title-text { flex-direction: column; align-items: flex-start; gap: 4px; }
                    .title-text .global-status-text { margin-left: 0; }
                }

                .header-container.animation-minimal .particle { display: none; }
                .header-container.animation-subtle .particle { opacity: 0.15; }
                .header-container.animation-subtle.hovered .particle { opacity: 0.25; }
            `}</style>
        </div>
    );
};

export default CardHeader;
