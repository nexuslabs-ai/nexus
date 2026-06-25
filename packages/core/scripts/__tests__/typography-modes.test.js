import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));
const TYPOGRAPHY_DIR = path.resolve(
  TEST_DIR,
  '..',
  '..',
  'tokens',
  'primitives',
  'typography'
);

// Typography ships exactly one mode (vega). The former `nova` / `maia` density
// modes were removed; modes are filesystem-discovered (`discoverPrimitives` globs
// the directory), so without this guard, dropping a `typography-nova.json` back
// in would silently re-activate a second mode. Reintroducing one must be a
// deliberate edit here, behind a real typeface or scale-ratio decision.
const EXPECTED_MODES = ['vega'];

describe('typography modes', () => {
  it('ships exactly vega (single mode)', () => {
    const modes = fs
      .readdirSync(TYPOGRAPHY_DIR)
      .filter(
        (name) => name.startsWith('typography-') && name.endsWith('.json')
      )
      .map((name) => name.slice('typography-'.length, -'.json'.length))
      .sort();

    expect(modes).toEqual(EXPECTED_MODES);
  });
});
