import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..', '..');
const NEXUS_CSS = path.join(REPO_ROOT, 'packages', 'tailwind', 'nexus.css');
const SOURCE_DIRS = [
  path.join(REPO_ROOT, 'packages', 'react', 'src'),
  path.join(REPO_ROOT, 'apps'),
];

// Prefixes whose value-slot we own as semantic tokens. Anything that starts
// with one of these (after the utility prefix) must resolve to a --color-*
// variable in the emitted CSS. Other class names — including Tailwind
// built-ins like text-sm, border-2, bg-transparent — fall through this
// allowlist and are not validated.
const SEMANTIC_PREFIXES = [
  'background',
  'foreground',
  'container',
  'popover',
  'muted',
  'primary',
  'secondary',
  'error',
  'success',
  'warning',
  'information',
  'border',
  'overlay',
  'disabled',
  'accent', // not a real token in Nexus — surfaces the migration bug
];

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

function loadEmittedColorNames() {
  const css = fs.readFileSync(NEXUS_CSS, 'utf8');
  const set = new Set();
  for (const match of css.matchAll(/--color-([a-z0-9-]+):/g)) {
    set.add(match[1]);
  }
  return set;
}

function isSemanticName(name) {
  for (const prefix of SEMANTIC_PREFIXES) {
    if (name === prefix || name.startsWith(`${prefix}-`)) return true;
  }
  return false;
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

function lineOf(content, offset) {
  return content.slice(0, offset).split('\n').length;
}

function main() {
  const known = loadEmittedColorNames();
  const failures = [];
  let scanned = 0;

  for (const dir of SOURCE_DIRS) {
    for (const file of walkSources(dir)) {
      scanned += 1;
      const content = fs.readFileSync(file, 'utf8');
      const seen = new Set();
      for (const hit of findClassRefs(content)) {
        if (!isSemanticName(hit.name)) continue;
        if (known.has(hit.name)) continue;
        const key = `${file}:${hit.name}`;
        if (seen.has(key)) continue;
        seen.add(key);
        failures.push({
          file: path.relative(REPO_ROOT, file),
          line: lineOf(content, hit.offset),
          name: hit.name,
        });
      }
    }
  }

  if (failures.length === 0) {
    process.stdout.write(
      `audit-class-refs: scanned ${scanned} files — all semantic color refs resolve.\n`
    );
    process.exit(0);
  }

  process.stdout.write(
    `audit-class-refs: scanned ${scanned} files — ${failures.length} unresolved semantic color ref(s):\n`
  );
  for (const f of failures) {
    process.stdout.write(
      `  ${f.file}:${f.line}  nx:…-${f.name}  (no --color-${f.name} in nexus.css)\n`
    );
  }
  process.exit(1);
}

main();
