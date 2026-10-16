import { createTokenCatalogue } from '@nexus_ds/core/catalogue';

export interface PrimitiveColor {
  /** Name without the `--nx-color-` prefix, e.g. `violet-600`. */
  name: string;
  palette: string;
  value: string;
}

/** Every primitive colour in `color.json`, with its emitted value. */
export function primitiveColors(): PrimitiveColor[] {
  return createTokenCatalogue()
    .filter(
      (token) =>
        token.family === 'color' &&
        token.variants.every((variant) =>
          variant.source?.file.startsWith('primitives/')
        )
    )
    .flatMap((token) =>
      token.variants.flatMap(({ declarations }) =>
        declarations.map(({ value }) => ({
          name: token.name.replace('--nx-color-', ''),
          palette: token.group,
          value,
        }))
      )
    );
}
