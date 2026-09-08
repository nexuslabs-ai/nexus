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

const exportedFilters = Object.keys(jobNamed('changes').outputs);

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
// `-F` is turbo's alias for `--filter`, and `--affected` scopes to the diff
// on its own, so any of the three narrows the task set.
const NARROWS_TASKS = /--filter|(?:^|\s)-F|--affected/;
// The spellings that scope a run to the PR's diff specifically.
const DIFF_SCOPE = /\[origin\/|--affected/;

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

const gatingFilters = [...new Set(gatedJobs.flatMap(filtersGating))];

// The jobs that scope turbo to the PR's diff, and so must fall through to an
// unfiltered run when a root-config change selects nothing. Declared rather
// than detected: a job that re-spells its scoping must fail the suite, not
// drop out of it.
const DIFF_SCOPED_JOBS = ['build', 'typecheck'];

function diffScopedStepsOf(name) {
  return jobNamed(name).steps.filter((step) => DIFF_SCOPE.test(step.run ?? ''));
}

// The step's script is exactly one flat `if` / `elif` / `else` / `fi` chain.
// A nested or second `if`, a control line not written `if <test>; then`, and
// any command outside the chain all throw — a step must not be able to narrow
// the task set somewhere the model does not read.
function branchesOf(script) {
  const branches = [];
  let closed = false;

  for (const line of script.split('\n')) {
    if (line.trim() === '') continue;

    if (closed) {
      throw new Error(`run step continues after \`fi\`: ${line.trim()}`);
    }

    const opening = line.match(/^\s*(el)?if (.+); then$/);

    if (opening) {
      const [, elif, guard] = opening;

      if (!elif && branches.length > 0) {
        throw new Error(`run step opens a second \`if\`: ${line.trim()}`);
      }

      if (elif && branches.length === 0) {
        throw new Error(`run step \`elif\` opens no \`if\`: ${line.trim()}`);
      }

      branches.push({ guard, body: [] });
      continue;
    }

    if (/^\s*else$/.test(line) && branches.length > 0) {
      branches.push({ guard: null, body: [] });
      continue;
    }

    if (/^\s*fi$/.test(line) && branches.length > 0) {
      closed = true;
      continue;
    }

    if (/^\s*(?:el)?if\b|^\s*then\b|^\s*else\b|^\s*fi\b/.test(line)) {
      throw new Error(`run step control line is malformed: ${line.trim()}`);
    }

    if (branches.length === 0) {
      throw new Error(
        `run step runs a command before its \`if\`: ${line.trim()}`
      );
    }

    branches.at(-1).body.push(line);
  }

  if (!closed) {
    throw new Error('run step has no closing `fi`');
  }

  return branches.map(({ guard, body }) => ({ guard, body: body.join('\n') }));
}

// A guard the model cannot resolve must throw. Silently reading it as unequal
// would send every case to `else` and pass whatever sits there.
function operand(value, env) {
  const expanded = value.replace(EXPRESSION, (_, expression) => {
    if (!(expression in env)) {
      throw new Error(`run-step guard reads unmodelled \`${expression}\``);
    }

    return env[expression];
  });

  if (expanded.includes('$')) {
    throw new Error(`run-step guard reads a shell variable: ${value}`);
  }

  return expanded;
}

// `else` carries no guard and always wins if it is reached.
function guardHolds(guard, env) {
  if (guard === null) return true;

  return guard.split('||').some((term) => {
    const [, left, right] = term.trim().match(GUARD_TERM) ?? [];

    if (left === undefined) {
      throw new Error(
        `run-step guard term is not \`[ "X" = "Y" ]\`: ${term.trim()}`
      );
    }

    return operand(left, env) === operand(right, env);
  });
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
    expect(filters.root_config?.length).toBeGreaterThan(0);
  });

  it('declares exactly the jobs that scope turbo to the diff', () => {
    const scoped = jobNames.filter(
      (name) => diffScopedStepsOf(name).length > 0
    );

    expect(scoped.sort()).toEqual([...DIFF_SCOPED_JOBS].sort());
  });

  it.each(gatedJobs)('runs %s for every root_config path', (name) => {
    const gated = filtersGating(name).flatMap(filterNamed);
    // `dorny/paths-filter` matches with `dot: true`.
    const isGated = picomatch(gated, { dot: true });

    expect(filters.root_config.filter((file) => !isGated(file))).toEqual([]);
  });

  it.each(DIFF_SCOPED_JOBS)(
    'runs %s unfiltered on a root_config PR',
    (name) => {
      for (const step of diffScopedStepsOf(name)) {
        const where = `\`${name}\` step "${step.name}"`;
        const taken = branchesOf(step.run).find(({ guard }) =>
          guardHolds(guard, ROOT_CONFIG_PULL_REQUEST)
        );

        expect(taken, `${where} takes no branch`).toBeDefined();
        expect(taken.body, `${where} runs no turbo task`).toMatch(
          /pnpm turbo \w+/
        );
        expect(taken.body, `${where} narrows the task set`).not.toMatch(
          NARROWS_TASKS
        );
      }
    }
  );

  it('forwards every filter output it exports', () => {
    for (const [name, value] of Object.entries(jobNamed('changes').outputs)) {
      expect(value).toBe(`\${{ steps.filter.outputs.${name} }}`);
    }
  });

  it('declares a filter for every output it exports', () => {
    const declared = new Set(Object.keys(filters));

    expect(exportedFilters.length).toBeGreaterThan(0);
    expect(exportedFilters.filter((filter) => !declared.has(filter))).toEqual(
      []
    );
  });

  it('exports exactly the filters the workflow reads', () => {
    const exported = new Set(exportedFilters);
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
    // Coverage means a job actually runs for the file. A filter that is
    // declared, or even exported, but gates no job does not provide it.
    const isMatched = picomatch(gatingFilters.flatMap(filterNamed), {
      dot: true,
    });

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
