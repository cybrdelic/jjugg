#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

/**
 * High-performance script to find components with the most lines of code
 * Optimized for speed with parallel processing and minimal I/O
 */
// ADD PROPER DOCUMENTATION WITHIN THIS FILE SO ITS HOVERABLE IN EDITORS

/**
 * ComponentAnalyzer's purpose is to analyze a codebase and identify the largest components
 * based on line count. It scans directories for relevant files, counts lines efficiently,
 * and provides insights into the code structure.
 */
class ComponentAnalyzer {
    constructor(options = {}) {
        this.options = {
            extensions: ['.tsx', '.ts', '.jsx', '.js'],
            excludeDirs: ['node_modules', '.next', '.git', 'dist', 'build'],
            topCount: 20,
            minLines: 10,
            showProgress: true,
            ...options
        };
        this.results = [];
        this.processedFiles = 0;
        this.totalFiles = 0;
    }

    /**
     * Fast directory traversal using async/await for better performance
     */
    async findFiles(dir, files = []) {
        try {
            const entries = await fs.promises.readdir(dir, { withFileTypes: true });

            const promises = entries.map(async (entry) => {
                const fullPath = path.join(dir, entry.name);

                if (entry.isDirectory()) {
                    // Skip excluded directories
                    if (this.options.excludeDirs.includes(entry.name)) {
                        return;
                    }
                    return this.findFiles(fullPath, files);
                } else if (entry.isFile()) {
                    // Check if file has valid extension
                    const ext = path.extname(entry.name);
                    if (this.options.extensions.includes(ext)) {
                        files.push(fullPath);
                    }
                }
            });

            await Promise.all(promises);
            return files;
        } catch (error) {
            if (error.code !== 'ENOENT' && error.code !== 'EACCES') {
                console.warn(`Warning: Could not read directory ${dir}: ${error.message}`);
            }
            return files;
        }
    }

    /**
     * Count lines in file efficiently
     */
    async countLines(filePath) {
        try {
            const data = await fs.promises.readFile(filePath, 'utf8');
            // Fast line counting - split by newlines and filter empty lines at end
            const lines = data.split('\n').length;
            return lines > 0 ? lines : 1;
        } catch (error) {
            console.warn(`Warning: Could not read file ${filePath}: ${error.message}`);
            return 0;
        }
    }

    /**
     * Process files in batches for optimal performance
     */
    async processFilesBatch(files, batchSize = 50) {
        const results = [];

        for (let i = 0; i < files.length; i += batchSize) {
            const batch = files.slice(i, i + batchSize);

            const batchPromises = batch.map(async (filePath) => {
                const lineCount = await this.countLines(filePath);
                this.processedFiles++;

                if (this.options.showProgress && this.processedFiles % 100 === 0) {
                    process.stdout.write(`\rProcessed: ${this.processedFiles}/${this.totalFiles} files`);
                }

                if (lineCount >= this.options.minLines) {
                    const relativePath = path.relative(process.cwd(), filePath);
                    const fileName = path.basename(filePath);
                    const fileSize = (await fs.promises.stat(filePath)).size;

                    return {
                        file: fileName,
                        path: relativePath,
                        lines: lineCount,
                        size: fileSize,
                        type: this.getComponentType(filePath)
                    };
                }
                return null;
            });

            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults.filter(Boolean));
        }

