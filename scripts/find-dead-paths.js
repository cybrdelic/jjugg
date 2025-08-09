#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = process.cwd();

const ARG_JSON = process.argv.includes('--json');
const entriesArgIdx = process.argv.findIndex(a => a === '--entries');
const customEntries = entriesArgIdx > -1 ? (process.argv[entriesArgIdx + 1] || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean) : null;
// Add support for an explicit keep list to avoid false positives (e.g., runtime-used DB schema)
const keepArgIdx = process.argv.findIndex(a => a === '--keep');
const cliKeep = keepArgIdx > -1 ? (process.argv[keepArgIdx + 1] || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean) : [];
// Default keep patterns (avoid known false-positives and essential configs)
const defaultKeep = [
    'database/schema.ts',
    'config/navigationConfig.ts',
    'next-env.d.ts',
    'next.config.ts',
    'next.config.js',
    'tailwind.config.js',
    'postcss.config.js',
    'postcss.config.mjs',
    'minimal_next.config.js',
    'tsconfig.json',
    'tsconfig.*'
];

const exts = ['.ts', '.tsx', '.js', '.jsx', '.mjs'];
const allowedDirs = new Set(['components', 'hooks', 'lib', 'contexts', 'config', 'database', 'pages', 'app', 'styles']);
const excludedDirs = new Set(['node_modules', '.next', 'scripts', path.join('database', 'scripts'), path.join('database', 'migrations')]);

function norm(p) {
    // Normalize and lowercase on Windows to ensure consistent keying
    const normalized = path.normalize(p);
    return process.platform === 'win32' ? normalized.toLowerCase() : normalized;
}

function isCodeFile(file) {
    // exclude type declarations from analysis
    if (file.endsWith('.d.ts')) return false;
    return exts.includes(path.extname(file));
}

function shouldWalkDir(relDir) {
    if (!relDir) return false;
    const parts = path.normalize(relDir).split(path.sep);
    if (parts.some(p => excludedDirs.has(p))) return false;
    // Only walk whitelisted top-level dirs, but allow nested dirs within them
    const top = parts[0];
    return allowedDirs.has(top);
}

function walkDir(startDir, outFiles) {
    const items = fs.readdirSync(startDir, { withFileTypes: true });
    for (const item of items) {
        const abs = path.join(startDir, item.name);
        const rel = path.relative(PROJECT_ROOT, abs);
        if (item.isDirectory()) {
            if (shouldWalkDir(rel)) walkDir(abs, outFiles);
            continue;
        }
        if (isCodeFile(abs)) {
            // Include root-level code files, but skip excluded dirs
            const top = rel.split(path.sep)[0];
            if (allowedDirs.has(top) || rel.indexOf(path.sep) === -1) {
                outFiles.add(norm(abs));
            }
        }
    }
}

function readFileSafe(p) {
    try { return fs.readFileSync(p, 'utf8'); } catch { return ''; }
}

