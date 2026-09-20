import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));
const SEMANTIC_DIR = path.resolve(TEST_DIR, '..', '..', 'tokens', 'semantic');

function semanticFiles(prefix) {
  return fs
    .readdirSync(SEMANTIC_DIR)
    .filter((name) => name.startsWith(`${prefix}-`) && name.endsWith('.json'))
    .map((name) => path.join(SEMANTIC_DIR, name));
}

describe('semantic token shape', () => {
  it('does not ship the deleted static semantic color file families', () => {
    expect(semanticFiles('base')).toEqual([]);
    expect(semanticFiles('theme')).toEqual([]);
    expect(semanticFiles('chart-categorical')).toEqual([]);
    // focus.offset was the last literal dimension in semantic/; its removal
    // retired the generic standalone-dimension scan with it.
    expect(fs.existsSync(path.join(SEMANTIC_DIR, 'focus.json'))).toBe(false);
  });
});
