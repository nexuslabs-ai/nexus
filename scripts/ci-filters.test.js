import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import picomatch from 'picomatch';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

const repoRoot = path.resolve(
  path.dirname(url.fileURLToPath(import.meta.url)),
  '..'
);

const workflow = parse(
  fs.readFileSync(path.join(repoRoot, '.github/workflows/ci.yml'), 'utf8')
);

function jobNamed(name) {
  const job = workflow.jobs[name];

  if (!job) {
    throw new Error(`ci.yml declares no \`${name}\` job`);
  }

  return job;
}

const detectStep = jobNamed('changes').steps.find(
  (step) => step.id === 'filter'
);

if (!detectStep) {
  throw new Error('ci.yml `changes` job declares no step with `id: filter`');
}

// `filters` is a YAML string embedded in the step input, so it parses twice.
const filters = parse(detectStep.with.filters);

const UNFILTERED_JOBS = ['build', 'typecheck'];

function filtersReadBy(expression) {
  return [...expression.matchAll(/needs\.changes\.outputs\.(\w+)/g)].map(
    ([, filter]) => filter
  );
}

function gateOf(name) {
  const gate = jobNamed(name).if;

  if (!gate) {
    throw new Error(`ci.yml \`${name}\` job declares no \`if:\` gate`);
  }

  return gate;
}

describe('ci path filters', () => {
  it.each(UNFILTERED_JOBS)('runs %s for every root_config path', (name) => {
    const gated = filtersReadBy(gateOf(name)).flatMap(
      (filter) => filters[filter] ?? []
    );
    const isGated = picomatch(gated);

    expect(filters.root_config.filter((file) => !isGated(file))).toEqual([]);
  });

  it.each(UNFILTERED_JOBS)('runs %s unfiltered on root_config', (name) => {
    const script = jobNamed(name)
      .steps.map((step) => step.run ?? '')
      .join('\n');

    expect(filtersReadBy(script)).toContain('root_config');
  });

  it('exports every filter the workflow reads', () => {
    const exported = new Set(Object.keys(jobNamed('changes').outputs));
    const read = new Set(filtersReadBy(JSON.stringify(workflow)));

    expect([...read].filter((filter) => !exported.has(filter))).toEqual([]);
  });
});
