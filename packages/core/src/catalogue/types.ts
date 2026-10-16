import type {
  NexusAppearancePrefs,
  NexusAppearanceState,
} from '../lib/appearance-model';
import type { Mode } from '../lib/palette';
import type { TokenValue } from '../token-source/types';

export type { TokenValue } from '../token-source/types';

/** `T` with every nested property and array element read-only. */
type DeepReadonly<T> = T extends object
  ? { readonly [Key in keyof T]: DeepReadonly<T[Key]> }
  : T;

/** Token families the catalogue covers. */
export type CatalogueFamily =
  | 'borderwidth'
  | 'breakpoint'
  | 'color'
  | 'motion'
  | 'radius'
  | 'shadow'
  | 'spacing'
  | 'typography'
  | 'z-index';

/**
 * Canonical identity: an identifier in the `--nx-*` custom property scheme.
 * Most tokens declare it in the generated CSS. Typography and shadow styles
 * and breakpoints do not; they declare a theme property or a utility instead.
 */
export type CatalogueTokenName = `--nx-${string}`;

/** Another name that maps onto the canonical token. */
export interface CatalogueAlias {
  /**
   * `css-variable` — a Tailwind theme property that reads or declares the token.
   * `utility` — an `nx:` utility the generated CSS declares for the token.
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
  /**
   * The theme mode the value applies in (`light` / `dark` for a runtime
   * colour or a shadow layer), or `null` when it applies in both.
   */
  readonly mode: Mode | null;
  /**
   * The family mode file the value comes from without its theme mode
   * (`square`, `compact`, `quiet`), or `null` when the family has a single
   * file.
   */
  readonly preset: string | null;
  /** The authored leaf, or `null` for a colour the engine derives. */
  readonly source: CatalogueSource | null;
  /** The full appearance config a derived colour was computed from. */
  readonly appearance: DeepReadonly<NexusAppearanceState> | null;
  readonly authoredValue: TokenValue | null;
  /**
   * What the generated CSS declares: one custom property for a scalar or a
   * shadow style (`--nx-spacing-4`, or `--breakpoint-md` and `--shadow-sm` for
   * a token declared only under `@theme`), or the `@utility` body for a
   * typography style.
   */
  readonly declarations: readonly CatalogueDeclaration[];
  readonly references: readonly CatalogueReference[];
}

/**
 * The appearance setting that writes a token at runtime: a preset field that
 * picks one of its moded values, or a preference the provider computes it from.
 */
export type CatalogueControl =
  | {
      readonly kind: 'preset';
      readonly field: 'density' | 'corners' | 'elevation' | 'stroke';
    }
  | { readonly kind: 'pref'; readonly field: keyof NexusAppearancePrefs };

export interface CatalogueToken {
  readonly name: CatalogueTokenName;
  readonly family: CatalogueFamily;
  /**
   * The registry category for a derived colour, the first path key for a
   * nested leaf (`green`, `size`, `container`), or the family for a flat file.
   */
  readonly group: string;
  /** The DTCG `$type`. */
  readonly type: string;
  readonly description: string | null;
  readonly aliases: readonly CatalogueAlias[];
  /** The appearance setting that writes it, or `null` when nothing does. */
  readonly control: CatalogueControl | null;
  readonly variants: readonly CatalogueVariant[];
}
