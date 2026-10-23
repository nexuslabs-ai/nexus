import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import type { CatalogFile } from './catalog';
import type { Config } from './config';

/**
 * - `current`: matches the catalog.
 * - `outdated`: matches the app's previous release, so nobody edited it.
 * - `changed`: matches neither: edited in the app, or not written by nxds.
 * - `missing`: not on disk.
 */
export type FileState = 'current' | 'outdated' | 'changed' | 'missing';

/** Each file of the release the app is moving from, by path. */
export type PreviousFiles = ReadonlyMap<string, string>;

export const NO_PREVIOUS: PreviousFiles = new Map();

export function fileState(
  root: string,
  config: Config,
  file: CatalogFile,
  previous: PreviousFiles
): FileState {
  const target = path.join(root, config.dir, file.path);
  if (!existsSync(target)) return 'missing';

  const onDisk = readFileSync(target, 'utf8');
  if (onDisk === file.content) return 'current';
  return previous.get(file.path) === onDisk ? 'outdated' : 'changed';
}

export type WriteResult = {
  written: string[];
  unchanged: string[];
  /** Files left alone because they differ from nxds's copy. */
  skipped: string[];
};

/**
 * Writes `files` into the nxds folder. Missing and outdated files are
 * written; changed files are kept unless `overwrite` is set.
 */
export function writeFiles(
  root: string,
  config: Config,
  files: CatalogFile[],
  previous: PreviousFiles,
  { overwrite, dryRun }: { overwrite: boolean; dryRun: boolean }
): WriteResult {
  const result: WriteResult = { written: [], unchanged: [], skipped: [] };

  for (const file of files) {
    const state = fileState(root, config, file, previous);
    if (state === 'current') {
      result.unchanged.push(file.path);
      continue;
    }
    if (state === 'changed' && !overwrite) {
      result.skipped.push(file.path);
      continue;
    }

    result.written.push(file.path);
    if (dryRun) continue;
    const target = path.join(root, config.dir, file.path);
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, file.content);
  }

  return result;
}

/** A path from `fromFile`'s folder to `toFile`, in import-specifier form. */
export function relativeImport(fromFile: string, toFile: string) {
  const relative = path
    .relative(path.dirname(fromFile), toFile)
    .split(path.sep)
    .join('/');
  return relative.startsWith('.') ? relative : `./${relative}`;
}
