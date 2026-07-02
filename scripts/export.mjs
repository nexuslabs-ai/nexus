/**
 * `pnpm export` — scaffold a standalone, rebranded design-system MONOREPO from
 * this repo. The produced workspace forks `packages/react` + generates
 * `packages/tailwind` as owned/publishable packages, and depends on the
 * published `@nexus_ds/core` (runtime engine) + `@nexus_ds/eslint-plugin` (dev).
 *
 * Interim stopgap ahead of the CLI (registry + 3-way merge). See issue #541.
 *
 * This file holds the pure, side-effect-free helpers (unit-tested in
 * `export.test.js`). The CLI orchestration lives below the helpers behind an
 * `import.meta.url` guard so importing this module runs nothing.
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// Package names that are PUBLISHED upstream deps — never rebranded into the fork.
export const KEEP_PACKAGES = ['@nexus_ds/core', '@nexus_ds/eslint-plugin'];

// Workspace packages forked into the produced repo — rebranded to the target scope.
export const REBRAND_PACKAGES = ['@nexus_ds/react', '@nexus_ds/tailwind'];

// Token-shaping config axes fed to the `@nexus_ds/core` tailwind generator.
export const TOKEN_CONFIG_KEYS = [
  'base',
  'brand',
  'radius',
  'borderwidth',
  'shadow',
  'motion',
  'spacingDefault',
];

// Defaults mirror `DEFAULT_CONFIG` in packages/core/scripts/utils.js.
export const DEFAULT_TOKEN_CONFIG = {
  base: 'stone',
  brand: 'black',
  radius: 'square',
  borderwidth: 'normal',
  shadow: 'quiet',
  motion: 'snappy',
  spacingDefault: 'default',
};

// Appearance-provider wiring presets. Each maps a product policy onto the real
// `createNexusAppearance` knobs — no invented provider API. See #541 notes.
export const POLICY_PRESETS = {
  // Product owner sets the appearance; end-users can't change it.
  locked: { storageKey: false, cookieWriteKey: false },
  // End-users pick; their choice persists to localStorage.
  user: { storageKey: 'nexus-appearance' },
  // Appearance seeded per request via cookie (multi-tenant SSR).
  tenant: { cookieWriteKey: 'nexus-appearance' },
};

export const POLICY_OPTIONS = Object.keys(POLICY_PRESETS);

/**
 * Derive an npm scope (`@examlly`) from a product name (`examlly-design-system`)
 * when `--scope` is not given: take the first `-`/`_`-delimited segment.
 */
export function deriveScope(name, explicitScope) {
  if (explicitScope) {
    if (!explicitScope.startsWith('@')) {
      throw new Error(`--scope must start with "@" (got "${explicitScope}").`);
    }
    return explicitScope;
  }
  const first = String(name)
    .trim()
    .toLowerCase()
    .split(/[-_/\s]/)[0]
    .replace(/[^a-z0-9]/g, '');
  if (!first) {
    throw new Error(
      `Cannot derive a scope from name "${name}". Pass --scope=@your-scope.`
    );
  }
  return `@${first}`;
}

/**
 * Enumerate valid token-config values from the committed token files, the same
 * way the generator discovers them: base/brand from
 * `tokens/semantic/{base,brands}-{value}-{light|dark}.json`,
 * radius/borderwidth/shadow/motion from `tokens/primitives/{category}/`, and
 * spacingDefault from `tokens/semantic/spacing-{mode}.json`.
 */
