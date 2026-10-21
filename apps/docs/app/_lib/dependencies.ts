import { cache } from 'react';

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

import { docsRoot, reactSrc } from '../../scripts/roots.mjs';

import 'server-only';

const DEPENDENCIES_DIR = path.join(docsRoot, 'generated', 'dependencies');
const BLOCK_DEPENDENCIES_DIR = path.join(DEPENDENCIES_DIR, 'blocks');

type Package = { name: string; range: string };

type Plan = {
  components: string[];
  install: Package[];
  files: string[];
  styles: string[];
};

async function listDependencyFiles(dir: string) {
  try {
    return await readdir(dir);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    throw new Error(
      `dependencies: no ${dir} — run \`pnpm --filter @nxds/docs generate:dependencies\`.`,
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

function isPlan(value: unknown): value is Plan {
  return (
    isRecord(value) &&
    isStringList(value.components) &&
    Array.isArray(value.install) &&
    value.install.every(isPackage) &&
    isStringList(value.files) &&
    isStringList(value.styles)
  );
}

export type InstallPlan = {
  components: string[];
  packages: string[];
  files: string[];
  styles: string[];
};

async function loadPlan(dir: string, slug: string): Promise<InstallPlan> {
  const fileNames = await listDependencyFiles(dir);
  const fileName = `${slug}.json`;

  if (!fileNames.includes(fileName)) {
    const known = fileNames
      .filter((name) => name.endsWith('.json'))
      .map((name) => path.basename(name, '.json'));
    throw new Error(
      `dependencies: unknown slug "${slug}". Known slugs: ${known.join(', ')}.`
    );
  }

  const filePath = path.join(dir, fileName);
  const parsed: unknown = JSON.parse(await readFile(filePath, 'utf8'));

  if (!isRecord(parsed) || !isPlan(parsed.plan)) {
    throw new Error(
      `dependencies: ${filePath} needs a plan of string arrays components, files, styles and an install list of { name, range } — rerun \`pnpm --filter @nxds/docs generate:dependencies\`.`
    );
  }
  const { components, install, files, styles } = parsed.plan;
  return {
    components,
    packages: install.map(({ name, range }) => `${name}@${range}`),
    files,
    styles,
  };
}

/**
 * What installing a component takes: the components to install first, then
 * only the packages, files and styles those components don't already bring.
 */
export const loadInstallPlan = cache((slug: string) =>
  loadPlan(DEPENDENCIES_DIR, slug)
);

/** The same plan for a block, which links only the components no other link brings. */
export const loadBlockPlan = cache((slug: string) =>
  loadPlan(BLOCK_DEPENDENCIES_DIR, slug)
);

/** Reads a file the dependencies JSON lists, by its path under `packages/react/src/`. */
export const loadReactSource = cache(async (file: string) => {
  try {
    return await readFile(path.join(reactSrc, file), 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    throw new Error(
      `dependencies: ${file} is listed but missing from ${reactSrc} — rerun \`pnpm --filter @nxds/docs generate:dependencies\`.`,
      { cause: error }
    );
  }
});
