// components/CardHeader.tsx
import React, { useState, useRef } from 'react';
import { Sparkles } from 'lucide-react';

interface CardHeaderProps {
    title: string;
    subtitle?: string | React.ReactNode;
    children?: React.ReactNode;
    isAiGenerated?: boolean;
    accentColor?: string;
    variant?: 'default' | 'elevated' | 'minimal' | 'gradient';
    animationLevel?: 'minimal' | 'subtle' | 'moderate' | 'playful';
    onAiRefresh?: () => void;
}

const CardHeader: React.FC<CardHeaderProps> = ({ 
    title, 
    subtitle, 
    children, 
    isAiGenerated = false,
    accentColor,
    variant = 'default',
    animationLevel = 'moderate',
    onAiRefresh
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const headerRef = useRef<HTMLDivElement>(null);
    
    // Handle AI refresh action
    const handleAiRefresh = () => {
        if (onAiRefresh) {
            setIsAnimating(true);
            setTimeout(() => setIsAnimating(false), 1000);
            onAiRefresh();
        }
    };
    
    // Determine gradient colors for gradient variant
    const gradientColors = {
        start: accentColor || 'var(--accent-primary)',
        end: 'var(--accent-secondary)'
    };
    
    // Determine gloss effect based on animation level
    const hasGlossEffect = animationLevel !== 'minimal';
    
    return (
        <div 
            ref={headerRef}
            className={`header-container ${variant} ${animationLevel} ${isHovered ? 'hovered' : ''} ${isAnimating ? 'animating' : ''}`}
            role="banner"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{ 
                '--accent-color': accentColor || 'var(--accent-primary)',
                '--gradient-start': gradientColors.start,
                '--gradient-end': gradientColors.end,
            } as React.CSSProperties}
        >
            {/* Header gloss effect overlay */}
            {hasGlossEffect && <div className="header-gloss"></div>}
            
            {/* Gradient background effect for gradient variant */}
            {variant === 'gradient' && <div className="gradient-bg"></div>}
            
            {/* Animated particles for playful animation level */}
            {animationLevel === 'playful' && (
                <div className="particle-container">
                    <div className="particle p1"></div>
                    <div className="particle p2"></div>
                    <div className="particle p3"></div>
                </div>
            )}

            <div className="header-left">
                <h2 className="header-title">
                    {/* Visual indicator dot */}
                    <span className="title-indicator"></span>
                    
                    {/* Title text with optional AI badge */}
                    <span className="title-text">{title}</span>
                    
                    {/* AI generated badge */}
                    {isAiGenerated && (
                        <div className="ai-badge" onClick={handleAiRefresh} title="AI generated content - Click to refresh">
                            <Sparkles size={14} className="sparkle-icon" />
                            <span className="ai-label">AI</span>
                        </div>
                    )}
                </h2>
                
                {/* Subtitle with enhanced styling */}
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
            
            {/* Right side actions */}
            <div className="header-right">
                {children}
            </div>
            
            {/* Bottom highlight line */}
            <div className="bottom-highlight"></div>
            
            <style jsx>{`
                .header-container {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.25rem 1.5rem;
                    border-bottom: 1px solid var(--border-divider);
                    background: var(--glass-bg);
                    backdrop-filter: blur(var(--blur-amount));
                    -webkit-backdrop-filter: blur(var(--blur-amount));
                    transition: all var(--transition-normal) var(--easing-standard);
                    border-top-left-radius: var(--border-radius);
                    border-top-right-radius: var(--border-radius);
                    position: relative;
                    overflow: hidden;
                    z-index: 1;
                }
                
                /* Variant styles */
                .header-container.elevated {
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                    border-bottom: none;
                    padding: 1.5rem 1.75rem;
                }
                
                .header-container.minimal {
                    background: transparent;
                    backdrop-filter: none;
                    -webkit-backdrop-filter: none;
                    border-bottom-color: var(--border-thin);
                    padding: 1rem 1.25rem;
                }
                
                .header-container.gradient {
                    border-bottom: none;
                    color: white;
                    padding-top: 1.5rem;
                }
                
                /* Gradient background for gradient variant */
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
                
                /* Header gloss effect */
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
                
                /* Header bottom highlight */
                .bottom-highlight {
                    position: absolute;
                    left: 0;
                    bottom: 0;
                    width: 100%;
                    height: 2px;
                    background: linear-gradient(
                        to right,
                        transparent 5%,
                        var(--accent-color) 50%,
                        transparent 95%
                    );
                    opacity: 0.5;
                    transform: scaleX(0.7);
                    transition: all var(--transition-normal) var(--easing-standard);
                }
                
                .header-container.hovered .bottom-highlight {
                    opacity: 0.8;
                    transform: scaleX(1);
                }
                
                .header-container.gradient .bottom-highlight {
                    background: linear-gradient(
                        to right,
                        transparent 5%,
                        rgba(255, 255, 255, 0.7) 50%,
                        transparent 95%
                    );
                }
                
                /* Header left content */
                .header-left {
                    display: flex;
                    flex-direction: column;
                    position: relative;
                    z-index: 2;
                }
                
                /* Title styling */
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
                }
                
                .header-container.gradient .header-title {
                    color: white;
                    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
                }
                
                /* Title indicator dot */
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
                
                .header-container.hovered .title-indicator {
                    transform: scale(1.2);
                    opacity: 1;
                }
                
                .header-container.animating .title-indicator {
                    animation: pulse-scale 1s var(--easing-standard);
                }
                
                /* Title text container */
                .title-text {
                    position: relative;
                    z-index: 1;
                    transition: transform var(--transition-normal) var(--easing-standard);
                }
                
                .header-container.hovered .title-text {
                    transform: translateX(3px);
                }
                
                /* AI badge styling */
                .ai-badge {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    background: ${variant === 'gradient' 
                        ? 'rgba(255, 255, 255, 0.2)' 
                        : 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(14, 165, 233, 0.1))'};
                    border: 1px solid ${variant === 'gradient' 
                        ? 'rgba(255, 255, 255, 0.3)' 
                        : 'rgba(139, 92, 246, 0.15)'};
                    border-radius: 12px;
                    padding: 3px 8px;
                    font-size: 0.75rem;
                    cursor: pointer;
                    transition: all var(--transition-normal) var(--easing-standard);
                }
                
                .ai-badge:hover {
                    transform: translateY(-1px);
                    background: ${variant === 'gradient' 
                        ? 'rgba(255, 255, 255, 0.25)' 
                        : 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(14, 165, 233, 0.15))'};
                    box-shadow: ${variant === 'gradient' 
                        ? '0 2px 8px rgba(0, 0, 0, 0.15)' 
                        : '0 2px 8px rgba(139, 92, 246, 0.15)'};
                }
                
                .sparkle-icon {
                    color: ${variant === 'gradient' ? 'white' : 'var(--accent-purple)'};
                    animation: sparkle-pulse 2s infinite;
                }
                
                .ai-badge.animating .sparkle-icon {
                    animation: sparkle-spin 1s var(--easing-decelerate);
                }
                
                .ai-label {
                    font-weight: 600;
                    color: ${variant === 'gradient' ? 'white' : 'var(--text-primary)'};
                }
                
                /* Subtitle styling */
                .header-subtitle-container {
                    margin-top: 0.4rem;
                    transition: all var(--transition-normal) var(--easing-standard);
                    position: relative;
                    padding-left: ${variant === 'minimal' ? '0' : '20px'};
                }
                
                .header-container.hovered .header-subtitle-container {
                    transform: translateX(3px);
                }
                
                .header-subtitle {
                    font-size: 0.9rem;
                    color: ${variant === 'gradient' ? 'rgba(255, 255, 255, 0.8)' : 'var(--text-secondary)'};
                    line-height: 1.3;
                    position: relative;
                    transition: all var(--transition-normal) var(--easing-standard);
                }
                
                /* Header right actions */
                .header-right {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    position: relative;
                    z-index: 2;
                }
                
                /* Apply styles to buttons in the right section */
                :global(.header-right button) {
                    background: ${variant === 'gradient' ? 'rgba(255, 255, 255, 0.15)' : 'var(--glass-bg)'};
                    border: 1px solid ${variant === 'gradient' ? 'rgba(255, 255, 255, 0.2)' : 'var(--border-thin)'};
                    border-radius: var(--border-radius-md);
                    padding: 0.5rem;
                    color: ${variant === 'gradient' ? 'white' : 'var(--text-primary)'};
                    cursor: pointer;
                    position: relative;
                    overflow: hidden;
                    transition: all var(--transition-normal) var(--easing-standard);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                :global(.header-right button:hover) {
                    transform: translateY(-2px);
                    box-shadow: ${variant === 'gradient' 
                        ? '0 4px 12px rgba(0, 0, 0, 0.15)' 
                        : 'var(--shadow)'};
                    background: ${variant === 'gradient' ? 'rgba(255, 255, 255, 0.2)' : 'var(--hover-bg)'};
                }
                
                :global(.header-right button:active) {
                    transform: translateY(0);
                }
                
                /* Animated particles for playful animation level */
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
                }
                
                .p1 {
                    width: 8px;
                    height: 8px;
                    left: 10%;
                    top: 30%;
                }
                
                .p2 {
                    width: 6px;
                    height: 6px;
                    right: 20%;
                    bottom: 30%;
                }
                
                .p3 {
                    width: 4px;
                    height: 4px;
                    left: 40%;
                    bottom: 10%;
                }
                
                .header-container.hovered .p1 {
                    animation: float-particle 3s ease-in-out infinite;
                    animation-delay: 0.2s;
                }
                
                .header-container.hovered .p2 {
                    animation: float-particle 4s ease-in-out infinite;
                    animation-delay: 0.5s;
                }
                
                .header-container.hovered .p3 {
                    animation: float-particle 5s ease-in-out infinite;
                    animation-delay: 0.8s;
                }
                
                /* Animation keyframes */
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
                    0% { 
                        opacity: 0;
                        transform: translateY(0) translateX(0);
                    }
                    25% {
                        opacity: 0.5;
                    }
                    50% {
                        opacity: 0.8;
                        transform: translateY(-10px) translateX(5px);
                    }
                    75% {
                        opacity: 0.5;
                    }
                    100% { 
                        opacity: 0;
                        transform: translateY(0) translateX(0);
                    }
                }
                
                /* Media queries for responsive design */
                @media (max-width: 768px) {
                    .header-container {
                        padding: 1rem 1.25rem;
                        flex-direction: column;
                        align-items: flex-start;
                    }
                    
                    .header-right {
                        margin-top: 1rem;
                        width: 100%;
                        justify-content: flex-end;
                    }
                    
                    .header-title {
                        font-size: 1.1rem;
                    }
                    
                    .header-subtitle {
                        font-size: 0.8rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default CardHeader;