import { relativePath } from '@nxds/catalog';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import {
  assertSupportsReact,
  type Catalog,
  fetchRelease,
  loadRelease,
  type ReactMajor,
  releaseFiles,
  resolveItems,
  SETUP,
  setupVariant,
  splitInstalled,
  type Target,
  variantFor,
} from '../catalog';
import { CLI_COMMAND } from '../cli-command';
import { type Config, readConfig, requireConfig, writeConfig } from '../config';
import { CliError, UsageError } from '../errors';
import { conflictedFiles } from '../files';
import {
  emptyInstallResult,
  installItems,
  type InstallOptions,
  type InstallResult,
} from '../install';
import { installPackages, packagesToInstall } from '../packages';
import {
  majorVersion,
  type Project,
  reactMajor,
  readProject,
} from '../project';
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
        `${dryRun ? 'Would conflict' : 'Conflict'} in ${config.dir}/${file}: nxds changed lines you edited. Resolve the <<<<<<< markers, then run \`${CLI_COMMAND} update\` again.`
    ),
    ...result.unresolved.map(
      (file) =>
        `Still conflicted: ${config.dir}/${file}. Resolve the <<<<<<< markers, then run \`${CLI_COMMAND} update\` again.`
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

/** Whether no file was kept or left with conflict markers for the person to sort out. */
function settled(result: InstallResult) {
  return (
    result.skipped.length === 0 &&
    result.conflicted.length === 0 &&
    result.unresolved.length === 0
  );
}

/** Fails when the app's React changed since its files were installed. */
function assertFilesMatchReact(config: Config, react: ReactMajor) {
  if (config.react === react) return;
  throw new CliError(
    `nxds.json has React ${config.react} files, and this app uses React ${react}. Run \`${CLI_COMMAND} update\` to switch them, then run this command again.`
  );
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
  const react = reactMajor(project);
  const addTailwind = !('tailwindcss' in project.dependencies);
  if (!addTailwind) assertTailwind4(project);

  const dir = options.dir ? nxdsDir(options.dir) : undefined;
  const existing = readConfig(cwd);
  // Running init again stays on the app's release.
  const catalog = await loadRelease(registry, existing?.version ?? 'latest');
  assertSupportsReact(catalog, react);
  if (existing) assertFilesMatchReact(existing, react);
  if (existing && dir && dir !== existing.dir) {
    throw new CliError(
      `nxds is already set up in ${existing.dir}. Run init without --dir, or move the folder and change "dir" in nxds.json.`
    );
  }
  const config: Config = existing ?? {
    framework: 'react',
    react,
    version: catalog.version,
    dir: dir ?? defaultDir(project),
    css: cssEntryPath(project),
    items: [],
  };

  const setup = setupVariant(catalog, config);
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
    null,
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
  const done = wiring.manual.length === 0 && settled(installed);
  return {
    data: {
      setup: project.setup,
      react: config.react,
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
      `nxds ${config.version} in ${config.dir}, for React ${config.react}`,
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
  const project = readProject(cwd);
  assertFilesMatchReact(config, reactMajor(project));
  const catalog = await loadRelease(registry, config.version);
  const installed = installItems(
    catalog,
    project,
    config,
    names,
    null,
    options
  );
  if (!options.dryRun) writeConfig(cwd, config);

  return {
    data: { dryRun: options.dryRun, ...installed },
    lines: [
      ...installLines(config, installed, options),
      ...(installed.written.length === 0 && settled(installed)
        ? [
            `${names.join(', ')} ${names.length === 1 ? 'is' : 'are'} already up to date.`,
          ]
        : []),
    ],
    ok: settled(installed),
  };
}

/** The files `names` and everything they need install. */
function filesOf(catalog: Catalog, target: Target, names: string[]) {
  return new Set(
    resolveItems(catalog, target.framework, names).flatMap((item) =>
      variantFor(item, target).files.map((file) => file.path)
    )
  );
}

type UpdateData = InstallResult & {
  dryRun: boolean;
  from: string;
  version: string;
  /** The React major the files were for before, and after. */
  fromReact: ReactMajor;
  react: ReactMajor;
  removed: string[];
  orphaned: string[];
};

/**
 * Re-installs every installed item from the latest release, so one app never
 * mixes two releases. A file that still matches the app's release is
 * replaced; nxds's changes are merged into an edited one, with conflict
 * markers where both changed the same lines. A file the app's release didn't
 * have merges against an empty one. Items the release dropped leave
 * `nxds.json`, and files no installed item has any more are reported.
 *
 * The app moves to the latest release even with conflicts this run writes,
 * since a conflicted file already holds the latest release's lines. Its
 * markers are then the only record of the conflict, so every later run
 * reports the file until they are resolved. A file still conflicted when a
 * newer release is out holds an older release's lines, so `update` changes
 * nothing until it is resolved, then merges from the app's release. The app
 * also stays behind when its release is gone from the registry and an edited
 * file is kept.
 *
 * When the app's React major changed, the files switch to the new major's: the
 * app's release in the old major is the base nxds's changes merge from.
 */
export async function update(
  cwd: string,
  registry: string,
  options: InstallOptions
): Promise<CommandResult> {
  const config = requireConfig(cwd);
  const project = readProject(cwd);
  const from = config.version;
  const fromReact = config.react;
  const react = reactMajor(project);
  const latest = await loadRelease(registry, 'latest');
  assertSupportsReact(latest, react);
  const { known, removed } = splitInstalled(latest, config.items);
  const current = filesOf(latest, { ...config, react }, known);
  const previous = await fetchRelease(registry, from);
  const installedBefore = previous
    ? filesOf(previous, config, splitInstalled(previous, config.items).known)
    : new Set<string>();
  const unchanged = from === latest.version && fromReact === react;

  const unresolved =
    unchanged || options.overwrite
      ? []
      : conflictedFiles(cwd, config, new Set([...current, ...installedBefore]));
  if (unresolved.length > 0) {
    const data: UpdateData = {
      ...emptyInstallResult(),
      dryRun: options.dryRun,
      from,
      version: from,
      fromReact,
      react: fromReact,
      unresolved,
      removed: [],
      orphaned: [],
    };
    return {
      data,
      lines: [
        ...unresolved.map((file) => `Still conflicted: ${config.dir}/${file}`),
        `Changed nothing, and nxds.json stays on ${from}. Resolve the <<<<<<< markers, then run \`${CLI_COMMAND} update\` again.`,
      ],
      ok: false,
    };
  }

  const orphaned = [...installedBefore].filter(
    (file) => !current.has(file) && existsSync(path.join(cwd, config.dir, file))
  );
  const previousFiles = previous && releaseFiles(previous, config);
  config.items = known;
  config.react = react;
  const installed = installItems(
    latest,
    project,
    config,
    known,
    previousFiles,
    options
  );

  const stays = !unchanged && installed.skipped.length > 0;
  if (stays) config.react = fromReact;
  else config.version = latest.version;
  if (!options.dryRun) writeConfig(cwd, config);

  const data: UpdateData = {
    dryRun: options.dryRun,
    from,
    version: config.version,
    fromReact,
    react: config.react,
    ...installed,
    removed,
    orphaned,
  };
  return {
    data,
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
      ...(fromReact !== react && !stays
        ? [
            `${options.dryRun ? 'Would switch' : 'Switched'} the files from React ${fromReact} to React ${react}.`,
          ]
        : []),
      stays
        ? `nxds.json stays on ${from} until every file above is resolved or replaced.`
        : `nxds ${from === latest.version ? 'is on' : `${options.dryRun ? 'would move' : 'moved'} from ${from} to`} ${latest.version}.`,
    ],
    ok: settled(installed),
  };
}
