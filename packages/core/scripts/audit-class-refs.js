import { __unstable__loadDesignSystem, compile } from '@tailwindcss/node';
import { Scanner } from '@tailwindcss/oxide';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..', '..');
const PACKAGE_ROOT = path.resolve(__dirname, '..');
const RUNTIME_ENTRY = path.join(PACKAGE_ROOT, 'dist', 'runtime', 'index.js');

const TARGETS = [
  {
    css: 'packages/react/.storybook/preview.css',
    sources: 'packages/react/src',
  },
  { css: 'apps/docs/app/globals.css', sources: 'apps/docs' },
  { css: 'apps/console/src/App.css', sources: 'apps/console/src' },
];

// The primitive/unknown `--nx-color-*` ban applies only to component code:
// apps are consumers (free to reach for primitives) and non-component
// `react/src` is internal plumbing. Components are the public surface.
const COMPONENTS_DIR = path.join(
  REPO_ROOT,
  'packages',
  'react',
  'src',
  'components'
);

const SOURCE_FILE = /\.(tsx?|jsx?|mjs|mdx)$/;
const SKIPPED_FILE =
  /(\/node_modules\/|\/dist\/|\/\.next\/|\/generated\/|\/__generated__\/|\.test\.tsx?$)/;
const STORY_FILE = /\.stories\.tsx?$/;

// Put this marker in a comment on the line above to skip that line's
// candidates, e.g. a class name written as prose.
const IGNORE_NEXT_LINE = 'audit-class-refs-ignore-next-line';

// `group` / `peer` (and their `/name` forms) are markers that variants key
// off; Tailwind emits no CSS for them by design.
const VARIANT_MARKER = /^nx:(group|peer)(\/[\w-]+)?$/;

