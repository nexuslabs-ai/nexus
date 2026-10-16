import {
  type CatalogueFamily,
  type CatalogueToken,
  createTokenCatalogue,
} from '@nexus_ds/core/catalogue';

export interface PrimitiveColor {
  /** Name without the `--nx-color-` prefix, e.g. `violet-600`. */
  name: string;
  palette: string;
  value: string;
}

export type ScaleFamily = Exclude<CatalogueFamily, 'color'>;

export interface ScaleToken {
  name: string;
  family: ScaleFamily;
  group: string;
  type: string;
  /**
   * The catalogue value for a token the page can't override: a typography or
   * shadow style composed from other tokens, or a breakpoint compiled into
   * media queries. `null` for a runtime variable, which the lab reads live.
   */
  fixedValue: string | null;
}

export interface LabData {
  primitives: PrimitiveColor[];
  scales: ScaleToken[];
}

const isPrimitive = (token: CatalogueToken) =>
  token.variants.every((variant) =>
    variant.source?.file.startsWith('primitives/')
  );

function fixedValue(token: CatalogueToken): string | null {
  const isComposite = token.type === 'typography' || token.type === 'shadow';
  if (!isComposite && token.family !== 'breakpoint') return null;
  return token.variants
    .flatMap(({ declarations }) =>
      declarations.map(({ property, value }) =>
        isComposite ? `${property}: ${value}` : value
      )
    )
    .join('; ');
}

/** The catalogue split into primitive colours and every non-colour token. */
export function labData(): LabData {
  const catalogue = createTokenCatalogue();
  return {
    primitives: catalogue
      .filter((token) => token.family === 'color' && isPrimitive(token))
      .flatMap((token) =>
        token.variants.flatMap(({ declarations }) =>
          declarations.map(({ value }) => ({
            name: token.name.replace('--nx-color-', ''),
            palette: token.group,
            value,
          }))
        )
      ),
    scales: catalogue.flatMap((token) =>
      token.family === 'color'
        ? []
        : [
            {
              name: token.name,
              family: token.family,
              group: token.group,
              type: token.type,
              fixedValue: fixedValue(token),
            },
          ]
    ),
  };
}
