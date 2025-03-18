// components/NavItem.tsx
import { useState, useRef, useEffect } from 'react';
import { NavItemType } from './types';

interface NavItemProps {
    item: NavItemType;
    isCollapsed: boolean;
    isActive: boolean;
    onClick: () => void;
    onContextMenu: (e: React.MouseEvent) => void;
}

export default function NavItem({ item, isCollapsed, isActive, onClick, onContextMenu }: NavItemProps) {
    const [ripple, setRipple] = useState<{ x: number; y: number; size: number } | null>(null);
    const [hovered, setHovered] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0 });
    const itemRef = useRef<HTMLDivElement>(null);
    
    // Reset ripple after animation completes
    useEffect(() => {
        if (ripple) {
            const timer = setTimeout(() => setRipple(null), 600);
            return () => clearTimeout(timer);
        }
    }, [ripple]);
    
    // Update tooltip position based on item position
    useEffect(() => {
        if (hovered && isCollapsed && itemRef.current) {
            const rect = itemRef.current.getBoundingClientRect();
            setTooltipPosition({ top: rect.height / 2 });
        }
    }, [hovered, isCollapsed]);

    const handleClick = (e: React.MouseEvent) => {
        onClick();
        // Create ripple effect
        const rect = e.currentTarget.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 2;
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        setRipple({ x, y, size });
    };
    
    // Determine badge color and icon color based on active state
    const badgeColor = isActive ? item.color : `var(--item-color, ${item.color})`;
    const iconColor = isActive ? item.color : 'var(--text-secondary)';
    const hasBadge = item.badge !== undefined;

    return (
        <div
            ref={itemRef}
            className={`nav-item ${isActive ? 'active' : ''} ${hovered ? 'hovered' : ''}`}
            onClick={handleClick}
            onContextMenu={onContextMenu}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{ '--item-color': item.color } as React.CSSProperties}
            role="menuitem"
            aria-label={item.label}
            data-item-id={item.id}
        >
            {/* Visual elements */}
            <div className="hover-indicator" />
            {isActive && <div className="active-backdrop" />}
            <div className="glow-effect" />
            
            {/* Icon with animated container */}
            <div className="nav-icon-container">
                <div className="nav-icon" style={{ color: iconColor }}>
                    {item.icon}
                </div>
                {isActive && <div className="icon-background-pulse" />}
            </div>
            
            {/* Label with gradient animation on hover */}
            {!isCollapsed && (
                <div className="nav-label-container">
                    <span className="nav-label">{item.label}</span>
                    {item.description && <span className="nav-description">{item.description}</span>}
                </div>
            )}
            
            {/* Badge with animation */}
            {hasBadge && !isCollapsed && item.badge && (
                <span 
                    className={`nav-badge ${isActive ? 'active' : ''}`}
                    style={{ backgroundColor: badgeColor }}
                >
                    {'count' in item.badge ? item.badge.count : item.badge.text}
                    <span className="badge-glow"></span>
                </span>
            )}
            
            {/* AI-generated content placeholder */}
            {item.aiGeneratedContent && !isCollapsed && (
                <div className="ai-generated-indicator">
                    <span className="ai-dot"></span>
                    <span className="ai-label">AI</span>
                </div>
            )}
            
            {/* Tooltip for collapsed state */}
            {isCollapsed && (
                <div 
                    className={`tooltip ${hovered ? 'visible' : ''}`}
                    style={{ top: `calc(50% - ${tooltipPosition.top}px)` }}
                >
                    <div className="tooltip-content">
                        <span className="tooltip-label">{item.label}</span>
                        {item.description && <span className="tooltip-description">{item.description}</span>}
                        {hasBadge && item.badge && (
                            <span 
                                className="tooltip-badge"
                                style={{ backgroundColor: badgeColor }}
                            >
                                {'count' in item.badge ? item.badge.count : item.badge.text}
                            </span>
                        )}
                    </div>
                    <span className="tooltip-arrow"></span>
                </div>
            )}
            
            {/* Ripple effect */}
            {ripple && (
                <span
                    className="ripple"
                    style={{ left: ripple.x, top: ripple.y, width: ripple.size, height: ripple.size }}
                />
            )}

            <style jsx>{`
                .nav-item {
                    display: flex;
                    align-items: center;
                    padding: ${isCollapsed ? '14px 12px' : '12px 16px'};
                    position: relative;
                    cursor: pointer;
                    border-radius: var(--border-radius);
                    transition: all var(--transition-normal) var(--easing-standard);
                    margin-bottom: 4px;
                    overflow: hidden;
                }
                
                /* Hover effects */
                .nav-item:hover {
                    background-color: var(--hover-bg);
                    transform: translateX(2px);
                }
                
                .nav-item.active:hover {
                    transform: translateX(3px);
                }
                
                /* Active state styling */
                .nav-item.active {
                    background-color: var(--active-bg);
                    color: var(--text-accent);
                    font-weight: 500;
                }
                
                .dark .nav-item.active {
                    box-shadow: inset 0 0 0 1px rgba(var(--accent-${item.color}-rgb, 56, 189, 248), 0.25);
                }
                
                /* Visual indicator elements */
                .hover-indicator {
                    position: absolute;
                    left: 0;
                    width: 4px;
                    height: 70%;
                    background-color: var(--item-color);
                    opacity: 0;
                    transform: translateX(-10px) scaleY(0.6);
                    transition: all var(--transition-normal) var(--easing-accelerate);
                    border-radius: 0 4px 4px 0;
                    top: 15%;
                }
                
                .active-backdrop {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, 
                        rgba(var(--accent-${item.color}-rgb, 56, 189, 248), 0.07), 
                        rgba(var(--accent-${item.color}-rgb, 56, 189, 248), 0.01)
                    );
                    opacity: 0.6;
                    z-index: -1;
                    border-radius: var(--border-radius);
                }
                
                .glow-effect {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                    height: 100%;
                    background: radial-gradient(
                        circle at 30% 50%, 
                        rgba(var(--accent-${item.color}-rgb, 56, 189, 248), 0.12), 
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
                
                .nav-item:hover .hover-indicator {
                    opacity: 0.6;
                    transform: translateX(0) scaleY(0.8);
                }
                
                .nav-item.active .hover-indicator {
                    opacity: 1;
                    transform: translateX(0) scaleY(1);
                    box-shadow: 0 0 8px rgba(var(--accent-${item.color}-rgb, 56, 189, 248), 0.5);
                }
                
                /* Icon styling with container */
                .nav-icon-container {
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: ${isCollapsed ? '100%' : '24px'};
                    height: 24px;
                    margin-right: ${isCollapsed ? '0' : '14px'};
                    transition: transform var(--transition-normal) var(--easing-standard);
                }
                
                .icon-background-pulse {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 32px;
                    height: 32px;
                    background: radial-gradient(
                        circle, 
                        rgba(var(--accent-${item.color}-rgb, 56, 189, 248), 0.15), 
                        transparent 70%
                    );
                    border-radius: 50%;
                    z-index: -1;
                    animation: pulse-subtle 3s infinite;
                }
                
                .nav-icon {
                    position: relative;
                    transition: all var(--transition-normal) var(--easing-standard);
                    z-index: 1;
                }
                
                .nav-item:hover .nav-icon {
                    transform: scale(1.1);
                }
                
                .dark .nav-item.active .nav-icon {
                    filter: drop-shadow(0 0 3px rgba(var(--accent-${item.color}-rgb, 56, 189, 248), 0.5));
                }
                
                /* Label styling */
                .nav-label-container {
                    display: flex;
                    flex-direction: column;
                    flex: 1;
                    min-width: 0;
                }
                
                .nav-label {
                    color: ${isActive ? 'var(--text-accent)' : 'var(--text-primary)'};
                    font-weight: ${isActive ? '600' : '500'};
                    transition: all var(--transition-normal) var(--easing-standard);
                    position: relative;
                    display: block;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                
                .nav-description {
                    font-size: 0.75rem;
                    color: var(--text-tertiary);
                    margin-top: 2px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    opacity: 0.8;
                    transition: opacity var(--transition-normal) var(--easing-standard);
                    max-width: 150px;
                }
                
                .nav-item:hover .nav-description {
                    opacity: 1;
                }
                
                /* Badge styling with animations */
                .nav-badge {
                    position: relative;
                    margin-left: 8px;
                    background-color: var(--item-color);
                    color: #fff;
                    padding: 3px 8px;
                    border-radius: 12px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    overflow: hidden;
                    transition: all var(--transition-normal) var(--easing-standard);
                    box-shadow: 0 0 0 0 rgba(var(--accent-${item.color}-rgb, 56, 189, 248), 0.5);
                    animation: badge-pulse 2s infinite cubic-bezier(0.66, 0, 0, 1);
                }
                
                .nav-badge.active {
                    transform: scale(1.05);
                    box-shadow: 0 0 0 0 rgba(var(--accent-${item.color}-rgb, 56, 189, 248), 0.5);
                    animation: badge-pulse-active 2s infinite cubic-bezier(0.66, 0, 0, 1);
                }
                
                .badge-glow {
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
                
                /* AI content indicator */
                .ai-generated-indicator {
                    display: flex;
                    align-items: center;
                    margin-left: 8px;
                    padding: 2px 6px;
                    background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(14, 165, 233, 0.2));
                    border-radius: 10px;
                    font-size: 0.7rem;
                    font-weight: 600;
                    color: var(--text-primary);
                    border: 1px solid rgba(139, 92, 246, 0.2);
                }
                
                .ai-dot {
                    width: 6px;
                    height: 6px;
                    background: linear-gradient(135deg, #8b5cf6, #0ea5e9);
                    border-radius: 50%;
                    margin-right: 4px;
                    animation: pulse-subtle 2s infinite;
                }
                
                .ai-label {
                    background: linear-gradient(135deg, #8b5cf6, #0ea5e9);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    font-weight: 700;
                }
                
                /* Tooltip for collapsed state */
                .tooltip {
                    position: absolute;
                    left: 60px;
                    background-color: var(--tooltip-bg);
                    border-radius: var(--border-radius);
                    color: var(--tooltip-text);
                    font-size: 0.875rem;
                    opacity: 0;
                    visibility: hidden;
                    transition: all var(--transition-normal) var(--easing-standard);
                    transform: translateX(-10px);
                    z-index: var(--z-popover);
                    box-shadow: var(--shadow);
                    backdrop-filter: blur(var(--blur-amount));
                    -webkit-backdrop-filter: blur(var(--blur-amount));
                    border: 1px solid var(--border-thin);
                    overflow: hidden;
                }
                
                .tooltip.visible {
                    opacity: 1;
                    visibility: visible;
                    transform: translateX(0);
                }
                
                .tooltip-content {
                    padding: 10px 14px;
                    position: relative;
                    z-index: 1;
                }
                
                .tooltip-content::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: radial-gradient(
                        circle at 30% 40%, 
                        rgba(var(--accent-${item.color}-rgb, 56, 189, 248), 0.08), 
                        transparent 70%
                    );
                    z-index: -1;
                }
                
                .tooltip-label {
                    font-weight: 600;
                    display: block;
                    white-space: nowrap;
                }
                
                .tooltip-description {
                    font-size: 0.75rem;
                    color: var(--text-tertiary);
                    display: block;
                    margin-top: 3px;
                    white-space: nowrap;
                    max-width: 200px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                
                .tooltip-badge {
                    display: inline-block;
                    padding: 2px 8px;
                    border-radius: 10px;
                    font-size: 0.7rem;
                    font-weight: 600;
                    margin-top: 6px;
                    color: white;
                }
                
                .tooltip-arrow {
                    position: absolute;
                    top: 50%;
                    left: -6px;
                    width: 12px;
                    height: 12px;
                    background-color: var(--tooltip-bg);
                    transform: translateY(-50%) rotate(45deg);
                    border-left: 1px solid var(--border-thin);
                    border-bottom: 1px solid var(--border-thin);
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
                        transform: scale(0.95);
                    }
                    50% {
                        opacity: 1;
                        transform: scale(1.05);
                    }
                    100% {
                        opacity: 0.6;
                        transform: scale(0.95);
                    }
                }
                
                @keyframes badge-pulse {
                    0% {
                        transform: scale(0.95);
                        box-shadow: 0 0 0 0 rgba(var(--accent-${item.color}-rgb, 56, 189, 248), 0.5);
                    }
                    70% {
                        transform: scale(1.0);
                        box-shadow: 0 0 0 6px rgba(var(--accent-${item.color}-rgb, 56, 189, 248), 0);
                    }
                    100% {
                        transform: scale(0.95);
                        box-shadow: 0 0 0 0 rgba(var(--accent-${item.color}-rgb, 56, 189, 248), 0);
                    }
                }
                
                @keyframes badge-pulse-active {
                    0% {
                        transform: scale(1.0);
                        box-shadow: 0 0 0 0 rgba(var(--accent-${item.color}-rgb, 56, 189, 248), 0.7);
                    }
                    70% {
                        transform: scale(1.05);
                        box-shadow: 0 0 0 8px rgba(var(--accent-${item.color}-rgb, 56, 189, 248), 0);
                    }
                    100% {
                        transform: scale(1.0);
                        box-shadow: 0 0 0 0 rgba(var(--accent-${item.color}-rgb, 56, 189, 248), 0);
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
                
                /* Media queries for responsive design */
                @media (max-width: 768px) {
                    .nav-item {
                        padding: ${isCollapsed ? '12px 10px' : '10px 12px'};
                    }
                    
                    .nav-description {
                        display: none;
                    }
                    
                    .tooltip-content {
                        padding: 8px 10px;
                    }
                }
            `}</style>
        </div>
    );
}