import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

import 'server-only';

const DEPENDENCIES_DIR = path.join(process.cwd(), 'generated', 'dependencies');

export type Block = {
  /** `name@range` specs to install. */
  packages: string[];
  copy: string[];
  styles: string[];
  /** Files the demos load from the app's `public/`. */
  assets: string[];
};

type Dependencies = {
  /** Everything the component and its preview demo need. */
  installBlock: Block;
  /** What the other demos need beyond `installBlock`. */
  examplesBlock: Block;
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

function isBlock(value: unknown): value is Block {
  return (
    isRecord(value) &&
    isStringList(value.packages) &&
    isStringList(value.copy) &&
    isStringList(value.styles) &&
    isStringList(value.assets)
  );
}

function isDependencies(value: unknown): value is Dependencies {
  return (
    isRecord(value) &&
    isBlock(value.installBlock) &&
    isBlock(value.examplesBlock)
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
      `InstallBlock: ${filePath} needs installBlock and examplesBlock, each with string arrays packages, copy, styles, assets — rerun \`pnpm --filter @nexus_ds/docs generate:dependencies\`.`
    );
  }
  return parsed;
}
