import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import picomatch from 'picomatch';
import { describe, expect, it } from 'vitest';
import { parse as parseYaml } from 'yaml';

const repoRoot = path.resolve(
  path.dirname(url.fileURLToPath(import.meta.url)),
  '..'
);

const WORKFLOW_PATH = '.github/workflows/ci.yml';

// A parse error here empties the suite, so it names the file it could not read
// rather than surfacing as a bare `SyntaxError` with no tests collected.
function parsedFile(file, parseText) {
  const text = fs.readFileSync(path.join(repoRoot, file), 'utf8');

  try {
    return parseText(text);
  } catch (cause) {
    throw new Error(`${file} does not parse`, { cause });
  }
}

const workflow = parsedFile(WORKFLOW_PATH, parseYaml);

const turboConfig = parsedFile('turbo.json', JSON.parse);

const { packages: workspaceGlobs } = parsedFile(
  'pnpm-workspace.yaml',
  parseYaml
);

if (!Array.isArray(workspaceGlobs)) {
  throw new Error('pnpm-workspace.yaml declares no `packages:` globs');
}

const rootFiles = execFileSync('git', ['ls-files'], {
  cwd: repoRoot,
  encoding: 'utf8',
})
  .split('\n')
  .filter((file) => file !== '' && !file.includes('/'));

function jobNamed(name) {
  const job = workflow.jobs[name];

  if (!job) {
    throw new Error(`ci.yml declares no \`${name}\` job`);
  }

  return job;
}

function stepsOf(name) {
  const { steps } = jobNamed(name);

  if (!Array.isArray(steps)) {
    throw new Error(`ci.yml \`${name}\` job declares no \`steps:\``);
  }

  return steps;
}

const detectStep = stepsOf('changes').find((step) => step.id === 'filter');

if (!detectStep) {
  throw new Error('ci.yml `changes` job declares no step with `id: filter`');
}

