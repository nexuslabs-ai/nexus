import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { satisfies } from 'semver';

import {
  type CatalogItem,
  fetchRelease,
  loadRelease,
  releaseFiles,
  resolveItems,
  splitInstalled,
  variantOf,
} from '../catalog';
import { type Config, readConfig, requireConfig } from '../config';
import { CLI_COMMAND } from '../errors';
import { type FileState, fileState, NO_PREVIOUS } from '../files';
import { installedVersion } from '../packages';
import {
  findFile,
  majorVersion,
  type Project,
  readProject,
  VITE_CONFIGS,
  VITE_ENTRIES,
} from '../project';
import { entryDir } from '../setup/react';

import type { CommandResult } from './result';

/** Compares the app's nxds files with the latest release. */
export async function diff(
  cwd: string,
  registry: string,
  names: string[]
): Promise<CommandResult> {
  const config = requireConfig(cwd);
  const latest = await loadRelease(registry, 'latest');
  const previous = await fetchRelease(registry, config.version);
  const previousFiles = previous
    ? releaseFiles(previous, config.framework)
    : NO_PREVIOUS;
  const { known, removed } = splitInstalled(latest, config.items);
  const items = resolveItems(
    latest,
    config.framework,
    names.length > 0 ? names : known
  );

  const files = items.flatMap((item) =>
    variantOf(item, config.framework).files.map((file) => ({
      item: item.name,
      path: file.path,
      state: fileState(cwd, config, file, previousFiles),
    }))
  );
  const differing = files.filter((file) => file.state !== 'current');
  const advice: Record<Exclude<FileState, 'current'>, string> = {
    outdated: `\`${CLI_COMMAND} update\` replaces it`,
    changed: `differs from nxds's copy; \`${CLI_COMMAND} update --overwrite\` replaces it`,
    missing: `\`${CLI_COMMAND} update\` restores it`,
  };

  return {
    data: { version: config.version, latest: latest.version, files, removed },
    lines: [
      ...differing.map(
        (file) =>
          `${file.state.padEnd(8)}  ${file.path}  (${advice[file.state as Exclude<FileState, 'current'>]})`
      ),
      ...removed.map(
        (name) =>
          `removed   ${name}  (no longer in nxds; \`${CLI_COMMAND} update\` drops it)`
      ),
      ...(differing.length === 0 && removed.length === 0
        ? [`Every file matches nxds ${latest.version}.`]
        : []),
    ],
    ok: true,
  };
}

type Check = { name: string; ok: boolean; message: string };

function tailwindMessage(project: Project) {
  const declared = project.dependencies.tailwindcss;
  if (declared === undefined) {
    return `Tailwind 4 is not installed. Run \`${CLI_COMMAND} init\`.`;
  }
  const tailwindMajor = majorVersion(project, 'tailwindcss');
  if (tailwindMajor === 4) return `tailwindcss ${declared}`;
  if (tailwindMajor === null) {
    return `tailwindcss ${declared} names no version, and none is installed. Install your dependencies, then run doctor again.`;
  }
  return `tailwindcss ${declared}. nxds needs Tailwind CSS 4.`;
}

function read(root: string, file: string | undefined) {
  if (!file || !existsSync(path.join(root, file))) return '';
  return readFileSync(path.join(root, file), 'utf8');
}

