/**
 * The shape of `generated/catalog.json`, which `generate-catalog.mjs` writes,
 * the docs install blocks read, and the `nxds` CLI bundles.
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
  /** A hash of `frameworks` and each item's name and variants for them: two catalogs with one revision install the same files. */
  revision: string;
  /** The frameworks the CLI installs. The docs copy also carries variants for others; the CLI's copy drops them. */
  frameworks: Framework[];
  items: CatalogItem[];
};
