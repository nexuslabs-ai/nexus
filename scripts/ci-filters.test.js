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

// The jobs that make the exemption above hold. Gating these on a filter would
// leave an `eslint.config.js`-only PR with no job that reads the file.
const UNGATED_JOBS = ['format-check', 'lint'];

const OUTPUT_READ = /needs\.changes\.outputs\.(\w+)/g;
const GATE_TERM = /^needs\.changes\.outputs\.(\w+) == 'true'$/;
const GUARD_TERM = /^\[ "([^"]*)" = "([^"]*)" \]$/;
const RESULT_TERM = /^contains\(needs\.\*\.result, '(\w+)'\)$/;
const EXPRESSION = /\$\{\{\s*([^}]+?)\s*\}\}/g;
const WRAPPED_EXPRESSION = /^\$\{\{\s*(.+?)\s*\}\}$/;
// Opens, extends, or closes a branch chain. A script carrying none of these
// runs everything it lists; one carrying any must parse as a flat chain.
const CONTROL_LINE = /^\s*(?:(?:el)?if|then|else|fi)\b/;
// The whole task set, run by name. Asserting this exact shape rather than
// denying known narrowing flags means every other way to narrow — `--filter`,
// `-F`, `--affected`, or a `pkg#task` argument — fails without being listed.
const UNFILTERED_RUN = /^pnpm turbo (?:run )?[a-z-]+$/;

// A narrowed turbo run that is not diff scoping: one fixed, named target for a
// check of its own, so a root-config change does not widen it. The filter has
// to be a literal package name, so a `...[ref]` range cannot pass as one.
const FIXED_TARGET_RUN =
  /^pnpm turbo (?:run )?[a-z-]+ --filter=@?[\w-]+(?:\/[\w-]+)?$/;

// The steps allowed a fixed target. The name only selects which step may narrow
// that way; the run must still match `FIXED_TARGET_RUN`, so a diff range
// written into a listed step falls through to the whole task set.
const FIXED_TARGET_STEPS = ['build / Docs CSP inventory'];

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

// Only a disjunction of `contains(needs.*.result, 'X')` terms lets one bad
// result reach the failing step. Matching the terms independently would pass an
// `&&`, which fires only when one job failed and another was cancelled.
function resultsPropagatedBy(step) {
  const condition = typeof step.if === 'string' ? step.if.trim() : '';
  const [, expression] = condition.match(WRAPPED_EXPRESSION) ?? [];

  if (!expression) {
    throw new Error(
      `ci.yml \`ci-status\` failing step \`if:\` is not one expression: ${condition}`
    );
  }

  return expression.split('||').map((term) => {
    const [, result] = term.trim().match(RESULT_TERM) ?? [];

    if (!result) {
      throw new Error(
        `ci.yml \`ci-status\` failing step \`if:\` term is not \`contains(needs.*.result, 'X')\`: ${term.trim()}`
      );
    }

    return result;
  });
}

const jobNames = Object.keys(workflow.jobs);

// Branch protection requires only `ci-status`, so a job outside its `needs:`
// blocks no merge no matter what it runs. The gated-job and root-file
// guarantees are measured against this list rather than against every job the
// file happens to declare.
const requiredJobs = jobNamed('ci-status').needs;

if (!Array.isArray(requiredJobs) || requiredJobs.length === 0) {
  throw new Error('ci.yml `ci-status` job declares no `needs:` list');
}

// A job whose `if:` reads a changes output is gated on the filters; `always()`
// and unconditional jobs are not.
const gatedJobs = requiredJobs.filter((name) => {
  const gate = jobNamed(name).if;
  return typeof gate === 'string' && gate.includes('needs.changes.outputs');
});

const gatingFilters = [...new Set(gatedJobs.flatMap(filtersGating))];

// The jobs that narrow turbo on an ordinary PR, and so must fall through to an
// unfiltered run when a root-config change selects nothing. Declared as well as
// detected: a job that starts or stops narrowing must fail the suite, not drop
// out of it.
const DIFF_SCOPED_JOBS = ['build', 'typecheck'];

// A comment is not a command: a step that merely mentions a flag must not be
// read as running it.
function commandsOf(script) {
  return script
    .split('\n')
    .filter((line) => line.trim() !== '' && !line.trim().startsWith('#'));
}

function turboLinesIn(branch) {
  return commandsOf(branch.body)
    .map((line) => line.trim())
    .filter((line) => line.includes('turbo'));
}