export function discoverTokenChoices(tokensDir) {
  const semanticDir = path.join(tokensDir, 'semantic');
  const primitivesDir = path.join(tokensDir, 'primitives');

  const semanticModes = (prefix) => {
    const seen = new Set();
    for (const file of fs.readdirSync(semanticDir)) {
      const match = file.match(new RegExp(`^${prefix}-(.+)-(?:light|dark)\\.json$`));
      if (match) {
        seen.add(match[1]);
      }
    }
    return [...seen].sort();
  };

  const primitiveModes = (category) => {
    const dir = path.join(primitivesDir, category);
    if (!fs.existsSync(dir)) {
      return [];
    }
    const seen = new Set();
    for (const file of fs.readdirSync(dir)) {
      const match = file.match(new RegExp(`^${category}-(.+?)(?:-(?:light|dark))?\\.json$`));
      if (match) {
        seen.add(match[1]);
      }
    }
    return [...seen].sort();
  };

  // Spacing modes ship as `semantic/spacing-{mode}.json` (no light/dark split),
  // matching the generator's own `^spacing-([a-z]+)\.json$` discovery.
  const spacingModes = () => {
    const seen = new Set();
    for (const file of fs.readdirSync(semanticDir)) {
      const match = file.match(/^spacing-([a-z]+)\.json$/);
      if (match) {
        seen.add(match[1]);
      }
    }
    return [...seen].sort();
  };

  return {
    base: semanticModes('base'),
    brand: semanticModes('brands'),
    radius: primitiveModes('radius'),
    borderwidth: primitiveModes('borderwidth'),
    shadow: primitiveModes('shadow'),
    motion: primitiveModes('motion'),
    spacingDefault: spacingModes(),
  };
}

/**
 * Validate the chosen token config up-front against the discoverable value sets,
 * so an unknown value fails with a clean message instead of a mid-generation
 * throw. An empty valid-set for a key means "unconstrained here".
 */
export function validateTokenConfig(tokenConfig, validChoices) {
  for (const key of TOKEN_CONFIG_KEYS) {
    const valid = validChoices[key];
    const value = tokenConfig[key];
    if (valid && valid.length > 0 && !valid.includes(value)) {
      throw new Error(
        `Invalid --${key}="${value}". Valid values: ${valid.join(', ')}.`
      );
    }
  }
}

/**
 * Parse `--key=value` flags (and the boolean `--force`) into a structured export
 * config. Token values are validated against `validChoices` (inject a fixed map
 * in tests; the CLI passes `discoverTokenChoices`).
 */
export function parseExportArgs(argv, { validChoices } = {}) {
  const flags = {};
  for (const arg of argv) {
    if (arg === '--force') {
      flags.force = 'true';
      continue;
    }
    const match = arg.match(/^--([\w-]+)=(.*)$/);
    if (!match) {
      throw new Error(`Invalid flag "${arg}". Use --key=value (or --force).`);
    }
    flags[match[1]] = match[2];
  }

  if (!flags.name) {
    throw new Error('Missing required --name (e.g. --name=examlly-design-system).');
  }

  const name = flags.name;
  const scope = deriveScope(name, flags.scope);
  const policy = flags.policy ?? 'user';
  if (!POLICY_OPTIONS.includes(policy)) {
    throw new Error(
      `Invalid --policy="${policy}". Valid values: ${POLICY_OPTIONS.join(', ')}.`
    );
  }

  const tokenConfig = { ...DEFAULT_TOKEN_CONFIG };
  for (const key of TOKEN_CONFIG_KEYS) {
    if (flags[key] !== undefined) {
      tokenConfig[key] = flags[key];
    }
  }
  if (validChoices) {
    validateTokenConfig(tokenConfig, validChoices);
  }

  return {
    name,
    scope,
    policy,
    version: flags.version ?? '0.1.0',
    out: flags.out ?? path.join('..', name),
    force: flags.force === 'true',
    tokenConfig,
  };
}

/**
 * Rebrand copied source: rename ONLY the two forked packages
 * (`@nexus_ds/react`, `@nexus_ds/tailwind`) to the target scope, across every
 * file type (`.ts/.tsx/.css/.json/.md`). `@nexus_ds/core`,
 * `@nexus_ds/eslint-plugin`, the `@nexus_ds/no-render-prop-types` eslint-disable
 * directives, and the `nx:` / `--nx-*` prefixes are left untouched.
 */
export function rebrandContent(text, scope) {
  return REBRAND_PACKAGES.reduce(
    (out, pkg) => out.split(pkg).join(pkg.replace('@nexus_ds', scope)),
    text
  );
}

const DEP_FIELDS = [
  'dependencies',
  'devDependencies',
  'peerDependencies',
  'optionalDependencies',
];

/**
 * Guard a produced manifest against un-forked `@nexus_ds/*` deps. After the
 * transform the only `@nexus_ds/*` names that may survive are the published
 * KEEP_PACKAGES; a new workspace dep (e.g. a future `@nexus_ds/icons`) would
 * otherwise ship as an unresolved `workspace:*` range — fail loudly instead.
 */
