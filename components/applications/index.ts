/**
 * Applications Module - Clean Export Interface
 * Provides organized access to all applications components and utilities
 */

// Main Components
export { default as Applications } from './Applications';

// Sub-components (for advanced usage)
export { ApplicationsHeader } from './components/ApplicationsHeader';
export { ApplicationsControls } from './components/ApplicationsControls';
export { ApplicationsTable } from './components/ApplicationsTable';
export { ApplicationsKanban } from './components/ApplicationsKanban';
export { ApplicationsContextMenu } from './components/ApplicationsContextMenu';

// Hooks
export { useApplicationsLogic } from './hooks/useApplicationsLogic';
export type {
    ApplicationsState,
    ApplicationsActions,
    ApplicationsHookReturn
} from './hooks/useApplicationsLogic';

// Utilities
export {
    createErrorHandler,
    ApplicationsError,
    ApplicationsErrorHandler,
    ErrorUtils
} from './utils/errorHandler';
export type { ErrorHandlerOptions } from './utils/errorHandler';

// Re-export existing components for compatibility
export { default as ApplicationCard } from './ApplicationCard';
export { default as ApplicationDetailDrawer } from './ApplicationDetailDrawer';
export { default as ApplicationDetailModal } from './ApplicationDetailModal';
export { default as KanbanColumn } from './KanbanColumn';
export { default as SearchFilter } from './SearchFilter';
