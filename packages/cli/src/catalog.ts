import type {
  Catalog,
  CatalogItem,
  Framework,
  SetupStep,
  SetupVariant,
  Variant,
} from '@nxds/catalog';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { valid, validRange } from 'semver';

import { projectPath } from './config';
import { CliError, readJson } from './errors';

export type {
  Catalog,
  CatalogFile,
  CatalogItem,
  Framework,
  SetupStep,
  Variant,
} from '@nxds/catalog';

export const SETUP = 'setup';

/** Where releases are fetched from: `<registry>/<version>.json` and `<registry>/latest.json`. */
export const DEFAULT_REGISTRY = 'https://nxds.dev/r';

function isUrl(registry: string) {
  return /^https?:\/\//.test(registry);
}

/** The `--registry` value as a URL, or as an absolute folder path. */
export function resolveRegistry(option: string | undefined) {
  if (!option) return DEFAULT_REGISTRY;
  return isUrl(option) ? option.replace(/\/+$/, '') : path.resolve(option);
}

async function fetchJson(url: string): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(url);
  } catch (error) {
    throw new CliError(
      `Could not reach ${url} (${(error as Error).message}). Check your connection, then run the command again.`
    );
  }
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new CliError(
      `${url} answered ${response.status}. Run the command again later.`
    );
  }
  try {
    return await response.json();
  } catch (error) {
    throw new CliError(
      `${url} is not valid JSON (${(error as Error).message}). Run the command again later.`
    );
  }
}

/** Where a registry file lives: a URL, or a path in a local registry folder. */
function registryLocation(registry: string, file: string) {
  return isUrl(registry) ? `${registry}/${file}` : path.join(registry, file);
}

/** A registry file's JSON, or null when it doesn't exist. */
async function readRegistryFile(registry: string, file: string) {
  const location = registryLocation(registry, file);
  if (isUrl(registry)) return fetchJson(location);
  return existsSync(location) ? readJson(location) : null;
}

const KINDS: ReadonlySet<unknown> = new Set(['setup', 'component', 'block']);

const STEPS: ReadonlySet<unknown> = new Set(
  Object.keys({
    'add-css-import': true,
    'add-head-script': true,
    'wrap-root-with-provider': true,
  } satisfies Record<SetupStep, true>)
);

const NPM_NAME = /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;

/**
 * A semver range exactly as written: `validRange` trims its input and reads a
 * blank range as `*`, so padding and control characters are rejected first.
 */
