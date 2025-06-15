// components/SidebarSection.tsx
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import NavItem from './NavItem';
import { NavItemType, SectionKey, SidebarSectionType } from './types';

interface SidebarSectionProps {
    section: SidebarSectionType;
    isCollapsed: boolean;
    currentSection: SectionKey;
    setCurrentSection: (section: SectionKey) => void;
    onContextMenu: (e: React.MouseEvent, item: NavItemType) => void;
}

export default function SidebarSection({
    section,
    isCollapsed,
    currentSection,
    setCurrentSection,
    onContextMenu,
}: SidebarSectionProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    // Toggle section expansion
    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className="section">
            {/* Section Header */}
            {!isCollapsed && (
                <div
                    className="section-header"
                    onClick={toggleExpand}
                    role="button"
                    aria-expanded={isExpanded}
                >
                    <div className="section-header-left">
                        {section.icon && <span className="section-icon">{section.icon}</span>}
                        <span className="section-title">{section.title}</span>
                    </div>
                    {section.isExpandable && (
                        <ChevronDown
                            size={14}
                            className={`expand-icon ${isExpanded ? 'expanded' : ''}`}
                        />
                    )}
                </div>
            )}

            {/* Section Content */}
            {(isExpanded || isCollapsed) && (
                <div className="section-content">
                    {section.items.map((item) => (
                        <NavItem
                            key={item.id}
                            item={item}
                            currentSection={currentSection}
                            onNavigate={setCurrentSection}
                            isCollapsed={isCollapsed}
                            onContextMenu={onContextMenu}
                        />
                    ))}
                </div>
            )}

            <style jsx>{`
                .section {
                    margin-bottom: 16px;
                }

                .section-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 8px 0;
                    cursor: pointer;
                    user-select: none;
                    border-radius: 4px;
                    transition: background-color 0.15s ease;
                }

                .section-header:hover {
                    background-color: #f9fafb;
                }

                .dark .section-header:hover {
                    background-color: #374151;
                }

                .section-header-left {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex: 1;
                }

                .section-icon {
                    display: flex;
                    align-items: center;
                    color: #6b7280;
                }

                .dark .section-icon {
                    color: #9ca3af;
                }

                .section-title {
                    font-size: 12px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: #6b7280;
                }

                .dark .section-title {
                    color: #9ca3af;
                }

                .expand-icon {
                    color: #9ca3af;
                    transition: transform 0.2s ease;
                }

                .expand-icon.expanded {
                    transform: rotate(180deg);
                }

                .section-content {
                    margin-left: ${isCollapsed ? '0' : '0'};
                }
            `}</style>
        </div>
    );
}
