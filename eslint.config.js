import js from '@eslint/js';
import eslintCommentsPlugin from '@eslint-community/eslint-plugin-eslint-comments';
import {
  nxdsComponentConfig,
  nxdsSpacingTokenConfig,
} from '@nxds/eslint-plugin/config';
import { nxdsTailwindClassesConfig } from '@nxds/eslint-plugin/tailwind';
import prettierConfig from 'eslint-config-prettier';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import pluginVue from 'eslint-plugin-vue';
import vueA11yPlugin from 'eslint-plugin-vuejs-accessibility';
import globals from 'globals';
import * as jsoncParser from 'jsonc-eslint-parser';
import path from 'node:path';
import tseslint from 'typescript-eslint';
import vueParser from 'vue-eslint-parser';

function repoPath(relativePath) {
  return path.join(import.meta.dirname, relativePath);
}

// packages/react-18 is generated from packages/react and lints the same way.
function reactSources(...globs) {
  return ['packages/react', 'packages/react-18'].flatMap((root) =>
    globs.map((glob) => `${root}/${glob}`)
  );
}

const radiusBaseConsumer = String.raw`/rounded(?:-[a-z]{1,2})?-base\b|radius-base/`;
const radiusBaseMessage =
  'Only Button consumes --nx-radius-base (rounded-base). Use another radius token, or update apps/docs/content/theming/overrides.mdx if this component should follow the base override.';

