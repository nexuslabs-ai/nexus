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

import fs from 'node:fs';
import path from 'node:path';

// Package names that are PUBLISHED upstream deps — never rebranded into the fork.
export const KEEP_PACKAGES = ['@nexus_ds/core', '@nexus_ds/eslint-plugin'];

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
 * `tokens/semantic/{base,brands}-{value}-{light|dark}.json`, and
 * radius/borderwidth/shadow/motion from `tokens/primitives/{category}/`.
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

  return {
    base: semanticModes('base'),
    brand: semanticModes('brands'),
    radius: primitiveModes('radius'),
    borderwidth: primitiveModes('borderwidth'),
    shadow: primitiveModes('shadow'),
    motion: primitiveModes('motion'),
    // spacingDefault is validated by the generator itself; accept any value.
    spacingDefault: [],
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
  return text
    .split('@nexus_ds/react')
    .join(`${scope}/react`)
    .split('@nexus_ds/tailwind')
    .join(`${scope}/tailwind`);
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
  return next;
}

/**
 * Scan a component source file for its intra-package (`@/`) dependencies,
 * bucketed by root. Line comments are stripped so a commented import can't leak
 * in. Used to build the minimal registry manifest (seed of the future CLI).
 */
export function scanInternalDeps(text) {
  const withoutLineComments = text.replace(/\/\/.*$/gm, '');
  const deps = { components: new Set(), lib: new Set(), hooks: new Set() };
  const importRe = /@\/(components|lib|hooks)\/([\w-]+)/g;
  let match;
  while ((match = importRe.exec(withoutLineComments)) !== null) {
    deps[match[1]].add(match[2]);
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
