'use client';

import React, { useState, useEffect, useRef } from 'react';
import Portal from './Portal';

interface Position {
  top: number;
  left: number;
  transformOrigin: string;
}

type DropdownPlacement = 'bottom-start' | 'bottom-end' | 'bottom-center' | 'top-start' | 'top-end' | 'top-center';

interface DropdownProps {
  trigger: React.ReactElement<{
    onClick?: (e: React.MouseEvent) => void;
    ref?: React.Ref<HTMLElement>;
  }>;
  children: React.ReactNode;
  placement?: DropdownPlacement;
  isOpen?: boolean;
  onClose?: () => void;
  closeOnOutsideClick?: boolean;
  width?: string | number;
  className?: string;
}

/**
 * A dropdown component that shows content when a trigger is clicked.
 * Uses a portal to render the dropdown outside of the normal document flow.
 */
export default function Dropdown({
  trigger,
  children,
  placement = 'bottom-start',
  isOpen: controlledIsOpen,
  onClose,
  closeOnOutsideClick = true,
  width = 'auto',
  className = '',
}: DropdownProps) {
  const [isOpenState, setIsOpenState] = useState(false);
  const [position, setPosition] = useState<Position>({
    top: 0,
    left: 0,
    transformOrigin: 'top left'
  });

  // Use controlled or uncontrolled state
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : isOpenState;

  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  // Calculate dropdown position based on trigger element
  const updatePosition = () => {
    if (!triggerRef.current || !dropdownRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const dropdownRect = dropdownRef.current.getBoundingClientRect();

    let top = 0;
    let left = 0;
    let transformOrigin = '';

    // Calculate space above and below
    const spaceBelow = window.innerHeight - triggerRect.bottom;
    const spaceAbove = triggerRect.top;

    const placementBase = spaceBelow < dropdownRect.height && spaceAbove > spaceBelow
      ? 'top'
      : 'bottom';

    // Calculate horizontal position based on placement
    if (placement.endsWith('start') || placementBase === 'top' && placement.endsWith('start')) {
      left = triggerRect.left + window.scrollX;
      transformOrigin = 'top left';
    } else if (placement.endsWith('end') || placementBase === 'top' && placement.endsWith('end')) {
      left = triggerRect.right - dropdownRect.width + window.scrollX;
      transformOrigin = 'top right';
    } else { // center
      left = triggerRect.left + (triggerRect.width / 2) - (dropdownRect.width / 2) + window.scrollX;
      transformOrigin = 'top center';
    }

    // Calculate vertical position
    if (placementBase === 'bottom') {
      top = triggerRect.bottom + window.scrollY;
      transformOrigin = transformOrigin.replace('top', 'top');
    } else { // top
      top = triggerRect.top - dropdownRect.height + window.scrollY;
      transformOrigin = transformOrigin.replace('top', 'bottom');
    }

    // Make sure dropdown stays within viewport
    const viewportWidth = window.innerWidth;

    // Adjust horizontal position if needed
    if (left < 10) {
      left = 10;
    } else if (left + dropdownRect.width > viewportWidth - 10) {
      left = viewportWidth - dropdownRect.width - 10;
    }

    setPosition({ top, left, transformOrigin });
  };

  const toggle = () => {
    if (controlledIsOpen === undefined) {
      setIsOpenState(prev => !prev);
    }
  };

  const close = () => {
    if (controlledIsOpen === undefined) {
      setIsOpenState(false);
    }
    if (onClose) {
      onClose();
    }
  };

  // Handle outside clicks
  useEffect(() => {
    if (isOpen && closeOnOutsideClick) {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node) &&
          triggerRef.current &&
          !triggerRef.current.contains(event.target as Node)
        ) {
          close();
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen, closeOnOutsideClick]);

  // Update position when dropdown is opened or window is resized
  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      setTimeout(updatePosition, 0);

      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition);

      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition);
      };
    } else {
      setMounted(false);
    }
  }, [isOpen]);

  // Clone the trigger element to add event handlers and ref
  const triggerElement = React.cloneElement(trigger, {
    onClick: (e: React.MouseEvent) => {
      e.stopPropagation();
      toggle();
      if (trigger.props && (trigger.props as any).onClick) {
        (trigger.props as any).onClick(e);
      }
    },
    ref: triggerRef,
  } as any);

  return (
    <>
      {triggerElement}

      {isOpen && (
        <Portal>
          <div
            ref={dropdownRef}
            className={`dropdown ${className} ${mounted ? 'visible' : ''}`}
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
              width: typeof width === 'number' ? `${width}px` : width,
              transformOrigin: position.transformOrigin
            }}
            onClick={e => e.stopPropagation()}
          >
            {children}

            <style jsx>{`
              .dropdown {
                position: fixed;
                z-index: 1000;
                background: var(--glass-bg);
                border-radius: var(--border-radius);
                border: 1px solid var(--border-thin);
                box-shadow: var(--shadow-lg);
                opacity: 0;
                transform: scale(0.95);
                transition: opacity 0.1s ease, transform 0.1s ease;
                backdrop-filter: blur(var(--blur-amount));
                -webkit-backdrop-filter: blur(var(--blur-amount));
                max-height: 80vh;
                overflow-y: auto;
              }

              .dropdown.visible {
                opacity: 1;
                transform: scale(1);
              }
            `}</style>
          </div>
        </Portal>
      )}
    </>
  );
}
