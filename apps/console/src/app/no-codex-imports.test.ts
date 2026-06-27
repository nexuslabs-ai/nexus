import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_DIR = path.resolve(__dirname, '..');
const OLD_RUNTIME_MODULES = [
  'appearance-theme',
  'codex-contract',
  'codex-prefs',
  'theme-provider',
  'use-appearance-prefs',
  'use-derived-theme',
  'useTheme',
];
const OLD_RUNTIME_PATTERN = new RegExp(
  String.raw`\bfrom\s+['"][^'"]*(?:${OLD_RUNTIME_MODULES.join('|')})['"]`
);

function sourceFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      return sourceFiles(fullPath);
    }

    if (!/\.[jt]sx?$/.test(entry.name) || /\.test\.[jt]sx?$/.test(entry.name)) {
      return [];
    }

    return [fullPath];
  });
}

describe('console appearance runtime imports', () => {
  it('does not import the deleted console-local Codex runtime', () => {
    const offenders = sourceFiles(SRC_DIR).flatMap((file) => {
      const text = fs.readFileSync(file, 'utf8');

      return OLD_RUNTIME_PATTERN.test(text)
        ? [path.relative(SRC_DIR, file)]
        : [];
    });

    expect(offenders).toEqual([]);
  });
});
