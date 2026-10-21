import catalogJson from '@nxds/react/catalog.json';
import type { Catalog, Variant } from '@nxds/react/catalog-schema';

import type { Framework } from './frameworks';

import 'server-only';

const SETUP = 'setup';

const catalog = catalogJson as unknown as Catalog;
if (catalog.schema !== 1) {
  throw new Error(
    `catalog: @nxds/react/catalog.json has schema ${String(catalog.schema)}, but the docs read schema 1. Rerun \`pnpm --filter @nxds/react generate:catalog\`.`
  );
}

const items = new Map(catalog.items.map((item) => [item.name, item]));

export type InstallPlan = {
  /** Other components to install first; setup is assumed. */
  components: string[];
  /** `name@range` npm packages. */
  packages: string[];
  files: { path: string; source: string }[];
  styles: string[];
};

/** Whether `npx nxds add` installs `framework`'s variants. */
export function cliInstalls(framework: Framework) {
  return catalog.frameworks.includes(framework);
}

function variantOf(name: string, framework: Framework): Variant {
  const variant = items.get(name)?.variants[framework];
  if (variant) return variant;
  const withVariant = catalog.items
    .filter((item) => item.variants[framework])
    .map((item) => item.name);
  throw new Error(
    `catalog: no ${framework} variant for "${name}". Items with one: ${withVariant.join(', ')}.`
  );
}

/**
 * What installing a component or block takes beyond setup: the components to
 * install first, then only the packages, files and styles those don't bring.
 */
export function loadInstallPlan(
  name: string,
  framework: Framework = 'react'
): InstallPlan {
  const variant = variantOf(name, framework);
  return {
    components: variant.items.filter((item) => item !== SETUP),
    packages: Object.entries(variant.packages.npm).map(
      ([pkg, range]) => `${pkg}@${range}`
    ),
    files: variant.files.map((file) => ({
      path: file.path,
      source: file.content,
    })),
    styles: variant.css,
  };
}
