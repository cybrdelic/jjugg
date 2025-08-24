/**
 * SnackBar Context
 * Global notification management system
 */

import React, { createContext, ReactNode, useCallback, useContext, useState } from 'react';
import SnackBar, { SnackBarMessage } from '../components/SnackBar';

interface SnackBarContextType {
    showMessage: (message: Omit<SnackBarMessage, 'id'>) => string;
    showSuccess: (title: string, message?: string, duration?: number) => string;
    showError: (title: string, message?: string, duration?: number) => string;
    showWarning: (title: string, message?: string, duration?: number) => string;
    showInfo: (title: string, message?: string, duration?: number) => string;
    dismissMessage: (id: string) => void;
    clearAll: () => void;
}

const SnackBarContext = createContext<SnackBarContextType | undefined>(undefined);

interface SnackBarProviderProps {
    children: ReactNode;
    maxVisible?: number;
    position?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left';
}

export const SnackBarProvider: React.FC<SnackBarProviderProps> = ({
    children,
    maxVisible = 3,
    position = 'bottom-right'
}) => {
    const [messages, setMessages] = useState<SnackBarMessage[]>([]);

    const generateId = useCallback(() => {
        return `snackbar-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }, []);

    const showMessage = useCallback((messageData: Omit<SnackBarMessage, 'id'>) => {
        const id = generateId();
        const newMessage: SnackBarMessage = {
            id,
            duration: 4000, // default 4 seconds
            ...messageData,
        };

        setMessages(prev => [...prev, newMessage]);
        return id;
    }, [generateId]);

    const showSuccess = useCallback((title: string, message?: string, duration = 4000) => {
        return showMessage({ type: 'success', title, message, duration });
    }, [showMessage]);

    const showError = useCallback((title: string, message?: string, duration = 6000) => {
        return showMessage({ type: 'error', title, message, duration });
    }, [showMessage]);

    const showWarning = useCallback((title: string, message?: string, duration = 5000) => {
        return showMessage({ type: 'warning', title, message, duration });
    }, [showMessage]);

    const showInfo = useCallback((title: string, message?: string, duration = 4000) => {
        return showMessage({ type: 'info', title, message, duration });
    }, [showMessage]);

    const dismissMessage = useCallback((id: string) => {
        setMessages(prev => prev.filter(msg => msg.id !== id));
    }, []);

    const clearAll = useCallback(() => {
        setMessages([]);
    }, []);

    const contextValue: SnackBarContextType = {
        showMessage,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        dismissMessage,
        clearAll,
    };

    return (
        <SnackBarContext.Provider value={contextValue}>
            {children}
            <SnackBar
                messages={messages}
                onDismiss={dismissMessage}
                position={position}
                maxVisible={maxVisible}
            />
        </SnackBarContext.Provider>
    );
};

export const useSnackBar = (): SnackBarContextType => {
    const context = useContext(SnackBarContext);
    if (!context) {
        throw new Error('useSnackBar must be used within a SnackBarProvider');
    }
    return context;
};

// Utility hook for application operations with automatic error handling
/**
 * @deprecated Wrapper not referenced; prefer calling SnackBar methods directly.
 */
export const useApplicationOperations = () => {
    const snackBar = useSnackBar();

    const withErrorHandling = useCallback(
        async (
            operation: () => Promise<any>,
            successMessage?: string,
            errorMessage?: string
        ): Promise<any> => {
            try {
                const result = await operation();
                if (successMessage) {
                    snackBar.showSuccess(successMessage);
                }
                return result;
            } catch (error) {
                const message = error instanceof Error ? error.message : 'An unexpected error occurred';
                snackBar.showError(
                    errorMessage || 'Operation Failed',
                    message
                );
                return null;
            }
        },
        [snackBar]
    );

    return {
        withErrorHandling,
        snackBar,
    };
};
