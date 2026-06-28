import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { CANONICAL_MODES, validateModes } from '../validate-spacing-modes.js';

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));
const SEMANTIC_DIR = path.resolve(TEST_DIR, '..', '..', 'tokens', 'semantic');

// This file is the vitest-side smoke test for the real spacing-{mode}.json
// content on disk. It complements the pure-function unit tests in
// validate-spacing-modes.test.js (which run against synthetic data) by
// exercising the same validator entry point against the actual checked-in
// files. The CLI gate (pnpm validate:spacing-modes in CI and pre-commit) is
// the production enforcement; this test gives Vitest-level signal too.
describe('spacing modes', () => {
  it('ships exactly the canonical modes', () => {
    const modes = fs
      .readdirSync(SEMANTIC_DIR)
      .filter((name) => name.startsWith('spacing-') && name.endsWith('.json'))
      .map((name) => name.slice('spacing-'.length, -'.json'.length))
      .sort();

    expect(modes).toEqual([...CANONICAL_MODES].sort());
  });

  it('all mode files share the same leaf-path key set (default as baseline)', () => {
    const modeDataMap = new Map();
    for (const mode of CANONICAL_MODES) {
      const data = JSON.parse(
        fs.readFileSync(path.join(SEMANTIC_DIR, `spacing-${mode}.json`), 'utf8')
      );
      modeDataMap.set(mode, data);
    }

    const findings = validateModes(modeDataMap);
    const drift = findings.filter(
      (f) => f.missing.length > 0 || f.extra.length > 0
    );
    expect(
      drift,
      `Spacing mode files diverge from baseline. Run \`pnpm validate:spacing-modes\` for the full report.`
    ).toEqual([]);
  });
});
