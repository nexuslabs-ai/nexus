import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');

// Turbo reports a task whose package has no matching script with this command
// string; those packages emit nothing, so they are exempt from the check.
const NO_SCRIPT_COMMAND = '<NONEXISTENT>';

export function auditTurboOutputs(options = {}) {
  const repoRoot = options.repoRoot ?? REPO_ROOT;
  const tasks = options.tasks ?? readBuildTasks(repoRoot);
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

function readBuildTasks(repoRoot) {
  const stdout = execFileSync('npx', ['turbo', 'run', 'build', '--dry=json'], {
    cwd: repoRoot,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    shell: true,
  });

  return JSON.parse(stdout).tasks ?? [];
}

function printResult(result) {
  if (result.ok) {
    console.log('Turbo outputs audit passed.');
    return;
  }

  console.error('Turbo outputs audit failed:');

  for (const item of result.problems) {
    console.error(`- ${item.code}: ${item.task} — ${item.message}`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = auditTurboOutputs();
  printResult(result);
  process.exit(result.ok ? 0 : 1);
}
