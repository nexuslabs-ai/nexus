import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

const repoRoot = path.resolve(
  path.dirname(url.fileURLToPath(import.meta.url)),
  '..'
);

const workflow = parse(
  fs.readFileSync(path.join(repoRoot, '.github/workflows/ci.yml'), 'utf8')
);

// `filters` is a YAML string embedded in the step input, so it parses twice.
const filters = parse(
  workflow.jobs.changes.steps.find((step) => step.id === 'filter').with.filters
);

describe('ci path filters', () => {
  it('gates build and typecheck on `packages` alone', () => {
    for (const job of ['build', 'typecheck']) {
      expect(workflow.jobs[job].if).not.toContain('root_config');
    }
  });

  // `root_config` no longer gates whether build and typecheck run — it only
  // picks an unfiltered run inside them. A member outside `packages` would
  // skip both jobs instead of unfiltering them.
  it('keeps every `root_config` member inside `packages`', () => {
    const packages = new Set(filters.packages);
    const orphans = filters.root_config.filter((glob) => !packages.has(glob));

    expect(orphans).toEqual([]);
  });
});
