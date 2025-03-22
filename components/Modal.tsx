// components/Modal.tsx
'use client';

import React from 'react';
import Portal from './Portal';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose?: () => void; // Changed to optional
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: string;
  closeOnOutsideClick?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  width = '500px',
  closeOnOutsideClick = true,
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    // Added check for onClose before calling it
    if (closeOnOutsideClick && e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  return (
    <Portal>
      <div className="modal-overlay" onClick={handleOverlayClick}>
        <div className="modal-content" style={{ maxWidth: width }} onClick={e => e.stopPropagation()}>
          {(title || onClose) && (
            <div className="modal-header">
              {title && <h2>{title}</h2>}
              {onClose && (
                <button className="close-btn" onClick={onClose} aria-label="Close modal">
                  <X size={20} />
                </button>
              )}
            </div>
          )}
          <div className="modal-body">{children}</div>
          {footer && <div className="modal-footer">{footer}</div>}
        </div>
      </div>

      <style jsx>{`
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    backdrop-filter: blur(5px); /* Blur the entire page */
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                    animation: fadeIn 0.3s ease-in;
                }

                .modal-content {
                    background: var(--glass-bg);
                    backdrop-filter: blur(var(--blur-amount)); /* Use theme blur */
                    border: 1px solid var(--border-thin);
                    border-radius: var(--border-radius);
                    padding: 24px;
                    width: 90%;
                    max-height: 90vh;
                    overflow-y: auto;
                    box-shadow: var(--shadow-lg);
                    position: relative;
                    animation: slideIn 0.3s ease-out;
                }

                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                }

                .modal-header h2 {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 600;
                    color: var(--text-primary);
                }

                .close-btn {
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
                }

                .close-btn:hover {
                    background: var(--hover-bg);
                    color: var(--text-primary);
                    transform: scale(1.05);
                }

                .modal-body {
                    font-size: 14px;
                    color: var(--text-secondary);
                }

                .modal-footer {
                    margin-top: 16px;
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes slideIn {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }

                @media (max-width: 768px) {
                    .modal-content {
                        width: 95%;
                        padding: 16px;
                    }
                }
            `}</style>
    </Portal>
  );
};

export default Modal;
