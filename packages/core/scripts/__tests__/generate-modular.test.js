import fs from 'fs';
import os from 'os';
import path from 'path';
import * as prettier from 'prettier';
import { fileURLToPath } from 'url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { generateModular } from '../generate-modular.js';

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));

const tmpDirs = [];

function makeTmpDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nexus-modular-test-'));
  tmpDirs.push(dir);
  return dir;
}

afterAll(() => {
  while (tmpDirs.length > 0) {
    const dir = tmpDirs.pop();
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe('generateModular', () => {
  let distDir;

  beforeAll(async () => {
    const originalLog = console.log;
    console.log = () => {};
    try {
      distDir = makeTmpDir();
      await generateModular({ distDir });
    } finally {
      console.log = originalLog;
    }
  });

  // Regenerating tokens used to produce a noisy whitespace diff against the
  // committed CSS because the generator emitted raw output but the committed
  // files were prettier-formatted. The generator now formats every emitted
  // file, so prettier --check must agree it has nothing to change.
  it('emits prettier-formatted CSS (idempotent under prettier)', async () => {
    const config = await prettier.resolveConfig(TEST_DIR);
    const files = fs
      .readdirSync(distDir)
      .filter((name) => name.endsWith('.css'));

    expect(files.length).toBeGreaterThan(0);

    for (const name of files) {
      const filePath = path.join(distDir, name);
      const content = fs.readFileSync(filePath, 'utf8');
      const reformatted = await prettier.format(content, {
        ...config,
        filepath: filePath,
      });
      expect(reformatted, `${name} is not prettier-formatted`).toBe(content);
    }
  });

  it('emits z-index tokens in playground globals.css', () => {
    const globals = fs.readFileSync(path.join(distDir, 'globals.css'), 'utf8');
    expect(globals).toMatch(/--z-index-popover: 70;/);
    expect(globals).toMatch(/--z-index-modal: 50;/);
  });
});