        return results;
    }

    /**
     * Determine component type based on file path and name
     */
    getComponentType(filePath) {
        const relativePath = path.relative(process.cwd(), filePath).toLowerCase();

        if (relativePath.includes('components/')) return 'Component';
        if (relativePath.includes('pages/') || relativePath.includes('app/')) return 'Page';
        if (relativePath.includes('hooks/')) return 'Hook';
        if (relativePath.includes('contexts/')) return 'Context';
        if (relativePath.includes('lib/') || relativePath.includes('utils/')) return 'Utility';
        if (relativePath.includes('types') || filePath.endsWith('.d.ts')) return 'Types';

        return 'Other';
    }

    /**
     * Format file size for display
     */
    formatSize(bytes) {
        if (bytes < 1024) return `${bytes}B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
    }

    /**
     * Generate detailed report
     */
    generateReport(results) {
        console.log('\n\n📊 COMPONENT SIZE ANALYSIS REPORT');
        console.log('='.repeat(80));

        // Top components by lines
        console.log(`\n🏆 TOP ${this.options.topCount} COMPONENTS BY LINE COUNT:`);
        console.log('-'.repeat(80));
        console.log('Rank | Lines | Size   | Type      | File');
        console.log('-'.repeat(80));

        results.slice(0, this.options.topCount).forEach((result, index) => {
            const rank = `${index + 1}`.padStart(4);
            const lines = `${result.lines}`.padStart(5);
            const size = this.formatSize(result.size).padStart(6);
            const type = result.type.padStart(9);
            console.log(`${rank} | ${lines} | ${size} | ${type} | ${result.file}`);
        });

        // Statistics by type
        console.log('\n📈 STATISTICS BY TYPE:');
        console.log('-'.repeat(50));

        const typeStats = results.reduce((acc, result) => {
            if (!acc[result.type]) {
                acc[result.type] = { count: 0, totalLines: 0, avgLines: 0 };
            }
            acc[result.type].count++;
            acc[result.type].totalLines += result.lines;
            acc[result.type].avgLines = Math.round(acc[result.type].totalLines / acc[result.type].count);
            return acc;
        }, {});

        Object.entries(typeStats)
            .sort(([, a], [, b]) => b.avgLines - a.avgLines)
            .forEach(([type, stats]) => {
                console.log(`${type.padEnd(12)} | Count: ${stats.count.toString().padStart(3)} | Avg: ${stats.avgLines.toString().padStart(4)} lines`);
            });

        // Summary
        console.log('\n📋 SUMMARY:');
        console.log('-'.repeat(30));
        console.log(`Total files analyzed: ${results.length}`);
        console.log(`Largest component: ${results[0].file} (${results[0].lines} lines)`);
        console.log(`Average lines per file: ${Math.round(results.reduce((sum, r) => sum + r.lines, 0) / results.length)}`);
        console.log(`Total lines of code: ${results.reduce((sum, r) => sum + r.lines, 0).toLocaleString()}`);
    }

    /**
     * Main execution method
     */
    async analyze(rootDir = process.cwd()) {
        console.log('🔍 Starting component analysis...');
        const startTime = performance.now();

        try {
            // Find all relevant files
            console.log('📁 Scanning directories...');
            const files = await this.findFiles(rootDir);
            this.totalFiles = files.length;

            console.log(`Found ${this.totalFiles} component files to analyze`);

            if (files.length === 0) {
                console.log('❌ No component files found to analyze');
                return;
            }

            // Process files in batches
            console.log('📊 Analyzing file sizes...');
            this.results = await this.processFilesBatch(files);

            // Sort by line count (descending)
            this.results.sort((a, b) => b.lines - a.lines);

            const endTime = performance.now();
            const duration = ((endTime - startTime) / 1000).toFixed(2);

            console.log(`\n✅ Analysis complete in ${duration}s`);

            if (this.results.length === 0) {
                console.log('❌ No components found with minimum line count');
                return;
            }

            this.generateReport(this.results);

        } catch (error) {
            console.error('❌ Error during analysis:', error.message);
            process.exit(1);
        }
    }
}

// CLI interface
async function main() {
    const args = process.argv.slice(2);
    const options = {};

    // Parse command line arguments
    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case '--top':
                options.topCount = parseInt(args[++i]) || 20;
                break;
            case '--min-lines':
                options.minLines = parseInt(args[++i]) || 10;
                break;
            case '--no-progress':
                options.showProgress = false;
                break;
            case '--help':
                console.log(`
Usage: npm run analyze-components [options]

Options:
  --top <number>       Number of top components to show (default: 20)
  --min-lines <number> Minimum lines to include (default: 10)
  --no-progress        Disable progress output
  --help               Show this help message

Examples:
  npm run analyze-components
  npm run analyze-components -- --top 10 --min-lines 50
        `);
                process.exit(0);
        }
    }

    const analyzer = new ComponentAnalyzer(options);
    await analyzer.analyze();
}

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = ComponentAnalyzer;
