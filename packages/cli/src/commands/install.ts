import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import {
  loadCatalog,
  resolveItems,
  SETUP,
  setupVariant,
  splitInstalled,
  variantOf,
} from '../catalog';
import {
  assertSameRevision,
  type Config,
  projectPath,
  readConfig,
  requireConfig,
  writeConfig,
} from '../config';
import { CliError } from '../errors';
import {
  installItems,
  type InstallOptions,
  type InstallResult,
} from '../install';
import { installPackages, packagesToInstall } from '../packages';
import { majorVersion, type Project, readProject } from '../project';
import {
  cssEntryPath,
  defaultDir,
  type ManualStep,
  planWiring,
  tailwindPackages,
} from '../setup/react';

import type { CommandResult } from './result';

function packagesVerb({ dryRun, install }: InstallOptions) {
  if (dryRun) return 'Would install';
  return install ? 'Installed' : 'Not installed (--no-install):';
}

function installLines(
  config: Config,
  result: InstallResult,
  options: InstallOptions
) {
  const { dryRun } = options;
  const verb = dryRun ? 'Would write' : 'Wrote';
  return [
    ...result.written.map((file) => `${verb} ${config.dir}/${file}`),
    ...result.skipped.map(
      ({ path: file, reason }) =>
        `Kept ${config.dir}/${file} (${reason === 'edited' ? 'you edited it' : 'not written by nxds'}). Pass --overwrite to replace it.`
    ),
    ...(result.packages.length > 0
      ? [`${packagesVerb(options)} ${result.packages.join(' ')}`]
      : []),
    ...result.cssImports.map(
      (line) => `${dryRun ? 'Would add' : 'Added'} ${line}`
    ),
  ];
}

function nxdsDir(dir: string) {
  const normalized = projectPath(dir);
  if (normalized) return normalized;
  throw new CliError(
    `--dir takes a folder inside your app, such as components/nxds, not "${dir}".`
  );
}

function assertTailwind4(project: Project) {
  const declared = project.dependencies.tailwindcss;
  const tailwindMajor = majorVersion(project, 'tailwindcss');
  if (tailwindMajor === 4) return;
  if (tailwindMajor === null) {
    throw new CliError(
      `This app declares tailwindcss ${declared}, which names no version, and none is installed. Install your dependencies, then run init again.`
    );
  }
  throw new CliError(
    `nxds needs Tailwind CSS 4, and this app declares tailwindcss ${declared}. Upgrade it (https://tailwindcss.com/docs/upgrade-guide), then run init again.`
  );
}

export function init(
  cwd: string,
  options: InstallOptions & { dir?: string }
): CommandResult {
  const project = readProject(cwd);
  if (!project.setup) {
    throw new CliError(
      'nxds init supports Next.js App Router and Vite + React apps. For other setups, follow the manual steps at https://nxds.dev/getting-started/install.'
    );
  }
  if (!project.typescript) {
    throw new CliError(
      'nxds components are TypeScript. Add a tsconfig.json to your app, then run init again.'
    );
  }
  const addTailwind = !('tailwindcss' in project.dependencies);
  if (!addTailwind) assertTailwind4(project);

  const catalog = loadCatalog();
  const dir = options.dir ? nxdsDir(options.dir) : undefined;
  const existing = readConfig(cwd);
  if (existing) assertSameRevision(existing, catalog);
  if (existing && dir && dir !== existing.dir) {
    throw new CliError(
      `nxds is already set up in ${existing.dir}. Run init without --dir, or move the folder and change "dir" in nxds.json.`
    );
  }
  const config: Config = existing ?? {
    framework: 'react',
    revision: catalog.revision,
    dir: dir ?? defaultDir(project),
    css: cssEntryPath(project),
    items: [],
    files: {},
  };

  const setup = setupVariant(catalog, config.framework);
  const wiring = planWiring(project, config, addTailwind, setup.steps);

  const tailwind = packagesToInstall(
    project,
    addTailwind ? tailwindPackages(project.setup, setup.packages.tailwind) : {}
  );
  if (options.install && !options.dryRun) {
    installPackages(project, tailwind, { dev: true });
  }
  const installed = installItems(catalog, project, config, [SETUP], options);

  if (!options.dryRun) {
    for (const change of wiring.changes) {
      const target = path.join(project.root, change.path);
      mkdirSync(path.dirname(target), { recursive: true });
      writeFileSync(target, change.content);
    }
    writeConfig(cwd, config);
  }

  const packages = [...tailwind, ...installed.packages];
  const [createVerb, editVerb] = options.dryRun
    ? ['Would create', 'Would edit']
    : ['Created', 'Edited'];
  const done = wiring.manual.length === 0;
  return {
    data: {
      setup: project.setup,
      dir: config.dir,
      css: config.css,
      dryRun: options.dryRun,
      ...installed,
      packages,
      created: wiring.changes
        .filter((change) => change.created)
        .map((change) => change.path),
      edited: wiring.changes
        .filter((change) => !change.created)
        .map((change) => change.path),
      manual: wiring.manual,
    },
    lines: [
      `nxds folder: ${config.dir}`,
      ...installLines(config, { ...installed, packages }, options),
      ...wiring.changes.map(
        (change) => `${change.created ? createVerb : editVerb} ${change.path}`
      ),
      ...manualLines(wiring.manual),
      ...(done && !options.dryRun
        ? ['nxds is set up. Add a component with `nxds add button`.']
        : []),
    ],
    ok: done,
  };
}

