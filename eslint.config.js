import js from '@eslint/js';
import nexusPlugin from '@nexus/eslint-plugin';
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
      '@typescript-eslint/no-explicit-any': 'warn',
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
      curly: ['error', 'multi-line'],
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
    files: ['packages/react/src/components/ui/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-empty-object-type': [
        'error',
        { allowInterfaces: 'with-single-extends' },
      ],
    },
  },

  // Nexus: prefer role-named spacing utilities over raw numerics in UI components.
  // Stories opt out — demo grids legitimately mix numeric utilities for layout chrome.
  {
    files: ['packages/react/src/components/ui/**/*.{ts,tsx}'],
    ignores: ['packages/react/src/components/ui/**/*.stories.tsx'],
    plugins: {
      '@nexus': nexusPlugin,
    },
    rules: {
      '@nexus/prefer-role-utilities': 'error',
    },
  },

  // Nexus: gate px values in spacing mode files to the canonical step set.
  {
    files: ['packages/core/tokens/semantic/spacing-*.json'],
    languageOptions: {
      parser: jsoncParser,
    },
    plugins: {
      '@nexus': nexusPlugin,
    },
    rules: {
      '@nexus/canonical-spacing-steps': 'error',
    },
  },

  // Disable rules that conflict with Prettier
  prettierConfig
);
