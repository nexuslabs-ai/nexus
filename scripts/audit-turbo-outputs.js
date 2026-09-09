import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');

// Turbo reports a task whose package has no matching script with this command
// string; those packages emit nothing, so they are exempt from the check.
const NO_SCRIPT_COMMAND = '<NONEXISTENT>';

const WILDCARD = /[*?[\]{}]/;

export function auditTurboOutputs(options = {}) {
  const tasks = resolveTasks(options);
  const problems = [];

  for (const task of tasks) {
    if (task.command === NO_SCRIPT_COMMAND) continue;
    if (task.resolvedTaskDefinition?.outputs?.length) continue;

    problems.push({
      code: 'missing-outputs',
      task: task.taskId,
      message:
        'Package has a `build` script but declares no `outputs`. A cache hit ' +
        'would restore nothing. Add an `outputs` array to the package turbo.json.',
    });
  }

  return { ok: problems.length === 0, problems };
}

export function auditEmittedOutputs(options = {}) {
  const tasks = resolveTasks(options);
  const repoRoot = options.repoRoot ?? REPO_ROOT;
  const problems = [];

  for (const task of tasks) {
    if (task.command === NO_SCRIPT_COMMAND) continue;

    for (const glob of task.resolvedTaskDefinition?.outputs ?? []) {
      if (glob.startsWith('!')) continue;

      const target = path.join(repoRoot, task.directory, literalPrefix(glob));
      if (isPopulated(target)) continue;

      problems.push({
        code: 'unmatched-outputs',
        task: task.taskId,
        message:
          `Declared output \`${glob}\` matched nothing after the build. A cache ` +
          `hit would restore an empty artifact. Fix the glob in ` +
          `${task.directory.split(path.sep).join('/')}/turbo.json.`,
      });
    }
  }

  return { ok: problems.length === 0, problems };
}

// The leading path segments before the first wildcard — the shallowest
// directory a glob can possibly match under.
function literalPrefix(glob) {
  const segments = glob.split('/');
  const wildcard = segments.findIndex((segment) => WILDCARD.test(segment));

  return (wildcard === -1 ? segments : segments.slice(0, wildcard)).join('/');
}

function isPopulated(target) {
  const stat = fs.statSync(target, { throwIfNoEntry: false });

  if (!stat) return false;
  if (!stat.isDirectory()) return true;

  return fs.readdirSync(target).length > 0;
}

function resolveTasks(options) {
  const turboArgs = options.turboArgs ?? [];
  const tasks = options.tasks ?? readBuildTasks(turboArgs);

  // A filter can legitimately select nothing; an unfiltered run cannot, so an
  // empty list there means the payload shape moved and the audit checked nothing.
  if (!Array.isArray(tasks) || (tasks.length === 0 && turboArgs.length === 0)) {
    throw new Error(
      'turbo reported no `build` tasks. The `--dry=json` payload shape has ' +
        'changed, so the audit cannot verify any output declaration.'
    );
  }

  return tasks;
}

function readBuildTasks(turboArgs = []) {
  const stdout = execFileSync(
    'pnpm',
    ['exec', 'turbo', 'run', 'build', '--dry=json', ...turboArgs],
    {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
      shell: true,
    }
  );

  return JSON.parse(stdout).tasks;
}

function printProblems(problems) {
  if (problems.length === 0) {
    console.log('Turbo outputs audit passed.');
    return;
  }

  console.error('Turbo outputs audit failed:');

  for (const item of problems) {
    console.error(`- ${item.code}: ${item.task} — ${item.message}`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const argv = process.argv.slice(2);
  const postBuild = argv.includes('--post-build');
  const turboArgs = argv.filter((arg) => arg !== '--post-build');
  const tasks = resolveTasks({ turboArgs });

  const problems = [
    ...auditTurboOutputs({ tasks, turboArgs }).problems,
    ...(postBuild ? auditEmittedOutputs({ tasks, turboArgs }).problems : []),
  ];

  printProblems(problems);
  process.exit(problems.length === 0 ? 0 : 1);
}
