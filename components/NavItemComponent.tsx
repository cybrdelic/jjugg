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
    const itemRef = useRef<HTMLDivElement>(null);

    // Handle click
    const handleClick = (e: React.MouseEvent) => {
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
                    font-weight: 500;
                    color: #1f2937;
                    display: block;
                    font-size: 12px;
                }

                .tooltip-badge {
                    display: inline-block;
                    margin-top: 4px;
                    padding: 2px 6px;
                    background-color: #ef4444;
                    color: white;
                    border-radius: 8px;
                    font-size: 10px;
                    font-weight: 500;
                }
            `}</style>
        </div>
    );

    // Main item content
    const itemContent = (
        <div
            ref={itemRef}
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={handleClick}
            onContextMenu={onContextMenu}
            role="menuitem"
            aria-label={label}
        >
            {/* Icon container */}
            <div className="icon-container">
                <div className={`icon ${isActive ? 'active' : ''}`}>
                    {icon}
                </div>
            </div>

            {/* Label and badge */}
            {!isCollapsed && (
                <div className="content">
                    <div className="label">{label}</div>
                    {badge && (
                        <div className="badge">
                            {getBadgeContent()}
                        </div>
                    )}
                </div>
            )}

            <style jsx>{`
                .nav-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: ${isCollapsed ? '8px' : '10px 12px'};
                    margin-bottom: 2px;
                    position: relative;
                    cursor: pointer;
                    border-radius: 6px;
                    transition: all 0.15s ease;
                    color: #6b7280;
                }

                .nav-item:hover {
                    background-color: #f3f4f6;
                    color: #374151;
                }

                .nav-item.active {
                    background-color: #dbeafe;
                    color: #1d4ed8;
                    font-weight: 500;
                    border-left: 3px solid #3b82f6;
                    padding-left: ${isCollapsed ? '8px' : '9px'};
                }

                .dark .nav-item {
                    color: #9ca3af;
                }

                .dark .nav-item:hover {
                    background-color: #374151;
                    color: #d1d5db;
                }

                .dark .nav-item.active {
                    background-color: #1e3a8a;
                    color: #93c5fd;
                    border-left-color: #3b82f6;
                }

                .icon-container {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: ${isCollapsed ? '100%' : '20px'};
                    height: 20px;
                    flex-shrink: 0;
                }

                .icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 20px;
                    height: 20px;
                    transition: color 0.15s ease;
                }

                .content {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex: 1;
                    min-width: 0;
                }

                .label {
                    font-size: 14px;
                    font-weight: 400;
                    flex: 1;
                    min-width: 0;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .nav-item.active .label {
                    font-weight: 500;
                }

                .badge {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 18px;
                    height: 18px;
                    padding: 0 6px;
                    background-color: #ef4444;
                    color: white;
                    border-radius: 9px;
                    font-size: 11px;
                    font-weight: 500;
                    line-height: 1;
                }

                .nav-item.active .badge {
                    background-color: #dc2626;
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