// `filters` is a YAML string embedded in the step input, so it parses twice.
const filters = parseYaml(detectStep.with.filters);

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
const RESULT_TERM = /^contains\(needs\.\*\.result,\s*'(\w+)'\)$/;
const EXPRESSION = /\$\{\{\s*([^}]+?)\s*\}\}/g;
const WRAPPED_EXPRESSION = /^\$\{\{\s*(.+?)\s*\}\}$/;
// Opens, extends, or closes a branch chain. A script carrying none of these
// runs everything it lists; one carrying any must parse as a flat chain.
const CONTROL_LINE = /^\s*(?:(?:el)?if|then|else|fi)\b/;
// A whole command, not a fragment: `echo "..." # exit 1` mentions one and runs
// none.
const EXIT_FAILURE = /^exit [1-9]\d*$/;
// A message the failing step may print before the exit. Any of `;`, `&`, `|`,
// or `<` is rejected: each can chain, background, or redirect a terminator into
// the line, and none is needed to print. A trailing `\` folds the exit into
// this line.
const FAIL_STEP_ECHO = /^echo [^;&|<]*[^;&|<\\]$/;
// The shell options it may set. `-o` takes `pipefail` and nothing else, and the
// letters exclude `n`, so neither spelling of noexec — which parses the exit
// without running it — is an allowed command.
const FAIL_STEP_PRELUDE = /^set -[eux]*(?:o pipefail)?$/;
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

  if (!condition) {
    throw new Error('ci.yml `ci-status` failing step declares no `if:`');
  }

  // `${{ }}` around a step `if:` is optional, and both spellings are the same
  // expression.
  const [, unwrapped] = condition.match(WRAPPED_EXPRESSION) ?? [];

  return (unwrapped ?? condition).split('||').map((term) => {
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

// Every job the merge gate carries. Declared as well as detected: dropping one
// from `ci-status`'s `needs:` must fail the suite rather than quietly shrink
// both the gate and the coverage measured against it.
const REQUIRED_JOBS = [
  'audit-browser-support',
  'audit-tokens',
  'build',
  'build-storybook',
  'bundle-size',
  'changes',
  'format-check',
  'lint',
  'test-react',
  'test-unit',
  'typecheck',
];

// The jobs that narrow turbo on an ordinary PR, and so must fall through to an
// unfiltered run when a root-config change selects nothing. Declared as well as
// detected: a job that starts or stops narrowing must fail the suite, not drop
// out of it.
const DIFF_SCOPED_JOBS = ['build', 'typecheck'];

// `root_config` decides whether a diff-scoped job falls through to an
// unfiltered run. Its entries are globs like every other filter's, so
// membership is matched, not looked up.
const widensRootConfig = picomatch(filterNamed('root_config'), { dot: true });

// Every job sets Node up and installs before it reaches a turbo task, so a
// change to what either reads changes what every job resolves. Turbo hashes
// neither. Nothing in the repo enumerates what the install reads, so these are
// declared; the Node version file is detected instead, because the workflow
// names the file it reads.
const INSTALL_INPUTS = ['.npmrc', 'pnpm-workspace.yaml'];

function nodeVersionFiles() {
  const declared = jobNames.flatMap((name) =>
    stepsOf(name).map((step) => step.with?.['node-version-file'])
  );

  return [...new Set(declared.filter((file) => file !== undefined))];
}

// The files turbo folds into every task's hash, so a change to one invalidates
// the whole graph and no diff-scoped run may narrow past it: the config
// declaring the globals, the two files turbo hashes for every run, and the
// declared globals themselves. Pinned rather than spread from `turbo.json`, so
// emptying `globalDependencies` fails the suite instead of shrinking this floor
// along with it.
const TURBO_GLOBAL_DEPENDENCIES = ['tsconfig.base.json', 'tsconfig.json'];
const TURBO_GLOBALS = [
  'turbo.json',
  'pnpm-lock.yaml',
  'package.json',
  ...TURBO_GLOBAL_DEPENDENCIES,
];

// The root files a diff-scoped job's gate matches but `root_config` need not
// carry, because that job does not read them. `vitest.config.ts` configures the
// suites `test-unit` and `test-react` run whole; neither `build` nor
// `typecheck` reads it, so a change to it need not widen either.
const ROOT_CONFIG_EXEMPT = ['vitest.config.ts'];

// `continue-on-error: false` is the default and lets a failure stand. `true`
// swallows it, and an expression is a value the model cannot resolve — both are
// rejected.
function toleratesFailure(declaration) {
  return declaration !== undefined && declaration !== false;
}

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

// A step fails its job only where nothing can route around the exit: one
// chain-free branch — an `else` arm carries no guard either, so a null guard
// alone is not enough — ending in a non-zero `exit`, with nothing before it
// that could exit first.
function failsUnconditionally(script) {
  const branches = branchesOf(script);

  if (branches.length !== 1 || branches[0].guard !== null) return false;

  const commands = commandsOf(branches[0].body).map((line) => line.trim());

  if (!EXIT_FAILURE.test(commands.at(-1) ?? '')) return false;

  return commands
    .slice(0, -1)
    .every((line) => FAIL_STEP_ECHO.test(line) || FAIL_STEP_PRELUDE.test(line));
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

// Only turbo runs can narrow the task set, and the branch model must not be
// pointed at scripts that never do.
function turboStepsOf(name) {
  return stepsOf(name).filter(
    (step) =>
      step.run !== undefined &&
      commandsOf(step.run).some((line) => line.includes('turbo'))
  );
}

// Every branch, so a run narrowed on the `push` path is as visible as one
// narrowed on the pull-request path.
function turboLinesOf(step) {
  return branchesOf(step.run).flatMap(turboLinesIn);
}

// Narrowing is read off the one shape the suite already trusts: a turbo line
// that is neither the whole task set nor an exempted fixed target. Detecting it
// this way rather than by matching known scoping spellings means `--affected`,
// a `[HEAD^1]` range, `-F`, and a `pkg#task` argument are all caught without
// being enumerated.
function narrowingStepsOf(name) {
  return turboStepsOf(name).filter((step) => {
    const mayFixTarget = FIXED_TARGET_STEPS.includes(`${name} / ${step.name}`);
    const allowed = (line) =>
      UNFILTERED_RUN.test(line) ||
      (mayFixTarget && FIXED_TARGET_RUN.test(line));

    return turboLinesOf(step).some((line) => !allowed(line));
  });
}

describe('ci path filters', () => {
  it('runs the changes job unconditionally', () => {
    expect(jobNamed('changes').if).toBeUndefined();
  });

  // Every gate reads an output of this one step, so the job running is not
  // enough: a step that is skipped, or pointed at a diff of nothing, empties
  // all four outputs and skips every gated job with the aggregator still green.
  it('detects changed paths against the pull request diff', () => {
    // The outputs, and the `dot: true` matching model the coverage tests use,
    // are this action's behaviour. Any other action reports no outputs at all.
    expect(detectStep.uses, '`filter` step action').toBe(
      'dorny/paths-filter@v4'
    );
    expect(detectStep.if, '`filter` step declares an `if:`').toBeUndefined();
    // `filters` is the only input the model reads. `base`, `ref`, and
    // `working-directory` each redirect what the filters are matched against.
    expect(
      Object.keys(detectStep.with),
      '`filter` step inputs beyond `filters`'
    ).toEqual(['filters']);
  });

  it('gates at least one job on the filters', () => {
    expect(gatedJobs.length).toBeGreaterThan(0);
    expect(filters.root_config?.length).toBeGreaterThan(0);
  });

  it.each(UNGATED_JOBS)('runs %s unconditionally', (name) => {
    expect(jobNamed(name).if).toBeUndefined();
  });

  it('carries exactly the declared jobs on the merge gate', () => {
    // Anchored on the workflow as well as on the declared list: comparing
    // `needs:` only against `REQUIRED_JOBS` leaves a job added to `ci.yml` and
    // to neither list off the gate and blocking nothing.
    const declared = jobNames.filter((name) => name !== 'ci-status');

    expect([...requiredJobs].sort()).toEqual([...REQUIRED_JOBS].sort());
    expect(
      declared.filter((name) => !requiredJobs.includes(name)),
      'jobs declared in `ci.yml` but not on the merge gate'
    ).toEqual([]);
  });

  // Membership blocks a merge only if the job also runs. A required job whose
  // `if:` is neither absent nor a changes-outputs gate is outside the filter
  // model entirely, so it can sit in `needs:` and never run on a pull request.
  it('runs every required job unconditionally or on a filter', () => {
    // `changes` too: every gated `if:` reads its outputs, so a `changes`
    // failure empties all of them and skips the jobs rather than failing them.
    const modelled = ['changes', ...UNGATED_JOBS, ...gatedJobs];

    expect(
      requiredJobs.filter((name) => !modelled.includes(name)),
      'required jobs declaring neither a changes-outputs gate nor a place in `UNGATED_JOBS`'
    ).toEqual([]);
    expect(
      modelled.filter((name) => !requiredJobs.includes(name)),
      'jobs the filter model covers but the merge gate does not carry'
    ).toEqual([]);
  });

  it('lists every diff-scoped job in ci-status needs', () => {
    expect(
      DIFF_SCOPED_JOBS.filter((name) => !requiredJobs.includes(name)),
      'diff-scoped jobs missing from `ci-status` needs'
    ).toEqual([]);
  });

  // The run-step model reads `run:` as a script bash executes. A `shell:`
  // override such as `bash -n {0}` parses that script without running it, so
  // every command the model reads — the aggregator's exit, the turbo lines —
  // becomes inert while the suite still sees them.
  it('runs every step under the default shell', () => {
    const overrides = [
      ...(workflow.defaults === undefined ? [] : [WORKFLOW_PATH]),
      ...jobNames.filter((name) => jobNamed(name).defaults !== undefined),
      ...jobNames.flatMap((name) =>
        stepsOf(name)
          .filter((step) => step.shell !== undefined)
          .map((step) => `${name} / ${step.name}`)
      ),
    ];

    expect(overrides, 'places overriding the shell').toEqual([]);
  });

  // Membership in `needs:` blocks a merge only if the aggregator runs when an
  // upstream job failed and then fails itself.
  it('fails ci-status on a failed or cancelled required job', () => {
    const aggregator = jobNamed('ci-status');

    expect(aggregator.if).toBe('always()');

    const failing = stepsOf('ci-status').filter(
      (step) => step.run !== undefined && failsUnconditionally(step.run)
    );

    expect(
      failing,
      '`ci-status` declares no step that fails unconditionally'
    ).toHaveLength(1);
    expect(
      resultsPropagatedBy(failing[0]).sort(),
      '`ci-status` failing step does not run on both results'
    ).toEqual(['cancelled', 'failure']);
  });

  // A failure reaches the gate only if it is allowed to stand.
  // `continue-on-error` turns one into a success at either level: on a required
  // job it reports `success` to `needs.*.result`, and on the aggregator it lets
  // the required check pass while its own step exits non-zero.
  it('lets a failure stand in every required job', () => {
    const gateJobs = ['ci-status', ...requiredJobs];

    const tolerated = [
      ...gateJobs.filter((name) =>
        toleratesFailure(jobNamed(name)['continue-on-error'])
      ),
      ...gateJobs.flatMap((name) =>
        stepsOf(name)
          .filter((step) => toleratesFailure(step['continue-on-error']))
          .map((step) => `${name} / ${step.name}`)
      ),
    ];

    expect(tolerated, 'places declaring `continue-on-error`').toEqual([]);
  });

  it('declares exactly the jobs that narrow turbo', () => {
    const scoped = jobNames.filter((name) => narrowingStepsOf(name).length > 0);

    expect(scoped.sort()).toEqual([...DIFF_SCOPED_JOBS].sort());
  });

  it('exempts a live fixed-target run for every entry', () => {
    const fixing = jobNames.flatMap((name) =>
      turboStepsOf(name)
        .filter((step) =>
          turboLinesOf(step).some((line) => FIXED_TARGET_RUN.test(line))
        )
        .map((step) => `${name} / ${step.name}`)
    );

    expect(
      FIXED_TARGET_STEPS.filter((step) => !fixing.includes(step)),
      'fixed-target exemptions naming no fixed-target run'
    ).toEqual([]);
  });

  it.each(gatedJobs)('runs %s for every root_config path', (name) => {
    const gated = filtersGating(name).flatMap(filterNamed);
    // `dorny/paths-filter` matches with `dot: true`.
    const isGated = picomatch(gated, { dot: true });
    const widened = rootFiles.filter(widensRootConfig);

    expect(widened.length).toBeGreaterThan(0);
    expect(widened.filter((file) => !isGated(file))).toEqual([]);
  });

  it.each(DIFF_SCOPED_JOBS)(
    'runs %s unfiltered on a root_config PR',
    (name) => {
      const steps = narrowingStepsOf(name);

      expect(steps, `\`${name}\` narrows no turbo run`).not.toHaveLength(0);

      for (const step of steps) {
        const where = `\`${name}\` step "${step.name}"`;

        expect(step.if, `${where} declares an \`if:\``).toBeUndefined();

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

  it('gates on a change to the workflow this suite reads', () => {
    const isGated = picomatch(gatingFilters.flatMap(filterNamed), {
      dot: true,
    });

    expect(
      isGated(WORKFLOW_PATH),
      `no gating filter matches \`${WORKFLOW_PATH}\``
    ).toBe(true);
  });

  // A workspace root is where packages live, so `packages` must gate it — a
  // root pnpm declares but no filter matches puts a whole tree in the turbo
  // graph with no job running for it. The glob names directories, so it is
  // matched as a file inside one: the filter matches paths, not patterns.
  it('gates every workspace root pnpm declares', () => {
    const gatesPackages = picomatch(filterNamed('packages'), { dot: true });

    expect(workspaceGlobs.length).toBeGreaterThan(0);
    expect(
      workspaceGlobs.filter(
        (glob) => !gatesPackages(`${glob.replace(/\*+/g, 'pkg')}/package.json`)
      ),
      'workspace roots the `packages` filter does not gate'
    ).toEqual([]);
  });

  // The floor turbo cannot hold: these decide what every job resolves before a
  // turbo task runs, so a change to one must widen the diff-scoped jobs too.
  it('treats every declared setup and install input as root config', () => {
    const nodeFiles = nodeVersionFiles();

    expect(
      nodeFiles,
      'no step names a `node-version-file` to set Node up from'
    ).not.toHaveLength(0);
    expect(
      INSTALL_INPUTS.filter((file) => !rootFiles.includes(file)),
      'install inputs that are not tracked root files'
    ).toEqual([]);
    expect(
      [...nodeFiles, ...INSTALL_INPUTS].filter(
        (file) => !widensRootConfig(file)
      ),
      'setup and install inputs missing from the `root_config` filter'
    ).toEqual([]);
  });

  // The floor `root_config` cannot fall below, held by `turbo.json` rather than
  // by the workflow — so dropping a file from `root_config` and the filters
  // gating the diff-scoped jobs in one change still fails.
  it('treats every turbo global dependency as root config', () => {
    expect(
      [...(turboConfig.globalDependencies ?? [])].sort(),
      '`turbo.json` no longer declares the global dependencies pinned here'
    ).toEqual([...TURBO_GLOBAL_DEPENDENCIES].sort());
    expect(
      TURBO_GLOBALS.filter((file) => !widensRootConfig(file)),
      "turbo's global hash inputs missing from the `root_config` filter"
    ).toEqual([]);
  });

  // A root file belongs to no package, so a diff filter selects nothing for it.
  // Any root file that turns a diff-scoped job on must therefore also widen it,
  // or the job runs having narrowed to an empty task set.
  it('carries every root file that gates a diff-scoped job', () => {
    const gates = [...new Set(DIFF_SCOPED_JOBS.flatMap(filtersGating))];
    const opensDiffScoped = picomatch(gates.flatMap(filterNamed), {
      dot: true,
    });
    expect(
      rootFiles.filter(
        (file) =>
          opensDiffScoped(file) &&
          !widensRootConfig(file) &&
          !ROOT_CONFIG_EXEMPT.includes(file)
      ),
      'root files that open a diff-scoped job without widening it'
    ).toEqual([]);
    expect(
      ROOT_CONFIG_EXEMPT.filter(
        (file) => !rootFiles.includes(file) || !opensDiffScoped(file)
      ),
      'exemptions naming no root file that opens a diff-scoped job'
    ).toEqual([]);
  });

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
      UNGATED_ROOT_FILES.filter((file) => !rootFiles.includes(file)),
      'exempted files that are not tracked root files'
    ).toEqual([]);
    // An entry a filter already matches is covered, not exempt. Accepting it
    // hides the day that filter drops the path and the coverage goes with it.
    expect(
      UNGATED_ROOT_FILES.filter(isMatched),
      'exempted files a gating filter already matches'
    ).toEqual([]);
  });
});
