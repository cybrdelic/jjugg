'use client';

import { LucideIcon } from 'lucide-react';
import { NavItem, SectionKey } from './types';

interface NavItemComponentProps {
    item: NavItem;
    currentSection: SectionKey;
    isCollapsed: boolean;
    onSectionChange: (key: SectionKey) => void;
}

const NavItemComponent: React.FC<NavItemComponentProps> = ({
    item,
    currentSection,
    isCollapsed,
    onSectionChange,
}) => {
    const isActive = currentSection === item.key;

    return (
        <li className={isCollapsed ? 'tooltip relative' : ''}>
            <button
                onClick={() => onSectionChange(item.key)}
                className={`w-full flex items-center p-2.5 rounded-xl transition-all duration-200 group ${isActive ? 'bg-active text-accent shadow-sm' : 'hover:bg-hover'
                    }`}
                aria-label={item.label}
            >
                <div
                    className={`${isActive
                        ? 'bg-accent bg-opacity-10 text-accent'
                        : 'text-secondary group-hover:text-primary bg-transparent'
                        } rounded-lg p-2 transition-colors duration-200`}
                >
                    <item.icon
                        size={20}
                        className="transition-transform duration-200 group-hover:scale-110"
                    />
                </div>

                {!isCollapsed && (
                    <div className="ml-3 flex-1 text-left overflow-hidden">
                        <div className="flex justify-between items-center">
                            <span className={`font-medium ${isActive ? 'text-primary' : 'text-primary'}`}>
                                {item.label}
                            </span>
                            {item.badge && (
                                <span
                                    className={`px-1.5 py-0.5 rounded-full text-xs font-medium text-white ${item.badgeColor || 'bg-accent'
                                        }`}
                                >
                                    {item.badge}
                                </span>
                            )}
                        </div>
                        {item.description && (
                            <span className="text-xs text-secondary block mt-0.5 truncate">
                                {item.description}
                            </span>
                        )}
                    </div>
                )}

                {isCollapsed && item.badge && (
                    <span
                        className={`absolute -right-1 top-0 w-4 h-4 rounded-full text-xs font-medium text-white flex items-center justify-center ${item.badgeColor || 'bg-accent'
                            }`}
                    >
                        {item.badge}
                    </span>
                )}

                {isActive && !isCollapsed && (
                    <div className="w-1 h-12 bg-accent rounded-full absolute -right-0.5" />
                )}
            </button>

            {/* Tooltip for collapsed state */}
            {isCollapsed && (
                <span className="tooltiptext absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white text-xs rounded-md p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    {item.label}
                    {item.description && <p className="text-xs mt-1">{item.description}</p>}
                </span>
            )}
        </li>
    );
};

export default NavItemComponent;