function manualLines(manual: ManualStep[]) {
  if (manual.length === 0) return [];
  return [
    'Finish these steps by hand, then run `nxds doctor`:',
    ...manual.map(({ file, step }) => `  ${file}: ${step}`),
  ];
}

export function add(
  cwd: string,
  names: string[],
  options: InstallOptions
): CommandResult {
  if (names.length === 0) {
    throw new CliError('Name at least one item, such as `nxds add button`.');
  }
  const config = requireConfig(cwd);
  const catalog = loadCatalog();
  assertSameRevision(config, catalog);
  const installed = installItems(
    catalog,
    readProject(cwd),
    config,
    names,
    options
  );
  if (!options.dryRun) writeConfig(cwd, config);

  return {
    data: { dryRun: options.dryRun, ...installed },
    lines: [
      ...installLines(config, installed, options),
      ...(installed.written.length === 0 && installed.skipped.length === 0
        ? [
            `${names.join(', ')} ${names.length === 1 ? 'is' : 'are'} already up to date.`,
          ]
        : []),
    ],
    ok: true,
  };
}

/**
 * Re-installs every installed item from this release: items the catalog
 * dropped leave `nxds.json`, and files no installed item has any more are
 * reported. The app moves to this release's catalog revision only when no
 * edited file was kept, since a kept file is still from the older release.
 */
export function update(
  cwd: string,
  names: string[],
  options: InstallOptions
): CommandResult {
  if (names.length > 0) {
    throw new CliError(
      '`nxds update` updates every installed item, so one app never mixes two releases. Run it without item names.'
    );
  }

  const config = requireConfig(cwd);
  const catalog = loadCatalog();
  const { known, removed } = splitInstalled(catalog, config.items);
  config.items = known;
  const installed = installItems(
    catalog,
    readProject(cwd),
    config,
    known,
    options
  );

  const current = new Set(
    resolveItems(catalog, config.framework, known).flatMap((item) =>
      variantOf(item, config.framework).files.map((file) => file.path)
    )
  );
  const orphaned: string[] = [];
  for (const file of Object.keys(config.files)) {
    if (current.has(file)) continue;
    if (existsSync(path.join(cwd, config.dir, file))) orphaned.push(file);
    else delete config.files[file];
  }
  const moved = installed.skipped.length === 0;
  if (moved) config.revision = catalog.revision;
  if (!options.dryRun) writeConfig(cwd, config);

  return {
    data: { dryRun: options.dryRun, ...installed, removed, orphaned },
    lines: [
      ...installLines(config, installed, options),
      ...(removed.length > 0
        ? [
            `No longer in nxds, so dropped from nxds.json: ${removed.join(', ')}`,
          ]
        : []),
      ...orphaned.map(
        (file) =>
          `No installed item uses ${config.dir}/${file} any more. Delete it once nothing in your app imports it.`
      ),
      ...(moved
        ? []
        : [
            `nxds.json stays on catalog ${config.revision} until every kept file is replaced.`,
          ]),
      ...(installed.written.length === 0 && moved
        ? ['Every installed item is up to date.']
        : []),
    ],
    ok: moved,
  };
}
