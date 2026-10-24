import {
  type Catalog,
  CATALOG_SCHEMA,
  type CatalogItem,
  catalogSchema,
  type Framework,
  hasReact18,
  issueLines,
  type ReactMajor,
  type SetupVariant,
  type Variant,
  variantForReact,
} from '@nxds/catalog';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { EnvHttpProxyAgent, fetch } from 'undici';

import { CLI_COMMAND } from './cli-command';
import { CliError, readJson, UsageError } from './errors';

export type {
  Catalog,
  CatalogFile,
  CatalogItem,
  Framework,
  ReactMajor,
  SetupStep,
  Variant,
} from '@nxds/catalog';

/** Which files an app gets: its framework, and for React, its major. */
export type Target = { framework: Framework; react: ReactMajor };

export const SETUP = 'setup';

/** Where releases are fetched from: `<registry>/<version>.json` and `<registry>/latest.json`. */
export const DEFAULT_REGISTRY = 'https://nxds.dev/r';

const FETCH_TIMEOUT_MS = 30_000;

// Honours HTTPS_PROXY, HTTP_PROXY and NO_PROXY.
const dispatcher = new EnvHttpProxyAgent();

function isUrl(registry: string) {
  return /^https?:\/\//.test(registry);
}

/** The `--registry` value as a URL, or as an absolute folder path. */
export function resolveRegistry(option: string | undefined) {
  if (!option) return DEFAULT_REGISTRY;
  return isUrl(option) ? option.replace(/\/+$/, '') : path.resolve(option);
}

/** The timeout's signal also aborts reading the body, so both steps check for it. */
function timeoutError(url: string, error: unknown) {
  if (!(error instanceof Error) || error.name !== 'TimeoutError') return null;
  return new CliError(
    `${url} did not answer within ${FETCH_TIMEOUT_MS / 1000}s. Check your connection, then run the command again.`
  );
}

async function fetchJson(url: string): Promise<unknown> {
  let response: Awaited<ReturnType<typeof fetch>>;
  try {
    response = await fetch(url, {
      dispatcher,
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
  } catch (error) {
    const timeout = timeoutError(url, error);
    if (timeout) throw timeout;
    // undici reports "fetch failed" and keeps the reason, such as ENOTFOUND, in `cause`.
    const { message, cause } = error as Error;
    const reason = cause instanceof Error ? cause.message : message;
    throw new CliError(
      `Could not reach ${url} (${reason}). Check your connection, or set HTTPS_PROXY if you are behind a proxy, then run the command again.`
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
    throw (
      timeoutError(url, error) ??
      new CliError(
        `${url} is not valid JSON (${(error as Error).message}). Run the command again later.`
      )
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

function isNewerSchema(value: unknown) {
  return (
    typeof value === 'object' &&
    value !== null &&
    'schema' in value &&
    typeof value.schema === 'number' &&
    value.schema > CATALOG_SCHEMA
  );
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

  if (isNewerSchema(value)) {
    const release =
      version === 'latest' ? 'The latest nxds release' : `nxds ${version}`;
    throw new CliError(
      `${release} needs a newer nxds-cli than ${__VERSION__}. Run \`${CLI_COMMAND}\` to get the newest one.`
    );
  }
  const invalid = (problems: string[]) =>
    new CliError(
      `${registryLocation(registry, file)} is not a valid nxds release:\n${problems.map((line) => `  ${line}`).join('\n')}\nCheck \`--registry\`, or run the command again later.`
    );
  const parsed = catalogSchema.safeParse(value);
  if (!parsed.success) throw invalid(issueLines(parsed.error));
  if (version !== 'latest' && parsed.data.version !== version) {
    throw invalid([`version: it holds nxds ${parsed.data.version}`]);
  }
  return parsed.data;
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
      : `${registry} has no nxds ${version}, the release this app is on. Run \`${CLI_COMMAND} update\` to move to the latest release.`
  );
}

export function findItem(catalog: Catalog, name: string): CatalogItem {
  const item = catalog.items.find((candidate) => candidate.name === name);
  if (item) return item;
  throw new UsageError(
    `nxds ${catalog.version} has no item named "${name}". Run \`${CLI_COMMAND} search ${name}\` to find the right name, or \`${CLI_COMMAND} update\` if it's newer.`
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

/** `item`'s variant with the files and packages an app on `target` installs. */
export function variantFor<V extends Variant>(
  item: { title: string; variants: Partial<Record<Framework, V>> },
  target: Target
): V {
  return variantForReact(variantOf(item, target.framework), target.react);
}

/** Fails when `catalog` is a release from before React 18 support and the app is on 18. */
export function assertSupportsReact(catalog: Catalog, react: ReactMajor) {
  if (react === 19 || hasReact18(catalog)) return;
  throw new CliError(
    `nxds ${catalog.version} has no React 18 files. Upgrade the app to React 19, or run \`${CLI_COMMAND} update\` to move to a release with React 18 support.`
  );
}

export function setupVariant(catalog: Catalog, target: Target): SetupVariant {
  const setup = catalog.items.find((item) => item.name === SETUP);
  if (setup?.kind !== 'setup') {
    throw new Error(`nxds ${catalog.version} has no "${SETUP}" setup item.`);
  }
  return variantFor(setup, target);
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

/** Every file a release installs for `target`, by path. */
export function releaseFiles(catalog: Catalog, target: Target) {
  return new Map(
    catalog.items
      .filter((item) => item.variants[target.framework])
      .flatMap((item) =>
        variantFor(item, target).files.map(
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
