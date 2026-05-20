import type { Meta, StoryObj } from '@storybook/react';

import { themeOnlyModes } from '@/storybook/modes';

import shadowLyraDark from '../../../core/tokens/primitives/shadow/shadow-lyra-dark.json';
import shadowLyraLight from '../../../core/tokens/primitives/shadow/shadow-lyra-light.json';
import shadowMaiaDark from '../../../core/tokens/primitives/shadow/shadow-maia-dark.json';
import shadowMaiaLight from '../../../core/tokens/primitives/shadow/shadow-maia-light.json';
import shadowMiraDark from '../../../core/tokens/primitives/shadow/shadow-mira-dark.json';
import shadowMiraLight from '../../../core/tokens/primitives/shadow/shadow-mira-light.json';
import shadowNovaDark from '../../../core/tokens/primitives/shadow/shadow-nova-dark.json';
import shadowNovaLight from '../../../core/tokens/primitives/shadow/shadow-nova-light.json';
import shadowVegaDark from '../../../core/tokens/primitives/shadow/shadow-vega-dark.json';
import shadowVegaLight from '../../../core/tokens/primitives/shadow/shadow-vega-light.json';

const BUNDLED_SHADOW_MODE = 'vega';

type Dimension = { value: number; unit: string };
type DimensionToken = { $value: Dimension; $type: string };
type ColorToken = { $value: string; $type: string };
type ShadowLayer = {
  x: DimensionToken;
  y: DimensionToken;
  blur: DimensionToken;
  spread: DimensionToken;
  color: ColorToken;
};
type ShadowToken = Record<string, ShadowLayer>;
type ShadowSet = Record<string, ShadowToken>;

const SHADOW_KEYS = [
  '2xs',
  'xs',
  'sm',
  'base',
  'md',
  'lg',
  'xl',
  '2xl',
] as const;

const SHADOW_MODES_LIGHT: { name: string; tokens: ShadowSet }[] = [
  { name: 'vega', tokens: shadowVegaLight as ShadowSet },
  { name: 'lyra', tokens: shadowLyraLight as ShadowSet },
  { name: 'maia', tokens: shadowMaiaLight as ShadowSet },
  { name: 'mira', tokens: shadowMiraLight as ShadowSet },
  { name: 'nova', tokens: shadowNovaLight as ShadowSet },
];

const SHADOW_MODES_DARK: { name: string; tokens: ShadowSet }[] = [
  { name: 'vega', tokens: shadowVegaDark as ShadowSet },
  { name: 'lyra', tokens: shadowLyraDark as ShadowSet },
  { name: 'maia', tokens: shadowMaiaDark as ShadowSet },
  { name: 'mira', tokens: shadowMiraDark as ShadowSet },
  { name: 'nova', tokens: shadowNovaDark as ShadowSet },
];

function formatPx(d: Dimension) {
  return `${d.value}${d.unit}`;
}

function composeShadow(token: ShadowToken): string {
  return Object.values(token)
    .map((layer) =>
      [
        formatPx(layer.x.$value),
        formatPx(layer.y.$value),
        formatPx(layer.blur.$value),
        formatPx(layer.spread.$value),
        layer.color.$value,
      ].join(' ')
    )
    .join(', ');
}

function ShadowCard({ name, token }: { name: string; token: ShadowToken }) {
  return (
    <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
      <div
        className="nx:bg-container"
        style={{
          width: 96,
          height: 96,
          borderRadius: 8,
          boxShadow: composeShadow(token),
        }}
      />
      <span className="nx:text-foreground nx:typography-label-default nx:font-mono">
        {name}
      </span>
    </div>
  );
}

function ModeSection({
  mode,
  bundled,
  tokens,
}: {
  mode: string;
  bundled: boolean;
  tokens: ShadowSet;
}) {
  return (
    <section className="nx:flex nx:flex-col nx:gap-4">
      <h3 className="nx:flex nx:items-center nx:gap-2 nx:text-foreground nx:typography-heading-xsmall">
        <span>{mode}</span>
        {bundled && (
          <span className="nx:rounded-sm nx:bg-primary-subtle nx:text-primary-subtle-foreground nx:typography-label-small nx:px-1.5 nx:py-0.5">
            Bundled
          </span>
        )}
      </h3>
      <div className="nx:flex nx:flex-wrap nx:items-end nx:gap-8 nx:px-2 nx:py-6">
        {SHADOW_KEYS.map((sk) => (
          <ShadowCard key={sk} name={sk} token={tokens[sk]} />
        ))}
      </div>
    </section>
  );
}

const meta: Meta = {
  title: 'Tokens/Shadow',
  parameters: {
    layout: 'fullscreen',
    a11y: { test: 'off' },
    docs: {
      description: {
        component:
          'Shadow primitives — composite tokens whose per-layer x/y/blur/spread/color values compose into a CSS `box-shadow` string. Each mode has light and dark variants because shadow colors and opacities differ by background tone. Shown: 8 elevation shadows (2xs → 2xl). Inner and focus tokens exist in JSON but use different visual treatments and are not part of this elevation showcase.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Light: Story = {
  globals: { theme: 'light' },
  parameters: {
    chromatic: { modes: { 'light desktop': themeOnlyModes.light } },
  },
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-10 nx:p-10 nx:bg-background nx:min-w-fit">
      <div className="nx:flex nx:flex-col nx:gap-2">
        <h2 className="nx:text-foreground nx:typography-heading-medium">
          Shadows — Light
        </h2>
        <p className="nx:text-muted-foreground nx:typography-body-small nx:max-w-2xl">
          Elevation shadows applied to cards on a light background. Each
          mode&apos;s light JSON defines per-layer values that compose into the
          CSS `box-shadow` string.
        </p>
      </div>
      {SHADOW_MODES_LIGHT.map(({ name, tokens }) => (
        <ModeSection
          key={name}
          mode={name}
          bundled={name === BUNDLED_SHADOW_MODE}
          tokens={tokens}
        />
      ))}
    </div>
  ),
};

export const Dark: Story = {
  globals: { theme: 'dark' },
  parameters: {
    chromatic: { modes: { 'dark desktop': themeOnlyModes.dark } },
  },
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-10 nx:p-10 nx:bg-background nx:min-w-fit">
      <div className="nx:flex nx:flex-col nx:gap-2">
        <h2 className="nx:text-foreground nx:typography-heading-medium">
          Shadows — Dark
        </h2>
        <p className="nx:text-muted-foreground nx:typography-body-small nx:max-w-2xl">
          Same elevation tokens, but each mode&apos;s dark JSON tunes colors and
          opacities for dark UI. Use these when the surrounding page or panel
          uses a dark background.
        </p>
      </div>
      {SHADOW_MODES_DARK.map(({ name, tokens }) => (
        <ModeSection
          key={name}
          mode={name}
          bundled={name === BUNDLED_SHADOW_MODE}
          tokens={tokens}
        />
      ))}
    </div>
  ),
};