function assertNoUnhandledNexusDeps(pkg) {
  const unhandled = [];
  for (const field of DEP_FIELDS) {
    for (const name of Object.keys(pkg[field] ?? {})) {
      if (name.startsWith('@nexus_ds/') && !KEEP_PACKAGES.includes(name)) {
        unhandled.push(`${field}.${name}`);
      }
    }
  }
  if (unhandled.length > 0) {
    throw new Error(
      `Unhandled @nexus_ds/* dependency in the forked manifest: ${unhandled.join(', ')}. ` +
        `Fork it (add to REBRAND_PACKAGES) or keep it published (add to KEEP_PACKAGES).`
    );
  }
}

/**
 * Transform the forked react package.json in place (read-modify-write): rebrand
 * the name, repoint the tailwind workspace dep to the new scope, pin the core
 * dep to a published range, and make it publishable. Structural fields (Radix
 * pins, peers, exports) are preserved so the fork can't drift from upstream.
 */
export function transformReactPackageJson(pkg, { scope, coreVersion, version }) {
  const next = structuredClone(pkg);
  next.name = `${scope}/react`;
  next.version = version;
  delete next.private;
  delete next['//'];
  next.publishConfig = { access: 'public' };

  if (next.dependencies?.['@nexus_ds/core']) {
    next.dependencies['@nexus_ds/core'] = `^${coreVersion}`;
  }
  if (next.dependencies?.['@nexus_ds/tailwind']) {
    const spec = next.dependencies['@nexus_ds/tailwind'];
    delete next.dependencies['@nexus_ds/tailwind'];
    next.dependencies[`${scope}/tailwind`] = spec;
  }

  assertNoUnhandledNexusDeps(next);
  return next;
}

/**
 * Transform the forked tailwind package.json: rebrand the name, set a real
 * version, and make it publishable. CSS exports / files / tailwindcss peer are
 * preserved from source.
 */
export function transformTailwindPackageJson(pkg, { scope, version }) {
  const next = structuredClone(pkg);
  next.name = `${scope}/tailwind`;
  next.version = version;
  delete next.private;
  next.publishConfig = { access: 'public' };

  assertNoUnhandledNexusDeps(next);
  return next;
}

/**
 * Scan component source for its intra-package deps (`@/` alias or relative),
 * bucketed by root. Comments are stripped (URLs preserved) so a commented import
 * can't leak in. Seeds the registry manifest.
 */
export function scanInternalDeps(text) {
  const withoutComments = text
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(?<!:)\/\/.*$/gm, '');
  const deps = { components: new Set(), lib: new Set(), hooks: new Set() };

  // lib/hooks carry their bucket in the path; any other cross-dir relative
  // import (`../button`) is a sibling component keyed by its directory name.
  const isModuleName = (name) => /^[\w-]+$/.test(name ?? '');
  const specRe = /(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g;
  let match;
  while ((match = specRe.exec(withoutComments)) !== null) {
    const spec = match[1];
    if (!spec.startsWith('@/') && !spec.startsWith('../')) {
      continue;
    }
    const [head, next] = spec.replace(/^(?:@\/|(?:\.\.\/)+)/, '').split('/');
    if ((head === 'lib' || head === 'hooks') && isModuleName(next)) {
      deps[head].add(next);
    } else if (head === 'components' && isModuleName(next)) {
      deps.components.add(next);
    } else if (isModuleName(head)) {
      deps.components.add(head);
    }
  }

  return {
    components: [...deps.components].sort(),
    lib: [...deps.lib].sort(),
    hooks: [...deps.hooks].sort(),
  };
}

/**
 * Build the minimal `registry.json` manifest from per-component entries
 * ({ name, files, deps }). This is the seed of the future CLI registry; nothing
 * in the export reads it back.
 */
export function buildManifest(components, { version }) {
  const sorted = [...components].sort((a, b) => a.name.localeCompare(b.name));
  const map = {};
  for (const entry of sorted) {
    map[entry.name] = { files: entry.files, deps: entry.deps };
  }
  return { version, generatedFrom: '@nexus_ds/react', components: map };
}

/**
 * Render the default appearance-provider wiring example for the chosen policy.
 * Emits a standalone illustrative file that uses the real `createNexusAppearance`
 * knobs from the published provider subentry.
 */
