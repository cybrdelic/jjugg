'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Portal from './Portal';

interface SideDrawerProps {
  isVisible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  position?: 'right' | 'left';
  width?: string;
  closeOnOutsideClick?: boolean;
}

/**
 * A side drawer component that slides in from the side of the screen.
 * Rendered using a portal to ensure proper stacking context.
 */
const SideDrawer: React.FC<SideDrawerProps> = ({
  isVisible,
  onClose,
  children,
  position = 'right',
  width = '1200px',
  closeOnOutsideClick = true,
}) => {
  const [mounted, setMounted] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Handle animation effects
  useEffect(() => {
    if (isVisible) {
      setIsClosing(false);
      setTimeout(() => setMounted(true), 10);
    }
  }, [isVisible]);

  // Handle close with animation
  const handleClose = () => {
    setIsClosing(true);
    setMounted(false);
    setTimeout(() => {
      onClose();
    }, 300); // Match animation duration
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnOutsideClick && e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Portal zIndex={2000}>
      <div
        className={`side-drawer-container ${mounted ? 'visible' : ''} ${isClosing ? 'closing' : ''}`}
        onClick={handleBackdropClick}
      >
        <div
          className={`side-drawer ${position} ${mounted ? 'visible' : ''}`}
          style={{ width }}
          onClick={e => e.stopPropagation()}
        >
          <button
            className="close-btn"
            onClick={handleClose}
            aria-label="Close drawer"
          >
            <X size={20} />
          </button>
          <div className="drawer-content">
            {children}
          </div>
        </div>

        <style jsx>{`
          .side-drawer-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: var(--modal-backdrop, rgba(0, 0, 0, 0.5));
            /* z-index is now handled by Portal component */
            display: flex;
            visibility: hidden;
            opacity: 0;
            transition: all 0.3s var(--easing-standard);
            backdrop-filter: blur(var(--blur-amount, 5px));
          }

          .side-drawer-container.visible {
            visibility: visible;
            opacity: 1;
          }

          .side-drawer-container.closing {
            opacity: 0;
          }

          .side-drawer {
            position: relative;
            display: flex;
            flex-direction: column;
            background: var(--glass-bg);
            height: 100%;
            border-left: 1px solid var(--border-thin);
            box-shadow: var(--shadow-xl);
            transition: transform 0.3s var(--easing-standard);
            overflow: hidden;
          }

          .side-drawer.right {
            margin-left: auto;
            transform: translateX(100%);
          }

          .side-drawer.left {
            margin-right: auto;
            transform: translateX(-100%);
          }

          .side-drawer.visible {
            transform: translateX(0);
          }

          .close-btn {
            position: absolute;
            top: 16px;
            right: 16px;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: var(--glass-card-bg);
            border: 1px solid var(--border-thin);
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--text-tertiary);
            cursor: pointer;
            transition: all 0.2s var(--easing-standard);
            z-index: 10;
          }

          .close-btn:hover {
            background: var(--hover-bg);
            color: var(--text-primary);
            transform: scale(1.05);
          }

          .drawer-content {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
          }

          @media (max-width: 768px) {
            .side-drawer {
              width: 100% !important;
            }
          }
        `}</style>
      </div>
    </Portal>
  );
};

export default SideDrawer;
