import { cache } from 'react';

import { readFile } from 'node:fs/promises';
import path from 'node:path';

import type {
  ComponentEntry,
  PropsFile,
  PropsIndex,
} from '../../scripts/props-entries.mjs';

import 'server-only';

export type {
  ComponentEntry,
  PropEntry,
} from '../../scripts/props-entries.mjs';

const PROPS_DIR = path.join(process.cwd(), 'generated', 'props');

const readPropsJson = cache(async (fileName: string): Promise<unknown> => {
  const filePath = path.join(PROPS_DIR, fileName);
  try {
    return JSON.parse(await readFile(filePath, 'utf8'));
  } catch (error) {
    const missing = (error as NodeJS.ErrnoException).code === 'ENOENT';
    throw new Error(
      missing
        ? `No props JSON at ${filePath} — run \`pnpm --filter @nexus_ds/docs generate:props\`.`
        : `Could not read ${filePath}.`,
      { cause: error }
    );
  }
});

export async function loadComponentDocs(
  slug: string,
  component?: string
): Promise<ComponentEntry[]> {
  const index = (await readPropsJson('index.json')) as PropsIndex;

  const names = Object.hasOwn(index, slug) ? index[slug] : undefined;
  if (!names) {
    throw new Error(
      `PropsTable: unknown slug "${slug}". Known slugs: ${Object.keys(index).join(', ')}.`
    );
  }
  if (component && !names.includes(component)) {
    throw new Error(
      `PropsTable: "${slug}" has no component "${component}". Components: ${names.join(', ')}.`
    );
  }

  const { components } = (await readPropsJson(`${slug}.json`)) as PropsFile;
  if (!component) return components;
  return components.filter((entry) => entry.name === component);
}
