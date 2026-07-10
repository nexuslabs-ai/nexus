import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..', '..');
const PACKAGE_ROOT = path.resolve(__dirname, '..');
const RUNTIME_ENTRY = path.join(PACKAGE_ROOT, 'dist', 'runtime', 'index.js');
const CLASS_SOURCE_DIRS = [
  path.join(REPO_ROOT, 'packages', 'react', 'src'),
  path.join(REPO_ROOT, 'apps'),
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

// Deleted/foreign shadcn-style families are not in the registry, but a class
// using one is still trying to reach the semantic-token layer.
const RETIRED_SEMANTIC_FAMILIES = ['accent'];

// Utility prefixes that consume a color-like value (e.g., `nx:bg-X`, `nx:text-X`).
const UTILITY_PREFIXES = [
  'bg',
  'text',
  'border',
  'ring',
  'fill',
  'stroke',
  'outline',
  'shadow',
  'divide',
];

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

function semanticFamily(name) {
  return name.split('-')[0];
}

function semanticFamiliesFromRegistry(registryNames) {
  const families = new Set(RETIRED_SEMANTIC_FAMILIES);
  for (const name of registryNames) {
    families.add(semanticFamily(name));
  }
  return families;
}

function isSemanticName(name, semanticFamilies) {
  return semanticFamilies.has(semanticFamily(name));
}

function isAllowedRuntimeColorVar(name, registryNames) {
  if (name.endsWith('-')) {
    for (const registryName of registryNames) {
      if (registryName.startsWith(name)) return true;
    }
  }

  return registryNames.has(name);
}

function* walkSources(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walkSources(full);
    } else if (/\.(tsx?|jsx?|mdx?)$/.test(entry.name)) {
      yield full;
    }
  }
}

function findClassRefs(content) {
  // Match: nx:<optional state chain>:(utility)-<color-name>
  // State chain segments may be:
  //   - bare words like `hover:`, `focus:`, `focus-visible:`, `dark:`
  //   - words with arbitrary-value suffix like `data-[state=open]:`
  //   - pure arbitrary selectors like `[&_svg]:`
  // The leading `nx:` is anchored at a non-word boundary so `foonx:` does not
  // match.
  const utilityAlt = UTILITY_PREFIXES.join('|');
  const re = new RegExp(
    String.raw`(?:^|[^\w-])nx:(?:[a-z-]+(?:\[[^\]]+\])?:|\[[^\]]+\]:)*(?:${utilityAlt})-([a-z][a-z0-9-]*)`,
    'g'
  );
  const hits = [];
  for (const match of content.matchAll(re)) {
    hits.push({ name: match[1], offset: match.index });
  }
  return hits;
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

async function main() {
  const known = await loadSemanticRegistryNames();
  const semanticFamilies = semanticFamiliesFromRegistry(known);
  const unresolvedClassRefs = [];
  const primitiveVarRefs = [];
  let scanned = 0;

  for (const dir of CLASS_SOURCE_DIRS) {
    for (const file of walkSources(dir)) {
      scanned += 1;
      const content = fs.readFileSync(file, 'utf8');

      const seenClassRefs = new Set();
      for (const hit of findClassRefs(content)) {
        // Documentation placeholders like `nx:bg-chart-categorical-N` are not
        // real class refs; the regex stops before the uppercase placeholder.
        if (hit.name.endsWith('-')) continue;
        if (!isSemanticName(hit.name, semanticFamilies)) continue;
        if (known.has(hit.name)) continue;
        const key = `${file}:${hit.name}`;
        if (seenClassRefs.has(key)) continue;
        seenClassRefs.add(key);
        unresolvedClassRefs.push({
          file: path.relative(REPO_ROOT, file),
          line: lineOf(content, hit.offset),
          name: hit.name,
        });
      }

      // Component code must reach color only through semantic runtime vars.
      if (!file.startsWith(`${COMPONENTS_DIR}${path.sep}`)) continue;

      const seenVarRefs = new Set();
      for (const hit of findRuntimeColorVarRefs(content)) {
        if (isAllowedRuntimeColorVar(hit.name, known)) continue;
        const key = `${file}:${hit.name}`;
        if (seenVarRefs.has(key)) continue;
        seenVarRefs.add(key);
        primitiveVarRefs.push({
          file: path.relative(REPO_ROOT, file),
          line: lineOf(content, hit.offset),
          name: hit.name,
        });
      }
    }
  }

  if (unresolvedClassRefs.length === 0 && primitiveVarRefs.length === 0) {
    process.stdout.write(
      `audit-class-refs: scanned ${scanned} files — all semantic color refs resolve and component color vars are semantic.\n`
    );
    process.exit(0);
  }

  if (unresolvedClassRefs.length > 0) {
    process.stdout.write(
      `audit-class-refs: scanned ${scanned} files — ${unresolvedClassRefs.length} unresolved semantic color class ref(s):\n`
    );
    for (const f of unresolvedClassRefs) {
      process.stdout.write(
        `  ${f.file}:${f.line}  nx:...-${f.name}  (not in SEMANTIC_TOKEN_REGISTRY)\n`
      );
    }
  }

  if (primitiveVarRefs.length > 0) {
    process.stdout.write(
      `audit-class-refs: found ${primitiveVarRefs.length} primitive/unknown component color var ref(s):\n`
    );
    for (const f of primitiveVarRefs) {
      process.stdout.write(
        `  ${f.file}:${f.line}  --nx-color-${f.name}  (component code must use semantic color vars)\n`
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
