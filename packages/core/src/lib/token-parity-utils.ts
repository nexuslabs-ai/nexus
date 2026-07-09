import { type Oklch, oklch, parse } from 'culori';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { NexusSurfaceTone } from './palette';

// Shared resolvers for the token parity tests (`tone-parity.test.ts`,
// `derive-theme.static-parity.test.ts`). Kept in one place so the two suites
// resolve static token JSON identically and cannot drift.

export type TokenRecord = Record<string, string>;

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const ROOT_DIR = path.resolve(HERE, '..', '..');
const SEMANTIC_DIR = path.join(ROOT_DIR, 'tokens', 'semantic');
const PRIMITIVE_COLOR_FILE = path.join(
  ROOT_DIR,
  'tokens',
  'primitives',
  'color.json'
);

export const primitiveColors = JSON.parse(
  readFileSync(PRIMITIVE_COLOR_FILE, 'utf8')
) as Record<string, Record<string, { $value: string; $type: string }>>;

export function readJson(file: string): unknown {
  return JSON.parse(readFileSync(file, 'utf8'));
}

function collectColorLeaves(
  obj: unknown,
  leaves: TokenRecord,
  tokenPath: string[] = []
): void {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return;
  const record = obj as Record<string, unknown>;
  if (record.$type === 'color' && typeof record.$value === 'string') {
    leaves[tokenPath.join('-')] = record.$value;
    return;
  }

  for (const [key, value] of Object.entries(record)) {
    if (key.startsWith('$')) continue;
    collectColorLeaves(value, leaves, [...tokenPath, key]);
  }
}

export function baseLeaves(
  tone: NexusSurfaceTone,
  mode: 'light' | 'dark'
): TokenRecord {
  const leaves: TokenRecord = {};
  collectColorLeaves(
    readJson(path.join(SEMANTIC_DIR, `base-${tone}-${mode}.json`)),
    leaves
  );
  return leaves;
}

export function parseToOklch(input: string): Oklch {
  const parsed = parse(input);
  if (!parsed) throw new Error(`Cannot parse color "${input}"`);
  const color = oklch(parsed);
  if (!color) throw new Error(`Cannot convert color "${input}" to OKLCH`);
  return color;
}
