import type { NexusAppearanceState } from '../lib/appearance-model';
import type { Mode } from '../lib/palette';
import type { TokenValue } from '../token-source/types';

export type { TokenValue } from '../token-source/types';

/** `T` with every nested property and array element read-only. */
type DeepReadonly<T> = T extends object
  ? { readonly [Key in keyof T]: DeepReadonly<T[Key]> }
  : T;

/** Token families the catalogue covers. */
export type CatalogueFamily = 'color' | 'typography';

/**
 * Canonical identity: an identifier in the `--nx-*` custom property scheme.
 * Scalar tokens declare it in the generated CSS; a typography style does not.
 */
export type CatalogueTokenName = `--nx-${string}`;

/** Another name that maps onto the canonical token. */
export interface CatalogueAlias {
  /**
   * `css-variable` — a Tailwind theme property that reads the token.
   * `utility` — the `nx:` utility a composite emits.
   * `reference` — a DTCG reference path other token files use.
   */
  readonly kind: 'css-variable' | 'utility' | 'reference';
  readonly name: string;
}

/** The authored leaf a variant comes from. */
export interface CatalogueSource {
  /** Path under `packages/core/tokens/`, e.g. `styles/typography.json`. */
  readonly file: string;
  /** Group keys from the document root to the leaf. */
  readonly path: readonly string[];
}

/** One reference the authored value makes. */
export interface CatalogueReference {
  /** Where the reference sits in the value; `''` for the whole value. */
  readonly field: string;
  /** The authored reference path, e.g. `size.3xl`. */
  readonly reference: string;
  readonly target: CatalogueTokenName;
}

export interface CatalogueDeclaration {
  readonly property: string;
  readonly value: string;
}

/** The token's value in one theme mode and preset. */
export interface CatalogueVariant {
  /** The theme mode the value applies in, or `null` when it applies in both. */
  readonly mode: Mode | null;
  /**
   * The family mode file the value comes from, such as `default`, or `null`
   * when the family has a single file.
   */
  readonly preset: string | null;
  /** The authored leaf, or `null` for a colour the engine derives. */
  readonly source: CatalogueSource | null;
  /** The full appearance config a derived colour was computed from. */
  readonly appearance: DeepReadonly<NexusAppearanceState> | null;
  readonly authoredValue: TokenValue | null;
  /**
   * What the generated CSS declares: the custom property for a scalar, or the
   * `@utility` body for a composite.
   */
  readonly declarations: readonly CatalogueDeclaration[];
  readonly references: readonly CatalogueReference[];
}

export interface CatalogueToken {
  readonly name: CatalogueTokenName;
  readonly family: CatalogueFamily;
  /** The registry category for a derived colour; the top-level group otherwise. */
  readonly group: string;
  /** The DTCG `$type`. */
  readonly type: string;
  readonly description: string | null;
  readonly aliases: readonly CatalogueAlias[];
  readonly variants: readonly CatalogueVariant[];
}
