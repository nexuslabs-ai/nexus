import { spawnSync, type SpawnSyncOptions } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { minVersion, satisfies, validRange } from 'semver';

import { CliError, readJson } from './errors';
import type { PackageManager, Project } from './project';

const ADD_COMMAND: Record<PackageManager, string[]> = {
  npm: ['install'],
  pnpm: ['add'],
  yarn: ['add'],
  bun: ['add'],
};

/**
 * Whether the range the project declares for `name` already meets `range`.
 * A spec that isn't a semver range (`file:`, `workspace:`, a tag) is the
 * project's own choice, so it counts.
 */
function declaresRange(project: Project, name: string, range: string) {
  const declared = project.dependencies[name];
  if (declared === undefined) return false;
  if (validRange(declared) === null) return true;
  const lowest = minVersion(declared);
  return lowest !== null && satisfies(lowest, range);
}

/** `name@range` for each package the project lacks, or declares below `range`. */
export function packagesToInstall(
  project: Project,
  packages: Record<string, string>
) {
  return Object.entries(packages)
    .filter(([name, range]) => !declaresRange(project, name, range))
    .map(([name, range]) => `${name}@${range}`);
}

/** The version of `name` in the nearest `node_modules`, or null. */
export function installedVersion(project: Project, name: string) {
  let dir = project.root;
  for (;;) {
    const manifest = path.join(dir, 'node_modules', name, 'package.json');
    if (existsSync(manifest)) {
      return (readJson(manifest) as { version?: string }).version ?? null;
    }
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

/** Runs the project's package manager. Output goes to stderr so `--json` stays clean. */
export function installPackages(
  project: Project,
  specs: string[],
  { dev }: { dev: boolean }
) {
  if (specs.length === 0) return;
  const args = [
    ...ADD_COMMAND[project.packageManager],
    ...(dev ? ['-D'] : []),
    ...specs,
  ];
  const options: SpawnSyncOptions = {
    cwd: project.root,
    stdio: ['ignore', 2, 2],
  };
  // Windows runs package managers through cmd.exe, which strips an unquoted
  // `^`. Node doesn't quote an args array for a shell, so pass one string.
  const run =
    process.platform === 'win32'
      ? spawnSync(
          [project.packageManager, ...args.map((arg) => `"${arg}"`)].join(' '),
          { ...options, shell: true }
        )
      : spawnSync(project.packageManager, args, options);
  if (run.status !== 0) {
    throw new CliError(
      `\`${project.packageManager} ${args.join(' ')}\` failed. Fix the error above, then run the same nxds command again.`
    );
  }
  for (const spec of specs) {
    const name = spec.slice(0, spec.lastIndexOf('@'));
    project.dependencies[name] = spec.slice(name.length + 1);
  }
}
