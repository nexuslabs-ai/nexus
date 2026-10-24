import { existsSync } from 'node:fs';
import path from 'node:path';
import { major, minVersion, parse, validRange } from 'semver';

import type { ReactMajor } from './catalog';
import { CLI_COMMAND } from './cli-command';
import { CliError, readJson } from './errors';
import { installedVersion } from './packages';

export type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun';

/** The app setups `init` can wire up. */
export type Setup = 'next-app' | 'vite-react';

export type Project = {
  root: string;
  /** `null` when the app is neither a Next.js App Router nor a Vite React app. */
  setup: Setup | null;
  packageManager: PackageManager;
  usesSrc: boolean;
  typescript: boolean;
  /** Every dependency and devDependency name, with its declared range. */
  dependencies: Record<string, string>;
};

const LOCKFILES: [string, PackageManager][] = [
  ['pnpm-lock.yaml', 'pnpm'],
  ['yarn.lock', 'yarn'],
  ['bun.lock', 'bun'],
  ['bun.lockb', 'bun'],
  ['package-lock.json', 'npm'],
];

export const APP_DIRS = ['app', 'src/app'];
export const VITE_ENTRIES = ['src/main.tsx', 'src/main.jsx'];
export const VITE_CONFIGS = [
  'vite.config.ts',
  'vite.config.mts',
  'vite.config.js',
];

function firstExisting(root: string, candidates: string[]) {
  return candidates.find((file) => existsSync(path.join(root, file)));
}

function detectSetup(root: string, dependencies: Record<string, string>) {
  if (
    'next' in dependencies &&
    firstExisting(
      root,
      APP_DIRS.map((dir) => `${dir}/layout.tsx`)
    )
  ) {
    return 'next-app';
  }
  if (
    'vite' in dependencies &&
    'react' in dependencies &&
    firstExisting(root, VITE_ENTRIES)
  ) {
    return 'vite-react';
  }
  return null;
}

export function readProject(root: string): Project {
  const manifestPath = path.join(root, 'package.json');
  if (!existsSync(manifestPath)) {
    throw new CliError(
      `No package.json in ${root}. Run \`${CLI_COMMAND}\` from your app's root folder, or pass --cwd.`
    );
  }
  const manifest = readJson(manifestPath) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  const dependencies = {
    ...manifest.devDependencies,
    ...manifest.dependencies,
  };

  return {
    root,
    setup: detectSetup(root, dependencies),
    packageManager:
      LOCKFILES.find(([file]) => existsSync(path.join(root, file)))?.[1] ??
      'npm',
    usesSrc: existsSync(path.join(root, 'src')),
    typescript: existsSync(path.join(root, 'tsconfig.json')),
    dependencies,
  };
}

/** The first of `candidates` that exists under the project root. */
export function findFile(project: Project, candidates: string[]) {
  return firstExisting(project.root, candidates);
}

/**
 * The React major the app's nxds files are for: 18 on React 18.3, 19 on React
 * 19 or newer. Reads the installed React, else the lowest version the declared
 * range allows. React 18's files also run on 19, so a range that spans both
 * gets 18's.
 */
export function reactMajor(project: Project): ReactMajor {
  const declared = project.dependencies.react;
  if (declared === undefined) {
    throw new CliError(
      'This app has no react dependency. nxds needs React 18.3 or 19.'
    );
  }
  const installed = installedVersion(project, 'react');
  const range = validRange(declared) === null ? null : minVersion(declared);
  const version = installed === null ? range : parse(installed);
  if (version === null) {
    throw new CliError(
      `This app declares react ${declared}, which names no version, and none is installed. Install your dependencies, then run the command again.`
    );
  }
  if (version.major >= 19) return 19;
  if (version.major === 18 && version.minor >= 3) return 18;
  throw new CliError(
    `nxds needs React 18.3 or 19, and this app uses react ${version.version}. Upgrade React, then run the command again.`
  );
}

/**
 * The major version of `name` the project uses: the lowest its declared range
 * allows, or the installed one when the spec isn't a range (`catalog:`,
 * `workspace:*`, a tag). Null when neither is known.
 */
export function majorVersion(project: Project, name: string) {
  const declared = project.dependencies[name];
  if (declared === undefined) return null;
  if (validRange(declared) !== null) return minVersion(declared)?.major ?? null;
  const installed = installedVersion(project, name);
  return installed === null ? null : major(installed);
}