// Custom properties set at runtime rather than in CSS: Radix's `--radix-*`,
// and component inline-style keys or `style.setProperty` calls.
const LIBRARY_RUNTIME_VAR = /^--radix-/;
const RUNTIME_VAR_DECLARATIONS = [
  /['"](--[\w-]+)['"]\s*:/g,
  /setProperty\(\s*['"](--[\w-]+)['"]/g,
];

const VAR_WITHOUT_FALLBACK = /var\(\s*(--[\w-]+)\s*\)/g;
// v3's `nx:bg-[--x]` emits `background-color: --x;`. Custom properties and
// the properties below take a `--name` value legitimately.
const BARE_VAR_DECLARATION = /([\w-]+)\s*:\s*(--[\w-]+)\s*(?:!important\s*)?;/g;
const DASHED_IDENT_PROPERTIES = new Set([
  'anchor-name',
  'position-anchor',
  'animation-name',
  'animation-timeline',
  'scroll-timeline-name',
  'view-timeline-name',
  'timeline-scope',
  'view-transition-name',
  'view-transition-class',
  'container-name',
  'font-palette',
  'position-try',
  'position-try-fallbacks',
]);

function isDashedIdentProperty(property) {
  return property.startsWith('--') || DASHED_IDENT_PROPERTIES.has(property);
}

// If one of these is not caught, the Tailwind internals the audit relies on
// have changed shape.
const CANARIES = {
  unknown: 'nx:audit-canary-not-a-class',
  undeclaredVar: 'nx:bg-(--audit-canary-undeclared)',
  bareVar: 'nx:bg-[--audit-canary-bare]',
};

async function loadSemanticRegistryNames() {
  const runtime = await import(pathToFileURL(RUNTIME_ENTRY).href);
  const registry = runtime.SEMANTIC_TOKEN_REGISTRY;
  if (!Array.isArray(registry)) {
    throw new Error(
      'audit-class-refs: @nexus_ds/core dist is missing SEMANTIC_TOKEN_REGISTRY — run `pnpm --filter @nexus_ds/core build` first.'
    );
  }
  return new Set(registry.map((token) => token.name));
}

function isAllowedRuntimeColorVar(name, registryNames) {
  if (name.endsWith('-')) {
    for (const registryName of registryNames) {
      if (registryName.startsWith(name)) return true;
    }
  }

  return registryNames.has(name);
}

function findRuntimeColorVarRefs(content) {
  const hits = [];
  for (const match of content.matchAll(/--nx-color-([a-z][a-z0-9-]*)/g)) {
    hits.push({ name: match[1], offset: match.index });
  }
  return hits;
}

function lineOf(content, offset) {
  return content.slice(0, offset).split('\n').length;
}

function relative(file) {
  return path.relative(REPO_ROOT, file);
}

function scanSources(sourceDir) {
  const scanner = new Scanner({
    sources: [
      {
        base: path.join(REPO_ROOT, sourceDir),
        pattern: '**/*',
        negated: false,
      },
    ],
  });
  const occurrences = new Map();
  const runtimeVars = new Set();
  const files = scanner.files.filter(
    (file) => SOURCE_FILE.test(file) && !SKIPPED_FILE.test(file)
  );

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    if (!STORY_FILE.test(file)) {
      for (const re of RUNTIME_VAR_DECLARATIONS) {
        for (const match of content.matchAll(re)) runtimeVars.add(match[1]);
      }
    }
    const lines = content.split('\n');
    const found = scanner.getCandidatesWithPositions({
      content,
      extension: path.extname(file).slice(1),
    });
    for (const { candidate, position } of found) {
      if (!candidate.startsWith('nx:')) continue;
      const line = lineOf(content, position);
      if (lines[line - 2]?.includes(IGNORE_NEXT_LINE)) continue;
      if (!occurrences.has(candidate)) occurrences.set(candidate, []);
      occurrences.get(candidate).push(`${relative(file)}:${line}`);
    }
  }
  return { files, occurrences, runtimeVars };
}

function diagnose(candidate, emitted, declared) {
  if (emitted === null) {
    return VARIANT_MARKER.test(candidate) ? null : { kind: 'unknown' };
  }
  const bare = [...emitted.matchAll(BARE_VAR_DECLARATION)]
    .filter(([, property]) => !isDashedIdentProperty(property))
    .map(([, , name]) => name);
  if (bare.length > 0) return { kind: 'bareVar', names: bare };

  const missing = new Set();
  for (const match of emitted.matchAll(VAR_WITHOUT_FALLBACK)) {
    const name = match[1];
    if (declared.has(name) || LIBRARY_RUNTIME_VAR.test(name)) continue;
    missing.add(name);
  }
  if (missing.size > 0) return { kind: 'undeclaredVar', names: [...missing] };
  return null;
}

function assertDetectionWorks(css, designSystem, declared, files, candidates) {
  if (files.length === 0) {
    throw new Error(`audit-class-refs: ${css} scanned 0 source files.`);
  }
  if (candidates.length === 0) {
    throw new Error(`audit-class-refs: ${css} found 0 nx: candidates.`);
  }
  const canaries = Object.entries(CANARIES);
  const emitted = designSystem.candidatesToCss(canaries.map(([, c]) => c));
  canaries.forEach(([kind, candidate], index) => {
    if (diagnose(candidate, emitted[index], declared)?.kind === kind) return;
    throw new Error(
      `audit-class-refs: canary ${candidate} was not reported as ${kind} for ${css} — the Tailwind APIs this audit relies on have changed.`
    );
  });
}

async function auditTarget({ css, sources }) {
  const cssPath = path.join(REPO_ROOT, css);
  const input = fs.readFileSync(cssPath, 'utf8');
  const base = path.dirname(cssPath);
  const designSystem = await __unstable__loadDesignSystem(input, { base });
  const compiler = await compile(input, { base, onDependency() {} });

  const { files, occurrences, runtimeVars } = scanSources(sources);
  const candidates = [...occurrences.keys()];

  const stylesheet = compiler.build(candidates);
  const declared = new Set(runtimeVars);
  for (const match of stylesheet.matchAll(/(--[\w-]+)\s*:/g)) {
    declared.add(match[1]);
  }
  for (const match of stylesheet.matchAll(/@property\s+(--[\w-]+)/g)) {
    declared.add(match[1]);
  }

  assertDetectionWorks(css, designSystem, declared, files, candidates);

  const classCss = designSystem.candidatesToCss(candidates);
  const findings = { unknown: [], undeclaredVar: [], bareVar: [] };
  candidates.forEach((candidate, index) => {
    const problem = diagnose(candidate, classCss[index], declared);
    if (!problem) return;
    findings[problem.kind].push({
      candidate,
      names: problem.names,
      at: occurrences.get(candidate),
    });
  });

  return { scanned: files.length, ...findings };
}

function findPrimitiveComponentColorVars(registryNames) {
  const scanner = new Scanner({
    sources: [{ base: COMPONENTS_DIR, pattern: '**/*', negated: false }],
  });
  const refs = [];
  for (const file of scanner.files.filter((f) => SOURCE_FILE.test(f))) {
    const content = fs.readFileSync(file, 'utf8');
    const seen = new Set();
    for (const hit of findRuntimeColorVarRefs(content)) {
      if (isAllowedRuntimeColorVar(hit.name, registryNames)) continue;
      if (seen.has(hit.name)) continue;
      seen.add(hit.name);
      refs.push({
        file: relative(file),
        line: lineOf(content, hit.offset),
        name: hit.name,
      });
    }
  }
  return refs;
}

function mergeByCandidate(findings) {
  const merged = new Map();
  for (const finding of findings) {
    const existing = merged.get(finding.candidate);
    if (existing) existing.at.push(...finding.at);
    else merged.set(finding.candidate, { ...finding, at: [...finding.at] });
  }
  return [...merged.values()];
}

function write(line) {
  process.stdout.write(`${line}\n`);
}

async function main() {
  const registryNames = await loadSemanticRegistryNames();
  const results = await Promise.all(TARGETS.map(auditTarget));
  const primitiveVarRefs = findPrimitiveComponentColorVars(registryNames);

  const scanned = results.reduce((sum, r) => sum + r.scanned, 0);
  const unknownClasses = mergeByCandidate(results.flatMap((r) => r.unknown));
  const undeclaredVars = mergeByCandidate(
    results.flatMap((r) => r.undeclaredVar)
  );
  const bareVars = mergeByCandidate(results.flatMap((r) => r.bareVar));
  const failures =
    unknownClasses.length +
    undeclaredVars.length +
    bareVars.length +
    primitiveVarRefs.length;

  if (failures === 0) {
    write(
      `audit-class-refs: scanned ${scanned} files — every nx: class emits CSS, every var() it reads is declared and no value is a bare --name, and component color vars are semantic.`
    );
    process.exit(0);
  }

  if (unknownClasses.length > 0) {
    write(
      `audit-class-refs: ${unknownClasses.length} nx: class(es) Tailwind emits no CSS for:`
    );
    for (const { candidate, at } of unknownClasses) {
      write(`  ${candidate}`);
      for (const location of at) write(`    ${location}`);
    }
  }

  if (undeclaredVars.length > 0) {
    write(
      `audit-class-refs: ${undeclaredVars.length} nx: class(es) read a custom property with no fallback that nothing declares:`
    );
    for (const { candidate, names, at } of undeclaredVars) {
      write(`  ${candidate}  → ${names.join(', ')}`);
      for (const location of at) write(`    ${location}`);
    }
  }

  if (bareVars.length > 0) {
    write(
      `audit-class-refs: ${bareVars.length} nx: class(es) emit a bare custom property as a value — write \`(--x)\`, not \`[--x]\`:`
    );
    for (const { candidate, names, at } of bareVars) {
      write(`  ${candidate}  → ${names.join(', ')}`);
      for (const location of at) write(`    ${location}`);
    }
  }

  if (primitiveVarRefs.length > 0) {
    write(
      `audit-class-refs: ${primitiveVarRefs.length} primitive/unknown component color var ref(s):`
    );
    for (const f of primitiveVarRefs) {
      write(
        `  ${f.file}:${f.line}  --nx-color-${f.name}  (component code must use semantic color vars)`
      );
    }
  }
  process.exit(1);
}

main().catch((error) => {
  process.stderr.write(
    `${error instanceof Error ? error.message : String(error)}\n`
  );
  process.exit(1);
});
