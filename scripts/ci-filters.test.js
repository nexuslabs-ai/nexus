import { execFileSync } from 'node:child_process';
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

// Root files no path filter needs to match: `lint` and `format-check` run
// unconditionally, and no other job reads these.
const UNGATED_ROOT_FILES = [
  '.git-blame-ignore-revs',
  '.gitignore',
  '.mcp.json',
  '.prettierignore',
  '.prettierrc',
  'AGENTS.md',
  'COMPONENT-REVIEW.md',
  'CONTRIBUTING.md',
  'Makefile',
  'README.md',
  'RTK.md',
  'eslint.config.js',
  'skills-lock.json',
];

const OUTPUT_READ = /needs\.changes\.outputs\.(\w+)/g;
const GATE_TERM = /^needs\.changes\.outputs\.(\w+) == 'true'$/;
const GUARD_TERM = /^\[ "([^"]*)" = "([^"]*)" \]$/;
const EXPRESSION = /\$\{\{\s*([^}]+?)\s*\}\}/g;
// `-F` is turbo's own alias for `--filter`, so both narrow the task set.
const FILTER_FLAG = /--filter|(?:^|\s)-F[\s=]/;
const PR_FILTER = /--filter="\.\.\.\[origin\//;

function filtersReadBy(expression) {
  return [...expression.matchAll(OUTPUT_READ)].map(([, filter]) => filter);
}

function filterNamed(name) {
  const paths = filters[name];

  if (!paths) {
    throw new Error(`ci.yml declares no \`${name}\` filter`);
  }

  return paths;
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

const jobNames = Object.keys(workflow.jobs);

// A job whose `if:` reads a changes output is gated on the filters; `always()`
// and unconditional jobs are not.
const gatedJobs = jobNames.filter((name) => {
  const gate = jobNamed(name).if;
  return typeof gate === 'string' && gate.includes('needs.changes.outputs');
});

function runScriptOf(name) {
  return jobNamed(name)
    .steps.map((step) => step.run ?? '')
    .join('\n');
}

// A job that narrows the task set to the PR's diff must leave a branch that
// does not, or a root file selects nothing and the job passes vacuously.
const prFilteredJobs = jobNames.filter((name) =>
  PR_FILTER.test(runScriptOf(name))
);

// Nested `if`s belong to the enclosing branch's body, so only depth-1
// keywords open, continue, or close a chain.
function branchesOf(script) {
  const chains = [];
  let branches = null;
  let current = null;
  let depth = 0;

  for (const line of script.split('\n')) {
    const opened = line.match(/^\s*if (.+); then$/);
    const continued = line.match(/^\s*elif (.+); then$/);
    const fallback = /^\s*else$/.test(line);
    const closed = /^\s*fi$/.test(line);

    if (opened) {
      depth += 1;

      if (depth === 1) {
        branches = [];
        current = { guard: opened[1], body: [] };
        continue;
      }
    } else if (closed) {
      if (depth === 1) {
        branches.push(current);
        chains.push(branches);
        branches = null;
        current = null;
        depth = 0;
        continue;
      }

      depth -= 1;
    } else if (depth === 1 && (continued || fallback)) {
      branches.push(current);
      current = { guard: continued?.[1] ?? null, body: [] };
      continue;
    }

    current?.body.push(line);
  }

  if (depth !== 0) {
    throw new Error('unbalanced `if`/`fi` in run script');
  }

  return chains.map((chain) =>
    chain.map(({ guard, body }) => ({ guard, body: body.join('\n') }))
  );
}

function expand(value, env) {
  return value.replace(EXPRESSION, (_, expression) => {
    if (!(expression in env)) {
      throw new Error(`run-script guard reads unmodelled \`${expression}\``);
    }

    return env[expression];
  });
}

// `else` carries no guard and always wins if it is reached.
function guardHolds(guard, env) {
  if (guard === null) return true;

  return guard.split('||').some((term) => {
    const [, left, right] = term.trim().match(GUARD_TERM) ?? [];

    if (left === undefined) {
      throw new Error(
        `run-script guard term is not \`[ "X" = "Y" ]\`: ${term.trim()}`
      );
    }

    return expand(left, env) === expand(right, env);
  });
}

function branchTakenBy(name, env) {
  const chains = branchesOf(runScriptOf(name));

  if (chains.length !== 1) {
    throw new Error(
      `ci.yml \`${name}\` run steps hold ${chains.length} if-chains; expected exactly 1`
    );
  }

  return chains[0].find(({ guard }) => guardHolds(guard, env));
}

// A root-config change on a pull request: the case where filtering by diff
// selects nothing, so the job must fall through to an unfiltered run.
const ROOT_CONFIG_PULL_REQUEST = {
  'needs.changes.outputs.ci': 'false',
  'needs.changes.outputs.root_config': 'true',
  'github.event_name': 'pull_request',
};

describe('ci path filters', () => {
  it('runs the changes job unconditionally', () => {
    expect(jobNamed('changes').if).toBeUndefined();
  });

  it('gates at least one job on the filters', () => {
    expect(gatedJobs.length).toBeGreaterThan(0);
    expect(prFilteredJobs.length).toBeGreaterThan(0);
    expect(filters.root_config?.length).toBeGreaterThan(0);
  });

  it.each(gatedJobs)('runs %s for every root_config path', (name) => {
    const gated = filtersGating(name).flatMap(filterNamed);
    // `dorny/paths-filter` matches with `dot: true`.
    const isGated = picomatch(gated, { dot: true });

    expect(filters.root_config.filter((file) => !isGated(file))).toEqual([]);
  });

  it.each(prFilteredJobs)('runs %s unfiltered on a root_config PR', (name) => {
    const taken = branchTakenBy(name, ROOT_CONFIG_PULL_REQUEST);

    expect(taken).toBeDefined();
    expect(taken.body).toMatch(/pnpm turbo \w+/);
    expect(taken.body).not.toMatch(FILTER_FLAG);
  });

  it('forwards every filter output it exports', () => {
    for (const [name, value] of Object.entries(jobNamed('changes').outputs)) {
      expect(value).toBe(`\${{ steps.filter.outputs.${name} }}`);
    }
  });

  it('declares a filter for every output it exports', () => {
    const declared = new Set(Object.keys(filters));
    const exported = Object.keys(jobNamed('changes').outputs);

    expect(exported.length).toBeGreaterThan(0);
    expect(exported.filter((filter) => !declared.has(filter))).toEqual([]);
  });

  it('exports exactly the filters the workflow reads', () => {
    const exported = new Set(Object.keys(jobNamed('changes').outputs));
    const read = new Set(filtersReadBy(JSON.stringify(workflow)));

    expect(read.size).toBeGreaterThan(0);
    expect([...read].filter((filter) => !exported.has(filter))).toEqual([]);
    expect([...exported].filter((filter) => !read.has(filter))).toEqual([]);
  });

  it('gates or exempts every tracked root file', () => {
    const rootFiles = execFileSync('git', ['ls-files'], {
      cwd: repoRoot,
      encoding: 'utf8',
    })
      .split('\n')
      .filter((file) => file !== '' && !file.includes('/'));
    const isMatched = picomatch(Object.values(filters).flat(), { dot: true });

    expect(rootFiles.length).toBeGreaterThan(0);
    expect(
      rootFiles.filter(
        (file) => !isMatched(file) && !UNGATED_ROOT_FILES.includes(file)
      )
    ).toEqual([]);
    expect(
      UNGATED_ROOT_FILES.filter((file) => !rootFiles.includes(file))
    ).toEqual([]);
  });
});
