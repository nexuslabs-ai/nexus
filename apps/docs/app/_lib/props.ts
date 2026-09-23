import { readFile } from 'node:fs/promises';
import path from 'node:path';

import type {
  ComponentEntry,
  PropsFile,
  PropsIndex,
} from '../../scripts/generate-props.mjs';

import 'server-only';

export type {
  ComponentEntry,
  PropEntry,
} from '../../scripts/generate-props.mjs';

const PROPS_DIR = path.join(process.cwd(), 'generated', 'props');

async function readPropsJson<T>(fileName: string): Promise<T> {
  return JSON.parse(await readFile(path.join(PROPS_DIR, fileName), 'utf8'));
}

async function readIndex(): Promise<PropsIndex> {
  try {
    return await readPropsJson<PropsIndex>('index.json');
  } catch (error) {
    throw new Error(
      'No props JSON — run `pnpm --filter @nexus_ds/docs generate:props`.',
      { cause: error }
    );
  }
}

/** The generated prop docs for `slug`, narrowed to `component` when given. */
export async function loadComponentDocs(
  slug: string,
  component?: string
): Promise<ComponentEntry[]> {
  const index = await readIndex();

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

  const { components } = await readPropsJson<PropsFile>(`${slug}.json`);
  if (!component) return components;
  return components.filter((entry) => entry.name === component);
}
