import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { diff3Merge } from 'node-diff3';

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

/**
 * `content` with LF line endings, no trailing whitespace and one final
 * newline, so a checkout with CRLF or an editor that trims lines doesn't
 * count as an edit.
 */
function normalize(content: string) {
  const lines = content
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.trimEnd());
  return `${lines.join('\n').trimEnd()}\n`;
}

function sameContent(a: string, b: string | undefined) {
  return b !== undefined && normalize(a) === normalize(b);
}

export function fileState(
  root: string,
  config: Config,
  file: CatalogFile,
  previous: PreviousFiles
): FileState {
  const target = path.join(root, config.dir, file.path);
  if (!existsSync(target)) return 'missing';

  const onDisk = readFileSync(target, 'utf8');
  if (sameContent(onDisk, file.content)) return 'current';
  return sameContent(onDisk, previous.get(file.path)) ? 'outdated' : 'changed';
}

const CONFLICT_START = '<<<<<<< your file';
const CONFLICT_MIDDLE = '=======';

/** Whether `content` still holds conflict markers `update` wrote. */
export function hasConflictMarkers(content: string) {
  return content.split(/\r?\n/).includes(CONFLICT_START);
}

/**
 * Merges nxds's changes since `base` into the app's edited file. Where both
 * changed the same lines, writes git-style conflict markers around each side.
 */
function mergeFile(
  ours: string,
  base: string,
  theirs: string,
  version: string
) {
  const lines = (content: string) => normalize(content).split('\n');
  const regions = diff3Merge(lines(ours), lines(base), lines(theirs), {
    excludeFalseConflicts: true,
  });
  const merged = regions.flatMap((region) => {
    if (!region.conflict) return region.ok ?? [];
    return [
      CONFLICT_START,
      ...region.conflict.a,
      CONFLICT_MIDDLE,
      ...region.conflict.b,
      `>>>>>>> nxds ${version}`,
    ];
  });
  const eol = ours.includes('\r\n') ? '\r\n' : '\n';
  return {
    content: merged.join(eol),
    conflict: regions.some((region) => region.conflict),
  };
}

export type WriteResult = {
  written: string[];
  unchanged: string[];
  /** Edited files that nxds's changes were merged into cleanly. */
  merged: string[];
  /** Edited files now holding conflict markers. */
  conflicted: string[];
  /** Files left alone because they differ from nxds's copy and there is no previous release to merge from. */
  skipped: string[];
};

export type WriteOptions = {
  overwrite: boolean;
  dryRun: boolean;
  /** The release `files` come from, named in conflict markers. */
  version: string;
};

/**
 * Writes `files` into the nxds folder. Missing and outdated files are
 * written. A changed file gets nxds's changes since `previous` merged in, is
 * kept when there is no previous copy to merge from, and is replaced with
 * `overwrite`.
 */
export function writeFiles(
  root: string,
  config: Config,
  files: CatalogFile[],
  previous: PreviousFiles,
  { overwrite, dryRun, version }: WriteOptions
): WriteResult {
  const result: WriteResult = {
    written: [],
    unchanged: [],
    merged: [],
    conflicted: [],
    skipped: [],
  };
  const write = (file: string, content: string) => {
    if (dryRun) return;
    const target = path.join(root, config.dir, file);
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, content);
  };

  for (const file of files) {
    const state = fileState(root, config, file, previous);
    if (state === 'current') {
      result.unchanged.push(file.path);
      continue;
    }
    const base = previous.get(file.path);
    if (state !== 'changed' || overwrite) {
      result.written.push(file.path);
      write(file.path, file.content);
      continue;
    }
    if (base === undefined) {
      result.skipped.push(file.path);
      continue;
    }

    const target = path.join(root, config.dir, file.path);
    const ours = readFileSync(target, 'utf8');
    const merge = mergeFile(ours, base, file.content, version);
    // nxds changed nothing in this file since `previous`: the edits stay as they are.
    if (sameContent(ours, merge.content)) {
      result.unchanged.push(file.path);
      continue;
    }
    result[merge.conflict ? 'conflicted' : 'merged'].push(file.path);
    write(file.path, merge.content);
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
