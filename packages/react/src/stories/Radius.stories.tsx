import type { Meta, StoryObj } from '@storybook/react';

import borderwidthBold from '../../../core/tokens/primitives/borderwidth/borderwidth-bold.json';
import borderwidthFine from '../../../core/tokens/primitives/borderwidth/borderwidth-fine.json';
import borderwidthMedium from '../../../core/tokens/primitives/borderwidth/borderwidth-medium.json';
import borderwidthNormal from '../../../core/tokens/primitives/borderwidth/borderwidth-normal.json';
import borderwidthStrong from '../../../core/tokens/primitives/borderwidth/borderwidth-strong.json';
import radiusExtraRound from '../../../core/tokens/primitives/radius/radius-extra-round.json';
import radiusRound from '../../../core/tokens/primitives/radius/radius-round.json';
import radiusSmooth from '../../../core/tokens/primitives/radius/radius-smooth.json';
import radiusSquare from '../../../core/tokens/primitives/radius/radius-square.json';
import radiusSubtle from '../../../core/tokens/primitives/radius/radius-subtle.json';

const BUNDLED_RADIUS_MODE = 'square';
const BUNDLED_BORDERWIDTH_MODE = 'normal';

type Dimension = { value: number; unit: string };
type DimensionToken = { $value: Dimension; $type: string };

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

type RadiusKey = (typeof RADIUS_KEYS)[number];
type BorderWidthKey = (typeof BORDERWIDTH_KEYS)[number];
type RadiusMap = Record<RadiusKey, DimensionToken>;
type BorderWidthMap = Record<BorderWidthKey, DimensionToken>;

const RADIUS_MODES: { name: string; tokens: RadiusMap }[] = [
  { name: 'extra-round', tokens: radiusExtraRound as RadiusMap },
  { name: 'round', tokens: radiusRound as RadiusMap },
  { name: 'smooth', tokens: radiusSmooth as RadiusMap },
  { name: 'square', tokens: radiusSquare as RadiusMap },
  { name: 'subtle', tokens: radiusSubtle as RadiusMap },
];

const BORDERWIDTH_MODES: { name: string; tokens: BorderWidthMap }[] = [
  { name: 'normal', tokens: borderwidthNormal as BorderWidthMap },
  { name: 'medium', tokens: borderwidthMedium as BorderWidthMap },
  { name: 'fine', tokens: borderwidthFine as BorderWidthMap },
  { name: 'bold', tokens: borderwidthBold as BorderWidthMap },
  { name: 'strong', tokens: borderwidthStrong as BorderWidthMap },
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
        <p className="nx:text-muted-foreground nx:typography-body-default nx:max-w-2xl">
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
        <p className="nx:text-muted-foreground nx:typography-body-default nx:max-w-2xl">
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
