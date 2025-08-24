/**
 * Performance optimization configuration for different dataset sizes
 * Dynamically adjusts settings based on data volume
 */

export interface PerformanceConfig {
    enableVirtualization: boolean;
    itemHeight: number;
    overscan: number;
    debounceDelay: number;
    animationDelay: number;
    enableAnimations: boolean;
    batchSize: number;
    enableMemoization: boolean;
    lazyLoadImages: boolean;
    enablePagination: boolean;
    pageSize: number;
}

export const PERFORMANCE_THRESHOLDS = {
    SMALL: 50,
    MEDIUM: 200,
    LARGE: 1000,
    EXTRA_LARGE: 5000
} as const;

export function getPerformanceConfig(datasetSize: number): PerformanceConfig {
    if (datasetSize <= PERFORMANCE_THRESHOLDS.SMALL) {
        // Small dataset: Full features, no optimization needed
        return {
            enableVirtualization: false,
            itemHeight: 48,
            overscan: 5,
            debounceDelay: 150,
            animationDelay: 0.05,
            enableAnimations: true,
            batchSize: 50,
            enableMemoization: true,
            lazyLoadImages: false,
            enablePagination: false,
            pageSize: 50
        };
    }

    if (datasetSize <= PERFORMANCE_THRESHOLDS.MEDIUM) {
        // Medium dataset: Light optimization
        return {
            enableVirtualization: false,
            itemHeight: 48,
            overscan: 10,
            debounceDelay: 250,
            animationDelay: 0.02,
            enableAnimations: true,
            batchSize: 100,
            enableMemoization: true,
            lazyLoadImages: true,
            enablePagination: false,
            pageSize: 100
        };
    }

    if (datasetSize <= PERFORMANCE_THRESHOLDS.LARGE) {
        // Large dataset: Moderate optimization with virtualization
        return {
            enableVirtualization: true,
            itemHeight: 44,
            overscan: 15,
            debounceDelay: 300,
            animationDelay: 0.01,
            enableAnimations: true,
            batchSize: 200,
            enableMemoization: true,
            lazyLoadImages: true,
            enablePagination: false,
            pageSize: 200
        };
    }

    // Extra large dataset: Heavy optimization
    return {
        enableVirtualization: true,
        itemHeight: 40,
        overscan: 20,
        debounceDelay: 500,
        animationDelay: 0,
        enableAnimations: false,
        batchSize: 500,
        enableMemoization: true,
        lazyLoadImages: true,
        enablePagination: true,
        pageSize: 500
    };
}

/**
 * Adaptive performance configuration that adjusts based on device capabilities
 */
export function getAdaptivePerformanceConfig(
    datasetSize: number,
    deviceCapabilities?: {
        memory?: number;
        cores?: number;
        isMobile?: boolean;
        connectionSpeed?: 'slow' | 'fast';
    }
): PerformanceConfig {
    let config = getPerformanceConfig(datasetSize);

    if (deviceCapabilities) {
        // Adjust for mobile devices
        if (deviceCapabilities.isMobile) {
            config.debounceDelay += 100;
            config.enableAnimations = datasetSize <= PERFORMANCE_THRESHOLDS.SMALL;
            config.overscan = Math.max(5, config.overscan - 5);
            config.batchSize = Math.max(50, config.batchSize / 2);
        }

        // Adjust for low memory devices
        if (deviceCapabilities.memory && deviceCapabilities.memory < 4) {
            config.enableVirtualization = datasetSize > PERFORMANCE_THRESHOLDS.SMALL;
            config.overscan = Math.max(3, config.overscan - 5);
            config.batchSize = Math.max(25, config.batchSize / 2);
            config.enableAnimations = false;
        }

        // Adjust for slow connections
        if (deviceCapabilities.connectionSpeed === 'slow') {
            config.lazyLoadImages = true;
            config.debounceDelay += 200;
            config.batchSize = Math.max(25, config.batchSize / 2);
        }

        // Adjust for low-end CPUs
        if (deviceCapabilities.cores && deviceCapabilities.cores <= 2) {
            config.enableAnimations = false;
            config.debounceDelay += 150;
            config.overscan = Math.max(3, config.overscan - 3);
        }
    }

    return config;
}

/**
 * Performance optimization suggestions based on current metrics
 */
/**
 * @deprecated Currently unused; retained temporarily for future performance profiling UI.
 */
export function getPerformanceOptimizationSuggestions(
    renderTime: number,
    memoryUsage: number,
    datasetSize: number
): string[] {
    const suggestions: string[] = [];

    if (renderTime > 100) {
        suggestions.push('Consider enabling virtualization to reduce render time');
        suggestions.push('Reduce animation complexity or disable animations');
        suggestions.push('Implement lazy loading for heavy components');
    }

    if (renderTime > 50) {
        suggestions.push('Increase debounce delay for filters');
        suggestions.push('Reduce overscan value in virtual scrolling');
    }

    if (memoryUsage > 100 * 1024 * 1024) { // 100MB
        suggestions.push('Enable garbage collection optimizations');
        suggestions.push('Implement component memoization');
        suggestions.push('Consider pagination for large datasets');
    }

    if (datasetSize > PERFORMANCE_THRESHOLDS.LARGE) {
        suggestions.push('Enable server-side filtering and sorting');
        suggestions.push('Implement infinite scrolling');
        suggestions.push('Use Web Workers for heavy computations');
    }

    if (suggestions.length === 0) {
        suggestions.push('Performance is optimal for current dataset size');
    }

    return suggestions;
}

/**
 * Device capability detection
 */
export function detectDeviceCapabilities(): {
    memory?: number;
    cores?: number;
    isMobile?: boolean;
    connectionSpeed?: 'slow' | 'fast';
} {
    const capabilities: any = {};

    // Detect available memory
    if ((navigator as any).deviceMemory) {
        capabilities.memory = (navigator as any).deviceMemory;
    }

    // Detect CPU cores
    if (navigator.hardwareConcurrency) {
        capabilities.cores = navigator.hardwareConcurrency;
    }

    // Detect mobile device
    capabilities.isMobile = /Mobi|Android/i.test(navigator.userAgent);

    // Detect connection speed
    if ((navigator as any).connection) {
        const connection = (navigator as any).connection;
        if (connection.effectiveType) {
            capabilities.connectionSpeed = ['slow-2g', '2g', '3g'].includes(connection.effectiveType) ? 'slow' : 'fast';
        }
    }

    return capabilities;
}

export default {
    getPerformanceConfig,
    getAdaptivePerformanceConfig,
    getPerformanceOptimizationSuggestions,
    detectDeviceCapabilities,
    PERFORMANCE_THRESHOLDS
};
