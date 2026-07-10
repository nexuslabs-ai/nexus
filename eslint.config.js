import js from '@eslint/js';
import {
  nexusComponentConfig,
  nexusSpacingTokenConfig,
} from '@nexus_ds/eslint-plugin/config';
import prettierConfig from 'eslint-config-prettier';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import * as jsoncParser from 'jsonc-eslint-parser';
import tseslint from 'typescript-eslint';

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
      '**/storybook-static/**',
      '**/build/**',
      '**/out/**',
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

  // Import sorting
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
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
    files: ['**/scripts/**/*.{js,mjs}'],
    rules: {
      'no-console': 'off',
    },
  },

  // UI components: allow empty interface extends per .claude/rules/components.md
  {
    files: ['packages/react/src/components/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-empty-object-type': [
        'error',
        { allowInterfaces: 'with-single-extends' },
      ],
    },
  },

  // Nexus: enforce documented component rules as lint — nx: class conventions
  // (ported from the former lint-nx-prefix Claude hook), composition over
  // render props, and handler extraction. Scoped to component-bearing source
  // (React package + apps). Hand-written stories are linted too; any
  // `__generated__` output stays excluded via the global ignore.
  {
    files: ['packages/react/src/**/*.{ts,tsx}', 'apps/**/*.{ts,tsx}'],
    ...nexusComponentConfig(),
  },

  // Tests and stories assert known fixture invariants (queried elements, seeded
  // array indices), so non-null assertions are idiomatic there. Keep the rule
  // on production source only.
  {
    files: ['**/*.test.{ts,tsx}', '**/*.stories.tsx'],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },

  // Nexus: gate px values in spacing mode files to the canonical step set.
  {
    files: ['packages/core/tokens/semantic/spacing-*.json'],
    ...nexusSpacingTokenConfig({ parser: jsoncParser }),
  },

  // Disable rules that conflict with Prettier
  prettierConfig
);
