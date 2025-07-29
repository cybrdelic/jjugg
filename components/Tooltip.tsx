'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Portal from './Portal';

interface Position {
  top: number;
  left: number;
}

type TooltipPlacement = 'top' | 'right' | 'bottom' | 'left';

interface TooltipProps {
  children: React.ReactElement;
  content: React.ReactNode;
  placement?: TooltipPlacement;
  delay?: number; // delay in ms before showing
  offset?: number; // distance from trigger in px
  className?: string;
}

// Define event handlers that we'll add to the child component
interface TriggerEvents {
  onMouseEnter: (e: React.MouseEvent) => void;
  onMouseLeave: (e: React.MouseEvent) => void;
  ref: React.RefObject<HTMLElement>;
}

/**
 * A tooltip component that shows additional information when hovering over an element.
 * Uses a portal to render the tooltip outside of the normal document flow.
 */
export default function Tooltip({
  children,
  content,
  placement = 'top',
  delay = 300,
  offset = 10,
  className = '',
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<Position>({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate tooltip position based on trigger element
  const updatePosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();

    let top = 0;
    let left = 0;

    switch (placement) {
      case 'top':
        top = triggerRect.top - tooltipRect.height - offset + window.scrollY;
        left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2) + window.scrollX;
        break;
      case 'right':
        top = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2) + window.scrollY;
        left = triggerRect.right + offset + window.scrollX;
        break;
      case 'bottom':
        top = triggerRect.bottom + offset + window.scrollY;
        left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2) + window.scrollX;
        break;
      case 'left':
        top = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2) + window.scrollY;
        left = triggerRect.left - tooltipRect.width - offset + window.scrollX;
        break;
    }

    // Make sure tooltip stays within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Adjust horizontal position
    if (left < 10) left = 10;
    if (left + tooltipRect.width > viewportWidth - 10) {
      left = viewportWidth - tooltipRect.width - 10;
    }

    // Adjust vertical position
    if (top < 10) top = 10;
    if (top + tooltipRect.height > viewportHeight - 10) {
      top = viewportHeight - tooltipRect.height - 10;
    }

    setPosition({ top, left });
  }, [placement, offset]);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      // Need to wait for the tooltip to render before calculating position
      // Use requestAnimationFrame for better timing
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          updatePosition();
        });
      });
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  // Update position when window is resized
  useEffect(() => {
    if (isVisible) {
      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition);

      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition);
      };
    }
  }, [isVisible, updatePosition]);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Clone the child element to add event handlers
  const triggerElement = React.cloneElement(children, {
    onMouseEnter: (e: React.MouseEvent) => {
      handleMouseEnter();
      // Call original handler if it exists
      const originalHandler = (children.props as any)?.onMouseEnter;
      if (originalHandler) {
        originalHandler(e);
      }
    },
    onMouseLeave: (e: React.MouseEvent) => {
      handleMouseLeave();
      // Call original handler if it exists
      const originalHandler = (children.props as any)?.onMouseLeave;
      if (originalHandler) {
        originalHandler(e);
      }
    },
    ref: (el: HTMLElement) => {
      triggerRef.current = el;
      // Handle original ref if it exists
      const originalRef = (children as any).ref;
      if (typeof originalRef === 'function') {
        originalRef(el);
      } else if (originalRef && typeof originalRef === 'object') {
        originalRef.current = el;
      }
    },
  } as any);

  return (
    <>
      {triggerElement}

      {isVisible && (
        <Portal>
          <div
            ref={tooltipRef}
            className={`tooltip ${className} ${placement}`}
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
              visibility: position.top === 0 && position.left === 0 ? 'hidden' : 'visible'
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="tooltip-content">
              {content}
            </div>
            <div className="tooltip-arrow" />

            <style jsx>{`
              .tooltip {
                position: fixed;
                z-index: 1000;
                max-width: 300px;
                pointer-events: none; /* Don't block mouse events by default */
                animation: fade-in 0.2s var(--easing-standard);
              }

              /* Allow mouse events for persistent tooltips if needed */
              .tooltip.interactive {
                pointer-events: auto;
              }

              .tooltip-content {
                background: var(--glass-bg, var(--surface));
                color: var(--text-primary);
                padding: 8px 12px;
                border-radius: var(--border-radius, 8px);
                border: 1px solid var(--border-thin, var(--border));
                font-size: 12px;
                font-weight: 500;
                line-height: 1.4;
                box-shadow: var(--shadow-md, var(--shadow));
                backdrop-filter: blur(var(--blur-amount, 20px));
                -webkit-backdrop-filter: blur(var(--blur-amount, 20px));
                white-space: nowrap;
                max-width: 250px;
                word-wrap: break-word;
              }


              }

              .tooltip.top .tooltip-arrow {
                bottom: -5px;
                left: 50%;
                margin-left: -5px;
                border-top: none;
                border-left: none;
              }

              .tooltip.right .tooltip-arrow {
                left: -5px;
                top: 50%;
                margin-top: -5px;
                border-right: none;
                border-bottom: none;
              }

              .tooltip.bottom .tooltip-arrow {
                top: -5px;
                left: 50%;
                margin-left: -5px;
                border-bottom: none;
                border-right: none;
              }

              .tooltip.left .tooltip-arrow {
                right: -5px;
                top: 50%;
                margin-top: -5px;
                border-left: none;
                border-top: none;
              }

              @keyframes fade-in {
                from {
                  opacity: 0;
                  transform: scale(0.95);
                }
                to {
                  opacity: 1;
                  transform: scale(1);
                }
              }
            `}</style>
          </div>
        </Portal>
      )}
    </>
  );
}
