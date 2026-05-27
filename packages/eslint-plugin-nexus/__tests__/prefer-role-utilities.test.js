import { ESLint, RuleTester } from 'eslint';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import tseslint from 'typescript-eslint';
import { describe, expect, it } from 'vitest';

import plugin from '../src/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturesDir = resolve(__dirname, 'fixtures');

RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tseslint.parser,
    ecmaVersion: 2022,
    sourceType: 'module',
  },
});

const rule = plugin.rules['prefer-role-utilities'];

ruleTester.run('prefer-role-utilities', rule, {
  valid: [
    // Role utilities are the goal
    `const x = 'nx:p-container';`,
    `const x = 'nx:px-control-md';`,
    `const x = 'nx:py-control-sm';`,
    `const x = 'nx:gap-control-lg';`,
    `const x = 'nx:gap-container';`,
    `const x = 'nx:gap-layout-section';`,
    // n=0 has no role equivalent — never flagged
    `const x = 'nx:p-0';`,
    `const x = 'nx:px-0 nx:py-0 nx:gap-0';`,
    // Other utility prefixes (pt, pb, ps, m*, h*, w*, size-*, gap-x, gap-y) are out of scope
    `const x = 'nx:pt-4 nx:pb-2 nx:ps-1 nx:mt-4 nx:mx-2 nx:h-10 nx:w-full nx:size-5 nx:gap-x-2 nx:gap-y-4';`,
    // CSS var arbitrary values are not numeric utilities
    `const x = 'nx:p-(--focus-offset)';`,
    // Arbitrary-value escape hatches are out of scope
    `const x = 'nx:p-[5px]';`,
    // Allowlist comment one line above silences all matches on the next line
    `// nexus-allow-numeric: chip rhythm\nconst x = 'nx:px-2 nx:py-0.5 nx:gap-1';`,
    // Non-string literal — rule skips
    `const x = 4;`,
    `const x = true;`,
    // Template literals (dynamic interpolation) — rule skips
    'const size = 4; const x = `nx:p-${size}`;',
  ],
  invalid: [
    // Basic raw numeric
    {
      code: `const x = 'nx:p-4';`,
      errors: [{ messageId: 'preferRole' }],
    },
    // Multiple matches in one string each fire
    {
      code: `const x = 'nx:p-4 nx:px-2 nx:gap-2';`,
      errors: [
        { messageId: 'preferRole' },
        { messageId: 'preferRole' },
        { messageId: 'preferRole' },
      ],
    },
    // Decimal numeric (e.g. Button icon's p-2.5)
    {
      code: `const x = 'nx:p-2.5';`,
      errors: [{ messageId: 'preferRole' }],
    },
    // Responsive / state prefix chain
    {
      code: `const x = 'nx:hover:p-4';`,
      errors: [{ messageId: 'preferRole' }],
    },
    {
      code: `const x = 'nx:dark:hover:p-4';`,
      errors: [{ messageId: 'preferRole' }],
    },
    // Inside cn()-style call expression (still a Literal arg)
    {
      code: `const x = cn('nx:gap-4', 'nx:p-container');`,
      errors: [{ messageId: 'preferRole' }],
    },
    // Inside JSX attribute value
    {
      code: `const X = <div className="nx:p-4" />;`,
      errors: [{ messageId: 'preferRole' }],
      languageOptions: {
        parser: tseslint.parser,
        parserOptions: { ecmaFeatures: { jsx: true } },
      },
    },
    // Allowlist comment on a different (non-adjacent) line does NOT silence
    {
      code: `// nexus-allow-numeric: other\n\nconst x = 'nx:p-4';`,
      errors: [{ messageId: 'preferRole' }],
    },
    // Same-line trailing comment does NOT silence
    {
      code: `const x = 'nx:p-4'; // nexus-allow-numeric: nope`,
      errors: [{ messageId: 'preferRole' }],
    },
  ],
});

describe('prefer-role-utilities — bad-fixture smoke test', () => {
  it('reports five findings on bad-prefer-role.tsx (one per raw-numeric line)', async () => {
    const eslint = new ESLint({
      overrideConfigFile: true,
      overrideConfig: {
        files: ['**/*.tsx'],
        languageOptions: {
          parser: tseslint.parser,
          ecmaVersion: 2022,
          sourceType: 'module',
        },
        plugins: { '@nexus': plugin },
        rules: { '@nexus/prefer-role-utilities': 'error' },
      },
    });
    const filePath = resolve(fixturesDir, 'bad-prefer-role.tsx');
    const code = readFileSync(filePath, 'utf8');
    const messages = await eslint.lintText(code, { filePath });
    // Lines 4 (p-4), 5 (px-2, py-2 — two findings), 6 (gap-4), 7 (p-2.5), 8 (hover:p-4)
    expect(messages[0].errorCount).toBe(6);
    const ids = messages[0].messages.map((m) => m.messageId);
    expect(new Set(ids)).toEqual(new Set(['preferRole']));
  });
});