/** Whether an `@source` in the CSS entry names the nxds folder or a folder above it. */
function sourcesNxdsDir(config: Config, css: string) {
  const entryDir = path.posix.dirname(config.css);
  return [...css.matchAll(/@source\s+(['"])(.*?)\1/g)].some(([, , source]) => {
    // A glob covers the folder its fixed part names.
    const base = (source ?? '').split(/[*{[]/)[0] ?? '';
    const folder = path.posix.join(entryDir, base).replace(/\/+$/, '');
    return (
      folder === '.' ||
      /^\.\.(\/\.\.)*$/.test(folder) ||
      config.dir === folder ||
      config.dir.startsWith(`${folder}/`)
    );
  });
}

/**
 * Why Tailwind won't generate the nxds folder's `nx:` classes, or null.
 * Tailwind skips git-ignored files, and scans nothing an entry with
 * `source(none)` doesn't name in an `@source`.
 */
function unscannedReason(cwd: string, config: Config, css: string) {
  if (/source\(\s*none\s*\)/.test(css) && !sourcesNxdsDir(config, css)) {
    return `${config.css} turns off Tailwind's source detection with source(none), and no @source covers ${config.dir}.`;
  }
  const ignored = spawnSync('git', ['check-ignore', '-q', config.dir], { cwd });
  if (ignored.status === 0) {
    return `${config.dir} is git-ignored, so Tailwind skips it. Commit the nxds folder.`;
  }
  return null;
}

/** Each package the installed items need that is missing or below range. */
function packageProblems(
  project: Project,
  config: Config,
  items: CatalogItem[]
) {
  const needed: Record<string, string> = Object.assign(
    {},
    ...items.map((item) => variantOf(item, config.framework).packages.npm)
  );
  return Object.entries(needed).flatMap(([name, range]) => {
    if (!(name in project.dependencies))
      return [`${name} is not in package.json`];
    const version = installedVersion(project, name);
    if (version === null) return [`${name} is not installed`];
    if (!satisfies(version, range)) {
      return [
        `${name} ${version} is installed, and this release needs ${range}`,
      ];
    }
    return [];
  });
}

export async function doctor(
  cwd: string,
  registry: string
): Promise<CommandResult> {
  const project = readProject(cwd);
  const config = readConfig(cwd);
  const checks: Check[] = [];
  const check = (name: string, ok: boolean, message: string) =>
    checks.push({ name, ok, message });

  check(
    'config',
    config !== null,
    config ? 'nxds.json found' : `No nxds.json. Run \`${CLI_COMMAND} init\`.`
  );
  if (!project.setup) {
    check('app', false, 'Not a Next.js App Router or Vite + React app.');
  }
  if (!config || !project.setup) return report(checks);

  const catalog = await fetchRelease(registry, config.version);
  check(
    'release',
    catalog !== null,
    catalog
      ? `Files come from nxds ${config.version}`
      : `${registry} has no nxds ${config.version}. Run \`${CLI_COMMAND} update\`.`
  );

  check(
    'tailwind',
    majorVersion(project, 'tailwindcss') === 4,
    tailwindMessage(project)
  );

  const css = read(cwd, config.css);
  const importsTokens = css.includes('tailwind/nxds.css');
  check(
    'css entry',
    importsTokens,
    !css
      ? `${config.css} is missing. Run \`${CLI_COMMAND} init\`.`
      : importsTokens
        ? `${config.css} imports the nxds tokens`
        : `${config.css} does not import ${config.dir}/tailwind/nxds.css. Add the @import back.`
  );

  const unscanned = unscannedReason(cwd, config, css);
  check(
    'classes',
    unscanned === null,
    unscanned ??
      `Tailwind scans ${config.dir}, so its nx: classes are generated`
  );

  const entry =
    project.setup === 'next-app'
      ? `${entryDir(project)}/layout.tsx`
      : findFile(project, VITE_ENTRIES);
  const entrySource = read(cwd, entry);
  const cssFile = path.basename(config.css);
  const importsCss = entrySource.includes(cssFile);
  check(
    'css import',
    importsCss,
    `${entry} ${importsCss ? 'imports' : 'does not import'} ${cssFile}`
  );
  check(
    'provider',
    entrySource.includes('NxdsAppearanceProvider'),
    `${entry} ${entrySource.includes('NxdsAppearanceProvider') ? 'renders' : 'does not render'} NxdsAppearanceProvider`
  );

  const scriptSource =
    project.setup === 'next-app'
      ? entrySource
      : read(cwd, findFile(project, VITE_CONFIGS));
  const scriptMarker =
    project.setup === 'next-app' ? 'NxdsAppearanceScript' : 'nxdsAppearance';
  check(
    'theme script',
    scriptSource.includes(scriptMarker),
    scriptSource.includes(scriptMarker)
      ? 'The theme script runs before first paint'
      : `The theme script is missing, so the page can flash the wrong theme. Run \`${CLI_COMMAND} init\`.`
  );

  if (!catalog) return report(checks);

  const { known, removed } = splitInstalled(catalog, config.items);
  check(
    'items',
    removed.length === 0,
    removed.length === 0
      ? `${known.length} installed items, all in this release`
      : `No longer in nxds: ${removed.join(', ')}. Run \`${CLI_COMMAND} update\`.`
  );

  const items = resolveItems(catalog, config.framework, known);
  const missingFiles = items.flatMap((item) =>
    variantOf(item, config.framework)
      .files.filter(
        (file) => !existsSync(path.join(cwd, config.dir, file.path))
      )
      .map((file) => `${item.name}: ${file.path}`)
  );
  check(
    'files',
    missingFiles.length === 0,
    missingFiles.length === 0
      ? `All files for ${known.length} installed items are present`
      : `Missing ${missingFiles.join(', ')}. Run \`${CLI_COMMAND} add\` for those items.`
  );

  const problems = packageProblems(project, config, items);
  check(
    'packages',
    problems.length === 0,
    problems.length === 0
      ? 'Every package the installed items need is installed in range, @nxds/core included'
      : `${problems.join('; ')}. Run \`${CLI_COMMAND} update\`, then your package manager's install.`
  );

  return report(checks);
}

function report(checks: Check[]): CommandResult {
  const ok = checks.every((item) => item.ok);
  return {
    data: { checks },
    lines: [
      ...checks.map(
        (item) => `${item.ok ? 'ok  ' : 'FAIL'}  ${item.name}: ${item.message}`
      ),
      ok ? 'nxds is set up correctly.' : 'Fix the failed checks above.',
    ],
    ok,
  };
}