function isRange(value: unknown) {
  return (
    typeof value === 'string' &&
    /^[ -~]+$/.test(value) &&
    value === value.trim() &&
    validRange(value) !== null
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStrings(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((entry) => typeof entry === 'string')
  );
}

/** Why `file` can't be written into the nxds folder, or null. */
function fileProblem(file: unknown) {
  if (!isRecord(file) || typeof file.content !== 'string') {
    return 'has a file without content';
  }
  if (typeof file.path !== 'string' || projectPath(file.path) !== file.path) {
    return `has a file path outside the nxds folder: ${String(file.path)}`;
  }
  return null;
}

/** Why `variant` isn't one the CLI can install, or null. */
function variantProblem(variant: unknown, kind: unknown) {
  if (!isRecord(variant)) return 'has a variant that is not an object';
  const { packages } = variant;
  if (
    !isRecord(packages) ||
    !isRecord(packages.npm) ||
    !Object.entries(packages.npm).every(
      ([name, range]) => NPM_NAME.test(name) && isRange(range)
    ) ||
    (kind === 'setup' && !isRange(packages.tailwind))
  ) {
    return 'has invalid "packages"';
  }
  for (const field of ['items', 'css'] as const) {
    if (!isStrings(variant[field])) return `has invalid "${field}"`;
  }
  const { steps } = variant;
  if (!Array.isArray(steps) || !steps.every((step) => STEPS.has(step))) {
    return 'has invalid "steps"';
  }
  if (!Array.isArray(variant.files)) return 'has invalid "files"';
  return variant.files.map(fileProblem).find(Boolean) ?? null;
}

/** Why `item` isn't a catalog item, or null. */
function itemProblem(item: unknown) {
  if (!isRecord(item) || typeof item.name !== 'string') {
    return 'has an item without a name';
  }
  const fields = ['title', 'description', 'docs'] as const;
  if (
    !KINDS.has(item.kind) ||
    fields.some((field) => typeof item[field] !== 'string') ||
    !isRecord(item.variants)
  ) {
    return `"${item.name}" is not a catalog item`;
  }
  const problem = Object.values(item.variants)
    .map((variant) => variantProblem(variant, item.kind))
    .find(Boolean);
  return problem ? `"${item.name}" ${problem}` : null;
}

/** Why `value` isn't the release catalog for `version`, or null. */
function releaseProblem(value: unknown, version: string) {
  if (!isRecord(value)) return 'it is not a JSON object';
  if (value.schema !== 1) return 'its "schema" is not 1';
  if (
    typeof value.version !== 'string' ||
    valid(value.version) !== value.version
  ) {
    return 'its "version" is not a release version';
  }
  if (version !== 'latest' && value.version !== version) {
    return `it holds nxds ${value.version}`;
  }
  if (!isStrings(value.frameworks)) return 'its "frameworks" is invalid';
  if (!Array.isArray(value.items)) return 'its "items" is invalid';
  return value.items.map(itemProblem).find(Boolean) ?? null;
}

/**
 * A release catalog, or null when the registry has no such release.
 * `version` is a version such as `0.5.0`, or `latest`.
 */
export async function fetchRelease(
  registry: string,
  version: string
): Promise<Catalog | null> {
  const file = `${version}.json`;
  const value = await readRegistryFile(registry, file);
  if (value === null) return null;

  if (isRecord(value) && typeof value.schema === 'number' && value.schema > 1) {
    throw new CliError(
      `nxds ${version} needs a newer CLI. Run \`npx nxds@latest\` instead.`
    );
  }
  const problem = releaseProblem(value, version);
  if (problem === null) return value as Catalog;
  throw new CliError(
    `${registryLocation(registry, file)} is not a valid nxds release: ${problem}. Check \`--registry\`, or run the command again later.`
  );
}

/** The release an app is on, or `latest`; fails when the registry doesn't have it. */
export async function loadRelease(
  registry: string,
  version: string
): Promise<Catalog> {
  const catalog = await fetchRelease(registry, version);
  if (catalog) return catalog;
  throw new CliError(
    version === 'latest'
      ? `${registry} has no nxds release.`
      : `${registry} has no nxds ${version}, the release this app is on. Run \`nxds update\` to move to the latest release.`
  );
}

export function findItem(catalog: Catalog, name: string): CatalogItem {
  const item = catalog.items.find((candidate) => candidate.name === name);
  if (item) return item;
  throw new CliError(
    `nxds ${catalog.version} has no item named "${name}". Run \`nxds search ${name}\` to find the right name, or \`nxds update\` if it's newer.`
  );
}

export function variantOf<V extends Variant>(
  item: { title: string; variants: Partial<Record<Framework, V>> },
  framework: Framework
): V {
  const variant = item.variants[framework];
  if (variant) return variant;
  throw new CliError(`${item.title} is not available for ${framework} yet.`);
}

export function setupVariant(
  catalog: Catalog,
  framework: Framework
): SetupVariant {
  const setup = catalog.items.find((item) => item.name === SETUP);
  if (setup?.kind !== 'setup') {
    throw new Error(`nxds ${catalog.version} has no "${SETUP}" setup item.`);
  }
  return variantOf(setup, framework);
}

/** `names` and every item they need, each listed after what it needs. */
export function resolveItems(
  catalog: Catalog,
  framework: Framework,
  names: string[]
): CatalogItem[] {
  const ordered: CatalogItem[] = [];
  const seen = new Set<string>();

  function visit(name: string) {
    if (seen.has(name)) return;
    seen.add(name);
    const item = findItem(catalog, name);
    variantOf(item, framework).items.forEach(visit);
    ordered.push(item);
  }

  names.forEach(visit);
  return ordered;
}

/** Every file a release installs for `framework`, by path. */
export function releaseFiles(catalog: Catalog, framework: Framework) {
  return new Map(
    catalog.items.flatMap((item) =>
      (item.variants[framework]?.files ?? []).map(
        (file) => [file.path, file.content] as const
      )
    )
  );
}

/** Installed item names this catalog still has, and the ones it dropped. */
export function splitInstalled(catalog: Catalog, installed: string[]) {
  const names = new Set(catalog.items.map((item) => item.name));
  return {
    known: installed.filter((name) => names.has(name)),
    removed: installed.filter((name) => !names.has(name)),
  };
}
