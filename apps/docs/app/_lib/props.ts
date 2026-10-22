import { cache } from 'react';

import { readFile } from 'node:fs/promises';
import path from 'node:path';

import type {
  ComponentEntry,
  PropsFile,
  PropsIndex,
} from '../../scripts/props-entries.ts';

import type { Framework } from './frameworks';

import 'server-only';

export type { ComponentEntry, PropEntry } from '../../scripts/props-entries.ts';

/** Where each framework's props JSON lives, and the script that writes it. */
const FRAMEWORK_PROPS: Record<Framework, { dir: string; generate: string }> = {
  react: {
    dir: path.join(process.cwd(), 'generated', 'props'),
    generate: 'generate:props',
  },
  vue: {
    dir: path.join(process.cwd(), 'generated', 'vue', 'props'),
    generate: 'generate:vue',
  },
};

const readPropsJson = cache(
  async (framework: Framework, fileName: string): Promise<unknown> => {
    const { dir, generate } = FRAMEWORK_PROPS[framework];
    const filePath = path.join(dir, fileName);
    try {
      return JSON.parse(await readFile(filePath, 'utf8'));
    } catch (error) {
      const missing = (error as NodeJS.ErrnoException).code === 'ENOENT';
      throw new Error(
        missing
          ? `No props JSON at ${filePath} — run \`pnpm --filter @nxds/docs ${generate}\`.`
          : `Could not read ${filePath}.`,
        { cause: error }
      );
    }
  }
);

export async function loadComponentDocs(
  slug: string,
  component?: string,
  framework: Framework = 'react'
): Promise<ComponentEntry[]> {
  const index = (await readPropsJson(framework, 'index.json')) as PropsIndex;

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

  const { components } = (await readPropsJson(
    framework,
    `${slug}.json`
  )) as PropsFile;
  if (!component) return components;
  return components.filter((entry) => entry.name === component);
}