export default tseslint.config(
  // Global ignores
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      // Next.js auto-generates next-env.d.ts (with triple-slash refs); not ours to lint.
      '**/next-env.d.ts',
      '**/.turbo/**',
      '**/coverage/**',
      '**/generated/**',
      '**/__generated__/**',
      '**/*.generated.ts',
      '**/storybook-static/**',
      '**/build/**',
      '**/out/**',
      '**/.wrangler/**',
      // Standalone consumer examples — self-contained repos with their own
      // toolchains, outside this workspace. Not linted by the monorepo config.
      'examples/**',
      // Untracked git worktree copies (full-repo clones) under .claude — never lint them.
      '**/.claude/worktrees/**',
    ],
  },

  // Base JS recommended rules
  js.configs.recommended,

  // TypeScript recommended rules
  ...tseslint.configs.recommended,

  // Every eslint-disable says why, after `--`.
  {
    plugins: {
      '@eslint-community/eslint-comments': eslintCommentsPlugin,
    },
    rules: {
      '@eslint-community/eslint-comments/require-description': 'error',
    },
  },

  // React configuration
  {
    files: ['**/*.{jsx,tsx}'],
    plugins: {
      react: reactPlugin,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactPlugin.configs['jsx-runtime'].rules,
      'react/prop-types': 'off', // Not needed with TypeScript
      'react/react-in-jsx-scope': 'off', // Not needed with React 17+
      'react/display-name': 'off',
      'react/no-unescaped-entities': 'warn',
    },
  },

  // React Hooks rules
  {
    files: ['**/*.{jsx,tsx}'],
    plugins: {
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },

  // Accessibility rules (jsx-a11y)
  {
    files: ['**/*.{jsx,tsx}'],
    plugins: {
      'jsx-a11y': jsxA11yPlugin,
    },
    rules: {
      ...jsxA11yPlugin.configs.recommended.rules,
      // Customize as needed for design system components
      'jsx-a11y/anchor-is-valid': 'warn',
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/no-static-element-interactions': 'warn',
    },
  },
  // These scroll regions take tabIndex={0} so keyboard users can scroll them
  // (axe scrollable-region-focusable). The exemption lives here, not in an
  // eslint-disable comment, so copied source lints clean in apps without
  // jsx-a11y.
  {
    files: reactSources(
      'src/components/alert-dialog/alert-dialog.tsx',
      'src/components/attachment/attachment.tsx',
      'src/components/breadcrumb/breadcrumb.tsx',
      'src/components/dialog/dialog.tsx',
      'src/components/drawer/drawer.tsx',
      'src/components/sheet/sheet.tsx',
      'src/components/table/table.tsx'
    ),
    rules: { 'jsx-a11y/no-noninteractive-tabindex': 'off' },
  },

  // Vue single-file components, with TypeScript in <script setup>
  ...pluginVue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      'vuejs-accessibility': vueA11yPlugin,
    },
    rules: {
      ...vueA11yPlugin.configs.recommended.rules,
      // Component names match the React package's: Button, Card, Switch.
      'vue/multi-word-component-names': 'off',
      // Optional typed props such as `class` need no runtime default.
      'vue/require-default-prop': 'off',
    },
  },
  // Field primitives render a bare control; the consumer's Label `for`, or an
  // `aria-label` that falls through, names it. The exemption lives here so
  // copied source lints clean in apps without vuejs-accessibility.
  {
    files: [
      'packages/vue/src/components/native-select/NativeSelect.vue',
      'packages/vue/src/components/textarea/Textarea.vue',
    ],
    rules: { 'vuejs-accessibility/form-control-has-label': 'off' },
  },

  // Import sorting
  {
    files: ['**/*.{js,jsx,ts,tsx,vue}'],
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // React first
            ['^react', '^react-dom'],
            // External packages
            ['^@?\\w'],
            // Internal packages (@/)
            ['^@/'],
            // Parent imports
            ['^\\.\\.'],
            // Sibling imports
            ['^\\./'],
            // Style imports
            ['^.+\\.css$'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
    },
  },

  // TypeScript files configuration
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      // TypeScript specific
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
      // `allow-as-parameter` (not `never`): a token-driven design system must
      // cast object literals carrying CSS custom properties (`--nx-*` keys)
      // to React.CSSProperties at the JSX-attribute / call-argument site —
      // those keys can't be typed otherwise. Standalone `const x = {} as T`
      // drift is still flagged.
      '@typescript-eslint/consistent-type-assertions': [
        'error',
        { objectLiteralTypeAssertions: 'allow-as-parameter' },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-import-type-side-effects': 'error',

      // General best practices
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      curly: ['error', 'all'],
      'no-else-return': 'error',
    },
  },

  // JavaScript files configuration
  {
    files: ['**/*.{js,jsx,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },

  // CLI scripts - allow console.log for user output
  {
    files: ['**/scripts/**/*.{js,mjs,ts}'],
    rules: {
      'no-console': 'off',
    },
  },

  // UI components: an empty interface extending ComponentProps is the documented props pattern
  {
    files: reactSources('src/components/**/*.{ts,tsx}'),
    rules: {
      '@typescript-eslint/no-empty-object-type': [
        'error',
        { allowInterfaces: 'with-single-extends' },
      ],
    },
  },

  // nxds: enforce documented component rules as lint — nx: class conventions
  // (ported from the former lint-nx-prefix Claude hook), composition over
  // render props, and handler extraction. Scoped to component-bearing source
  // (React package + apps). Hand-written stories are linted too; any
  // `__generated__` output stays excluded via the global ignore.
  {
    files: [...reactSources('src/**/*.{ts,tsx}'), 'apps/**/*.{ts,tsx}'],
    ...nxdsComponentConfig(),
  },

  // The docs read defaults from code and examples from docs stories, so the
  // published source carries no `@default` or `@example` copies of them.
  {
    files: [
      ...reactSources('src/**/*.{ts,tsx}'),
      'packages/vue/src/**/*.{ts,vue}',
    ],
    rules: { '@nxds/no-jsdoc-data-tags': 'error' },
  },

  // packages/react-18 is generated from packages/react by adding forwardRef
  // and nothing else, so packages/react can't use what React 18 lacks.
  {
    files: ['packages/react/src/**/*.{ts,tsx}'],
    rules: { '@nxds/no-react-19-only': 'error' },
  },

  nxdsTailwindClassesConfig({
    files: ['packages/react/src/**/*.{ts,tsx}'],
    entryPoint: repoPath('packages/react/.storybook/preview.css'),
  }),
  nxdsTailwindClassesConfig({
    files: ['packages/react-18/src/**/*.{ts,tsx}'],
    entryPoint: repoPath('packages/react-18/.storybook/preview.css'),
  }),
  {
    files: ['packages/vue/src/**/*.{ts,vue}'],
    ...nxdsComponentConfig(),
  },
  nxdsTailwindClassesConfig({
    files: ['packages/vue/src/**/*.{ts,vue}'],
    entryPoint: repoPath('packages/vue/.storybook/preview.css'),
  }),
  nxdsTailwindClassesConfig({
    files: ['apps/docs/**/*.{ts,tsx}'],
    entryPoint: repoPath('apps/docs/app/globals.css'),
  }),

  // Button consumes --nx-radius-base, and FilterConditionField's joined
  // segment follows it (both documented in theming/overrides). The exemption
  // lives here, so copied source carries no disable for a rule apps don't have.
  {
    files: reactSources('src/components/**/*.{ts,tsx}'),
    ignores: [
      ...reactSources(
        'src/components/button/button.tsx',
        'src/components/filter-condition/filter-condition.tsx'
      ),
      '**/*.stories.tsx',
      '**/*.test.{ts,tsx}',
    ],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: `Literal[value=${radiusBaseConsumer}]`,
          message: radiusBaseMessage,
        },
        {
          selector: `TemplateElement[value.raw=${radiusBaseConsumer}]`,
          message: radiusBaseMessage,
        },
      ],
    },
  },

  {
    files: ['apps/docs/**/*.{ts,tsx,js,mjs}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/*'],
              message:
                '`@/` resolves to packages/react/src for the generated, paste-ready docs code only — import @nxds/react here.',
            },
          ],
        },
      ],
    },
  },

  {
    files: ['apps/docs/app/_pages/patterns/**/*.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: '^@/(?!patterns/)',
              message:
                'A pattern page imports its examples from `@/patterns/`, which @nxds/react does not export — import components from @nxds/react.',
            },
          ],
        },
      ],
    },
  },

  // Tests and stories assert known fixture invariants (queried elements, seeded
  // array indices), so non-null assertions are idiomatic there. Keep the rule
  // on production source only.
  {
    files: ['**/*.test.{ts,tsx}', '**/*.stories.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },

  // nxds: gate px values in spacing mode files to the canonical step set.
  {
    files: ['packages/core/tokens/semantic/spacing-*.json'],
    ...nxdsSpacingTokenConfig({ parser: jsoncParser }),
  },

  // Disable rules that conflict with Prettier
  prettierConfig
);
