import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';

import ts from 'typescript';

export function collectSourceFiles(dir, include) {
  return readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const entryPath = path.join(dir, entry.name);
      if (entry.isDirectory()) return collectSourceFiles(entryPath, include);
      return [entryPath];
    })
    .filter(include);
}

/** The modules `source` imports or re-exports, read by the TypeScript scanner. */
export function importSpecifiers(source) {
  return ts
    .preProcessFile(source, true, true)
    .importedFiles.map(({ fileName }) => fileName);
}

export function readCanonical(file) {
  return readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
}

// Renames a temp file into place, so a concurrent reader never sees a partial write.
export function writeIfChanged(file, content) {
  if (existsSync(file) && readCanonical(file) === content) return;

  mkdirSync(path.dirname(file), { recursive: true });
  const temp = `${file}.tmp`;
  writeFileSync(temp, content, 'utf8');
  renameSync(temp, file);
}

export function writeJson(filePath, value) {
  writeIfChanged(filePath, `${JSON.stringify(value, null, 2)}\n`);
}
