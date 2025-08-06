/**
 * SnackBar Component
 * Modern notification system for application feedback
 */

import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, X, Info, AlertTriangle } from 'lucide-react';

export interface SnackBarMessage {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
    duration?: number; // in milliseconds, 0 = permanent
    action?: {
        label: string;
        onClick: () => void;
    };
}

interface SnackBarProps {
    messages: SnackBarMessage[];
    onDismiss: (id: string) => void;
    position?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left';
    maxVisible?: number;
}

const SnackBar: React.FC<SnackBarProps> = ({
    messages,
    onDismiss,
    position = 'bottom-right',
    maxVisible = 3
}) => {
    const [visibleMessages, setVisibleMessages] = useState<SnackBarMessage[]>([]);

    useEffect(() => {
        // Show only the latest messages up to maxVisible
        setVisibleMessages(messages.slice(-maxVisible));
    }, [messages, maxVisible]);

    useEffect(() => {
        // Auto-dismiss messages with duration
        const timers: NodeJS.Timeout[] = [];

        visibleMessages.forEach((message) => {
            if (message.duration && message.duration > 0) {
                const timer = setTimeout(() => {
                    onDismiss(message.id);
                }, message.duration);
                timers.push(timer);
            }
        });

        return () => {
            timers.forEach(timer => clearTimeout(timer));
        };
    }, [visibleMessages, onDismiss]);

    const getIcon = (type: SnackBarMessage['type']) => {
        switch (type) {
            case 'success':
                return <CheckCircle size={18} />;
            case 'error':
                return <AlertCircle size={18} />;
            case 'warning':
                return <AlertTriangle size={18} />;
            case 'info':
                return <Info size={18} />;
            default:
                return <Info size={18} />;
        }
    };

    const getPositionClasses = () => {
        switch (position) {
            case 'top-right':
                return 'top-4 right-4';
            case 'top-left':
                return 'top-4 left-4';
            case 'bottom-left':
                return 'bottom-4 left-4';
            case 'bottom-right':
            default:
                return 'bottom-4 right-4';
        }
    };

    if (visibleMessages.length === 0) return null;

    return (
        <div className={`snackbar-container ${getPositionClasses()}`}>
            {visibleMessages.map((message, index) => (
                <div
                    key={message.id}
                    className={`snackbar snackbar-${message.type}`}
                    style={{
                        animationDelay: `${index * 100}ms`
                    }}
                >
                    <div className="snackbar-content">
                        <div className="snackbar-icon">
                            {getIcon(message.type)}
                        </div>
                        <div className="snackbar-text">
                            <div className="snackbar-title">{message.title}</div>
                            {message.message && (
                                <div className="snackbar-message">{message.message}</div>
                            )}
                        </div>
                    </div>

                    <div className="snackbar-actions">
                        {message.action && (
                            <button
                                className="snackbar-action-btn"
                                onClick={message.action.onClick}
                            >
                                {message.action.label}
                            </button>
                        )}
                        <button
                            className="snackbar-close-btn"
                            onClick={() => onDismiss(message.id)}
                            aria-label="Dismiss notification"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>
            ))}

            <style jsx>{`
        .snackbar-container {
          position: fixed;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-width: 400px;
          width: 100%;
          pointer-events: none;
        }

        .snackbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: var(--surface);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border);
          box-shadow: var(--shadow-lg);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          pointer-events: auto;
          animation: snackbarSlideIn 300ms ease-out forwards;
          transition: all 200ms ease-out;
          min-height: 52px;
        }

        .snackbar:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-xl);
        }

        @keyframes snackbarSlideIn {
          from {
            opacity: 0;
            transform: translateX(100%) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }

        /* Type-specific styling */
        .snackbar-success {
          border-left: 4px solid var(--success);
        }

        .snackbar-success .snackbar-icon {
          color: var(--success);
        }

        .snackbar-error {
          border-left: 4px solid var(--error);
        }

        .snackbar-error .snackbar-icon {
          color: var(--error);
        }

        .snackbar-warning {
          border-left: 4px solid var(--warning);
        }

        .snackbar-warning .snackbar-icon {
          color: var(--warning);
        }

        .snackbar-info {
          border-left: 4px solid var(--primary);
        }

        .snackbar-info .snackbar-icon {
          color: var(--primary);
        }

        .snackbar-content {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          min-width: 0;
        }

        .snackbar-icon {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .snackbar-text {
          flex: 1;
          min-width: 0;
        }

        .snackbar-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1.3;
          margin-bottom: 2px;
        }

        .snackbar-message {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .snackbar-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-left: 12px;
        }

        .snackbar-action-btn {
          padding: 4px 8px;
          border: none;
          border-radius: var(--radius-sm);
          background: var(--primary);
          color: white;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 150ms ease-out;
        }

        .snackbar-action-btn:hover {
          background: var(--primary-dark);
          transform: translateY(-1px);
        }

        .snackbar-close-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border: none;
          border-radius: var(--radius-sm);
          background: transparent;
          color: var(--text-tertiary);
          cursor: pointer;
          transition: all 150ms ease-out;
        }

        .snackbar-close-btn:hover {
          background: var(--bg-hover);
          color: var(--text-secondary);
          transform: scale(1.1);
        }

        /* Mobile responsiveness */
        @media (max-width: 480px) {
          .snackbar-container {
            left: 16px;
            right: 16px;
            max-width: none;
          }

          .snackbar {
            padding: 10px 12px;
            min-height: 48px;
          }

          .snackbar-title {
            font-size: 13px;
          }

          .snackbar-message {
            font-size: 12px;
          }
        }
      `}</style>
        </div>
    );
};

export default SnackBar;
