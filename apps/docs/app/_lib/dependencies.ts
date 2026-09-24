import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

import 'server-only';

const DEPENDENCIES_DIR = path.join(process.cwd(), 'generated', 'dependencies');

type Package = { name: string; range: string };

type Dependencies = { install: Package[]; copy: string[]; files: string[] };

async function listDependencyFiles() {
  try {
    return await readdir(DEPENDENCIES_DIR);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    throw new Error(
      `InstallBlock: no ${DEPENDENCIES_DIR} — run \`pnpm --filter @nexus_ds/docs generate:dependencies\`.`,
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
    isStringList(value.files)
  );
}

export async function loadDependencies(slug: string): Promise<Dependencies> {
  const fileNames = await listDependencyFiles();
  const fileName = `${slug}.json`;

  if (slug.startsWith('_') || !fileNames.includes(fileName)) {
    const known = fileNames
      .map((name) => path.basename(name, '.json'))
      .filter((name) => !name.startsWith('_'));
    throw new Error(
      `InstallBlock: unknown slug "${slug}". Known slugs: ${known.join(', ')}.`
    );
  }

  const filePath = path.join(DEPENDENCIES_DIR, fileName);
  const parsed: unknown = JSON.parse(await readFile(filePath, 'utf8'));

  if (!isDependencies(parsed)) {
    throw new Error(
      `InstallBlock: ${filePath} needs an install list of { name, range } and string arrays copy, files — rerun \`pnpm --filter @nexus_ds/docs generate:dependencies\`.`
    );
  }
  return parsed;
}
