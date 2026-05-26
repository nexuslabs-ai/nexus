import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));
const SEMANTIC_DIR = path.resolve(TEST_DIR, '..', '..', 'tokens', 'semantic');

// Spacing ships exactly seven canonical modes per `.claude/rules/spacing-tokens.md`.
// The generator filesystem-discovers them via the `spacing-{mode}.json`
// pattern, so adding an unintentional 8th file (or losing one) would
// silently emit/drop a `[data-style="..."]` block.
const EXPECTED_MODES = ['luma', 'lyra', 'maia', 'mira', 'nova', 'sera', 'vega'];

describe('spacing modes', () => {
  it('ships exactly the seven canonical modes', () => {
    const modes = fs
      .readdirSync(SEMANTIC_DIR)
      .filter((name) => name.startsWith('spacing-') && name.endsWith('.json'))
      .map((name) => name.slice('spacing-'.length, -'.json'.length))
      .sort();

    expect(modes).toEqual(EXPECTED_MODES);
  });

  // Each spacing-{mode}.json carries the same key set — the build assumes
  // this (and #125's validator will codify it at the schema layer). The test
  // here is a coarse JSON-shape guarantee on top of the build-side
  // cross-mode variable-name parity test in generate-tailwind-package.test.js.
  it('all 7 mode files declare the same JSON path set at the leaves', () => {
    function collectLeafPaths(node, pathParts) {
      const paths = [];
      function walk(n, p) {
        if (
          typeof n === 'object' &&
          n !== null &&
          '$value' in n &&
          '$type' in n
        ) {
          paths.push(p.join('.'));
          return;
        }
        if (typeof n === 'object' && n !== null) {
          for (const [key, value] of Object.entries(n)) {
            if (key.startsWith('$')) continue;
            walk(value, [...p, key]);
          }
        }
      }
      walk(node, pathParts);
      return paths;
    }

    const modePaths = {};
    for (const mode of EXPECTED_MODES) {
      const data = JSON.parse(
        fs.readFileSync(path.join(SEMANTIC_DIR, `spacing-${mode}.json`), 'utf8')
      );
      modePaths[mode] = new Set(collectLeafPaths(data, []));
    }

    const vegaPaths = modePaths.vega;
    expect(vegaPaths.size).toBeGreaterThan(0);
    for (const mode of EXPECTED_MODES) {
      if (mode === 'vega') continue;
      expect(
        [...modePaths[mode]].sort(),
        `spacing-${mode}.json diverges from spacing-vega.json key set`
      ).toEqual([...vegaPaths].sort());
    }
  });
});
