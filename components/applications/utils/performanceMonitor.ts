/**
 * Performance monitoring utilities for large datasets
 * Provides insights into render times and memory usage
 */

export interface PerformanceMetrics {
    renderTime: number;
    itemsRendered: number;
    memoryUsage: number;
    scrollPerformance: number;
}

export class PerformanceMonitor {
    private static instance: PerformanceMonitor;
    private metrics: Map<string, PerformanceMetrics> = new Map();
    private observers: Map<string, PerformanceObserver> = new Map();

    static getInstance(): PerformanceMonitor {
        if (!PerformanceMonitor.instance) {
            PerformanceMonitor.instance = new PerformanceMonitor();
        }
        return PerformanceMonitor.instance;
    }

    startMeasurement(label: string) {
        performance.mark(`${label}-start`);
    }

    endMeasurement(label: string, itemsRendered: number = 0) {
        const startMark = `${label}-start`;
        const endMark = `${label}-end`;

        performance.mark(endMark);
        performance.measure(label, startMark, endMark);

        const measure = performance.getEntriesByName(label)[0];
        const renderTime = measure.duration;

        // Get memory usage if available
        let memoryUsage = 0;
        if ((performance as any).memory) {
            memoryUsage = (performance as any).memory.usedJSHeapSize;
        }

        const metrics: PerformanceMetrics = {
            renderTime,
            itemsRendered,
            memoryUsage,
            scrollPerformance: 0
        };

        this.metrics.set(label, metrics);

        // Log performance in development
        if (process.env.NODE_ENV === 'development') {
            console.log(`Performance [${label}]:`, {
                renderTime: `${renderTime.toFixed(2)}ms`,
                itemsRendered,
                memoryUsage: `${(memoryUsage / 1024 / 1024).toFixed(2)}MB`,
                fps: renderTime > 0 ? (1000 / renderTime).toFixed(0) : 'N/A'
            });
        }

        // Clean up marks
        performance.clearMarks(startMark);
        performance.clearMarks(endMark);
        performance.clearMeasures(label);
    }

    measureScrollPerformance(label: string, callback: () => void) {
        let scrollStart: number;
        let scrollEnd: number;
        let frameCount = 0;

        const measureFrame = () => {
            frameCount++;
            if (scrollEnd - scrollStart < 1000) { // Measure for 1 second
                requestAnimationFrame(measureFrame);
            } else {
                const fps = frameCount;
                const currentMetrics = this.metrics.get(label);
                if (currentMetrics) {
                    currentMetrics.scrollPerformance = fps;
                    this.metrics.set(label, currentMetrics);
                }

                if (process.env.NODE_ENV === 'development') {
                    console.log(`Scroll Performance [${label}]: ${fps} FPS`);
                }
            }
        };

        scrollStart = performance.now();
        callback();
        scrollEnd = performance.now();
        requestAnimationFrame(measureFrame);
    }

    getMetrics(label: string): PerformanceMetrics | undefined {
        return this.metrics.get(label);
    }

    getAllMetrics(): Map<string, PerformanceMetrics> {
        return new Map(this.metrics);
    }

    clearMetrics() {
        this.metrics.clear();
    }

    // Monitor long tasks that block the main thread
    observeLongTasks(label: string) {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry) => {
                    if (entry.duration > 50) { // Tasks longer than 50ms
                        console.warn(`Long task detected [${label}]:`, {
                            duration: `${entry.duration.toFixed(2)}ms`,
                            startTime: entry.startTime,
                            name: entry.name
                        });
                    }
                });
            });

            observer.observe({ entryTypes: ['longtask'] });
            this.observers.set(label, observer);
        }
    }

    stopObserving(label: string) {
        const observer = this.observers.get(label);
        if (observer) {
            observer.disconnect();
            this.observers.delete(label);
        }
    }

    // Generate performance report
    generateReport(): string {
        const metrics = Array.from(this.metrics.entries());

        if (metrics.length === 0) {
            return 'No performance metrics collected.';
        }

        let report = '=== Performance Report ===\n\n';

        metrics.forEach(([label, metric]) => {
            report += `${label}:\n`;
            report += `  Render Time: ${metric.renderTime.toFixed(2)}ms\n`;
            report += `  Items Rendered: ${metric.itemsRendered}\n`;
            report += `  Memory Usage: ${(metric.memoryUsage / 1024 / 1024).toFixed(2)}MB\n`;
            report += `  Scroll FPS: ${metric.scrollPerformance}\n`;
            report += `  Performance Score: ${this.calculatePerformanceScore(metric)}\n\n`;
        });

        return report;
    }

    private calculatePerformanceScore(metric: PerformanceMetrics): string {
        let score = 100;

        // Deduct points for slow rendering
        if (metric.renderTime > 16) score -= 20; // Target 60fps (16.67ms per frame)
        if (metric.renderTime > 33) score -= 20; // Below 30fps
        if (metric.renderTime > 50) score -= 30; // Below 20fps

        // Deduct points for high memory usage
        const memoryMB = metric.memoryUsage / 1024 / 1024;
        if (memoryMB > 50) score -= 10;
        if (memoryMB > 100) score -= 20;

        // Deduct points for poor scroll performance
        if (metric.scrollPerformance > 0 && metric.scrollPerformance < 30) score -= 20;
        if (metric.scrollPerformance > 0 && metric.scrollPerformance < 15) score -= 30;

        score = Math.max(0, score);

        if (score >= 90) return `${score}/100 (Excellent)`;
        if (score >= 70) return `${score}/100 (Good)`;
        if (score >= 50) return `${score}/100 (Fair)`;
        return `${score}/100 (Poor)`;
    }
}

// React hook for performance monitoring
export function usePerformanceMonitor(label: string) {
    const monitor = PerformanceMonitor.getInstance();

    const startMeasurement = () => monitor.startMeasurement(label);
    const endMeasurement = (itemsRendered: number = 0) => monitor.endMeasurement(label, itemsRendered);
    const measureScrollPerformance = (callback: () => void) => monitor.measureScrollPerformance(label, callback);
    const getMetrics = () => monitor.getMetrics(label);

    return {
        startMeasurement,
        endMeasurement,
        measureScrollPerformance,
        getMetrics,
        generateReport: () => monitor.generateReport()
    };
}

// Performance decorator for component methods
export function measurePerformance(label: string) {
    return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
        const method = descriptor.value;

        descriptor.value = function (...args: any[]) {
            const monitor = PerformanceMonitor.getInstance();
            monitor.startMeasurement(`${label}-${propertyName}`);

            const result = method.apply(this, args);

            if (result instanceof Promise) {
                return result.finally(() => {
                    monitor.endMeasurement(`${label}-${propertyName}`);
                });
            } else {
                monitor.endMeasurement(`${label}-${propertyName}`);
                return result;
            }
        };
    };
}

export default PerformanceMonitor;
