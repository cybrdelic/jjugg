'use client';

import { useState, useEffect, useRef } from 'react';
import { LucideIcon } from 'lucide-react';
import { NavItem, SectionKey } from './types';
import Tooltip from './Tooltip';

interface NavItemComponentProps {
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
    isCollapsed: boolean;
    onContextMenu: (e: React.MouseEvent) => void;
    badge?: { count: number } | { text: string };
    isAnimating?: boolean;
    animationLevel?: 'minimal' | 'subtle' | 'moderate' | 'playful';
}

const NavItemComponent: React.FC<NavItemComponentProps> = ({
    icon,
    label,
    isActive,
    onClick,
    isCollapsed,
    onContextMenu,
    badge,
    isAnimating = false,
    animationLevel = 'moderate'
}) => {
    const [rippleEffect, setRippleEffect] = useState<{x: number, y: number, size: number} | null>(null);
    const itemRef = useRef<HTMLDivElement>(null);

    // Clear ripple effect after animation completes
    useEffect(() => {
        if (rippleEffect) {
            const timer = setTimeout(() => setRippleEffect(null), 600);
            return () => clearTimeout(timer);
        }
    }, [rippleEffect]);

    // Handle click with ripple effect
    const handleClick = (e: React.MouseEvent) => {
        if (animationLevel !== 'minimal') {
            const rect = e.currentTarget.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height) * 2;
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            setRippleEffect({ x, y, size });
        }
        onClick();
    };

    // Get badge content
    const getBadgeContent = () => {
        if (!badge) return null;
        return 'count' in badge ? badge.count : badge.text;
    };

    // Tooltip content for collapsed state
    const tooltipContent = (
        <div className="tooltip-content">
            <span className="tooltip-label">{label}</span>
            {badge && (
                <span className="tooltip-badge">
                    {getBadgeContent()}
                </span>
            )}
            <style jsx>{`
                .tooltip-content {
                    padding: 4px 0;
                }
                
                .tooltip-label {
                    font-weight: 600;
                    color: var(--text-primary);
                    display: block;
                }
                
                .tooltip-badge {
                    display: inline-block;
                    margin-top: 4px;
                    padding: 2px 8px;
                    background-color: var(--accent-primary);
                    color: white;
                    border-radius: 10px;
                    font-size: 0.7rem;
                    font-weight: 600;
                }
            `}</style>
        </div>
    );

    // Wrap with tooltip if collapsed
    const itemContent = (
        <div 
            ref={itemRef}
            className={`nav-item ${isActive ? 'active' : ''} ${isAnimating ? 'animating' : ''}`}
            onClick={handleClick}
            onContextMenu={onContextMenu}
            role="menuitem"
            aria-label={label}
        >
            {/* Visual indicators and effects */}
            <div className="hover-indicator" />
            {isActive && <div className="active-backdrop" />}
            <div className="glow-effect" />
            
            {/* Icon container with pulse animation */}
            <div className="icon-container">
                <div className={`icon ${isActive ? 'active' : ''}`}>
                    {icon}
                </div>
                {isActive && animationLevel !== 'minimal' && <div className="icon-pulse" />}
            </div>
            
            {/* Label and description */}
            {!isCollapsed && (
                <div className="content">
                    <div className="label">{label}</div>
                    {badge && (
                        <div className={`badge ${isActive ? 'active' : ''}`}>
                            {getBadgeContent()}
                            {animationLevel !== 'minimal' && <div className="badge-shine" />}
                        </div>
                    )}
                </div>
            )}
            
            {/* Active indicator line */}
            {isActive && !isCollapsed && <div className="active-indicator" />}
            
            {/* Ripple animation effect */}
            {rippleEffect && (
                <span 
                    className="ripple"
                    style={{
                        left: rippleEffect.x,
                        top: rippleEffect.y,
                        width: rippleEffect.size,
                        height: rippleEffect.size
                    }}
                />
            )}
            
            <style jsx>{`
                .nav-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: ${isCollapsed ? '10px' : '12px 16px'};
                    margin-bottom: 4px;
                    position: relative;
                    cursor: pointer;
                    border-radius: var(--border-radius);
                    transition: all var(--transition-normal) var(--easing-standard);
                    overflow: hidden;
                }
                
                /* Hover and active states */
                .nav-item:hover {
                    background-color: var(--hover-bg);
                    transform: translateX(2px);
                }
                
                .nav-item.active {
                    background-color: var(--active-bg);
                    color: var(--text-accent);
                    font-weight: 500;
                }
                
                .nav-item.active:hover {
                    transform: translateX(3px);
                }
                
                /* Hover indicator line */
                .hover-indicator {
                    position: absolute;
                    left: 0;
                    top: 15%;
                    width: 3px;
                    height: 70%;
                    background-color: var(--accent-primary);
                    opacity: 0;
                    transform: translateX(-10px) scaleY(0.6);
                    transition: all var(--transition-normal) var(--easing-accelerate);
                    border-radius: 0 4px 4px 0;
                }
                
                .nav-item:hover .hover-indicator {
                    opacity: 0.6;
                    transform: translateX(0) scaleY(0.8);
                }
                
                .nav-item.active .hover-indicator {
                    opacity: 1;
                    transform: translateX(0) scaleY(1);
                    box-shadow: 0 0 8px var(--accent-primary-glow);
                }
                
                /* Active background effect */
                .active-backdrop {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, 
                        rgba(var(--accent-primary-rgb), 0.07), 
                        rgba(var(--accent-primary-rgb), 0.01)
                    );
                    opacity: 0.6;
                    z-index: -1;
                    border-radius: var(--border-radius);
                }
                
                /* Glow effect on hover */
                .glow-effect {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                    height: 100%;
                    background: radial-gradient(
                        circle at 30% 50%, 
                        rgba(var(--accent-primary-rgb), 0.12), 
                        transparent 70%
                    );
                    opacity: 0;
                    z-index: -1;
                    transition: opacity var(--transition-normal) var(--easing-standard);
                    pointer-events: none;
                }
                
                .nav-item:hover .glow-effect,
                .nav-item.active .glow-effect {
                    opacity: 1;
                }
                
                /* Icon container styling */
                .icon-container {
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: ${isCollapsed ? '100%' : '28px'};
                    height: 28px;
                    flex-shrink: 0;
                }
                
                .icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all var(--transition-normal) var(--easing-standard);
                    color: var(--text-secondary);
                    z-index: 1;
                }
                
                .icon.active {
                    color: var(--accent-primary);
                }
                
                .nav-item:hover .icon {
                    transform: scale(1.1);
                    color: var(--text-primary);
                }
                
                .nav-item.active:hover .icon {
                    color: var(--accent-primary);
                }
                
                .nav-item.active .icon {
                    filter: drop-shadow(0 0 3px rgba(var(--accent-primary-rgb), 0.5));
                }
                
                /* Animated pulse behind active icon */
                .icon-pulse {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 32px;
                    height: 32px;
                    background: radial-gradient(
                        circle, 
                        rgba(var(--accent-primary-rgb), 0.15), 
                        transparent 70%
                    );
                    border-radius: 50%;
                    z-index: -1;
                    animation: pulse-subtle 3s infinite;
                }
                
                /* Content area (label + badge) */
                .content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex: 1;
                    min-width: 0;
                }
                
                .label {
                    color: ${isActive ? 'var(--text-accent)' : 'var(--text-primary)'};
                    font-weight: ${isActive ? '600' : '500'};
                    transition: all var(--transition-normal) var(--easing-standard);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                
                /* Badge styling */
                .badge {
                    background-color: var(--accent-secondary);
                    color: white;
                    padding: 3px 8px;
                    border-radius: 12px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    position: relative;
                    overflow: hidden;
                    transition: all var(--transition-normal) var(--easing-standard);
                    margin-left: 8px;
                    animation: badge-pulse 2s infinite cubic-bezier(0.66, 0, 0, 1);
                }
                
                .badge.active {
                    background-color: var(--accent-primary);
                    transform: scale(1.05);
                    animation: badge-pulse-active 2s infinite cubic-bezier(0.66, 0, 0, 1);
                }
                
                .badge-shine {
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 50%;
                    height: 100%;
                    background: linear-gradient(
                        90deg,
                        rgba(255, 255, 255, 0),
                        rgba(255, 255, 255, 0.3),
                        rgba(255, 255, 255, 0)
                    );
                    transform: skewX(-20deg);
                    animation: badge-shine 3s infinite;
                }
                
                /* Active indicator bar */
                .active-indicator {
                    position: absolute;
                    right: 0;
                    top: 15%;
                    width: 3px;
                    height: 70%;
                    background-color: var(--accent-primary);
                    border-radius: 4px 0 0 4px;
                    box-shadow: 0 0 8px var(--accent-primary-glow);
                }
                
                /* Ripple effect */
                .ripple {
                    position: absolute;
                    border-radius: 50%;
                    background-color: rgba(255, 255, 255, 0.3);
                    transform: scale(0);
                    animation: ripple 0.6s ease-out forwards;
                    pointer-events: none;
                }
                
                /* Animation for nav item that's currently activating */
                .nav-item.animating .icon {
                    animation: pop-in 0.5s var(--easing-overshoot);
                }
                
                .nav-item.animating.active .hover-indicator {
                    animation: slide-in 0.5s var(--easing-overshoot);
                }
                
                /* Animations */
                @keyframes ripple {
                    to {
                        transform: scale(2.5);
                        opacity: 0;
                    }
                }
                
                @keyframes pulse-subtle {
                    0% {
                        opacity: 0.6;
                        transform: translate(-50%, -50%) scale(0.95);
                    }
                    50% {
                        opacity: 1;
                        transform: translate(-50%, -50%) scale(1.05);
                    }
                    100% {
                        opacity: 0.6;
                        transform: translate(-50%, -50%) scale(0.95);
                    }
                }
                
                @keyframes badge-pulse {
                    0% {
                        transform: scale(0.95);
                    }
                    70% {
                        transform: scale(1.0);
                    }
                    100% {
                        transform: scale(0.95);
                    }
                }
                
                @keyframes badge-pulse-active {
                    0% {
                        transform: scale(1.0);
                    }
                    70% {
                        transform: scale(1.05);
                    }
                    100% {
                        transform: scale(1.0);
                    }
                }
                
                @keyframes badge-shine {
                    0% {
                        left: -100%;
                    }
                    20% {
                        left: 100%;
                    }
                    100% {
                        left: 100%;
                    }
                }
                
                @keyframes pop-in {
                    0% { transform: scale(0.8); }
                    50% { transform: scale(1.2); }
                    100% { transform: scale(1); }
                }
                
                @keyframes slide-in {
                    0% { transform: translateX(-10px) scaleY(0.6); opacity: 0; }
                    100% { transform: translateX(0) scaleY(1); opacity: 1; }
                }
                
                /* Media queries for responsive design */
                @media (max-width: 768px) {
                    .nav-item {
                        padding: ${isCollapsed ? '8px' : '10px 12px'};
                    }
                }
            `}</style>
        </div>
    );

    // Return with or without tooltip
    return isCollapsed ? (
        <Tooltip content={tooltipContent} placement="right" delay={200}>
            {itemContent}
        </Tooltip>
    ) : itemContent;
};

export default NavItemComponent;
