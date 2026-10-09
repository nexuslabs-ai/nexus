// Builds the spike registry for #795 from the docs dependency closures.
// Output lands in examples/registry/.generated (gitignored); serve it with
// `python3 -m http.server 4400 -d examples/registry/.generated`.
import { execFileSync } from 'node:child_process';
import {
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const registryDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(registryDir, '..', '..');
const outDir = path.join(registryDir, '.generated');
const depsDir = path.join(repoRoot, 'apps/docs/generated/dependencies');
const tailwindDir = path.join(repoRoot, 'packages/tailwind');
const providerDir = 'components/appearance/provider';

const COMPONENTS = ['button', 'card', 'dialog', 'popover', 'progress'];
const STYLES_DEPENDENCY = '@nexus/styles';
const FULL_TAILWIND = "@import 'tailwindcss' prefix(nx);";
const NO_PREFLIGHT = [
  '@layer theme, base, components, utilities;',
  "@import 'tailwindcss/theme.css' layer(theme) prefix(nx);",
  "@import 'tailwindcss/utilities.css' layer(utilities) prefix(nx) source(none);",
  "@source './';",
].join('\n');

const coreVersion = JSON.parse(
  readFileSync(path.join(repoRoot, 'packages/core/package.json'), 'utf8')
).version;

const target = (srcPath) => `@components/nexus/${srcPath}`;

function sourceFile(srcPath) {
  return {
    path: `packages/react/src/${srcPath}`,
    type: 'registry:file',
    target: target(srcPath),
  };
}

function readClosure(slug) {
  return JSON.parse(readFileSync(path.join(depsDir, `${slug}.json`), 'utf8'));
}

function componentItem(closure) {
  return {
    name: closure.slug,
    type: 'registry:component',
    registryDependencies: [STYLES_DEPENDENCY],
    dependencies: closure.install.map(({ name, range }) => `${name}@${range}`),
    files: [...closure.files, ...closure.copy].sort().map(sourceFile),
  };
}

function appearanceProviderItem() {
  const files = readdirSync(path.join(repoRoot, 'packages/react/src', providerDir))
    .filter((name) => !name.includes('.stories.'))
    .sort();
  return {
    name: 'appearance-provider',
    type: 'registry:component',
    registryDependencies: [STYLES_DEPENDENCY],
    dependencies: [`@nexus_ds/core@${coreVersion}`],
    files: files.map((name) => sourceFile(`${providerDir}/${name}`)),
  };
}

function stylesheetItem(componentStyles) {
  const nexusCss = readFileSync(path.join(tailwindDir, 'nexus.css'), 'utf8');
  if (!nexusCss.includes(FULL_TAILWIND)) {
    throw new Error(`packages/tailwind/nexus.css no longer contains ${FULL_TAILWIND}`);
  }
  const tailwindParts = [...nexusCss.matchAll(/^@import '\.\/(.+)';$/gm)].map(
    ([, name]) => name
  );
  const entry = [
    nexusCss.replace(FULL_TAILWIND, NO_PREFLIGHT),
    "@import 'tw-animate-css';",
    ...componentStyles.map((srcPath) => `@import './${srcPath}';`),
    '',
  ].join('\n');
  writeFileSync(path.join(outDir, 'nexus.css'), entry);

  return {
    name: 'styles',
    type: 'registry:file',
    dependencies: ['tw-animate-css@^1.4.0'],
    files: [
      {
        path: path.relative(repoRoot, path.join(outDir, 'nexus.css')),
        type: 'registry:file',
        target: target('nexus.css'),
      },
      ...tailwindParts.map((name) => ({
        path: path.relative(repoRoot, path.join(tailwindDir, name)),
        type: 'registry:file',
        target: target(name),
      })),
      ...componentStyles.map(sourceFile),
    ],
  };
}

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

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
execFileSync('node', ['apps/docs/scripts/generate-dependencies.mjs'], {
  cwd: repoRoot,
  stdio: 'inherit',
});
const closures = COMPONENTS.map(readClosure);
const componentStyles = [
  ...new Set(closures.flatMap((closure) => closure.styles)),
].sort();

const registry = {
  $schema: 'https://ui.shadcn.com/schema/registry.json',
  name: 'nexus',
  homepage: 'https://github.com/nexuslabs-ai/nexus',
  items: [
    ...closures.map(componentItem),
    appearanceProviderItem(),
    stylesheetItem(componentStyles),
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
