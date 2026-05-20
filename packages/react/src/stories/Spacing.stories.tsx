import type { Meta, StoryObj } from '@storybook/react';

import { themeOnlyModes } from '@/storybook/modes';

import sizeLyra from '../../../core/tokens/primitives/size/size-lyra.json';
import sizeMaia from '../../../core/tokens/primitives/size/size-maia.json';
import sizeMira from '../../../core/tokens/primitives/size/size-mira.json';
import sizeNova from '../../../core/tokens/primitives/size/size-nova.json';
import sizeVega from '../../../core/tokens/primitives/size/size-vega.json';
import spacingTokens from '../../../core/tokens/semantic/spacing.json';

const BUNDLED_SIZE_MODE = 'vega';

type Dimension = { value: number; unit: string };
type DimensionLiteralToken = { $value: Dimension; $type: string };
type DimensionReferenceToken = { $value: string; $type: string };
type PrimitiveSizeMap = Record<string, DimensionLiteralToken>;
type SemanticSpacingMap = Record<string, DimensionReferenceToken>;

const SIZE_MODES: { name: string; tokens: PrimitiveSizeMap }[] = [
  { name: 'vega', tokens: sizeVega as PrimitiveSizeMap },
  { name: 'lyra', tokens: sizeLyra as PrimitiveSizeMap },
  { name: 'maia', tokens: sizeMaia as PrimitiveSizeMap },
  { name: 'mira', tokens: sizeMira as PrimitiveSizeMap },
  { name: 'nova', tokens: sizeNova as PrimitiveSizeMap },
];

const SPACING = spacingTokens as SemanticSpacingMap;

function resolveReference(
  ref: string,
  primitives: PrimitiveSizeMap
): Dimension {
  const key = ref.slice(1, -1);
  const prim = primitives[key];
  if (!prim) throw new Error(`Unknown reference: ${ref}`);
  return prim.$value;
}

function formatDimension(d: Dimension) {
  return `${d.value}${d.unit}`;
}

function sortByValue(rows: [string, Dimension][]) {
  return [...rows].sort((a, b) => a[1].value - b[1].value);
}

function Row({ name, dim }: { name: string; dim: Dimension }) {
  return (
    <div className="nx:flex nx:items-center nx:gap-4">
      <span className="nx:w-32 nx:shrink-0 nx:text-foreground nx:typography-label-default nx:font-mono">
        {name}
      </span>
      <span className="nx:w-16 nx:shrink-0 nx:text-muted-foreground nx:typography-label-small nx:font-mono">
        {formatDimension(dim)}
      </span>
      <div
        className="nx:rounded-sm nx:bg-primary-background nx:shrink-0"
        style={{ width: `${dim.value}${dim.unit}`, height: 12 }}
      />
    </div>
  );
}

function ModeSection({
  mode,
  rows,
}: {
  mode: string;
  rows: [string, Dimension][];
}) {
  const isBundled = mode === BUNDLED_SIZE_MODE;
  return (
    <section className="nx:flex nx:flex-col nx:gap-3">
      <h3 className="nx:flex nx:items-center nx:gap-2 nx:text-foreground nx:typography-heading-xsmall">
        <span>{mode}</span>
        {isBundled && (
          <span className="nx:rounded-sm nx:bg-primary-subtle nx:text-primary-subtle-foreground nx:typography-label-small nx:px-1.5 nx:py-0.5">
            Bundled
          </span>
        )}
      </h3>
      <div className="nx:flex nx:flex-col nx:gap-1">
        {rows.map(([name, dim]) => (
          <Row key={name} name={name} dim={dim} />
        ))}
      </div>
    </section>
  );
}

const meta: Meta = {
  title: 'Tokens/Spacing',
  parameters: {
    layout: 'fullscreen',
    a11y: { test: 'off' },
    chromatic: { modes: themeOnlyModes },
    docs: {
      description: {
        component:
          'Spacing tokens used across the design system. Semantic `--spacing-*` aliases reference numeric `--nx-size-*` primitives. Each size mode (vega, lyra, maia, mira, nova) produces a different scale; the bundled mode is the one @nexus/tailwind currently ships with — see packages/core/package.json#scripts.build:tailwind.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Aliases: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-10 nx:p-10 nx:bg-background nx:min-w-fit">
      <div className="nx:flex nx:flex-col nx:gap-2">
        <h2 className="nx:text-foreground nx:typography-heading-medium">
          Spacing Aliases
        </h2>
        <p className="nx:text-muted-foreground nx:typography-body-small nx:max-w-2xl">
          Semantic `--spacing-*` aliases consumed through Tailwind utilities
          like `nx:p-4` or `nx:gap-2`. Each row shows the alias name, the
          resolved pixel value, and a bar drawn at that exact width. Compare
          modes vertically to see how the scale shifts.
        </p>
      </div>
      {SIZE_MODES.map(({ name, tokens }) => {
        const rows = Object.entries(SPACING).map(
          ([alias, token]) =>
            [alias, resolveReference(token.$value, tokens)] as [
              string,
              Dimension,
            ]
        );
        return <ModeSection key={name} mode={name} rows={sortByValue(rows)} />;
      })}
    </div>
  ),
};

export const Primitives: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-10 nx:p-10 nx:bg-background nx:min-w-fit">
      <div className="nx:flex nx:flex-col nx:gap-2">
        <h2 className="nx:text-foreground nx:typography-heading-medium">
          Size Primitives
        </h2>
        <p className="nx:text-muted-foreground nx:typography-body-small nx:max-w-2xl">
          Raw `--nx-size-*` dimension primitives indexed by numeric keys. The
          spacing aliases above reference these directly — the resolved values
          here are exactly what the design system emits to CSS.
        </p>
      </div>
      {SIZE_MODES.map(({ name, tokens }) => {
        const rows = Object.entries(tokens).map(
          ([key, token]) => [`size-${key}`, token.$value] as [string, Dimension]
        );
        return <ModeSection key={name} mode={name} rows={sortByValue(rows)} />;
      })}
    </div>
  ),
};
