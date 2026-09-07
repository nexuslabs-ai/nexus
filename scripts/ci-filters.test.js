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

const OUTPUT_READ = /needs\.changes\.outputs\.(\w+)/g;
const GATE_TERM = /^needs\.changes\.outputs\.(\w+) == 'true'$/;

function filtersReadBy(expression) {
  return [...expression.matchAll(OUTPUT_READ)].map(([, filter]) => filter);
}

// Only a disjunction of `== 'true'` terms lets a filter turn the job on, so
// any other shape is rejected rather than read for filter names.
function filtersGating(name) {
  const gate = jobNamed(name).if;

  if (!gate) {
    throw new Error(`ci.yml \`${name}\` job declares no \`if:\` gate`);
  }

  return gate.split('||').map((term) => {
    const [, filter] = term.trim().match(GATE_TERM) ?? [];

    if (!filter) {
      throw new Error(
        `ci.yml \`${name}\` gate term is not \`needs.changes.outputs.X == 'true'\`: ${term.trim()}`
      );
    }

    return filter;
  });
}

function branchesOf(script) {
  const branches = [];
  let current = null;

  for (const line of script.split('\n')) {
    const opened = line.match(/^\s*(?:el)?if (.+); then$/);
    const reopens = opened || /^\s*else$/.test(line);

    if (reopens || /^\s*fi$/.test(line)) {
      if (current) branches.push(current);
      current = reopens ? { guard: opened?.[1] ?? '', body: [] } : null;
      continue;
    }

    current?.body.push(line);
  }

  return branches.map(({ guard, body }) => ({ guard, body: body.join('\n') }));
}

function runScriptOf(name) {
  return jobNamed(name)
    .steps.map((step) => step.run ?? '')
    .join('\n');
}

describe('ci path filters', () => {
  it('runs the changes job unconditionally', () => {
    expect(jobNamed('changes').if).toBeUndefined();
  });

  it.each(UNFILTERED_JOBS)('runs %s for every root_config path', (name) => {
    const gated = filtersGating(name).flatMap(
      (filter) => filters[filter] ?? []
    );
    // `dorny/paths-filter` matches with `dot: true`.
    const isGated = picomatch(gated, { dot: true });

    expect(filters.root_config.filter((file) => !isGated(file))).toEqual([]);
  });

  it.each(UNFILTERED_JOBS)('runs %s unfiltered on root_config', (name) => {
    const guarded = branchesOf(runScriptOf(name)).filter(({ guard }) =>
      filtersReadBy(guard).includes('root_config')
    );

    expect(guarded).not.toHaveLength(0);

    for (const { body } of guarded) {
      expect(body).toMatch(/pnpm turbo \w+/);
      expect(body).not.toContain('--filter');
    }
  });

  it('forwards every filter output it exports', () => {
    for (const [name, value] of Object.entries(jobNamed('changes').outputs)) {
      expect(value).toBe(`\${{ steps.filter.outputs.${name} }}`);
    }
  });

  it('exports every filter the workflow reads', () => {
    const exported = new Set(Object.keys(jobNamed('changes').outputs));
    const read = new Set(filtersReadBy(JSON.stringify(workflow)));

    expect([...read].filter((filter) => !exported.has(filter))).toEqual([]);
  });
});
