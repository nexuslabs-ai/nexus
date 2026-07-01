import { ESLint, RuleTester } from 'eslint';
import * as jsoncParser from 'jsonc-eslint-parser';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { KEY_PARITY_MODE_FAMILY_CONFIGS } from '../../core/scripts/lib/token-mode-manifest.js';
import plugin from '../src/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const semanticDir = resolve(
  __dirname,
  '..',
  '..',
  'core',
  'tokens',
  'semantic'
);
const fixturesDir = resolve(__dirname, 'fixtures');

RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({
  languageOptions: { parser: jsoncParser },
});

const rule = plugin.rules['canonical-spacing-steps'];

const validValue = (n) => `{
  "spacing": {
    "x": { "$value": { "value": ${n}, "unit": "px" }, "$type": "dimension" }
  }
}`;

const invalidValue = (n) => ({
  code: validValue(n),
  errors: [{ messageId: 'offGrid' }],
});

ruleTester.run('canonical-spacing-steps', rule, {
  valid: [
    // Canonical (in-set) values
    validValue(0),
    validValue(2),
    validValue(4),
    validValue(16),
    validValue(24),
    validValue(80),
    validValue(384),
    // Off-doc-grid but in shipped union — accepted because canonical set = union
    validValue(11), // maia
    validValue(176), // vega
    validValue(380), // nova
    validValue(388), // maia
    // Non-px units are out of scope for this rule
    `{ "spacing": { "x": { "$value": { "value": 1, "unit": "rem" }, "$type": "dimension" } } }`,
    // $-prefixed siblings must be ignored (matches validate-spacing-modes walker)
    `{
      "spacing": {
        "$meta": { "capturedAt": "2026-05-27" },
        "$description": "test",
        "4": { "$value": { "value": 16, "unit": "px" }, "$type": "dimension" }
      }
    }`,
    // Color tokens (string $value) — selector doesn't match JSONObjectExpression
    `{ "color": { "slate": { "500": { "$value": "#64748b", "$type": "color" } } } }`,
    // FontWeight tokens (number $value) — selector doesn't match
    `{ "font": { "weight": { "$value": 600, "$type": "fontWeight" } } }`,
    // Malformed leaf (missing unit) — silently skipped; validate-spacing-modes owns structural drift
    `{ "spacing": { "x": { "$value": { "value": 13 }, "$type": "dimension" } } }`,
  ],
  invalid: [
    invalidValue(1), // odd-pixel
    invalidValue(5),
    invalidValue(13),
    invalidValue(17),
    invalidValue(23),
    invalidValue(99),
    // Multiple off-grid values report independently
    {
      code: `{
        "spacing": {
          "a": { "$value": { "value": 13, "unit": "px" }, "$type": "dimension" },
          "b": { "$value": { "value": 17, "unit": "px" }, "$type": "dimension" }
        }
      }`,
      errors: [{ messageId: 'offGrid' }, { messageId: 'offGrid' }],
    },
    // Negative px value (JSONUnaryExpression) flagged as off-grid
    {
      code: `{ "spacing": { "x": { "$value": { "value": -4, "unit": "px" }, "$type": "dimension" } } }`,
      errors: [{ messageId: 'offGrid' }],
    },
  ],
});

describe('canonical-spacing-steps — real-file smoke test', () => {
  const spacingConfig = KEY_PARITY_MODE_FAMILY_CONFIGS.find(
    (config) => config.name === 'spacing'
  );
  const spacingFiles = spacingConfig.expectedModes.map(spacingConfig.fileName);
  for (const fileName of spacingFiles) {
    it(`reports zero findings on ${fileName}`, async () => {
      const eslint = new ESLint({
        overrideConfigFile: true,
        overrideConfig: {
          files: ['**/*.json'],
          languageOptions: { parser: jsoncParser },
          plugins: { '@nexus_ds': plugin },
          rules: { '@nexus_ds/canonical-spacing-steps': 'error' },
        },
      });
      const filePath = resolve(semanticDir, fileName);
      const code = readFileSync(filePath, 'utf8');
      const messages = await eslint.lintText(code, { filePath });
      expect(messages[0].errorCount).toBe(0);
    });
  }
});

describe('canonical-spacing-steps — bad-fixture smoke test', () => {
  it('reports the expected off-grid values on bad-canonical-spacing.json', async () => {
    const eslint = new ESLint({
      overrideConfigFile: true,
      overrideConfig: {
        files: ['**/*.json'],
        languageOptions: { parser: jsoncParser },
        plugins: { '@nexus_ds': plugin },
        rules: { '@nexus_ds/canonical-spacing-steps': 'error' },
      },
    });
    const filePath = resolve(fixturesDir, 'bad-canonical-spacing.json');
    const code = readFileSync(filePath, 'utf8');
    const messages = await eslint.lintText(code, { filePath });
    const findings = messages[0].messages
      .map((m) => m.message.match(/^(-?\d+)px/)?.[1])
      .filter(Boolean);
    expect(findings).toEqual(['13', '17', '23']);
  });
});
