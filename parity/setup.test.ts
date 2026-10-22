import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { copies } from './parity.ts';

const read = (file: string) =>
  readFileSync(path.resolve(process.cwd(), file), 'utf8');

describe('shared setup', () => {
  it.each(copies)('%s is copied unchanged to %s', (react, vue) => {
    expect(read(vue)).toBe(read(react));
  });
});