// Basic import extraction covering static and dynamic imports and require()
const IMPORT_RE = /import\s+[^'"\n]*?from\s*['"]([^'"\n]+)['"];?|import\(\s*['"]([^'"\n]+)['"]\s*\)|require\(\s*['"]([^'"\n]+)['"]\s*\)/g;

function extractSpecifiers(code) {
    const specs = [];
    let m;
    while ((m = IMPORT_RE.exec(code)) !== null) {
        const spec = m[1] || m[2] || m[3];
        if (!spec) continue;
        // Skip css & asset imports
        if (/\.(css|scss|sass|less|png|jpg|jpeg|gif|svg|ico|pdf)$/.test(spec)) continue;
        // Skip package imports
        if (!spec.startsWith('.') && !spec.startsWith('@/')) continue;
        specs.push(spec);
    }
    return specs;
}

function resolveWithExtensions(baseFile, spec) {
    const isAlias = spec.startsWith('@/');
    const targetBase = isAlias ? path.join(PROJECT_ROOT, spec.slice(2)) : path.resolve(path.dirname(baseFile), spec);

    // If spec has extension and exists
    if (exts.includes(path.extname(targetBase)) && fs.existsSync(targetBase)) return norm(targetBase);

    // Try file with extensions
    for (const ext of exts) {
        const cand = targetBase + ext;
        if (fs.existsSync(cand)) return norm(cand);
    }

    // Try index files in folder
    if (fs.existsSync(targetBase) && fs.statSync(targetBase).isDirectory()) {
        for (const ext of exts) {
            const cand = path.join(targetBase, 'index' + ext);
            if (fs.existsSync(cand)) return norm(cand);
        }
    }

    return null;
}

function buildGraph(files) {
    const graph = new Map(); // file -> Set(importedFile)
    for (const file of files) {
        const code = readFileSafe(file);
        const specs = extractSpecifiers(code);
        const edges = new Set();
        for (const s of specs) {
            const resolved = resolveWithExtensions(file, s);
            if (resolved) edges.add(resolved);
        }
        graph.set(file, edges);
    }
    return graph;
}

function findEntries(allFiles) {
    if (customEntries && customEntries.length) {
        // Resolve given patterns to files
        const patterns = customEntries;
        const files = [];
        for (const f of allFiles) {
            const rel = path.relative(PROJECT_ROOT, f).replace(/\\/g, '/');
            if (patterns.some(p => matchSimpleGlob(rel, p))) files.push(f);
        }
        return new Set(files.map(norm));
    }

    const entries = new Set();
    for (const f of allFiles) {
        const rel = path.relative(PROJECT_ROOT, f).replace(/\\/g, '/');
        if (rel.startsWith('pages/') || rel.startsWith('app/')) entries.add(f);
        // Include root next files as entries
        if (['next.config.js', 'next.config.ts', 'pages/_app.tsx', 'pages/_document.tsx'].some(n => rel === n)) entries.add(f);
    }
    return new Set(Array.from(entries).map(norm));
}

// Very small glob support: **, *, suffix/prefix
function matchSimpleGlob(text, pattern) {
    // Convert a subset of glob to regex
    let rx = pattern
        .replace(/[.+^${}()|[\]\\]/g, r => `\\${r}`)
        .replace(/\*\*/g, '::DOUBLESTAR::')
        .replace(/\*/g, '[^/]*')
        .replace(/::DOUBLESTAR::/g, '.*');
    const re = new RegExp('^' + rx + '$');
    return re.test(text);
}

// Keep-list matcher (configured via defaultKeep + --keep)
const KEEP_PATTERNS = new Set([...defaultKeep, ...cliKeep]);
function shouldKeep(relUnixPath) {
    const text = relUnixPath.toLowerCase();
    for (const pat of KEEP_PATTERNS) {
        if (matchSimpleGlob(text, pat.toLowerCase())) return true;
    }
    return false;
}

function dfsReachable(graph, entries) {
    const reachable = new Set();
    const stack = [...entries];
    while (stack.length) {
        const f = stack.pop();
        if (!f || reachable.has(f)) continue;
        reachable.add(f);
        const edges = graph.get(f);
        if (!edges) continue;
        for (const e of edges) {
            if (graph.has(e) && !reachable.has(e)) stack.push(e);
        }
    }
    return reachable;
}

function main() {
    const allFiles = new Set();
    // Walk allowed directories
    for (const dir of Array.from(allowedDirs)) {
        const abs = path.join(PROJECT_ROOT, dir);
        if (fs.existsSync(abs) && fs.statSync(abs).isDirectory()) walkDir(abs, allFiles);
    }
    // Also include root-level .ts/.tsx/.js files (like types.ts)
    for (const item of fs.readdirSync(PROJECT_ROOT, { withFileTypes: true })) {
        const abs = path.join(PROJECT_ROOT, item.name);
        if (item.isFile() && isCodeFile(abs)) allFiles.add(norm(abs));
    }

    const graph = buildGraph(allFiles);
    const entries = findEntries(allFiles);
    const reachable = dfsReachable(graph, entries);

    const unreachable = Array.from(allFiles).filter(f => !reachable.has(f))
        .filter(f => {
            // Keep exclusions consistent: ignore analysis on excluded dirs or this script itself
            const rel = path.relative(PROJECT_ROOT, f);
            if (rel.startsWith('scripts' + path.sep)) return false;
            if (rel.startsWith(path.join('database', 'scripts') + path.sep)) return false;
            if (rel.startsWith(path.join('database', 'migrations') + path.sep)) return false;
            // Avoid false positives: skip files explicitly kept via patterns
            const relUnix = rel.replace(/\\/g, '/');
            if (shouldKeep(relUnix)) return false;
            return true;
        })
        .sort((a, b) => a.localeCompare(b));

    const summary = {
        projectRoot: PROJECT_ROOT,
        filesAnalyzed: allFiles.size,
        entryFiles: entries.size,
        reachable: reachable.size,
        unreachable: unreachable.length,
        unreachableFiles: unreachable.map(f => path.relative(PROJECT_ROOT, f).replace(/\\/g, '/')),
        keptPatterns: Array.from(KEEP_PATTERNS)
    };

    if (ARG_JSON) {
        console.log(JSON.stringify(summary, null, 2));
    } else {
        console.log('Dead path analysis summary');
        console.log(' - Files analyzed:', summary.filesAnalyzed);
        console.log(' - Entry files:', summary.entryFiles);
        console.log(' - Reachable:', summary.reachable);
        console.log(' - Unreachable:', summary.unreachable);
        if (summary.unreachableFiles.length) {
            console.log('\nUnreachable files:');
            for (const rel of summary.unreachableFiles) console.log(' -', rel);
        }
        if (KEEP_PATTERNS.size) {
            console.log('\nKept (not analyzed as dead) patterns:');
            for (const pat of KEEP_PATTERNS) console.log(' -', pat);
        }
        console.log('\nTip: run with --json to export machine-readable output.');
        console.log('You can refine entries via --entries pages/**,app/** and keep via --keep database/schema.ts');
    }
}

main();
