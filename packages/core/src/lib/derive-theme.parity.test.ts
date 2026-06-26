import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { deriveTheme } from './derive-theme';

type Mode = 'light' | 'dark';

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));
const SEMANTIC_DIR = path.resolve(TEST_DIR, '..', '..', 'tokens', 'semantic');

function collectColorLeaves(
  obj: unknown,
  keys: Set<string>,
  tokenPath: string[] = []
): void {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return;
  const record = obj as Record<string, unknown>;
  if (record.$type === 'color' && typeof record.$value === 'string') {
    keys.add(`--nx-color-${tokenPath.join('-')}`);
    return;
  }

  for (const [key, value] of Object.entries(record)) {
    if (key.startsWith('$')) continue;
    collectColorLeaves(value, keys, [...tokenPath, key]);
  }
}

function curatedKeys(mode: Mode): Set<string> {
  const files = [
    `base-slate-${mode}.json`,
    `brands-blue-${mode}.json`,
    `chart-categorical-default-${mode}.json`,
  ];
  const keys = new Set<string>();
  for (const file of files) {
    collectColorLeaves(
      JSON.parse(readFileSync(path.join(SEMANTIC_DIR, file), 'utf8')),
      keys
    );
  }
  return keys;
}

describe('deriveTheme key parity', () => {
  it.each(['light', 'dark'] as const)(
    'emits exactly the curated %s color key set',
    (mode) => {
      const theme = deriveTheme({
        appearance: mode,
        surfaceTone: 'slate',
        light: {
          accent: '#2563eb',
          background: '#ffffff',
          foreground: '#181818',
        },
        dark: {
          accent: '#2563eb',
          background: '#181818',
          foreground: '#ffffff',
        },
        contrast: 60,
      })[mode];
      const derived = new Set(Object.keys(theme));
      const want = curatedKeys(mode);

      expect([...want].filter((key) => !derived.has(key))).toEqual([]);
      expect([...derived].filter((key) => !want.has(key))).toEqual([]);
    }
  );
});
