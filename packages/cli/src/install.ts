import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { type Catalog, resolveItems, variantFor } from './catalog';
import type { Config } from './config';
import { type PreviousFiles, writeFiles, type WriteResult } from './files';
import { installPackages, packagesToInstall } from './packages';
import type { Project } from './project';
import { cssImportLine } from './setup/react';

export type InstallOptions = {
  overwrite: boolean;
  dryRun: boolean;
  /** Install missing npm packages. Off with `--no-install`. */
  install: boolean;
};

export type InstallResult = WriteResult & {
  items: string[];
  /** `name@range` packages that were missing or below range; installed unless dry-run or `--no-install`. */
  packages: string[];
  /** `@import` lines added to the nxds CSS entry. */
  cssImports: string[];
};

export function emptyInstallResult(): InstallResult {
  return {
    items: [],
    written: [],
    unchanged: [],
    merged: [],
    conflicted: [],
    unresolved: [],
    skipped: [],
    packages: [],
    cssImports: [],
  };
}

function addCssImports(
  project: Project,
  config: Config,
  files: string[],
  dryRun: boolean
) {
  if (files.length === 0) return [];
  const entry = path.join(project.root, config.css);
  const current = existsSync(entry) ? readFileSync(entry, 'utf8') : '';
  const added = [...new Set(files)]
    .map((file) => cssImportLine(config, file))
    .filter((line) => !current.includes(line));
  if (added.length > 0 && !dryRun) {
    writeFileSync(entry, `${current.trimEnd()}\n${added.join('\n')}\n`);
  }
  return added;
}

/**
 * Installs `names` and everything they need: files, npm packages and
 * component stylesheet imports. A file that matches `previous` is replaced;
 * nxds's changes are merged into any other changed file (see `writeFiles`).
 * Updates `config` in place.
 */
export function installItems(
  catalog: Catalog,
  project: Project,
  config: Config,
  names: string[],
  previous: PreviousFiles,
  options: InstallOptions
): InstallResult {
  const items = resolveItems(catalog, config.framework, names);
  const variants = items.map((item) => variantFor(item, config));

  // Items share files, such as `lib/icons.ts`; write each one once.
  const files = new Map(
    variants
      .flatMap((variant) => variant.files)
      .map((file) => [file.path, file])
  );
  const written = writeFiles(
    project.root,
    config,
    [...files.values()],
    previous,
    { ...options, version: catalog.version }
  );

  const packages = packagesToInstall(
    project,
    Object.assign({}, ...variants.map((variant) => variant.packages.npm))
  );
  if (options.install && !options.dryRun) {
    installPackages(project, packages, { dev: false });
  }

  const cssImports = addCssImports(
    project,
    config,
    variants.flatMap((variant) => variant.css),
    options.dryRun
  );

  for (const item of items) {
    if (!config.items.includes(item.name)) config.items.push(item.name);
  }

  return {
    ...written,
    items: items.map((item) => item.name),
    packages,
    cssImports,
  };
}
