// components/ResizeHandle.tsx
import { useState, useEffect, useRef } from 'react';
import { GripVertical } from 'lucide-react';

interface ResizeHandleProps {
    setExpandedWidth: (width: number) => void;
    width: number;
    minWidth?: number;
    maxWidth?: number;
    showTooltip?: boolean;
    showActiveIndicator?: boolean;
    variant?: 'default' | 'minimal' | 'accent';
}

export default function ResizeHandle({ 
    setExpandedWidth, 
    width, 
    minWidth = 180,
    maxWidth = 400,
    showTooltip = true,
    showActiveIndicator = true,
    variant = 'default'
}: ResizeHandleProps) {
    const [isResizing, setIsResizing] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const initialXRef = useRef(0);
    const initialWidthRef = useRef(0);
    const handleRef = useRef<HTMLDivElement>(null);
    const [width1, setWidth1] = useState(-1);
    const [width2, setWidth2] = useState(-2);
    const [tooltipVisible, setTooltipVisible] = useState(false);
    
    // Set tooltip visibility with delay on hover for better UX
    useEffect(() => {
        if (isHovered || isResizing) {
            const timer = setTimeout(() => setTooltipVisible(true), 400);
            return () => clearTimeout(timer);
        } else {
            setTooltipVisible(false);
        }
    }, [isHovered, isResizing]);

    // Handle resizing logic
    useEffect(() => {
        if (!isResizing) return;
        
        // Change pulse animation values during resize
        const pulseTimer = setInterval(() => {
            setWidth1(Math.floor(width - 2 + Math.random() * 4));
            setWidth2(Math.floor(width - 1 + Math.random() * 2));
        }, 300);
        
        const handleMouseMove = (e: MouseEvent) => {
            const deltaX = e.clientX - initialXRef.current;
            const newWidth = Math.max(minWidth, Math.min(maxWidth, initialWidthRef.current + deltaX));
            setExpandedWidth(newWidth);
            
            // For visual feedback during resize
            setWidth1(newWidth - 2);
            setWidth2(newWidth - 1);
            
            // Add a subtle resize cursor to the entire document during resize
            document.body.style.cursor = 'ew-resize';
        };
        
        const handleMouseUp = () => {
            setIsResizing(false);
            document.body.style.cursor = '';
        };
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            clearInterval(pulseTimer);
            document.body.style.cursor = '';
        };
    }, [isResizing, setExpandedWidth, minWidth, maxWidth, width]);

    const startResizing = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
        initialXRef.current = e.clientX;
        initialWidthRef.current = width;
    };
    
    // Determine content for active indicators
    const getActiveIndicatorContent = () => {
        if (variant === 'accent') {
            return (
                <>
                    <div className={`active-indicator top ${isResizing ? 'resizing' : ''}`} />
                    <div className={`active-indicator bottom ${isResizing ? 'resizing' : ''}`} />
                </>
            );
        } 
        return null;
    };

    return (
        <div 
            ref={handleRef}
            className={`resize-handle ${variant} ${isResizing ? 'resizing' : ''} ${isHovered ? 'hovered' : ''}`} 
            onMouseDown={startResizing} 
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            role="separator" 
            aria-label="Resize sidebar"
            aria-valuemin={minWidth}
            aria-valuemax={maxWidth}
            aria-valuenow={width}
        >
            {/* Grip icon for better visibility */}
            <div className="grip-icon-container">
                <GripVertical size={12} className="grip-icon" />
            </div>
            
            {/* Active resize visual indicator */}
            {showActiveIndicator && getActiveIndicatorContent()}
            
            {/* Width indicators for user feedback */}
            {isResizing && (
                <div className="width-indicators">
                    <div className="width-value" style={{ width: width1 }}>
                        <span>{width}px</span>
                    </div>
                </div>
            )}
            
            {/* Tooltip for user guidance */}
            {showTooltip && tooltipVisible && !isResizing && (
                <div className="resize-tooltip">
                    Drag to resize sidebar
                </div>
            )}
            
            <style jsx>{`
                .resize-handle {
                    position: absolute;
                    top: 0;
                    right: -2px;
                    width: 5px;
                    height: 100%;
                    cursor: ew-resize;
                    z-index: 10;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background-color var(--transition-normal) var(--easing-standard);
                }
                
                /* Default variant */
                .resize-handle.default {
                    background-color: transparent;
                }
                
                .resize-handle.default:hover,
                .resize-handle.default.resizing {
                    background-color: rgba(var(--accent-primary-rgb, 59, 130, 246), 0.1);
                }
                
                /* Minimal variant */
                .resize-handle.minimal {
                    background-color: transparent;
                    width: 4px;
                }
                
                /* Accent variant with nicer visuals */
                .resize-handle.accent {
                    background-color: transparent;
                    width: 4px;
                }
                
                .resize-handle.accent::before {
                    content: '';
                    position: absolute;
                    left: 1px;
                    top: 0;
                    bottom: 0;
                    width: 2px;
                    background: linear-gradient(
                        to bottom,
                        transparent 5%,
                        var(--border-thin) 10%,
                        var(--border-thin) 90%,
                        transparent 95%
                    );
                    opacity: 0.3;
                    transition: opacity var(--transition-normal) var(--easing-standard);
                }
                
                .resize-handle.accent:hover::before,
                .resize-handle.accent.resizing::before {
                    opacity: 0.8;
                    background: linear-gradient(
                        to bottom,
                        transparent 5%,
                        var(--accent-primary) 10%,
                        var(--accent-primary) 90%,
                        transparent 95%
                    );
                }
                
                /* Grip icon styling */
                .grip-icon-container {
                    position: absolute;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 20px;
                    height: 40px;
                    border-radius: 0 4px 4px 0;
                    opacity: 0;
                    transform: translateX(-10px);
                    transition: all var(--transition-normal) var(--easing-standard);
                    pointer-events: none;
                    background-color: var(--glass-bg);
                    border: 1px solid var(--border-thin);
                    border-left: none;
                    overflow: hidden;
                }
                
                .resize-handle:hover .grip-icon-container,
                .resize-handle.resizing .grip-icon-container {
                    opacity: 1;
                    transform: translateX(0);
                }
                
                .grip-icon {
                    color: var(--text-tertiary);
                    transition: all var(--transition-normal) var(--easing-standard);
                }
                
                .resize-handle.resizing .grip-icon {
                    color: var(--accent-primary);
                    animation: pulse 2s infinite;
                }
                
                /* Active resize indicators */
                .active-indicator {
                    position: absolute;
                    left: 1px;
                    width: 2px;
                    height: 40px;
                    background: var(--accent-primary);
                    border-radius: 1px;
                    opacity: 0;
                    transition: opacity var(--transition-normal) var(--easing-standard),
                                transform var(--transition-normal) var(--easing-standard);
                }
                
                .active-indicator.top {
                    top: 80px;
                    transform: scaleY(0.4) translateY(-20px);
                }
                
                .active-indicator.bottom {
                    bottom: 80px;
                    transform: scaleY(0.4) translateY(20px);
                }
                
                .resize-handle:hover .active-indicator {
                    opacity: 0.6;
                    transform: scaleY(0.7) translateY(0);
                }
                
                .resize-handle.resizing .active-indicator {
                    opacity: 0.8;
                    transform: scaleY(1) translateY(0);
                }
                
                .resize-handle.resizing .active-indicator.top {
                    animation: pulse-slide-vertical 3s infinite alternate;
                    animation-delay: 0.2s;
                }
                
                .resize-handle.resizing .active-indicator.bottom {
                    animation: pulse-slide-vertical 3s infinite alternate-reverse;
                    animation-delay: 0.5s;
                }
                
                /* Width indicators for feedback during resize */
                .width-indicators {
                    position: absolute;
                    top: 40%;
                    right: 10px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    pointer-events: none;
                }
                
                .width-value {
                    background: var(--glass-bg);
                    border: 1px solid var(--accent-primary);
                    border-radius: var(--border-radius-md);
                    padding: 4px 8px;
                    font-size: 0.75rem;
                    color: var(--text-primary);
                    box-shadow: var(--shadow-sharp);
                    animation: pulse-opacity 2s infinite;
                    backdrop-filter: blur(var(--blur-amount));
                    -webkit-backdrop-filter: blur(var(--blur-amount));
                }
                
                .dark .width-value {
                    box-shadow: var(--shadow-sharp), 0 0 8px rgba(var(--accent-primary-rgb, 59, 130, 246), 0.4);
                }
                
                /* Tooltip */
                .resize-tooltip {
                    position: absolute;
                    right: 12px;
                    background-color: var(--tooltip-bg);
                    color: var(--tooltip-text);
                    padding: 6px 10px;
                    border-radius: var(--border-radius-md);
                    font-size: 0.75rem;
                    white-space: nowrap;
                    pointer-events: none;
                    opacity: 0;
                    transform: translateX(-10px);
                    animation: fade-in 0.3s forwards;
                    box-shadow: var(--shadow);
                    backdrop-filter: blur(var(--blur-amount));
                    -webkit-backdrop-filter: blur(var(--blur-amount));
                    border: 1px solid var(--border-thin);
                    z-index: 100;
                }
                
                .resize-tooltip::before {
                    content: '';
                    position: absolute;
                    top: calc(50% - 4px);
                    left: -8px;
                    border-top: 4px solid transparent;
                    border-bottom: 4px solid transparent;
                    border-right: 8px solid var(--tooltip-bg);
                    border-left: 0;
                }
                
                /* Animations */
                @keyframes pulse {
                    0%, 100% { opacity: 0.7; }
                    50% { opacity: 1; }
                }
                
                @keyframes pulse-opacity {
                    0%, 100% { opacity: 0.9; }
                    50% { opacity: 0.6; }
                }
                
                @keyframes pulse-slide-vertical {
                    0% { transform: scaleY(1) translateY(0); }
                    100% { transform: scaleY(1) translateY(40px); }
                }
                
                @keyframes fade-in {
                    0% { opacity: 0; transform: translateX(-10px); }
                    100% { opacity: 1; transform: translateX(0); }
                }
                
                /* Responsive adjustments */
                @media (max-width: 768px) {
                    .resize-handle {
                        display: none;
                    }
                }
            `}</style>
        </div>
    );
}