import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');

const TURBO_BIN = createRequire(import.meta.url).resolve('turbo');

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

    const directory = task.directory.split(path.sep).join('/');

    for (const glob of task.resolvedTaskDefinition?.outputs ?? []) {
      if (glob.startsWith('!')) continue;

      const prefix = literalPrefix(glob);

      if (!prefix) {
        problems.push({
          code: 'unanchored-outputs',
          task: task.taskId,
          message:
            `Declared output \`${glob}\` starts with a wildcard, so this audit ` +
            `cannot resolve a directory to check. Anchor it under a literal ` +
            `directory in ${directory}/turbo.json.`,
        });
        continue;
      }

      const checked = `${directory}/${prefix}`;
      if (containsFile(path.join(repoRoot, checked))) continue;

      problems.push({
        code: 'unmatched-outputs',
        task: task.taskId,
        message:
          `Declared output \`${glob}\` emitted no files under \`${checked}\`. ` +
          `A cache hit would restore an empty artifact. Fix the glob in ` +
          `${directory}/turbo.json.`,
      });
    }
  }

  return { ok: problems.length === 0, problems };
}

function literalPrefix(glob) {
  const segments = glob.split('/');
  const wildcard = segments.findIndex((segment) => WILDCARD.test(segment));

  return (wildcard === -1 ? segments : segments.slice(0, wildcard)).join('/');
}

function containsFile(target) {
  const stat = fs.statSync(target, { throwIfNoEntry: false });

  if (!stat) return false;
  if (!stat.isDirectory()) return true;

  return fs
    .readdirSync(target, { recursive: true, withFileTypes: true })
    .some((entry) => entry.isFile());
}

function resolveTasks(options) {
  const repoRoot = options.repoRoot ?? REPO_ROOT;
  const turboArgs = options.turboArgs ?? [];
  const tasks = options.tasks ?? readBuildTasks(repoRoot, turboArgs);

  const filtered = turboArgs.some((arg) => arg.startsWith('--filter'));

  if (!Array.isArray(tasks) || (tasks.length === 0 && !filtered)) {
    throw new Error(
      'turbo reported no `build` tasks. The `--dry=json` payload shape has ' +
        'changed, so the audit cannot verify any output declaration.'
    );
  }

  return tasks;
}

function readBuildTasks(repoRoot, turboArgs) {
  const stdout = execFileSync(
    process.execPath,
    [TURBO_BIN, 'run', 'build', '--dry=json', ...turboArgs],
    {
      cwd: repoRoot,
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
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
