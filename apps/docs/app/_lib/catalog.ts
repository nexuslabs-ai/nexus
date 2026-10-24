import {
  CATALOG_SCHEMA,
  catalogSchema,
  issueLines,
  type ReactMajor,
  type Variant,
  variantForReact,
} from '@nxds/catalog';
import catalogJson from '@nxds/catalog/catalog.json';

import type { Framework } from './frameworks';

import 'server-only';

const SETUP = 'setup';

const parsed = catalogSchema.safeParse(catalogJson);
if (!parsed.success) {
  throw new Error(
    `catalog: @nxds/catalog/catalog.json is not a schema ${CATALOG_SCHEMA} catalog:\n${issueLines(parsed.error).join('\n')}\nRerun \`pnpm --filter @nxds/catalog generate:catalog\`.`
  );
}
const catalog = parsed.data;

const items = new Map(catalog.items.map((item) => [item.name, item]));

export type InstallPlan = {
  /** Other components to install first; setup is assumed. */
  components: string[];
  /** `name@range` npm packages. */
  packages: string[];
  files: { path: string; source: string }[];
  styles: string[];
};

/** Whether `npx nxds-cli add` installs `framework`'s variants. */
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
  framework: Framework = 'react',
  react: ReactMajor = 19
): InstallPlan {
  const variant = variantForReact(variantOf(name, framework), react);
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

/** Whether an app on React 18 installs other files or packages for `name`. */
export function hasReact18Plan(name: string) {
  return Boolean(items.get(name)?.variants.react?.react18);
}
