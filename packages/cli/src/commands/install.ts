import { relativePath } from '@nxds/catalog';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import {
  type Catalog,
  fetchRelease,
  type Framework,
  loadRelease,
  releaseFiles,
  resolveItems,
  SETUP,
  setupVariant,
  splitInstalled,
  variantOf,
} from '../catalog';
import { CLI_COMMAND } from '../cli-command';
import { type Config, readConfig, requireConfig, writeConfig } from '../config';
import { CliError, UsageError } from '../errors';
import { NO_PREVIOUS } from '../files';
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
    ...result.merged.map(
      (file) =>
        `${dryRun ? 'Would merge' : 'Merged'} nxds's changes into your edits in ${config.dir}/${file}`
    ),
    ...result.conflicted.map(
      (file) =>
        `${dryRun ? 'Would conflict' : 'Conflict'} in ${config.dir}/${file}: nxds changed lines you edited. Resolve the <<<<<<< markers, then run \`${CLI_COMMAND} doctor\`.`
    ),
    ...result.skipped.map(
      (file) =>
        `Kept ${config.dir}/${file}: it differs from nxds's copy, so it may hold your edits. Pass --overwrite to replace it.`
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
  const normalized = relativePath(dir);
  if (normalized) return normalized;
  throw new UsageError(
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

export async function init(
  cwd: string,
  registry: string,
  options: InstallOptions & { dir?: string }
): Promise<CommandResult> {
  const project = readProject(cwd);
  if (!project.setup) {
    throw new CliError(
      `\`${CLI_COMMAND} init\` supports Next.js App Router and Vite + React apps. For other setups, follow the manual steps at https://nxds.dev/getting-started/install.`
    );
  }
  if (!project.typescript) {
    throw new CliError(
      'nxds components are TypeScript. Add a tsconfig.json to your app, then run init again.'
    );
  }
  const addTailwind = !('tailwindcss' in project.dependencies);
  if (!addTailwind) assertTailwind4(project);

  const dir = options.dir ? nxdsDir(options.dir) : undefined;
  const existing = readConfig(cwd);
  // Running init again stays on the app's release.
  const catalog = await loadRelease(registry, existing?.version ?? 'latest');
  if (existing && dir && dir !== existing.dir) {
    throw new CliError(
      `nxds is already set up in ${existing.dir}. Run init without --dir, or move the folder and change "dir" in nxds.json.`
    );
  }
  const config: Config = existing ?? {
    framework: 'react',
    version: catalog.version,
    dir: dir ?? defaultDir(project),
    css: cssEntryPath(project),
    items: [],
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
  const installed = installItems(
    catalog,
    project,
    config,
    [SETUP],
    NO_PREVIOUS,
    options
  );

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
      version: config.version,
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
      `nxds ${config.version} in ${config.dir}`,
      ...installLines(config, { ...installed, packages }, options),
      ...wiring.changes.map(
        (change) => `${change.created ? createVerb : editVerb} ${change.path}`
      ),
      ...manualLines(wiring.manual),
      ...(done && !options.dryRun
        ? [
            `nxds is set up. Add a component with \`${CLI_COMMAND} add button\`.`,
          ]
        : []),
    ],
    ok: done,
  };
}

function manualLines(manual: ManualStep[]) {
  if (manual.length === 0) return [];
  return [
    `Finish these steps by hand, then run \`${CLI_COMMAND} doctor\`:`,
    ...manual.map(({ file, step }) => `  ${file}: ${step}`),
  ];
}

/** Adds items from the release the app is on, so one app never mixes two releases. */
export async function add(
  cwd: string,
  registry: string,
  names: string[],
  options: InstallOptions
): Promise<CommandResult> {
  const config = requireConfig(cwd);
  const catalog = await loadRelease(registry, config.version);
  const installed = installItems(
    catalog,
    readProject(cwd),
    config,
    names,
    NO_PREVIOUS,
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

/** The files `names` and everything they need install. */
function filesOf(catalog: Catalog, framework: Framework, names: string[]) {
  return new Set(
    resolveItems(catalog, framework, names).flatMap((item) =>
      variantOf(item, framework).files.map((file) => file.path)
    )
  );
}

/**
 * Re-installs every installed item from the latest release, so one app never
 * mixes two releases. A file that still matches the app's release is
 * replaced; nxds's changes are merged into an edited one, with conflict
 * markers where both changed the same lines. Items the release dropped leave
 * `nxds.json`, and files no installed item has any more are reported.
 *
 * The app moves to the latest release even with conflicts, since a
 * conflicted file already holds the latest release's lines. It stays behind
 * only when the app's release is gone from the registry, so an edited file
 * can't be merged and is kept as it is.
 */
export async function update(
  cwd: string,
  registry: string,
  options: InstallOptions
): Promise<CommandResult> {
  const config = requireConfig(cwd);
  const latest = await loadRelease(registry, 'latest');
  const previous = await fetchRelease(registry, config.version);
  const { known, removed } = splitInstalled(latest, config.items);
  const current = filesOf(latest, config.framework, known);
  const installedBefore = previous
    ? filesOf(
        previous,
        config.framework,
        splitInstalled(previous, config.items).known
      )
    : new Set<string>();
  const orphaned = [...installedBefore].filter(
    (file) => !current.has(file) && existsSync(path.join(cwd, config.dir, file))
  );
  config.items = known;
  const installed = installItems(
    latest,
    readProject(cwd),
    config,
    known,
    previous ? releaseFiles(previous, config.framework) : NO_PREVIOUS,
    options
  );

  const from = config.version;
  const stays = from !== latest.version && installed.skipped.length > 0;
  if (!stays) config.version = latest.version;
  if (!options.dryRun) writeConfig(cwd, config);

  return {
    data: {
      dryRun: options.dryRun,
      from,
      version: config.version,
      ...installed,
      removed,
      orphaned,
    },
    lines: [
      ...(previous
        ? []
        : [
            `${registry} has no nxds ${from}, so every file that differs from ${latest.version} counts as changed.`,
          ]),
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
      stays
        ? `nxds.json stays on ${from} until every kept file is replaced.`
        : `nxds ${from === latest.version ? 'is on' : `${options.dryRun ? 'would move' : 'moved'} from ${from} to`} ${latest.version}.`,
    ],
    ok: !stays && installed.conflicted.length === 0,
  };
}
