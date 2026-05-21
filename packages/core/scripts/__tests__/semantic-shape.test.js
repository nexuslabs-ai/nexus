import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));
const SEMANTIC_DIR = path.resolve(TEST_DIR, '..', '..', 'tokens', 'semantic');

const REQUIRED_KEYS = [
  'background',
  'background-hover',
  'background-active',
  'foreground',
  'disabled',
  'subtle',
  'subtle-foreground',
  'subtle-hover',
  'subtle-active',
];

const BASE_ROLES = ['error', 'success', 'warning', 'information'];
const BRAND_ROLES = ['primary', 'secondary'];

function semanticFiles(prefix) {
  return fs
    .readdirSync(SEMANTIC_DIR)
    .filter((name) => name.startsWith(`${prefix}-`) && name.endsWith('.json'))
    .map((name) => path.join(SEMANTIC_DIR, name));
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

describe('semantic token shape', () => {
  // `.claude/rules/tokens.md` documents that each brand/status role exposes
  // a fixed nine-key shape. Without a test, the doc and the JSON drift
  // (see #54: badge.tsx referenced `*-surface` / `*-text` keys that never
  // existed). Walk every semantic file and prove the shape end-to-end.
  it.each(semanticFiles('base'))(
    'base file %s exposes the 9-key shape for status roles',
    (filePath) => {
      const data = readJson(filePath);
      for (const role of BASE_ROLES) {
        expect(data[role], `${role} role missing`).toBeDefined();
        for (const key of REQUIRED_KEYS) {
          expect(
            data[role][key]?.$value,
            `${path.basename(filePath)} ${role}.${key} missing $value`
          ).toBeTruthy();
        }
      }
    }
  );

  it.each(semanticFiles('brands'))(
    'brand file %s exposes the 9-key shape for brand roles',
    (filePath) => {
      const data = readJson(filePath);
      for (const role of BRAND_ROLES) {
        expect(data[role], `${role} role missing`).toBeDefined();
        for (const key of REQUIRED_KEYS) {
          expect(
            data[role][key]?.$value,
            `${path.basename(filePath)} ${role}.${key} missing $value`
          ).toBeTruthy();
        }
      }
    }
  );
});