// The step's script is exactly one flat `if` / `elif` / `else` / `fi` chain.
// A nested or second `if`, a control line not written `if <test>; then`, and
// any command outside the chain all throw — a step must not be able to narrow
// the task set somewhere the model does not read.
function branchesOf(script) {
  const lines = commandsOf(script);

  // A script with no control line is one unguarded branch: whatever it lists,
  // it runs. Anything that opens, extends, or closes a chain goes through the
  // parser below, so a malformed chain throws instead of reading as flat.
  if (!lines.some((line) => CONTROL_LINE.test(line))) {
    return [{ guard: null, body: lines.join('\n') }];
  }

  const branches = [];
  let closed = false;

  for (const line of lines) {
    const text = line.trim();
    const open = branches.length > 0;
    const fellBack = open && branches.at(-1).guard === null;

    if (closed) {
      throw new Error(`run step continues after \`fi\`: ${text}`);
    }

    const opening = line.match(/^\s*(el)?if (.+); then$/);

    if (opening) {
      const [, elif, guard] = opening;

      if (!elif && open) {
        throw new Error(`run step opens a second \`if\`: ${text}`);
      }

      if (elif && !open) {
        throw new Error(`run step \`elif\` opens no \`if\`: ${text}`);
      }

      if (elif && fellBack) {
        throw new Error(`run step \`elif\` follows \`else\`: ${text}`);
      }

      branches.push({ guard, body: [] });
      continue;
    }

    if (/^\s*else$/.test(line)) {
      if (!open) {
        throw new Error('run step `else` opens no `if`');
      }

      if (fellBack) {
        throw new Error('run step declares a second `else`');
      }

      branches.push({ guard: null, body: [] });
      continue;
    }

    if (/^\s*fi$/.test(line)) {
      if (!open) {
        throw new Error('run step `fi` closes no `if`');
      }

      closed = true;
      continue;
    }

    if (CONTROL_LINE.test(line)) {
      throw new Error(`run step control line is malformed: ${text}`);
    }

    if (!open) {
      throw new Error(`run step runs a command before its \`if\`: ${text}`);
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

// Narrowing is read off the one shape the suite already trusts: a turbo line
// that is neither the whole task set nor an exempted fixed target. Detecting it
// this way rather than by matching known scoping spellings means `--affected`,
// a `[HEAD^1]` range, `-F`, and a `pkg#task` argument are all caught without
// being enumerated. Every branch is read, so narrowing on the `push` path is as
// visible as narrowing on the pull-request one.
function narrowingStepsOf(name) {
  return jobNamed(name).steps.filter((step) => {
    const script = step.run;

    if (script === undefined) return false;
    // Only turbo runs can narrow the task set, and the branch model must not be
    // pointed at scripts that never do.
    if (!commandsOf(script).some((line) => line.includes('turbo')))
      return false;

    const mayFixTarget = FIXED_TARGET_STEPS.includes(`${name} / ${step.name}`);

    return branchesOf(script)
      .flatMap(turboLinesIn)
      .some(
        (line) =>
          !UNFILTERED_RUN.test(line) &&
          !(mayFixTarget && FIXED_TARGET_RUN.test(line))
      );
  });
}

describe('ci path filters', () => {
  it('runs the changes job unconditionally', () => {
    expect(jobNamed('changes').if).toBeUndefined();
  });

  it('gates at least one job on the filters', () => {
    expect(gatedJobs.length).toBeGreaterThan(0);
    expect(filters.root_config?.length).toBeGreaterThan(0);
  });

  it.each(UNGATED_JOBS)('runs %s unconditionally', (name) => {
    expect(jobNamed(name).if).toBeUndefined();
  });

  it('lists every load-bearing job in ci-status needs', () => {
    // `changes` too: every gated `if:` reads its outputs, so a `changes`
    // failure empties all of them and skips the jobs rather than failing them.
    const loadBearing = ['changes', ...UNGATED_JOBS, ...DIFF_SCOPED_JOBS];

    expect(
      loadBearing.filter((name) => !requiredJobs.includes(name)),
      'jobs missing from `ci-status` needs'
    ).toEqual([]);
  });

  // Membership in `needs:` blocks a merge only if the aggregator runs when an
  // upstream job failed and then fails itself.
  it('fails ci-status on a failed or cancelled required job', () => {
    const aggregator = jobNamed('ci-status');

    expect(aggregator.if).toBe('always()');

    // A commented-out `exit 1` fails nothing, so the step is found by the
    // commands it runs rather than by its raw script.
    const failing = aggregator.steps.filter((step) =>
      commandsOf(step.run ?? '').some((line) => /\bexit 1\b/.test(line))
    );

    expect(failing, '`ci-status` declares no failing step').toHaveLength(1);
    expect(
      resultsPropagatedBy(failing[0]).sort(),
      '`ci-status` failing step does not run on both results'
    ).toEqual(['cancelled', 'failure']);
  });

  it('declares exactly the jobs that narrow turbo', () => {
    const scoped = jobNames.filter((name) => narrowingStepsOf(name).length > 0);

    expect(scoped.sort()).toEqual([...DIFF_SCOPED_JOBS].sort());
  });

  it('names a live step for every fixed-target exemption', () => {
    const stepNames = jobNames.flatMap((name) =>
      jobNamed(name).steps.map((step) => `${name} / ${step.name}`)
    );

    expect(
      FIXED_TARGET_STEPS.filter((step) => !stepNames.includes(step)),
      'fixed-target exemptions naming no step'
    ).toEqual([]);
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
      const steps = narrowingStepsOf(name);

      expect(steps, `\`${name}\` narrows no turbo run`).not.toHaveLength(0);

      for (const step of steps) {
        const where = `\`${name}\` step "${step.name}"`;
        const taken = branchesOf(step.run).find(({ guard }) =>
          guardHolds(guard, ROOT_CONFIG_PULL_REQUEST)
        );

        expect(taken, `${where} takes no branch`).toBeDefined();

        const turbo = turboLinesIn(taken);

        expect(turbo, `${where} runs no turbo task`).not.toHaveLength(0);

        for (const line of turbo) {
          expect(line, `${where} narrows the task set`).toMatch(UNFILTERED_RUN);
        }
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
