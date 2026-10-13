import { cache } from 'react';

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

import { docsRoot, reactSrc } from '../../scripts/roots.mjs';

import 'server-only';

const DEPENDENCIES_DIR = path.join(docsRoot, 'generated', 'dependencies');

type Package = { name: string; range: string };

type Dependencies = {
  install: Package[];
  components: string[];
  copy: string[];
  files: string[];
  styles: string[];
};

async function listDependencyFiles() {
  try {
    return await readdir(DEPENDENCIES_DIR);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    throw new Error(
      `dependencies: no ${DEPENDENCIES_DIR} — run \`pnpm --filter @nexus_ds/docs generate:dependencies\`.`,
      { cause: error }
    );
  }
}

function isRecord(value: unknown): value is Partial<Record<string, unknown>> {
  return typeof value === 'object' && value !== null;
}

function isStringList(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === 'string')
  );
}

function isPackage(value: unknown): value is Package {
  return (
    isRecord(value) &&
    typeof value.name === 'string' &&
    typeof value.range === 'string'
  );
}

function isDependencies(value: unknown): value is Dependencies {
  return (
    isRecord(value) &&
    Array.isArray(value.install) &&
    value.install.every(isPackage) &&
    isStringList(value.components) &&
    isStringList(value.copy) &&
    isStringList(value.files) &&
    isStringList(value.styles)
  );
}

const loadDependencies = cache(async (slug: string): Promise<Dependencies> => {
  const fileNames = await listDependencyFiles();
  const fileName = `${slug}.json`;

  if (!fileNames.includes(fileName)) {
    const known = fileNames.map((name) => path.basename(name, '.json'));
    throw new Error(
      `dependencies: unknown slug "${slug}". Known slugs: ${known.join(', ')}.`
    );
  }

  const filePath = path.join(DEPENDENCIES_DIR, fileName);
  const parsed: unknown = JSON.parse(await readFile(filePath, 'utf8'));

  if (!isDependencies(parsed)) {
    throw new Error(
      `dependencies: ${filePath} needs an install list of { name, range } and string arrays components, copy, files, styles — rerun \`pnpm --filter @nexus_ds/docs generate:dependencies\`.`
    );
  }
  return parsed;
});

/** Reads a file the dependencies JSON lists, by its path under `packages/react/src/`. */
export const loadReactSource = cache(async (file: string) => {
  try {
    return await readFile(path.join(reactSrc, file), 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    throw new Error(
      `dependencies: ${file} is listed but missing from ${reactSrc} — rerun \`pnpm --filter @nexus_ds/docs generate:dependencies\`.`,
      { cause: error }
    );
  }
});

export type InstallPlan = {
  components: string[];
  packages: string[];
  files: string[];
  styles: string[];
};

type ListOf = (dependencies: Dependencies) => string[];

const packagesOf: ListOf = ({ install }) =>
  install.map(({ name, range }) => `${name}@${range}`);
const filesOf: ListOf = ({ files, copy }) => [...files, ...copy];
const stylesOf: ListOf = ({ styles }) => styles;

function missing(needed: string[], installed: string[]) {
  const have = new Set(installed);
  return [...new Set(needed)].filter((item) => !have.has(item));
}

function loadAll(slugs: readonly string[]) {
  return Promise.all(slugs.map((slug) => loadDependencies(slug)));
}

/**
 * What installing `slugs` takes beyond `besides`: the components to install
 * first, then only the packages, files and styles those components don't
 * already bring. `alsoPackages` are `name@range` packages beyond what `slugs`
 * install.
 */
export async function loadInstallPlan(
  slugs: readonly string[],
  besides: readonly string[] = [],
  alsoPackages: readonly string[] = []
): Promise<InstallPlan> {
  const [needed, installed] = await Promise.all([
    loadAll(slugs),
    loadAll(besides),
  ]);
  const covered = new Set([
    ...slugs,
    ...besides,
    ...installed.flatMap(({ components }) => components),
  ]);
  const components = missing(
    needed.flatMap(({ components }) => components),
    [...covered]
  ).sort();
  const brought = [...installed, ...(await loadAll(components))];

  return {
    components,
    packages: missing(
      [...needed.flatMap(packagesOf), ...alsoPackages],
      brought.flatMap(packagesOf)
    ),
    files: missing(needed.flatMap(filesOf), brought.flatMap(filesOf)),
    styles: missing(needed.flatMap(stylesOf), brought.flatMap(stylesOf)),
  };
}
