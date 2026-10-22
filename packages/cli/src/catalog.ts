import type {
  Catalog,
  CatalogItem,
  Framework,
  SetupVariant,
  Variant,
} from '@nxds/catalog';
import { existsSync } from 'node:fs';
import path from 'node:path';

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
  return response.json();
}

/** A registry file's JSON, or null when it doesn't exist. */
async function readRegistryFile(registry: string, file: string) {
  if (isUrl(registry)) return fetchJson(`${registry}/${file}`);
  const local = path.join(registry, file);
  return existsSync(local) ? readJson(local) : null;
}

/**
 * A release catalog, or null when the registry has no such release.
 * `version` is a version such as `0.5.0`, or `latest`.
 */
export async function fetchRelease(
  registry: string,
  version: string
): Promise<Catalog | null> {
  const value = await readRegistryFile(registry, `${version}.json`);
  if (value === null) return null;

  const catalog = value as Catalog;
  if (catalog.schema !== 1) {
    throw new CliError(
      `nxds ${version} needs a newer CLI. Run \`npx nxds@latest\` instead.`
    );
  }
  return catalog;
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
