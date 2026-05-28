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

// Typography ships exactly three modes (nova/vega/maia). `lyra` and `mira` were
// byte-identical copies of `vega` and were removed (PR #157). Modes are
// filesystem-discovered (`discoverPrimitives` globs the directory), so without
// this guard, dropping a `typography-lyra.json` back in would silently
// re-activate a fourth mode. Reintroducing one must be a deliberate edit here,
// behind a real typeface or scale-ratio decision (see `.claude/rules/tokens.md`
// § Typography modes → product archetypes).
const EXPECTED_MODES = ['maia', 'nova', 'vega'];

describe('typography modes', () => {
  it('ships exactly nova/vega/maia (no byte-duplicate modes)', () => {
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
