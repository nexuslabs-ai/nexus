import { cache } from 'react';

import { docsRoot, reactSrc, vueSrc } from '@nxds/source-model/roots.mjs';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

import type { Framework } from './frameworks';

import 'server-only';

const DEPENDENCIES_DIR = path.join(docsRoot, 'generated', 'dependencies');
const BLOCK_DEPENDENCIES_DIR = path.join(DEPENDENCIES_DIR, 'blocks');

type PlanSource = {
  /** Directory of `{slug}.json` plans. */
  plans: string;
  /** The docs script that writes them. */
  generate: string;
};

/** Each framework's plans, and the source tree their file paths are relative to. */
const FRAMEWORK_SOURCES: Record<Framework, PlanSource & { src: string }> = {
  react: {
    plans: DEPENDENCIES_DIR,
    generate: 'generate:dependencies',
    src: reactSrc,
  },
  vue: {
    plans: path.join(docsRoot, 'generated', 'vue', 'dependencies'),
    generate: 'generate:vue',
    src: vueSrc,
  },
};

const BLOCK_SOURCE: PlanSource = {
  plans: BLOCK_DEPENDENCIES_DIR,
  generate: 'generate:dependencies',
};

function regenerate(generate: string) {
  return `\`pnpm --filter @nxds/docs ${generate}\``;
}

/** The source tree a framework's install paths are relative to, from the repo root. */
export function frameworkSourceRoot(framework: Framework): string {
  return `packages/${framework}/src/`;
}

type Package = { name: string; range: string };

type Plan = {
  components: string[];
  install: Package[];
  files: string[];
  styles: string[];
};

async function listDependencyFiles({ plans, generate }: PlanSource) {
  try {
    return await readdir(plans);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    throw new Error(
      `dependencies: no ${plans} — run ${regenerate(generate)}.`,
      {
        cause: error,
      }
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

async function loadPlan(
  source: PlanSource,
  slug: string
): Promise<InstallPlan> {
  const fileNames = await listDependencyFiles(source);
  const fileName = `${slug}.json`;

  if (!fileNames.includes(fileName)) {
    const known = fileNames
      .filter((name) => name.endsWith('.json'))
      .map((name) => path.basename(name, '.json'));
    throw new Error(
      `dependencies: unknown slug "${slug}". Known slugs: ${known.join(', ')}.`
    );
  }

  const filePath = path.join(source.plans, fileName);
  const parsed: unknown = JSON.parse(await readFile(filePath, 'utf8'));

  if (!isRecord(parsed) || !isPlan(parsed.plan)) {
    throw new Error(
      `dependencies: ${filePath} needs a plan of string arrays components, files, styles and an install list of { name, range } — rerun ${regenerate(source.generate)}.`
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
export const loadInstallPlan = cache(
  (slug: string, framework: Framework = 'react') =>
    loadPlan(FRAMEWORK_SOURCES[framework], slug)
);

/** The same plan for a block, which links only the components no other link brings. */
export const loadBlockPlan = cache((slug: string) =>
  loadPlan(BLOCK_SOURCE, slug)
);

/** Reads a file the dependencies JSON lists, by its path under the framework's `src/`. */
export const loadSource = cache(
  async (file: string, framework: Framework = 'react') => {
    const { src, generate } = FRAMEWORK_SOURCES[framework];
    try {
      return await readFile(path.join(src, file), 'utf8');
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
      throw new Error(
        `dependencies: ${file} is listed but missing from ${src} — rerun ${regenerate(generate)}.`,
        { cause: error }
      );
    }
  }
);
