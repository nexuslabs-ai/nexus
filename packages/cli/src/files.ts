import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import type { CatalogFile } from './catalog';
import { type Config, hashContent } from './config';

/**
 * - `current`: matches the catalog.
 * - `outdated`: untouched since install, and the catalog has changed it.
 * - `edited`: changed since nxds wrote it.
 * - `missing`: not on disk.
 * - `foreign`: on disk, but nxds never wrote it.
 */
export type FileState =
  | 'current'
  | 'outdated'
  | 'edited'
  | 'missing'
  | 'foreign';

export function fileState(
  root: string,
  config: Config,
  file: CatalogFile
): FileState {
  const target = path.join(root, config.dir, file.path);
  if (!existsSync(target)) return 'missing';

  const onDisk = readFileSync(target, 'utf8');
  if (onDisk === file.content) return 'current';

  const recorded = config.files[file.path];
  if (recorded === undefined) return 'foreign';
  return hashContent(onDisk) === recorded ? 'outdated' : 'edited';
}

export type WriteResult = {
  written: string[];
  unchanged: string[];
  /** Files left alone because you edited them, or nxds didn't write them. */
  skipped: { path: string; reason: 'edited' | 'foreign' }[];
};

/**
 * Writes `files` into the nxds folder. Missing and outdated files are
 * written; edited and foreign files are kept unless `overwrite` is set.
 * Updates `config.files` in place for every file it writes or confirms.
 */
export function writeFiles(
  root: string,
  config: Config,
  files: CatalogFile[],
  { overwrite, dryRun }: { overwrite: boolean; dryRun: boolean }
): WriteResult {
  const result: WriteResult = { written: [], unchanged: [], skipped: [] };

  for (const file of files) {
    const state = fileState(root, config, file);
    if (state === 'current') {
      result.unchanged.push(file.path);
      config.files[file.path] = hashContent(file.content);
      continue;
    }
    if ((state === 'edited' || state === 'foreign') && !overwrite) {
      result.skipped.push({ path: file.path, reason: state });
      continue;
    }

    result.written.push(file.path);
    config.files[file.path] = hashContent(file.content);
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
