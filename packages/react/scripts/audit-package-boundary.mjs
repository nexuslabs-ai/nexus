import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(scriptDir, '..');
const repoRoot = path.resolve(packageRoot, '../..');
const packageJsonPath = path.join(packageRoot, 'package.json');
const sourceIndexPath = path.join(packageRoot, 'src', 'index.ts');
const sourceAppearancePath = path.join(
  packageRoot,
  'src',
  'appearance',
  'index.ts'
);
const distIndexPath = path.join(packageRoot, 'dist', 'index.mjs');
const distAppearancePath = path.join(packageRoot, 'dist', 'appearance.mjs');
const distAppearanceServerPath = path.join(
  packageRoot,
  'dist',
  'appearance-server.mjs'
);
const distAppearanceServerCjsPath = path.join(
  packageRoot,
  'dist',
  'appearance-server.js'
);

const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
const failures = [];

function rel(file) {
  return path.relative(repoRoot, file);
}

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function hasUseClientDirective(source) {
  return /^['"]use client['"];/.test(source);
}

function readBundleWithLocalImports(entryPath) {
  const seen = new Set();
  const stack = [entryPath];
  let source = '';

  while (stack.length) {
    const file = stack.pop();
    if (!file || seen.has(file) || !existsSync(file)) continue;
    seen.add(file);
    const content = readFileSync(file, 'utf8');
    source += `\n/* ${rel(file)} */\n${content}`;

    for (const match of content.matchAll(
      /(?:from\s+|require\()["'](\.\/[^"']+)["']/g
    )) {
      stack.push(path.resolve(path.dirname(file), match[1]));
    }
  }

  return source;
}

assert(
  packageJson.dependencies?.['@nexus/core'] === 'workspace:*',
  '@nexus/core must be a runtime dependency of @nexus/react.'
);
assert(
  packageJson.peerDependencies?.['@nexus/core'] === undefined,
  '@nexus/core must not remain an optional peer dependency.'
);
assert(
  packageJson.devDependencies?.['@nexus/core'] === undefined,
  '@nexus/core must not remain devDependency-only.'
);
assert(
  packageJson.peerDependenciesMeta?.['@nexus/core'] === undefined,
  '@nexus/core peerDependenciesMeta must be removed.'
);

const sourceIndex = readFileSync(sourceIndexPath, 'utf8');
const sourceAppearance = readFileSync(sourceAppearancePath, 'utf8');

assert(
  hasUseClientDirective(sourceAppearance),
  `${rel(sourceAppearancePath)} must mark the appearance runtime as a client entry.`
);
assert(
  !sourceIndex.includes('@nexus/core'),
  `${rel(sourceIndexPath)} must not import @nexus/core from the main entry.`
);
assert(
  !/NexusAppearanceSettings|NexusThemeQuickControl/.test(sourceAppearance),
  `${rel(sourceAppearancePath)} must export runtime APIs only, not console editor UI.`
);
assert(
  !/NexusAppearanceScript/.test(sourceAppearance),
  `${rel(sourceAppearancePath)} must not export the server-only appearance script. Use @nexus/react/appearance/server.`
);

if (existsSync(distIndexPath)) {
  const distIndex = readFileSync(distIndexPath, 'utf8');
  assert(
    !distIndex.includes('@nexus/core'),
    `${rel(distIndexPath)} must stay core-free.`
  );
}

if (existsSync(distAppearancePath)) {
  const distAppearance = readFileSync(distAppearancePath, 'utf8');
  assert(
    hasUseClientDirective(distAppearance),
    `${rel(distAppearancePath)} must preserve the client directive.`
  );
  assert(
    distAppearance.includes('@nexus/core'),
    `${rel(distAppearancePath)} should consume the external @nexus/core runtime.`
  );
  assert(
    !/NexusAppearanceSettings|NexusThemeQuickControl/.test(distAppearance),
    `${rel(distAppearancePath)} must not ship console editor UI.`
  );
  assert(
    !/NexusAppearanceScript/.test(distAppearance),
    `${rel(distAppearancePath)} must not export the server-only appearance script.`
  );
}

for (const serverEntryPath of [
  distAppearanceServerPath,
  distAppearanceServerCjsPath,
]) {
  if (!existsSync(serverEntryPath)) continue;

  const distAppearanceServer = readBundleWithLocalImports(serverEntryPath);
  assert(
    distAppearanceServer.includes('@nexus/core'),
    `${rel(serverEntryPath)} should consume the external @nexus/core runtime.`
  );
  assert(
    !/createContext|useState|useEffect|useRef|useMemo|useCallback|useContext/.test(
      distAppearanceServer
    ),
    `${rel(serverEntryPath)} must stay server-safe and hook-free.`
  );
  assert(
    !/NexusAppearanceProvider|useNexusAppearance/.test(distAppearanceServer),
    `${rel(serverEntryPath)} must not import the client provider.`
  );
}

if (failures.length) {
  throw new Error(failures.join('\n'));
}

console.log('@nexus/react package boundary clean.');