export function renderAppAppearanceExample(scope, policy) {
  const preset = POLICY_PRESETS[policy];
  const knobs = Object.entries(preset)
    .map(([key, value]) => `  ${key}: ${JSON.stringify(value)},`)
    .join('\n');
  const notes = {
    locked: 'the product owner sets the appearance; end-users cannot change it.',
    user: 'end-users pick their appearance; the choice persists to localStorage.',
    tenant: 'appearance is seeded per request via cookie (multi-tenant SSR).',
  };

  return `import { createNexusAppearance } from '${scope}/react/appearance';

// Appearance policy "${policy}" — ${notes[policy]}
// Swap the knobs below (storageKey / cookieWriteKey / defaultState) to change
// the policy; re-run \`pnpm export --policy=<locked|user|tenant>\` to regenerate.
export const { NexusAppearanceProvider } = createNexusAppearance({
${knobs}
});
`;
}

/** Render the produced root package.json. Versions are injected by the CLI. */
export function renderRootPackageJson({
  name,
  scope,
  eslintPluginVersion,
  toolchain,
  overrides,
}) {
  return {
    name,
    version: '0.0.0',
    private: true,
    type: 'module',
    scripts: {
      build: 'pnpm -r --if-present build',
      typecheck: 'pnpm -r --if-present typecheck',
      lint: 'eslint . --max-warnings 0',
      storybook: `pnpm --filter ${scope}/react storybook`,
      'build-storybook': `pnpm --filter ${scope}/react build-storybook`,
    },
    devDependencies: {
      ...toolchain,
      '@nexus_ds/eslint-plugin': `^${eslintPluginVersion}`,
    },
    pnpm: { overrides },
    engines: { node: '>=20.19.0' },
  };
}

/** Render the produced README. */
export function renderReadme({ name, scope, tokenConfig }) {
  const tokenRows = TOKEN_CONFIG_KEYS.map(
    (key) => `| \`${key}\` | \`${tokenConfig[key]}\` |`
  ).join('\n');

  return `# ${name}

A standalone Nexus-derived design system. The \`react\` + \`tailwind\` packages are
**yours to own and publish**; they depend on the published runtime engine
\`@nexus_ds/core\` and the lint guardrails \`@nexus_ds/eslint-plugin\`.

## Packages

- \`${scope}/react\` — components + appearance provider/editor (Storybook showcase included).
- \`${scope}/tailwind\` — design-token CSS. A future \`${scope}/vue\` / \`${scope}/svelte\`
  can depend on the same token package unchanged.

## Baseline token config

| Axis | Value |
| ---- | ----- |
${tokenRows}

Retheme at runtime via \`NexusAppearanceProvider\` (see \`examples/app-appearance.tsx\`).
The \`nx:\` utility prefix is fixed — the engine emits \`--nx-*\` variables at runtime.

## Develop

\`\`\`bash
pnpm install
pnpm build
pnpm lint
pnpm typecheck
pnpm build-storybook
\`\`\`

## Publish (order matters)

\`${scope}/tailwind\` must publish **before** \`${scope}/react\` (react depends on it):

\`\`\`bash
pnpm --filter ${scope}/tailwind publish
pnpm --filter ${scope}/react publish
\`\`\`
`;
}

// Static scaffold files (byte-identical to the source repo's irreducibles).

export const NPMRC_CONTENT = `# Flat node_modules (npm/yarn-style) rather than pnpm's default isolated store.
# Radix primitives expose inferred types that reference transitive packages
# (e.g. @radix-ui/react-context); under the isolated linker TypeScript can't
# name them portably and the .d.ts rollup fails with TS2742. Hoisting makes
# those transitive types nameable from the top-level node_modules.
node-linker=hoisted
`;

export const WORKSPACE_YAML = `packages:
  - 'packages/*'

onlyBuiltDependencies:
  - esbuild
`;

/**
 * The produced root eslint.config.js. Mirrors the source repo's flat config but
 * drops the `apps/**` and `packages/core/tokens` scopes (no such files in the
 * fork) and uses the PUBLISHED `@nexus_ds/eslint-plugin/config` preset helper
 * rather than re-inlining rule names.
 */
