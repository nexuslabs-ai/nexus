import type {
  Catalog,
  CatalogItem,
  Framework,
  SetupVariant,
  Variant,
} from '@nxds/react/catalog-schema';
import { readFileSync } from 'node:fs';

import { CliError } from './errors';

export type {
  Catalog,
  CatalogFile,
  CatalogItem,
  Framework,
  SetupStep,
  Variant,
} from '@nxds/react/catalog-schema';

export const SETUP = 'setup';

let loaded: Catalog | undefined;

/** The catalog bundled with this release, written next to the built CLI. */
export function loadCatalog(): Catalog {
  loaded ??= JSON.parse(
    readFileSync(new URL('./catalog.json', import.meta.url), 'utf8')
  ) as Catalog;
  return loaded;
}

export function findItem(catalog: Catalog, name: string): CatalogItem {
  const item = catalog.items.find((candidate) => candidate.name === name);
  if (item) return item;
  throw new CliError(
    `No item named "${name}". Run \`nxds search ${name}\` to find the right name.`
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
    throw new Error(`The bundled catalog has no "${SETUP}" setup item.`);
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

/** Installed item names this catalog still has, and the ones it dropped. */
export function splitInstalled(catalog: Catalog, installed: string[]) {
  const names = new Set(catalog.items.map((item) => item.name));
  return {
    known: installed.filter((name) => names.has(name)),
    removed: installed.filter((name) => !names.has(name)),
  };
}
