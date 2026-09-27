import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

import 'server-only';

const DEPENDENCIES_DIR = path.join(process.cwd(), 'generated', 'dependencies');

type Package = { name: string; range: string };

type Dependencies = {
  install: Package[];
  /** Packages the examples import beyond `install`. */
  examples: Package[];
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
    Array.isArray(value.examples) &&
    value.examples.every(isPackage) &&
    isStringList(value.copy) &&
    isStringList(value.files) &&
    isStringList(value.styles)
  );
}

export async function loadDependencies(slug: string): Promise<Dependencies> {
  const fileNames = await listDependencyFiles();
  const fileName = `${slug}.json`;

  if (!fileNames.includes(fileName)) {
    const known = fileNames.map((name) => path.basename(name, '.json'));
    throw new Error(
      `InstallBlock: unknown slug "${slug}". Known slugs: ${known.join(', ')}.`
    );
  }

  const filePath = path.join(DEPENDENCIES_DIR, fileName);
  const parsed: unknown = JSON.parse(await readFile(filePath, 'utf8'));

  if (!isDependencies(parsed)) {
    throw new Error(
      `InstallBlock: ${filePath} needs install and examples lists of { name, range } and string arrays copy, files, styles — rerun \`pnpm --filter @nexus_ds/docs generate:dependencies\`.`
    );
  }
  return parsed;
}
