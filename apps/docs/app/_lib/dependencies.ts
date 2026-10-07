import { cache } from 'react';

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

import { reactSrc } from '../../scripts/roots.mjs';

import 'server-only';

const DEPENDENCIES_DIR = path.join(process.cwd(), 'generated', 'dependencies');

type Package = { name: string; range: string };

export type Dependencies = {
  install: Package[];
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
    isStringList(value.copy) &&
    isStringList(value.files) &&
    isStringList(value.styles)
  );
}

export const loadDependencies = cache(
  async (slug: string): Promise<Dependencies> => {
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
        `dependencies: ${filePath} needs an install list of { name, range } and string arrays copy, files, styles — rerun \`pnpm --filter @nexus_ds/docs generate:dependencies\`.`
      );
    }
    return parsed;
  }
);

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
