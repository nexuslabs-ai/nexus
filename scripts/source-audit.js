import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);
const SOURCE_FILE_RE = /\.(?:[cm]?js|[cm]?ts|jsx|tsx|css|scss|mdx)$/i;

/**
 * Tracked and new, non-ignored source files under `apps/` and `packages/`, so
 * a local run scans the same files CI does. Tracked files deleted from the
 * working tree are skipped.
 */
export function readSourceFiles() {
  return execFileSync(
    'git',
    [
      'ls-files',
      '-z',
      '--cached',
      '--others',
      '--exclude-standard',
      '--',
      'apps',
      'packages',
    ],
    { cwd: REPO_ROOT, encoding: 'utf8' }
  )
    .split('\0')
    .filter((file) => SOURCE_FILE_RE.test(file))
    .filter((file) => fs.existsSync(path.join(REPO_ROOT, file)))
    .map((file) => ({
      file,
      lines: fs.readFileSync(path.join(REPO_ROOT, file), 'utf8').split('\n'),
    }));
}

export function findUsages(checks, files) {
  const usages = [];
  for (const { file, lines } of files) {
    lines.forEach((line, index) => {
      for (const { label, pattern } of checks) {
        if (pattern.test(line)) usages.push(`${file}:${index + 1} ${label}`);
      }
    });
  }
  return usages;
}
