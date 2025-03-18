// components/SidebarSection.tsx
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus, MoreHorizontal, Sparkles } from 'lucide-react';
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
    const [isHovered, setIsHovered] = useState(false);
    const [showAiTip, setShowAiTip] = useState(false);
    const sectionRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [contentHeight, setContentHeight] = useState<number | 'auto'>('auto');
    
    // Handle auto-sizing of section content for smooth animations
    useEffect(() => {
        if (contentRef.current && isExpanded) {
            setContentHeight(contentRef.current.scrollHeight);
        } else {
            setContentHeight(0);
        }
    }, [isExpanded, section.items]);
    
    // Reset height to auto after animation completes
    useEffect(() => {
        if (isExpanded && typeof contentHeight === 'number') {
            const timer = setTimeout(() => {
                setContentHeight('auto');
            }, 300); // Match transition duration
            return () => clearTimeout(timer);
        }
    }, [isExpanded, contentHeight]);
    
    // Toggle section expansion
    const toggleExpand = () => {
        if (contentRef.current && isExpanded) {
            // Set fixed height before collapsing for smooth animation
            setContentHeight(contentRef.current.scrollHeight);
            setTimeout(() => {
                setIsExpanded(false);
            }, 10);
        } else {
            setIsExpanded(true);
        }
    };
    
    // Count items with AI content
    const aiItemsCount = section.items.filter(item => item.aiGeneratedContent).length;
    const hasAiContent = section.isAiGenerated || aiItemsCount > 0;
    
    // Determine if this section has active items
    const hasActiveItem = section.items.some(item => currentSection === item.id);
    
    return (
        <div 
            ref={sectionRef} 
            className={`section ${isHovered ? 'hovered' : ''} ${hasActiveItem ? 'has-active-item' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => {setIsHovered(false); setShowAiTip(false);}}
        >
            {/* Section Header */}
            {!isCollapsed && (
                <div 
                    className="section-header" 
                    role="button"
                    aria-expanded={isExpanded}
                >
                    <div className="section-header-left" onClick={toggleExpand}>
                        {section.icon && <span className="section-icon">{section.icon}</span>}
                        <span className="section-title">{section.title}</span>
                        
                        {/* AI indicator for AI-generated sections */}
                        {section.isAiGenerated && (
                            <div 
                                className="ai-section-indicator"
                                onMouseEnter={() => setShowAiTip(true)}
                                onMouseLeave={() => setShowAiTip(false)}
                            >
                                <Sparkles size={14} className="sparkle-icon" />
                                {showAiTip && (
                                    <div className="ai-tip">
                                        AI-generated section
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {/* Badge for showing AI-generated item count */}
                        {!section.isAiGenerated && aiItemsCount > 0 && (
                            <div className="ai-items-count" onMouseEnter={() => setShowAiTip(true)}>
                                {aiItemsCount}
                                {showAiTip && (
                                    <div className="ai-tip">
                                        {aiItemsCount} AI-generated item{aiItemsCount > 1 ? 's' : ''}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    
                    <div className="section-controls">
                        {/* Add new item button */}
                        <button 
                            className="section-control-btn add-btn"
                            aria-label="Add new item to section"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Plus size={16} />
                        </button>
                        
                        {/* More options button */}
                        <button 
                            className="section-control-btn more-btn"
                            aria-label="More section options"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <MoreHorizontal size={16} />
                        </button>
                        
                        {/* Expand/collapse button */}
                        <button 
                            className="section-control-btn chevron-btn"
                            aria-label={isExpanded ? "Collapse section" : "Expand section"}
                            onClick={toggleExpand}
                        >
                            <ChevronDown size={18} className={`chevron ${isExpanded ? 'expanded' : ''}`} />
                        </button>
                    </div>
                </div>
            )}
            
            {/* Section Content */}
            <div 
                ref={contentRef}
                className={`section-items ${!isExpanded ? 'collapsed' : ''}`}
                style={{ height: isCollapsed ? 'auto' : contentHeight }}
                aria-hidden={!isExpanded && !isCollapsed}
            >
                {section.items.map((item) => (
                    <NavItem
                        key={item.id}
                        item={item}
                        isCollapsed={isCollapsed}
                        isActive={currentSection === item.id}
                        onClick={() => setCurrentSection(item.id)}
                        onContextMenu={(e) => onContextMenu(e, item)}
                    />
                ))}
                
                {/* Empty section placeholder */}
                {section.items.length === 0 && !isCollapsed && (
                    <div className="empty-section">
                        <p className="empty-text">No items in this section</p>
                        <button className="add-item-btn">
                            <Plus size={16} />
                            <span>Add Item</span>
                        </button>
                    </div>
                )}
                
                {/* Add new AI item button */}
                {!isCollapsed && !section.isAiGenerated && section.items.length > 0 && (
                    <div className="add-ai-item">
                        <button className="add-ai-item-btn">
                            <Sparkles size={14} className="ai-icon" />
                            <span>Generate new suggestions</span>
                        </button>
                    </div>
                )}
            </div>
            
            <style jsx>{`
                .section {
                    margin-bottom: 16px;
                    position: relative;
                    transition: all var(--transition-normal) var(--easing-standard);
                    border-radius: var(--border-radius);
                }
                
                .section.hovered {
                    background-color: rgba(var(--accent-primary-rgb, 56, 189, 248), 0.03);
                }
                
                .section.has-active-item {
                    /* Subtle highlight for sections with active items */
                    background-color: rgba(var(--accent-primary-rgb, 56, 189, 248), 0.02);
                }
                
                /* Section Header Styles */
                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px 12px;
                    color: var(--text-secondary);
                    cursor: pointer;
                    user-select: none;
                    border-radius: var(--border-radius);
                    margin-bottom: 2px;
                    transition: all var(--transition-normal) var(--easing-standard);
                }
                
                .section-header:hover {
                    background-color: var(--hover-bg);
                }
                
                .section-header-left {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex: 1;
                    min-width: 0;
                }
                
                .section-title {
                    font-weight: 600;
                    font-size: 0.85rem;
                    letter-spacing: 0.01em;
                    text-transform: uppercase;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                
                .section-icon {
                    color: var(--text-tertiary);
                    display: flex;
                    align-items: center;
                }
                
                /* Section Controls */
                .section-controls {
                    display: flex;
                    align-items: center;
                    gap: 2px;
                    opacity: 0;
                    transition: opacity var(--transition-fast) var(--easing-standard);
                }
                
                .section-header:hover .section-controls {
                    opacity: 1;
                }
                
                .section-control-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--text-tertiary);
                    background: none;
                    border: none;
                    width: 26px;
                    height: 26px;
                    border-radius: var(--border-radius-sm);
                    cursor: pointer;
                    transition: all var(--transition-fast) var(--easing-standard);
                }
                
                .section-control-btn:hover {
                    background-color: var(--hover-bg);
                    color: var(--text-primary);
                    transform: translateY(-1px);
                }
                
                .section-control-btn:active {
                    transform: translateY(0);
                }
                
                .chevron {
                    transition: transform var(--transition-normal) var(--easing-standard);
                }
                
                .chevron.expanded {
                    transform: rotate(180deg);
                }
                
                /* AI section indicator */
                .ai-section-indicator {
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-left: 4px;
                    cursor: help;
                }
                
                .sparkle-icon {
                    color: var(--accent-primary);
                    filter: drop-shadow(0 0 2px rgba(var(--accent-primary-rgb, 56, 189, 248), 0.3));
                    animation: pulse-glow 2s infinite;
                }
                
                .ai-items-count {
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(14, 165, 233, 0.1));
                    border: 1px solid rgba(139, 92, 246, 0.15);
                    color: var(--text-primary);
                    font-size: 0.7rem;
                    font-weight: 600;
                    padding: 1px 5px;
                    border-radius: 10px;
                    margin-left: 6px;
                    cursor: help;
                }
                
                .ai-tip {
                    position: absolute;
                    top: calc(100% + 5px);
                    left: 50%;
                    transform: translateX(-50%);
                    background-color: var(--tooltip-bg);
                    padding: 6px 12px;
                    border-radius: var(--border-radius-sm);
                    font-size: 0.75rem;
                    white-space: nowrap;
                    z-index: var(--z-popover);
                    box-shadow: var(--shadow);
                    backdrop-filter: blur(var(--blur-amount));
                    -webkit-backdrop-filter: blur(var(--blur-amount));
                    border: 1px solid var(--border-thin);
                    animation: fade-in 0.2s var(--easing-standard);
                }
                
                /* Section Content Styles */
                .section-items {
                    overflow: hidden;
                    transition: height var(--transition-normal) var(--easing-decelerate);
                    will-change: height;
                    padding-left: ${isCollapsed ? '0' : '4px'};
                    position: relative;
                }
                
                .section-items::after {
                    content: '';
                    position: absolute;
                    left: 4px;
                    top: 0;
                    bottom: 0;
                    width: 1px;
                    background: linear-gradient(
                        to bottom,
                        transparent,
                        var(--border-divider) 10%,
                        var(--border-divider) 90%,
                        transparent
                    );
                    opacity: 0.5;
                    display: ${isCollapsed ? 'none' : 'block'};
                }
                
                /* Empty section styles */
                .empty-section {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 16px;
                    background-color: rgba(var(--accent-primary-rgb, 56, 189, 248), 0.03);
                    border: 1px dashed var(--border-divider);
                    border-radius: var(--border-radius);
                    margin: 8px 0;
                }
                
                .empty-text {
                    color: var(--text-tertiary);
                    font-size: 0.85rem;
                    margin-bottom: 12px;
                }
                
                .add-item-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    background-color: var(--hover-bg);
                    color: var(--text-primary);
                    border: 1px solid var(--border-thin);
                    border-radius: var(--border-radius-sm);
                    padding: 6px 12px;
                    font-size: 0.8rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all var(--transition-normal) var(--easing-standard);
                }
                
                .add-item-btn:hover {
                    background-color: var(--glass-bg);
                    transform: translateY(-1px);
                    box-shadow: var(--shadow-sharp);
                }
                
                /* Add AI item button */
                .add-ai-item {
                    display: flex;
                    justify-content: center;
                    padding: 8px 0;
                }
                
                .add-ai-item-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(14, 165, 233, 0.1));
                    border: 1px solid rgba(139, 92, 246, 0.15);
                    color: var(--text-primary);
                    border-radius: var(--border-radius-sm);
                    padding: 5px 12px;
                    font-size: 0.8rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all var(--transition-normal) var(--easing-standard);
                }
                
                .add-ai-item-btn:hover {
                    background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(14, 165, 233, 0.15));
                    transform: translateY(-1px);
                    box-shadow: 0 0 10px rgba(139, 92, 246, 0.1);
                }
                
                .ai-icon {
                    color: var(--accent-purple);
                }
                
                /* Animations */
                @keyframes pulse-glow {
                    0%, 100% {
                        opacity: 0.8;
                        filter: drop-shadow(0 0 2px rgba(var(--accent-primary-rgb, 56, 189, 248), 0.3));
                    }
                    50% {
                        opacity: 1;
                        filter: drop-shadow(0 0 4px rgba(var(--accent-primary-rgb, 56, 189, 248), 0.5));
                    }
                }
                
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(5px) translateX(-50%);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) translateX(-50%);
                    }
                }
                
                /* Media queries */
                @media (max-width: 768px) {
                    .section-header {
                        padding: 8px 10px;
                    }
                    
                    .section-title {
                        font-size: 0.8rem;
                    }
                    
                    .section-controls {
                        opacity: 1;
                    }
                    
                    .section-control-btn {
                        width: 24px;
                        height: 24px;
                    }
                }
            `}</style>
        </div>
    );
}