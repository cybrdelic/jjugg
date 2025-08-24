#!/usr/bin/env ts-node
/*
 * Dead Code Analyzer (Export + Internal Unused)
 * ---------------------------------------------
 * Heuristics-based static scan using TypeScript compiler API.
 * Identifies:
 *   1. Potentially unused exported symbols (never referenced outside their declaring file).
 *   2. Unused internal declarations (functions / const / let / class) with no references.
 * Exclusions:
 *   - Default exports in Next.js `pages/` (assumed route entrypoints)
 *   - Declarations whose names match common framework expectations (e.g. App, Document)
 *   - Type-only exports (interfaces / types) are still reported unless --ignore-types passed
 * Limitations:
 *   - Dynamic usage (string-based import, reflection) not detected
 *   - JSX implicit component usage inside same file counts as reference (OK)
 *   - Barrel re-exports appear as usage in same file only; if not imported downstream they will be flagged
 * Usage:
 *   npx ts-node scripts/analyze-dead-code.ts [--json] [--ignore-types]
 */
import path from 'path';
import ts from 'typescript';

interface DeadSymbol {
  file: string;
  line: number;
  kind: string;
  name: string;
  export: boolean;
  reasons: string[];
}

const argv = process.argv.slice(2);
const asJson = argv.includes('--json');
const ignoreTypes = argv.includes('--ignore-types');

function loadTsConfig(): { fileNames: string[]; options: ts.CompilerOptions } {
  const configPath = ts.findConfigFile(process.cwd(), ts.sys.fileExists, 'tsconfig.json');
  if (!configPath) throw new Error('tsconfig.json not found');
  const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
  if (configFile.error) throw new Error(ts.formatDiagnosticsWithColorAndContext([configFile.error], {
    getCanonicalFileName: f => f,
    getCurrentDirectory: process.cwd,
    getNewLine: () => '\n'
  }));
  const parse = ts.parseJsonConfigFileContent(configFile.config, ts.sys, path.dirname(configPath));
  return { fileNames: parse.fileNames, options: parse.options };
}

const { fileNames, options } = loadTsConfig();
// Filter out generated / irrelevant paths
const sourceFiles = fileNames.filter(f => !f.includes('node_modules') && !f.includes('.next'));

const program = ts.createProgram(sourceFiles, options);
const checker = program.getTypeChecker();

// Map symbol id -> references count & declarations meta
interface SymbolMeta {
  symbol: ts.Symbol;
  export: boolean;
  declarations: ts.Declaration[];
  fileNames: Set<string>;
  isTypeOnly: boolean;
}
const symbolMeta: SymbolMeta[] = [];

function nodeHasModifier(node: ts.Node, kind: ts.SyntaxKind) {
  const modifiers: readonly ts.ModifierLike[] | undefined = (node as any).modifiers;
  if (!modifiers) return false;
  return modifiers.some((m: any) => m.kind === kind);
}

function isExported(node: ts.Node): boolean {
  return nodeHasModifier(node, ts.SyntaxKind.ExportKeyword);
}

function isTypeOnlyDeclaration(node: ts.Node): boolean {
  return ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node);
}

// Collect top-level declarations
for (const sf of program.getSourceFiles()) {
  if (sf.isDeclarationFile) continue;
  if (!sourceFiles.includes(sf.fileName)) continue;
  sf.forEachChild(node => {
    if (ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node) || ts.isVariableStatement(node) || ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node) || ts.isEnumDeclaration(node)) {
      // Variables: could be multiple declarations
      if (ts.isVariableStatement(node)) {
        node.declarationList.declarations.forEach(decl => {
          const sym = checker.getSymbolAtLocation(decl.name);
          if (!sym) return;
          symbolMeta.push({
            symbol: sym,
            export: isExported(node),
            declarations: [decl],
            fileNames: new Set([sf.fileName]),
            isTypeOnly: false
          });
        });
      } else {
        const nameNode = (node as any).name as ts.Identifier | undefined;
        if (!nameNode) return; // anonymous
        const sym = checker.getSymbolAtLocation(nameNode);
        if (!sym) return;
        symbolMeta.push({
          symbol: sym,
          export: isExported(node),
          declarations: [node],
          fileNames: new Set([sf.fileName]),
          isTypeOnly: isTypeOnlyDeclaration(node)
        });
      }
    }
  });
}

// Reference counting
const refCounts = new Map<ts.Symbol, number>();
for (const sf of program.getSourceFiles()) {
  if (sf.isDeclarationFile) continue;
  if (!sourceFiles.includes(sf.fileName)) continue;
  const visit = (node: ts.Node) => {
    if (ts.isIdentifier(node)) {
      const sym = checker.getSymbolAtLocation(node);
      if (sym) {
        // For aliases, resolve
        const target = sym.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(sym) : sym;
        if (symbolMeta.some(m => m.symbol === target)) {
          refCounts.set(target, (refCounts.get(target) || 0) + 1);
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
}

const dead: DeadSymbol[] = [];

function posToLine(file: ts.SourceFile, pos: number): number {
  return file.getLineAndCharacterOfPosition(pos).line + 1;
}

for (const meta of symbolMeta) {
  const { symbol, export: isExp, declarations, isTypeOnly } = meta;
  if (ignoreTypes && isTypeOnly) continue;
  const refs = refCounts.get(symbol) || 0;
  // Declaration occurrences count toward refs; so threshold for unused: refs <= declarations.length
  const declCount = declarations.length;
  const usedOutsideDecl = refs - declCount;
  const firstDecl = declarations[0];
  const sf = firstDecl.getSourceFile();
  const name = symbol.getName();

  // Skip React special component exports and Next page defaults
  if (isExp && /pages[\/].+\.tsx?$/.test(sf.fileName) && name === 'default') continue;
  if (['App', 'Document'].includes(name)) continue;

  const reasons: string[] = [];
  if (isExp && usedOutsideDecl <= 0) {
    reasons.push('exported-symbol-no-external-references');
  } else if (!isExp && usedOutsideDecl <= 0) {
    reasons.push('internal-declaration-unreferenced');
  }
  if (!reasons.length) continue;
  dead.push({
    file: path.relative(process.cwd(), sf.fileName),
    line: posToLine(sf, firstDecl.getStart()),
    kind: ts.SyntaxKind[firstDecl.kind],
    name,
    export: isExp,
    reasons
  });
}

// Group by file for human output
if (asJson) {
  console.log(JSON.stringify({ count: dead.length, symbols: dead }, null, 2));
  process.exit(0);
}

if (!dead.length) {
  console.log('No obvious dead symbols found.');
  process.exit(0);
}

const byFile = dead.reduce<Record<string, DeadSymbol[]>>((acc, d) => {
  acc[d.file] = acc[d.file] || [];
  acc[d.file].push(d);
  return acc;
}, {});

for (const file of Object.keys(byFile).sort()) {
  console.log(`\n# ${file}`);
  for (const sym of byFile[file].sort((a, b) => a.line - b.line)) {
    console.log(`  - ${sym.name} (${sym.kind}) line ${sym.line} :: ${sym.reasons.join(', ')}`);
  }
}

console.log(`\nTotal candidates: ${dead.length}`);
