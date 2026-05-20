import type { Meta, StoryObj } from '@storybook/react';

import { themeOnlyModes } from '@/storybook/modes';

import borderwidthLyra from '../../../core/tokens/primitives/borderwidth/borderwidth-lyra.json';
import borderwidthMaia from '../../../core/tokens/primitives/borderwidth/borderwidth-maia.json';
import borderwidthMira from '../../../core/tokens/primitives/borderwidth/borderwidth-mira.json';
import borderwidthNova from '../../../core/tokens/primitives/borderwidth/borderwidth-nova.json';
import borderwidthVega from '../../../core/tokens/primitives/borderwidth/borderwidth-vega.json';
import radiusBlunt from '../../../core/tokens/primitives/radius/radius-blunt.json';
import radiusMellow from '../../../core/tokens/primitives/radius/radius-mellow.json';
import radiusSharp from '../../../core/tokens/primitives/radius/radius-sharp.json';
import radiusSmooth from '../../../core/tokens/primitives/radius/radius-smooth.json';
import radiusSubtle from '../../../core/tokens/primitives/radius/radius-subtle.json';

const BUNDLED_RADIUS_MODE = 'sharp';
const BUNDLED_BORDERWIDTH_MODE = 'vega';

type Dimension = { value: number; unit: string };
type DimensionToken = { $value: Dimension; $type: string };
type DimensionMap = Record<string, DimensionToken>;

const RADIUS_KEYS = [
  'base',
  'sm',
  'md',
  'lg',
  'xl',
  '2xl',
  '3xl',
  'full',
] as const;
const BORDERWIDTH_KEYS = ['default', 'thick'] as const;

const RADIUS_MODES: { name: string; tokens: DimensionMap }[] = [
  { name: 'blunt', tokens: radiusBlunt as DimensionMap },
  { name: 'mellow', tokens: radiusMellow as DimensionMap },
  { name: 'sharp', tokens: radiusSharp as DimensionMap },
  { name: 'smooth', tokens: radiusSmooth as DimensionMap },
  { name: 'subtle', tokens: radiusSubtle as DimensionMap },
];

const BORDERWIDTH_MODES: { name: string; tokens: DimensionMap }[] = [
  { name: 'vega', tokens: borderwidthVega as DimensionMap },
  { name: 'lyra', tokens: borderwidthLyra as DimensionMap },
  { name: 'maia', tokens: borderwidthMaia as DimensionMap },
  { name: 'mira', tokens: borderwidthMira as DimensionMap },
  { name: 'nova', tokens: borderwidthNova as DimensionMap },
];

function formatDimension(d: Dimension) {
  return `${d.value}${d.unit}`;
}

function RadiusSwatch({ name, dim }: { name: string; dim: Dimension }) {
  return (
    <div className="nx:flex nx:flex-col nx:items-center nx:gap-1">
      <div
        className="nx:bg-primary-background"
        style={{
          width: 64,
          height: 64,
          borderRadius: `${dim.value}${dim.unit}`,
        }}
      />
      <span className="nx:text-foreground nx:typography-label-default nx:font-mono">
        {name}
      </span>
      <span className="nx:text-muted-foreground nx:typography-label-small nx:font-mono">
        {formatDimension(dim)}
      </span>
    </div>
  );
}

function BorderWidthSwatch({ name, dim }: { name: string; dim: Dimension }) {
  return (
    <div className="nx:flex nx:flex-col nx:items-center nx:gap-1">
      <div
        style={{
          width: 64,
          height: 64,
          borderStyle: 'solid',
          borderWidth: `${dim.value}${dim.unit}`,
          borderColor: 'var(--color-foreground)',
        }}
      />
      <span className="nx:text-foreground nx:typography-label-default nx:font-mono">
        {name}
      </span>
      <span className="nx:text-muted-foreground nx:typography-label-small nx:font-mono">
        {formatDimension(dim)}
      </span>
    </div>
  );
}

function ModeSection({
  mode,
  bundled,
  children,
}: {
  mode: string;
  bundled: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="nx:flex nx:flex-col nx:gap-3">
      <h3 className="nx:flex nx:items-center nx:gap-2 nx:text-foreground nx:typography-heading-xsmall">
        <span>{mode}</span>
        {bundled && (
          <span className="nx:rounded-sm nx:bg-primary-subtle nx:text-primary-subtle-foreground nx:typography-label-small nx:px-1.5 nx:py-0.5">
            Bundled
          </span>
        )}
      </h3>
      <div className="nx:flex nx:flex-wrap nx:items-start nx:gap-4">
        {children}
      </div>
    </section>
  );
}

const meta: Meta = {
  title: 'Tokens/Radius',
  parameters: {
    layout: 'fullscreen',
    a11y: { test: 'off' },
    chromatic: { modes: themeOnlyModes },
    docs: {
      description: {
        component:
          'Border radius and border width primitive scales. Each mode (radius: blunt/mellow/sharp/smooth/subtle; borderwidth: vega/lyra/maia/mira/nova) produces a different scale; the bundled mode is the one @nexus/tailwind currently ships with — see packages/core/package.json#scripts.build:tailwind.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Radii: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-10 nx:p-10 nx:bg-background nx:min-w-fit">
      <div className="nx:flex nx:flex-col nx:gap-2">
        <h2 className="nx:text-foreground nx:typography-heading-medium">
          Border Radii
        </h2>
        <p className="nx:text-muted-foreground nx:typography-body-small nx:max-w-2xl">
          Raw `--nx-radius-*` primitive scale. `full` resolves to 9999px so the
          corner becomes a perfect arc on any container.
        </p>
      </div>
      {RADIUS_MODES.map(({ name, tokens }) => (
        <ModeSection
          key={name}
          mode={name}
          bundled={name === BUNDLED_RADIUS_MODE}
        >
          {RADIUS_KEYS.map((key) => (
            <RadiusSwatch key={key} name={key} dim={tokens[key].$value} />
          ))}
        </ModeSection>
      ))}
    </div>
  ),
};

export const BorderWidths: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-10 nx:p-10 nx:bg-background nx:min-w-fit">
      <div className="nx:flex nx:flex-col nx:gap-2">
        <h2 className="nx:text-foreground nx:typography-heading-medium">
          Border Widths
        </h2>
        <p className="nx:text-muted-foreground nx:typography-body-small nx:max-w-2xl">
          Raw `--nx-borderwidth-*` primitives. The Tailwind utilities
          `nx:border-default` and `nx:border-thick` consume these.
        </p>
      </div>
      {BORDERWIDTH_MODES.map(({ name, tokens }) => (
        <ModeSection
          key={name}
          mode={name}
          bundled={name === BUNDLED_BORDERWIDTH_MODE}
        >
          {BORDERWIDTH_KEYS.map((key) => (
            <BorderWidthSwatch key={key} name={key} dim={tokens[key].$value} />
          ))}
        </ModeSection>
      ))}
    </div>
  ),
};
