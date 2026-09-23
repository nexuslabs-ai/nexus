import type { NexusAppearanceState } from '../lib/appearance-model';
import type { TokenValue } from '../token-source/types';

export type { TokenValue } from '../token-source/types';

/** Token families the catalogue covers. */
export type CatalogueFamily = 'color' | 'typography';

/** Canonical identity: the token's `--nx-*` CSS custom property name. */
export type CatalogueTokenName = `--nx-${string}`;

/** Another name that maps onto the canonical token. */
export interface CatalogueAlias {
  /**
   * `css-variable` — a Tailwind theme property that reads the token.
   * `utility` — the `nx:` utility a composite emits.
   * `reference` — a DTCG reference path other token files use.
   */
  kind: 'css-variable' | 'utility' | 'reference';
  name: string;
}

/** The authored leaf a variant comes from. */
export interface CatalogueSource {
  /** Path under `packages/core/tokens/`, e.g. `styles/typography.json`. */
  file: string;
  /** Group keys from the document root to the leaf. */
  path: readonly string[];
}

/** One reference the authored value makes. */
export interface CatalogueReference {
  /** Where the reference sits in the value; `''` for the whole value. */
  field: string;
  /** The authored reference path, e.g. `size.3xl`. */
  reference: string;
  target: CatalogueTokenName;
}

export interface CatalogueDeclaration {
  property: string;
  value: string;
}

/** The token's value in one mode. */
export interface CatalogueVariant {
  /** The mode's name, or `null` when the token has a single mode. */
  mode: string | null;
  /** The authored leaf, or `null` for a colour the engine derives. */
  source: CatalogueSource | null;
  /** The full appearance config a derived colour was computed from. */
  appearance: NexusAppearanceState | null;
  authoredValue: TokenValue | null;
  /**
   * What the generated CSS declares: the custom property for a scalar, or the
   * `@utility` body for a composite.
   */
  declarations: readonly CatalogueDeclaration[];
  references: readonly CatalogueReference[];
}

export interface CatalogueToken {
  name: CatalogueTokenName;
  family: CatalogueFamily;
  /** The registry category for a derived colour; the top-level group otherwise. */
  group: string;
  /** The DTCG `$type`. */
  type: string;
  description: string | null;
  aliases: readonly CatalogueAlias[];
  variants: readonly CatalogueVariant[];
}
