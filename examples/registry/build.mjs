// Builds the spike registry for #795 from the docs dependency closures.
// Output lands in examples/registry/.generated (gitignored); serve it with
// `python3 -m http.server 4400 -d examples/registry/.generated`.
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const registryDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(registryDir, '..', '..');
const outDir = path.join(registryDir, '.generated');
const depsDir = path.join(repoRoot, 'apps/docs/generated/dependencies');

const COMPONENTS = ['button', 'card', 'dialog', 'popover', 'progress'];
const TAILWIND_PARTS = [
  'variables.css',
  'typography-utilities.css',
  'borderwidth-utilities.css',
  'border-color-aliases.css',
  'motion-utilities.css',
  'spacing-utilities.css',
];
const FULL_TAILWIND = "@import 'tailwindcss' prefix(nx);";
const NO_PREFLIGHT = [
  '@layer theme, base, components, utilities;',
  "@import 'tailwindcss/theme.css' layer(theme) prefix(nx);",
  "@import 'tailwindcss/utilities.css' layer(utilities) prefix(nx) source(none);",
  "@source './';",
].join('\n');

const target = (srcPath) => `@components/nexus/${srcPath}`;

function sourceFile(srcPath) {
  return {
    path: `packages/react/src/${srcPath}`,
    type: 'registry:file',
    target: target(srcPath),
  };
}

function componentItem(slug) {
  const deps = JSON.parse(
    readFileSync(path.join(depsDir, `${slug}.json`), 'utf8')
  );
  return {
    name: slug,
    type: 'registry:component',
    dependencies: deps.install.map(({ name, range }) => `${name}@${range}`),
    files: [...deps.files, ...deps.copy].sort().map(sourceFile),
  };
}

const appearanceProvider = {
  name: 'appearance-provider',
  type: 'registry:component',
  dependencies: ['@nexus_ds/core@0.4.0'],
  files: ['factory.tsx', 'index.ts', 'provider.tsx', 'script.tsx', 'server.ts']
    .map((name) => `components/appearance/provider/${name}`)
    .map(sourceFile),
};

function writeStylesheet() {
  const nexusCss = readFileSync(
    path.join(repoRoot, 'packages/tailwind/nexus.css'),
    'utf8'
  );
  if (!nexusCss.includes(FULL_TAILWIND)) {
    throw new Error(`packages/tailwind/nexus.css no longer contains ${FULL_TAILWIND}`);
  }
  const entry = [
    nexusCss.replace(FULL_TAILWIND, NO_PREFLIGHT),
    "@import 'tw-animate-css';",
    "@import './components/progress/progress.css';",
    '',
  ].join('\n');
  writeFileSync(path.join(outDir, 'nexus.css'), entry);
}

const stylesheet = {
  name: 'styles',
  type: 'registry:file',
  dependencies: ['tw-animate-css@^1.4.0'],
  files: [
    {
      path: path.relative(repoRoot, path.join(outDir, 'nexus.css')),
      type: 'registry:file',
      target: target('nexus.css'),
    },
    ...TAILWIND_PARTS.map((name) => ({
      path: `packages/tailwind/${name}`,
      type: 'registry:file',
      target: target(name),
    })),
    sourceFile('components/progress/progress.css'),
  ],
};

// Records which source transforms the CLI applies: directive, leading
// comment, a direct icon import, an @/ alias import and an @/ string.
const transformProbe = {
  name: 'transform-probe',
  type: 'registry:component',
  files: [
    {
      path: 'examples/registry/probe/transform-probe.tsx',
      type: 'registry:component',
      target: target('probe/as-component.tsx'),
    },
    {
      path: 'examples/registry/probe/transform-probe.tsx',
      type: 'registry:file',
      target: target('probe/as-file.tsx'),
    },
  ],
};

// Negative control: a bare registryDependencies name resolves against the
// default shadcn registry, not this one.
const bareDependency = {
  name: 'button-bare-dependency',
  type: 'registry:component',
  registryDependencies: ['utils'],
  files: [],
};

mkdirSync(outDir, { recursive: true });
execFileSync('node', ['apps/docs/scripts/generate-dependencies.mjs'], {
  cwd: repoRoot,
  stdio: 'inherit',
});
writeStylesheet();

const registry = {
  $schema: 'https://ui.shadcn.com/schema/registry.json',
  name: 'nexus',
  homepage: 'https://github.com/nexuslabs-ai/nexus',
  items: [
    ...COMPONENTS.map(componentItem),
    appearanceProvider,
    stylesheet,
    transformProbe,
    bareDependency,
  ],
};
const registryPath = path.join(outDir, 'registry.json');
writeFileSync(registryPath, `${JSON.stringify(registry, null, 2)}\n`);

execFileSync(
  'npx',
  [
    '-y',
    'shadcn@4.21.0',
    'build',
    path.relative(repoRoot, registryPath),
    '--output',
    path.relative(repoRoot, path.join(outDir, 'r')),
  ],
  { cwd: repoRoot, stdio: 'inherit' }
);
