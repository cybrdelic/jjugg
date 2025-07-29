/**
 * Centralized Error Handling for Applications
 * Provides user-friendly error messages and contextual error handling
 */

export class ApplicationsError extends Error {
    constructor(
        message: string,
        public readonly context: string,
        public readonly code: string,
        public readonly retryable: boolean = false,
        public readonly details?: any
    ) {
        super(message);
        this.name = 'ApplicationsError';
    }
}

export interface ErrorHandlerOptions {
    onStatusUpdate?: (message: string, appId?: string | null) => void;
    enableRetry?: boolean;
}

export class ApplicationsErrorHandler {
    private statusUpdateFn?: (message: string, appId?: string | null) => void;
    private enableRetry: boolean;

    constructor(options: ErrorHandlerOptions = {}) {
        this.statusUpdateFn = options.onStatusUpdate;
        this.enableRetry = options.enableRetry ?? true;
    }

    handleError(
        error: unknown,
        context: string,
        appId?: string | null,
        customMessage?: string
    ): ApplicationsError {
        const appError = this.transformError(error, context);

        // Show user-friendly status update
        if (this.statusUpdateFn) {
            const userMessage = customMessage || this.getUserFriendlyMessage(appError, context);
            this.statusUpdateFn(userMessage, appId);
        }

        // Log for debugging
        console.error(`[Applications Error] ${context}:`, {
            error: appError,
            appId,
            timestamp: new Date().toISOString()
        });

        return appError;
    }

    private transformError(error: unknown, context: string): ApplicationsError {
        if (error instanceof ApplicationsError) {
            return error;
        }

        if (error instanceof Error) {
            // Transform common errors
            if (error.message.includes('fetch')) {
                return new ApplicationsError(
                    'Network error occurred',
                    context,
                    'NETWORK_ERROR',
                    true,
                    error
                );
            }

            if (error.message.includes('timeout')) {
                return new ApplicationsError(
                    'Request timed out',
                    context,
                    'TIMEOUT_ERROR',
                    true,
                    error
                );
            }

            return new ApplicationsError(
                error.message,
                context,
                'GENERIC_ERROR',
                false,
                error
            );
        }

        return new ApplicationsError(
            'An unexpected error occurred',
            context,
            'UNKNOWN_ERROR',
            false,
            error
        );
    }

    private getUserFriendlyMessage(error: ApplicationsError, context: string): string {
        const baseMessage = this.getContextualMessage(context);

        switch (error.code) {
            case 'NETWORK_ERROR':
                return `${baseMessage}: Network connection issue. ${error.retryable ? 'Retry available.' : ''}`;

            case 'TIMEOUT_ERROR':
                return `${baseMessage}: Request timed out. ${error.retryable ? 'Retry available.' : ''}`;

            case 'VALIDATION_ERROR':
                return `${baseMessage}: ${error.message}`;

            default:
                return `${baseMessage}: ${error.message}`;
        }
    }

    private getContextualMessage(context: string): string {
        const contextMessages: Record<string, string> = {
            'create_application': 'Failed to create application',
            'update_application': 'Failed to update application',
            'delete_application': 'Failed to delete application',
            'update_stage': 'Failed to update application stage',
            'toggle_shortlist': 'Failed to update shortlist status',
            'bulk_delete': 'Failed to delete applications',
            'load_applications': 'Failed to load applications',
            'export_applications': 'Failed to export applications',
            'search_applications': 'Search functionality unavailable'
        };

        return contextMessages[context] || 'Operation failed';
    }

    async withRetry<T>(
        operation: () => Promise<T>,
        context: string,
        maxRetries: number = 3,
        delay: number = 1000
    ): Promise<T> {
        let lastError: unknown;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error;
                const appError = this.transformError(error, context);

                if (!appError.retryable || attempt === maxRetries) {
                    throw this.handleError(error, context);
                }

                // Wait before retry
                await new Promise(resolve => setTimeout(resolve, delay * attempt));
            }
        }

        throw this.handleError(lastError, context);
    }
}

// Factory function for creating error handler
export function createErrorHandler(options: ErrorHandlerOptions = {}): ApplicationsErrorHandler {
    return new ApplicationsErrorHandler(options);
}

// Utility functions for common error scenarios
export const ErrorUtils = {
    isNetworkError: (error: unknown): boolean => {
        return error instanceof ApplicationsError && error.code === 'NETWORK_ERROR';
    },

    isRetryableError: (error: unknown): boolean => {
        return error instanceof ApplicationsError && error.retryable;
    },

    createValidationError: (message: string, context: string): ApplicationsError => {
        return new ApplicationsError(message, context, 'VALIDATION_ERROR', false);
    }
};