export const ROOT_ESLINT_CONFIG = `import js from '@eslint/js';
import { nexusComponentConfig } from '@nexus_ds/eslint-plugin/config';
import prettierConfig from 'eslint-config-prettier';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.turbo/**',
      '**/coverage/**',
      '**/storybook-static/**',
      '**/build/**',
      '**/out/**',
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ['**/*.{jsx,tsx}'],
    plugins: { react: reactPlugin },
    languageOptions: {
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser },
    },
    settings: { react: { version: 'detect' } },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactPlugin.configs['jsx-runtime'].rules,
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/display-name': 'off',
      'react/no-unescaped-entities': 'warn',
    },
  },

  {
    files: ['**/*.{jsx,tsx}'],
    plugins: { 'react-hooks': reactHooksPlugin },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },

  {
    files: ['**/*.{jsx,tsx}'],
    plugins: { 'jsx-a11y': jsxA11yPlugin },
    rules: {
      ...jsxA11yPlugin.configs.recommended.rules,
      'jsx-a11y/anchor-is-valid': 'warn',
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/no-static-element-interactions': 'warn',
    },
  },

  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: { 'simple-import-sort': simpleImportSort },
    rules: {
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['^react', '^react-dom'],
            ['^@?\\\\w'],
            ['^@/'],
            ['^\\\\.\\\\.'],
            ['^\\\\./'],
            ['^.+\\\\.css$'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
    },
  },

  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/consistent-type-assertions': [
        'error',
        { objectLiteralTypeAssertions: 'allow-as-parameter' },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-import-type-side-effects': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      curly: ['error', 'all'],
      'no-else-return': 'error',
    },
  },

  {
    files: ['**/*.{js,jsx,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.node },
    },
    rules: {
      'no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },

  {
    files: ['packages/react/src/components/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-empty-object-type': [
        'error',
        { allowInterfaces: 'with-single-extends' },
      ],
    },
  },

  {
    files: ['packages/react/src/**/*.{ts,tsx}'],
    ...nexusComponentConfig(),
  },

  {
    files: ['**/*.stories.tsx'],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },

  prettierConfig
);
`;

// ============================================================================
// CLI ORCHESTRATION
// ============================================================================

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Files rebranded on copy; anything else is copied byte-for-byte.
const TEXT_EXTENSIONS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.css',
  '.json',
  '.md',
]);

// eslint toolchain the produced root config imports; versions read from source root.
const TOOLCHAIN_PACKAGES = [
  '@eslint/js',
  'eslint',
  'eslint-config-prettier',
  'eslint-plugin-jsx-a11y',
  'eslint-plugin-react',
  'eslint-plugin-react-hooks',
  'eslint-plugin-simple-import-sort',
  'globals',
  'typescript-eslint',
  'typescript',
];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

/** Drop the `@storybook/addon-vitest` line — the produced Storybook is showcase-only. */
function trimStorybookVitestAddon(text) {
  return text.replace(/^\s*'@storybook\/addon-vitest',?\s*\n/m, '');
}

/**
 * Recursively copy a tree, rebranding text files. `skip(srcPath)` excludes a
 * path; `transform(srcPath, text)` post-processes rebranded text.
 */
function copyTree(srcDir, destDir, { scope, skip, transform }) {
  fs.mkdirSync(destDir, { recursive: true });
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const srcPath = path.join(srcDir, entry.name);
    if (skip?.(srcPath)) {
      continue;
    }
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      copyTree(srcPath, destPath, { scope, skip, transform });
      continue;
    }
    if (!TEXT_EXTENSIONS.has(path.extname(entry.name))) {
      fs.copyFileSync(srcPath, destPath);
      continue;
    }
    let text = rebrandContent(fs.readFileSync(srcPath, 'utf8'), scope);
    if (transform) {
      text = transform(srcPath, text);
    }
    fs.writeFileSync(destPath, text);
  }
}

