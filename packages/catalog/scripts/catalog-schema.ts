/**
 * The shape of `generated/catalog.json`, which `generate-catalog.mjs` writes
 * and the docs install blocks read, and of each release catalog the `nxds`
 * CLI fetches from the registry.
 */

export type Framework = 'react' | 'vue';

export type CatalogFile = { path: string; content: string };

/** A change to the app's own files that the CLI's framework adapter makes. */
export type SetupStep =
  | 'add-css-import'
  | 'add-head-script'
  | 'wrap-root-with-provider';

export type Variant = {
  /** Other items this one needs, installed first. */
  items: string[];
  packages: { npm: Record<string, string> };
  /** Paths are relative to the project's nxds folder. */
  files: CatalogFile[];
  /** Files in `files` the nxds CSS entry imports. */
  css: string[];
  steps: SetupStep[];
};

export type SetupVariant = Variant & {
  packages: {
    /** The Tailwind range `init` installs, with the app's build plugin, when the app has no Tailwind. */
    tailwind: string;
  };
};

type ItemInfo = {
  name: string;
  title: string;
  description: string;
  docs: string;
};

export type SetupItem = ItemInfo & {
  kind: 'setup';
  variants: Partial<Record<Framework, SetupVariant>>;
};

export type CatalogItem =
  | SetupItem
  | (ItemInfo & {
      kind: 'component' | 'block';
      variants: Partial<Record<Framework, Variant>>;
    });

export type Catalog = {
  schema: 1;
  /** The `@nxds/react` version this catalog was built from. */
  version: string;
  /** The frameworks the CLI installs. The docs copy also carries variants for others; a release catalog drops them. */
  frameworks: Framework[];
  items: CatalogItem[];
};

function installedVariants<V extends Variant>(
  variants: Partial<Record<Framework, V>>,
  frameworks: Framework[]
): Partial<Record<Framework, V>> {
  return Object.fromEntries(
    frameworks
      .filter((framework) => variants[framework])
      .map((framework) => [framework, variants[framework]])
  );
}

// Two returns, so each keeps its own variant type.
function releaseItem(item: CatalogItem, frameworks: Framework[]): CatalogItem {
  if (item.kind === 'setup') {
    return { ...item, variants: installedVariants(item.variants, frameworks) };
  }
  return { ...item, variants: installedVariants(item.variants, frameworks) };
}

/** `catalog` with only the variants the CLI installs: what a release publishes. */
export function releaseCatalog(catalog: Catalog): Catalog {
  return {
    ...catalog,
    items: catalog.items.map((item) => releaseItem(item, catalog.frameworks)),
  };
}