/** Collect the minimal registry manifest entries from the source component tree. */
function collectComponentEntries(componentsDir) {
  const entries = [];
  for (const dirent of fs.readdirSync(componentsDir, { withFileTypes: true })) {
    if (!dirent.isDirectory()) {
      continue;
    }
    const dir = path.join(componentsDir, dirent.name);
    const files = [];
    const sources = [];
    const walk = (current) => {
      for (const child of fs.readdirSync(current, { withFileTypes: true })) {
        const childPath = path.join(current, child.name);
        if (child.isDirectory()) {
          walk(childPath);
          continue;
        }
        if (child.name.endsWith('.stories.tsx')) {
          continue;
        }
        files.push(path.relative(componentsDir, childPath));
        if (child.name.endsWith('.tsx') || child.name.endsWith('.ts')) {
          sources.push(fs.readFileSync(childPath, 'utf8'));
        }
      }
    };
    walk(dir);
    entries.push({
      name: dirent.name,
      files: files.sort(),
      deps: scanInternalDeps(sources.join('\n')),
    });
  }
  return entries;
}

/** Fork packages/react into the produced repo, rebranded + showcase-only Storybook. */
function forkReactPackage(destReactDir, scope, coreVersion, version) {
  const srcReactDir = path.join(REPO_ROOT, 'packages', 'react');

  copyTree(path.join(srcReactDir, 'src'), path.join(destReactDir, 'src'), { scope });
  copyTree(path.join(srcReactDir, '.storybook'), path.join(destReactDir, '.storybook'), {
    scope,
    skip: (srcPath) => srcPath.endsWith('vitest.setup.ts'),
    transform: (srcPath, text) =>
      srcPath.endsWith('main.ts') ? trimStorybookVitestAddon(text) : text,
  });
  for (const file of ['vite.config.ts', 'tsconfig.json', 'components.json']) {
    const src = path.join(srcReactDir, file);
    writeFile(path.join(destReactDir, file), rebrandContent(fs.readFileSync(src, 'utf8'), scope));
  }

  const reactPkg = transformReactPackageJson(readJson(path.join(srcReactDir, 'package.json')), {
    scope,
    coreVersion,
    version,
  });
  writeJson(path.join(destReactDir, 'package.json'), reactPkg);
}

/** Generate the rebranded tailwind package (CSS via the core generator + manifest). */
async function writeTailwindPackage(destTailwindDir, tokenConfig, scope, version) {
  const { generateTailwindPackage } = await import(
    pathToFileURL(path.join(REPO_ROOT, 'packages', 'core', 'scripts', 'generate-tailwind-package.js')).href
  );
  fs.mkdirSync(destTailwindDir, { recursive: true });
  await generateTailwindPackage(tokenConfig, { distDir: destTailwindDir });

  const srcTailwindPkg = readJson(path.join(REPO_ROOT, 'packages', 'tailwind', 'package.json'));
  writeJson(
    path.join(destTailwindDir, 'package.json'),
    transformTailwindPackageJson(srcTailwindPkg, { scope, version })
  );
}

/** Write the produced monorepo root scaffold. */
function writeRootScaffold(outDir, config, manifest) {
  const { name, scope, policy, tokenConfig } = config;
  const rootPkg = readJson(path.join(REPO_ROOT, 'package.json'));
  const eslintPluginVersion = readJson(
    path.join(REPO_ROOT, 'packages', 'eslint-plugin-nexus', 'package.json')
  ).version;

  const toolchain = {};
  for (const dep of TOOLCHAIN_PACKAGES) {
    const spec = rootPkg.devDependencies?.[dep];
    if (!spec) {
      throw new Error(`Toolchain dep "${dep}" not found in root devDependencies.`);
    }
    toolchain[dep] = spec;
  }

  writeJson(
    path.join(outDir, 'package.json'),
    renderRootPackageJson({
      name,
      scope,
      eslintPluginVersion,
      toolchain,
      overrides: rootPkg.pnpm?.overrides ?? {},
    })
  );
  writeFile(path.join(outDir, 'pnpm-workspace.yaml'), WORKSPACE_YAML);
  writeFile(path.join(outDir, '.npmrc'), NPMRC_CONTENT);
  writeFile(path.join(outDir, 'eslint.config.js'), ROOT_ESLINT_CONFIG);
  writeFile(path.join(outDir, 'README.md'), renderReadme({ name, scope, tokenConfig }));
  writeJson(path.join(outDir, 'registry.json'), manifest);
  writeFile(
    path.join(outDir, 'examples', 'app-appearance.tsx'),
    renderAppAppearanceExample(scope, policy)
  );
}

/** True if `child` is `parent` itself or nested inside it. */
function isPathWithin(parent, child) {
  const rel = path.relative(parent, child);
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
}

/** True if a `.git` entry exists anywhere within `dir` (skips node_modules). */
export function containsGitDir(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules') {
      continue;
    }
    if (entry.name === '.git') {
      return true;
    }
    if (entry.isDirectory() && containsGitDir(path.join(dir, entry.name))) {
      return true;
    }
  }
  return false;
}

/** True if `dir` matches a gitignore pattern in `repoRoot`. */
export function isGitIgnored(repoRoot, dir) {
  return spawnSync('git', ['check-ignore', '-q', dir], { cwd: repoRoot }).status === 0;
}

/** True if git tracks any file under `dir`. */
export function hasTrackedFiles(repoRoot, dir) {
  const res = spawnSync('git', ['ls-files', '--', dir], { cwd: repoRoot, encoding: 'utf8' });
  return res.stdout.trim().length > 0;
}

/** Resolve + prepare the output directory (refuse a non-empty target unless --force). */
export function prepareOutDir(out, force, { repoRoot = REPO_ROOT, cwd = process.cwd() } = {}) {
  const outDir = path.resolve(cwd, out);
  // `--force` does an rmSync, so never allow a target that *contains* this repo
  // or the cwd — `--out=..` would wipe the repo's parent.
  if (isPathWithin(outDir, repoRoot) || isPathWithin(outDir, cwd)) {
    throw new Error(
      `Refusing to export into "${outDir}": it contains this repo / the current directory.`
    );
  }
  if (isPathWithin(repoRoot, outDir)) {
    // check-ignore reports a dir as un-ignored once it holds a tracked file, so
    // test tracked content first or this branch is unreachable.
    if (hasTrackedFiles(repoRoot, outDir)) {
      throw new Error(
        `Refusing to export into "${outDir}": it holds git-tracked files. ` +
          `Use a git-ignored throwaway path (e.g. examples/.generated/...) or a dir outside the repo.`
      );
    }
    if (!isGitIgnored(repoRoot, outDir)) {
      throw new Error(
        `Refusing to export into "${outDir}": it is inside this repo but not git-ignored. ` +
          `Use a git-ignored path (e.g. examples/.generated/...) or a dir outside the repo.`
      );
    }
  }
  if (fs.existsSync(outDir) && fs.readdirSync(outDir).length > 0) {
    if (!force) {
      throw new Error(`Output dir "${outDir}" is not empty. Pass --force to overwrite.`);
    }
    if (containsGitDir(outDir)) {
      throw new Error(`Refusing to overwrite "${outDir}": it contains a git repository.`);
    }
    fs.rmSync(outDir, { recursive: true, force: true });
  }
  fs.mkdirSync(outDir, { recursive: true });
  return outDir;
}

async function main(argv) {
  const validChoices = discoverTokenChoices(path.join(REPO_ROOT, 'packages', 'core', 'tokens'));
  const config = parseExportArgs(argv, { validChoices });
  const coreVersion = readJson(path.join(REPO_ROOT, 'packages', 'core', 'package.json')).version;

  const outDir = prepareOutDir(config.out, config.force);
  console.log(`\n📦 Exporting "${config.name}" (${config.scope}) → ${outDir}`);
  console.log(
    `   tokens: ${TOKEN_CONFIG_KEYS.map((k) => `${k}=${config.tokenConfig[k]}`).join(' ')}`
  );

  forkReactPackage(path.join(outDir, 'packages', 'react'), config.scope, coreVersion, config.version);
  console.log(`   ✓ forked ${config.scope}/react (Storybook showcase, rebranded)`);

  await writeTailwindPackage(
    path.join(outDir, 'packages', 'tailwind'),
    config.tokenConfig,
    config.scope,
    config.version
  );
  console.log(`   ✓ generated ${config.scope}/tailwind`);

  const entries = collectComponentEntries(
    path.join(REPO_ROOT, 'packages', 'react', 'src', 'components')
  );
  writeRootScaffold(outDir, config, buildManifest(entries, { version: config.version }));
  console.log(`   ✓ wrote root scaffold + registry (${entries.length} components)`);

  console.log(`\n✨ Done. Next:\n   cd ${outDir} && pnpm install && pnpm build\n`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).catch((error) => {
    console.error(`✗ ${error.message}`);
    process.exit(1);
  });
}
